/* AdminMonthlyUpdates.js */

import { db, auth } from '../firebase-config.js';
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
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initNotifications, logNotification } from './notifications.js';
import { requireRole } from '../auth-guard.js';

// ── Auth Guard ─────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;

async function checkAuth() {
    try {
        const { user, profile } = await requireRole(['Engineer', 'Admin', 'Administrator']);
        window._isAdmin = (profile.role === 'admin' || profile.role === 'administrator' || profile.role === 'Admin');
        currentUser = user;
        currentProfile = profile;
        console.log('Authenticated for Monthly Updates:', currentUser?.email);
        
        // Hide UI elements if not Admin
        const delBtn = document.getElementById('deleteModeBtn');
        const newBtn = document.getElementById('newUpdateBtn') || document.getElementById('newBtn');
        
        if (!window._isAdmin) {
            if (delBtn) delBtn.style.display = 'none';
            if (newBtn) newBtn.style.display = 'none';
        } else {
            if (delBtn) delBtn.style.display = 'flex';
            if (newBtn) newBtn.style.display = 'flex';
        }
        
        initAdminMonthlyModule();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

// 2. Global State Management
window._muState = {
    allRecords: [],
    allEngineers: [], // Add Engineers store
    currentPage: 1,
    rowsPerPage: 8,
    allProjects: [],
    allLGUs: [], // Add LGU store
    selectedId: null,
    deleteMode: false,
    selectedToDelete: new Set(),
    mediaToDelete: []
};

// Helper to get Engineer Display Name
const getEngineerDisplayName = (idOrName) => {
    if (!idOrName) return 'Unassigned';
    if (!window._muState.allEngineers) return idOrName;
    
    const eng = window._muState.allEngineers.find(e => 
        e.id === idOrName || 
        e.FullName === idOrName || 
        e.Name === idOrName
    );
    
    if (eng) {
        const fName = eng.firstName || '';
        const lName = eng.lastName || '';
        const fullName = `${fName} ${lName}`.trim();
        return fullName ? `Engr. ${fullName}` : (eng.FullName || eng.Name || eng.username || idOrName);
    }
    return idOrName;
};

// 3. UI Selectors
const recordsBody = document.getElementById('muTableBody');
const searchInput = document.getElementById('muSearch');
const getFormModal = () => document.getElementById('muFormModal');
const getDetailsPanel = () => document.getElementById('muDetailsPanel');
const getDeleteModal = () => document.getElementById('deleteConfirmModal');

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://objlgzvgzshvtgwokiux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxnenZnenNodnRnd29raXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzg5MTQsImV4cCI6MjA5NDMxNDkxNH0.im_eJJ4IqCJFEs2u2NjovbcHQChiHly_zS0DoDHAPWo';
const SUPABASE_BUCKET   = 'project_documents';

let _supabaseClient = null;
const getSupabaseClient = () => {
    if (!_supabaseClient) {
        if (typeof supabase === 'undefined') throw new Error('Supabase SDK not loaded.');
        _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabaseClient;
};

// Upload Elements
const muDropZone = document.getElementById('muDropZone');
const muFileInput = document.getElementById('muFileInput');
const muFileNameDisplay = document.getElementById('muFileNameDisplay');

// ─── Initialization ──────────────────────────────────────────────────────────
function initAdminMonthlyModule() {
    initFirestoreListener();
    setupUploadListeners();
    initNotifications(db);
    bindEvents();
}

function initFirestoreListener() {
    const updatesRef = collection(db, "MonthlyUpdates");
    const q = query(updatesRef, orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        window._muState.allRecords = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTableRows();

        const urlParams = new URLSearchParams(window.location.search);
        const openId = urlParams.get('id');
        if (openId && !window._muAutoOpened) {
            const exists = window._muState.allRecords.find(r => r.id === openId);
            if (exists) {
                window._muAutoOpened = true;
                window.viewRecord(openId);
            }
        }
    }, (error) => {
        console.error("Firestore Listener Error:", error);
        if (error.code === 'failed-precondition') {
            onSnapshot(collection(db, "MonthlyUpdates"), (snap2) => {
                window._muState.allRecords = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
                window._muState.allRecords.sort((a,b) => {
                    const dA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt || 0);
                    const dB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt || 0);
                    return dB - dA;
                });
                renderTableRows();
            });
        } else if (recordsBody) {
            recordsBody.innerHTML = `<div class="records-placeholder" style="color:red;">Error loading records: ${error.message}</div>`;
        }
    });

    onSnapshot(collection(db, "MaintenanceProjects"), (snapshot) => {
        window._muState.allProjects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        populateProjectDropdowns();
    });

    onSnapshot(collection(db, "LGUs"), (snapshot) => {
        window._muState.allLGUs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const muniSelect = document.getElementById('filterMunicipality');
        if (muniSelect) {
            const firstOpt = muniSelect.options[0];
            muniSelect.innerHTML = '';
            muniSelect.appendChild(firstOpt);
            
            window._muState.allLGUs.sort((a,b) => (a.municipalityName||"").localeCompare(b.municipalityName||"")).forEach(lgu => {
                const opt = document.createElement('option');
                opt.value = lgu.id;
                opt.textContent = lgu.municipalityName;
                muniSelect.appendChild(opt);
            });
        }
        renderTableRows();
    });

    onSnapshot(collection(db, "Engineers"), (snapshot) => {
        window._muState.allEngineers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTableRows();
    });
}

function populateProjectDropdowns() {
    const projSelects = [document.getElementById('filterProject'), document.getElementById('muFormProjectId')];
    projSelects.forEach(sel => {
        if (!sel) return;
        const firstOpt = sel.options[0];
        sel.innerHTML = '';
        sel.appendChild(firstOpt);
        
        window._muState.allProjects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.projectTitle || p.title;
            sel.appendChild(opt);
        });
    });
}

function bindEvents() {
    const startSearch = document.getElementById('muSearch') || document.getElementById('tableSearch');
    startSearch?.addEventListener('input', () => {
        window._muState.currentPage = 1;
        renderTableRows();
    });

    document.getElementById('filterProject')?.addEventListener('change', renderTableRows);
    document.getElementById('filterMunicipality')?.addEventListener('change', renderTableRows);
    document.getElementById('filterMonth')?.addEventListener('change', renderTableRows);
    document.getElementById('filterSort')?.addEventListener('change', renderTableRows);
    document.getElementById('filterDateStart')?.addEventListener('change', () => { window._muState.currentPage = 1; renderTableRows(); });
    document.getElementById('filterDateEnd')?.addEventListener('change', () => { window._muState.currentPage = 1; renderTableRows(); });

    document.getElementById('dateFilterBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const shell = document.getElementById('dateRangeShell');
        if (shell) shell.style.display = shell.style.display === 'none' ? 'flex' : 'none';
    });

    document.addEventListener('click', (e) => {
        const shell = document.getElementById('dateRangeShell');
        const btn = document.getElementById('dateFilterBtn');
        if (shell && !shell.contains(e.target) && !btn.contains(e.target)) {
            shell.style.display = 'none';
        }
    });

    document.getElementById('refreshBtn')?.addEventListener('click', resetFilters);

    document.getElementById('newUpdateBtn')?.addEventListener('click', openNewUpdateModal);
    document.getElementById('closeMUFormBtn')?.addEventListener('click', closeModals);
    document.getElementById('cancelMUBtn')?.addEventListener('click', closeModals);
    document.getElementById('closeMUDetailsBtn')?.addEventListener('click', closeModals);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeModals);
    document.getElementById('editMUBtn')?.addEventListener('click', () => {
        const id = window._muState.selectedId;
        closeModals();
        setTimeout(() => editRecord(id), 350);
    });

    document.getElementById('muFormProgress')?.addEventListener('input', (e) => {
        const progValEl = document.getElementById('muFormProgressVal');
        if (progValEl) progValEl.textContent = e.target.value + '%';
    });

    document.getElementById('deleteModeBtn')?.addEventListener('click', toggleDeleteMode);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', executeDeletion);

    const form = document.getElementById('muForm');
    if (form) form.addEventListener('submit', handleFormSubmit);
}

function renderTableRows() {
    if (!recordsBody) return;
    
    const activeSearch = document.getElementById('muSearch') || document.getElementById('tableSearch');
    const searchTerm = activeSearch?.value?.toLowerCase() || "";
    const filterProjId = document.getElementById('filterProject')?.value || "All";
    const filterMuni = document.getElementById('filterMunicipality')?.value || "All";
    const filterMonth = document.getElementById('filterMonth')?.value || "All";
    const filterSort = document.getElementById('filterSort')?.value || "Newest";
    const startDate = document.getElementById('filterDateStart')?.value || "";
    const endDate = document.getElementById('filterDateEnd')?.value || "";

    let filtered = window._muState.allRecords.filter(data => {
        const lguId = data.lguId || data.municipality || '';
        const targetLgu = window._muState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
        const muniName = targetLgu ? targetLgu.municipalityName : lguId;

        const content = `${data.projectTitle || ""} ${data.engineer || ""} ${muniName}`.toLowerCase();
        const matchesSearch = content.includes(searchTerm);
        const matchesProj = filterProjId === "All" || data.projectId === filterProjId;
        const matchesMuni = filterMuni === "All" || lguId === filterMuni || (lguId).toLowerCase() === filterMuni.toLowerCase();
        const matchesMonth = filterMonth === "All" || (data.updateMonth && data.updateMonth.toString() === filterMonth);
        
        let matchesDate = true;
        const refDate = data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : "";
        if (startDate && endDate) {
            matchesDate = refDate >= startDate && refDate <= endDate;
        } else if (startDate) {
            matchesDate = refDate >= startDate;
        } else if (endDate) {
            matchesDate = refDate <= endDate;
        }
        
        return matchesSearch && matchesProj && matchesMuni && matchesMonth && matchesDate;
    });

    filtered.sort((a, b) => {
        if (filterSort === "A-Z") return (a.projectTitle || "").localeCompare(b.projectTitle || "");
        if (filterSort === "Z-A") return (b.projectTitle || "").localeCompare(a.projectTitle || "");
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
        if (filterSort === "Oldest") return dateA - dateB;
        return dateB - dateA;
    });

    const totalPages = Math.ceil(filtered.length / window._muState.rowsPerPage) || 1;
    const startIndex = (window._muState.currentPage - 1) * window._muState.rowsPerPage;
    const items = filtered.slice(startIndex, startIndex + window._muState.rowsPerPage);

    recordsBody.innerHTML = "";
    if (items.length === 0) {
        recordsBody.innerHTML = '<div class="records-placeholder">No records found.</div>';
    } else {
        items.forEach(data => {
            const lguId = data.lguId || data.municipality || '';
            const targetLgu = window._muState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
            const muniName = targetLgu ? targetLgu.municipalityName : lguId;

            const isSelected = window._muState.deleteMode && window._muState.selectedToDelete.has(data.id);
            const row = document.createElement('div');
            row.className = `record-row ${isSelected ? 'to-delete' : ''}`;
            
            let actionHtml = '';
            if (window._muState.deleteMode) {
                actionHtml = `<button class="action-btn delete-select-btn ${isSelected ? 'selected' : ''}" data-id="${data.id}">${isSelected ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'}</button>`;
            } else {
                actionHtml = `<button type="button" class="action-btn view-btn" onclick="viewRecord('${data.id}')"><i data-lucide="eye" style="width:20px; height:20px;"></i></button>`;
            }

            row.innerHTML = `
                <div class="col"><div class="proj-name-main">${data.projectTitle || '---'}</div><div class="proj-id-sub">REF: ${data.id.substring(0,8)}</div></div>
                <div class="col font-medium">${getEngineerDisplayName(data.engineer)}</div>
                <div class="col font-medium">${muniName}</div>
                <div class="col"><span class="status-badge" style="background: rgba(120, 53, 15, 0.1); color: #78350f;">Month ${data.updateMonth || '-'}</span></div>
                <div class="col text-slate-500 text-sm">${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : '---'}</div>
                <div class="col"><div class="mu-progress-wrap"><div class="mu-progress-bar"><div class="mu-progress-fill" style="width: ${data.progressPercentage || 0}%"></div></div><div class="mu-progress-text">${data.progressPercentage || 0}% Completed</div></div></div>
                <div class="col actions-col" style="text-align: right;">${actionHtml}</div>`;
            
            if (window._muState.deleteMode) {
                row.addEventListener('click', (e) => {
                    if (!e.target.closest('.delete-select-btn')) {
                        toggleRecordSelection(data.id);
                    }
                });
            }

            recordsBody.appendChild(row);
        });
        
        if (window._muState.deleteMode) {
            document.querySelectorAll('.delete-select-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleRecordSelection(btn.dataset.id);
                });
            });
        }

        if (window.lucide) lucide.createIcons();
    }
    updatePaginationUI(filtered.length, totalPages);
}

function toggleRecordSelection(id) {
    if (window._muState.selectedToDelete.has(id)) {
        window._muState.selectedToDelete.delete(id);
    } else {
        window._muState.selectedToDelete.add(id);
    }
    const delModeBtn = document.getElementById('deleteModeBtn');
    if (delModeBtn) delModeBtn.querySelector('span').innerText = `Confirm Delete (${window._muState.selectedToDelete.size})`;
    renderTableRows();
}

function updatePaginationUI(totalItems, totalPages) {
    const note = document.getElementById('muRecordCount');
    const start = (window._muState.currentPage - 1) * window._muState.rowsPerPage + 1;
    const end = Math.min(window._muState.currentPage * window._muState.rowsPerPage, totalItems);
    if (note) note.textContent = `Showing ${totalItems > 0 ? start : 0}-${end} of ${totalItems} updates`;

    const paginationContainer = document.getElementById('muPagination');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = `<button class="page-btn" onclick="changePage(${window._muState.currentPage - 1})" ${window._muState.currentPage === 1 ? 'disabled' : ''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>`;
    for (let i = 1; i <= totalPages; i++) { paginationContainer.innerHTML += `<button class="page-btn ${i === window._muState.currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`; }
    paginationContainer.innerHTML += `<button class="page-btn" onclick="changePage(${window._muState.currentPage + 1})" ${window._muState.currentPage === totalPages ? 'disabled' : ''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>`;
}

window.changePage = (page) => {
    const totalPages = Math.ceil(window._muState.allRecords.length / window._muState.rowsPerPage);
    if (page < 1 || page > totalPages) return;
    window._muState.currentPage = page;
    renderTableRows();
};

window.viewRecord = async (id) => {
    const u = window._muState.allRecords.find(item => item.id === id);
    if (!u) return;
    const p = window._muState.allProjects.find(item => item.id === u.projectId);

    const statusBadge = document.getElementById('detailStatusBadge');
    if (statusBadge) {
        const status = p?.status || 'ONGOING';
        statusBadge.textContent = status.toUpperCase();
        statusBadge.style.background = status.toLowerCase() === 'finished' || status.toLowerCase() === 'completed' ? '#DCFCE7' : '#FEF3C7';
        statusBadge.style.color = status.toLowerCase() === 'finished' || status.toLowerCase() === 'completed' ? '#166534' : '#92400E';
    }

    const lguId = u.lguId || u.municipality || '';
    const targetLgu = window._muState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
    const muniName = targetLgu ? targetLgu.municipalityName : lguId;

    document.getElementById('detailProjectTitleHeader').textContent = u.projectTitle || '---';
    document.getElementById('detailCreatedBy').textContent = `Created by: ${getEngineerDisplayName(u.engineer)}`;
    document.getElementById('detailUploadDate').textContent = `Uploaded: ${u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '---'}`;
    document.getElementById('detailEditedDate').textContent = u.updatedAt?.toDate ? `Edited: ${u.updatedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : "N/A";
    document.getElementById('detailMonthReport').textContent = u.updateMonth ? `MONTH ${u.updateMonth}` : 'MONTH ---';
    document.getElementById('detailMunicipality').textContent = muniName;
    document.getElementById('detailStartDate').textContent = p?.startDate || 'TBD';
    document.getElementById('detailEndDate').textContent = p?.endDate || 'TBD';
    document.getElementById('detailSummary').textContent = u.summaryOfTextReports || 'No summary provided for this update.';

    const progVal = u.progressPercentage || 0;
    document.getElementById('detailProgressValue').textContent = progVal + '%';
    const circle = document.getElementById('detailProgressCircle');
    const circumference = 226;
    const offset = circumference - (progVal / 100 * circumference);
    if (circle) circle.style.strokeDashoffset = offset;

    const mediaList = document.getElementById('detailMediaList');
    const placeholder = document.getElementById('noAttachmentsPlaceholder');
    if (mediaList) mediaList.innerHTML = '';
    if (placeholder) placeholder.style.display = 'flex';

    // Fetch media from UpdatesMedia collection
    try {
        const mediaQ = query(collection(db, "UpdatesMedia"), where("monthlyUpdateId", "==", id));
        const mediaSnap = await getDocs(mediaQ);
        const mediaItems = mediaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fallback for legacy single file
        if (u.fileUrl && !mediaItems.find(m => m.filePath === u.fileUrl)) {
            mediaItems.unshift({
                fileName: u.fileName || 'Attachment',
                filePath: u.fileUrl,
                fileType: (u.fileName?.split('.').pop() || 'FILE').toUpperCase(),
                createdAt: u.createdAt
            });
        }

        if (mediaItems.length > 0) {
            if (placeholder) placeholder.style.display = 'none';
            mediaItems.forEach(item => {
                const isImage = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'].includes((item.fileType || '').toUpperCase());
                const isVideo = ['MP4', 'WEBM', 'OGG', 'MOV'].includes((item.fileType || '').toUpperCase());
                
                const card = document.createElement('div');
                card.className = 'mu-media-card';
                card.style.cssText = `
                    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
                    padding: 12px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px;
                `;
                
                let previewHtml = `
                    <div style="width: 48px; height: 48px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        <i data-lucide="file-text" style="width: 20px; height: 20px; color: #64748b;"></i>
                    </div>
                `;

                if (isImage) { previewHtml = `<div style="width: 48px; height: 48px; background: #f1f5f9; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;"><img src="${item.filePath}" style="width: 100%; height: 100%; object-fit: cover;"></div>`; }
                else if (isVideo) { previewHtml = `<div style="width: 48px; height: 48px; background: #f1f5f9; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;"><i data-lucide="play-circle" style="width: 20px; height: 20px; color: #64748b;"></i></div>`; }

                const truncate = (name, len = 20) => name.length > len ? name.substring(0, len-3) + '...' : name;

                card.innerHTML = `
                    ${previewHtml}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        <div style="font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;" title="${item.fileName}">${truncate(item.fileName)}</div>
                        <div style="font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.fileType} • ${item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : '---'}</div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button onclick="window.open('${item.filePath}', '_blank')" style="background: #f1f5f9; border: none; padding: 8px; border-radius: 8px; cursor: pointer; color: #475569;" title="View"><i data-lucide="eye" style="width: 16px; height: 16px;"></i></button>
                        <a href="${item.filePath}" download="${item.fileName}" style="background: #f1f5f9; border: none; padding: 8px; border-radius: 8px; cursor: pointer; color: #475569; display: flex; align-items: center;" title="Download"><i data-lucide="download" style="width: 16px; height: 16px;"></i></a>
                    </div>
                `;
                mediaList.appendChild(card);
            });
            if (window.lucide) lucide.createIcons();
        }
    } catch (err) { console.error("Error loading media:", err); }

    const panel = getDetailsPanel();
    if (panel) {
        panel.style.display = 'flex';
        setTimeout(() => panel.classList.add('active'), 10);
        document.body.classList.add('modal-open');
    }
    window._muState.selectedId = id;
};

window.editRecord = async (id) => {
    const u = window._muState.allRecords.find(item => item.id === id);
    if (!u) return;

    window._muState.selectedId = id;
    window._muState.mediaToDelete = [];
    document.getElementById('muFormTitle').textContent = 'Edit Monthly Update';
    document.getElementById('muFormSubTitle').textContent = 'RECORD EDIT FORM';
    document.getElementById('muFormProjectId').value = u.projectId || "";
    document.getElementById('muFormMonthNumber').value = u.updateMonth || "";
    document.getElementById('muFormProgress').value = u.progressPercentage || 0;
    document.getElementById('muFormProgressVal').textContent = (u.progressPercentage || 0) + '%';
    document.getElementById('muFormSummary').value = u.summaryOfTextReports || '';

    // Fetch and display existing media
    const mediaList = document.getElementById('existingMediaList');
    const container = document.getElementById('existingMediaContainer');
    if (mediaList) mediaList.innerHTML = '';
    if (container) container.style.display = 'block';

    try {
        const mediaQ = query(collection(db, "UpdatesMedia"), where("monthlyUpdateId", "==", id));
        const mediaSnap = await getDocs(mediaQ);
        
        const renderMediaCard = (mediaId, fileName, filePath, isLegacy = false) => {
            const card = document.createElement('div');
            card.className = 'mu-media-card';
            card.id = `media-card-${mediaId}`;
            card.style.cssText = `
                background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
                padding: 10px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;
            `;
            card.innerHTML = `
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 12px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${fileName}</div>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button type="button" onclick="window.open('${filePath}', '_blank')" style="background: #f1f5f9; border: none; padding: 6px; border-radius: 6px; cursor: pointer; color: #475569;" title="View"><i data-lucide="eye" style="width: 14px; height: 14px;"></i></button>
                    <button type="button" onclick="removeMedia('${mediaId}', ${isLegacy})" style="background: #fee2e2; border: none; padding: 6px; border-radius: 6px; cursor: pointer; color: #ef4444;" title="Remove"><i data-lucide="x" style="width: 14px; height: 14px;"></i></button>
                </div>
            `;
            mediaList.appendChild(card);
        };

        mediaSnap.docs.forEach(docSnap => {
            const item = docSnap.data();
            renderMediaCard(docSnap.id, item.fileName, item.filePath);
        });

        // Fallback for legacy single file
        if (u.fileUrl && !mediaSnap.docs.find(d => d.data().filePath === u.fileUrl)) {
            renderMediaCard('legacy', u.fileName || 'Attachment', u.fileUrl, true);
        }

        if (window.lucide) lucide.createIcons();
    } catch (err) { console.error("Error fetching media for edit:", err); }

    const now = new Date();
    const curDate = now.toISOString().split('T')[0];
    if (document.getElementById('muFormDateDisplay')) document.getElementById('muFormDateDisplay').textContent = curDate;
    if (document.getElementById('muFormDate')) document.getElementById('muFormDate').value = curDate;

    const overlay = getFormModal();
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('active'), 10);
        document.body.classList.add('modal-open');
    }
};

window.removeMedia = (mediaId, isLegacy = false) => {
    const card = document.getElementById(`media-card-${mediaId}`);
    if (card) {
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        
        const removeBtn = card.querySelector('button[title="Remove"]');
        if (removeBtn) removeBtn.style.display = 'none';
        
        // Add "Undo" button
        const undoBtn = document.createElement('button');
        undoBtn.type = 'button';
        undoBtn.innerHTML = '<span style="font-size: 10px; font-weight: 800;">UNDO</span>';
        undoBtn.style.cssText = 'background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 4px; color: #475569; cursor: pointer; pointer-events: auto;';
        undoBtn.onclick = (e) => {
            e.stopPropagation();
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            if (removeBtn) removeBtn.style.display = 'block';
            undoBtn.remove();
            window._muState.mediaToDelete = window._muState.mediaToDelete.filter(m => m.id !== mediaId);
        };
        
        const actionArea = card.querySelector('div[style*="display: flex; gap: 6px;"]') || card.lastElementChild;
        if (actionArea) actionArea.appendChild(undoBtn);
    }
    window._muState.mediaToDelete.push({ id: mediaId, isLegacy });
};

const closeModals = () => {
    ['muFormModal', 'muDetailsPanel', 'deleteConfirmModal'].forEach(id => {
        const m = document.getElementById(id);
        if (m) m.classList.remove('active');
    });
    document.body.classList.remove('modal-open');
    resetFileUI();
    setTimeout(() => {
        ['muFormModal', 'muDetailsPanel', 'deleteConfirmModal'].forEach(id => {
            const m = document.getElementById(id);
            if (m) m.style.display = 'none';
        });
    }, 300);
};

function openNewUpdateModal() {
    window._muState.selectedId = null;
    document.getElementById('muFormTitle').textContent = 'New Monthly Update';
    document.getElementById('muFormSubTitle').textContent = 'REPORT ENTRY FORM';
    const form = document.getElementById('muForm');
    if (form) form.reset();
    document.getElementById('muFormProgressVal').textContent = '0%';
    const now = new Date();
    const curDate = now.toISOString().split('T')[0];
    if (document.getElementById('muFormDateDisplay')) document.getElementById('muFormDateDisplay').textContent = curDate;
    if (document.getElementById('muFormDate')) document.getElementById('muFormDate').value = curDate;
    
    const container = document.getElementById('existingMediaContainer');
    if (container) container.style.display = 'none';

    resetFileUI();
    const overlay = getFormModal();
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('active'), 10);
        document.body.classList.add('modal-open');
    }
}

function resetFilters() {
    const search = document.getElementById('muSearch');
    if (search) search.value = "";
    ['filterDateStart', 'filterDateEnd'].forEach(id => { if (document.getElementById(id)) document.getElementById(id).value = ""; });
    ['filterMonth', 'filterProject', 'filterMunicipality'].forEach(id => { if (document.getElementById(id)) document.getElementById(id).value = "All"; });
    if (document.getElementById('filterSort')) document.getElementById('filterSort').value = "Newest";
    
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        const btnIcon = refreshBtn.querySelector('svg');
        if (btnIcon) {
            const currentRot = (parseInt(refreshBtn.dataset.rotation || '0')) + 360;
            refreshBtn.dataset.rotation = currentRot;
            btnIcon.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            btnIcon.style.transform = `rotate(${currentRot}deg)`;
        }
    }
    window._muState.currentPage = 1;
    renderTableRows();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('saveMUBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Saving...</span>';
    btn.disabled = true;

    const projectId = document.getElementById('muFormProjectId').value;
    const project = window._muState.allProjects.find(p => p.id === projectId);
    const isEdit = !!window._muState.selectedId;
    
    try {
        const files = muFileInput?.files;
        let uploadedMedia = [];

        if (files && files.length > 0) {
            btn.innerHTML = `<span>Uploading (0/${files.length})...</span>`;
            for (let i = 0; i < files.length; i++) {
                const uploadResult = await uploadToSupabase(files[i], `MonthlyUpdates/${project?.projectTitle || 'General'}`);
                uploadedMedia.push(uploadResult);
                btn.innerHTML = `<span>Uploading (${i+1}/${files.length})...</span>`;
            }
        }

        const updateData = {
            projectId: projectId,
            projectTitle: project?.projectTitle || project?.title || "Unknown Project",
            lguId: project?.lguId || project?.municipality || "N/A",
            engineer: project?.managingEngineerId || project?.engineer || "District Engineer",
            managingEngineerDocId: project?.managingEngineerDocId || null,
            updateMonth: document.getElementById('muFormMonthNumber').value,
            progressPercentage: parseInt(document.getElementById('muFormProgress').value) || 0,
            summaryOfTextReports: document.getElementById('muFormSummary').value,
            updatedAt: serverTimestamp(),
            createdBy: currentProfile?.username || "System"
        };

        let updateId = window._muState.selectedId;

        if (isEdit) {
            await updateDoc(doc(db, "MonthlyUpdates", updateId), updateData);
            await logNotification(db, { type: 'edit', entity: 'monthly_update', title: 'Monthly Update Edited', message: `Month ${updateData.updateMonth} update for "${updateData.projectTitle}" was edited.` });
        } else {
            updateData.createdAt = serverTimestamp();
            const docRef = await addDoc(collection(db, "MonthlyUpdates"), updateData);
            updateId = docRef.id;
            await logNotification(db, { type: 'create', entity: 'monthly_update', title: 'New Monthly Update Added', message: `Month ${updateData.updateMonth} update for "${updateData.projectTitle}" was submitted.` });
        }

        // Execute deferred deletions
        if (isEdit && window._muState.mediaToDelete.length > 0) {
            for (const m of window._muState.mediaToDelete) {
                if (m.isLegacy) {
                    await updateDoc(doc(db, "MonthlyUpdates", updateId), {
                        fileUrl: null,
                        fileName: null
                    });
                } else {
                    await deleteDoc(doc(db, "UpdatesMedia", m.id));
                }
            }
        }

        if (uploadedMedia.length > 0) {
            for (const m of uploadedMedia) {
                await addDoc(collection(db, "UpdatesMedia"), {
                    monthlyUpdateId: updateId,
                    fileName: m.fileName,
                    filePath: m.url,
                    fileType: m.fileType,
                    uploadedBy: currentProfile?.username || "Admin",
                    createdAt: serverTimestamp()
                });
            }
        }

        showTopToast(isEdit ? "Update modified successfully" : "New update saved successfully", 'create');
        closeModals();
    } catch (err) {
        console.error("Form error:", err);
        showTopToast("Failed to save update", 'delete');
    } finally { btn.innerHTML = originalText; btn.disabled = false; }
}

const uploadToSupabase = async (file, folder = 'MonthlyUpdates') => {
    const ext          = file.name.split('.').pop().toLowerCase();
    const timestamp    = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath     = `${folder}/${timestamp}_${safeFileName}`;
    const { data, error } = await getSupabaseClient().storage.from(SUPABASE_BUCKET).upload(filePath, file, { contentType: file.type || 'application/octet-stream', upsert: false });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
    const { data: urlData } = getSupabaseClient().storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
    return { url: urlData.publicUrl, filePath: filePath, fileName: file.name, fileType: ext.toUpperCase() };
};

async function executeDeletion() {
    const ids = Array.from(window._muState.selectedToDelete);
    if (!ids.length) return;
    
    const btn = document.getElementById('confirmDeleteBtn');
    const orig = btn.innerText;
    btn.innerText = 'DELETING...';
    btn.disabled = true;

    try {
        for (const id of ids) {
            await deleteDoc(doc(db, "MonthlyUpdates", id));
            await logNotification(db, { type: 'delete', entity: 'monthly_update', title: 'Update Deleted', message: `A monthly update record was deleted by Admin.` });
        }
        showTopToast(`${ids.length} records deleted successfully`, 'delete');
        exitDeleteMode();
        closeModals();
    } catch (err) {
        console.error("Delete error:", err);
        showTopToast("Deletion failed", 'delete');
    } finally {
        if (btn) {
            btn.innerText = orig;
            btn.disabled = false;
        }
    }
}

function toggleDeleteMode() {
    if (!window._muState.deleteMode) {
        window._muState.deleteMode = true;
        window._muState.selectedToDelete.clear();
        const btn = document.getElementById('deleteModeBtn');
        if (btn) {
            btn.classList.add('active');
            btn.querySelector('span').innerText = 'Confirm Delete (0)';
        }
    } else {
        if (window._muState.selectedToDelete.size > 0) {
            const modal = getDeleteModal();
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('active'), 10);
                document.body.classList.add('modal-open');
            }
        } else {
            exitDeleteMode();
        }
    }
    renderTableRows();
}

function exitDeleteMode() {
    window._muState.deleteMode = false;
    window._muState.selectedToDelete.clear();
    const btn = document.getElementById('deleteModeBtn');
    if (btn) {
        btn.classList.remove('active');
        btn.querySelector('span').innerText = 'Delete Update';
    }
    renderTableRows();
}

function showTopToast(message, type = 'create') {
    let toast = document.getElementById('topActionToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'topActionToast';
        toast.style.cssText = `position: fixed; top: 24px; left: 50%; transform: translateX(-50%) translateY(-20px); z-index: 99999; color: #fff; padding: 14px 24px; border-radius: 14px; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.9rem; opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease; pointer-events: none; white-space: nowrap;`;
        document.body.appendChild(toast);
    }
    const isDelete = type === 'delete';
    toast.style.background = isDelete ? '#ef4444' : '#22c55e';
    toast.style.boxShadow = isDelete ? '0 8px 24px rgba(239,68,68,0.35)' : '0 8px 24px rgba(34,197,94,0.35)';
    toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <polyline points="20 6 9 17 4 12"></polyline> </svg>${message}`;
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 3500);
}

const setupUploadListeners = () => {
    if (muDropZone) {
        muDropZone.onclick = () => muFileInput?.click();
        muDropZone.ondragover = (e) => { e.preventDefault(); muDropZone.classList.add('dragover'); };
        muDropZone.ondragleave = () => muDropZone.classList.remove('dragover');
        muDropZone.ondrop = (e) => { e.preventDefault(); muDropZone.classList.remove('dragover'); if (e.dataTransfer.files.length) { if(muFileInput) muFileInput.files = e.dataTransfer.files; handleFileSelection(e.dataTransfer.files); } };
    }
    if(muFileInput) muFileInput.onchange = (e) => handleFileSelection(e.target.files);
};

function handleFileSelection(files) {
    if (files.length > 0) {
        if (muFileNameDisplay) muFileNameDisplay.innerHTML = `<span style="color: #1e293b;">Selected:</span> <b>${files.length} file(s)</b>`;
        const icon = muDropZone?.querySelector('.upload-icon');
        if(icon) { icon.innerHTML = '<i data-lucide="check-circle"></i>'; icon.style.color = '#16a34a'; icon.style.backgroundColor = '#f0fdf4'; }
    } else resetFileUI();
    if (window.lucide) lucide.createIcons();
}

function resetFileUI() {
    if (muFileNameDisplay) muFileNameDisplay.innerHTML = `<span>Click to browse</span> or drag file here`;
    const icon = muDropZone?.querySelector('.upload-icon');
    if(icon) { icon.innerHTML = '<i data-lucide="cloud-upload"></i>'; icon.style.color = '#78350f'; icon.style.backgroundColor = 'transparent'; }
    if(muFileInput) muFileInput.value = '';
    if (window.lucide) lucide.createIcons();
}
