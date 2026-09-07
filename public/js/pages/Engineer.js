// ============================================================
//  Engineer Module — JAIROADS
//  Notifications are self-contained here (no separate import)
// ============================================================

import {
    collection, onSnapshot,
    query, where, limit, getDocs,
    orderBy, updateDoc, writeBatch, addDoc,
    serverTimestamp, doc, or
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db, auth } from '../firebase-config.js';
import { requireRole } from '../auth-guard.js';

// ─── Auth Guard ─────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;

async function checkAuth() {
    try {
        const { user, profile } = await requireRole(['Admin', 'Administrator', 'Engineer']);
        currentUser = user;
        currentProfile = profile;
        console.log('Authenticated for Engineer Module:', currentUser.email);
        
        initEngineerModule();
        initNotifications();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

// ─── Engineer State ───────────────────────────────────────────────────────────

window._engineerState = {
    allEngineers:      [],
    filteredEngineers: [],
    allLGUs:           [], // Add LGU store
    currentPage:       1,
    rowsPerPage:       8,
    selectedEngineer:  null
};

// ─── Bootstrap ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // initEngineerModule(); // Moved to checkAuth
    // initNotifications();      // Moved to checkAuth
});

// =============================================================
//  NOTIFICATION SYSTEM (self-contained, no external import)
// =============================================================

const NOTIF_ICONS = {
    create: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    edit:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    delete: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    info:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

function notifTimeAgo(ts) {
    if (!ts) return 'just now';
    const ms = ts.toMillis ? ts.toMillis() : (ts.seconds ? ts.seconds * 1000 : ts);
    const s  = Math.floor((Date.now() - ms) / 1000);
    if (s < 60)    return 'just now';
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

function renderNotifItem(n) {
    return `
        <div class="notif-item ${n.read ? '' : 'is-unread'}" data-id="${n.id}">
            <div class="notif-item-icon notif-icon-${n.type || 'info'}">${NOTIF_ICONS[n.type] || NOTIF_ICONS.info}</div>
            <div class="notif-item-body">
                <p class="notif-item-title">${n.title || 'System Action'}</p>
                <p class="notif-item-msg">${n.message || ''}</p>
                <span class="notif-item-time">${notifTimeAgo(n.createdAt)}</span>
            </div>
        </div>`;
}

function initNotifications() {
    const panel      = document.getElementById('notifPanel');
    const backdrop   = document.getElementById('notifBackdrop');
    const list       = document.getElementById('notifList');
    const empty      = document.getElementById('notifEmpty');
    const markAllBtn = document.getElementById('markAllReadBtn');
    const bellBtn    = document.querySelector('.btn-notification');

    // Guard — log exactly which element is missing
    if (!panel || !backdrop || !list || !bellBtn) {
        console.error('initNotifications: missing elements', {
            panel: !!panel, backdrop: !!backdrop, list: !!list, bellBtn: !!bellBtn
        });
        return;
    }

    // ── FIX: force bell button above everything ──────────────────
    bellBtn.style.position = 'relative';
    bellBtn.style.zIndex   = '100001';
    bellBtn.style.cursor   = 'pointer';

    // ── Badge ────────────────────────────────────────────────────
    let badge = document.getElementById('notifBadge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'notif-badge is-hidden';
        badge.id        = 'notifBadge';
        bellBtn.appendChild(badge);
    }

    // ── Panel positioning ────────────────────────────────────────
    function positionPanel() {
        const rect        = bellBtn.getBoundingClientRect();
        panel.style.top   = (rect.bottom + 10) + 'px';
        panel.style.right = (window.innerWidth - rect.right) + 'px';
        panel.style.left  = 'auto';
    }

    // ── Toggle open/close ────────────────────────────────────────
    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.contains('is-open');
        positionPanel();
        panel.classList.toggle('is-open', !isOpen);
        backdrop.classList.toggle('is-open', !isOpen);
    });

    backdrop.addEventListener('click', () => {
        panel.classList.remove('is-open');
        backdrop.classList.remove('is-open');
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            panel.classList.remove('is-open');
            backdrop.classList.remove('is-open');
        }
    });

    window.addEventListener('resize', () => {
        if (panel.classList.contains('is-open')) positionPanel();
    });

    // ── Firestore real-time listener ─────────────────────────────
    let latestDocs = [];
    const q = query(
        collection(db, 'Notifications'),
        orderBy('createdAt', 'desc'),
        limit(40)
    );

    onSnapshot(q, (snapshot) => {
        latestDocs = snapshot.docs;
        const items       = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const unreadCount = items.filter(n => !n.read).length;

        // Update badge
        badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
        badge.classList.toggle('is-hidden', unreadCount === 0);

        // Mark-all button state
        if (markAllBtn) {
            markAllBtn.disabled      = unreadCount === 0;
            markAllBtn.style.opacity = unreadCount === 0 ? '0.4' : '1';
            markAllBtn.style.cursor  = unreadCount === 0 ? 'not-allowed' : 'pointer';
        }

        // Render list
        if (items.length === 0) {
            list.innerHTML = '';
            if (empty) list.appendChild(empty);
        } else {
            if (empty?.parentNode) empty.remove();
            list.innerHTML = items.map(renderNotifItem).join('');
        }
    }, (err) => {
        console.error('Notifications listener error:', err);
    });

    // ── Mark all read ────────────────────────────────────────────
    markAllBtn?.addEventListener('click', async () => {
        const unread = latestDocs.filter(d => !d.data().read);
        if (!unread.length) return;
        markAllBtn.textContent = 'Marking...';
        markAllBtn.disabled    = true;
        try {
            const batch = writeBatch(db);
            unread.forEach(d => batch.update(doc(db, 'Notifications', d.id), { read: true }));
            await batch.commit();
        } catch (err) {
            console.error('Mark all read failed:', err);
        } finally {
            markAllBtn.textContent = 'MARK ALL READ';
        }
    });

    // ── Mark single read on click ────────────────────────────────
    list.addEventListener('click', async (e) => {
        const item = e.target.closest('.notif-item.is-unread');
        if (!item) return;
        const id = item.dataset.id;
        if (!id) return;
        item.classList.remove('is-unread');
        try {
            await updateDoc(doc(db, 'Notifications', id), { read: true });
        } catch (err) {
            console.error('Mark read failed:', err);
        }
    });
}

// Export so other modules can log notifications
export async function logNotification({ type = 'info', entity = '', title, message }) {
    try {
        await addDoc(collection(db, 'Notifications'), {
            type, entity, title, message,
            read:      false,
            createdAt: serverTimestamp(),
            createdBy: 'Admin'
        });
    } catch (err) {
        console.warn('Failed to log notification:', err);
    }
}

// Helper to format Engineer Name
const formatEngineerName = (eng) => {
    if (!eng) return '---';
    const fName = eng.firstName || '';
    const lName = eng.lastName || '';
    const fullName = `${fName} ${lName}`.trim();
    if (fullName) return `Engr. ${fullName}`;
    
    const existingName = eng.FullName || eng.fullName || eng.Name || eng.username || '---';
    if (existingName !== '---' && !existingName.startsWith('Engr.')) {
        return `Engr. ${existingName}`;
    }
    return existingName;
};

// =============================================================
//  ENGINEER MODULE
// =============================================

function initEngineerModule() {
    setupListeners();
    bindEvents();
    setupDetailsTabs();
}

function setupListeners() {
    // ── Fetch LGUs ───────────────────────────────────────────────
    onSnapshot(collection(db, "LGUs"), (snapshot) => {
        window._engineerState.allLGUs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const muniFilter = document.getElementById('filterMunicipality');
        if (muniFilter) {
            const currentVal = muniFilter.value;
            muniFilter.innerHTML = '<option value="All">All Municipalities</option>';
            window._engineerState.allLGUs.sort((a,b) => (a.municipalityName||"").localeCompare(b.municipalityName||"")).forEach(lgu => {
                const opt = document.createElement('option');
                opt.value = lgu.id;
                opt.textContent = lgu.municipalityName;
                muniFilter.appendChild(opt);
            });
            if (currentVal) muniFilter.value = currentVal;
        }
        applyFilters();
    });

    // ── Fetch Engineer Metadata ──────────────────────────────────
    onSnapshot(collection(db, "Engineers"), (snapshot) => {
        window._engineerState.allEngineers = snapshot.docs.map(d => ({
            id: d.id, ...d.data()
        }));
        applyFilters();
    }, (err) => console.error("Engineer List Error:", err));

    // ── Fetch User Accounts (for linking roles/usernames) ────────
    onSnapshot(collection(db, "UserAccounts"), (snap) => {
        const accMap = {};
        snap.forEach(doc => {
            const data = doc.data();
            if (data.engineerId) accMap[data.engineerId] = { id: doc.id, ...data };
        });
        window._engineerState.userAccountsMap = accMap;
        applyFilters();
    });
}

function bindEvents() {
    const searchInput = document.getElementById('tableSearch');
    const rankFilter  = document.getElementById('filterRank');
    const muniFilter  = document.getElementById('filterMunicipality');
    const refreshBtn  = document.getElementById('refreshBtn');
    const closeBtn    = document.getElementById('closeEngineerDetailsBtn');

    searchInput?.addEventListener('input',  () => { window._engineerState.currentPage = 1; applyFilters(); });
    rankFilter?.addEventListener('change',  () => { window._engineerState.currentPage = 1; applyFilters(); });
    muniFilter?.addEventListener('change',  () => { window._engineerState.currentPage = 1; applyFilters(); });

    refreshBtn?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (rankFilter)  rankFilter.value  = 'All';
        if (muniFilter)  muniFilter.value  = 'All';
        window._engineerState.currentPage  = 1;
        applyFilters();
    });

    closeBtn?.addEventListener('click', closeDetailsModal);

    document.getElementById('engineerDetailsModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'engineerDetailsModal') closeDetailsModal();
    });
}

function applyFilters() {
    const searchTerm   = document.getElementById('tableSearch')?.value?.toLowerCase() || '';
    const selectedRank = document.getElementById('filterRank')?.value  || 'All';
    const selectedMuni = document.getElementById('filterMunicipality')?.value || 'All';
    const accMap       = window._engineerState.userAccountsMap || {};

    window._engineerState.filteredEngineers = window._engineerState.allEngineers.filter(eng => {
        const userAcc = accMap[eng.id] || {};
        
        const nameVal = eng.FullName || eng.fullName || userAcc.username || 'Unknown';
        const rankVal = eng.Rank || eng.rank || userAcc.role || 'Junior';
        const posVal  = eng.Position || eng.position || 'Engineer';
        const lguId = eng.municipality || eng.lguId || '---';
        const targetLgu = window._engineerState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
        const muniName = targetLgu ? targetLgu.municipalityName : lguId;

        const matchesSearch = (
            nameVal.toLowerCase().includes(searchTerm) ||
            posVal.toLowerCase().includes(searchTerm) ||
            rankVal.toLowerCase().includes(searchTerm)
        );
        return matchesSearch &&
               (selectedRank === 'All' || rankVal === selectedRank) &&
               (selectedMuni === 'All' || lguId === selectedMuni || (lguId).toLowerCase() === selectedMuni.toLowerCase());
    });

    renderTable();
}

function renderTable() {
    const recordsBody = document.getElementById('recordsBody');
    const { filteredEngineers, currentPage, rowsPerPage, userAccountsMap } = window._engineerState;
    if (!recordsBody) return;
    
    const accMap = userAccountsMap || {};

    if (filteredEngineers.length === 0) {
        recordsBody.innerHTML = '<div class="records-placeholder">No engineers found matching your criteria.</div>';
        updatePaginationInfo(0);
        return;
    }

    const start     = (currentPage - 1) * rowsPerPage;
    const paginated = filteredEngineers.slice(start, start + rowsPerPage);

    recordsBody.innerHTML = paginated.map(eng => {
        const userAcc = accMap[eng.id] || {};
        const name    = formatEngineerName({ ...eng, username: userAcc.username });
        const lguId   = eng.municipality || eng.lguId || '---';
        const targetLgu = window._engineerState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
        const muniName = targetLgu ? targetLgu.municipalityName : lguId;

        const rank    = eng.Rank || eng.rank || userAcc.role || 'Junior';
        const pos     = eng.Position || eng.position || 'Engineer';

        return `
        <div class="record-row">
            <div class="head-col engineer-name-cell">
                <div class="engineer-avatar-mini">${getInitials(name)}</div>
                <div style="font-weight:700;color:#1e293b;">${name}</div>
            </div>
            <div class="head-col">${pos}</div>
            <div class="head-col">
                <span class="rank-badge rank-${(rank || '').toLowerCase()}">${rank}</span>
            </div>
            <div class="head-col">${muniName}</div>
            <div class="col actions-col">
                <button type="button" class="action-btn view-btn" onclick="window.openEngineerDetails('${eng.id}')">
                    <i data-lucide="eye" style="width:20px;height:20px;"></i>
                </button>
            </div>
        </div>`;
    }).join('');

    updatePaginationInfo(filteredEngineers.length);
    if (window.lucide) lucide.createIcons();
}

function updatePaginationInfo(total) {
    const note     = document.getElementById('recordsNote');
    const controls = document.getElementById('paginationControls');
    const { currentPage, rowsPerPage } = window._engineerState;

    const s = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const e = Math.min(currentPage * rowsPerPage, total);
    if (note) note.innerText = `Showing ${s}–${e} of ${total} engineers`;

    if (!controls) return;
    const totalPages = Math.ceil(total / rowsPerPage);
    let html = '';
    if (totalPages > 1) {
        html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changeEngineerPage(${currentPage - 1})"><i data-lucide="chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changeEngineerPage(${i})">${i}</button>`;
        }
        html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changeEngineerPage(${currentPage + 1})"><i data-lucide="chevron-right"></i></button>`;
    }
    controls.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

window.changeEngineerPage = (page) => {
    window._engineerState.currentPage = page;
    renderTable();
};

window.openEngineerDetails = async (id) => {
    try {
        const eng = window._engineerState.allEngineers.find(e => e.id === id);
        if (!eng) { console.error("Engineer not found:", id); return; }

        const accMap  = window._engineerState.userAccountsMap || {};
        const userAcc = accMap[eng.id] || {};

        const name = formatEngineerName({ ...eng, username: userAcc.username });
        const fields = {
            detailName: name, 
            detailRank: eng.Rank || eng.rank || userAcc.role || '---',
            detailEmail: eng.Email || eng.email || userAcc.email || '---', 
            detailJoined: eng.createdAt ? new Date(eng.createdAt.toDate ? eng.createdAt.toDate() : eng.createdAt).toLocaleDateString() : '---', 
            detailPosition: eng.Position || eng.position || '---'
        };
        for (const [fId, val] of Object.entries(fields)) {
            const el = document.getElementById(fId);
            if (el) el.innerText = val || '---';
        }

        window._engineerState.selectedEngineer = { name, ...eng };

        document.querySelectorAll('.engineer-details-modal .tab-btn').forEach(t => {
            t.classList.toggle('active', t.dataset.filter === 'all');
        });

        await renderEngineerHistory(name, 'all', id);

        const modal = document.getElementById('engineerDetailsModal');
        if (!modal) return;
        modal.style.display = 'flex';
        setTimeout(() => { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }, 10);
        if (window.lucide) lucide.createIcons();
    } catch (err) {
        console.error("Error in openEngineerDetails:", err);
    }
};

function setupDetailsTabs() {
    document.querySelectorAll('.engineer-details-modal .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.engineer-details-modal .tab-btn').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const eng = window._engineerState.selectedEngineer;
            if (eng) renderEngineerHistory(eng.name, btn.dataset.filter, eng.id);
        });
    });
}

async function renderEngineerHistory(engineerName, filter = 'all', engineerId = null) {
    const historyList = document.getElementById('detailHistoryList');
    if (!historyList) return;

    historyList.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:14px;font-weight:600;">Searching archives…</div>';

    try {
        const nameToQuery = engineerName;
        // Search by either engineer field (new schema uses managingEngineerId but here we use engineerName for filtering projects)
        const constraints = [
            where("managingEngineerId", "==", nameToQuery)
        ];

        // Create OR query to handle both Relational ID and Name-based identifiers
        let finalQuery;
        if (engineerId) {
            finalQuery = query(
                collection(db, "MaintenanceProjects"),
                or(
                    ...constraints,
                    where("managingEngineerDocId", "==", engineerId),
                    where("engineer", "==", nameToQuery) // Legacy field check
                )
            );
        } else {
            finalQuery = query(
                collection(db, "MaintenanceProjects"),
                or(
                    ...constraints,
                    where("engineer", "==", nameToQuery)
                )
            );
        }
        
        const snap = await getDocs(finalQuery);
        let actualDocs = snap.docs;

        if (actualDocs.length === 0) {
            historyList.innerHTML = '<div class="empty-state">No recent activity or projects found.</div>';
            return;
        }

        historyList.innerHTML = actualDocs.map(d => {
            const p      = d.data();
            const status = (p.status || 'Ongoing').toLowerCase();
            const lguId = p.lguId || p.municipality || '';
            const targetLgu = window._engineerState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
            const muniName = targetLgu ? targetLgu.municipalityName : lguId;

            return `
                <div class="history-item-row">
                    <div>
                        <div class="h-title">${p.projectTitle || p.title || 'Untitled Project'}</div>
                        <div class="h-meta-row">
                            <span>${muniName}</span>
                            <span>•</span>
                            <span>₱${Number(p.budget || 0).toLocaleString()}</span>
                        </div>
                    </div>
                    <span class="status-badge status-${status}">${p.status || 'Ongoing'}</span>
                </div>`;
        }).join('');
    } catch (err) {
        console.error("Error loading history:", err);
        historyList.innerHTML = '<div class="empty-state">Failed to load project history.</div>';
    }
}

function closeDetailsModal() {
    const modal = document.getElementById('engineerDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display  = 'none';
        document.body.style.overflow = 'auto';
    }
}

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}