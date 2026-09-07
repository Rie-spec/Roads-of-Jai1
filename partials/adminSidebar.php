    <?php
    if (!isset($user)) {
        $user = ['name' => 'Admin User', 'role' => 'Administrator', 'initials' => 'AU'];
    }
    if (!isset($current_page)) {
        $current_page = '';
    }
    ?>

    <script>
        // Prevent sidebar flicker on page load
        (function() {
            const sidebarState = localStorage.getItem('sidebar_collapsed');
            if (sidebarState === 'true') document.documentElement.classList.add('sidebar-is-collapsed');
            
            // Persist hover state to prevent "close" on navigation
            const isHovered = sessionStorage.getItem('sidebar_hover_active');
            if (isHovered === 'true') {
                document.documentElement.classList.add('sidebar-is-hovered');
            }
        })();
    </script>

    <style>
        /* CSS to handle the immediate collapse state globally — Desktop Only */
        @media (min-width: 1025px) {
            html.sidebar-is-collapsed .sidebar { width: 80px !important; transition: none !important; }
            html.sidebar-is-collapsed .main-content { margin-left: 80px !important; transition: none !important; }
            html.sidebar-is-collapsed .nav-label, 
            html.sidebar-is-collapsed .sidebar-label,
            html.sidebar-is-collapsed .profile-text,
            html.sidebar-is-collapsed .brand-name { 
                display: none !important; 
                opacity: 0 !important; 
                pointer-events: none !important; 
                transition: none !important;
            }

            /* Immediate expansion if sidebar was hovered on previous page */
            html.sidebar-is-hovered:not(.sidebar-is-collapsed) .sidebar {
                width: 280px !important;
                transition: none !important;
            }
            html.sidebar-is-hovered:not(.sidebar-is-collapsed) .main-content {
                padding-left: 280px !important;
                transition: none !important;
            }
            html.sidebar-is-hovered:not(.sidebar-is-collapsed) .nav-label,
            html.sidebar-is-hovered:not(.sidebar-is-collapsed) .sidebar-label,
            html.sidebar-is-hovered:not(.sidebar-is-collapsed) .profile-text,
            html.sidebar-is-hovered:not(.sidebar-is-collapsed) .brand-name {
                opacity: 1 !important;
                max-width: 300px !important;
                transition: none !important;
            }
        }

        /* Logo Specific Adjustments */
        .brand-icon-box.logo-box {
            background: transparent !important; 
            padding: 0 !important;
            width: 36px !important;
            height: 36px !important;
        }
    </style>

<!-- Sidebar Overlay for mobile -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<aside class="sidebar" id="mainSidebar">
    <div class="sidebar-top no-scrollbar">
        <div class="brand-row">
            <div class="brand-icon-box logo-box">
                <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Davao_de_Oro_Official_Seal.png" alt="Davao de Oro Seal" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <div class="brand-name">JAIROADS</div>
            
            <!-- Mobile Close Button (Hidden on Desktop) -->
            <button id="mobileCloseBtn" class="mobile-close-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>

            <div class="sidebar-label">ADMIN CONSOLE</div>

            <nav class="sidebar-nav">
                <a href="AdminDashboard.php" class="nav-item <?php echo ($current_page === 'dashboard') ? 'active' : ''; ?>">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    <span class="nav-label">Admin Dashboard</span>
                </a>
                <a href="AdminMaintenanceProject.php" class="nav-item <?php echo ($current_page === 'maintenance_projects') ? 'active' : ''; ?>">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    <span class="nav-label">Maintenance Projects</span>
                </a>
                <a href="UserManagement.php" class="nav-item <?php echo ($current_page === 'user_management') ? 'active' : ''; ?>">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span class="nav-label">User Management</span>
                </a>
                <a href="AdminMonthlyUpdates.php" class="nav-item <?php echo ($current_page === 'monthly_updates') ? 'active' : ''; ?>">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span class="nav-label">Monthly Updates</span>
                </a>
                <a href="AdminProjectDocuments.php" class="nav-item <?php echo ($current_page === 'project_documents') ? 'active' : ''; ?>">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    <span class="nav-label">Project Documents</span>
                </a>
                <a href="AdminRoadSection.php" class="nav-item <?php echo ($current_page === 'roads') ? 'active' : ''; ?>">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"></path><path d="M3 6h18"></path><path d="M3 18h18"></path></svg>
                    <span class="nav-label">Road Sections</span>
                </a>
                <a href="AdminLGU.php" class="nav-item <?php echo ($current_page === 'lgus') ? 'active' : ''; ?>">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    <span class="nav-label">LGU</span>
                </a>
                <a href="AdminSettings.php" class="nav-item <?php echo ($current_page === 'settings') ? 'active' : ''; ?>">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span class="nav-label">Settings</span>
                </a>
            </nav>
        </div>

        <div class="sidebar-footer">
            <div class="profile-card">
                <div class="profile-avatar" id="sidebarAvatar"><?php echo $user['initials']; ?></div>
<div class="profile-text">
    <div class="profile-name" id="sidebarName"><?php echo $user['name']; ?></div>
    <div class="profile-role" id="sidebarRole"><?php echo $user['role']; ?></div>
</div>
            </div>
            <button class="logout-btn" id="logoutBtn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span class="nav-label">Logout</span>
            </button>
        </div>
    </aside>

<script>
    // Robust sidebar mobile toggle logic & Desktop Handoff
    (function() {
        const getSidebarElements = () => ({
            sidebar: document.getElementById('mainSidebar'),
            overlay: document.getElementById('sidebarOverlay'),
            closeBtn: document.getElementById('mobileCloseBtn')
        });
        
        const openMobileSidebar = () => {
            const { sidebar, overlay } = getSidebarElements();
            if (sidebar) sidebar.classList.add('mobile-open');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeMobileSidebar = () => {
            const { sidebar, overlay } = getSidebarElements();
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        // Delegate delegation for all mobile menu buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-menu-btn')) {
                e.preventDefault();
                openMobileSidebar();
            }
        });

        // Close handlers
        document.addEventListener('click', (e) => {
            if (e.target === document.getElementById('sidebarOverlay') || e.target.closest('#mobileCloseBtn')) {
                closeMobileSidebar();
            }
        });

        // Init setup for desktop toggle & hover persistence
        const setupSidebar = () => {
             const sidebar = document.getElementById('mainSidebar');
             const toggleBtn = document.getElementById('sidebarToggle');
             
             // 1. Create a lock to prevent phantom browser events during page load
             let isNavigating = false; 
             
             if (sidebar) {
                 sidebar.addEventListener('mouseenter', () => {
                     if (!isNavigating) sessionStorage.setItem('sidebar_hover_active', 'true');
                 });
                 
                 // 2. Only allow mouseleave to trigger if we ARE NOT clicking a link
                 sidebar.addEventListener('mouseleave', () => {
                     if (!isNavigating) sessionStorage.setItem('sidebar_hover_active', 'false');
                 });

                 // 3. The Handoff: Wait 250ms for the DOM to settle before listening for mouse movement
                 if (document.documentElement.classList.contains('sidebar-is-hovered')) {
                     setTimeout(() => {
                         const checkInitialMouse = (e) => {
                             document.documentElement.classList.remove('sidebar-is-hovered');
                             
                             if (!sidebar.contains(e.target)) {
                                 sessionStorage.setItem('sidebar_hover_active', 'false');
                             }
                             
                             document.removeEventListener('mousemove', checkInitialMouse);
                         };
                         document.addEventListener('mousemove', checkInitialMouse);
                     }, 250); 
                 }

                 // 4. Lock the state to 'true' the moment a link is clicked
                 sidebar.addEventListener('click', (e) => {
                     if (e.target.closest('a')) {
                         isNavigating = true; // Engage the lock
                         sessionStorage.setItem('sidebar_hover_active', 'true');
                     }
                 });
             }

             if (toggleBtn && sidebar) {
                toggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('collapsed');
                    const nowCollapsed = sidebar.classList.contains('collapsed');
                    localStorage.setItem('sidebar_collapsed', nowCollapsed);
                    if (nowCollapsed) {
                        document.documentElement.classList.add('sidebar-is-collapsed');
                    } else {
                        document.documentElement.classList.remove('sidebar-is-collapsed');
                    }
                });
             }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupSidebar);
        } else {
            setupSidebar();
        }
    })();
</script>

<script type="module">
    import { db } from "../../public/js/firebase-config.js";
    import { collection, query, getDocs, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    document.addEventListener('DOMContentLoaded', () => {
        // ... any additional firestore logic if needed ...
    });
</script>
    <script type="module" src="../../public/js/navigation.js"></script>
