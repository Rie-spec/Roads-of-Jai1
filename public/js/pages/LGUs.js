/* AdminLGU.js */
import { db, auth } from '../../js/firebase-config.js';
import { 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    serverTimestamp, 
    where,
    or
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { requireLogin } from '../../js/auth-guard.js';
import { initNotifications, logNotification } from '../../js/pages/notifications.js';

// ── Auth Guard ─────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;

async function checkAuth() {
    try {
        const { user, profile } = await requireLogin();
        window._isAdmin = (profile.role === 'admin' || profile.role === 'administrator' || profile.role === 'Admin');
        window._lguState.isAdmin = window._isAdmin;
        currentUser = user;
        currentProfile = profile;
        console.log('Admin authenticated:', currentUser.email);
        
        // Hide UI elements if not Admin
        const delBtn = document.getElementById('deleteModeBtn');
        const newBtn = document.getElementById('newLGUBtn') || document.getElementById('newProjectBtn') || document.getElementById('newBtn');
        if (!window._isAdmin) {
            if (delBtn) delBtn.style.display = 'none';
            if (newBtn) newBtn.style.display = 'none';
        } else {
            if (delBtn) delBtn.style.display = 'flex';
            if (newBtn) newBtn.style.display = 'flex';
        }
        
        try {
            initNotifications(db);
        } catch (err) {
            console.warn('Notification init failed (non-fatal):', err);
        }

        displayTable();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

// GLOBAL STATE
window._lguState = {
    allRecords: [],
    filteredRecords: [],
    currentPage: 1,
    rowsPerPage: 8,
    selectedId: null,
    activeSubscribers: [],
    isAdmin: window._isAdmin || false,
    deleteMode: false,
    selectedToDelete: new Set()
};

// XSS Protection Helper
const escapeHTML = (str) => {
    if (!str) return '---';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const recordsBody = document.getElementById('lguTableBody');
const searchInput = document.getElementById('lguSearch');
const getFormModal = () => document.getElementById('lguFormModal');
const getDetailsPanel = () => document.getElementById('lguDetailsPanel');

/* --- TOAST --- */
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

/* --- DELETE HELPERS --- */
function exitDeleteMode() {
    window._lguState.deleteMode = false;
    window._lguState.selectedToDelete.clear();
    const btn = document.getElementById('deleteModeBtn');
    if (btn) { btn.classList.remove('active'); btn.querySelector('span').innerText = 'Delete LGU'; }
    renderTableRows();
}

function showDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) { modal.style.display = 'flex'; setTimeout(() => modal.classList.add('active'), 10); }
}

function hideDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300); }
}

async function executeDeleteAction() {
    const ids = Array.from(window._lguState.selectedToDelete);
    if (ids.length === 0) return;
    try {
        for (const id of ids) {
            const lgu = window._lguState.allRecords.find(r => r.id === id);
            await deleteDoc(doc(db, "LGUs", id));
            if (lgu) {
                await logNotification(db, {
                    type: 'delete',
                    entity: 'lgu',
                    title: 'LGU Deleted',
                    message: `LGU record for "${lgu.municipalityName || lgu.municipality}" was deleted.`
                });
            }
        }
        hideDeleteConfirmModal();
        exitDeleteMode();
        showTopToast(`${ids.length} LGU record${ids.length > 1 ? 's' : ''} successfully deleted`, 'delete');
    } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete records.");
    }
}

/* --- MAIN FUNCTIONS --- */
async function displayTable() {
    if (!db) return;
    try {
        const q = query(collection(db, "LGUs"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            window._lguState.allRecords = [];
            snapshot.forEach((doc) => {
                window._lguState.allRecords.push({ id: doc.id, ...doc.data() });
            });
            renderTableRows();
        });
    } catch (error) {
        console.error("Initialization Error:", error);
    }
}

function renderTableRows() {
    if (!recordsBody) return;

    const searchTerm = searchInput?.value.toLowerCase() || "";
    const filterSort = document.getElementById('filterSort')?.value || "A-Z";

    let filtered = window._lguState.allRecords.filter(data => {
        const muni = data.municipalityName || data.municipality || "";
        const mF = data.mayorFirstName || "";
        const mL = data.mayorLastName || "";
        const mFull = `${mF} ${data.mayorMiddleName || ''} ${mL}`.trim();
        const legacyMayor = data.mayorName || data.headName || "";
        return `${muni} ${mFull} ${legacyMayor}`.toLowerCase().includes(searchTerm);
    });

    if (filterSort === "A-Z") filtered.sort((a, b) => (a.municipalityName || a.municipality || "").localeCompare(b.municipalityName || b.municipality || ""));
    else if (filterSort === "Z-A") filtered.sort((a, b) => (b.municipalityName || b.municipality || "").localeCompare(a.municipalityName || a.municipality || ""));
    else if (filterSort === "Oldest") filtered.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    else filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    const totalPages = Math.ceil(filtered.length / window._lguState.rowsPerPage) || 1;
    const startIndex = (window._lguState.currentPage - 1) * window._lguState.rowsPerPage;
    const items = filtered.slice(startIndex, startIndex + window._lguState.rowsPerPage);

    recordsBody.innerHTML = "";
    if (items.length === 0) {
        recordsBody.innerHTML = '<div class="records-placeholder">No LGU records found.</div>';
    } else {
        items.forEach(data => {
            const isSelected = window._lguState.selectedToDelete.has(data.id);
            const row = document.createElement('div');
            row.className = `record-row ${isSelected ? 'to-delete' : ''}`;
            row.style.gridTemplateColumns = "2fr 2fr 1fr";

            let actionHtml = '';
            if (window._lguState.deleteMode) {
                actionHtml = `
                    <button class="action-btn delete-select-btn ${isSelected ? 'selected' : ''}" data-id="${data.id}">
                        ${isSelected
                            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'}
                    </button>`;
            } else {
                actionHtml = `
                    <button type="button" class="action-btn view-btn" onclick="viewRecord('${data.id}')">
                        <i data-lucide="eye" style="width:20px; height:20px;"></i>
                    </button>`;
            }

            const mFull = data.mayorFirstName ? `${data.mayorFirstName} ${data.mayorLastName}` : (data.mayorName || data.headName || "---");
            row.innerHTML = `
                <div class="col font-bold">${escapeHTML(data.municipalityName || data.municipality)}</div>
                <div class="col font-medium">${escapeHTML(mFull)}</div>
                <div class="col actions-col" style="text-align: right;">${actionHtml}</div>`;
            recordsBody.appendChild(row);
        });
        if (window.lucide) lucide.createIcons();
    }
    updatePaginationUI(filtered.length, totalPages);
}

function updatePaginationUI(totalItems, totalPages) {
    const note = document.getElementById('lguRecordCount');
    const start = (window._lguState.currentPage - 1) * window._lguState.rowsPerPage + 1;
    const end = Math.min(window._lguState.currentPage * window._lguState.rowsPerPage, totalItems);
    if (note) note.textContent = `Showing ${totalItems > 0 ? start : 0}-${end} of ${totalItems} recordings`;

    const paginationContainer = document.getElementById('lguPagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = `
        <button class="page-btn" onclick="changePage(${window._lguState.currentPage - 1})" ${window._lguState.currentPage === 1 ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
    `;
    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.innerHTML += `
            <button class="page-btn ${i === window._lguState.currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>
        `;
    }
    paginationContainer.innerHTML += `
        <button class="page-btn" onclick="changePage(${window._lguState.currentPage + 1})" ${window._lguState.currentPage === totalPages ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>
    `;
}

window.changePage = (page) => {
    const totalPages = Math.ceil(window._lguState.allRecords.length / window._lguState.rowsPerPage);
    if (page < 1 || page > totalPages) return;
    window._lguState.currentPage = page;
    renderTableRows();
};

/* --- RECORD ACTIONS --- */
window.viewRecord = (id) => {
    const u = window._lguState.allRecords.find(item => item.id === id);
    if (!u) return;

    window._lguState.activeSubscribers.forEach(unsub => unsub());
    window._lguState.activeSubscribers = [];

    const adminMeta = document.getElementById('lguMetaContainer');
    if (adminMeta) {
        adminMeta.style.display = 'flex';
        const createdByEl = document.getElementById('lguDetailCreatedBy');
        if (createdByEl) createdByEl.textContent = `Created by: ${u.createdBy || 'Admin'}`;

        const uploadDateEl = document.getElementById('lguDetailUploadDate');
        if (uploadDateEl) {
            let dateStr = 'N/A';
            const createDate = u.createdAt;
            if (createDate) {
                const date = createDate.toDate ? createDate.toDate() : new Date(createDate.seconds * 1000);
                dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            }
            uploadDateEl.textContent = `Uploaded: ${dateStr}`;
        }

        const editedDateEl = document.getElementById('lguDetailEditedDate');
        if (editedDateEl) {
            if (u.updatedAt) {
                const date = u.updatedAt.toDate ? u.updatedAt.toDate() : new Date(u.updatedAt);
                editedDateEl.textContent = `Edited: ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                editedDateEl.parentElement.style.display = 'flex';
            } else {
                editedDateEl.textContent = "";
                editedDateEl.parentElement.style.display = 'none';
            }
        }
    }

    const headerTitleEl = document.getElementById('lguDetailName_header');
    if (headerTitleEl) headerTitleEl.textContent = u.municipalityName || u.municipality || 'LGU DETAILS';

    const nameEl = document.getElementById('lguDetailName');
    if (nameEl) nameEl.textContent = u.municipalityName || u.municipality || '---';

    const mayorEl = document.getElementById('lguDetailMayor');
    if (mayorEl) {
        const mFull = u.mayorFirstName ? `${u.mayorFirstName} ${u.mayorMiddleName || ''} ${u.mayorLastName}`.trim() : (u.mayorName || u.headName || '---');
        mayorEl.textContent = mFull;
    }

    const provinceEl = document.getElementById('lguDetailProvince');
    if (provinceEl) provinceEl.textContent = u.province || '---';

    const regionEl = document.getElementById('lguDetailRegion');
    if (regionEl) regionEl.textContent = u.region || '---';

    const contactEl = document.getElementById('lguDetailContact');
    if (contactEl) contactEl.textContent = u.contactNumber || u.contactNo || u.contact || '---';

    const engContainer = document.getElementById('associatedEngineers');
    if (engContainer) {
        const qEng = query(
            collection(db, "Engineers"), 
            where("lguId", "==", id)
        );
        const unsubEng = onSnapshot(qEng, (snap) => {
            const engineers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            engContainer.innerHTML = engineers.length > 0 ? engineers.map(e => `
                <div class="item-card">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:32px; height:32px; background:#f0fdf4; color:#16a34a; border-radius:10px; display:flex; align-items:center; justify-content:center;"><i data-lucide="shield-check" style="width:16px;"></i></div>
                        <div><span style="display:block; font-weight:800; color:#1e293b; font-size: 11px;">${escapeHTML(e.firstName + ' ' + (e.lastName || ''))}</span><span style="font-size:10px; color:#94a3b8; font-weight:700;">${escapeHTML(e.position || 'Engineer')}</span></div>
                    </div>
                </div>
            `).join('') : '<p style="text-align:center; color:#94a3b8; font-size:11px; padding:10px; font-style:italic;">No engineers assigned to this area.</p>';
            if (window.lucide) lucide.createIcons();
        });
        window._lguState.activeSubscribers.push(unsubEng);
    }

    const projContainer = document.getElementById('associatedProjects');
    if (projContainer) {
        const qProj = query(
            collection(db, "MaintenanceProjects"), 
            where("lguId", "==", id)
        );
        const unsubProj = onSnapshot(qProj, (snap) => {
            const projects = snap.docs.map(doc => doc.data());
            projContainer.innerHTML = projects.length > 0 ? projects.map(p => `
                <div class="item-card">
                    <div><span style="display:block; font-weight:800; color:#1e293b; font-size: 11px;">${escapeHTML(p.projectTitle || p.title)}</span><span style="font-size:10px; color:#94a3b8; font-weight:700;">MAINTENANCE PROJECT</span></div>
                    <span class="badge ${p.status?.toLowerCase()}">${escapeHTML(p.status)}</span>
                </div>
            `).join('') : '<p style="text-align:center; color:#94a3b8; font-size:11px; padding:10px; font-style:italic;">No project records found.</p>';
        });
        window._lguState.activeSubscribers.push(unsubProj);
    }

    const overlay = getDetailsPanel();
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('active'), 10);
        document.body.classList.add('modal-open');
        if (window.lucide) lucide.createIcons();
    }
    window._lguState.selectedId = id;
};

window.editRecord = (id) => {
    const u = window._lguState.allRecords.find(item => item.id === id);
    if (!u) return;

    window._lguState.selectedId = id;
    const formTitleEl = document.getElementById('lguFormTitle');
    if (formTitleEl) formTitleEl.textContent = 'Edit LGU Record';

    const nameInput = document.getElementById('lguFormName');
    if (nameInput) nameInput.value = u.municipalityName || u.municipality || "";

    const mayorInput = document.getElementById('lguFormMayor');
    if (mayorInput) {
        const mFull = u.mayorFirstName ? `${u.mayorFirstName} ${u.mayorMiddleName || ''} ${u.mayorLastName}`.trim() : (u.mayorName || u.headName || "");
        mayorInput.value = mFull;
    }

    const provinceInput = document.getElementById('lguFormProvince');
    if (provinceInput) provinceInput.value = u.province || "";

    const regionInput = document.getElementById('lguFormRegion');
    if (regionInput) regionInput.value = u.region || "";

    const contactInput = document.getElementById('lguFormContact');
    if (contactInput) contactInput.value = u.contactNumber || u.contactNo || u.contact || "";

    const overlay = getFormModal();
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('active'), 10);
        document.body.classList.add('modal-open');
    }
};

/* --- FORM & MODAL CONTROLS --- */
const closeModals = () => {
    const form = getFormModal();
    const detail = getDetailsPanel();
    const delConfirm = document.getElementById('deleteConfirmModal');
    if (form) form.classList.remove('active');
    if (detail) detail.classList.remove('active');
    if (delConfirm) delConfirm.classList.remove('active');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
        if (form) form.style.display = 'none';
        if (detail) detail.style.display = 'none';
        if (delConfirm) delConfirm.style.display = 'none';
    }, 300);
};

document.getElementById('newLGUBtn')?.addEventListener('click', () => {
    window._lguState.selectedId = null;
    const titleEl = document.getElementById('lguFormTitle');
    if (titleEl) titleEl.textContent = 'New LGU Record';
    const form = document.getElementById('lguForm');
    if (form) form.reset();
    const overlay = getFormModal();
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('active'), 10);
        document.body.classList.add('modal-open');
    }
});

document.getElementById('closeLGUFormBtn')?.addEventListener('click', closeModals);
document.getElementById('cancelLGUBtn')?.addEventListener('click', closeModals);
document.getElementById('closeLGUDetailsBtn')?.addEventListener('click', closeModals);
document.getElementById('editLGUBtn')?.addEventListener('click', () => {
    const id = window._lguState.selectedId;
    closeModals();
    setTimeout(() => editRecord(id), 350);
});

/* --- FILTERS --- */
searchInput?.addEventListener('input', () => { window._lguState.currentPage = 1; renderTableRows(); });
document.getElementById('filterSort')?.addEventListener('change', renderTableRows);
document.getElementById('refreshBtn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const btnIcon = btn.querySelector('svg');
    if (btnIcon) {
        const currentRot = (parseInt(btn.dataset.rotation || '0')) + 360;
        btn.dataset.rotation = currentRot;
        btnIcon.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        btnIcon.style.transform = `rotate(${currentRot}deg)`;
    }
    if (searchInput) searchInput.value = "";
    const sort = document.getElementById('filterSort');
    if (sort) sort.value = "Newest";
    window._lguState.currentPage = 1;
    renderTableRows();
});

/* --- FORM SUBMISSION --- */
document.getElementById('lguForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveLGUBtn');
    btn.disabled = true;

    const mayorFullName = document.getElementById('lguFormMayor').value.trim();
    const nameParts = mayorFullName.split(' ');
    let firstName = nameParts[0] || "";
    let lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    let middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : "";

    const lguData = {
        municipalityName: document.getElementById('lguFormName').value,
        mayorFirstName: firstName,
        mayorMiddleName: middleName,
        mayorLastName: lastName,
        province: document.getElementById('lguFormProvince').value,
        region: document.getElementById('lguFormRegion').value,
        contactNumber: document.getElementById('lguFormContact').value,
        updatedAt: serverTimestamp(),
        createdBy: currentProfile?.username || "Admin"
    };

    try {
        if (window._lguState.selectedId) {
            await updateDoc(doc(db, "LGUs", window._lguState.selectedId), lguData);
            await logNotification(db, {
                type: 'edit',
                entity: 'lgu',
                title: 'LGU Updated',
                message: `LGU record for "${lguData.municipalityName}" was updated.`
            });
            showTopToast("LGU record successfully updated", 'create');
        } else {
            lguData.createdAt = serverTimestamp();
            await addDoc(collection(db, "LGUs"), lguData);
            await logNotification(db, {
                type: 'create',
                entity: 'lgu',
                title: 'LGU Created',
                message: `LGU record for "${lguData.municipalityName}" was added.`
            });
            showTopToast("LGU record successfully added", 'create');
        }
        closeModals();
    } catch (err) {
        console.error("Submission Error:", err);
        alert("Failed to save record.");
    } finally {
        if (btn) btn.disabled = false;
    }
});

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('deleteModeBtn')?.addEventListener('click', () => {
        const btn = document.getElementById('deleteModeBtn');
        if (!window._lguState.deleteMode) {
            window._lguState.deleteMode = true;
            window._lguState.selectedToDelete.clear();
            btn.classList.add('active');
            btn.querySelector('span').innerText = 'Confirm Delete (0)';
        } else {
            if (window._lguState.selectedToDelete.size > 0) {
                showDeleteConfirmModal();
            } else {
                exitDeleteMode();
            }
        }
        renderTableRows();
    });

    document.addEventListener('click', (e) => {
        const delSelect = e.target.closest('.delete-select-btn');
        if (delSelect) {
            const id = delSelect.dataset.id;
            if (window._lguState.selectedToDelete.has(id)) {
                window._lguState.selectedToDelete.delete(id);
            } else {
                window._lguState.selectedToDelete.add(id);
            }
            const btnText = document.querySelector('#deleteModeBtn span');
            if (btnText) btnText.innerText = `Confirm Delete (${window._lguState.selectedToDelete.size})`;
            renderTableRows();
        }
    });

    document.getElementById('cancelDeleteBtn')?.addEventListener('click', hideDeleteConfirmModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', executeDeleteAction);
});
