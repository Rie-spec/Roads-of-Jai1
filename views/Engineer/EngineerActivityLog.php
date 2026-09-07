<?php $current_page = 'activity_log'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Activity Log | JAIROADS</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/AdminActivityLog.css">
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
</head>
<body class="auth-protected">
    <?php include __DIR__ . '/../../partials/background.php'; ?>
    <?php include __DIR__ . '/../../partials/sidebar.php'; ?>

    <main id="mainContent" class="main-content activity-log-page">
        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>My Activity Log</h1>
            </div>
            <div class="global-actions">
                <button class="btn-notification" title="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
            </div>
        </header>

        <div class="page-container">
            <section class="filter-shell">
                <div class="filter-search flex-1">
                    <svg class="filter-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="tableSearch" placeholder="Search my activity..." style="width: 100%;">
                </div>
                <div class="filter-actions">
                    <select id="filterType" class="filter-btn">
                        <option value="All">All Types</option>
                        <option value="create">Create</option>
                        <option value="edit">Update / Edit</option>
                        <option value="delete">Delete</option>
                        <option value="info">System Info</option>
                    </select>
                    <select id="filterStatus" class="filter-btn">
                        <option value="All">All Status</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>
                    <button id="clearFiltersBtn" class="btn-clear-all" type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </section>

            <section class="records-shell">
                <div class="records-head" style="display:grid; grid-template-columns: 1.5fr 2.5fr 1fr 1fr; gap:16px; padding:10px 24px;">
    <div class="head-col">TITLE</div>
    <div class="head-col">MESSAGE</div>
    <div class="head-col" style="text-align:center;">TYPE</div>
    <div class="head-col" style="text-align:center;">TIME</div>
</div>
                <div id="recordsBody" class="records-body">
                    <div class="records-placeholder">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <i data-lucide="loader-2" class="animate-spin" style="width:32px; height:32px;"></i>
                            <span>Fetching your activity...</span>
                        </div>
                    </div>
                </div>
                <div class="records-footer">
                    <p id="recordsNote" class="records-note">SHOWING 0 OF 0 ENTRIES</p>
                    <div id="paginationControls" class="pagination"></div>
                </div>
            </section>
        </div>
    </main>

    <div id="notifBackdrop" class="notif-backdrop"></div>
    <div id="notifPanel" class="notif-panel">
        <div class="notif-head">
            <div class="notif-head-left">
                <div class="notif-head-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <div>
                    <p class="notif-head-title">Notifications</p>
                    <p class="notif-head-sub">My Activity</p>
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
            <a class="notif-footer-link" href="EngineerActivityLog.php">View My Activity Log</a>
        </div>
    </div>
        <script type="module" src="../../public/js/pages/ActivityLog.js"></script>
    <script>
        window.addEventListener('DOMContentLoaded', () => {
            if (window.lucide) lucide.createIcons();
        });
    </script>
</body>
</html>