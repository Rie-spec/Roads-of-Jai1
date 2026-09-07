<link rel="stylesheet" href="../../public/css/forms/RSForms.css">

<div class="modal-overlay" id="roadFormModal" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 id="roadFormTitle" class="m-title">NEW ROAD ASSET RECORD</h2>
                <p class="m-sub">ASSET REGISTRATION TERMINAL</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="btnCloseRoadForm">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <form id="roadForm">
            <div class="m-body">
                <!-- Start and End Points -->
                <div class="sect">
                    <div class="grid2">
                        <div>
                            <label class="lbl">START POINT</label>
                            <input id="startPoint" name="startPoint" type="text" placeholder="e.g. Brgy. Poblacion" class="m-inp" required>
                        </div>
                        <div>
                            <label class="lbl">END POINT</label>
                            <input id="endPoint" name="endPoint" type="text" placeholder="e.g. Brgy. Mainit" class="m-inp" required>
                        </div>
                    </div>
                </div>

                <div class="sect">
                    <div class="secthead">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>ROAD SPECIFICATIONS</span>
                    </div>
                    <div class="grid2">
                        <div>
                            <label class="lbl">MUNICIPALITY</label>
                            <select id="roadMunicipality" name="roadMunicipality" class="m-inp" required>
                                <option value="" disabled selected>Select Municipality...</option>
                            </select>
                        </div>
                        <div>
                            <label class="lbl">PAVEMENT TYPE</label>
                            <select id="pavementType" name="pavementType" class="m-inp" required>
                                <option value="" disabled selected>Select Pavement Type...</option>
                                <option value="Concrete">Concrete</option>
                                <option value="Asphalt">Asphalt</option>
                                <option value="Gravel">Gravel</option>
                                <option value="Earth">Earth</option>
                            </select>
                        </div>
                    </div>
                    <div class="sect" style="margin-top: 20px;">
                        <label class="lbl">STATE CATEGORY</label>
                        <select id="stateCategory" name="stateCategory" class="m-inp" required style="border-radius: 14px;">
                            <option value="" disabled selected>Select State Category...</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Bad">Bad</option>
                        </select>
                    </div>
                </div>

                <div class="sect">
                    <div class="secthead">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                        <span>SPATIAL DATA (SNAPPING ROUTE)</span>
                    </div>
                    
                    <div class="geojson-status" id="geojsonStatus" style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8fafc; border: 1.5px dashed #e2e8f0; border-radius: 12px; color: #64748b; font-size: 12px; font-weight: 700;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span id="geojsonStatusText">Route not mapped yet</span>
                    </div>

                    <div class="map-wrapper" id="roadMapWrapper">
                        <!-- Mission Control Status Pill -->
                        <div class="mission-control">
                            <div class="pulse-dot"></div>
                            <span id="missionGuidance">INITIALIZING GIS TERMINAL...</span>
                        </div>

                        <!-- Coordinate Readout Panel -->
                        <div class="coord-readout">
                            <div class="coord-item">
                                <span class="coord-label">LAT</span>
                                <span id="currentLat" class="coord-value">0.000000</span>
                            </div>
                            <div class="coord-item">
                                <span class="coord-label">LNG</span>
                                <span id="currentLng" class="coord-value">0.000000</span>
                            </div>
                            <div class="coord-divider"></div>
                            <div class="coord-item">
                                <span class="coord-label">DIST</span>
                                <span id="totalDistance" class="coord-value">0.00 km</span>
                            </div>
                        </div>

                        <div class="mapping-pill">
                            <button type="button" id="btnSetStart" class="btn-terminal-action start">
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                SET START POINT
                            </button>
                            <button type="button" id="btnSetEnd" class="btn-terminal-action end">
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                SET END POINT
                            </button>
                        </div>

                        <button type="button" id="btnFullscreenMap" class="map-fs-trigger" title="Fullscreen Engineering Mode">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </button>

                        <input type="hidden" id="mapStartLat">
                        <input type="hidden" id="mapStartLng">
                        <input type="hidden" id="mapEndLat">
                        <input type="hidden" id="mapEndLng">
                        <textarea id="roadGeoJSON" name="roadGeoJSON" style="display: none;" required></textarea>
                        <div id="drawingMap" style="height: 100%; width: 100%;"></div>
                    </div>
                </div>
            </div>

            <div class="foot">
                <button type="button" class="btn cancel" id="btnCancelRoadForm">CANCEL</button>
                <button type="submit" class="btn save" id="btnSaveRoad">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span id="btnSaveText">SAVE ROAD ASSET</span>
                    <svg id="saveSpinner" class="spinner hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg>
                </button>
            </div>
        </form>
    </div>
</div>
