<link rel="stylesheet" href="../../public/css/details/RSDetails.css">

<div class="modal-overlay view-mode" id="roadDetailsModal" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div style="display: flex; align-items: center; gap: 20px;">
                <div class="m-head-badge">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                </div>
                <div class="title-group">
                    <h2 class="m-title">ROAD SECTION DETAILS</h2>
                    <p class="m-sub">TECHNICAL RECORD PANEL</p>
                </div>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="btnCloseRoadDetails">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <div class="m-body">
            <!-- Top Status Row Replacement: CATEGORY STATE -->
            <div class="sect" style="margin-bottom: 24px !important;">
                <div id="stateWrapper" style="display: flex; align-items: center; gap: 10px;">
                    <span class="lbl" style="margin-bottom: 0; margin-top: 5px; font-size: 11px; color: #94a3b8; font-weight: 800; letter-spacing: 0.05em;">CATEGORY STATE:</span>
                    <span id="viewStateBadge" class="status-badge" style="padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase;">GOOD</span>
                </div>
            </div>

            <!-- Road Title Header -->
            <div class="sect" style="margin-bottom: 32px !important;">
                <label class="lbl" style="color: #94a3b8; font-size: 11px; margin-bottom: 12px;">ROAD SECTION NAME</label>
                <h1 id="viewRoadName_text" style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em;">Road Name Loading...</h1>
                
                <div id="metaContainer" class="modal-meta-container">
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span id="metaCreator">Created by: District Engineer</span>
                    </div>
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span id="viewCreatedAt_meta">Uploaded: --</span>
                    </div>
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        <span id="metaLastEdited">Edited: --</span>
                    </div>
                </div>
                <div class="mu-divider"></div>
            </div>

            <!-- Road Info Grid -->
            <div class="sect">
                <div class="secthead" style="margin-bottom: 20px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span style="font-size: 12px; letter-spacing: 0.08em;">ROAD SPECIFICATIONS</span>
                </div>
                <div class="grid2">
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">MUNICIPALITY</label>
                        <div id="viewMunicipality_bold" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">--</div>
                        
                        <label class="lbl" style="font-size: 11px; color: #94a3b8; margin-top: 20px;">KM of ROAD SECTION</label>
                        <div id="viewKilometer_bold" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">0.00 km</div>
                    </div>
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">PAVEMENT TYPE</label>
                        <div id="viewPavementType_bold" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">--</div>
                    </div>
                </div>
            </div>

            <!-- Spatial Preview -->
            <div class="sect">
                <div class="secthead" style="margin-bottom: 20px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    <span style="font-size: 12px; letter-spacing: 0.08em;">ROAD SECTION MAP PREVIEW</span>
                </div>

                <div class="map" style="height: 350px; border-radius: 20px; overflow: hidden; border: 1.5px solid #e2e8f0; position: relative; background: #f8fafc;">
                    <div id="previewMap" style="height: 100%; width: 100%;"></div>
                </div>
            </div>

        </div>

        <div class="foot" style="justify-content: flex-end;">
            <button id="btnEditRoadFromDetails" class="btn save">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                <span>EDIT RECORD</span>
            </button>
        </div>
    </div>
</div>
