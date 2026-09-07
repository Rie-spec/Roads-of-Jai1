<link rel="stylesheet" href="../../public/css/details/MUDetails.css">

<div class="modal-overlay" id="muDetailsPanel" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 class="m-title">MONTHLY UPDATE DETAILS</h2>
                <p class="m-sub">PROGRESS OVERVIEW PANEL</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="closeMUDetailsBtn" title="Close">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <div class="m-body">
            <!-- Top Status Row (Optional, adding if suitable) -->
            <div class="sect" style="margin-bottom: 24px !important;">
                <div id="statusWrapper" style="display: flex; align-items: center; gap: 10px;">
                    <span class="lbl" style="margin-bottom: 0; margin-top: 5px; font-size: 11px; color: #94a3b8; font-weight: 800; letter-spacing: 0.05em;">STATUS:</span>
                    <span id="detailStatusBadge" class="status-badge" style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase;">ONGOING</span>
                </div>
            </div>

            <!-- Associated Project Title Header -->
            <div class="sect" style="margin-bottom: 32px !important;">
                <label class="lbl" style="color: #94a3b8; font-size: 11px; margin-bottom: 12px;">ASSOCIATED MAINTENANCE PROJECT</label>
                <h1 id="detailProjectTitleHeader" style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em;">Nabunturan-Libasan Maintenance</h1>
                
                <div class="modal-meta-container" style="margin-top: 2px !important;">
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span id="detailCreatedBy">Created by: District Engineer</span>
                    </div>
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span id="detailUploadDate">Uploaded: May 1, 2026</span>
                    </div>
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        <span id="detailEditedDate">Edited: May 5, 2026</span>
                    </div>
                </div>
                <div class="mu-divider"></div>
            </div>

            <!-- Project Information Section -->
            <div class="sect">
                <div class="secthead" style="margin-bottom: 20px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span style="font-size: 12px; letter-spacing: 0.08em;">REPORT INFORMATION</span>
                </div>
                <div class="grid2">
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">MONTH REPORT</label>
                        <div id="detailMonthReport" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">MONTH 5</div>
                    </div>
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">MUNICIPALITY</label>
                        <div id="detailMunicipality" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">Nabunturan</div>
                    </div>
                </div>
            </div>

            <!-- Project Timeline Section -->
            <div class="sect">
                <div class="secthead" style="margin-bottom: 20px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span style="font-size: 12px; letter-spacing: 0.08em;">PROJECT TIMELINE</span>
                </div>
                <div class="grid2">
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">START DATE</label>
                        <div id="detailStartDate" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">2026-05-08</div>
                    </div>
                    <div>
                        <label class="lbl" style="font-size: 11px; color: #94a3b8;">ESTIMATED END</label>
                        <div id="detailEndDate" style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 8px;">2026-05-30</div>
                    </div>
                </div>
            </div>

            <!-- Progress & Media Section -->
            <div class="sect">
                <div class="grid2">
                    <div>
                        <div class="secthead" style="margin-bottom: 20px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            <span style="font-size: 12px; letter-spacing: 0.08em;">COMPLETION PROGRESS</span>
                        </div>
                        <div class="progress-circle-wrap">
                            <svg class="circle-svg">
                                <circle class="circle-bg" cx="40" cy="40" r="36"></circle>
                                <circle id="detailProgressCircle" class="circle-progress" cx="40" cy="40" r="36"></circle>
                            </svg>
                            <div class="progress-stats">
                                <h4 id="detailProgressValue">65%</h4>
                                <p>Current Milestone</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="secthead" style="margin-bottom: 20px;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span style="font-size: 12px; letter-spacing: 0.08em;">ATTACHED MEDIA & FILES</span>
                        </div>
                        <div class="mu-media-container">
                            <div id="detailMediaList" class="mu-media-list">
                                <!-- Media items will be injected here -->
                            </div>
                            <div id="noAttachmentsPlaceholder" class="records-placeholder mu-placeholder-span" style="border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px;">
                                <i data-lucide="folder-open" style="width: 24px; height: 24px; color: #94a3b8; margin-bottom: 8px;"></i>
                                <p style="font-size: 11px; color: #64748b; font-weight: 700;">No attachments found.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Report Summary Section -->
            <div class="sect">
                <div class="secthead" style="margin-bottom: 20px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                    <span style="font-size: 12px; letter-spacing: 0.08em;">REPORT SUMMARY</span>
                </div>
                <div id="detailSummary" class="summary-box">
                    No summary provided for this update.
                </div>
            </div>
        </div>

        <div class="foot">
            <button id="editMUBtn" class="btn save" style="width: auto; padding: 0 30px;">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                <span>EDIT UPDATE</span>
            </button>
        </div>
    </div>
</div>
