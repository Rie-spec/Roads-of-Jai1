<link rel="stylesheet" href="../../public/css/forms/PDForms.css">

<div class="modal-overlay" id="uploadModal" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 class="m-title">UPLOAD PROJECT DOCUMENT</h2>
                <p class="m-sub">DOCUMENT REPOSITORY FORM</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="closeUploadModalBtn" type="button">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <form id="uploadForm">
            <div class="m-body">
                <div id="formMetaContainer" class="modal-meta-container" style="display: none; margin-bottom: 25px; margin-top: 0 !important;">
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span id="formCreatedBy">Created by: District Engineer</span>
                    </div>
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span id="formUploadDateMeta">Uploaded: May 1, 2026</span>
                    </div>
                    <div class="modal-meta-item">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        <span id="formEditedDate">Edited: May 5, 2026</span>
                    </div>
                </div>
                <div class="mu-divider" id="formMetaDivider" style="display: none;"></div>

                <div class="sect">
                    <div class="secthead"><i data-lucide="info"></i><span>DOCUMENT INFORMATION</span></div>
                    <div style="margin-bottom: 15px;">
                        <label class="lbl">DOCUMENT TITLE</label>
                        <input type="text" id="docTitle" class="m-inp" placeholder="Enter document name..." required>
                    </div>
                    <div>
                        <label class="lbl">ASSOCIATED MAINTENANCE PROJECT</label>
                        <select id="docProject" class="m-inp" required>
                            <option value="" disabled selected>Select Project...</option>
                            <!-- JS Populated from projects collection -->
                        </select>
                    </div>
                </div>

                <div class="sect" style="margin-bottom: 15px;">
                    <div class="secthead"><i data-lucide="paperclip"></i><span>ATTACHMENT DETAILS</span></div>
                    <div class="grid2">
                        <div>
                            <label class="lbl">UPLOAD FILE</label>
                            <div class="upload-zone" id="dropZone">
                                <div class="upload-icon"><i data-lucide="cloud-upload"></i></div>
                                <p class="upload-text-main" id="fileNameDisplay"><span>Click to browse</span> or drag file here</p>
                                <p class="upload-text-sub">PDF, DOCX, XLSX, JPG or PNG (Max 5MB)</p>
                                <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.svg,.dwg" required>
                            </div>
                        </div>

                        <div>
                            <label class="lbl">DESCRIPTION (OPTIONAL)</label>
                            <textarea id="docDescription" class="m-inp" placeholder="Add a brief description..."></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="foot">
                <button type="button" id="cancelUploadBtn" class="btn cancel">CANCEL</button>
                <button type="submit" class="btn save" id="submitBtn">
                    <i data-lucide="upload"></i><span>SAVE PROJECT ENTRY</span>
                </button>
            </div>
        </form>
    </div>
</div>
