<!-- LGU Details Panel -->
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
            <div class="sect" style="margin-bottom: 32px !important;">
                <div id="lguMetaContainer" class="modal-meta-container">
                    <div class="modal-meta-item">
                        <i data-lucide="user" style="width: 14px; height: 14px;"></i>
                        <span id="lguDetailCreatedBy">Created by: Admin</span>
                    </div>
                    <div class="modal-meta-item">
                        <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                        <span id="lguDetailUploadDate">Uploaded: ---</span>
                    </div>
                    <div class="modal-meta-item">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                        <span id="lguDetailEditedDate"></span>
                    </div>
                </div>
                <div style="border-bottom: 1.5px solid #f1f5f9; margin: 24px 0 0 0;"></div>
            </div>

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
                    <i data-lucide="phone"></i>
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
            <button id="editLGUBtn" class="btn save">
                <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
                <span>EDIT RECORD</span>
            </button>
        </div>
    </div>
</div>
