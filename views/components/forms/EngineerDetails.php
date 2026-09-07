<link rel="stylesheet" href="../../public/css/details/EngineerDetails.css">

<div class="modal-overlay engineer-details-modal" id="engineerDetailsModal" style="display: none;">
    <div class="modal-card">
        <!-- Top Header as seen in image -->
        <div class="details-top-header">
            <div class="title-group">
                <h1 class="main-title">ENGINEER PROFILE</h1>
                <p class="sub-title">Personnel Record & Project History</p>
            </div>
            <button class="m-close" id="closeEngineerDetailsBtn" title="Close">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <div class="m-body">
            <!-- Hero Identity Section -->
            <div class="profile-hero-section">
                <div class="profile-wallpaper"></div>
                <!-- Avatar Overlap -->
                <div class="avatar-overlap-box">
                    <div class="avatar-large-circle">
                        <i data-lucide="user"></i>
                    </div>
                </div>
            </div>

            <!-- Section 1: Professional Information -->
            <div class="info-section-wrapper">
                <div class="section-label-bar">SECTION 1: PROFESSIONAL INFORMATION</div>
                
                <div class="info-boxed-grid">
                    <div class="info-box full-width">
                        <label>FULL NAME</label>
                        <div class="info-val" id="detailName" style="font-size: 24px; font-weight: 800;">---</div>
                    </div>
                    
                    <div class="info-box">
                        <label>RANK</label>
                        <div class="info-val" id="detailRank">---</div>
                    </div>
                    
                    <div class="info-box">
                        <label>POSITION</label>
                        <div class="info-val" id="detailPosition">---</div>
                    </div>
                    
                    <div class="info-box">
                        <label>EMAIL ADDRESS</label>
                        <div class="info-val" id="detailEmail">---</div>
                    </div>
                    
                    <div class="info-box">
                        <label>MEMBER SINCE</label>
                        <div class="info-val" id="detailJoined">---</div>
                    </div>
                </div>
            </div>

            <!-- Section 2: Project History -->
            <div class="info-section-wrapper">
                <div class="section-label-bar">SECTION 2: PROJECT HISTORY (MANAGED PROJECTS)</div>
                
                <div class="history-tabs-container">
                    <div class="history-tabs">
                        <button class="tab-btn active" data-filter="all">All</button>
                        <button class="tab-btn" data-filter="ongoing">Ongoing</button>
                        <button class="tab-btn" data-filter="completed">Completed</button>
                        <button class="tab-btn" data-filter="terminated">Terminated</button>
                    </div>

                    <div id="detailHistoryList" class="history-content-area">
                        <div class="empty-state">No recent activity or projects found.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
