/**
 * UserManagement.js
 * Architectural port of Engineer.js with Administrative Multi-Delete Logic
 * Now fully integrated with the Notification System
 */

import { db, auth } from '../../js/firebase-config.js';
import { 
    collection, 
    onSnapshot, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    updateDoc, 
    writeBatch, 
    addDoc, 
    serverTimestamp, 
    doc,
    setDoc,
    deleteDoc,
    or
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { requireRole } from '../../js/auth-guard.js';
import { initNotifications, logNotification } from '../pages/notifications.js';

// ── Auth Guard ─────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;

async function checkAuth() {
    try {
        const { user, profile } = await requireRole('Admin');
        currentUser = user;
        currentProfile = profile;
        console.log('Admin authenticated:', currentUser.email);
        
        initUserManagement();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

// ── Global State ────────────────────────────────────────────────────────────
window._userState = {
    allUsers: [],
    allLGUs: [], // Store LGUs for ID lookup
    filteredUsers: [],
    selectedUsers: new Set(),
    deleteMode: false,
    currentPage: 1,
    rowsPerPage: 8,
    selectedUserDetails: null,
    engineerDataMap: {},
    activeSubscribers: []
};

// ── Initialization ──────────────────────────────────────────────────────────
function initUserManagement() {
    setupListeners();
    bindEvents();
    setupDetailsTabs();
    
    try {
        initNotifications(db);
    } catch (err) {
        console.warn('Notification init failed:', err);
    }
}

function setupListeners() {
    // 1. Listen to LGUs
    onSnapshot(collection(db, "LGUs"), (snapshot) => {
        const muniDropdowns = [
            document.getElementById('formMunicipalityCreate'),
            document.getElementById('filterMunicipality')
        ];
        
        const lgus = [];
        snapshot.forEach(docSnap => lgus.push({ id: docSnap.id, ...docSnap.data() }));
        window._userState.allLGUs = lgus;
        lgus.sort((a, b) => (a.municipalityName || "").localeCompare(b.municipalityName || ""));

        muniDropdowns.forEach(dropdown => {
            if (!dropdown) return;
            const currentVal = dropdown.value;
            const isFilter = dropdown.id === 'filterMunicipality';
            
            dropdown.innerHTML = isFilter 
                ? '<option value="All">All Municipalities</option>'
                : '<option value="">Select Municipality</option>';
            
            lgus.forEach(lgu => {
                const opt = document.createElement('option');
                opt.value = lgu.id; // Use Document ID
                opt.textContent = lgu.municipalityName;
                dropdown.appendChild(opt);
            });
            
            if (currentVal) dropdown.value = currentVal;
        });
        // Trigger re-render to map IDs to names in existing records
        applyFilters();
    });

    // 2. Listen to UserAccounts
    onSnapshot(collection(db, "UserAccounts"), (snapshot) => {
        window._userState.allUsers = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        applyFilters();
    });

    // 3. Listen to Engineers
    onSnapshot(collection(db, "Engineers"), (snapshot) => {
        const engMap = {};
        snapshot.forEach(docSnap => engMap[docSnap.id] = docSnap.data());
        window._userState.engineerDataMap = engMap;
        applyFilters();
    });
}

function bindEvents() {
    const searchInput = document.getElementById('tableSearch');
    const rankFilter = document.getElementById('filterRank');
    const muniFilter = document.getElementById('filterMunicipality');
    const refreshBtn = document.getElementById('refreshBtn');
    const deleteBtn = document.getElementById('deleteAccountBtn');
    const closeDetailsBtn = document.getElementById('closeEngineerDetailsBtn');
    
    searchInput?.addEventListener('input', () => { window._userState.currentPage = 1; applyFilters(); });
    rankFilter?.addEventListener('change', () => { window._userState.currentPage = 1; applyFilters(); });
    muniFilter?.addEventListener('change', () => { window._userState.currentPage = 1; applyFilters(); });

    refreshBtn?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (rankFilter) rankFilter.value = 'All';
        if (muniFilter) muniFilter.value = 'All';
        window._userState.currentPage = 1;
        applyFilters();
    });

    deleteBtn?.addEventListener('click', toggleDeleteMode);
    closeDetailsBtn?.addEventListener('click', () => closeDetailsModal());

    document.getElementById('createAccountForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        submitCreateAccount();
    });

    document.getElementById('createAccountBtn')?.addEventListener('click', openCreateAccountModal);

    document.getElementById('engineerDetailsModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'engineerDetailsModal') closeDetailsModal();
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('tableSearch')?.value?.toLowerCase() || '';
    const selectedRank = document.getElementById('filterRank')?.value || 'All';
    const selectedMuni = document.getElementById('filterMunicipality')?.value || 'All';

    window._userState.filteredUsers = window._userState.allUsers.filter(user => {
        const engData = window._userState.engineerDataMap?.[user.engineerId] || {};
        
        const username = user.username || '';
        const role     = user.role || '';
        const mF       = engData.firstName || "";
        const mL       = engData.lastName || "";
        const fullName = `${mF} ${mL}`.trim();
        const legacyName = engData.FullName || "";
        const lguId = engData.lguId || engData.LguID || '';
        const targetLgu = window._userState.allLGUs?.find(l => 
            l.id === lguId || 
            (l.municipalityName && lguId && l.municipalityName.toLowerCase() === lguId.toLowerCase())
        );
        const muniName = targetLgu ? targetLgu.municipalityName : lguId;

        const matchesSearch = (
            (username).toLowerCase().includes(searchTerm) ||
            (fullName || legacyName).toLowerCase().includes(searchTerm) ||
            (role).toLowerCase().includes(searchTerm)
        );
        const currentRank = engData.rank || engData.Rank || '---';
        const matchesRank = selectedRank === 'All' || currentRank === selectedRank;
        const matchesMuni = selectedMuni === 'All' || lguId === selectedMuni;

        return matchesSearch && matchesRank && matchesMuni;
    });

    renderTable();
}

function renderTable() {
    const recordsBody = document.getElementById('recordsBody');
    const { filteredUsers, currentPage, rowsPerPage, deleteMode, selectedUsers } = window._userState;

    if (!recordsBody) return;

    if (filteredUsers.length === 0) {
        recordsBody.innerHTML = '<div class="records-placeholder">No accounts found matching your criteria.</div>';
        updatePaginationInfo(0);
        return;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginated = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

    recordsBody.innerHTML = paginated.map(user => {
        const engData = window._userState.engineerDataMap?.[user.engineerId] || {};
        const isSelected = selectedUsers.has(user.id);
        
        const displayName = engData.firstName ? `${engData.firstName} ${engData.lastName}` : (engData.FullName || user.username || '---');
        const role = user.role || '---';
        const rank = engData.rank || engData.Rank || '---';
        const lguId = engData.lguId || engData.LguID || '---';
        const targetLgu = window._userState.allLGUs?.find(l => 
            l.id === lguId || 
            (l.municipalityName && lguId && l.municipalityName.toLowerCase() === lguId.toLowerCase())
        );
        const muniName = targetLgu ? targetLgu.municipalityName : lguId;

        return `
            <div class="record-row ${isSelected ? 'to-delete' : ''}">
                <div class="head-col engineer-name-cell">
                    <div class="engineer-avatar-mini">${getInitials(displayName)}</div>
                    <div style="font-weight: 700; color: #1e293b;">${displayName}</div>
                </div>
                <div class="head-col">${role}</div>
                <div class="head-col">
                    <span class="rank-badge rank-${(rank).toLowerCase().replace(/ /g, '-')}">${rank}</span>
                </div>
                <div class="head-col">${muniName}</div>
                <div class="col actions-col" style="text-align: right;">
                    ${deleteMode ? `
                        <button type="button" class="action-btn delete-select-btn ${isSelected ? 'selected' : ''}" onclick="window.toggleAccountSelection('${user.id}')">
                            ${isSelected
                                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
                            }
                        </button>
                    ` : `
                        <button type="button" class="action-btn view-btn" onclick="window.openUserDetails('${user.id}')">
                            <i data-lucide="eye" style="width:20px; height:20px;"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');

    updatePaginationInfo(filteredUsers.length);
    if (window.lucide) lucide.createIcons();
}

function updatePaginationInfo(total) {
    const note = document.getElementById('recordsNote');
    const controls = document.getElementById('paginationControls');
    const { currentPage, rowsPerPage } = window._userState;

    const start = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, total);
    
    if (note) note.innerText = `Showing ${start}-${end} of ${total} accounts`;
    if (!controls) return;
    
    const totalPages = Math.ceil(total / rowsPerPage);
    let html = '';
    
    if (totalPages > 1) {
        html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changeUserPage(${currentPage - 1})"><i data-lucide="chevron-left"></i></button>`;
        for(let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changeUserPage(${i})">${i}</button>`;
        }
        html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changeUserPage(${currentPage + 1})"><i data-lucide="chevron-right"></i></button>`;
    }
    
    controls.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

window.changeUserPage = (page) => {
    window._userState.currentPage = page;
    renderTable();
};

window.openUserDetails = async (id) => {
    const user = window._userState.allUsers.find(u => u.id === id);
    if (!user) return;

    const engData = window._userState.engineerDataMap?.[user.engineerId] || {};
    window._userState.selectedUserDetails = user;
    const modal = document.getElementById('engineerDetailsModal');
    
    const displayName = engData.firstName ? `${engData.firstName} ${engData.lastName}` : (engData.FullName || user.username || '---');
    document.getElementById('detailName').innerText = displayName;
    document.getElementById('detailRank').innerText = engData.rank || engData.Rank || '---';
    document.getElementById('detailPosition').innerText = user.role || '---';
    document.getElementById('detailEmail').innerText = engData.email || engData.Email || (user.username ? `${user.username}@engineer.ph` : '---');
    
    const createDate = user.createdAt;
    document.getElementById('detailJoined').innerText = createDate ? new Date(createDate.toDate()).toLocaleDateString() : '---';

    const tabs = document.querySelectorAll('.engineer-details-modal .tab-btn');
    tabs.forEach(t => {
        t.classList.remove('active');
        if (t.dataset.filter === 'all') t.classList.add('active');
    });

    renderUserProjectHistory(displayName, 'all', user.engineerId);

    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 10);
    
    if (window.lucide) lucide.createIcons();
};

window.toggleAccountSelection = (id) => {
    if (window._userState.selectedUsers.has(id)) {
        window._userState.selectedUsers.delete(id);
    } else {
        window._userState.selectedUsers.add(id);
    }
    const btn = document.getElementById('deleteAccountBtn');
    const span = btn?.querySelector('span');
    if (span) span.innerText = `Confirm Delete (${window._userState.selectedUsers.size})`;
    renderTable();
};

function toggleDeleteMode() {
    const btn = document.getElementById('deleteAccountBtn');
    const span = btn.querySelector('span');

    if (!window._userState.deleteMode) {
        window._userState.deleteMode = true;
        window._userState.selectedUsers.clear();
        btn.classList.add('active');
        if (span) span.innerText = "Confirm Delete (0)";
        renderTable();
    } else {
        if (window._userState.selectedUsers.size > 0) {
            showDeleteConfirmModal();
        } else {
            window._userState.deleteMode = false;
            window._userState.selectedUsers.clear();
            btn.classList.remove('active');
            if (span) span.innerText = "Delete Account";
            renderTable();
        }
    }
}

function showTopToast(message, type = 'create') {
    let toast = document.getElementById('topActionToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'topActionToast';
        toast.style.cssText = `
            position: fixed; top: 24px; left: 50%; transform: translateX(-50%) translateY(-20px);
            z-index: 99999; color: #fff; padding: 14px 24px; border-radius: 14px;
            display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.9rem;
            opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none; white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }

    const isDelete = type === 'delete';
    toast.style.background = isDelete ? '#ef4444' : '#22c55e';
    toast.style.boxShadow = isDelete ? '0 8px 24px rgba(239,68,68,0.35)' : '0 8px 24px rgba(34,197,94,0.35)';
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>${message}`;
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 3500);
}

function hideDeleteModal() {
    const modal = document.getElementById('customDeleteModal');
    if (modal) {
        const box = modal.querySelector('#customDeleteModalBox');
        modal.style.opacity = '0';
        if (box) box.style.transform = 'scale(0.92)';
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    }
}

function showDeleteConfirmModal() {
    let modal = document.getElementById('customDeleteModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customDeleteModal';
        modal.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
            opacity: 0; transition: opacity 0.2s ease;
        `;
        modal.innerHTML = `
            <div id="customDeleteModalBox" style="
                background: #fff; border-radius: 24px; padding: 40px 36px 32px;
                max-width: 360px; width: 90%; text-align: center;
                box-shadow: 0 25px 60px rgba(0,0,0,0.18);
                transform: scale(0.92); transition: transform 0.2s ease;
            ">
                <div style="
                    width: 72px; height: 72px; border-radius: 20px;
                    background: #fff1f2; display: flex; align-items: center;
                    justify-content: center; margin: 0 auto 20px;
                ">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #ef4444; margin: 0 0 10px;">Delete Account?</h3>
                <p style="font-size: 0.875rem; color: #64748b; line-height: 1.6; margin: 0 0 28px;">
                    Are you sure you want to remove the selected accounts? This action cannot be undone.
                </p>
                <div style="display: flex; gap: 12px;">
                    <button id="customDeleteCancelBtn" style="
                        flex: 1; padding: 14px; border: 2px solid #e2e8f0; border-radius: 14px;
                        background: #fff; color: #475569; font-weight: 700; font-size: 0.8rem;
                        letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
                    ">No, Cancel</button>
                    <button id="customDeleteConfirmBtn" style="
                        flex: 1; padding: 14px; border: none; border-radius: 14px;
                        background: #ef4444; color: #fff; font-weight: 700; font-size: 0.8rem;
                        letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
                    ">Yes, Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('customDeleteCancelBtn').onclick = hideDeleteModal;
        document.getElementById('customDeleteConfirmBtn').onclick = () => {
            hideDeleteModal();
            executeDeleteAction();
        };
        modal.onclick = (e) => { if (e.target === modal) hideDeleteModal(); };
    }

    const box = modal.querySelector('#customDeleteModalBox');
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        box.style.transform = 'scale(1)';
    });
}

async function executeDeleteAction() {
    const selectedIds = Array.from(window._userState.selectedUsers);
    if (selectedIds.length === 0) return;
    showLoading(true);
    try {
        const batch = writeBatch(db);
        for (const id of selectedIds) {
            const user = window._userState.allUsers.find(u => u.id === id);
            batch.delete(doc(db, "UserAccounts", id));
            if (user && user.engineerId) {
                batch.delete(doc(db, "Engineers", user.engineerId));
            }
        }
        await batch.commit();
        await logNotification(db, {
            type: 'delete',
            entity: 'UserManagement',
            title: `${selectedIds.length} Account(s) Deleted`,
            message: `${selectedIds.length} system accounts were permanently removed.`
        });
        window._userState.deleteMode = false;
        window._userState.selectedUsers.clear();
        
        hideDeleteModal();
        
        const btn = document.getElementById('deleteAccountBtn');
        if (btn) {
            btn.classList.remove('active');
            const span = btn.querySelector('span');
            if (span) span.innerText = "Delete Account";
        }
        showTopToast(`${selectedIds.length} account(s) successfully deleted`, 'delete');
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Action failed.");
    } finally {
        showLoading(false);
    }
}

async function renderUserProjectHistory(userName, filter = 'all', engId = null) {
    const historyList = document.getElementById('detailHistoryList');
    if (!historyList) return;
    historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 14px; font-weight: 600;">Searching projects...</div>';

    try {
        const constraints = [
            where("managingEngineerId", "==", userName),
            where("engineer", "==", userName)
        ];

        let q;
        if (engId) {
            q = query(
                collection(db, "MaintenanceProjects"),
                or(
                    ...constraints,
                    where("managingEngineerDocId", "==", engId)
                )
            );
        } else {
            q = query(
                collection(db, "MaintenanceProjects"),
                or(...constraints)
            );
        }

        if (filter && filter !== 'all') {
            const status = filter.charAt(0).toUpperCase() + filter.slice(1);
            q = query(q, where("status", "==", status));
        }

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            historyList.innerHTML = '<div class="empty-state">No associated project records found.</div>';
            return;
        }

        historyList.innerHTML = snapshot.docs.map(docSnap => {
            const p = docSnap.data();
            const status = (p.status || 'Ongoing').toLowerCase();
            return `
                <div class="history-item-row">
                    <div>
                        <div class="h-title">${p.projectTitle || p.title || 'Untitled Project'}</div>
                        <div class="h-meta-row">
                            <span>${p.lguId || p.municipality || '---'}</span>
                            <span>•</span>
                            <span>₱${Number(p.budget || 0).toLocaleString()}</span>
                        </div>
                    </div>
                    <span class="status-badge status-${status}">${p.status || 'Ongoing'}</span>
                </div>`;
        }).join('');
    } catch (err) {
        console.error("History error:", err);
        historyList.innerHTML = '<div class="empty-state">Failed to load history.</div>';
    }
}

function setupDetailsTabs() {
    const tabs = document.querySelectorAll('.engineer-details-modal .tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            const user = window._userState.selectedUserDetails;
            if (user) {
                const engData = window._userState.engineerDataMap?.[user.engineerId] || {};
                const name = engData.firstName ? `${engData.firstName} ${engData.lastName}` : (engData.FullName || user.username);
                renderUserProjectHistory(name, filter, user.engineerId);
            }
        });
    });
}

function closeDetailsModal() {
    const modal = document.getElementById('engineerDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

function openCreateAccountModal() {
    const modal = document.getElementById('createAccountModal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

async function submitCreateAccount() {
    const nameInput = document.querySelector('input[name="fullName"]');
    const usernameInput = document.getElementById('username');
    const roleInput = document.getElementById('roleInput'); 
    const rankInput = document.querySelector('select[name="rank"]');
    const muniInput = document.querySelector('select[name="municipality"]');
    const passwordInput = document.getElementById('acctPassword');
    const confirmInput = document.getElementById('acctConfirmPassword');

    const fullName = nameInput?.value.trim();
    const username = usernameInput?.value.trim();
    const roleName = roleInput?.value || 'Engineer';
    const rank = rankInput?.value || 'Engineer III';
    const municipality = muniInput?.value || '';
    const password = passwordInput?.value;
    const confirm = confirmInput?.value;

    if (!fullName || !username || !password) return alert('Please fill in all required fields.');
    if (password.length < 8) return alert('Password must be at least 8 characters.');
    if (password !== confirm) return alert('Passwords do not match.');

    const email = `${username}@engineer.ph`;
    showLoading(true);

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        let engineerId = null;

        if (roleName === 'engineer' || roleName === 'Engineer') {
            const engineerRef = doc(db, 'Engineers', uid);
            engineerId = uid;
            
            const nameParts = fullName.split(' ');
            let firstName = nameParts[0] || "";
            let lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
            let middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : "";

            const lguId = municipality; // Now municipality dropdown provides ID

            await setDoc(engineerRef, {
                firstName,
                middleName,
                lastName,
                email,
                rank,
                position: 'Engineer',
                lguId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: currentProfile?.username || "Admin"
            });
        }

        await setDoc(doc(db, 'UserAccounts', uid), {
            username: username,
            email: email,
            role: roleName.toLowerCase(),
            engineerId: engineerId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await logNotification(db, {
            type: 'create',
            entity: 'UserManagement',
            title: 'New Account Created',
            message: `A ${roleName} account was created for ${fullName}.`
        });

        const modal = document.getElementById('createAccountModal');
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
        document.body.style.overflow = 'auto';
        
        document.getElementById('createAccountForm').reset();
        showTopToast('Account successfully created', 'create');
    } catch (err) {
        console.error('Create account error:', err);
        alert(err.message || 'Failed to create account.');
    } finally {
        showLoading(false);
    }
}
