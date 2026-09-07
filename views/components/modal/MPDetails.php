<link rel="stylesheet" href="../../public/css/details/MPDetails.css">

<div class="modal-overlay view-mode" id="projectDetailsModal" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 id="detailsModalMainTitle" class="m-title">MAINTENANCE PROJECT DETAILS</h2>
                <p id="detailsModalSubTitle" class="m-sub">RECORD OVERVIEW PANEL</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="closeDetailsModalBtn">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <div class="m-body">
            <!-- Top Status Row -->
            <div class="sect" style="margin-bottom: 24px !important;">
                <div id="statusWrapper" style="display: flex; align-items: center; gap: 10px;">
                    <span class="lbl" style="margin-bottom: 0; margin-top: 5px; font-size: 11px; color: #94a3b8; font-weight: 800; letter-spacing: 0.05em;">STATUS:</span>
                    <span id="viewStatusBadge" class="status-badge">ONGOING</span>
                </div>
            </div>

            <!-- Project Title Header -->
            <div class="sect" style="margin-bottom: 32px !important;">
                <label class="lbl" style="color: #94a3b8; font-size: 11px; margin-bottom: 12px;">MAINTENANCE PROJECT TITLE</label>
                <h1 id="formTitle_view_text" style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em;">Nabunturan-Libasan Maintenance</h1>
                
                <div id="metaContainer" class="modal-meta-container">
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span id="metaCreator">Created by: District Engineer</span>
                    </div>
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span id="metaDate">Uploaded: May 1, 2026</span>
                    </div>
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        <span id="metaLastEdited">Edited: May 5, 2026</span>
                    </div>
                </div>
                <div class="mu-divider"></div>
            </div>

            <!-- Project Info Grid -->
            <div class="sect">
                <div class="secthead" style="margin-bottom: 20px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span style="font-size: 12px; letter-spacing: 0.08em;">PROJECT INFORMATION</span>
                </div>
                <div class="grid2">
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">MUNICIPALITY</label>
                        <div id="formMunicipality_view_bold" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">Nabunturan</div>
                    </div>
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">ASSIGNED ENGINEER</label>
                        <div id="formEngineer_view_bold" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">Engr. Gav Pol</div>
                    </div>
                </div>
            </div>

            <!-- Schedule Grid -->
            <div class="sect">
                <div class="secthead" style="margin-bottom: 20px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span style="font-size: 12px; letter-spacing: 0.08em;">SCHEDULE</span>
                </div>
                <div class="grid2">
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">START DATE</label>
                        <div id="formStart_view_bold" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">2026-05-08</div>
                    </div>
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">ESTIMATED END</label>
                        <div id="formEnd_view_bold" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">2026-05-30</div>
                    </div>
                </div>
            </div>

            <!-- Affected Roads & Map -->
            <div class="sect">
                <div class="secthead" style="margin-bottom: 20px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    <span style="font-size: 12px; letter-spacing: 0.08em;">AFFECTED ROADS SELECTION</span>
                </div>

                <div class="grid5">
                    <div class="roads">
                        <div class="list">
                            <div class="listtitle" id="viewAffectedRoadsTitle">AFFECTED ASSETS (0)</div>
                            <div id="viewAffectedRoadsList" style="display: flex; flex-direction: column; gap: 8px;">
                                <!-- Items list injected here -->
                            </div>
                        </div>
                    </div>

                    <div class="map" style="height: 100%; min-height: 250px; border-radius: 20px; overflow: hidden; border: 1.5px solid #e2e8f0; position: relative; background: #f8fafc;">
                        <div id="viewProjectMap" style="height: 100%; width: 100%;"></div>
                    </div>
                </div>
            </div>

            <!-- Bottom Related Data -->
            <div class="sect">
                <div class="grid2">
                    <div class="roads">
                        <div class="list" id="monthlyUpdatesList">
                            <div class="listtitle">MONTHLY UPDATES</div>
                            <div class="dashed-placeholder">
                                No monthly updates found.
                            </div>
                        </div>
                    </div>
                    <div class="roads">
                        <div class="list" id="projectDocumentsList">
                            <div class="listtitle">PROJECT DOCUMENTS</div>
                            <div class="dashed-placeholder">
                                No documents uploaded.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="foot">
            <button id="toggleEditBtn" class="btn save">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                <span>EDIT RECORD</span>
            </button>
        </div>
    </div>
</div>
