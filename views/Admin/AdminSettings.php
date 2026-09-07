<?php 
// Admin Settings Page
$current_page = 'settings';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAIROADS — Admin Settings</title>
    <link href="../../public/css/components/sidebar.css" rel="stylesheet">
    <link href="../../public/css/global.css" rel="stylesheet">
    <link href="../../public/css/pages/Settings.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>

<!-- SVG Background Shell -->
<?php include __DIR__ . '/../../partials/background.php'; ?>

<!-- Side Navigation (Admin version) -->
<?php include __DIR__ . '/../../partials/adminSidebar.php'; ?>

<main id="mainContent" class="main-content profiles-page">
    <header class="top-nav-bar">
        <button class="mobile-menu-btn" id="mobileMenuBtn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div class="header-title-section">
            <h1 class="page-title" id="pageTitle">Admin Profile</h1>
            <div class="page-subtitle" id="pageSubtitle">Manage your administrative information and history</div>
        </div>

        <div class="global-actions">
            <button class="btn-edit-profile" id="editProfileBtn" onclick="enterEditMode()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span>Edit Profile</span>
            </button>
        </div>
    </header>

    <div class="page-container">
        <div class="main-tabs">
            <button class="main-tab-btn active" id="tabBtnProfile" onclick="switchTab('profile',this)">Admin Profile</button>
            <button class="main-tab-btn" id="tabBtnSecurity" onclick="switchTab('security',this)">Privacy &amp; Security</button>
        </div>

    <!-- ACCOUNT PROFILE TAB -->
    <div class="tab-panel active" id="tab-profile">
      <div class="profile-layout">
        <!-- LEFT -->
        <div class="settings-profile-card" id="profileCard">
          <div class="settings-banner" id="bannerArea" onclick="triggerBannerUpload()">
            <img class="banner-img" id="bannerImg" src="" alt="" style="display:none">
            <div class="banner-edit-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Change Banner
            </div>
          </div>

          <div class="settings-profile-body">
            <div class="settings-avatar-wrap">
              <div class="settings-avatar" id="profileAvatar" onclick="triggerAvatarUpload()">
                <span id="profileAvatarText">AU</span>
                <img id="profileAvatarImg" src="" alt="" style="display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%">
                <div class="avatar-edit-overlay">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>
            </div>

            <!-- VIEW MODE -->
            <div class="profile-view" id="profileViewMode">
              <div class="settings-name fetching" id="profileName">Fetching profile...</div>
              <div style="display:flex;justify-content:center">
                <div class="profile-role-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span id="profileRole">Administrator</span>
                </div>
              </div>
              <div class="profile-info-list" style="margin-top:18px">
                <div class="profile-info-item">
                  <div class="profile-info-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                  <div>
                    <div class="profile-info-label">Email Address</div>
                    <div class="profile-info-val fetching" id="profileEmail">...</div>
                  </div>
                </div>
                <div class="profile-info-item">
                  <div class="profile-info-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                  <div style="flex:1">
                    <div class="profile-info-label">Password</div>
                    <div class="pw-info-val">
                      <span class="pw-dots">••••••••</span>
                      <a class="pw-change-link" onclick="goToSecurity()">Change →</a>
                    </div>
                  </div>
                </div>
                <div class="profile-info-item">
                  <div class="profile-info-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                  <div>
                    <div class="profile-info-label">Member Since</div>
                    <div class="profile-info-val fetching" id="profileSince">...</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- EDIT MODE -->
            <div class="profile-edit" id="profileEditMode">
              <div style="margin-bottom:14px;text-align:center">
                <div style="font-size:11px;color:var(--hint);font-weight:600">Click the avatar or banner above to change photos</div>
              </div>
              <div class="edit-inline-field">
                <label>Full Name</label>
                <input type="text" id="editName" placeholder="Your full name">
              </div>
              <div class="edit-inline-field">
                <label>Role / Title</label>
                <input type="text" id="editRole" placeholder="e.g. System Admin">
              </div>
              <div class="edit-actions">
                <button class="btn-save" onclick="saveProfile()">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Save Changes
                </button>
                <button class="btn-cancel" onclick="exitEditMode()">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="profile-right-col">
          <!-- Biography -->
          <div class="section-card">
            <div class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Biography
            </div>
            <div id="bioViewMode">
              <p class="bio-text fetching" id="profileBio" style="min-height: 60px;">Fetching biography...</p>
            </div>
            <div id="bioEditMode" style="display:none">
              <div class="edit-inline-field" style="margin-bottom:0">
                <label>Biography</label>
                <textarea id="editBio" placeholder="Write a short bio..." style="min-height:100px"></textarea>
              </div>
              <div class="edit-actions" style="margin-top:10px">
                <button class="btn-save" onclick="saveProfile()">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Save Changes
                </button>
                <button class="btn-cancel" onclick="exitEditMode()">Cancel</button>
              </div>
            </div>
          </div>

          <!-- Project History -->
          <div class="section-card">
            <div class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Project History
            </div>
            <div class="proj-tab-underline">
              <button class="proj-tab active" onclick="filterProjects('all',this)">All</button>
              <button class="proj-tab" onclick="filterProjects('ongoing',this)">Ongoing</button>
              <button class="proj-tab" onclick="filterProjects('completed',this)">Completed</button>
              <button class="proj-tab" onclick="filterProjects('terminated',this)">Terminated</button>
            </div>
            <div class="project-list" id="projectList"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- PRIVACY & SECURITY TAB -->
    <div class="tab-panel" id="tab-security">
      <div class="security-grid">
        <!-- LEFT COLUMN -->
        <div class="content-col">
          <!-- CHANGE PASSWORD -->
          <div class="section-card">
            <div class="section-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Change Password
            </div>
            <p class="section-desc">Update your security credentials. You may be asked to re-login after.</p>
            <div style="display:flex;flex-direction:column;gap:14px;width:100%">
              <div class="field">
                <label class="field-label">Current Password</label>
                <div class="field-input-wrap">
                  <input type="password" id="currentPass" class="field-input" placeholder="Enter current password">
                  <button class="pw-toggle" onclick="togglePw('currentPass',this)" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                </div>
              </div>
              <div class="field">
                <label class="field-label">New Password</label>
                <div class="field-input-wrap">
                  <input type="password" id="newPass" class="field-input" placeholder="Min. 8 characters" oninput="checkStrength(this.value)">
                  <button class="pw-toggle" onclick="togglePw('newPass',this)" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                </div>
                <div class="strength-bar"><div class="strength-fill" id="strengthFill" style="width:0%"></div></div>
                <div class="strength-label" id="strengthLabel" style="color:var(--hint)"></div>
              </div>
              <div class="field">
                <label class="field-label">Confirm Password</label>
                <div class="field-input-wrap">
                  <input type="password" id="confirmPass" class="field-input" placeholder="Repeat new password" oninput="checkMatch()">
                  <button class="pw-toggle" onclick="togglePw('confirmPass',this)" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                </div>
                <div class="match-msg" id="matchMsg"></div>
              </div>
              <button class="btn-primary" id="btnUpdatePw" onclick="updatePassword()" style="align-self:flex-start;margin-top:4px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Update Password
              </button>
            </div>
          </div>

          <!-- TWO-FACTOR AUTH -->
          <div class="section-card">
            <div class="section-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              Two-Factor Authentication
            </div>
            <p class="section-desc">Add an extra layer of security by enabling SMS verification on login.</p>
            <div style="border-top:1px solid var(--border);padding-top:16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
              <div class="row-info">
                <div class="row-title">SMS Authentication</div>
                <div class="row-sub" id="twoFAStatus">Not configured</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span class="badge badge-disabled" id="twoFABadge">Disabled</span>
                <button class="btn-secondary" id="btn2FA" onclick="open2FA()">Enable</button>
              </div>
            </div>
            <div id="twoFAPhoneDisplay" style="display:none;margin-top:12px;padding:10px 14px;background:var(--indigo-light);border-radius:11px;font-size:12px;font-weight:700;color:#3730a3"></div>
          </div>

          <!-- ACTIVE SESSIONS -->
          <div class="section-card">
            <div class="section-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              Active Sessions
            </div>
            <p class="section-desc">Devices currently logged into your account. Revoke any you don't recognize.</p>
            <div id="sessionsList"></div>
            <button class="btn-sign-all" onclick="signOutAll()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out All Other Devices
            </button>
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="content-col">
          <!-- NETWORK IDENTITY -->
          <div class="section-card">
            <div class="section-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Network Identity
            </div>
            <p class="section-desc">Your current IP address and network information.</p>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--hint);margin-bottom:4px">IP Address</div>
            <div class="ip-display">
              <div class="ip-dot" id="ipDot" style="background:#d1d5db"></div>
              <span id="ipAddr">Detecting...</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
              <div class="vpn-badge vpn-no" id="vpnBadge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
                <span id="vpnText">Checking...</span>
              </div>
              <button class="btn-secondary" onclick="fetchIP()" style="padding:5px 10px;font-size:11px">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.06-8.77"/></svg>
                Refresh
              </button>
              <button class="btn-secondary" onclick="copyIP()" style="padding:5px 10px;font-size:11px">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              </button>
            </div>
            <div class="ip-grid">
              <div class="ip-cell"><div class="ip-cell-label">Location</div><div class="ip-cell-val" id="ipCity">—</div></div>
              <div class="ip-cell"><div class="ip-cell-label">ISP / Org</div><div class="ip-cell-val" id="ipIsp">—</div></div>
              <div class="ip-cell"><div class="ip-cell-label">Country</div><div class="ip-cell-val" id="ipCountry">—</div></div>
              <div class="ip-cell"><div class="ip-cell-label">Type</div><div class="ip-cell-val" id="ipType">—</div></div>
            </div>
          </div>

          <!-- PRIVACY & DATA -->
          <div class="section-card">
            <div class="section-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              Privacy &amp; Data
            </div>
            <p class="section-desc">Manage your data visibility and account settings.</p>
            <div>
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                <div class="row-info">
                  <div class="row-title">Profile Visibility</div>
                  <div class="row-sub">Who can see your profile</div>
                </div>
                <select class="custom-select" id="visSelect" onchange="saveVisibility()">
                  <option value="public">Visible to All</option>
                  <option value="engineers" selected>Engineers Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div class="vis-desc" id="visDesc">Only users with the Engineer role can view your profile.</div>
              <div class="divider-row">
                <div class="row-info">
                  <div class="row-title">Download My Data</div>
                  <div class="row-sub">Export profile as JSON</div>
                </div>
                <button class="btn-secondary" onclick="downloadData()" style="padding:8px 12px">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
              </div>
              <div class="divider-row">
                <div class="row-info">
                  <div class="row-title">Activity Log</div>
                  <div class="row-sub">Recent account events</div>
                </div>
                <button class="btn-secondary" onclick="openActivityLog()" style="padding:8px 12px">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  View
                </button>
              </div>
              <div class="divider-row">
                <div class="row-info">
                  <div class="row-title">Login Notifications</div>
                  <div class="row-sub">Email on new sign-in</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="loginNotifToggle" checked onchange="saveToggle('loginNotifications',this.checked)">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- DANGER ZONE -->
          <div class="danger-card">
            <div class="danger-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Danger Zone
            </div>
            <p class="danger-desc">Permanently delete your account. All data is removed and cannot be recovered.</p>
            <button class="btn-danger" onclick="openModal('deleteModal')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete My Account
            </button>
          </div>
        </div>
      </div> <!-- .page-container -->
</main>

<div class="toast" id="toast">Success</div>

<!-- LOGOUT MODAL -->
<div class="modal-faux" id="logoutModal">
  <div class="modal-box">
    <h3>Sign out?</h3>
    <p>You'll need to enter your credentials again to access the console.</p>
    <div class="modal-btns">
      <button class="modal-btn cancel" onclick="closeModal('logoutModal')">Cancel</button>
      <button class="modal-btn confirm-red" id="logoutConfirm">Sign Out</button>
    </div>
  </div>
</div>

<!-- DELETE ACCOUNT MODAL -->
<div class="modal-faux" id="deleteModal">
  <div class="modal-box">
    <h3 style="color:var(--red)">Delete Account</h3>
    <p>This is permanent. All your data will be removed from our servers and cannot be recovered.</p>
    <div class="field" style="margin-bottom:16px">
      <label class="field-label" style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--hint);">Current Password</label>
      <div class="field-input-wrap">
        <input type="password" id="deletePass" class="field-input" placeholder="Enter password to confirm">
        <button class="pw-toggle" onclick="togglePw('deletePass',this)" tabindex="-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </div>
    <div class="modal-btns">
      <button class="modal-btn cancel" onclick="closeModal('deleteModal')">Cancel</button>
      <button class="modal-btn confirm-red" id="deleteConfirm">Delete Forever</button>
    </div>
  </div>
</div>

<!-- 2FA MODAL -->
<div class="modal-faux" id="twoFAModal">
  <div class="modal-box" style="width:380px">
    <div class="steps" id="twoFASteps">
      <div class="step done" id="s1"></div>
      <div class="step" id="s2"></div>
      <div class="step" id="s3"></div>
    </div>
    <div id="twoFAContent"></div>
    <div class="modal-btns" id="twoFABtns"></div>
  </div>
</div>

<!-- ACTIVITY LOG MODAL -->
<div class="modal-faux" id="activityModal">
  <div class="modal-box" style="width:400px">
    <h3 style="margin-bottom:16px;display:flex;align-items:center;gap:8px">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      Activity Log
    </h3>
    <div id="activityList"></div>
    <button class="modal-btn cancel" style="width:100%;margin-top:16px" onclick="closeModal('activityModal')">Close</button>
  </div>
</div>

<input type="file" id="bannerInput" accept="image/*" onchange="handleBannerUpload(event)">
<input type="file" id="avatarInput" accept="image/*" onchange="handleAvatarUpload(event)">

<script type="module" src="../../public/js/pages/Settings.js"></script>
<script>
    if (window.lucide) {
        lucide.createIcons();
    }
</script>

</body>
</html>
