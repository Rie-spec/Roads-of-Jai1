<?php $current_page = 'user_management'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAIROADS - User Management</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- ── Firebase MUST load before sidebar (navigation.js) ── -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/pages/UserManagement.css">
    <link rel="stylesheet" href="../../public/css/details/EngineerDetails.css">
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
</head>
<body>
    
    <?php include __DIR__ . '/../../partials/background.php'; ?>

    <?php include __DIR__ . '/../../partials/adminSidebar.php'; ?>

    <div id="successToast" class="success-toast" style="display: none;">
        <div class="toast-content">
            <i data-lucide="check-circle"></i>
            <span>Operation Completed Successfully!</span>
        </div>
    </div>

    <div id="loadingOverlay" class="loading-overlay" style="display: none;">
        <div class="loader"></div>
        <p>Syncing with Cloud Storage...</p>
    </div>

    <main id="mainContent" class="main-content user-management-page">
        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>User Management</h1>
            </div>

            <div class="global-actions">
                <button class="btn-notification" title="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
                <button id="createAccountBtn" class="btn-quick-add">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Create Account</span>
                </button>
                <button id="deleteAccountBtn" class="btn-delete-toggle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    <span>Delete Account</span>
                </button>
            </div>
        </header>

        <div class="page-container">
            <section class="filter-shell">
                <div class="filter-search">
                    <i data-lucide="search" class="filter-search-icon"></i>
                    <input type="text" id="tableSearch" placeholder="Search accounts by name, position or rank...">
                </div>

                <div class="filter-actions">
                    <select id="filterRank" class="filter-btn">
                        <option value="All">All Ranks</option>
                        <option value="Engineer I">Engineer I</option>
                        <option value="Engineer II">Engineer II</option>
                        <option value="Engineer III">Engineer III</option>
                        <option value="Engineer IV">Engineer IV</option>
                    </select>

                    <select id="filterMunicipality" class="filter-btn">
                        <option value="All">All Municipalities</option>
                    </select>

                    <button id="refreshBtn" class="refresh-btn" type="button">
                        <i data-lucide="rotate-cw"></i>
                    </button>
                </div>
            </section>

            <section class="records-shell">
                <div class="records-head">
                    <div class="head-col">Account Holder</div>
                    <div class="head-col">Position</div>
                    <div class="head-col">Rank</div>
                    <div class="head-col">Municipality</div>
                    <div class="head-col actions-col" style="text-align: right;">Actions</div>
                </div>

                <div id="recordsBody" class="records-body">
                    <div class="records-placeholder">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <i data-lucide="loader-2" class="animate-spin" size="32"></i>
                            <span>Loading system accounts...</span>
                        </div>
                    </div>
                </div>

                <div class="records-footer">
                    <p id="recordsNote" class="records-note">Showing 0 of 0 accounts</p>
                    <div id="paginationControls" class="pagination"></div>
                </div>
            </section>
        </div>
    </main>

    <?php include __DIR__ . '/../components/forms/EngineerDetails.php'; ?>
    <?php include __DIR__ . '/../components/forms/UserManagementForms.php'; ?>

    <!-- ✅ Notification elements are now at body level -->
    <div id="notifBackdrop" class="notif-backdrop"></div>
    <div id="notifPanel" class="notif-panel">
        <div class="notif-head">
            <div class="notif-head-left">
                <div class="notif-head-icon">
                    <i data-lucide="bell" style="width: 20px; height: 20px;"></i>
                </div>
                <div>
                    <h3 class="notif-head-title">Notifications</h3>
                    <p class="notif-head-sub">Admin Activity Log</p>
                </div>
            </div>
            <button id="markAllReadBtn" class="notif-mark-all-btn" disabled>MARK ALL READ</button>
        </div>
        <div id="notifList" class="notif-list"></div>
        <div id="notifEmpty" class="notif-empty">
            <i data-lucide="bell-off" style="width: 32px; height: 32px;"></i>
            <p>No new notifications</p>
        </div>
        <div class="notif-footer">
            <a href="AdminActivityLog.php" class="notif-footer-link">View All Activity Logs</a>
        </div>
    </div>

    <script type="module" src="../../public/js/pages/UserManagement.js"></script>
    <script>
        window.addEventListener('DOMContentLoaded', () => {
            if (window.lucide) lucide.createIcons();
        });
    </script>
</body>
</html>