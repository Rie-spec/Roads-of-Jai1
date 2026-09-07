<div class="modal-overlay" id="lguFormModal">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 id="lguFormTitle" class="m-title">NEW LGU RECORD</h2>
                <p class="m-sub">ADMIN ENTRY FORM</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="closeLGUFormBtn">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <form id="lguForm" class="modal-form">
            <div class="m-body">
                <div class="grid2">
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <label class="lbl" for="lguFormName">Municipality Name</label>
                            <div style="position: relative;">
                                <i data-lucide="map-pin" style="width: 16px; height: 16px; position: absolute; left: 16px; top: 15px; color: #94a3b8; z-index: 10;"></i>
                                <input type="text" id="lguFormName" placeholder="Enter municipality name" class="m-inp" required style="padding-left: 48px !important;">
                            </div>
                        </div>

                        <div>
                            <label class="lbl" for="lguFormMayor">Current Mayor</label>
                            <div style="position: relative;">
                                <i data-lucide="user" style="width: 16px; height: 16px; position: absolute; left: 16px; top: 15px; color: #94a3b8; z-index: 10;"></i>
                                <input type="text" id="lguFormMayor" placeholder="Full name of mayor" class="m-inp" required style="padding-left: 48px !important;">
                            </div>
                        </div>
                    </div>

                    <div style="flex: 1; display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <label class="lbl" for="lguFormRegion">Region</label>
                            <div style="position: relative;">
                                <i data-lucide="globe" style="width: 16px; height: 16px; position: absolute; left: 16px; top: 15px; color: #94a3b8; z-index: 10;"></i>
                                <select id="lguFormRegion" class="m-inp" required style="padding-left: 48px !important;">
                                    <option value="" disabled selected>Select Region</option>
                                    <option value="Region I">Region I</option>
                                    <option value="Region II">Region II</option>
                                    <option value="Region III">Region III</option>
                                    <option value="Region IV-A">Region IV-A</option>
                                    <option value="Region IV-B">Region IV-B</option>
                                    <option value="Region V">Region V</option>
                                    <option value="Region VI">Region VI</option>
                                    <option value="Region VII">Region VII</option>
                                    <option value="Region VIII">Region VIII</option>
                                    <option value="Region IX">Region IX</option>
                                    <option value="Region X">Region X</option>
                                    <option value="Region XI">Region XI</option>
                                    <option value="Region XII">Region XII</option>
                                    <option value="CAR">CAR</option>
                                    <option value="NCR">NCR</option>
                                    <option value="BARMM">BARMM</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="lbl" for="lguFormProvince">Province</label>
                            <div style="position: relative;">
                                <i data-lucide="map" style="width: 16px; height: 16px; position: absolute; left: 16px; top: 15px; color: #94a3b8; z-index: 10;"></i>
                                <input type="text" id="lguFormProvince" placeholder="e.g., Davao de Oro" class="m-inp" required style="padding-left: 48px !important;">
                            </div>
                        </div>

                        <div>
                            <label class="lbl" for="lguFormContact">Contact Number</label>
                            <div style="position: relative;">
                                <i data-lucide="phone" style="width: 16px; height: 16px; position: absolute; left: 16px; top: 15px; color: #94a3b8; z-index: 10;"></i>
                                <input type="text" id="lguFormContact" placeholder="Official contact no." class="m-inp" style="padding-left: 48px !important;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="foot">
                <button type="button" class="btn cancel" id="cancelLGUBtn">CANCEL</button>
                <button type="submit" class="btn save" id="saveLGUBtn">
                    <span>SAVE LGU RECORD</span>
                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                </button>
            </div>
        </form>
    </div>
</div>
