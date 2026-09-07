<?php $current_page = 'project_documents'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAIROADS - Project Documents</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/pages/ProjectDocuments.css">
    <link rel="stylesheet" href="../../public/css/forms/PDForms.css">
    <link rel="stylesheet" href="../../public/css/details/PDDetails.css">
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
</head>
<body>

    <!-- SUCCESS TOAST -->
    <div id="successToast" class="success-toast">
        <div class="toast-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Upload Complete Successfully!</span>
        </div>
    </div>

    <!-- LOADING OVERLAY -->
    <div id="loadingOverlay" class="loading-overlay">
        <div class="loader"></div>
        <p>Syncing with Cloud Storage...</p>
    </div>

    <!-- SVG Background Shell -->
    <?php include __DIR__ . '/../../partials/background.php'; ?>

    <!-- Side Navigation -->
    <?php include __DIR__ . '/../../partials/sidebar.php'; ?>

    <main id="mainContent" class="main-content document-page">
        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>Project Documents</h1>
            </div>

            <div class="global-actions">
                <button class="btn-notification" title="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
                <button id="openUploadModalBtn" class="btn-quick-add">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Upload Document</span>
                </button>
            </div>
        </header>

        <div class="page-container">
            <section class="filter-shell">
                <div class="filter-search">
                    <svg class="filter-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="searchInput" placeholder="Search by project title or document name...">
                </div>
                <div class="filter-actions">
                    <select class="filter-btn" id="typeFilter">
                        <option value="All">All File Types</option>
                        <option value="PDF">PDF</option>
                        <option value="XLSX">XLSX / Excel</option>
                        <option value="DOCX">DOCX / Word</option>
                        <option value="JPG">JPG / PNG</option>
                    </select>
                    <button id="refreshTableBtn" class="refresh-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                    </button>
                </div>
            </section>

            <section class="records-shell">
                <div class="records-head">
                    <div class="head-col">Project Maintenance</div>
                    <div class="head-col">Document Title</div>
                    <div class="head-col">File Type</div>
                    <div class="head-col">Upload Date</div>
                    <div class="head-col actions-col" style="text-align: center;">Actions</div>
                </div>

                <div class="records-body" id="recordsContainer">
                    <div class="records-placeholder" id="emptyState">
                        Place your records here.
                    </div>
                </div>

                <div class="records-footer">
                    <div class="records-note" id="showingText">SHOWING 0-0 OF 0 DOCUMENTS</div>
                    <div class="pagination" id="paginationControls"></div>
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

    <?php include __DIR__ . '/../components/modal/PDDetails.php'; ?>
    <?php include __DIR__ . '/../components/forms/PDForms.php'; ?>

    <script type="module" src="../../public/js/pages/ProjectDocuments.js"></script>
    <script>
        if (window.lucide) lucide.createIcons();
    </script>
</body>
</html>