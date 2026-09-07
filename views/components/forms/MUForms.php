<div class="modal-overlay" id="muFormModal" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 id="muFormTitle" class="m-title">NEW MONTHLY UPDATE</h2>
                <p id="muFormSubTitle" class="m-sub">REPORT ENTRY FORM</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="closeMUFormBtn" title="Close">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <form id="muForm">
            <div class="m-body">
                <div class="sect">
                    <div class="secthead">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        <span>ASSOCIATED PROJECT & TIMING</span>
                    </div>
                    <div class="grid2">
                        <div>
                            <label class="lbl">Maintenance Project</label>
                            <select name="projectId" id="muFormProjectId" class="m-inp" required>
                                <option value="" disabled selected>Select a project...</option>
                            </select>
                        </div>
                        <div class="mu-form-grid-half">
                            <div>
                                <label class="lbl">Update Date</label>
                                <div id="muFormDateDisplay" class="m-inp-display"></div>
                                <input type="hidden" name="updateDate" id="muFormDate">
                            </div>
                            <div>
                                <label class="lbl">Month Number</label>
                                <input type="number" name="monthNumber" id="muFormMonthNumber" class="m-inp" placeholder="e.g. 1" min="1" max="12" required>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="sect">
                    <div class="secthead">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span>PROGRESS & REPORT</span>
                    </div>
                    <div class="sect sect-small-mb">
                        <label class="lbl">Completion Progress (%)</label>
                        <div class="progress-input-container">
                            <input type="range" name="progress" id="muFormProgress" min="0" max="100" value="0">
                            <span class="progress-val" id="muFormProgressVal">0%</span>
                        </div>
                    </div>
                    <div>
                        <label class="lbl">Report Summary</label>
                        <textarea name="summary" id="muFormSummary" class="m-inp summary-area" placeholder="Describe the current status and work completed this month..." required></textarea>
                    </div>
                </div>

                <div class="sect">
                    <div class="secthead">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span>SUPPORTING MEDIA & FILES</span>
                    </div>

                    <div id="existingMediaContainer" style="display: none; margin-top: 15px; margin-bottom: 25px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #64748b;">
                            <i data-lucide="paperclip" style="width: 14px; height: 14px;"></i>
                            <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">Existing Attachments</span>
                        </div>
                        <div id="existingMediaList" class="mu-media-list"></div>
                    </div>

                    <div style="font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="upload-cloud" style="width: 14px; height: 14px;"></i>
                        <span>UPLOAD NEW FILES</span>
                    </div>
                    <div class="file-upload-area" id="muDropZone" style="margin-top: 0;">
                        <input type="file" id="muFileInput" class="mu-hidden" multiple>
                        <div class="upload-icon">
                            <i data-lucide="cloud-upload" style="width: 32px; height: 32px;"></i>
                        </div>
                        <div class="upload-text" id="muFileNameDisplay"><span>Click to browse</span> or drag files here</div>
                    </div>
                </div>
            </div>

            <div class="foot">
                <button type="button" class="btn cancel" id="cancelMUBtn">CANCEL</button>
                <button type="submit" class="btn save" id="saveMUBtn">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>SAVE MONTHLY UPDATE</span>
                </button>
            </div>
        </form>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
