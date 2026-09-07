/* ActivityLog.js (Used by both Admin and Engineer Activity Log pages) */

import { db, auth } from '../firebase-config.js';
import { 
    collection, 
    onSnapshot, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { requireRole } from '../auth-guard.js';

// ── Auth Guard ─────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;

async function checkAuth() {
    try {
        const { user, profile } = await requireRole(['Admin', 'Administrator', 'Engineer']);
        currentUser = user;
        currentProfile = profile;
        console.log('Authenticated for Activity Log:', currentUser.email);
        
        initActivityLogModule();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

window._logState = {
    allLogs: [],
    filteredLogs: [],
    currentPage: 1,
    rowsPerPage: 10
};

function initActivityLogModule() {
    if (window.lucide) lucide.createIcons();
    setupListeners();
    bindEvents();
}

function setupListeners() {
    const q = query(collection(db, "Notifications"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        window._logState.allLogs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        applyFilters();
    }, error => {
        console.error("Firestore Error:", error);
        const recordsBody = document.getElementById('recordsBody');
        if (recordsBody) {
            recordsBody.innerHTML = `
                <div class="records-placeholder">
                    <i data-lucide="wifi-off" style="width: 48px; height: 48px; color: #cbd5e1; margin-bottom: 12px;"></i>
                    <span style="color: #64748b; font-weight: 600;">Failed to load activity logs.</span>
                    <span style="color: #94a3b8; font-size: 12px; margin-top: 4px;">${error.message}</span>
                </div>`;
            if (window.lucide) lucide.createIcons();
        }
    });
}

function bindEvents() {
    const searchInput = document.getElementById('tableSearch');
    const typeFilter  = document.getElementById('filterType');
    const statusFilter = document.getElementById('filterStatus');
    const clearBtn    = document.getElementById('clearFiltersBtn');

    searchInput?.addEventListener('input',  () => { window._logState.currentPage = 1; applyFilters(); });
    typeFilter?.addEventListener('change',  () => { window._logState.currentPage = 1; applyFilters(); });
    statusFilter?.addEventListener('change',() => { window._logState.currentPage = 1; applyFilters(); });

    clearBtn?.addEventListener('click', () => {
        if (searchInput)  searchInput.value  = '';
        if (typeFilter)   typeFilter.value   = 'All';
        if (statusFilter) statusFilter.value = 'All';
        window._logState.currentPage = 1;
        applyFilters();
    });
}

function applyFilters() {
    const searchTerm   = document.getElementById('tableSearch')?.value?.toLowerCase() || '';
    const selectedType = document.getElementById('filterType')?.value || 'All';
    const selectedStatus = document.getElementById('filterStatus')?.value || 'All';

    window._logState.filteredLogs = window._logState.allLogs.filter(log => {
        const matchesSearch = (
            (log.title?.toLowerCase().includes(searchTerm)) ||
            (log.message?.toLowerCase().includes(searchTerm))
        );
        const matchesType = selectedType === 'All' || log.type === selectedType;

        let matchesStatus = true;
        if (selectedStatus === 'read')   matchesStatus = log.read === true;
        if (selectedStatus === 'unread') matchesStatus = log.read === false;

        return matchesSearch && matchesType && matchesStatus;
    });

    renderTable();
}

function renderTable() {
    const recordsBody = document.getElementById('recordsBody');
    const { filteredLogs, currentPage, rowsPerPage } = window._logState;

    if (!recordsBody) return;

    if (filteredLogs.length === 0) {
        recordsBody.innerHTML = `
            <div class="records-placeholder">
                <i data-lucide="inbox" style="width: 48px; height: 48px; color: #cbd5e1; margin-bottom: 12px;"></i>
                <span style="color: #64748b; font-weight: 600;">No activity logs found.</span>
            </div>`;
        updatePaginationInfo(0);
        if (window.lucide) lucide.createIcons();
        return;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginated  = filteredLogs.slice(startIndex, startIndex + rowsPerPage);

    recordsBody.innerHTML = paginated.map(log => {
        let timeString = '---';
        if (log.createdAt) {
            const dateObj = log.createdAt.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
            timeString = dateObj.toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }

        const unreadClass = log.read ? '' : 'is-unread';

        return `
            <div class="record-row ${unreadClass}">
                <div class="log-col-title">${log.title || 'System Alert'}</div>
                <div class="log-col-message">${log.message || 'No additional details provided.'}</div>
                <div class="log-col-type">${getBadgeHTML(log.type)}</div>
                <div class="log-col-time">${timeString}</div>
            </div>
        `;
    }).join('');

    updatePaginationInfo(filteredLogs.length);
    if (window.lucide) lucide.createIcons();
}

function getBadgeHTML(type) {
    let icon = 'info', label = 'INFO', colorClass = 'badge-info';

    switch (type) {
        case 'delete': icon = 'trash-2';     label = 'DELETE'; colorClass = 'badge-delete'; break;
        case 'create': icon = 'plus-circle'; label = 'CREATE'; colorClass = 'badge-create'; break;
        case 'edit':   icon = 'edit-2';      label = 'UPDATE'; colorClass = 'badge-edit';   break;
    }

    return `
        <span class="type-badge ${colorClass}">
            <i data-lucide="${icon}" style="width: 14px; height: 14px;"></i>
            ${label}
        </span>
    `;
}

function updatePaginationInfo(total) {
    const note     = document.getElementById('recordsNote');
    const controls = document.getElementById('paginationControls');
    const { currentPage, rowsPerPage } = window._logState;

    const start = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end   = Math.min(currentPage * rowsPerPage, total);

    if (note) note.innerText = `SHOWING ${start}-${end} OF ${total} ENTRIES`;
    if (!controls) return;

    const totalPages = Math.ceil(total / rowsPerPage);
    let html = '';

    if (totalPages > 1) {
        html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changeLogPage(${currentPage - 1})"><i data-lucide="chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changeLogPage(${i})">${i}</button>`;
        }
        html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changeLogPage(${currentPage + 1})"><i data-lucide="chevron-right"></i></button>`;
    }

    controls.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

window.changeLogPage = (page) => {
    window._logState.currentPage = page;
    renderTable();
};
