// AdminMaintenanceProject.js
import { db, auth } from '../../js/firebase-config.js';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { requireLogin } from '../../js/auth-guard.js';
import { initNotifications, logNotification } from '../../js/pages/notifications.js';

// ─── Auth Guard ─────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;

async function checkAuth() {
    try {
        const { user, profile } = await requireLogin();
        window._isAdmin = (profile.role === 'admin' || profile.role === 'administrator' || profile.role === 'Admin');
        currentUser = user;
        currentProfile = profile;
        console.log('Admin authenticated:', currentUser.email);
        
        // Hide UI elements if not Admin
        const delBtn = document.getElementById('deleteModeBtn');
        const newBtn = document.getElementById('newProjectBtn') || document.getElementById('newLGUBtn') || document.getElementById('newBtn');
        const printBtn = document.getElementById('printSelectedBtn');
        
        if (!window._isAdmin) {
            if (delBtn) delBtn.style.display = 'none';
            if (newBtn) newBtn.style.display = 'none';
        } else {
            if (delBtn) delBtn.style.display = 'flex';
            if (newBtn) newBtn.style.display = 'flex';
        }
        
        // Initialize Notifications
        try {
            initNotifications(db);
        } catch (err) {
            console.warn('Notification init failed (non-fatal):', err);
        }

        initFirestoreListener();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

console.log('AdminMaintenanceProject.js script starting...');

// ─── Global State ─────────────────────────────────────────────────────────────
window._projectState = window._projectState || {
    allProjects: [],
    filteredProjects: [],
    allRoads: [],
    allEngineers: [],
    selectedRoads: [],
    currentPage: 1,
    currentEditId: null,
    selectedEngineerId: null, // New field for relational link
    allLGUs: [], // Store LGU list for ID lookup
    backupRoads: [],
    subUnsubs: [],
    deleteMode: false,
    selectedProjects: new Set()
};

// Helper to get Engineer Display Name
const getEngineerDisplayName = (idOrName) => {
    if (!idOrName) return 'Unassigned';
    if (!window._projectState.allEngineers) return idOrName;
    
    const eng = window._projectState.allEngineers.find(e => 
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

let projectMap;
let roadLayers = {};

// ─── Map Setup ────────────────────────────────────────────────────────────────
const initProjectMap = () => {
    if (projectMap) return;
    const mapDiv = document.getElementById('projectDrawingMap');
    if (!mapDiv) return;
    projectMap = L.map('projectDrawingMap').setView([7.6, 125.7], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(projectMap);
    fetchRoadsToMap();
};

const fetchRoadsToMap = () => {
    if (!db) return;
    const q = collection(db, "RoadSections");
    onSnapshot(q, (snapshot) => {
        window._projectState.allRoads = [];
        snapshot.forEach((doc) => {
            window._projectState.allRoads.push({ id: doc.id, ...doc.data() });
        });
        renderRoadsOnMap();
    });
};

const renderRoadsOnMap = () => {
    if (!projectMap) return;
    Object.values(roadLayers).forEach(layer => projectMap.removeLayer(layer));
    roadLayers = {};
    window._projectState.allRoads.forEach(road => {
        const roadGeo = road.geojsonData || road.geoJSON;
        if (!roadGeo) return;
        try {
            const geoData = JSON.parse(roadGeo);
            const isSelected = window._projectState.selectedRoads.some(r => r.id === road.id);
            const layer = L.geoJSON(geoData, {
                style: {
                    color: isSelected ? '#ef4444' : '#78350f',
                    weight: isSelected ? 8 : 4,
                    opacity: isSelected ? 1 : 0.6
                }
            }).addTo(projectMap);
            layer.on('click', () => toggleRoadSelection(road));
            layer.bindTooltip(`${road.roadId || road.name} (${road.pavementType || 'N/A'})`, { sticky: true });
            roadLayers[road.id] = layer;
        } catch (e) {
            console.error("Error parsing road geojsonData", e);
        }
    });
};

const toggleRoadSelection = (road) => {
    const index = window._projectState.selectedRoads.findIndex(r => r.id === road.id);
    if (index === -1) {
        window._projectState.selectedRoads.push(road);
    } else {
        window._projectState.selectedRoads.splice(index, 1);
    }
    renderRoadsOnMap();
    renderSelectedRoadsList();
};

const renderSelectedRoadsList = () => {
    const listContainer = document.getElementById('selectedRoadsList');
    const titleEl = document.getElementById('selectedRoadsTitle');
    if (!listContainer || !titleEl) return;
    listContainer.innerHTML = '';
    const selected = window._projectState.selectedRoads;
    titleEl.innerText = `SELECTED ASSETS (${selected.length})`;
    if (selected.length === 0) {
        listContainer.innerHTML = '<p style="font-size: 11px; color: #94a3b8; text-align: center; padding: 15px;">No roads selected yet. Search or click on the map.</p>';
        return;
    }
    selected.forEach(road => {
        const nameVal = road.roadId || road.name || '---';
        const muniVal = road.lguId || road.municipality || '---';
        const item = document.createElement('div');
        item.style = "background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; position: relative;";
        item.innerHTML = `
            <div style="font-size: 11px; font-weight: 800; color: #1e293b; margin-bottom: 2px;">${nameVal.toUpperCase()}</div>
            <div style="font-size: 10px; font-weight: 600; color: #64748b; display: flex; gap: 8px;">
                <span>${muniVal}</span><span>•</span><span>${road.pavementType}</span>
            </div>
            <button class="remove-road-btn" data-id="${road.id}" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; padding: 5px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        listContainer.appendChild(item);
    });
};

// ─── Global Delegated Event Listeners ────────────────────────────────────────
document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-road-btn');
    if (removeBtn) {
        const road = window._projectState.selectedRoads.find(r => r.id === removeBtn.dataset.id);
        if (road) toggleRoadSelection(road);
    }
});

const updateEngineerSelection = (eng) => {
    const input = document.getElementById('engSearchInput');
    const container = document.getElementById('selectedEngContainer');
    const nameEl = document.getElementById('selectedEngName');
    const idHidden = document.getElementById('formEngineerId');
    const icon = document.querySelector('#engSearchWrapper > .m-icon.l');

    if (!input || !container || !nameEl || !idHidden) return;

    if (eng) {
        input.classList.add('eng-hidden');
        if (icon) icon.classList.add('eng-hidden');
        container.classList.remove('hidden');
        container.style.display = 'flex';
        
        let displayName = "";
        if (typeof eng === 'string') {
            displayName = getEngineerDisplayName(eng);
            // Try to find the ID if eng is a name string
            const found = window._projectState.allEngineers.find(e => {
                const fName = e.firstName || '';
                const lName = e.lastName || '';
                const fullName = `${fName} ${lName}`.trim();
                const engName = fullName ? `Engr. ${fullName}` : (e.FullName || e.Name || "");
                return engName === eng || e.id === eng;
            });
            window._projectState.selectedEngineerId = found ? found.id : null;
        } else {
            const fName = eng.firstName || '';
            const lName = eng.lastName || '';
            const fullName = `${fName} ${lName}`.trim();
            displayName = fullName ? `Engr. ${fullName}` : (eng.FullName || eng.Name || "");
            window._projectState.selectedEngineerId = eng.id;
        }
        
        nameEl.innerText = displayName;
        idHidden.value = window._projectState.selectedEngineerId || (typeof eng === 'string' ? eng : ''); 
    } else {
        window._projectState.selectedEngineerId = null;
        input.classList.remove('eng-hidden');
        if (icon) icon.classList.remove('eng-hidden');
        input.value = '';
        container.classList.add('hidden');
        container.style.display = 'none';
        nameEl.innerText = '';
        idHidden.value = '';
    }
};

// ─── Search Suggestions ───────────────────────────────────────────────────────
const updateRoadSuggestions = (input) => {
    const suggestionsContainer = document.getElementById('roadSearchSuggestions');
    if (!input || !suggestionsContainer) return;

    const queryStr = input.value?.toLowerCase()?.trim() || "";
    
    // Auto-show 3 if query is empty
    const matches = queryStr === "" 
        ? window._projectState.allRoads.slice(0, 3) 
        : window._projectState.allRoads.filter(road => (road.roadId || road.name || '').toLowerCase().includes(queryStr)).slice(0, 3);

    if (matches.length > 0) {
        suggestionsContainer.innerHTML = matches.map(road => `
            <div class="suggestion-item" data-id="${road.id}">
                <div class="suggestion-name">${road.roadId || road.name}</div>
                <div class="suggestion-meta">${road.lguId || road.municipality} • ${road.pavementType}</div>
            </div>
        `).join('');
        suggestionsContainer.classList.remove('hidden');
    } else if (queryStr !== "") {
        suggestionsContainer.innerHTML = '<div style="padding: 12px; font-size: 11px; color: #94a3b8; text-align: center;">No roads found</div>';
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }

    // Update map highlighting
    window._projectState.allRoads.forEach(road => {
        const layer = roadLayers[road.id];
        if (layer) {
            const match = queryStr === "" || (road.roadId || road.name || "").toLowerCase().includes(queryStr);
            const isSelected = window._projectState.selectedRoads.some(r => r.id === road.id);
            layer.setStyle(match ? { opacity: 1, weight: isSelected ? 8 : 6 } : { opacity: 0.1, weight: 2 });
        }
    });
};

const updateEngineerSuggestions = (input) => {
    const suggestionsContainer = document.getElementById('engSearchSuggestions');
    if (!input || !suggestionsContainer) return;

    const queryStr = input.value?.toLowerCase()?.trim() || "";
    
    const formatName = (eng) => {
        const fName = eng.firstName || '';
        const lName = eng.lastName || '';
        const fullName = `${fName} ${lName}`.trim();
        return fullName ? `Engr. ${fullName}` : (eng.FullName || eng.Name || "");
    };

    // Auto-show 3 if query is empty
    const matches = queryStr === "" 
        ? window._projectState.allEngineers.slice(0, 3) 
        : window._projectState.allEngineers.filter(eng => formatName(eng).toLowerCase().includes(queryStr)).slice(0, 3);

    if (matches.length > 0) {
        suggestionsContainer.innerHTML = matches.map(eng => `
            <div class="suggestion-item eng-suggestion" data-id="${eng.id}">
                <div class="suggestion-name">${formatName(eng)}</div>
                <div class="suggestion-meta">${eng.Position || eng.Role || eng.position || 'Engineer'} • ${eng.Rank || eng.rank || ''}</div>
            </div>
        `).join('');
        suggestionsContainer.classList.remove('hidden');
    } else if (queryStr !== "") {
        suggestionsContainer.innerHTML = '<div style="padding: 12px; font-size: 11px; color: #94a3b8; text-align: center;">No engineers found</div>';
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
};

document.addEventListener('input', (e) => {
    const roadSearch = e.target.closest('#roadSearchInput');
    if (roadSearch) updateRoadSuggestions(roadSearch);

    const engSearch = e.target.closest('#engSearchInput');
    if (engSearch) updateEngineerSuggestions(engSearch);
});

document.addEventListener('focusin', (e) => {
    const roadSearch = e.target.closest('#roadSearchInput');
    if (roadSearch) updateRoadSuggestions(roadSearch);

    const engSearch = e.target.closest('#engSearchInput');
    if (engSearch) updateEngineerSuggestions(engSearch);
});

document.addEventListener('click', (e) => {
    // Road Suggestion Click
    const roadItem = e.target.closest('.suggestion-item:not(.eng-suggestion)');
    if (roadItem) {
        const id = roadItem.dataset.id;
        const road = window._projectState.allRoads.find(r => r.id === id);
        if (road) {
            toggleRoadSelection(road);
            const mainSearchInput = document.getElementById('roadSearchInput');
            const mainSuggestions = document.getElementById('roadSearchSuggestions');
            if (mainSearchInput) mainSearchInput.value = '';
            if (mainSuggestions) mainSuggestions.classList.add('hidden');
            const layer = roadLayers[road.id];
            if (layer && projectMap) projectMap.fitBounds(layer.getBounds(), { padding: [50, 50] });
        }
    }

    // Engineer Suggestion Click
    const engItem = e.target.closest('.eng-suggestion');
    if (engItem) {
        const id = engItem.dataset.id;
        const eng = window._projectState.allEngineers.find(e => e.id === id);
        if (eng) {
            updateEngineerSelection(eng);
            document.getElementById('engSearchSuggestions').classList.add('hidden');
        }
    }

    // Remove Engineer Button
    const removeEngBtn = e.target.closest('#removeEngBtn');
    if (removeEngBtn) {
        updateEngineerSelection(null);
    }

    // Outside clicks
    if (!e.target.closest('#roadSearchInput') && !e.target.closest('#roadSearchSuggestions')) {
        document.getElementById('roadSearchSuggestions')?.classList.add('hidden');
    }
    if (!e.target.closest('#engSearchInput') && !e.target.closest('#engSearchSuggestions')) {
        document.getElementById('engSearchSuggestions')?.classList.add('hidden');
    }
});

document.addEventListener('click', (e) => {
    const fsBtn = e.target.closest('#btnFullscreenProjectMap');
    if (fsBtn) {
        const container = document.getElementById('projectMapContainer');
        const fsPanel = document.getElementById('fsSearchPanel');
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                container.classList.add('fullscreen');
                if (fsPanel) fsPanel.classList.remove('hidden');
            });
        } else {
            document.exitFullscreen();
        }
    }
});

function showDeleteConfirmModal(onConfirm) {
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
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #ef4444; margin: 0 0 10px;">Delete Project?</h3>
                <p style="font-size: 0.875rem; color: #64748b; line-height: 1.6; margin: 0 0 28px;">
                    This is permanent. All selected records will be removed from the servers and cannot be recovered.
                </p>
                <div style="display: flex; gap: 12px;">
                    <button id="customDeleteCancelBtn" style="
                        flex: 1; padding: 14px; border: 2px solid #e2e8f0; border-radius: 14px;
                        background: #fff; color: #475569; font-weight: 700; font-size: 0.8rem;
                        letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
                    ">Cancel</button>
                    <button id="customDeleteConfirmBtn" style="
                        flex: 1; padding: 14px; border: none; border-radius: 14px;
                        background: #ef4444; color: #fff; font-weight: 700; font-size: 0.8rem;
                        letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
                    ">Delete Forever</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const box = modal.querySelector('#customDeleteModalBox');
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        box.style.transform = 'scale(1)';
    });

    const close = () => {
        modal.style.opacity = '0';
        box.style.transform = 'scale(0.92)';
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    };

    document.getElementById('customDeleteCancelBtn').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
    document.getElementById('customDeleteConfirmBtn').onclick = () => { close(); onConfirm(); };
}

function showDeleteSuccessToast(count) {
    let toast = document.getElementById('deleteSuccessToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'deleteSuccessToast';
        toast.style.cssText = `
            position: fixed; top: 50px; left: 50%; transform: translateX(-50%) translateY(-20px);
            z-index: 99999; background: #ef4444; color: #fff;
            padding: 14px 24px; border-radius: 14px;
            display: flex; align-items: center; gap: 10px;
            font-weight: 700; font-size: 0.9rem;
            box-shadow: 0 8px 24px rgba(239,68,68,0.35);
            opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none; white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${count} project${count > 1 ? 's' : ''} successfully deleted
    `;
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3500);
}

function showSaveSuccessToast(action = 'created') {
    let toast = document.getElementById('saveSuccessToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'saveSuccessToast';
        toast.style.cssText = `
            position: fixed; top: 24px; left: 50%; transform: translateX(-50%) translateY(-20px);
            z-index: 99999; background: #22c55e; color: #fff;
            padding: 14px 24px; border-radius: 14px;
            display: flex; align-items: center; gap: 10px;
            font-weight: 700; font-size: 0.9rem;
            box-shadow: 0 8px 24px rgba(34,197,94,0.35);
            opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none; white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Project successfully ${action}
    `;
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 3500);
}

function renderFsMasterList(qStr = '') {
    const listContainer = document.getElementById('fsRoadMasterList');
    const resultsCount = document.getElementById('fsResultsCount');
    if (!listContainer || !window._projectState.allRoads) return;
    let filtered = window._projectState.allRoads;
    if (qStr) {
        filtered = filtered.filter(road =>
            (road.roadId || road.name || '').toLowerCase().includes(qStr.toLowerCase()) ||
            (road.lguId || road.municipality || '').toLowerCase().includes(qStr.toLowerCase())
        );
    }
    if (resultsCount) resultsCount.innerText = `SHOWING ${filtered.length} ASSETS`;
    const sorted = [...filtered].sort((a, b) => {
        const aSelected = window._projectState.selectedRoads.some(r => r.id === a.id);
        const bSelected = window._projectState.selectedRoads.some(r => r.id === b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
    });
    listContainer.innerHTML = sorted.map(road => {
        const isSelected = window._projectState.selectedRoads.some(r => r.id === road.id);
        return `
            <div class="fs-item ${isSelected ? 'selected' : ''}" data-id="${road.id}">
                <div class="fs-item-content">
                    <div class="suggestion-name">${road.roadId || road.name}</div>
                    <div class="fs-tags">
                        <span class="tag municipality">${road.lguId || road.municipality}</span>
                        <span class="tag pavement">${road.pavementType}</span>
                    </div>
                </div>
                <div class="fs-focus-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>
                </div>
            </div>
        `;
    }).join('');
    if (sorted.length === 0) {
        listContainer.innerHTML = '<div style="padding: 40px 20px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">No assets match your search</div>';
    }
}

document.addEventListener('fullscreenchange', () => {
    const container = document.getElementById('projectMapContainer');
    const fsBtn = document.getElementById('btnFullscreenProjectMap');
    if (document.fullscreenElement === container) {
        container.classList.add('fullscreen');
        if (fsBtn) fsBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>';
        renderFsMasterList();
    } else {
        container.classList.remove('fullscreen');
        if (fsBtn) fsBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
        const fsInput = document.getElementById('fsRoadSearchInput');
        if (fsInput) fsInput.value = '';
    }
    setTimeout(() => { if (projectMap) projectMap.invalidateSize(); }, 100);
});

document.addEventListener('input', (e) => {
    const fsInput = e.target.closest('#fsRoadSearchInput');
    if (fsInput) renderFsMasterList(fsInput.value);
});

document.addEventListener('click', (e) => {
    const fsItem = e.target.closest('.fs-item');
    if (fsItem) {
        const road = window._projectState.allRoads.find(r => r.id === fsItem.dataset.id);
        if (road) {
            toggleRoadSelection(road);
            const fsInput = document.getElementById('fsRoadSearchInput');
            renderFsMasterList(fsInput ? fsInput.value : '');
            const layer = roadLayers[road.id];
            if (layer && projectMap) projectMap.fitBounds(layer.getBounds(), { padding: [50, 50] });
        }
    }
});

// ─── Table / Pagination Helpers ───────────────────────────────────────────────
const itemsPerPage = 10;

const clearSubListeners = () => {
    if (window._projectState.subUnsubs) {
        window._projectState.subUnsubs.forEach(unsub => unsub());
        window._projectState.subUnsubs = [];
    }
};

const getFormOverlay        = () => document.getElementById('projectFormModal');
const getDetailsOverlay     = () => document.getElementById('projectDetailsModal');
const getTableBody          = () => document.getElementById('recordsBody');
const getRecordsNote        = () => document.getElementById('recordsNote');
const getPaginationControls = () => document.getElementById('paginationControls');
const getFilterStatus       = () => document.getElementById('filterStatus');
const getFilterMunicipality = () => document.getElementById('filterMunicipality');
const getFilterSort         = () => document.getElementById('filterSort');
const getTableSearch        = () => document.getElementById('tableSearch');

// ─── DOM Ready ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    getFilterStatus()?.addEventListener('change', applyFilters);
    getFilterMunicipality()?.addEventListener('change', applyFilters);
    getFilterSort()?.addEventListener('change', applyFilters);
    getTableSearch()?.addEventListener('input', applyFilters);

    if (window.lucide) lucide.createIcons();

    initFirestoreListener();
    setupModalDelegation();
});

// ─── Modal Delegation ─────────────────────────────────────────────────────────
const setupModalDelegation = () => {
    if (window._projectClickHandler) document.removeEventListener('click', window._projectClickHandler);

    const handler = (e) => {
        const openBtn = e.target.closest('#openModalBtn');
        if (openBtn) {
            const overlay = getFormOverlay();
            if (!overlay) return;
            window._projectState.currentEditId = null;
            const modalMainTitle = document.getElementById('formModalMainTitle');
            const modalSubTitle  = document.getElementById('formModalSubTitle');
            if (modalMainTitle) modalMainTitle.innerText = 'New Maintenance Project';
            if (modalSubTitle)  modalSubTitle.innerText  = 'RECORD ENTRY FORM';
            const saveBtnSpan = document.querySelector('#saveProjectBtn span');
            if (saveBtnSpan) saveBtnSpan.innerText = 'SAVE PROJECT ENTRY';
            ['formTitle', 'formMunicipality', 'formStart', 'formEnd'].forEach(id => {
                const el = document.getElementById(id); if (el) el.value = '';
            });
            updateEngineerSelection(null);
            const statusEl = document.getElementById('formStatus'); if (statusEl) statusEl.value = 'Ongoing';
            window._projectState.selectedRoads = [];
            renderSelectedRoadsList();
            overlay.style.display = 'flex';
            setTimeout(() => {
                overlay.classList.add('active');
                document.body.classList.add('modal-open');
                initProjectMap();
                if (projectMap) { projectMap.invalidateSize(); renderRoadsOnMap(); }
            }, 10);
        }

        const closeFormBtn = e.target.closest('#closeFormModalBtn');
        if (closeFormBtn) {
            const overlay = getFormOverlay();
            if (overlay) { 
                // Restore backup on cancel/close
                window._projectState.selectedRoads = [...(window._projectState.backupRoads || [])];
                renderRoadsOnMap();
                renderSelectedRoadsList();

                overlay.classList.remove('active'); 
                document.body.classList.remove('modal-open'); 
                setTimeout(() => overlay.style.display = 'none', 300); 
            }
        }

        const closeDetailsBtn = e.target.closest('#closeDetailsModalBtn');
        if (closeDetailsBtn) {
            const overlay = getDetailsOverlay();
            if (overlay) { overlay.classList.remove('active'); document.body.classList.remove('modal-open'); setTimeout(() => overlay.style.display = 'none', 300); }
        }

        const cancelBtn = e.target.closest('#cancelFormModalBtn');
        if (cancelBtn) {
            if (document.getElementById('closeFormModalBtn')) {
                document.getElementById('closeFormModalBtn').click();
            }
        }

        const toggleEditBtn = e.target.closest('#toggleEditBtn');
        if (toggleEditBtn) {
            const detailsOverlay = getDetailsOverlay();
            if (detailsOverlay) detailsOverlay.classList.remove('active');
            const idToEdit = window._projectState.currentEditId;
            if (idToEdit) {
                const proj = window._projectState.allProjects.find(p => p.id === idToEdit);
                if (proj) openFormModal(proj);
            }
        }

        const refreshBtn = e.target.closest('#refreshBtn');
        if (refreshBtn) {
            const btnIcon = refreshBtn.querySelector('svg');
            if (btnIcon) {
                const currentRot = (parseInt(refreshBtn.dataset.rotation || '0')) + 360;
                refreshBtn.dataset.rotation = currentRot;
                btnIcon.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                btnIcon.style.transform = `rotate(${currentRot}deg)`;
            }
            applyFilters();
        }

        const deleteModeBtnHandler = e.target.closest('#deleteModeBtn');
        if (deleteModeBtnHandler) {
            if (!window._projectState.deleteMode) {
                window._projectState.deleteMode = true;
                window._projectState.selectedProjects.clear();
                deleteModeBtnHandler.classList.add('active');
                deleteModeBtnHandler.querySelector('span').innerText = 'Confirm Delete (0)';
            } else {
                if (window._projectState.selectedProjects.size > 0) {
                    executeMultiDelete();
                } else {
                    exitDeleteMode();
                }
            }
            renderTable();
        }

        const deleteSelectBtn = e.target.closest('.delete-select-btn');
        if (deleteSelectBtn) {
            const id = deleteSelectBtn.dataset.id;
            if (window._projectState.selectedProjects.has(id)) {
                window._projectState.selectedProjects.delete(id);
            } else {
                window._projectState.selectedProjects.add(id);
            }
            const btnText = document.querySelector('#deleteModeBtn span');
            if (btnText) btnText.innerText = `Confirm Delete (${window._projectState.selectedProjects.size})`;
            renderTable();
        }
    };

    window._projectClickHandler = handler;
    document.addEventListener('click', handler);
};

// ─── Firestore Listener ───────────────────────────────────────────────────────
const initFirestoreListener = () => {
    if (!db) {
        console.error('Firestore not initialised — cannot load projects.');
        return;
    }

    // Fetch LGUs for dropdowns
    onSnapshot(collection(db, "LGUs"), (snapshot) => {
        const muniDropdowns = [
            document.getElementById('formMunicipality'),
            document.getElementById('filterMunicipality')
        ];
        
        const lgus = [];
        snapshot.forEach(docSnap => lgus.push({ id: docSnap.id, ...docSnap.data() }));
        window._projectState.allLGUs = lgus;
        lgus.sort((a, b) => (a.municipalityName || "").localeCompare(b.municipalityName || ""));

        muniDropdowns.forEach(dropdown => {
            if (!dropdown) return;
            const currentVal = dropdown.value;
            const isFilter = dropdown.id === 'filterMunicipality';
            
            dropdown.innerHTML = isFilter 
                ? '<option value="All">All Municipalities</option>'
                : '<option value="" disabled selected>Select Municipality...</option>';
            
            lgus.forEach(lgu => {
                const opt = document.createElement('option');
                opt.value = lgu.id; // Use Document ID
                opt.textContent = lgu.municipalityName;
                dropdown.appendChild(opt);
            });
            
            if (currentVal) dropdown.value = currentVal;
        });
    });

    // Fetch Engineers from Engineers collection
    const engQuery = query(collection(db, "Engineers"));
    onSnapshot(engQuery, (snapshot) => {
        window._projectState.allEngineers = [];
        const filterEng = document.getElementById('filterEngineer');
        const currentFilterVal = filterEng ? filterEng.value : 'All';
        
        if (filterEng) {
            filterEng.innerHTML = '<option value="All">All Assigned Engineers</option>';
        }

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const eng = { id: docSnap.id, ...data };
            window._projectState.allEngineers.push(eng);

            if (filterEng) {
                const opt = document.createElement('option');
                const fName = eng.firstName || '';
                const lName = eng.lastName || '';
                const fullName = `${fName} ${lName}`.trim();
                const displayName = fullName ? `Engr. ${fullName}` : (eng.FullName || eng.Name || eng.username || "Engineer");
                opt.value = eng.id;
                opt.textContent = displayName;
                filterEng.appendChild(opt);
            }
        });

        if (filterEng && currentFilterVal) filterEng.value = currentFilterVal;
        applyFilters();
    });

    try {
        if (window._projectUnsub) window._projectUnsub();
        const q = query(collection(db, "MaintenanceProjects"), orderBy("createdAt", "desc"));
        window._projectUnsub = onSnapshot(q, (snapshot) => {
            window._projectState.allProjects = [];
            snapshot.forEach((docSnap) => {
                window._projectState.allProjects.push({ id: docSnap.id, ...docSnap.data() });
            });
            window._projectState.allProjects.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || (a.createdAt ? new Date(a.createdAt) : 0);
                const dateB = b.createdAt?.toDate?.() || (b.createdAt ? new Date(b.createdAt) : 0);
                return dateB - dateA;
            });
            applyFilters();
            if (!window._initialUrlHandled && window._projectState.allProjects.length > 0) {
                const urlParams = new URLSearchParams(window.location.search);
                const projectId = urlParams.get('id');
                if (projectId) {
                    const project = window._projectState.allProjects.find(p => p.id === projectId);
                    if (project) setTimeout(() => openViewModal(project), 500);
                }
                window._initialUrlHandled = true;
            }
        }, (err) => {
            console.error('Firestore snapshot error:', err);
        });
    } catch (err) {
        console.error('Failed to setup Firestore listener:', err);
    }
};

// ─── Filtering & Sorting ──────────────────────────────────────────────────────
function applyFilters() {
    const statusVal = getFilterStatus()?.value  ?? "All";
    const muniVal   = getFilterMunicipality()?.value ?? "All";
    const engVal    = document.getElementById('filterEngineer')?.value ?? "All";
    const sortVal   = getFilterSort()?.value    ?? "Newest";
    const searchVal = (getTableSearch()?.value?.toLowerCase() || "");

    window._projectState.filteredProjects = window._projectState.allProjects.filter(p => {
        const titleVal = p.projectTitle || p.title || "";
        const lguId   = p.lguId || p.municipality || "";
        const matchStatus = statusVal === "All" || (p.status || "").toLowerCase() === statusVal.toLowerCase();
        const matchMuni   = muniVal   === "All" || lguId === muniVal || (lguId).toLowerCase() === muniVal.toLowerCase();
        const matchEng    = engVal === "All" || 
                           p.managingEngineerId === engVal || 
                           p.managingEngineerDocId === engVal ||
                           (p.engineer || "").includes(engVal);
        const matchSearch = (titleVal).toLowerCase().includes(searchVal);
        return matchStatus && matchMuni && matchEng && matchSearch;
    });

    window._projectState.filteredProjects.sort((a, b) => {
        const titleA = a.projectTitle || a.title || "";
        const titleB = b.projectTitle || b.title || "";
        if (sortVal === "A-Z") return (titleA).localeCompare(titleB);
        if (sortVal === "Z-A") return (titleB).localeCompare(titleA);
        const dateA = a.createdAt?.toDate?.() || (a.createdAt ? new Date(a.createdAt) : 0);
        const dateB = b.createdAt?.toDate?.() || (b.createdAt ? new Date(b.createdAt) : 0);
        return sortVal === "Oldest" ? dateA - dateB : dateB - dateA;
    });

    window._projectState.currentPage = 1;
    renderTable();
}

// ─── Delete Helpers ───────────────────────────────────────────────────────────
function exitDeleteMode() {
    window._projectState.deleteMode = false;
    window._projectState.selectedProjects.clear();
    const deleteModeBtn = document.getElementById('deleteModeBtn');
    if (deleteModeBtn) {
        deleteModeBtn.classList.remove('active');
        deleteModeBtn.querySelector('span').innerText = 'Delete Project';
    }
}

async function executeMultiDelete() {
    const selectedIds = Array.from(window._projectState.selectedProjects);
    showDeleteConfirmModal(async () => {
        const deleteModeBtn = document.getElementById('deleteModeBtn');
        deleteModeBtn.querySelector('span').innerText = 'Deleting...';
        deleteModeBtn.disabled = true;
        try {
            for (const id of selectedIds) {
                const proj = window._projectState.allProjects.find(p => p.id === id);
                await deleteDoc(doc(db, "MaintenanceProjects", id));
                if (proj) {
                    const titleVal = proj.projectTitle || proj.title || "";
                    const lguVal   = proj.lguId || proj.municipality || "";
                    await logNotification(db, {
                        type: 'delete',
                        entity: 'project',
                        title: 'Project Deleted',
                        message: `"${titleVal}" (${lguVal}) was permanently deleted.`
                    });
                }
            }
            exitDeleteMode();
            renderTable();
            showDeleteSuccessToast(selectedIds.length);
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete some projects.");
        } finally {
            deleteModeBtn.disabled = false;
        }
    });
}

// ─── Table Rendering ──────────────────────────────────────────────────────────
function formatDateRange(start, end) {
    if (!start || !end) return "TBD";
    const d1 = new Date(start);
    const d2 = new Date(end);
    return `${d1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${d2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function getStatusBadge(status) {
    const st = (status || "").toLowerCase();
    if (st === 'ongoing')    return 'status-ongoing';
    if (st === 'terminated') return 'status-terminated';
    if (st === 'completed')  return 'status-completed';
    return 'status-ongoing';
}

function renderTable() {
    const tableBody = getTableBody();
    const recordsNote = getRecordsNote();
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const { allProjects, filteredProjects, currentPage, deleteMode, selectedProjects } = window._projectState;

    if (allProjects.length === 0) {
        tableBody.innerHTML = `<div class="records-placeholder">No projects found.</div>`;
        if (recordsNote) recordsNote.innerText = `SHOWING 0 OF 0 PROJECTS`;
        renderPagination();
        return;
    }

    if (filteredProjects.length === 0) {
        tableBody.innerHTML = `<div class="records-placeholder">No projects match the current filters.</div>`;
        if (recordsNote) recordsNote.innerText = `SHOWING 0 OF ${allProjects.length} PROJECTS`;
        renderPagination();
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex   = startIndex + itemsPerPage;
    const paginatedItems = filteredProjects.slice(startIndex, endIndex);

    paginatedItems.forEach(proj => {
        const isSelected = selectedProjects.has(proj.id);
        const row = document.createElement('div');
        row.className = `record-row ${isSelected ? 'to-delete' : ''}`;

        const lguId = proj.lguId || proj.municipality || '';
        const targetLgu = window._projectState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
        const muniName = targetLgu ? targetLgu.municipalityName : lguId;

        let actionColumnHtml = '';
        if (deleteMode) {
            actionColumnHtml = `
                <button class="action-btn delete-select-btn ${isSelected ? 'selected' : ''}" data-id="${proj.id}" title="Select for deletion">
                    ${isSelected
                        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'}
                </button>`;
        } else {
            actionColumnHtml = `
                <button type="button" class="action-btn view-btn" onclick="window.openViewModal('${proj.id}')" title="View Details">
                    <i data-lucide="eye" style="width:20px; height:20px;"></i>
                </button>`;
        }

        row.innerHTML = `
            <div class="col">
                <div class="proj-name-main">${proj.projectTitle || proj.title || '---'}</div>
                <div class="proj-id-sub">ID: ${proj.id.substring(0, 8)}</div>
            </div>
            <div class="col font-medium">${muniName}</div>
            <div class="col"><span class="status-badge ${getStatusBadge(proj.status)}">${proj.status}</span></div>
            <div class="col">${getEngineerDisplayName(proj.managingEngineerId || proj.engineer)}</div>
            <div class="col">${formatDateRange(proj.startDate, proj.endDate)}</div>
            <div class="col actions-col">${actionColumnHtml}</div>
        `;
        tableBody.appendChild(row);
    });

    if (window.lucide) lucide.createIcons();

    const actualEnd = Math.min(endIndex, filteredProjects.length);
    if (recordsNote) recordsNote.innerText = `SHOWING ${startIndex + 1} - ${actualEnd} OF ${filteredProjects.length} PROJECTS`;
    renderPagination();
}

// ─── View Modal ───────────────────────────────────────────────────────────────
window.openViewModal = (projOrId) => {
    const proj = typeof projOrId === 'string'
        ? window._projectState.allProjects.find(p => p.id === projOrId)
        : projOrId;
    if (!proj) return;
    window._projectState.currentEditId = proj.id;
    clearSubListeners();

    const lguId = proj.lguId || proj.municipality || '';
    const targetLgu = window._projectState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
    const muniName = targetLgu ? targetLgu.municipalityName : lguId;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    set('formTitle_view_text',        proj.projectTitle        || proj.title        || '');
    set('formMunicipality_view_bold', muniName);
    set('formStart_view_bold',        proj.startDate    || '');
    set('formEnd_view_bold',          proj.endDate      || '');
    set('formEngineer_view_bold',     getEngineerDisplayName(proj.managingEngineerId  || proj.engineer));

    const statusEl = document.getElementById('viewStatusBadge');
    if (statusEl) {
        statusEl.className = `status-badge ${getStatusBadge(proj.status)}`;
        statusEl.innerText = (proj.status || "ONGOING").toUpperCase();
    }

    const creatorEl = document.getElementById('metaCreator');
    if (creatorEl) creatorEl.innerText = `Created by: ${proj.createdBy || 'District Engineer'}`;

    const fmtDate = (raw) => {
        if (!raw) return 'TBD';
        const d = raw?.toDate ? raw.toDate() : new Date(raw);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };
    const fmtDateShort = (raw) => {
        if (!raw) return 'N/A';
        const d = raw?.toDate ? raw.toDate() : new Date(raw);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    set('metaDate',       `Uploaded: ${fmtDate(proj.createdAt)}`);
    set('metaLastEdited', `Edited: ${proj.updatedAt ? fmtDateShort(proj.updatedAt) : 'N/A'}`);

    fetchAssociatedData(proj.id);

    const roadList  = document.getElementById('viewAffectedRoadsList');
    const roadTitle = document.getElementById('viewAffectedRoadsTitle');
    if (roadList && roadTitle) {
        roadList.innerHTML = '';
        const selected = proj.affectedRoads || [];
        roadTitle.innerText = `AFFECTED ASSETS (${selected.length})`;
        if (selected.length === 0) {
            roadList.innerHTML = '<p style="font-size: 11px; color: #94a3b8; text-align: center; padding: 15px;">No roads associated with this project.</p>';
        } else {
            selected.forEach(road => {
                const item = document.createElement('div');
                item.style = "background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px;";
                const rName = road.roadId || road.name || '---';
                item.innerHTML = `
                    <div style="font-size: 11px; font-weight: 800; color: #1e293b; margin-bottom: 2px;">${rName.toUpperCase()}</div>
                    <div style="font-size: 10px; font-weight: 600; color: #64748b;">${road.lguId || road.municipality || '---'} • ${road.pavementType || '---'}</div>
                `;
                roadList.appendChild(item);
            });
        }
    }

    setTimeout(() => {
        const previewMapDiv = document.getElementById('viewProjectMap');
        if (previewMapDiv) {
            if (window._detailsMap) window._detailsMap.remove();
            window._detailsMap = L.map('viewProjectMap', { zoomControl: true, attributionControl: false }).setView([7.6, 125.7], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(window._detailsMap);
            const group = L.featureGroup();
            (proj.affectedRoads || []).forEach(road => {
                const geoData = road.geojsonData || road.geoJSON;
                if (geoData) {
                    try {
                        const layer = L.geoJSON(JSON.parse(geoData), { style: { color: '#78350F', weight: 6 } }).addTo(window._detailsMap);
                        group.addLayer(layer);
                    } catch (e) {}
                }
            });
            if (group.getLayers().length > 0) {
                const bounds = group.getBounds();
                window._detailsMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
                const paddedBounds = bounds.pad(1.0);
                window._detailsMap.setMaxBounds(paddedBounds);
                window._detailsMap.setMinZoom(window._detailsMap.getZoom() - 1);
                window._detailsMap.on('drag', () => window._detailsMap.panInsideBounds(paddedBounds, { animate: false }));
            }
        }
    }, 100);

    const overlay = getDetailsOverlay();
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => { overlay.classList.add('active'); document.body.classList.add('modal-open'); }, 10);
    }
};

// ─── Associated Data ──────────────────────────────────────────────────────────
const fetchAssociatedData = (projectId) => {
    if (!db) return;
    const muList = document.getElementById('monthlyUpdatesList');
    if (muList) {
        const q = query(
            collection(db, "MonthlyUpdates"),
            where("projectId", "==", projectId)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            muList.innerHTML = '<div class="listtitle">ASSOCIATED MONTHLY UPDATES</div>';
            if (snapshot.empty) {
                muList.innerHTML += '<div class="records-placeholder" style="padding:20px;text-align:center;border:1px dashed #e2e8f0;border-radius:12px;font-size:12px;color:#94a3b8;">No updates.</div>';
            } else {
                const docs = [];
                snapshot.forEach(docSnap => docs.push({ id: docSnap.id, ...docSnap.data() }));
                
                docs.sort((a, b) => {
                    const tA = (a.createdAt?.toDate?.() || 0);
                    const tB = (b.createdAt?.toDate?.() || 0);
                    return tB - tA;
                });

                docs.forEach(data => {
                    const item = document.createElement('div');
                    item.className = 'item';
                    item.style = "display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid #f1f5f9; border-radius:10px; margin-bottom:8px; cursor:pointer; transition: background-color 0.2s ease;";
                    item.onmouseover = () => {
                        item.style.backgroundColor = "#f1f5f9";
                    };
                    item.onmouseout = () => {
                        item.style.backgroundColor = "transparent";
                    };
                    item.onclick = () => {
                        window.location.href = `AdminMonthlyUpdates.php?id=${data.id}`;
                    };
                    const refDate = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : (data.updateMonth || data.updateDate || 'Update');
                    item.innerHTML = `<div><div style="font-size:12px;font-weight:700;">MONTH ${data.updateMonth || 'N/A'}</div><div style="font-size:10px;color:#94a3b8;">${refDate}</div></div>`;
                    muList.appendChild(item);
                });
            }
        });
        window._projectState.subUnsubs.push(unsub);
    }

    const docList = document.getElementById('projectDocumentsList');
    if (docList) {
        const q = query(
            collection(db, "ProjectDocuments"),
            where("projectId", "==", projectId)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            docList.innerHTML = '<div class="listtitle">ASSOCIATED PROJECT DOCUMENTS</div>';
            if (snapshot.empty) {
                docList.innerHTML += '<div class="records-placeholder" style="padding:20px;text-align:center;border:1px dashed #e2e8f0;border-radius:12px;font-size:12px;color:#94a3b8;">No documents.</div>';
            } else {
                const docs = [];
                snapshot.forEach(docSnap => docs.push({ id: docSnap.id, ...docSnap.data() }));

                docs.sort((a, b) => {
                    const tA = (a.uploadedAt?.toDate?.() || 0);
                    const tB = (b.uploadedAt?.toDate?.() || 0);
                    return tB - tA;
                });

                docs.forEach(data => {
                    const item = document.createElement('div');
                    item.className = 'item';
                    item.style = "display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid #f1f5f9; border-radius:10px; margin-bottom:8px; cursor:pointer; transition: background-color 0.2s ease;";
                    item.onmouseover = () => {
                        item.style.backgroundColor = "#f1f5f9";
                    };
                    item.onmouseout = () => {
                        item.style.backgroundColor = "transparent";
                    };
                    item.onclick = () => {
                        window.location.href = `AdminProjectDocuments.php?id=${data.id}`;
                    };
                    item.innerHTML = `
                        <div>
                            <div style="font-size:12px;font-weight:700;">${data.documentTitle || 'Document'}</div>
                            <div style="font-size:10px;color:#94a3b8;">${data.fileType || 'File'}</div>
                        </div>
                        <a href="${data.fileUrl}" target="_blank" onclick="event.stopPropagation();" style="color: #78350f; font-size: 10px; font-weight: 800; text-decoration: none;">VIEW</a>
                    `;
                    docList.appendChild(item);
                });
            }
        });
        window._projectState.subUnsubs.push(unsub);
    }
};

// ─── Form Modal ───────────────────────────────────────────────────────────────
function openFormModal(proj) {
    window._projectState.currentEditId = proj ? proj.id : null;
    const overlay = getFormOverlay();
    if (!overlay) return;

    if (proj) {
        document.getElementById('formModalMainTitle').innerText = 'Edit Maintenance Project';
        document.getElementById('formModalSubTitle').innerText  = 'RECORD EDIT FORM';
        document.querySelector('#saveProjectBtn span').innerText = 'APPLY CHANGES';
        document.getElementById('formTitle').value        = proj.projectTitle  || proj.title        || '';
        document.getElementById('formMunicipality').value = proj.lguId         || proj.municipality || '';
        document.getElementById('formStart').value        = proj.startDate    || '';
        document.getElementById('formEnd').value          = proj.endDate      || '';
        const engName = proj.managingEngineerId || proj.engineer || '';
        updateEngineerSelection(engName || null);
        document.getElementById('formStatus').value       = proj.status       || 'Ongoing';
        window._projectState.selectedRoads = [...(proj.affectedRoads || [])];
        renderSelectedRoadsList();
    } else {
        document.getElementById('formModalMainTitle').innerText = 'New Maintenance Project';
        document.getElementById('formModalSubTitle').innerText  = 'RECORD ENTRY FORM';
        document.querySelector('#saveProjectBtn span').innerText = 'SAVE PROJECT ENTRY';
        document.getElementById('formTitle').value = '';
        document.getElementById('formMunicipality').value = '';
        document.getElementById('formStart').value = '';
        document.getElementById('formEnd').value = '';
        updateEngineerSelection(null);
        document.getElementById('formStatus').value = 'Ongoing';
        window._projectState.selectedRoads = [];
        renderSelectedRoadsList();
    }

    window._projectState.backupRoads = [...(window._projectState.selectedRoads || [])];
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('active');
        document.body.classList.add('modal-open');
        initProjectMap();
        if (projectMap) { 
            projectMap.invalidateSize(); 
            renderRoadsOnMap(); 
            
            const selected = window._projectState.selectedRoads;
            if (selected.length > 0) {
                const group = L.featureGroup();
                selected.forEach(road => {
                    if (roadLayers[road.id]) group.addLayer(roadLayers[road.id]);
                });
                if (group.getLayers().length > 0) {
                    projectMap.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 16 });
                }
            } else {
                projectMap.setView([7.6, 125.7], 12);
            }
            projectMap.setMaxBounds(null);
            projectMap.setMinZoom(1);
        }
    }, 10);
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function renderPagination() {
    const paginationControls = getPaginationControls();
    if (!paginationControls) return;
    paginationControls.innerHTML = '';
    const { filteredProjects, currentPage } = window._projectState;
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { window._projectState.currentPage--; renderTable(); };
    paginationControls.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => { window._projectState.currentPage = i; renderTable(); };
        paginationControls.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { window._projectState.currentPage++; renderTable(); };
    paginationControls.appendChild(nextBtn);
}

// ─── Save Button ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('saveProjectBtn')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const originalText = btn.innerHTML;
        const pTitle = document.getElementById('formTitle').value.trim();
        const pLgu   = document.getElementById('formMunicipality').value.trim();
        if (!pTitle || !pLgu) { alert("Please fill in Title and Municipality."); return; }
        btn.innerHTML = '<span>Saving...</span>';
        btn.disabled = true;

        const lguId = pLgu; // Now provided by dropdown (ID)

        const projectData = {
            projectTitle: pTitle,
            lguId: lguId,
            startDate:     document.getElementById('formStart').value,
            endDate:       document.getElementById('formEnd').value,
            status:        document.getElementById('formStatus').value,
            managingEngineerId: document.getElementById('formEngineerId').value,
            managingEngineerDocId: window._projectState.selectedEngineerId || null, // Relational link
            affectedRoads: window._projectState.selectedRoads,
            createdBy:     currentProfile?.username || "Admin",
            updatedAt:     serverTimestamp()
        };

        try {
            const idToUpdate = window._projectState.currentEditId;
            if (idToUpdate) {
                await updateDoc(doc(db, "MaintenanceProjects", idToUpdate), projectData);
                await logNotification(db, {
                    type: 'edit',
                    entity: 'project',
                    title: 'Project Updated',
                    message: `"${projectData.projectTitle}" in ${projectData.lguId} was updated.`
                });
            } else {
                projectData.createdAt = serverTimestamp();
                await addDoc(collection(db, "MaintenanceProjects"), projectData);
                await logNotification(db, {
                    type: 'create',
                    entity: 'project',
                    title: 'Project Created',
                    message: `"${projectData.projectTitle}" in ${projectData.lguId} was added.`
                });
            }
            
            // Commit changes to backup so cancel doesn't revert them now
            window._projectState.backupRoads = [...window._projectState.selectedRoads];

            const overlay = getFormOverlay();
            if (overlay) {
                overlay.classList.remove('active');
                document.body.classList.remove('modal-open');
                setTimeout(() => overlay.style.display = 'none', 300);
            }
            showSaveSuccessToast(window._projectState.currentEditId ? 'updated' : 'created');
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save project entry. " + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
});

document.addEventListener('change', (e) => {
    const filterStatus = e.target.closest('#filterStatus');
    const filterMuni = e.target.closest('#filterMunicipality');
    const filterEng = e.target.closest('#filterEngineer');
    const filterSort = e.target.closest('#filterSort');
    
    if (filterStatus || filterMuni || filterEng || filterSort) {
        if (typeof applyFilters === 'function') applyFilters();
    }
});
