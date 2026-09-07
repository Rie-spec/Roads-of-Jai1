// AdminRoadSection.js
import { db, auth } from '../../js/firebase-config.js';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    updateDoc, 
    serverTimestamp,
    query,
    orderBy 
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
        currentUser = user;
        currentProfile = profile;
        console.log('Authenticated:', currentUser.email);
        
        // Hide UI elements if not Admin
        const delBtn = document.getElementById('deleteModeBtn');
        const newBtn = document.getElementById('newRoadBtn') || document.getElementById('newBtn');
        
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

        initFirestoreListeners();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

// ── Global State ────────────────────────────────────────────────────────────
window._roadState = window._roadState || {
    allRoads: [],
    allLGUs: [], // Store LGUs for ID lookup
    filteredRoads: [],
    currentPage: 1,
    currentRoadId: null,
    deleteMode: false,
    selectedRoads: new Set()
};

const itemsPerPage = 8;
let drawingMap = null;

const getFormOverlay    = () => document.getElementById('roadFormModal');
const getDetailsOverlay = () => document.getElementById('roadDetailsModal');
const getTableBody      = () => document.getElementById('roadsTableBody');

// ── Event Delegation ────────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
    if (e.target.closest('#btnAddNewRoad')) openRoadForm();

    if (e.target.closest('#btnCloseRoadForm, #btnCancelRoadForm, #btnCloseRoadDetails')) closeModals();

    if (e.target.closest('#btnEditRoadFromDetails')) {
        const id   = window._roadState.currentRoadId;
        const road = window._roadState.allRoads.find(r => r.id === id);
        if (road) { closeModals(); setTimeout(() => openRoadForm(road), 350); }
    }

    const startBtn = e.target.closest('#btnSetStart');
    if (startBtn) setMappingMode('start', startBtn);

    const endBtn = e.target.closest('#btnSetEnd');
    if (endBtn) setMappingMode('end', endBtn);

    const fsBtn = e.target.closest('#btnFullscreenMap');
    if (fsBtn) toggleFullscreen(fsBtn.closest('.map-wrapper'));

    const refreshBtn = e.target.closest('#refreshBtn');
    if (refreshBtn) { animateRefresh(refreshBtn); applyFilters(); }

    const viewBtn = e.target.closest('.view-btn');
    if (viewBtn) window.viewRecord(viewBtn.dataset.id);

    const deleteModeBtn = e.target.closest('#deleteModeBtn');
    if (deleteModeBtn) {
        if (!window._roadState.deleteMode) {
            window._roadState.deleteMode = true;
            window._roadState.selectedRoads.clear();
            deleteModeBtn.classList.add('active');
            deleteModeBtn.querySelector('span').innerText = 'Confirm Delete (0)';
        } else {
            if (window._roadState.selectedRoads.size > 0) showDeleteConfirmation();
            else exitDeleteMode();
        }
        renderTable();
    }

    const deleteSelectBtn = e.target.closest('.delete-select-btn');
    if (deleteSelectBtn) {
        const id = deleteSelectBtn.dataset.id;
        if (window._roadState.selectedRoads.has(id)) window._roadState.selectedRoads.delete(id);
        else window._roadState.selectedRoads.add(id);
        const btnText = document.querySelector('#deleteModeBtn span');
        if (btnText) btnText.innerText = `Confirm Delete (${window._roadState.selectedRoads.size})`;
        renderTable();
    }

    if (e.target.closest('#cancelDeleteBtn'))  hideDeleteConfirmation();
    if (e.target.closest('#confirmDeleteBtn')) executeMultiDelete();
});

// ── Helpers ─────────────────────────────────────────────────────────────────
function setMappingMode(mode, btn) {
    window._addingMode = mode;
    const mapEl = document.getElementById('drawingMap');
    if (mapEl) mapEl.style.cursor = 'crosshair';
    const guidance = document.getElementById('missionGuidance');
    const m = (mode || 'start').toUpperCase();
    if (guidance) guidance.innerText = `MISSION: SELECT ROAD ${m} POINT...`;
    document.querySelectorAll('.btn-terminal-action').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function animateRefresh(btn) {
    const icon = btn.querySelector('svg');
    if (icon) {
        const currentRot = (parseInt(btn.dataset.rotation || '0')) + 360;
        btn.dataset.rotation = currentRot;
        icon.style.transform = `rotate(${currentRot}deg)`;
    }
}

function toggleFullscreen(wrapper) {
    if (!document.fullscreenElement) wrapper.requestFullscreen().then(() => wrapper.classList.add('roads-map-fullscreen'));
    else document.exitFullscreen();
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
    toast.style.background  = isDelete ? '#ef4444' : '#22c55e';
    toast.style.boxShadow   = isDelete ? '0 8px 24px rgba(239,68,68,0.35)' : '0 8px 24px rgba(34,197,94,0.35)';
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>${message}`;
    requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 3500);
}

// ── Firestore ───────────────────────────────────────────────────────────────
function initFirestoreListeners() {
    // Fetch LGUs for dropdowns
    onSnapshot(collection(db, "LGUs"), (snapshot) => {
        const muniDropdowns = [
            document.getElementById('roadMunicipality'),
            document.getElementById('filterMunicipality')
        ];
        
        const lgus = [];
        snapshot.forEach(docSnap => lgus.push({ id: docSnap.id, ...docSnap.data() }));
        window._roadState.allLGUs = lgus;
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
            
            if (currentVal && currentVal !== "") dropdown.value = currentVal;
            else if (isFilter) dropdown.value = "All";
        });
    });

    const qRoads = query(collection(db, "RoadSections"), orderBy("createdAt", "desc"));
    onSnapshot(qRoads, (snapshot) => {
        window._roadState.allRoads = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        applyFilters();
    });
}

function applyFilters() {
    const muni   = document.getElementById('filterMunicipality')?.value  || "All";
    const status = document.getElementById('filterStateCategory')?.value || "All";
    const pave   = document.getElementById('filterPavement')?.value      || "All";
    const sort   = document.getElementById('filterSort')?.value          || "Newest First";
    const search = document.getElementById('roadSearch')?.value?.toLowerCase() || "";

    window._roadState.filteredRoads = window._roadState.allRoads.filter(r => {
        const muniId  = r.lguId || r.municipality || "N/A";
        const statusVal = r.roadStatus || r.state || r.stateCategory || "Unknown";
        const nameVal  = r.roadId || r.name || `${r.startPoint} - ${r.endPoint}` || "";
        const matchMuni   = muni   === "All" || muniId  === muni;
        const matchStatus = status === "All" || statusVal === status;
        const matchPave   = pave   === "All" || r.pavementType  === pave;
        const matchSearch = nameVal.toLowerCase().includes(search);
        return matchMuni && matchStatus && matchPave && matchSearch;
    });

    window._roadState.filteredRoads.sort((a, b) => {
        const nameA = a.roadId || a.name || `${a.startPoint} - ${a.endPoint}` || "";
        const nameB = b.roadId || b.name || `${b.startPoint} - ${b.endPoint}` || "";
        const dateA = a.createdAt?.toDate?.() || a.createdAt || 0;
        const dateB = b.createdAt?.toDate?.() || b.createdAt || 0;
        if (sort === "A-Z")          return nameA.localeCompare(nameB);
        if (sort === "Oldest First") return dateA - dateB;
        return dateB - dateA;
    });

    window._roadState.currentPage = 1;
    renderTable();
}

['filterMunicipality','filterStateCategory','filterPavement','filterSort'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
});
document.getElementById('roadSearch')?.addEventListener('input', applyFilters);

// ── Render ──────────────────────────────────────────────────────────────────
function renderTable() {
    const body = getTableBody();
    if (!body) return;
    body.innerHTML = '';
    const { filteredRoads, currentPage, deleteMode, selectedRoads } = window._roadState;

    if (filteredRoads.length === 0) {
        body.innerHTML = `<div class="records-placeholder">No road segments found.</div>`;
        const note = document.getElementById('recordsNote');
        if (note) note.innerText = 'Showing 0 roads';
        return;
    }

    const start     = (currentPage - 1) * itemsPerPage;
    const paginated = filteredRoads.slice(start, start + itemsPerPage);

    paginated.forEach(road => {
        const isSelected  = selectedRoads.has(road.id);
        const row         = document.createElement('div');
        row.className     = `record-row ${isSelected ? 'to-delete' : ''}`;
        row.style.gridTemplateColumns = "2fr 1fr 1fr 1fr 1fr 100px";

        const lguId = road.lguId || road.municipality || '';
        const targetLgu = window._roadState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
        const muniName = targetLgu ? targetLgu.municipalityName : lguId;

        const curStatus = road.roadStatus || road.state || road.stateCategory || '---';
        const stateColor = curStatus === 'Good' ? '#059669'
                         : curStatus === 'Fair' ? '#d97706' : '#dc2626';

        const actions = deleteMode
            ? `<button class="action-btn delete-select-btn ${isSelected ? 'selected' : ''}" data-id="${road.id}">
                ${isSelected
                    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'}
               </button>`
            : `<button type="button" class="action-btn view-btn" data-id="${road.id}" title="View Details">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
               </button>`;

        const curName = road.roadId || road.name || `${road.startPoint} - ${road.endPoint}`;
        row.innerHTML = `
            <div class="col">
                <div class="road-name-main">${curName}</div>
                <div class="road-id-sub">SEC-${road.id.substring(0, 8).toUpperCase()}</div>
            </div>
            <div class="col" style="font-size:14px;color:#334155;">${muniName}</div>
            <div class="col" style="font-weight:800;color:${stateColor};font-size:14px;">${curStatus}</div>
            <div class="col" style="font-size:14px;color:#334155;">${road.pavementType || '---'}</div>
            <div class="col">
                <div class="spatial-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    Captured
                </div>
            </div>
            <div class="col actions-col" style="text-align:right;">${actions}</div>`;
        body.appendChild(row);
    });

    const actualEnd = Math.min(start + itemsPerPage, filteredRoads.length);
    const note = document.getElementById('recordsNote');
    if (note) note.innerText = `Showing ${start + 1}-${actualEnd} of ${filteredRoads.length} sections`;
}

// ── Modals ──────────────────────────────────────────────────────────────────
function closeModals() {
    const form    = getFormOverlay();
    const details = getDetailsOverlay();
    if (form)    form.classList.remove('active');
    if (details) details.classList.remove('active');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
        if (form)    form.style.display    = 'none';
        if (details) details.style.display = 'none';
    }, 300);
}

function openRoadForm(road = null) {
    const formOverlay = getFormOverlay();
    if (!formOverlay) return;
    window._roadState.currentRoadId = road ? road.id : null;
    const form = document.getElementById('roadForm');
    form.reset();
    document.getElementById('geojsonStatusText').innerText = 'No road geometry captured yet';
    document.getElementById('geojsonStatus').classList.remove('success');
    document.getElementById('roadGeoJSON').value = '';
    document.getElementById('roadFormTitle').innerText = road ? "EDIT ROAD SECTION" : "NEW ROAD SECTION RECORD";
    if (road) {
        document.getElementById('startPoint').value      = road.startPoint || '';
        document.getElementById('endPoint').value        = road.endPoint || '';
        document.getElementById('roadMunicipality').value = road.lguId  || road.municipality || '';
        document.getElementById('pavementType').value    = road.pavementType || '';
        document.getElementById('stateCategory').value   = road.roadStatus || road.state || road.stateCategory || '';
        document.getElementById('roadGeoJSON').value     = road.geojsonData || road.geoJSON || '';
        document.getElementById('geojsonStatusText').innerText = 'Geometry loaded from database';
        document.getElementById('geojsonStatus').classList.add('success');
    }
    formOverlay.style.display = 'flex';
    setTimeout(() => {
        formOverlay.classList.add('active');
        document.body.classList.add('modal-open');
        initDrawingMap(road);
    }, 10);
}

// ── Map ─────────────────────────────────────────────────────────────────────
const mapClickListener = (e) => {
    if (!window._addingMode || window._addingMode === 'none') return;
    if (window._addingMode === 'start') {
        if (window._startMarker) drawingMap.removeLayer(window._startMarker);
        window._startMarker = L.marker(e.latlng, { draggable: true }).addTo(drawingMap);
        window._startMarker.on('dragend', updateRoute);
        document.getElementById('mapStartLat').value = e.latlng.lat;
        document.getElementById('mapStartLng').value = e.latlng.lng;
    } else if (window._addingMode === 'end') {
        if (window._endMarker) drawingMap.removeLayer(window._endMarker);
        window._endMarker = L.marker(e.latlng, { draggable: true }).addTo(drawingMap);
        window._endMarker.on('dragend', updateRoute);
        document.getElementById('mapEndLat').value = e.latlng.lat;
        document.getElementById('mapEndLng').value = e.latlng.lng;
    }
    window._addingMode = 'none';
    document.getElementById('drawingMap').style.cursor = 'grab';
    document.querySelectorAll('.btn-terminal-action').forEach(b => b.classList.remove('active'));
    updateRoute();
};

function updateRoute() {
    const start = window._startMarker;
    const end   = window._endMarker;
    if (!start || !end) return;
    if (window._routingControl) drawingMap.removeControl(window._routingControl);
    window._routingControl = L.Routing.control({
        waypoints: [start.getLatLng(), end.getLatLng()],
        addWaypoints: false, draggableWaypoints: false,
        lineOptions: { styles: [{ color: '#78350F', opacity: 0.8, weight: 6 }] },
        show: false, createMarker: () => null
    }).addTo(drawingMap);
    window._routingControl.on('routesfound', (e) => {
        const route      = e.routes[0];
        const distanceKm = (route.summary.totalDistance / 1000).toFixed(2);
        document.getElementById('roadGeoJSON').value = JSON.stringify({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: route.coordinates.map(c => [c.lng, c.lat]) },
            properties: { distance: route.summary.totalDistance, updatedAt: new Date().toISOString() }
        });
        document.getElementById('totalDistance').innerText    = `${distanceKm} km`;
        document.getElementById('missionGuidance').innerText  = `TERMINAL: ${distanceKm}KM CAPTURED`;
        document.getElementById('geojsonStatusText').innerText = `Route captured: ${distanceKm} km`;
        document.getElementById('geojsonStatus').classList.add('success');
        const container = document.querySelector('.leaflet-routing-container');
        if (container) container.style.display = 'none';
    });
}

function initDrawingMap(road) {
    if (!drawingMap) {
        drawingMap = L.map('drawingMap').setView([7.6044, 125.9522], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(drawingMap);
        drawingMap.on('click', mapClickListener);
        drawingMap.on('mousemove', (e) => {
            const latEl = document.getElementById('currentLat');
            const lngEl = document.getElementById('currentLng');
            if (latEl) latEl.innerText = e.latlng.lat.toFixed(6);
            if (lngEl) lngEl.innerText = e.latlng.lng.toFixed(6);
        });
    }
    if (window._startMarker)    drawingMap.removeLayer(window._startMarker);
    if (window._endMarker)      drawingMap.removeLayer(window._endMarker);
    if (window._routingControl) drawingMap.removeControl(window._routingControl);
    window._startMarker = window._endMarker = window._routingControl = null;
    window._addingMode  = 'none';
    document.getElementById('drawingMap').style.cursor = 'grab';
    const curGeo = road?.geojsonData || road?.geoJSON;
    if (curGeo) {
        try {
            const geo    = JSON.parse(curGeo);
            const coords = geo.geometry.coordinates;
            const start  = [coords[0][1], coords[0][0]];
            const end    = [coords[coords.length - 1][1], coords[coords.length - 1][0]];
            window._startMarker = L.marker(start, { draggable: true }).addTo(drawingMap);
            window._endMarker   = L.marker(end,   { draggable: true }).addTo(drawingMap);
            window._startMarker.on('dragend', updateRoute);
            window._endMarker.on('dragend',   updateRoute);
            updateRoute();
            setTimeout(() => drawingMap.fitBounds([start, end], { padding: [50, 50] }), 100);
        } catch (e) { console.error(e); }
    }
    setTimeout(() => drawingMap.invalidateSize(), 150);
}

window.viewRecord = (id) => {
    const road = window._roadState.allRoads.find(r => r.id === id);
    if (!road) return;
    window._roadState.currentRoadId = id;

    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.innerText = val; };

    const roadName = road.roadId || road.name || `${road.startPoint} - ${road.endPoint}`;
    const lguId = road.lguId || road.municipality || '';
    const targetLgu = window._roadState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
    const muniName = targetLgu ? targetLgu.municipalityName : lguId;

    set('viewRoadName_text',    roadName);
    set('viewMunicipality_bold', muniName);
    set('viewKilometer_bold',   road.kilometer ? `${road.kilometer} km` : '0.00 km');
    set('viewPavementType_bold', road.pavementType  || '---');
    set('metaCreator',          `Created by: ${road.createdBy || 'District Engineer'}`);

    const stateBadge = document.getElementById('viewStateBadge');
    if (stateBadge) {
        const cat = road.roadStatus || road.state || road.stateCategory || 'Good';
        stateBadge.innerText = cat.toUpperCase();
        const colors = { Good: ['#ecfdf5','#059669'], Fair: ['#fffbeb','#d97706'] };
        const [bg, text] = colors[cat] || ['#fef2f2','#dc2626'];
        stateBadge.style.backgroundColor = bg;
        stateBadge.style.color = text;
    }

    let addDate = '--';
    if (road.createdAt) {
        let d = road.createdAt;
        if (d.toDate) d = d.toDate();
        addDate = new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    set('viewCreatedAt_meta', `Uploaded: ${addDate}`);

    const editedEl = document.getElementById('metaLastEdited');
    if (editedEl) {
        let editDate = 'N/A';
        if (road.updatedAt) {
            let uD = road.updatedAt;
            if (uD.toDate) uD = uD.toDate();
            editDate = new Date(uD).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        editedEl.innerText = `Edited: ${editDate}`;
    }

    const overlay = getDetailsOverlay();
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.classList.add('active');
            document.body.classList.add('modal-open');
            initPreviewMap(road);
        }, 10);
    }
};

function initPreviewMap(road) {
    setTimeout(() => {
        if (window._detailsMap) window._detailsMap.remove();
        const mapContainer = document.getElementById('previewMap');
        if (!mapContainer) return;

        window._detailsMap = L.map('previewMap', { zoomControl: false, attributionControl: false })
                              .setView([7.6, 125.7], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(window._detailsMap);
        const group = L.featureGroup();
        const curGeo = road.geojsonData || road.geoJSON;
        if (curGeo) {
            try {
                const l = L.geoJSON(JSON.parse(curGeo), { style: { color: '#78350F', weight: 6 } })
                           .addTo(window._detailsMap);
                group.addLayer(l);
            } catch (e) { console.error("GeoJSON Parse Error:", e); }
        }
        if (group.getLayers().length > 0) {
            const bounds       = group.getBounds();
            const paddedBounds = bounds.pad(1.5);
            window._detailsMap.fitBounds(bounds, { padding: [30, 30] });
            window._detailsMap.setMaxBounds(paddedBounds);
            window._detailsMap.setMinZoom(window._detailsMap.getBoundsZoom(paddedBounds) - 1);
            window._detailsMap.on('drag', () => window._detailsMap.panInsideBounds(paddedBounds, { animate: false }));
        }
    }, 100);
}

// ── Form Submit ─────────────────────────────────────────────────────────────
document.getElementById('roadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const geojsonData = document.getElementById('roadGeoJSON').value;
    if (!geojsonData) { alert("Please map the road first."); return; }

    const kilometerText = document.getElementById('totalDistance').innerText;
    const kilometerVal = parseFloat(kilometerText.replace(' km', '')) || 0;
    const lguId = document.getElementById('roadMunicipality').value;

    const data = {
        startPoint:    document.getElementById('startPoint').value,
        endPoint:      document.getElementById('endPoint').value,
        kilometer:     kilometerVal,
        lguId:         lguId,
        pavementType:  document.getElementById('pavementType').value,
        roadStatus:    document.getElementById('stateCategory').value,
        geojsonData,
        createdBy:     currentProfile?.username || "Admin",
        updatedAt:     serverTimestamp()
    };

    data.roadId = `${data.startPoint} - ${data.endPoint}`;
    try {
        if (window._roadState.currentRoadId) {
            await updateDoc(doc(db, "RoadSections", window._roadState.currentRoadId), data);
            await logNotification(db, {
                type: 'edit',
                entity: 'road',
                title: 'Road Updated',
                message: `"${data.roadId}" in ${data.lguId} was updated.`
            });
            showTopToast("Road section successfully updated", 'create');
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "RoadSections"), data);
            await logNotification(db, {
                type: 'create',
                entity: 'road',
                title: 'Road Created',
                message: `"${data.roadId}" in ${data.lguId} was added.`
            });
            showTopToast("Road section successfully added", 'create');
        }
        closeModals();
    } catch (err) { console.error(err); }
});

// ── Delete Logic ────────────────────────────────────────────────────────────
function exitDeleteMode() {
    window._roadState.deleteMode = false;
    window._roadState.selectedRoads.clear();
    const btn = document.getElementById('deleteModeBtn');
    if (btn) { btn.classList.remove('active'); btn.querySelector('span').innerText = 'Delete Road'; }
}

function showDeleteConfirmation() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) { modal.style.display = 'flex'; setTimeout(() => modal.classList.add('active'), 10); }
}

function hideDeleteConfirmation() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300); }
}

async function executeMultiDelete() {
    const selectedIds = Array.from(window._roadState.selectedRoads);
    try {
        for (const id of selectedIds) {
            const road = window._roadState.allRoads.find(r => r.id === id);
            await deleteDoc(doc(db, "RoadSections", id));
            if (road) {
                await logNotification(db, {
                    type: 'delete',
                    entity: 'road',
                    title: 'Road Deleted',
                    message: `Road segment "${road.roadId || road.name}" was deleted.`
                });
            }
        }
        hideDeleteConfirmation();
        exitDeleteMode();
        renderTable();
        showTopToast(`${selectedIds.length} road${selectedIds.length > 1 ? 's' : ''} successfully deleted`, 'delete');
    } catch (err) {
        console.error(err);
        alert("Deletion failed.");
    }
}
