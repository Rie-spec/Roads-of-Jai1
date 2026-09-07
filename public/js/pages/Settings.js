/* Settings.js */

import { db, auth } from '../firebase-config.js';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    setDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    or
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
    updatePassword as fbUpdatePassword,
    signOut, 
    deleteUser,
    EmailAuthProvider, 
    reauthenticateWithCredential 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { requireRole } from '../auth-guard.js';

// ── Auth Guard ─────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;
let profileData = {};

async function checkAuth() {
    try {
        const { user, profile } = await requireRole(['Engineer', 'Admin', 'Administrator']);
        currentUser = user;
        currentProfile = profile;
        profileData = profile;
        console.log('Authenticated for Settings:', currentUser?.email);

        // Fetch Engineer details if applicable
        if ((profile.role === 'engineer' || profile.role === 'Engineer') && profile.engineerId) {
            const engSnap = await getDoc(doc(db, 'Engineers', profile.engineerId));
            if (engSnap.exists()) {
                window._engineerDetails = engSnap.data();
            }
        }
        
        initSettingsModule();
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

checkAuth();

function initSettingsModule() {
    populateUI();
    renderProjects('all');
    renderSessions();
    renderPrivacy();
    render2FA();
    fetchIP();
    setupEventListeners();
}

function populateUI() {
    let displayName = 'User';
    let displayRole = currentProfile?.role || 'User';

    const isAdmin = currentProfile?.role?.toLowerCase().includes('admin');

    if (isAdmin) {
        displayName = currentProfile?.username || 'Admin';
        displayRole = currentProfile?.role === 'admin' ? 'Admin' : 'Administrator';
    } else if (window._engineerDetails) {
        const eng = window._engineerDetails;
        const fName = eng.firstName || '';
        const lName = eng.lastName || '';
        displayName = `Engr. ${fName} ${lName}`.trim();
        displayRole = eng.position || 'District Engineer';
    } else {
        displayName = (profileData.firstName && profileData.lastName) 
            ? `${profileData.firstName} ${profileData.lastName}` 
            : (profileData.name || currentProfile?.username || 'Engineer');
    }
        
    const initials = displayName.split(' ').filter(p => !p.includes('.')).map(w => w[0]).slice(0, 2).join('').toUpperCase();

    const pAvatarText = document.getElementById('profileAvatarText');
    if(pAvatarText) pAvatarText.textContent = initials;

    const pName = document.getElementById('profileName');
    const pEmail = document.getElementById('profileEmail');
    const pBio = document.getElementById('profileBio');
    const pSince = document.getElementById('profileSince');
    const pRole = document.getElementById('profileRole');

    if(pName) { pName.textContent = displayName; pName.classList.remove('fetching'); }
    if(pEmail) { pEmail.textContent = currentUser?.email || profileData.email || '—'; pEmail.classList.remove('fetching'); }
    if(pBio) { pBio.textContent = profileData.bio || 'Engineer specializing in road maintenance and structural integrity.'; pBio.classList.remove('fetching'); }
    if(pRole) pRole.textContent = displayRole;
    
    if(pSince) {
        let since = profileData.createdAt;
        if (since) {
            const d = since.toDate ? since.toDate() : new Date(since);
            pSince.textContent = d.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
        } else if (currentUser.metadata?.creationTime) {
            pSince.textContent = new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
        }
        pSince.classList.remove('fetching');
    }

    // Hide project history for admins
    const projHistorySection = document.querySelector('.section-card:has(#projectList)') || document.getElementById('projectList')?.closest('.section-card');
    if (projHistorySection && isAdmin) {
        projHistorySection.style.display = 'none';
    }

    // Restore saved avatar / banner
    const savedAvatar = localStorage.getItem('jairoads_avatar_' + currentUser.uid);
    const savedBanner = localStorage.getItem('jairoads_banner_' + currentUser.uid);
    if (savedAvatar) setAvatarImg(savedAvatar);
    if (savedBanner) setBannerImg(savedBanner);
}

function setupEventListeners() {
    // Add logic for logout button if it's on the page
    const logoutBtn = document.getElementById('logoutConfirm');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = '../login.php';
            } catch (err) {
                console.error('Logout error:', err);
            }
        });
    }
}

// ─── TAB SWITCHING ────────────────────────────────────────
window.switchTab = (tab, btn) => {
  document.querySelectorAll('.main-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');

  const editBtn = document.getElementById('editProfileBtn');
  if (tab === 'profile') {
    document.getElementById('pageTitle').textContent    = 'Account Profile';
    document.getElementById('pageSubtitle').textContent = 'Manage your personal information and history';
    if(editBtn) editBtn.style.display = 'inline-flex';
  } else {
    document.getElementById('pageTitle').textContent    = 'Settings';
    document.getElementById('pageSubtitle').textContent = 'Manage your personal information and security';
    if(editBtn) editBtn.style.display = 'none';
    exitEditMode();
  }
};

window.goToSecurity = () => {
  switchTab('security', document.getElementById('tabBtnSecurity'));
  setTimeout(() => document.getElementById('currentPass')?.focus(), 300);
};

// ─── EDIT MODE ───────────────────────────────────────────
window.enterEditMode = () => {
  document.getElementById('profileCard').classList.add('editing');
  document.getElementById('editProfileBtn').style.display = 'none';
  document.getElementById('bioEditMode').style.display    = 'block';
  document.getElementById('bioViewMode').style.display    = 'none';
  
  const editName = document.getElementById('editName');
  const editRole = document.getElementById('editRole');
  const editBio  = document.getElementById('editBio');

  if (editName) {
    editName.value = document.getElementById('profileName').textContent;
    editName.disabled = true;
    editName.style.background = '#f1f5f9';
    editName.style.cursor = 'not-allowed';
  }
  
  if (editRole) {
    editRole.value = document.getElementById('profileRole').textContent;
    editRole.disabled = true;
    editRole.style.background = '#f1f5f9';
    editRole.style.cursor = 'not-allowed';
  }
  
  if (editBio) {
    editBio.value  = document.getElementById('profileBio').textContent;
  }
};

window.exitEditMode = () => {
  document.getElementById('profileCard').classList.remove('editing');
  document.getElementById('bioEditMode').style.display = 'none';
  document.getElementById('bioViewMode').style.display = 'block';
  if (document.getElementById('tab-profile').classList.contains('active')) {
    const editBtn = document.getElementById('editProfileBtn');
    if(editBtn) editBtn.style.display = 'inline-flex';
  }
};

window.saveProfile = async () => {
  const bioInput = document.getElementById('editBio');
  const bio = bioInput?.value.trim() || '';

  try {
    // Update only bio as per requirements
    await updateDoc(doc(db, 'UserAccounts', currentUser.uid), { 
        bio: bio
     });
    
    document.getElementById('profileBio').textContent = bio || '—';
    profileData = { ...profileData, bio };
    showToast('✓ Biography updated', 'success');
  } catch (e) {
    console.warn('Firestore update failed:', e);
    showToast('Error saving biography', 'error');
  }
  exitEditMode();
};

// ─── AVATAR & BANNER ─────────────────────────────────────
window.triggerAvatarUpload = () => document.getElementById('avatarInput').click();
window.triggerBannerUpload = () => document.getElementById('bannerInput').click();

window.handleAvatarUpload = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    setAvatarImg(ev.target.result);
    if (currentUser) localStorage.setItem('jairoads_avatar_' + currentUser.uid, ev.target.result);
    showToast('✓ Profile photo updated', 'success');
  };
  reader.readAsDataURL(file);
};

window.handleBannerUpload = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    setBannerImg(ev.target.result);
    if (currentUser) localStorage.setItem('jairoads_banner_' + currentUser.uid, ev.target.result);
    showToast('✓ Banner updated', 'success');
  };
  reader.readAsDataURL(file);
};

function setAvatarImg(src) {
  const img = document.getElementById('profileAvatarImg');
  const txt = document.getElementById('profileAvatarText');
  if(img) { img.src = src; img.style.display = 'block'; }
  if(txt) txt.style.display = 'none';
}

function setBannerImg(src) {
  const img = document.getElementById('bannerImg');
  if(img) { img.src = src; img.style.display = 'block'; }
}

// ─── PROJECTS ──────────────────────────────────────────── (Samples for Profile History)
const sampleProjects = [
    { id:1, name:'Brgy. Tagbaros Road Repaving',       location:'Maco, Davao De Oro',         start:'Oct 2023', end:'Present', status:'ongoing'    },
    { id:2, name:'Nabunturan–Monkayo Arterial Road',   location:'Nabunturan, Davao De Oro',   start:'Jan 2023', end:'Aug 2023', status:'completed'  },
    { id:3, name:'Poblacion Loop West Extension',       location:'Compostela, Davao De Oro',   start:'Mar 2022', end:'Nov 2022', status:'completed'  },
    { id:4, name:'Laak Boundary Access Road',          location:'Laak, Davao De Oro',         start:'Dec 2022', end:'Feb 2023', status:'terminated' },
    { id:5, name:'San Isidro Bridge Approach Road',    location:'San Isidro, Davao De Oro',   start:'Jun 2023', end:'Present', status:'ongoing'    },
    { id:6, name:'Camanlangan Farm-to-Market Road',    location:'Maragusan, Davao De Oro',    start:'May 2021', end:'Jan 2022', status:'completed'  },
];

window.filterProjects = (filter, btn) => {
  document.querySelectorAll('.proj-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjects(filter);
};

async function renderProjects(filter) {
  const isAdmin = currentProfile?.role?.toLowerCase().includes('admin');
  if (isAdmin) return;

  const list = document.getElementById('projectList');
  if(!list) return;

  list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--hint);font-size:13px"><div class="spinner"></div> Loading history...</div>';

  try {
    // Collect all possible name variations for this user to ensure we find their projects
    const namesArray = [];
    
    // 1. Current display name and identifiers
    const displayedName = document.getElementById('profileName')?.textContent;
    if (displayedName) namesArray.push(displayedName);
    if (currentUser?.uid) namesArray.push(currentUser.uid);
    if (currentUser?.email) namesArray.push(currentUser.email);

    // 2. Variations based on profile and engineer data
    const sources = [profileData, window._engineerDetails].filter(Boolean);
    sources.forEach(src => {
        const fName = src.firstName || src.firstname || '';
        const lName = src.lastName || src.lastname || '';
        const rawName = `${fName} ${lName}`.trim();
        if (rawName && !namesArray.includes(rawName)) namesArray.push(rawName);
        
        const engrName = `Engr. ${rawName}`;
        if (!namesArray.includes(engrName)) namesArray.push(engrName);

        if (src.fullName && !namesArray.includes(src.fullName)) namesArray.push(src.fullName);
        if (src.username && !namesArray.includes(src.username)) namesArray.push(src.username);
    });

    if (namesArray.length === 0) {
        list.innerHTML = `<div style="text-align:center;padding:24px;color:var(--hint);font-size:13px">No engineer identity found to load history.</div>`;
        return;
    }

    // Step 3: BUILD THE QUERY
    // Use the relational ID if available, or fall back to name-based in-filter
    const constraints = [
        where("managingEngineerId", "in", namesArray.slice(0, 10))
    ];

    let finalQuery;
    if (profileData.engineerId) {
        finalQuery = query(
            collection(db, "MaintenanceProjects"),
            or(
                ...constraints,
                where("managingEngineerDocId", "==", profileData.engineerId)
            )
        );
    } else {
        finalQuery = query(
            collection(db, "MaintenanceProjects"),
            ...constraints
        );
    }
    
    const [allProjectsSnap, allLGUsSnap] = await Promise.all([
        getDocs(finalQuery),
        getDocs(collection(db, "LGUs"))
    ]);
    const projects = allProjectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const allLGUs = allLGUsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const filtered = filter === 'all' ? projects : projects.filter(p => (p.status || '').toLowerCase() === filter);

    if (!filtered.length) {
      list.innerHTML = `<div style="text-align:center;padding:24px;color:var(--hint);font-size:13px">No ${filter === 'all' ? '' : filter} projects found.</div>`;
      return;
    }

    const statusBadge = (s) => {
      const st = (s || '').toLowerCase();
      if (st === 'ongoing')    return `<span class="badge-ongoing"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Ongoing</span>`;
      if (st === 'completed')  return `<span class="badge-completed"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Completed</span>`;
      return `<span class="badge-terminated"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Terminated</span>`;
    };
    const iconBg    = (s) => (s || '').toLowerCase() === 'ongoing' ? '#e0f2fe' : (s || '').toLowerCase() === 'completed' ? 'var(--green-light)' : 'var(--red-light)';
    const iconColor = (s) => (s || '').toLowerCase() === 'ongoing' ? '#0369a1' : (s || '').toLowerCase() === 'completed' ? '#065f46' : '#991b1b';

    list.innerHTML = filtered.map(p => {
      const lguId = p.lguId || p.municipality || '';
      const targetLgu = allLGUs.find(l => l.id === lguId || l.municipalityName === lguId);
      const muniName = targetLgu ? targetLgu.municipalityName : lguId;

      return `
      <div class="project-item">
        <div class="project-item-left">
          <div class="project-item-icon" style="background:${iconBg(p.status)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor(p.status)}" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <div class="project-item-name">${p.projectTitle || p.title || 'Untitled Project'}</div>
            <div class="project-item-meta">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${muniName}
              <span class="project-item-dot"></span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${p.startDate || '---'} – ${p.endDate || '---'}
            </div>
          </div>
        </div>
        ${statusBadge(p.status)}
      </div>
    `}).join('');
  } catch (err) {
    console.error('History fetch error:', err);
    list.innerHTML = `<div style="text-align:center;padding:24px;color:var(--red);font-size:13px">Error loading project history.</div>`;
  }
}

// ─── PASSWORD ────────────────────────────────────────────
window.togglePw = (id, btn) => {
  const inp    = document.getElementById(id);
  const isText = inp.type === 'text';
  inp.type = isText ? 'password' : 'text';
  btn.querySelector('svg').innerHTML = isText
    ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
};

window.checkStrength = (val) => {
  const fill  = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if(!fill || !label) return;
  if (!val) { fill.style.width = '0%'; label.textContent = ''; return; }
  let score = 0;
  if (val.length >= 8)         score++;
  if (val.length >= 12)        score++;
  if (/[A-Z]/.test(val))       score++;
  if (/[0-9]/.test(val))       score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { w:'20%',  c:'#dc2626', t:'Very Weak'   },
    { w:'40%',  c:'#f59e0b', t:'Weak'        },
    { w:'60%',  c:'#eab308', t:'Fair'        },
    { w:'80%',  c:'#22c55e', t:'Strong'      },
    { w:'100%', c:'#10b981', t:'Very Strong' },
  ];
  const lvl = levels[Math.min(score - 1, 4)] || levels[0];
  fill.style.width = lvl.w; fill.style.background = lvl.c;
  label.textContent = lvl.t; label.style.color = lvl.c;
};

window.checkMatch = () => {
  const np  = document.getElementById('newPass').value;
  const cp  = document.getElementById('confirmPass').value;
  const msg = document.getElementById('matchMsg');
  if(!msg) return;
  if (!cp) { msg.textContent = ''; return; }
  if (np === cp) { msg.textContent = '✓ Passwords match';      msg.style.color = '#10b981'; }
  else           { msg.textContent = '✗ Passwords do not match'; msg.style.color = '#dc2626'; }
};

window.updatePassword = async () => {
  if (!currentUser) return;
  const curr = document.getElementById('currentPass').value;
  const np   = document.getElementById('newPass').value;
  const cp   = document.getElementById('confirmPass').value;

  if (!curr)        { showToast('Enter your current password', 'error'); return; }
  if (np.length < 8){ showToast('Password must be at least 8 characters', 'error'); return; }
  if (np !== cp)    { showToast('Passwords do not match', 'error'); return; }

  const btn = document.getElementById('btnUpdatePw');
  btn.innerHTML = '<div class="spinner"></div> Updating...'; btn.disabled = true;

  try {
    const cred = EmailAuthProvider.credential(currentUser?.email, curr);
    await reauthenticateWithCredential(currentUser, cred);
    await fbUpdatePassword(currentUser, np);
    ['currentPass','newPass','confirmPass'].forEach(id => {
        const input = document.getElementById(id);
        if(input) input.value = '';
    });
    const sFill = document.getElementById('strengthFill');
    const sLabel = document.getElementById('strengthLabel');
    const mMsg = document.getElementById('matchMsg');
    if(sFill) sFill.style.width = '0%';
    if(sLabel) sLabel.textContent = '';
    if(mMsg) mMsg.textContent = '';
    showToast('✓ Password updated successfully', 'success');
  } catch (e) {
    const code = e.code;
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password')
      showToast('Current password is incorrect', 'error');
    else if (code === 'auth/requires-recent-login')
      showToast('Please log out and sign back in first', 'error');
    else
      showToast('Error: ' + e.message, 'error');
  } finally {
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Update Password';
    btn.disabled = false;
  }
};

// ─── 2FA (Demo Logic) ─────────────────────────────────────────────────
window.open2FA = () => {
  if (profileData.twoFactorEnabled) {
    if (confirm('Disable two-factor authentication?')) disable2FA();
    return;
  }
  twoFAStep(1);
  openModal('twoFAModal');
};

function twoFAStep(step) {
  ['s1','s2','s3'].forEach((id, i) => {
      const el = document.getElementById(id);
      if(el) el.classList.toggle('done', i < step);
  });
  const content = document.getElementById('twoFAContent');
  const btns    = document.getElementById('twoFABtns');
  if(!content || !btns) return;

  if (step === 1) {
    content.innerHTML = `
      <h3 style="margin-bottom:6px">Enter Phone Number</h3>
      <p style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:18px">We'll send a 6-digit verification code to this number.</p>
      <div class="field">
        <label class="field-label">Mobile Number</label>
        <div class="phone-wrap">
          <select class="country-select" id="countryCode">
            <option value="+63">🇵🇭 +63</option>
            <option value="+1">🇺🇸 +1</option>
          </select>
          <input type="tel" id="phoneInput" class="field-input" placeholder="9XX XXX XXXX" style="flex:1">
        </div>
      </div>`;
    btns.innerHTML = `
      <button class="modal-btn cancel" onclick="closeModal('twoFAModal')">Cancel</button>
      <button class="modal-btn confirm-indigo" onclick="send2FAOTP()">Send Code</button>`;
  } else if (step === 2) {
      // step 2 logic...
  }
}

// ─── SESSIONS (Demo Logic) ────────────────────────────────────────────
function renderSessions() {
  const sessions = [
      { id:'current', device: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser', type:'desktop', loc:'Current Session · Davao De Oro, PH', current:true  }
  ];
  const list = document.getElementById('sessionsList');
  if(!list) return;
  list.innerHTML = sessions.map(sess => `
      <div class="session-item">
        <div class="session-device-icon" style="background:var(--indigo-light)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        </div>
        <div class="session-info">
          <div class="session-name">${sess.device}</div>
          <div class="session-meta">${sess.loc}</div>
        </div>
        ${sess.current ? '<span class="badge badge-active">Active</span>' : ''}
      </div>
  `).join('');
}

// ─── NETWORK ─────────────────────────────────────────────
window.fetchIP = async () => {
    const ipAddrEl = document.getElementById('ipAddr');
    if(!ipAddrEl) return;
    try {
        const r = await fetch('https://api.ipify.org?format=json');
        const d = await r.json();
        ipAddrEl.textContent = d.ip;
        const ipDot = document.getElementById('ipDot');
        if(ipDot) {
            ipDot.style.background = '#10b981';
            ipDot.style.boxShadow = '0 0 0 3px rgba(16,185,129,.2)';
        }
        const vpnText = document.getElementById('vpnText');
        if(vpnText) vpnText.textContent = 'No VPN Detected';
    } catch (err) {
        ipAddrEl.textContent = 'Unable to detect';
    }
};

window.copyIP = () => {
    const ip = document.getElementById('ipAddr')?.textContent;
    if (ip && ip !== 'Detecting...') {
        navigator.clipboard.writeText(ip).then(() => showToast('✓ IP copied', 'success'));
    }
};

// ─── PRIVACY ─────────────────────────────────────────────
window.saveVisibility = async () => {
  const val = document.getElementById('visSelect').value;
  try {
    await updateDoc(doc(db, 'UserAccounts', currentUser.uid), { visibility: val });
    showToast('✓ Privacy updated', 'success');
  } catch {}
};

window.saveToggle = async (key, val) => {
  try {
    await updateDoc(doc(db, 'UserAccounts', currentUser.uid), { [key]: val });
    showToast(val ? '✓ Notifications enabled' : '✓ Notifications disabled', 'success');
  } catch {}
};

// ─── DELETE ACCOUNT ──────────────────────────────────────
const deleteConfirm = document.getElementById('deleteConfirm');
if(deleteConfirm) {
  deleteConfirm.addEventListener('click', async () => {
    const pass = document.getElementById('deletePass').value;
    if (!pass) { showToast('Enter your password', 'error'); return; }
    try {
      const cred = EmailAuthProvider.credential(currentUser?.email, pass);
      await reauthenticateWithCredential(currentUser, cred);
      // Delete user profile data
      await deleteDoc(doc(db, 'UserAccounts', currentUser.uid));
      // Delete auth user
      await deleteUser(currentUser);
      window.location.href = '../login.php';
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
  });
}

// ─── UTILITIES ───────────────────────────────────────────
window.openModal  = (id) => document.getElementById(id).classList.add('show');
window.closeModal = (id) => document.getElementById(id).classList.remove('show');

function renderPrivacy() {}
function render2FA() {}

let toastTimer;
window.showToast = (msg, type = 'success') => {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.className   = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3500);
};

window.downloadData = () => {
  const data = { ...profileData, exportedAt: new Date().toISOString() };
  const uri  = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const a    = document.createElement('a');
  a.href = uri; a.download = `jairo_profile_${Date.now()}.json`;
  a.click();
};
