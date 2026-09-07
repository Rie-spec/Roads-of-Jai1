/* AdminProjectDocuments.js */

import { db } from '../firebase-config.js';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    orderBy, 
    query, 
    serverTimestamp, 
    doc, 
    updateDoc, 
    deleteDoc 
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
        console.log('Authenticated for Admin Project Documents:', currentUser?.email);
        
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
        
        initAdminDocsModule();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://objlgzvgzshvtgwokiux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxnenZnenNodnRnd29raXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Mzg5MTQsImV4cCI6MjA5NDMxNDkxNH0.im_eJJ4IqCJFEs2u2NjovbcHQChiHly_zS0DoDHAPWo';
const SUPABASE_BUCKET   = 'project_documents';

let _supabaseClient = null;
const getSupabaseClient = () => {
    if (!_supabaseClient) {
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase SDK not loaded. Add the CDN script before your module.');
        }
        _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabaseClient;
};

// ─── STATE ────────────────────────────────────────────────────────────────────
let documents    = [];
let projects     = [];
let currentPage  = 1;
const itemsPerPage = 8;
let isEditing    = false;
let editDocId    = null;
let isUploading  = false;

window._adminDocState = {
    deleteMode:       false,
    selectedToDelete: new Set()
};

// ─── ELEMENTS ─────────────────────────────────────────────────────────────────
const recordsContainer  = document.getElementById('recordsContainer');
const searchInput       = document.getElementById('searchInput');
const typeFilter        = document.getElementById('typeFilter');
const uploadForm        = document.getElementById('uploadForm');
const dropZone          = document.getElementById('dropZone');
const fileInput         = document.getElementById('fileInput');
const fileNameDisplay   = document.getElementById('fileNameDisplay');
const uploadModal       = document.getElementById('uploadModal');
const detailsModal      = document.getElementById('detailsModal');
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const successToast      = document.getElementById('successToast');
const loadingOverlay    = document.getElementById('loadingOverlay');
const projectSelect     = document.getElementById('docProject');

// ─── INIT ─────────────────────────────────────────────────────────────────────
function initAdminDocsModule() {
    if (window.lucide) {
        try { lucide.createIcons(); } catch (e) {}
    }
    setupListeners();
    loadProjects();
    listenToDocuments();
    initNotifications(db);
}

// ─── LISTENERS ────────────────────────────────────────────────────────────────
const setupListeners = () => {
    document.getElementById('openUploadModalBtn')?.addEventListener('click', () => {
        isEditing = false;
        editDocId = null;
        if (uploadForm) uploadForm.reset();
        const modalTitle    = uploadModal?.querySelector('.m-title');
        const submitBtnText = document.getElementById('submitBtn')?.querySelector('span');
        if (modalTitle)    modalTitle.textContent    = 'UPLOAD PROJECT DOCUMENT';
        if (submitBtnText) submitBtnText.textContent = 'SAVE PROJECT ENTRY';
        resetFileUI();

        if (uploadModal) {
            uploadModal.style.display = 'flex';
            setTimeout(() => uploadModal.classList.add('active'), 10);
            document.body.classList.add('modal-open');
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.m-close') || e.target.closest('.btn.cancel') || e.target.closest('#closeDetailsBtn') || e.target.closest('#cancelUploadBtn') || e.target.closest('#cancelDeleteBtn')) {
            closeAllModals();
        }

        const viewBtn = e.target.closest('.view-btn');
        if (viewBtn) {
            const id = viewBtn.dataset.viewId;
            if (id) window.viewRecord(id);
            return;
        }

        const delSelect = e.target.closest('.delete-select-btn');
        if (delSelect) {
            const id = delSelect.dataset.id;
            if (window._adminDocState.selectedToDelete.has(id)) {
                window._adminDocState.selectedToDelete.delete(id);
            } else {
                window._adminDocState.selectedToDelete.add(id);
            }
            const btnText = document.querySelector('#deleteModeBtn span');
            if (btnText) btnText.innerText = `Confirm Delete (${window._adminDocState.selectedToDelete.size})`;
            renderTable();
        }

        const deleteToggle = e.target.closest('#deleteModeBtn');
        if (deleteToggle) {
            if (!window._adminDocState.deleteMode) {
                window._adminDocState.deleteMode = true;
                window._adminDocState.selectedToDelete.clear();
                deleteToggle.classList.add('active');
                deleteToggle.querySelector('span').innerText = 'Confirm Delete (0)';
            } else {
                if (window._adminDocState.selectedToDelete.size > 0) {
                    if (deleteConfirmModal) {
                        deleteConfirmModal.style.display = 'flex';
                        setTimeout(() => deleteConfirmModal.classList.add('active'), 10);
                        document.body.classList.add('modal-open');
                    }
                } else {
                    exitDeleteMode();
                }
            }
            renderTable();
        }

        if (e.target.closest('#confirmDeleteBtn')) {
            executeDeletion();
        }
    });

    if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });
    if (typeFilter)  typeFilter.addEventListener('change',  () => { currentPage = 1; renderTable(); });

    const refreshBtn = document.getElementById('refreshTableBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const btnIcon = refreshBtn.querySelector('svg');
            if (btnIcon) {
                const currentRot = (parseInt(refreshBtn.dataset.rotation || '0')) + 360;
                refreshBtn.dataset.rotation = currentRot;
                btnIcon.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                btnIcon.style.transform  = `rotate(${currentRot}deg)`;
            }
            renderTable();
        });
    }

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelection(e.dataTransfer.files);
            }
        });

        // ── FIX: prevent double file picker open ──────────────────────────────
        dropZone.addEventListener('click', (e) => {
            if (e.target === fileInput) return;
            fileInput.click();
        });
    }

    if (fileInput) {
        // ── FIX: stop click bubbling back up to dropZone ──────────────────────
        fileInput.addEventListener('click', (e) => e.stopPropagation());
        fileInput.addEventListener('change', (e) => handleFileSelection(e.target.files));
    }

    if (uploadForm) uploadForm.addEventListener('submit', handleUpload);
};

const closeAllModals = () => {
    const modals = [uploadModal, detailsModal, deleteConfirmModal];
    modals.forEach(m => {
        if (m) {
            m.classList.remove('active');
            setTimeout(() => m.style.display = 'none', 300);
        }
    });
    document.body.classList.remove('modal-open');
};

const exitDeleteMode = () => {
    window._adminDocState.deleteMode = false;
    window._adminDocState.selectedToDelete.clear();
    const deleteBtn = document.getElementById('deleteModeBtn');
    if (deleteBtn) {
        deleteBtn.classList.remove('active');
        deleteBtn.querySelector('span').innerText = 'Delete Doc';
    }
    renderTable();
};

const executeDeletion = async () => {
    const ids = Array.from(window._adminDocState.selectedToDelete);
    if (ids.length === 0) return;

    const btn = document.getElementById('confirmDeleteBtn');
    const originalText = btn.innerText;
    btn.innerText = 'DELETING...';
    btn.disabled  = true;

    try {
        for (const id of ids) {
            const docData = documents.find(d => d.id === id);
            if (docData?.supabasePath) {
                await getSupabaseClient().storage
                    .from(SUPABASE_BUCKET)
                    .remove([docData.supabasePath]);
            }
            await deleteDoc(doc(db, "ProjectDocuments", id));
        }
        showToast(`Successfully deleted ${ids.length} document(s)`);
        exitDeleteMode();
        closeAllModals();
    } catch (err) {
        console.error("Deletion failed:", err);
        alert(`Deletion failed. ${err.message}`);
    } finally {
        if (btn) {
            btn.innerText = originalText;
            btn.disabled  = false;
        }
    }
};

const showToast = (msg) => {
    if (successToast) {
        successToast.querySelector('span').textContent = msg;
        successToast.style.display = 'flex';
        setTimeout(() => successToast.classList.add('active'), 10);
        setTimeout(() => {
            successToast.classList.remove('active');
            setTimeout(() => successToast.style.display = 'none', 500);
        }, 3000);
    }
};

window.openEditDocument = (id) => {
    const docData = documents.find(d => d.id === id);
    if (!docData) return;

    isEditing = true;
    editDocId = id;

    const docTitle = document.getElementById('docTitle');
    if (docTitle) docTitle.value = docData.documentTitle || docData.title || '';

    const docProj = document.getElementById('docProject');
    if (docProj) docProj.value = docData.projectId || '';

    const docDesc = document.getElementById('docDescription');
    if (docDesc) docDesc.value = docData.description || '';

    if (fileNameDisplay) fileNameDisplay.innerHTML = `<span style="color: #64748b;">Current File:</span> <span style="color: #1e293b; font-weight: 700;">${docData.fileName || 'document.file'}</span>`;
    if (fileInput) fileInput.required = false;

    const modalTitle    = uploadModal?.querySelector('.m-title');
    const submitBtnText = document.getElementById('submitBtn')?.querySelector('span');
    if (modalTitle)    modalTitle.textContent    = 'EDIT PROJECT DOCUMENT';
    if (submitBtnText) submitBtnText.textContent = 'UPDATE DOCUMENT';

    if (uploadModal) {
        uploadModal.style.display = 'flex';
        setTimeout(() => uploadModal.classList.add('active'), 10);
        document.body.classList.add('modal-open');
    }
};

const handleFileSelection = (files) => {
    if (files.length > 0) {
        const fileName = files[0].name;
        if (fileNameDisplay) fileNameDisplay.innerHTML = `<span style="color: #1e293b;">Selected:</span> <span style="color: #78350f; text-decoration: underline; font-weight: 800;">${fileName}</span>`;

        const iconContainer = document.querySelector('.upload-icon');
        if (iconContainer) {
            iconContainer.innerHTML = '<i data-lucide="check-circle" style="width:32px; height:32px;"></i>';
            iconContainer.style.color           = '#16a34a';
            iconContainer.style.backgroundColor = '#f0fdf4';
            iconContainer.style.borderColor     = '#bbf7d0';
        }
        if (window.lucide) lucide.createIcons();
    } else {
        resetFileUI();
    }
};

const resetFileUI = () => {
    if (!fileNameDisplay) return;
    fileNameDisplay.innerHTML = `<span>Click to browse</span> or drag file here`;

    const iconContainer = document.querySelector('.upload-icon');
    if (iconContainer) {
        iconContainer.innerHTML = '<i data-lucide="cloud-upload" style="width:32px; height:32px;"></i>';
        iconContainer.style.color           = '#78350f';
        iconContainer.style.backgroundColor = '#ffffff';
        iconContainer.style.borderColor     = 'transparent';
    }
    if (fileInput) fileInput.value = '';
    if (fileInput) fileInput.required = !isEditing;
    if (window.lucide) lucide.createIcons();
};

// ─── FIRESTORE ────────────────────────────────────────────────────────────────
const loadProjects = () => {
    onSnapshot(collection(db, "MaintenanceProjects"), (snapshot) => {
        projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        populateProjectSelect();
    });
};

const populateProjectSelect = () => {
    if (!projectSelect) return;
    const currentVal = projectSelect.value;
    projectSelect.innerHTML = '<option value="" disabled selected>Select Project...</option>';

    projects.forEach(p => {
        const opt = document.createElement('option');
        opt.value         = p.id;
        opt.dataset.title = p.projectTitle || p.title;
        opt.textContent   = p.projectTitle || p.title;
        projectSelect.appendChild(opt);
    });

    if (currentVal) projectSelect.value = currentVal;
};

const listenToDocuments = () => {
    const q = query(collection(db, "ProjectDocuments"), orderBy("uploadedAt", "desc"));
    onSnapshot(q, (snapshot) => {
        documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTable();

        const urlParams = new URLSearchParams(window.location.search);
        const openId = urlParams.get('id');
        if (openId && !window._docAutoOpened) {
            const exists = documents.find(d => d.id === openId);
            if (exists) { window._docAutoOpened = true; window.viewRecord(openId); }
        }
    });
};

// ─── SUPABASE UPLOAD ──────────────────────────────────────────────────────────
const uploadToSupabase = async (file, folder = 'ProjectDocuments') => {
    const ext          = file.name.split('.').pop().toLowerCase();
    const timestamp    = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath     = `${folder}/${timestamp}_${safeFileName}`;

    const { data, error } = await getSupabaseClient().storage
        .from(SUPABASE_BUCKET)
        .upload(filePath, file, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
        });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data: urlData } = getSupabaseClient().storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(filePath);

    return {
        url:          urlData.publicUrl,
        publicId:     filePath,
        resourceType: file.type,
        format:       ext
    };
};
// ─────────────────────────────────────────────────────────────────────────────

function renderTable() {
    if (!recordsContainer) return;

    const queryStr     = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedType = typeFilter  ? typeFilter.value : "All";

    const filteredDocs = documents.filter(doc => {
        const docTitle = doc.documentTitle || doc.title || "";
        const matchesSearch = docTitle.toLowerCase().includes(queryStr) || (doc.projectTitle || "").toLowerCase().includes(queryStr);
        const matchesType   = selectedType === 'All' || doc.fileType === selectedType;
        return matchesSearch && matchesType;
    });

    const totalPages    = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
    const startIndex    = (currentPage - 1) * itemsPerPage;
    const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage);

    recordsContainer.innerHTML = '';

    if (paginatedDocs.length === 0) {
        recordsContainer.innerHTML = '<div class="records-placeholder">No documents found.</div>';
    } else {
        paginatedDocs.forEach(data => {
            const isSelected = window._adminDocState.selectedToDelete.has(data.id);
            const row = document.createElement('div');
            row.className = `record-row ${isSelected ? 'to-delete' : ''}`;

            let displayDate = 'N/A';
            if (data.uploadedAt) {
                const d = data.uploadedAt.toDate ? data.uploadedAt.toDate() : new Date(data.uploadedAt);
                displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }

            let actionHtml = '';
            if (window._adminDocState.deleteMode) {
                actionHtml = `
                    <button class="action-btn delete-select-btn ${isSelected ? 'selected' : ''}" data-id="${data.id}">
                        ${isSelected
                            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
                        }
                    </button>
                `;
            } else {
                actionHtml = `
                    <button type="button" class="action-btn view-btn" data-view-id="${data.id}" title="View Details">
                        <i data-lucide="eye" style="width:20px; height:20px;"></i>
                    </button>
                `;
            }

            row.innerHTML = `
                <div class="proj-info">
                    <span class="proj-name-main">${data.projectTitle || 'Unknown'}</span>
                    <div class="proj-id-sub">REF: ${data.id.substring(0, 8)}</div>
                </div>
                <div class="doc-title font-medium">${data.documentTitle || data.title || 'Untitled'}</div>
                <div class="doc-type">
                    <span class="status-badge" style="background: rgba(120, 53, 15, 0.1); color: #78350f;">${data.fileType}</span>
                </div>
                <div class="doc-date text-slate-500">${displayDate}</div>
                <div class="actions-col" style="text-align: right;">
                    ${actionHtml}
                </div>
            `;

            recordsContainer.appendChild(row);
        });
    }

    const endNum   = Math.min(startIndex + itemsPerPage, filteredDocs.length);
    const startNum = filteredDocs.length === 0 ? 0 : startIndex + 1;
    const showingTextLabel = document.getElementById('showingText');
    if (showingTextLabel) showingTextLabel.innerText = `SHOWING ${startNum}-${endNum} OF ${filteredDocs.length} DOCUMENTS`;

    renderPagination(totalPages);
    if (window.lucide) lucide.createIcons();
}

function renderPagination(totalPages) {
    const container = document.getElementById('paginationControls');
    if (!container) return;

    container.innerHTML = '';
    if (totalPages <= 1 && documents.length <= itemsPerPage) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>';
    prevBtn.disabled  = currentPage === 1;
    prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
    container.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick   = () => { currentPage = i; renderTable(); };
        container.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>';
    nextBtn.disabled  = currentPage === totalPages;
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderTable(); } });
    container.appendChild(nextBtn);

    if (window.lucide) lucide.createIcons();
}

window.viewRecord = (id) => {
    const docData = documents.find(d => d.id === id);
    if (!docData) return;

    const vDocTitle = document.getElementById('viewDocTitle');
    if (vDocTitle) vDocTitle.textContent = docData.documentTitle || docData.title || 'Untitled';

    const vDocProj = document.getElementById('viewDocProject');
    if (vDocProj) vDocProj.textContent = docData.projectTitle || 'N/A';

    const vFileType = document.getElementById('viewFileType');
    if (vFileType) vFileType.textContent = docData.fileType || 'FILE';

    let displayDate = 'N/A', editDate = 'N/A';
    if (docData.uploadedAt) {
        const d = docData.uploadedAt.toDate ? docData.uploadedAt.toDate() : new Date(docData.uploadedAt);
        displayDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (docData.updatedAt) {
        const d = docData.updatedAt.toDate ? docData.updatedAt.toDate() : new Date(docData.updatedAt);
        editDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const createdByEl = document.getElementById('viewCreatedBy');
    if (createdByEl) createdByEl.textContent = `Created by: ${docData.uploadedBy || 'District Engineer'}`;

    const uploadDateMetaEl = document.getElementById('viewUploadDateMeta');
    if (uploadDateMetaEl) uploadDateMetaEl.textContent = `Uploaded: ${displayDate}`;

    const editedDateEl = document.getElementById('viewEditedDate');
    if (editedDateEl) editedDateEl.textContent = docData.updatedAt ? `Edited: ${editDate}` : '';

    const vDesc = document.getElementById('viewDescription');
    if (vDesc) vDesc.textContent = docData.description || 'No description provided.';

    const fileLink = document.getElementById('viewFileLink');
    if (fileLink) {
        fileLink.href   = docData.fileUrl || '#';
        fileLink.target = '_blank';
        fileLink.rel    = 'noopener noreferrer';
        const fileLinkSpan = fileLink.querySelector('span');
        if (fileLinkSpan) fileLinkSpan.textContent = docData.fileName || 'View Attachment';
        else fileLink.textContent = docData.fileName || 'View Attachment';

        const imageTypes = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'];
        const previewContainer = document.getElementById('viewFilePreview');
        if (previewContainer) {
            const fileTypeUpper = (docData.fileType || '').toUpperCase();

            if (imageTypes.includes(fileTypeUpper) && docData.fileUrl) {
                previewContainer.innerHTML = `<img src="${docData.fileUrl}" alt="${docData.documentTitle || docData.title}" style="max-width:100%; border-radius:8px; margin-top:12px;" />`;
                previewContainer.style.display = 'block';

            } else if (fileTypeUpper === 'PDF' && docData.fileUrl) {
                previewContainer.innerHTML = `
                    <div style="margin-top:12px;">
                        <div style="font-weight:700; color:#1e293b; font-size:13px; margin-bottom:8px;">${docData.fileName || 'Document.pdf'}</div>
                        <iframe src="${docData.fileUrl}" width="100%" height="500px"
                            style="border:1.5px solid #c4a882; border-radius:10px; display:block;" frameborder="0"></iframe>
                        <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                            <a href="${docData.fileUrl}" target="_blank" rel="noopener noreferrer"
                               style="flex:1; min-width:120px; display:inline-flex; align-items:center; justify-content:center;
                                      gap:7px; background:#78350f; color:#fff; padding:10px 18px; border-radius:7px;
                                      font-size:12px; font-weight:800; text-decoration:none; letter-spacing:0.04em;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                OPEN IN NEW TAB
                            </a>
                            <a href="${docData.fileUrl}" download="${docData.fileName || 'document.pdf'}"
                               style="flex:1; min-width:120px; display:inline-flex; align-items:center; justify-content:center;
                                      gap:7px; background:#fff; color:#78350f; padding:10px 18px; border-radius:7px;
                                      font-size:12px; font-weight:800; text-decoration:none; border:1.5px solid #c4a882; letter-spacing:0.04em;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                DOWNLOAD
                            </a>
                        </div>
                    </div>`;
                previewContainer.style.display = 'block';

            } else if (docData.fileUrl) {
                previewContainer.innerHTML = `
                    <div style="margin-top:12px; padding:16px; background:#f8f4ef; border:1.5px dashed #c4a882; border-radius:10px; display:flex; align-items:center; gap:12px;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                            <polyline points="13 2 13 9 20 9"/>
                        </svg>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#1e293b; font-size:13px;">${docData.fileName || 'Document'}</div>
                            <div style="color:#78350f; font-size:12px; margin-top:2px;">${docData.fileType || 'FILE'} Document</div>
                        </div>
                        <a href="${docData.fileUrl}" target="_blank" rel="noopener noreferrer"
                           style="display:inline-flex; align-items:center; gap:6px; background:#78350f; color:#fff; padding:8px 16px;
                                  border-radius:6px; font-size:12px; font-weight:700; text-decoration:none; white-space:nowrap;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Download
                        </a>
                    </div>`;
                previewContainer.style.display = 'block';

            } else {
                previewContainer.innerHTML = '';
                previewContainer.style.display = 'none';
            }
        }
    }

    const headerTitle = document.getElementById('viewTitle');
    if (headerTitle) headerTitle.textContent = 'DOCUMENT DETAILS';

    const editBtn = document.getElementById('editDocumentBtn');
    if (editBtn) {
        editBtn.onclick = () => {
            closeAllModals();
            setTimeout(() => window.openEditDocument && window.openEditDocument(id), 350);
        };
    }

    if (detailsModal) {
        detailsModal.style.display = 'flex';
        setTimeout(() => detailsModal.classList.add('active'), 10);
        document.body.classList.add('modal-open');
    }
};

// ─── MAIN UPLOAD HANDLER ──────────────────────────────────────────────────────
const handleUpload = async (e) => {
    e.preventDefault();
    if (isUploading) return;
    isUploading = true;

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = true;
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    try {
        const file = fileInput.files[0];
        let fileUrl          = null;
        let supabasePath     = null;
        let fileResourceType = null;
        let fileName         = null;
        let ext              = null;

        const projectTitleSelection = projectSelect.options[projectSelect.selectedIndex].dataset.title;

        if (file) {
            ext      = file.name.split('.').pop().toUpperCase();
            fileName = file.name;

            const uploadResult = await uploadToSupabase(file, `ProjectDocuments/${projectTitleSelection}`);
            fileUrl          = uploadResult.url;
            supabasePath     = uploadResult.publicId;
            fileResourceType = uploadResult.resourceType;
        }

        const projectId    = projectSelect.value;
        const projectTitle = projectTitleSelection;

        const docPayload = {
            documentTitle: document.getElementById('docTitle').value,
            projectId,
            projectTitle,
            description:   document.getElementById('docDescription').value,
            updatedAt:     serverTimestamp()
        };

        if (file) {
            docPayload.fileType         = ext;
            docPayload.fileName         = fileName;
            docPayload.fileUrl          = fileUrl;
            docPayload.supabasePath     = supabasePath;
            docPayload.fileResourceType = fileResourceType;
        }

        if (isEditing && editDocId) {
            await updateDoc(doc(db, "ProjectDocuments", editDocId), docPayload);
            await logNotification(db, {
                type: 'edit',
                entity: 'document',
                title: 'Document Updated',
                message: `"${docPayload.documentTitle}" for "${projectTitle}" was updated.`
            });
            showToast("Document successfully updated");
        } else {
            if (!file) throw new Error("No file selected");
            docPayload.uploadedBy = currentProfile?.username || "Andrei Admin";
            docPayload.uploadedAt = serverTimestamp();
            await addDoc(collection(db, "ProjectDocuments"), docPayload);
            await logNotification(db, {
                type: 'create',
                entity: 'document',
                title: 'Document Uploaded',
                message: `"${docPayload.documentTitle}" was uploaded for "${projectTitle}".`
            });
            showToast("New document successfully saved");
        }

        closeAllModals();
        if (uploadForm) uploadForm.reset();
        resetFileUI();
        currentPage = 1;

    } catch (err) {
        console.error("Error:", err);
        alert("Operation failed: " + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
        isUploading = false;
    }
};
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // checkAuth call is outside
});
