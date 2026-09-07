import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * navigation.js
 * Modular version.
 */
(function () {
    'use strict';

    function getAppRoot() {
        const pathParts = window.location.pathname.split('/');
        const viewsIndex = pathParts.findIndex(p => p.toLowerCase() === 'views');
        return viewsIndex >= 0 ? pathParts.slice(0, viewsIndex).join('/') : '';
    }
    const LOGIN_PATH = `${getAppRoot()}/views/login.php`;

    // ── Auth guard + profile populate ──────────────────────────────────────
    onAuthStateChanged(auth, async (user) => {
        // Populate sidebar profile
        if (user) {
            try {
                const accountSnap = await getDoc(doc(db, 'UserAccounts', user.uid));
                if (!accountSnap.exists()) return;

                const accountData = accountSnap.data();
                const engineerId  = accountData.engineerId;
                const role        = accountData.role || 'Engineer';

                let fullName = auth.currentUser.displayName || accountData.username || 'User';

                if (engineerId) {
                    const engSnap = await getDoc(doc(db, 'Engineers', engineerId));
                    if (engSnap.exists()) {
                        fullName = engSnap.data().firstName + ' ' + (engSnap.data().lastName || '');
                    }
                }

                const initials = fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);

                const nameEl   = document.getElementById('sidebarName');
                const roleEl   = document.getElementById('sidebarRole');
                const avatarEl = document.getElementById('sidebarAvatar');

                if (nameEl)   nameEl.textContent   = fullName;
                if (roleEl)   roleEl.textContent   = role;
                if (avatarEl) avatarEl.textContent = initials;

            } catch (err) {
                console.warn('navigation.js: Could not fetch profile.', err);
            }
        }
    });

    // ── Logout handler ──────────────────────────────────────────────────────
    function wireLogout() {
        const btn = document.getElementById('logoutBtn');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            const labelEl = btn.querySelector('.nav-label');
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor  = 'not-allowed';
            if (labelEl) labelEl.textContent = 'Signing out...';

            try {
                sessionStorage.removeItem('sidebar-was-hovered');
                await signOut(auth);
            } catch (err) {
                console.error('Sign-out failed.', err);
            } finally {
                window.location.replace(LOGIN_PATH);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireLogout);
    } else {
        wireLogout();
    }

})();
