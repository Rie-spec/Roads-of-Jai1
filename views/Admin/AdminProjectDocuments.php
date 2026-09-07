<?php $current_page = 'project_documents'; ?>
<!DOCTYPE html>
<html lang="en" class="no-scrollbar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Project Documents | JAIROADS</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <link rel="stylesheet" href="../../public/css/components/sidebar.css">
    <link rel="stylesheet" href="../../public/css/global.css">
    <link rel="stylesheet" href="../../public/css/pages/ProjectDocuments.css">
    <link rel="stylesheet" href="../../public/css/pages/ProjectDocuments.css">
    <link rel="stylesheet" href="../../public/css/forms/PDForms.css">
    <link rel="stylesheet" href="../../public/css/details/PDDetails.css">
    <link rel="stylesheet" href="../../public/css/components/notifications.css">
</head>
<body class="no-scrollbar">
    
    <?php include __DIR__ . '/../../partials/adminSidebar.php'; ?>
    <?php include __DIR__ . '/../../partials/background.php'; ?>

    <!-- SUCCESS NOTIFICATION WINDOW -->
    <div id="successToast" class="success-toast">
        <div class="toast-content">
            <i data-lucide="check-circle"></i>
            <span>Operation Completed Successfully!</span>
        </div>
    </div>

    <!-- LOADING OVERLAY -->
    <div id="loadingOverlay" class="loading-overlay">
        <div class="loader"></div>
        <p>Syncing with Cloud Storage...</p>
    </div>

    <main id="mainContent" class="main-content document-page">
        <header class="top-nav-bar">
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="header-title-section">
                <h1>Project Documents (Admin)</h1>
            </div>

            <div class="global-actions">
                <button class="btn-notification" title="Notifications">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
                <button id="openUploadModalBtn" class="btn-quick-add">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Add Document</span>
                </button>
                <!-- Admin Delete Toggle Button -->
                <button id="deleteModeBtn" class="btn-delete-toggle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    <span>Delete Doc</span>
                </button>
            </div>
        </header>

        <div class="page-container">
            <section class="filter-shell">
                <div class="filter-search">
                    <svg class="filter-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="searchInput" placeholder="Search by project or document name...">
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
                    <div class="head-col actions-col" style="text-align: right;">Actions</div>
                </div>

                <div class="records-body" id="recordsContainer">
                    <div class="records-placeholder">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <i data-lucide="loader-2" class="animate-spin" size="32"></i>
                            <span>Loading documents...</span>
                        </div>
                    </div>
                </div>

                <div class="records-footer">
                    <div class="records-note" id="showingText">SHOWING 0-0 OF 0 DOCUMENTS</div>
                    <div class="pagination" id="paginationControls"></div>
                </div>
            </section>
        </div>
    </main>

    <!-- Modals & Panels -->
    <?php include __DIR__ . '/../components/modal/PDDetails.php'; ?>
    <?php include __DIR__ . '/../components/forms/PDForms.php'; ?>

    <!-- Standardized Confirmation Modal (Danger Zone Aesthetic) -->
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
                <h3 style="color: #ef4444; font-size: 20px; font-weight: 800; margin-bottom: 8px;">Delete Document?</h3>
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
<script src="https://unpkg.com/lucide@latest"></script>

    <script type="module" src="../../public/js/pages/ProjectDocuments.js"></script>
    <script>
        if (window.lucide) {
            lucide.createIcons();
        }
    </script>
</body>
</html>
