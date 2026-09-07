<link rel="stylesheet" href="../../public/css/forms/MPForms.css">

<div class="modal-overlay" id="projectFormModal" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 id="formModalMainTitle" class="m-title">NEW MAINTENANCE PROJECT</h2>
                <p id="formModalSubTitle" class="m-sub">RECORD ENTRY FORM</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="closeFormModalBtn">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <div class="m-body">
            <div class="sect" id="titleSection_form">
                <label class="lbl">MAINTENANCE PROJECT TITLE</label>
                <input id="formTitle" type="text" placeholder="Project Title" class="m-inp">
            </div>

            <div class="sect">
                <div class="secthead">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>PROJECT INFORMATION</span>
                </div>
                <div class="grid2">
                    <div>
                        <label class="lbl">MUNICIPALITY</label>
                        <select id="formMunicipality" class="m-inp">
                            <option value="" disabled selected>Select Municipality...</option>
                        </select>
                    </div>
                    <div>
                        <label class="lbl">ASSIGNED ENGINEER</label>
                        <div id="engSearchWrapper" class="m-wrap left">
                            <svg class="m-icon l" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            
                            <div id="selectedEngContainer" class="selected-eng-container hidden">
                                <svg class="m-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                <span id="selectedEngName" class="selected-eng-name"></span>
                                <button type="button" id="removeEngBtn" style="padding: 5px; background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center;">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <input id="engSearchInput" type="text" placeholder="Search Engineer" class="m-inp srch search-override" autocomplete="off">
                            <div id="engSearchSuggestions" class="search-suggestions hidden"></div>
                        </div>
                        <input type="hidden" id="formEngineerId">
                    </div>
                </div>
            </div>

            <div class="sect">
                <div class="grid2">
                    <div>
                        <div class="secthead">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span>SCHEDULE</span>
                        </div>
                        <div class="grid2inner">
                            <div>
                                <label class="lbl">START DATE</label>
                                <div class="m-wrap"><input id="formStart" type="date" class="m-inp"></div>
                            </div>
                            <div>
                                <label class="lbl">ESTIMATED END</label>
                                <div class="m-wrap"><input id="formEnd" type="date" class="m-inp"></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="secthead">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            <span>STATUS</span>
                        </div>
                        <div class="grid2inner">
                            <div style="grid-column: span 2;">
                                <label class="lbl">CURRENT STATUS</label>
                                <select id="formStatus" class="m-inp">
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Terminated">Terminated</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="sect">
                <div class="roadhead">
                    <div class="secthead">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                        <span>AFFECTED ROADS SELECTION</span>
                    </div>
                </div>

                <div class="grid5">
                    <div class="roads">
                        <div class="m-wrap left">
                            <svg class="m-icon l" style="color:#cbd5e1;" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input type="text" id="roadSearchInput" placeholder="Search roads by name to add..." class="m-inp srch search-override" autocomplete="off">
                            <div id="roadSearchSuggestions" class="search-suggestions hidden"></div>
                        </div>

                        <div class="list">
                            <div class="listtitle" id="selectedRoadsTitle">SELECTED ASSETS (0)</div>
                            <div id="selectedRoadsList" style="display: flex; flex-direction: column; gap: 8px;">
                                <!-- Selected roads will be injected here -->
                            </div>
                        </div>
                    </div>

                    <div class="map" id="projectMapContainer" style="height: 350px; border-radius: 16px; overflow: hidden; border: 1.5px solid #e2e8f0; position: relative;">
                        <!-- Floating Search Tray (Left Side - Visible in Fullscreen) -->
                        <div id="fsSearchPanel" class="fs-search-panel">
                            <div class="fs-search-header">
                                <div class="fs-search-box">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    <input type="text" id="fsRoadSearchInput" placeholder="Quick search roads..." autocomplete="off">
                                </div>
                                <button type="button" class="fs-filter-btn" id="fsFilterBtn" title="Filter Options">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                </button>
                            </div>
                            <div class="fs-results-meta">
                                <span id="fsResultsCount">SHOWING 0 ASSETS</span>
                            </div>
                            <div id="fsRoadMasterList" class="fs-master-list"></div>
                        </div>

                        <button type="button" id="btnFullscreenProjectMap" title="Fullscreen" class="map-fs-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </button>
                        <div id="projectDrawingMap" style="height: 100%; width: 100%;"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="foot">
            <button id="cancelFormModalBtn" class="btn cancel">CANCEL</button>
            <button id="saveProjectBtn" class="btn save">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>SAVE PROJECT ENTRY</span>
            </button>
        </div>
    </div>
</div>
