/* Dashboard.js */

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
        const { user, profile } = await requireRole(['Admin', 'Administrator']);
        currentUser = user;
        currentProfile = profile;
        console.log('Authenticated for Admin Dashboard:', currentUser.email);
        
        initDashboardModule();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

window._dashboardState = {
    allProjects: [], filteredProjects: [],
    allLGUs: [], // Add LGU store
    allEngineers: [], // Add Engineers store
    map: null, markers: [], selectedRoadLayers: [],
    activeBaseLayer: 'osm', layers: {}
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
const defaultZoom      = 10;

// ── Boot ────────────────────────────────────────────────────────────────────
function initDashboardModule() {
    initMap();
    initFirestore();
    setupFilters();
    setupMapTools();
    initNotificationsModule();
    initCriticalProjects();
    initRecentActivity();
}

// ── MAP ──────────────────────────────────────────────────────────────────────
function initMap() {
    if (typeof L === 'undefined') return;
    const map = L.map('map', {
        scrollWheelZoom: true,
        zoomControl: false
    }).setView(davaoDeOroCenter, defaultZoom);

    L.control.zoom({ position: 'topleft' }).addTo(map);

    const osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap' }
    );
    const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Tiles © Esri' }
    );

    osmLayer.addTo(map);
    window._dashboardState.map    = map;
    window._dashboardState.layers = { osm: osmLayer, satellite: satelliteLayer };

    setTimeout(() => {
        if (map) {
            map.invalidateSize();
            // Force a second invalidate after a longer delay for layout shifts
            setTimeout(() => map.invalidateSize(), 800);
        }
    }, 200);
}

// ── FIRESTORE ────────────────────────────────────────────────────────────────
function initFirestore() {
    // 1. Total LGUs
    onSnapshot(collection(db, "LGUs"), (snapshot) => {
        window._dashboardState.allLGUs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const muniFilter = document.getElementById('municipalityFilter');
        if (muniFilter) {
            const currentVal = muniFilter.value;
            muniFilter.innerHTML = '<option value="All">All Municipalities</option>';
            window._dashboardState.allLGUs.sort((a,b) => (a.municipalityName||"").localeCompare(b.municipalityName||"")).forEach(lgu => {
                const opt = document.createElement('option');
                opt.value = lgu.id; opt.textContent = lgu.municipalityName;
                muniFilter.appendChild(opt);
            });
            if (currentVal) muniFilter.value = currentVal;
        }
        const el = document.getElementById('totalLGUsVal');
        if (el) el.innerText = snapshot.size;
        applyFilters();
    });

    // 2. Total Maintenance Projects
    onSnapshot(collection(db, "MaintenanceProjects"), (snapshot) => {
        window._dashboardState.allProjects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const el = document.getElementById('totalProjectsVal');
        if (el) el.innerText = snapshot.size;
        applyFilters();
    });

    // 3. Total Users
    onSnapshot(collection(db, "UserAccounts"), (snapshot) => {
        const el = document.getElementById('totalUsersVal');
        if (el) el.innerText = snapshot.size;
    });

    // 4. Total Monthly Updates
    onSnapshot(collection(db, "MonthlyUpdates"), (snapshot) => {
        const el = document.getElementById('totalUpdatesVal');
        if (el) el.innerText = snapshot.size;
    });

    // 5. Total Project Documents
    onSnapshot(collection(db, "ProjectDocuments"), (snapshot) => {
        const el = document.getElementById('totalDocsVal');
        if (el) el.innerText = snapshot.size;
    });

    // 6. Total Road Sections
    onSnapshot(collection(db, "RoadSections"), (snapshot) => {
        const el = document.getElementById('totalRoadsVal');
        if (el) el.innerText = snapshot.size;
    });

    // 7. Engineers Lookup
    onSnapshot(collection(db, "Engineers"), (snapshot) => {
        window._dashboardState.allEngineers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    });
}

// ── FILTERS ──────────────────────────────────────────────────────────────────
function setupFilters() {
    ['municipalityFilter', 'statusFilter'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const muniFilterVal = document.getElementById('municipalityFilter')?.value || 'All';
    const status = document.getElementById('statusFilter')?.value       || 'All';

    window._dashboardState.filteredProjects = window._dashboardState.allProjects.filter(p => {
        const pLguId = p.lguId || p.municipality || '';
        const targetLgu = window._dashboardState.allLGUs?.find(l => 
            l.id === pLguId || 
            (l.municipalityName && pLguId && l.municipalityName.toLowerCase() === pLguId.toLowerCase())
        );
        const muniName = targetLgu ? targetLgu.municipalityName : pLguId;

        const matchMuni = muniFilterVal === 'All' || pLguId === muniFilterVal || (muniName && muniName.toLowerCase() === muniFilterVal.toLowerCase());
        const matchStatus = status === 'All' || (p.status || '').toLowerCase() === status.toLowerCase();
        return matchMuni && matchStatus;
    });
    renderMarkers();
    closeProjectDetails();
}

// ── MARKERS ──────────────────────────────────────────────────────────────────
function renderMarkers() {
    const { map, markers, filteredProjects } = window._dashboardState;
    if (!map) return;
    markers.forEach(m => map.removeLayer(m));
    window._dashboardState.markers = [];
    clearRoadGeometries();

    filteredProjects.forEach(p => {
        let coords = [
            7.6044 + (Math.random() - 0.5) * 0.1,
            125.9522 + (Math.random() - 0.5) * 0.1
        ];

        // If project has specific location or linked road, use it. 
        // For simplicity in dashboard, keeping random jitter around center if no geoData.
        
        const icon = L.divIcon({
            className: 'project-marker-container',
            html: `<div class="project-marker-dot dot-${(p.status || 'Ongoing').toLowerCase()}"></div>`,
            iconSize: [20, 20], iconAnchor: [10, 10]
        });

        // Use coordinates from first affected road if available, else random
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
            } catch (e) {
                console.warn("Could not get coords from road, using random jitter.");
            }
        }

        const marker = L.marker(displayCoords, { icon })
            .on('click', () => handleProjectClick(p))
            .addTo(map);
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
    if (s === 'completed' || s === 'finished')  return '#10B981';
    if (s === 'terminated') return '#EF4444';
    return '#FBBF24';
}

function clearRoadGeometries() {
    const { map, selectedRoadLayers } = window._dashboardState;
    if (!map) return;
    selectedRoadLayers.forEach(l => map.removeLayer(l));
    window._dashboardState.selectedRoadLayers = [];
}

// ── PROJECT DETAILS PANEL ────────────────────────────────────────────────────
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
    document.getElementById('detailEngineer').innerText     = getEngineerDisplayName(project.managingEngineerId || project.engineer);
    document.getElementById('detailBudget').innerText       = project.budget ? `₱${Number(project.budget).toLocaleString()}` : 'TBD';

    const start = project.startDate ? new Date(project.startDate).toLocaleDateString() : '---';
    const end   = project.endDate   ? new Date(project.endDate).toLocaleDateString()   : '---';
    document.getElementById('detailTimeline').innerText = `${start} to ${end}`;

    const badge = document.getElementById('detailStatusBadge');
    const status = project.status || 'Ongoing';
    badge.innerText   = status;
    badge.className   = `status-pill status-${status.toLowerCase()}`;

    const roadsList = document.getElementById('detailRoadsList');
    roadsList.innerHTML = '';
    // Optional: Fetch connected road sections if ERD allows
    roadsList.innerHTML = '<div class="no-roads" style="font-size:11px;color:#9CA3AF;">Asset mapping visible in full record</div>';

    const viewFull = document.getElementById('detailViewFull');
    if (viewFull) viewFull.href = `AdminMaintenanceProject.php?id=${project.id}`;
}

function closeProjectDetails() {
    const details = document.getElementById('mapProjectDetails');
    if (!details) return;
    details.classList.remove('active');
    setTimeout(() => {
        if (!details.classList.contains('active')) details.classList.add('hidden');
    }, 300);
    clearRoadGeometries();
}

// ── MAP TOOLS ────────────────────────────────────────────────────────────────
function setupMapTools() {
    document.getElementById('toggleLayerBtn')?.addEventListener('click', () => {
        const { layers, activeBaseLayer, map } = window._dashboardState;
        if (!map) return;
        if (activeBaseLayer === 'osm') {
            map.removeLayer(layers.osm);
            layers.satellite.addTo(map);
            window._dashboardState.activeBaseLayer = 'satellite';
            document.getElementById('layerText').innerText = 'Switch to OSM';
        } else {
            map.removeLayer(layers.satellite);
            layers.osm.addTo(map);
            window._dashboardState.activeBaseLayer = 'osm';
            document.getElementById('layerText').innerText = 'Switch to Satellite';
        }
    });

    document.getElementById('focusBtn')?.addEventListener('click', () => {
        window._dashboardState.map?.flyTo(davaoDeOroCenter, defaultZoom);
    });

    document.getElementById('closeMapDetails')?.addEventListener('click', closeProjectDetails);

    const btnFS  = document.getElementById('btnFullScreen');
    const mapArea = document.querySelector('.map-content-area');
    const fsText  = document.getElementById('fullScreenText');

    btnFS?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            mapArea?.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
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

// ── CRITICAL PROJECTS ─────────────────────────────────────────────────────────
function initCriticalProjects() {
    onSnapshot(collection(db, 'MaintenanceProjects'), (snapshot) => {
        const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const critical = all
            .filter(p => p.status?.toLowerCase() === 'ongoing' || p.status?.toLowerCase() === 'terminated')
            .sort((a, b) => (b.updatedAt?.toDate?.() || 0) - (a.updatedAt?.toDate?.() || 0))
            .slice(0, 5);

        const container = document.getElementById('criticalProjectsList');
        if (!container) return;

        container.innerHTML = critical.length === 0 ? '<div class="empty-state">No critical projects at this time.</div>' : critical.map(p => {
            const lguId = p.lguId || p.municipality || '';
            const targetLgu = window._dashboardState.allLGUs?.find(l => l.id === lguId || l.municipalityName === lguId);
            const muniName = targetLgu ? targetLgu.municipalityName : lguId;
            return `
            <a href="AdminMaintenanceProject.php?id=${p.id}" class="crit-row">
                <div class="crit-row-left">
                    <div class="crit-row-title">${p.projectTitle || p.title || 'Untitled'}</div>
                    <div class="crit-row-meta">${muniName}</div>
                </div>
                <span class="crit-badge ${(p.status || 'ongoing').toLowerCase()}">${p.status}</span>
            </a>`;
        }).join('');
    });
}

// ── RECENT ACTIVITY ───────────────────────────────────────────────────────────
function initRecentActivity() {
    const ACT_ICONS = {
        create: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
        edit:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
        delete: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
        info:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };
    onSnapshot(query(collection(db, 'Notifications'), orderBy('createdAt', 'desc'), limit(3)), (snapshot) => {
        const container = document.getElementById('recentActivityList');
        if (!container) return;
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        container.innerHTML = items.length === 0 ? '<div class="empty-state">No recent logs.</div>' : items.map(n => `
            <div class="act-row">
                <div class="act-icon ${n.type || 'info'}">${ACT_ICONS[n.type] || ACT_ICONS.info}</div>
                <div class="act-body">
                    <div class="act-title">${n.title || 'System Action'}</div>
                    <div class="act-msg">${n.message || ''}</div>
                    <div class="act-time">${timeAgo(n.createdAt)}</div>
                </div>
            </div>`).join('');
    });
}
