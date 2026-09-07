<link rel="stylesheet" href="../../public/css/forms/LGUForms.css">

<div class="modal-overlay" id="lguFormModal" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 id="lguFormTitle" class="m-title">NEW LGU RECORD</h2>
                <p id="lguFormSubTitle" class="m-sub">GOVERNMENT UNIT ENTRY FORM</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="closeLGUFormBtn">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <form id="lguForm">
            <div class="m-body">
                <div class="sect">
                    <div class="secthead">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>MUNICIPALITY INFORMATION</span>
                    </div>
                    <div class="grid2">
                        <div>
                            <label class="lbl">Municipality Name</label>
                            <input type="text" name="name" id="lguFormName" class="m-inp" placeholder="e.g. Batangas City" required>
                        </div>
                        <div>
                            <label class="lbl">Current Mayor</label>
                            <input type="text" name="mayor" id="lguFormMayor" class="m-inp" placeholder="e.g. Hon. Juan Dela Cruz" required>
                        </div>
                    </div>
                    <div class="grid2" style="margin-top: 15px;">
                        <div>
                            <label class="lbl">Province</label>
                            <input type="text" name="province" id="lguFormProvince" class="m-inp" placeholder="e.g. Batangas" required>
                        </div>
                        <div>
                            <label class="lbl">Region</label>
                            <select name="region" id="lguFormRegion" class="m-inp" required>
                                <option value="">Select a region...</option>
                                <option value="Region I">Region I</option>
                                <option value="Region II">Region II</option>
                                <option value="Region III">Region III</option>
                                <option value="Region IV-A">Region IV-A</option>
                                <option value="MIMAROPA">MIMAROPA</option>
                                <option value="Region V">Region V</option>
                                <option value="NCR">NCR</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="sect">
                    <div class="secthead">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>CONTACT DETAILS</span>
                    </div>
                    <div>
                        <label class="lbl">Office Contact Number</label>
                        <input type="text" name="contactNumber" id="lguFormContact" class="m-inp" placeholder="e.g. (043) 723-1234">
                    </div>
                </div>
            </div>

            <div class="foot">
                <button type="button" class="btn cancel" id="cancelLGUBtn">CANCEL</button>
                <button type="submit" class="btn save" id="saveLGUBtn">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>SAVE LGU RECORD</span>
                </button>
            </div>
        </form>
    </div>
</div>
