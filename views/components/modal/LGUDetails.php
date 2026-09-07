<link rel="stylesheet" href="../../public/css/details/LGUDetails.css">

<div class="modal-overlay" id="lguDetailsPanel" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 class="m-title" id="lguDetailName_header">LGU RECORD DETAILS</h2>
                <p class="m-sub">MUNICIPALITY PROFILE PANEL</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="closeLGUDetailsBtn">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <div class="m-body">
            <div class="sect">
                <div class="secthead">
                    <i data-lucide="layout-grid" style="width: 16px; height: 16px;"></i>
                    <span>LGU OVERVIEW</span>
                </div>
                
                <div class="profile-hub-grid">
                    <!-- Administrative Block -->
                    <div class="hub-block">
                        <div class="hub-card">
                            <label class="hub-label">Municipality Name</label>
                            <div id="lguDetailName" class="hub-value">---</div>
                        </div>
                        <div class="hub-card">
                            <label class="hub-label">Current Mayor</label>
                            <div id="lguDetailMayor" class="hub-value">---</div>
                        </div>
                    </div>

                    <!-- Geographic Block -->
                    <div class="hub-block">
                        <div class="hub-card">
                            <label class="hub-label">Province</label>
                            <div id="lguDetailProvince" class="hub-value">---</div>
                        </div>
                        <div class="hub-card">
                            <label class="hub-label">Region</label>
                            <div id="lguDetailRegion" class="hub-value">---</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="sect">
                <div class="secthead">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <span>CONTACT INFORMATION</span>
                </div>
                <div>
                    <label class="lbl">Office Contact No.</label>
                    <div id="lguDetailContact" class="m-value">---</div>
                </div>
            </div>

            <div class="sect">
                <div class="secthead">
                    <i data-lucide="users"></i>
                    <span>AUTHORIZED ENGINEERS</span>
                </div>
                <div id="associatedEngineers" class="mini-project-list">
                    <!-- Engineers populated via JS -->
                    <p style="text-align:center; color:#94a3b8; font-size:11px; padding:10px; font-style:italic;">Loading assigned engineers...</p>
                </div>
            </div>

            <div class="sect">
                <div class="secthead">
                    <i data-lucide="wrench"></i>
                    <span>MAINTENANCE PROJECTS INVOLVED</span>
                </div>
                <div id="associatedProjects" class="mini-project-list">
                    <!-- Projects populated via JS -->
                    <p style="text-align:center; color:#94a3b8; font-size:11px; padding:10px; font-style:italic;">Loading project records...</p>
                </div>
            </div>
        </div>

        <div class="foot">
            <button class="btn cancel" onclick="document.getElementById('closeLGUDetailsBtn').click()">CLOSE PANEL</button>
        </div>
    </div>
</div>
