<?php $current_page = 'dashboard'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard | JAIROADS</title>

    <!-- Sidebar & Navigation handled by modular navigation.js -->
    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/pages/dashboard.css">
    <link rel="stylesheet" href="../../public/css/pages/MaintenanceProject.css">
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</head>
<body class="auth-protected">

    <?php include __DIR__ . '/../../partials/background.php'; ?>
    <?php include __DIR__ . '/../../partials/adminSidebar.php'; ?>

    <main id="mainContent" class="main-content dashboard-page">

        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>Admin Dashboard</h1>
            </div>
            <div class="global-actions">
                <button class="btn-notification" id="notifBellBtn" title="Notifications" style="position: relative;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span id="notifBadge" class="notif-badge is-hidden">0</span>
                </button>
            </div>
        </header>

        <!-- Notification Panel & Backdrop (at body level via JS) -->
        <div class="notif-backdrop" id="notifBackdrop"></div>
        <div class="notif-panel" id="notifPanel">
            <div class="notif-head">
                <div class="notif-head-left">
                    <div class="notif-head-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="notif-head-title">Notifications</p>
                        <p class="notif-head-sub">Admin Activity Log</p>
                    </div>
                </div>
                <button class="notif-mark-all-btn" id="markAllReadBtn">MARK ALL READ</button>
            </div>
            <div class="notif-list" id="notifList">
                <div id="notifEmpty" class="notif-empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <p>No notifications yet.</p>
                </div>
            </div>
            <div class="notif-footer">
                <a href="AdminActivityLog.php" class="notif-footer-link">VIEW ALL ACTIVITY LOGS</a>
            </div>
        </div>

        <div class="dashboard-container">

            <!-- Metric Cards -->
            <section class="metrics-section">
                <div class="metric-card">
                    <div class="metric-card-label">Total Users</div>
                    <div id="totalUsersVal" class="metric-card-value">—</div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-label">Maint. Projects</div>
                    <div id="totalProjectsVal" class="metric-card-value">—</div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-label">Monthly Updates</div>
                    <div id="totalUpdatesVal" class="metric-card-value">—</div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-label">Proj. Documents</div>
                    <div id="totalDocsVal" class="metric-card-value">—</div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-label">Road Sections</div>
                    <div id="totalRoadsVal" class="metric-card-value">—</div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-label">Total LGUs</div>
                    <div id="totalLGUsVal" class="metric-card-value">—</div>
                </div>
            </section>

            <!-- Map Section -->
            <section class="map-section">
                <header class="map-header">
                    <div class="hdr-box">
                        <div class="hdr-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                                <line x1="8" y1="2" x2="8" y2="18"></line>
                                <line x1="16" y1="6" x2="16" y2="22"></line>
                            </svg>
                        </div>
                        <h2>Infrastructure Network Grid</h2>
                    </div>
                    <div class="map-filters">
                        <select id="municipalityFilter" class="map-select">
                            <option value="All">All Municipalities</option>
                            <option value="Compostela">Compostela</option>
                            <option value="Laak">Laak</option>
                            <option value="Mabini">Mabini</option>
                            <option value="Maco">Maco</option>
                            <option value="Maragusan">Maragusan</option>
                            <option value="Mawab">Mawab</option>
                            <option value="Monkayo">Monkayo</option>
                            <option value="Montevista">Montevista</option>
                            <option value="Nabunturan">Nabunturan</option>
                            <option value="New Bataan">New Bataan</option>
                            <option value="Pantukan">Pantukan</option>
                        </select>
                        <select id="statusFilter" class="map-select">
                            <option value="All">All Statuses</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Terminated">Terminated</option>
                        </select>
                    </div>
                </header>

                <div class="map-content-area">
                    <div id="map"></div>

                    <!-- Floating Project Details -->
                    <div id="mapProjectDetails" class="map-project-details hidden">
                        <div class="details-glass-header">
                            <div id="detailStatusBadge" class="status-pill status-ongoing">Ongoing</div>
                            <button id="closeMapDetails" class="close-details-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="details-body">
                            <div class="details-label">PROJECT TITLE</div>
                            <h3 id="detailProjectTitle">---</h3>
                            <div class="details-meta-grid">
                                <div class="meta-item">
                                    <div class="meta-label">MUNICIPALITY</div>
                                    <div id="detailMunicipality" class="meta-value">---</div>
                                </div>
                                <div class="meta-item">
                                    <div class="meta-label">ENGINEER</div>
                                    <div id="detailEngineer" class="meta-value">---</div>
                                </div>
                                <div class="meta-item">
                                    <div class="meta-label">BUDGET</div>
                                    <div id="detailBudget" class="meta-value">---</div>
                                </div>
                                <div class="meta-item">
                                    <div class="meta-label">TIMELINE</div>
                                    <div id="detailTimeline" class="meta-value">---</div>
                                </div>
                            </div>
                            <div class="affected-summary">
                                <div class="details-label">AFFECTED ASSETS</div>
                                <div id="detailRoadsList" class="roads-mini-list"></div>
                            </div>
                        </div>
                        <div class="details-footer">
                            <a id="detailViewFull" href="#" class="view-full-btn">
                                <span>VIEW FULL PROJECT RECORD</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div class="map-legend">
                        <div class="legend-item"><div class="legend-dot dot-ongoing"></div><span class="legend-text">Ongoing</span></div>
                        <div class="legend-item"><div class="legend-dot dot-completed"></div><span class="legend-text">Completed</span></div>
                        <div class="legend-item"><div class="legend-dot dot-terminated"></div><span class="legend-text">Terminated</span></div>
                    </div>

                    <div class="map-tools">
                        <button id="focusBtn" class="map-tool-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path>
                                <path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path>
                            </svg>
                            <span>Focus Area</span>
                        </button>
                    </div>

                    <div class="map-tools-right">
                        <button id="btnFullScreen" class="map-tool-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                            </svg>
                            <span id="fullScreenText">Full Screen</span>
                        </button>
                    </div>
                </div>
            </section>

            <!-- Bottom Data Grid -->
            <section class="data-grid-section">
                <div class="data-card">
                    <header class="data-card-header">
                        <h3>Recent Maintenance Projects</h3>
                        <a href="AdminMaintenanceProject.php" class="view-all-link">Manage All Projects</a>
                    </header>
                    <div class="data-card-content" id="criticalProjectsList">
                        <div class="empty-state">Loading...</div>
                    </div>
                </div>
                <div class="data-card">
                    <header class="data-card-header">
                        <h3>Recent System Activity</h3>
                        <a href="AdminActivityLog.php" class="view-all-link">View All Logs</a>
                    </header>
                    <div class="data-card-content" id="recentActivityList">
                        <div class="empty-state">Loading...</div>
                    </div>
                </div>
            </section>

        </div>
    </main>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script type="module" src="../../public/js/pages/Dashboard.js"></script>
</body>
</html>