<?php $current_page = 'engineers'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAIROADS - Engineers</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/pages/Engineer.css">
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
</head>
<body class="auth-protected">
    
    <!-- SVG Background Shell -->
    <?php include __DIR__ . '/../../partials/background.php'; ?>

    <!-- Side Navigation -->
    <?php include __DIR__ . '/../../partials/sidebar.php'; ?>

    <main id="mainContent" class="main-content engineer-page">
        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>Engineers & Personnel</h1>
            </div>

            <div class="global-actions">
                <button class="btn-notification" title="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
            </div>
        </header>

        <div class="page-container">
            <!-- Filter Bar -->
            <section class="filter-shell">
                <div class="filter-search">
                    <i data-lucide="search" class="filter-search-icon"></i>
                    <input type="text" id="tableSearch" placeholder="Search by name, position or rank...">
                </div>

                <div class="filter-actions">
                    <select id="filterRank" class="filter-btn">
                        <option value="All">All Ranks</option>
                        <option value="Senior">Senior Engineer</option>
                        <option value="Junior">Junior Engineer</option>
                        <option value="Lead">Lead Engineer</option>
                    </select>

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

                    <button id="refreshBtn" class="refresh-btn" type="button">
                        <i data-lucide="rotate-cw"></i>
                    </button>
                </div>
            </section>

            <!-- Records Area -->
            <section class="records-shell">
                <div class="records-head">
                    <div class="head-col">Engineer Name</div>
                    <div class="head-col">Position</div>
                    <div class="head-col">Rank</div>
                    <div class="head-col">Municipality</div>
                    <div class="head-col actions-col" style="text-align: right;">Actions</div>
                </div>

                <div id="recordsBody" class="records-body">
                    <div class="records-placeholder">
                        Loading personnel records...
                    </div>
                </div>

                <div class="records-footer">
                    <p id="recordsNote" class="records-note">Showing 0 of 0 engineers</p>
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

    <?php include __DIR__ . '/../components/forms/EngineerDetails.php'; ?>

    <script type="module" src="../../public/js/pages/Engineer.js"></script>
    <script>
        window.addEventListener('DOMContentLoaded', () => {
            if (window.lucide) lucide.createIcons();
        });
    </script>
</body>
</html>