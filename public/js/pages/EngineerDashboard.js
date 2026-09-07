/* EngineerDashboard.js */

import { db, auth } from '../firebase-config.js';
import { 
    collection, 
    onSnapshot, 
    query, 
    orderBy, 
    limit, 
    updateDoc, 
    doc, 
    writeBatch 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { requireRole } from '../auth-guard.js';
import { initNotifications, timeAgo } from './notifications.js';

// ── Auth Guard ─────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;

async function checkAuth() {
    try {
        // Engineers can access their dashboard, Admins might also be allowed but priority is Engineer
        const { user, profile } = await requireRole(['Engineer', 'Admin', 'Administrator']);
        currentUser = user;
        currentProfile = profile;
        console.log('Authenticated for Engineer Dashboard:', currentUser?.email);
        
        initEngineerDashboardModule();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

window._dashboardState = {
    allProjects: [], filteredProjects: [],
    allLGUs: [], // Add LGU store
    allEngineers: [], // Add Engineers store
    map: null, markers: [], selectedRoadLayers: [], activeBaseLayer: 'osm'
};

// Helper to get Engineer Display Name
const getEngineerDisplayName = (idOrName) => {
    if (!idOrName) return 'Unassigned';
    if (!window._dashboardState.allEngineers) return idOrName;
    
    const eng = window._dashboardState.allEngineers.find(e => 
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

const davaoDeOroCenter = [7.6044, 125.9522];
const defaultZoom = 10;

function initEngineerDashboardModule() {
    initMap();
    initFirestore();
    setupFilters();
    setupMapTools();
    initNotificationsModule();
    initRecentProjects();
    initRecentActivity();
}

// ── MAP ──────────────────────────────────────────────────────────────────────
function initMap() {
    if (typeof L === 'undefined') return;
    const map = L.map('map', { scrollWheelZoom: true, zoomControl: false }).setView(davaoDeOroCenter, defaultZoom);
    L.control.zoom({ position: 'topleft' }).addTo(map);
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' });
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles © Esri' });
    osmLayer.addTo(map);
    window._dashboardState.map = map;
    window._dashboardState.layers = { osm: osmLayer, satellite: satelliteLayer };
}

function initFirestore() {
    // 1. Fetch LGUs
    onSnapshot(collection(db, "LGUs"), (snapshot) => {
        window._dashboardState.allLGUs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Update Municipality dropdown
        const muniFilter = document.getElementById('municipalityFilter');
        if (muniFilter) {
            const currentVal = muniFilter.value;
            muniFilter.innerHTML = '<option value="All">All Municipalities</option>';
            window._dashboardState.allLGUs.sort((a,b) => (a.municipalityName||"").localeCompare(b.municipalityName||"")).forEach(lgu => {
                const opt = document.createElement('option');
                opt.value = lgu.id;
                opt.textContent = lgu.municipalityName;
                muniFilter.appendChild(opt);
            });
            if (currentVal) muniFilter.value = currentVal;
        }
        applyFilters();
    });

    onSnapshot(collection(db, "MaintenanceProjects"), (snapshot) => {
        window._dashboardState.allProjects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        applyFilters();
        updateMetricCards();
    });

    onSnapshot(collection(db, "Engineers"), (snapshot) => {
        window._dashboardState.allEngineers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    });
}

function updateMetricCards() {
    const projects = window._dashboardState.allProjects;
    const el = (id) => document.getElementById(id);
    if (el('totalProjectsVal'))      el('totalProjectsVal').innerText      = projects.length;
    if (el('ongoingProjectsVal'))    el('ongoingProjectsVal').innerText    = projects.filter(p => p.status?.toLowerCase() === 'ongoing').length;
    if (el('completedProjectsVal'))  el('completedProjectsVal').innerText  = projects.filter(p => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'finished').length;
    if (el('terminatedProjectsVal')) el('terminatedProjectsVal').innerText = projects.filter(p => p.status?.toLowerCase() === 'terminated').length;
}

function setupFilters() {
    ['municipalityFilter', 'statusFilter'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const muniFilterVal = document.getElementById('municipalityFilter')?.value || "All";
    const statusVal = document.getElementById('statusFilter')?.value       || "All";
    window._dashboardState.filteredProjects = window._dashboardState.allProjects.filter(p => {
        const lguId = p.lguId || p.municipality || '';
        const muniMatch = muniFilterVal === "All" || lguId === muniFilterVal || (lguId).toLowerCase() === muniFilterVal.toLowerCase();
        const statusMatch = statusVal === "All" || (p.status || '').toLowerCase() === statusVal.toLowerCase();
        return muniMatch && statusMatch;
    });
    renderMarkers();
    closeProjectDetails();
}

function renderMarkers() {
    const { map, markers, filteredProjects } = window._dashboardState;
    if (!map) return;
    markers.forEach(m => map.removeLayer(m));
    window._dashboardState.markers = [];
    clearRoadGeometries();

    filteredProjects.forEach(p => {
        let coords = [7.6044 + (Math.random() - 0.5) * 0.1, 125.9522 + (Math.random() - 0.5) * 0.1];
        
        const s = (p.status || '').toLowerCase();
        const color = (s === 'completed' || s === 'finished') ? '#10B981' : s === 'terminated' ? '#EF4444' : '#FBBF24';
        const icon = L.divIcon({
            className: 'project-marker-container',
            html: `<div class="project-marker-dot dot-${s}"></div>`,
            iconSize: [20, 20], iconAnchor: [10, 10]
        });

        // Use coordinates from first affected road if available, else random jitter
        let displayCoords = coords;
        if (p.affectedRoads && p.affectedRoads.length > 0) {
            try {
                const firstRoad = p.affectedRoads[0];
                const geoStr = firstRoad.geojsonData || firstRoad.geoJSON;
                if (geoStr) {
                    const geo = JSON.parse(geoStr);
                    if (geo.geometry.coordinates && geo.geometry.coordinates.length > 0) {
                        displayCoords = [geo.geometry.coordinates[0][1], geo.geometry.coordinates[0][0]];
                    }
                }
            } catch (e) {}
        }

        const marker = L.marker(displayCoords, { icon }).on('click', () => handleProjectClick(p)).addTo(map);
        window._dashboardState.markers.push(marker);
    });
}

function handleProjectClick(project) {
    clearRoadGeometries();
    const { map } = window._dashboardState;
    if (!map) return;

    if (project.affectedRoads && project.affectedRoads.length > 0) {
        const group = L.featureGroup();
        project.affectedRoads.forEach(road => {
            const geoStr = road.geojsonData || road.geoJSON;
            if (geoStr) {
                try {
                    const geoData = JSON.parse(geoStr);
                    const layer = L.geoJSON(geoData, {
                        style: { color: '#78350F', weight: 8, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }
                    }).addTo(map);
                    window._dashboardState.selectedRoadLayers.push(layer);
                    group.addLayer(layer);
                } catch (e) {}
            }
        });
        if (group.getLayers().length > 0) {
            map.fitBounds(group.getBounds(), { padding: [100, 100], maxZoom: 15 });
        }
    }

    showProjectDetails(project);
}

function getStatusColor(status) {
    const s = (status || '').toLowerCase();
    if (s === 'completed' || s === 'finished') return '#10B981';
    if (s === 'terminated') return '#EF4444';
    return '#FBBF24';
}

function clearRoadGeometries() {
    const { map, selectedRoadLayers } = window._dashboardState;
    if (!map) return;
    selectedRoadLayers.forEach(l => map.removeLayer(l));
    window._dashboardState.selectedRoadLayers = [];
}

function showProjectDetails(project) {
    const details = document.getElementById('mapProjectDetails');
    if (!details) return;
    details.classList.remove('hidden');
    void details.offsetWidth;
    details.classList.add('active');

    const lguId = project.lguId || project.municipality || '';
    const targetLgu = window._dashboardState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
    const muniName = targetLgu ? targetLgu.municipalityName : lguId;

    document.getElementById('detailProjectTitle').innerText = project.projectTitle || project.title || '---';
    document.getElementById('detailMunicipality').innerText = muniName;
    document.getElementById('detailEngineer').innerText = getEngineerDisplayName(project.managingEngineerId || project.engineer);
    document.getElementById('detailBudget').innerText = project.budget ? `₱${Number(project.budget).toLocaleString()}` : 'TBD';
    const start = project.startDate ? new Date(project.startDate).toLocaleDateString() : '---';
    const end   = project.endDate   ? new Date(project.endDate).toLocaleDateString()   : '---';
    document.getElementById('detailTimeline').innerText = `${start} to ${end}`;
    const badge = document.getElementById('detailStatusBadge');
    badge.innerText   = project.status || 'Ongoing';
    badge.className   = `status-pill status-${(project.status || 'ongoing').toLowerCase()}`;

    const roadsList = document.getElementById('detailRoadsList');
    roadsList.innerHTML = '<div class="no-roads">No linked assets</div>';

    const viewFull = document.getElementById('detailViewFull');
    if (viewFull) viewFull.href = `MaintenanceProject.php?id=${project.id}`;
}

function closeProjectDetails() {
    const details = document.getElementById('mapProjectDetails');
    if (details) {
        details.classList.remove('active');
        setTimeout(() => { if (!details.classList.contains('active')) details.classList.add('hidden'); }, 300);
    }
    clearRoadGeometries();
}

function setupMapTools() {
    document.getElementById('toggleLayerBtn')?.addEventListener('click', function () {
        const { layers, activeBaseLayer, map } = window._dashboardState;
        if (!map) return;
        if (activeBaseLayer === 'osm') {
            map.removeLayer(layers.osm); layers.satellite.addTo(map);
            window._dashboardState.activeBaseLayer = 'satellite';
            document.getElementById('layerText').innerText = 'Switch to OSM';
        } else {
            map.removeLayer(layers.satellite); layers.osm.addTo(map);
            window._dashboardState.activeBaseLayer = 'osm';
            document.getElementById('layerText').innerText = 'Switch to Satellite';
        }
    });
    document.getElementById('focusBtn')?.addEventListener('click', () => window._dashboardState.map?.flyTo(davaoDeOroCenter, defaultZoom));
    document.getElementById('closeMapDetails')?.addEventListener('click', closeProjectDetails);

    const btnFS   = document.getElementById('btnFullScreen');
    const mapArea = document.querySelector('.map-content-area');
    const fsText  = document.getElementById('fullScreenText');
    btnFS?.addEventListener('click', () => {
        if (!document.fullscreenElement) mapArea?.requestFullscreen().catch(err => console.error(err));
        else document.exitFullscreen();
    });
    document.addEventListener('fullscreenchange', () => {
        const isFS = !!document.fullscreenElement;
        if (fsText) fsText.innerText = isFS ? 'Exit Full Screen' : 'Full Screen';
        mapArea?.classList.toggle('is-fullscreen', isFS);
        setTimeout(() => window._dashboardState.map?.invalidateSize(), 100);
    });
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function initNotificationsModule() {
    try {
        initNotifications(db);
    } catch (err) {
        console.warn('Dashboard notification init failed:', err);
    }
}

function initRecentProjects() {
    onSnapshot(collection(db, "MaintenanceProjects"), (snapshot) => {
        const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const recent = all
            .sort((a, b) => (b.updatedAt?.toDate?.() || 0) - (a.updatedAt?.toDate?.() || 0))
            .slice(0, 5);

        const container = document.getElementById('recentProjectsList');
        if (!container) return;

        container.innerHTML = recent.length === 0 ? '<div class="empty-state">No projects.</div>' : recent.map(p => {
            const lguId = p.lguId || p.municipality || '';
            const targetLgu = window._dashboardState.allLGUs?.find(l => 
                l.id === lguId || 
                (l.municipalityName && lguId && l.municipalityName.toLowerCase() === lguId.toLowerCase())
            );
            const muniName = targetLgu ? targetLgu.municipalityName : lguId;
            return `
            <a href="MaintenanceProject.php?id=${p.id}" class="crit-row">
                <div class="crit-row-left">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <div class="crit-row-title" style="margin:0;">${p.projectTitle || p.title || 'Untitled Project'}</div>
                        <span class="crit-badge ${(p.status || 'ongoing').toLowerCase()}">${p.status || 'Ongoing'}</span>
                    </div>
                    <div class="crit-row-meta" style="margin-bottom:12px;">${muniName} · Manage by ${getEngineerDisplayName(p.managingEngineerId || p.engineer)}</div>
                    <div style="font-size:10px; color:#94a3b8; font-weight:700; margin-top:12px; border-top:1px solid #f1f5f9; padding-top:8px; display:flex; justify-content:space-between;">
                         <span>Budget: ${p.budget ? `₱${Number(p.budget).toLocaleString()}` : 'TBD'}</span>
                         <span>Ref: ${p.id.slice(0,8).toUpperCase()}</span>
                    </div>
                </div>
            </a>`;
        }).join('');
    });
}

function initRecentActivity() {
    const q = query(collection(db, "MonthlyUpdates"), orderBy("createdAt", "desc"), limit(5));
    onSnapshot(q, (snapshot) => {
        const container = document.getElementById('recentActivityList');
        if (!container) return;
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        container.innerHTML = items.length === 0 ? `
            <div class="empty-state">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;opacity:0.5;">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                <p>No recent activity detected.</p>
            </div>` : items.map(u => {
            const prog = u.progressPercentage || 0;
            const lguId = u.municipality || u.lguId || '';
            const targetLgu = window._dashboardState?.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
            const lguName = targetLgu ? targetLgu.municipalityName : lguId || '---';
            return `
                <a href="MonthlyUpdates.php?id=${u.id}" class="act-row">
                    <div class="act-body">
                        <div class="act-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <div class="act-title" style="font-weight:700; font-size:13px; color:#1e293b; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${u.projectTitle || 'Untitled Project'}</div>
                            <span class="status-pill status-${prog >= 100 ? 'completed' : 'ongoing'}" style="font-size:9px; font-weight:700;">${prog >= 100 ? 'FINISHED' : 'ONGOING'}</span>
                        </div>
                        <div class="act-msg" style="font-size:11px; color:#64748b; margin-bottom:8px;">Update for ${u.updateMonth || 'N/A'} · ${lguName}</div>
                        <div class="act-progress-container" style="height:6px; background:#f1f5f9; border-radius:10px; overflow:hidden; display:flex; align-items:center; gap:8px;">
                            <div class="act-progress-bar" style="flex:1; height:100%; background:#e2e8f0; border-radius:10px; position:relative;">
                                <div class="act-progress-fill" style="width:${prog}%; height:100%; background:#78350f; border-radius:10px; transition:width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                            </div>
                            <span class="act-progress-text" style="font-size:10px; font-weight:800; color:#1e293b; min-width:30px;">${prog}%</span>
                        </div>
                        <div class="act-time" style="margin-top:10px; font-size:10px; color:#94a3b8; font-weight:500;">${timeAgo(u.createdAt)}</div>
                    </div>
                </a>`;
        }).join('');
    });
}
