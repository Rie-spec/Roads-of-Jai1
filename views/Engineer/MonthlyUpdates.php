<?php $current_page = 'monthly_updates'; ?>
<!DOCTYPE html>
<html lang="en" class="no-scrollbar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Updates | JAIROADS</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/pages/MonthlyUpdates.css">
    <link rel="stylesheet" href="../../public/css/forms/MUForms.css">
    <link rel="stylesheet" href="../../public/css/details/MUDetails.css">
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
</head>
<body class="no-scrollbar">
    
    <?php include __DIR__ . '/../../partials/sidebar.php'; ?>
    <?php include __DIR__ . '/../../partials/background.php'; ?>

    <main id="mainContent" class="main-content monthly-updates-page">
        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>Monthly Updates</h1>
            </div>

            <div class="global-actions">
                <button class="btn-notification" title="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
                <button id="newUpdateBtn" class="btn-quick-add">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>New Update</span>
                </button>
            </div>
        </header>

        <div class="page-container">
            <section class="filter-shell">
                <div class="filter-search">
                    <svg class="filter-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="muSearch" placeholder="Search by project or engineer...">
                </div>
                <div class="filter-actions">
                    <select id="filterProject" class="filter-btn">
                        <option value="All">All Projects</option>
                        <!-- Populated via JS -->
                    </select>

                    <select id="filterMunicipality" class="filter-btn">
                        <option value="All">All Municipalities</option>
                        <!-- Populated via JS -->
                    </select>

                    <select id="filterMonth" class="filter-btn">
                        <option value="All">All Months</option>
                        <?php for($i=1; $i<=12; $i++) echo "<option value='$i'>Month $i</option>"; ?>
                    </select>

                    <select id="filterSort" class="filter-btn">
                        <option value="Newest">Newest First</option>
                        <option value="Oldest">Oldest First</option>
                        <option value="A-Z">A - Z</option>
                        <option value="Z-A">Z - A</option>
                    </select>

                    <div class="date-filter-shell">
                        <button id="dateFilterBtn" class="filter-btn brown-btn">
                            <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                            <span>Filter by Date</span>
                        </button>
                        <div id="dateRangeShell" class="date-range-shell" style="display: none;">
                            <input type="date" id="filterDateStart" class="filter-btn">
                            <span class="range-divider">to</span>
                            <input type="date" id="filterDateEnd" class="filter-btn">
                        </div>
                    </div>

                    <button id="refreshBtn" class="refresh-btn" type="button">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                    </button>
                </div>
            </section>

            <section class="records-shell">
                <div class="records-head" style="grid-template-columns: 2fr 1fr 1fr 0.8fr 1.2fr 1.2fr 0.8fr;">
                    <div class="head-col">Maintenance Project</div>
                    <div class="head-col">Engineer</div>
                    <div class="head-col">Municipality</div>
                    <div class="head-col">Month</div>
                    <div class="head-col">Date Uploaded</div>
                    <div class="head-col">Progress</div>
                    <div class="head-col actions-col" style="text-align: right;">Action</div>
                </div>

                <div id="muTableBody" class="records-body">
                    <div class="records-placeholder">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <i data-lucide="loader-2" class="animate-spin" size="32"></i>
                            <span>Loading monthly updates...</span>
                        </div>
                    </div>
                </div>

                <div class="records-footer">
                    <p id="muRecordCount" class="records-note">Showing 0 records</p>
                    <div id="muPagination" class="pagination"></div>
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

    <!-- Modals & Panels -->
    <?php include __DIR__ . '/../components/modal/MUDetails.php'; ?>
    <?php include __DIR__ . '/../components/forms/MUForms.php'; ?>

    <script type="module" src="../../public/js/pages/MonthlyUpdates.js"></script>
    <script>
        if (window.lucide) lucide.createIcons();
    </script>
</body>
</html>