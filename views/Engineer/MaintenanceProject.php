<?php $current_page = 'maintenance_projects'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAIROADS - Maintenance Projects</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    
    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/pages/MaintenanceProject.css">
    <link rel="stylesheet" href="../../public/css/forms/MPForms.css">
    <link rel="stylesheet" href="../../public/css/details/MPDetails.css">
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
</head>
<body>
    
    <!-- SVG Background Shell -->
    <?php include __DIR__ . '/../../partials/background.php'; ?>

    <!-- Side Navigation -->
    <?php include __DIR__ . '/../../partials/sidebar.php'; ?>

    <main id="mainContent" class="main-content maintenance-page">
        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>Maintenance Projects</h1>
            </div>

            <div class="global-actions">
                <button class="btn-notification" title="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
                <button id="openModalBtn" class="btn-quick-add">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Add Project</span>
                </button>
            </div>
        </header>

        <div class="page-container">
            <section class="filter-shell">
                <div class="filter-search">
                    <svg class="filter-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="tableSearch" placeholder="Search by project title...">
                </div>
                <div class="filter-actions">
                    <select id="filterMunicipality" class="filter-btn">
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

                    <select id="filterStatus" class="filter-btn">
                        <option value="All">All Statuses</option>
                        <option value="Completed">Completed</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Terminated">Terminated</option>
                    </select>

                    <select id="filterSort" class="filter-btn">
                        <option value="Newest">Newest First</option>
                        <option value="Oldest">Oldest First</option>
                        <option value="A-Z">A - Z</option>
                        <option value="Z-A">Z - A</option>
                    </select>

                    <select id="filterEngineer" class="filter-btn">
                        <option value="All">All Assigned Engineers</option>
                    </select>

                    <button id="refreshBtn" class="refresh-btn" type="button">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                    </button>
                </div>
            </section>

            <section class="records-shell">
                <div class="records-head">
                    <div class="head-col">Project Title</div>
                    <div class="head-col">Municipality</div>
                    <div class="head-col">Status</div>
                    <div class="head-col">Engineer</div>
                    <div class="head-col">Timeline</div>
                    <div class="head-col actions-col" style="text-align: right;">Actions</div>
                </div>

                <div id="recordsBody" class="records-body">
                    <div class="records-placeholder">
                        Place your records here. No projects found.
                    </div>
                </div>

                <div class="records-footer">
                    <p id="recordsNote" class="records-note">Showing 0 of 0 projects</p>
                    <div id="paginationControls" class="pagination"></div>
                </div>
            </section>
        </div>
    </main>

    <!-- Notification Backdrop & Panel -->
    <div id="notifBackdrop" class="notif-backdrop"></div>
    <div id="notifPanel" class="notif-panel">
        <div class="notif-head">
            <div class="notif-head-left">
                <div class="notif-head-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                </div>
                <div>
                    <p class="notif-head-title">Notifications</p>
                    <p class="notif-head-sub">Recent Activity</p>
                </div>
            </div>
            <button id="markAllReadBtn" class="notif-mark-all-btn">MARK ALL READ</button>
        </div>
        <div id="notifList" class="notif-list">
            <div id="notifEmpty" class="notif-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>All caught up!</p>
            </div>
        </div>
        <div class="notif-footer">
            <a class="notif-footer-link" href="EngineerActivityLog.php">View Activity Log</a>
        </div>
    </div>

    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

    <?php include __DIR__ . '/../components/modal/MPDetails.php'; ?>
    <?php include __DIR__ . '/../components/forms/MPForms.php'; ?>

    <script type="module" src="../../public/js/pages/MaintenanceProject.js"></script>
    <script>
        if (window.lucide) lucide.createIcons();
    </script>
</body>
</html>