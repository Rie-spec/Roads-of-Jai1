<?php $current_page = 'roads'; ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Road Sections | JAIROADS</title>
    <!-- CSS Dependencies -->
    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/pages/RoadSection.css">
    <link rel="stylesheet" href="../../public/css/forms/RSForms.css">
    <link rel="stylesheet" href="../../public/css/details/RSDetails.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css" />
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    </style>
</head>
<body class="page-layout">

    <!-- Sidebar & Shared Assets -->
    <?php include __DIR__ . '/../../partials/background.php'; ?>
    <?php include __DIR__ . '/../../partials/adminSidebar.php'; ?>

    <main id="mainContent" class="main-content road-section-page">
        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>Road Section Management (Admin)</h1>
            </div>

            <div class="global-actions">
                <button class="btn-notification" title="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
                <button id="btnAddNewRoad" class="btn-quick-add">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Add Road Section</span>
                </button>
                <button id="deleteModeBtn" class="btn-delete-toggle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    <span>Delete Road</span>
                </button>
            </div>
        </header>

        <div class="page-container">
            <!-- Filter Bar -->
            <section class="filter-shell">
                <div class="filter-search">
                    <svg class="filter-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="roadSearch" placeholder="Search by road name...">
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

                    <select id="filterStateCategory" class="filter-btn">
                        <option value="All">All State</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Bad">Bad</option>
                    </select>

                    <select id="filterPavement" class="filter-btn">
                        <option value="All">All Pavements</option>
                        <option value="Concrete">Concrete</option>
                        <option value="Asphalt">Asphalt</option>
                        <option value="Gravel">Gravel</option>
                        <option value="Earth">Earth</option>
                    </select>

                    <select id="filterSort" class="filter-btn">
                        <option value="Newest First">Newest First</option>
                        <option value="Oldest First">Oldest First</option>
                        <option value="A-Z">A - Z</option>
                    </select>

                    <button id="refreshBtn" class="refresh-btn" type="button">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                    </button>
                </div>
            </section>

            <!-- Table Section -->
            <section class="records-shell">
                <div class="records-head">
                    <div class="head-col">Road Name</div>
                    <div class="head-col">Municipality</div>
                    <div class="head-col">State Category</div>
                    <div class="head-col">Pavement Type</div>
                    <div class="head-col">Spatial Data</div>
                    <div class="head-col actions-col" style="text-align: right;">Actions</div>
                </div>

                <div id="roadsTableBody" class="records-body">
                    <div class="records-placeholder">
                        Loading provincial road network...
                    </div>
                </div>

                <div class="records-footer">
                    <p id="recordsNote" class="records-note">Showing 0 roads</p>
                </div>
            </section>
        </div>
    </main>

    <!-- Modals -->
    <?php include __DIR__ . '/../components/forms/RSForms.php'; ?>
    <?php include __DIR__ . '/../components/modal/RSDetails.php'; ?>

    <!-- Delete Confirmation Modal (Admin Only) -->
    <div class="modal-overlay" id="deleteConfirmModal" style="display: none;">
    <div class="modal-box" style="width: 400px; background: #fff; border-radius: 24px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
        <div style="margin-bottom: 24px; text-align: center;">
            <div style="width: 64px; height: 64px; background: #fee2e2; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </div>
            <h3 style="color: #ef4444; font-size: 20px; font-weight: 800; margin-bottom: 8px;">Delete Road Section?</h3>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">This is permanent. All selected records will be removed from the servers and cannot be recovered.</p>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 32px;">
            <button class="btn-modal-cancel" id="cancelDeleteBtn" style="flex: 1; padding: 14px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; font-weight: 700; cursor: pointer; transition: all 0.2s;">CANCEL</button>
            <button class="btn-modal-confirm" id="confirmDeleteBtn" style="flex: 1; padding: 14px; border-radius: 14px; border: none; background: #ef4444; color: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);">DELETE FOREVER</button>
        </div>
    </div>
</div>

    <div id="notifBackdrop" class="notif-backdrop"></div>
<div id="notifPanel" class="notif-panel">
    <div class="notif-head">
        <div class="notif-head-left">
            <div class="notif-head-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div>
                <p class="notif-head-title">Notifications</p>
                <p class="notif-head-sub">Admin Activity Log</p>
            </div>
        </div>
        <button id="markAllReadBtn" class="notif-mark-all-btn">Mark All Read</button>
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
        <a class="notif-footer-link" href="AdminActivityLog.php">View All Activity Logs</a>
    </div>
</div>

<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

    <!-- JS Dependencies -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"></script>
    <script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>
    <script type="module" src="../../public/js/pages/RoadSection.js"></script>

</body>
</html>
