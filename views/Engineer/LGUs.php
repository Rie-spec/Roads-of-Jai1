<?php $current_page = 'lgus'; ?>
<!DOCTYPE html>
<html lang="en" class="no-scrollbar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LGU Management | JAIROADS</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/pages/LGUs.css">
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
</head>
<body class="no-scrollbar">

    <?php include __DIR__ . '/../../partials/sidebar.php'; ?>
    <?php include __DIR__ . '/../../partials/background.php'; ?>

    <main id="mainContent" class="main-content lgus-page">
        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>LGU Management</h1>
            </div>
            <div class="global-actions">
                <!--
                    FIX: Added id="notifToggleBtn"
                    initNotifications() looks for this exact ID to wire up
                    the open/close click listener. Without it the bell does nothing.
                -->
                <button class="btn-notification" id="notifToggleBtn" title="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </button>
            </div>
        </header>

        <div class="page-container">
            <section class="filter-shell">
                <div class="filter-search">
                    <svg class="filter-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="lguSearch" placeholder="Search by municipality or mayor...">
                </div>
                <div class="filter-actions">
                    <select id="filterSort" class="filter-btn">
                        <option value="Newest">Newest First</option>
                        <option value="Oldest">Oldest First</option>
                        <option value="A-Z">A - Z</option>
                        <option value="Z-A">Z - A</option>
                    </select>
                    <button id="refreshBtn" class="refresh-btn" type="button">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                        </svg>
                    </button>
                </div>
            </section>

            <section class="records-shell">
                <div class="records-head" style="grid-template-columns: 2fr 2fr 1fr;">
                    <div class="head-col">Municipality Name</div>
                    <div class="head-col">Current Mayor</div>
                    <div class="head-col actions-col" style="text-align: right;">Action</div>
                </div>
                <div id="lguTableBody" class="records-body">
                    <div class="records-placeholder">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <i data-lucide="loader-2" class="animate-spin" size="32"></i>
                            <span>Loading LGU records...</span>
                        </div>
                    </div>
                </div>
                <div class="records-footer">
                    <p id="lguRecordCount" class="records-note">Showing 0 records</p>
                    <div id="lguPagination" class="pagination"></div>
                </div>
            </section>
        </div>
    </main>

    <!--
        Notification Panel
        NOTE: Keep this at the top level of <body>, never nest it inside
        another modal — if the parent gets display:none the panel disappears too.
    -->
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
                    <p class="notif-head-sub">LGU Management</p>
                </div>
            </div>
            <button id="markAllReadBtn" class="notif-mark-all-btn">MARK ALL READ</button>
        </div>
        <!--
            FIX: notifEmpty moved outside of notifList.
            The JS in notifications.js toggles #notifEmpty independently —
            nesting it inside #notifList caused it to be overwritten when
            the list was populated.
        -->
        <div id="notifList" class="notif-list"></div>
        <div id="notifEmpty" class="notif-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <p>All caught up!</p>
        </div>
        <div class="notif-footer">
            <a class="notif-footer-link" href="../engineer/EngineerActivityLog.php">View Activity Log</a>
        </div>
    </div>

    <!-- Modals & Panels -->
    <?php include __DIR__ . '/../components/modal/LGUDetails.php'; ?>

    <script type="module" src="../../public/js/pages/LGUs.js"></script>
    <script>
        if (window.lucide) lucide.createIcons();
    </script>
</body>
</html>