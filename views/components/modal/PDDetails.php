<link rel="stylesheet" href="../../public/css/details/PDDetails.css">

<div class="modal-overlay" id="detailsModal" style="display: none;">
    <div class="modal-card">
        <div class="m-head">
            <div class="title-group">
                <h2 class="m-title" id="viewTitle">DOCUMENT DETAILS</h2>
                <p class="m-sub">DOCUMENT DETAILS VIEW</p>
            </div>
            <div class="action-btn-group">
                <button class="m-close" id="closeDetailsBtn" type="button">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <div class="m-body">

            <div class="modal-meta-container" style="margin-bottom: 25px; margin-top: 0 !important;">
                <div class="modal-meta-item">
                    <span id="viewCreatedBy">Created by: District Engineer</span>
                </div>
                <div class="modal-meta-item">
                    <span id="viewUploadDateMeta">Uploaded: —</span>
                </div>
                <div class="modal-meta-item">
                    <span id="viewEditedDate"></span>
                </div>
            </div>

            <div class="sect">
                <label class="lbl">DOCUMENT TITLE</label>
                <div class="m-value" id="viewDocTitle">-</div>
            </div>

            <div class="sect">
                <label class="lbl">ASSOCIATED MAINTENANCE PROJECT</label>
                <div class="m-value" id="viewDocProject">-</div>
            </div>

            <div class="grid2">
                <div class="sect">
                    <label class="lbl">FILE TYPE</label>
                    <div class="m-value" id="viewFileType">-</div>
                </div>
                <div class="sect">
                    <label class="lbl">ACTION</label>
                    <div class="m-value">
                        <a href="#" target="_blank" rel="noopener noreferrer" id="viewFileLink"
                           style="color: #6366f1; text-decoration: underline; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
                            <span>Open File in New Tab</span>
                        </a>
                    </div>
                </div>
            </div>

            <div class="sect">
                <label class="lbl">DESCRIPTION</label>
                <div class="m-value" id="viewDescription" style="min-height: 80px; align-items: flex-start; padding-top: 15px;">No description provided.</div>
            </div>

            <!-- FILE PREVIEW: images render inline, PDFs/docs show open/download card -->
            <div id="viewFilePreview" style="display: none; margin-top: 8px;"></div>

        </div>

        <div class="foot">
            <button type="button" class="btn save" id="editDocumentBtn">
                <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
                <span>EDIT RECORD</span>
            </button>
        </div>
    </div>
</div>
