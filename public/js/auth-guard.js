import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/** Helpers for pathing */
function getAppRoot() {
  const pathParts = window.location.pathname.split('/');
  const viewsIndex = pathParts.findIndex(p => p.toLowerCase() === 'views');
  return viewsIndex >= 0 ? pathParts.slice(0, viewsIndex).join('/') : '';
}

/**
 * Wait for Firebase Auth to initialize and return the current user.
 */
export function waitForAuthUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Get current user profile from UserAccounts collection.
 */
export async function getCurrentProfile() {
  const user = await waitForAuthUser();

  if (!user) {
    return null;
  }

  const snap = await getDoc(doc(db, "UserAccounts", user.uid));

  return {
    user,
    profile: snap.exists() ? snap.data() : null
  };
}

/**
 * Require a logged-in user. Redirects to login if not authenticated.
 */
export async function requireLogin(redirectTo = null) {
  if (!redirectTo) {
      redirectTo = `${getAppRoot()}/views/login.php`;
  }
  const user = await waitForAuthUser();

  if (!user) {
    window.location.href = redirectTo;
    throw new Error("No authenticated user");
  }

  let snap = await getDoc(doc(db, "UserAccounts", user.uid));
  let profile = null;
  if (snap.exists()) {
    profile = snap.data();
  } else {
    // Fallback to Engineers
    let engSnap = await getDoc(doc(db, "Engineers", user.uid));
    if (engSnap.exists()) {
      profile = engSnap.data();
    } else {
      profile = { email: user.email, username: user.email?.split('@')[0] };
    }
  }

  // Final Reveal to prevent blank screen if the page uses requireLogin instead of requireRole
  document.body.classList.remove('auth-protected');
  document.body.classList.add('auth-ready');

  return { user, profile };
}

/**
 * Require a specific role or one of multiple roles.
 * @param {string|string[]} allowedRoles - e.g., 'Admin', ['Admin', 'Engineer']
 */
export async function requireRole(allowedRoles) {
  const user = await waitForAuthUser();

  if (!user) {
    window.location.href = `${getAppRoot()}/views/login.php`;
    throw new Error("No authenticated user");
  }

  let snap = await getDoc(doc(db, "UserAccounts", user.uid));
  let profile = null;
  let role = "engineer";

  if (!snap.exists()) {
    console.warn("User profile not found in UserAccounts. Fallback to Engineers collection.");
    const engSnap = await getDoc(doc(db, "Engineers", user.uid));
    if (engSnap.exists()) {
      profile = engSnap.data();
      role = "engineer"; // Default to engineer
    } else {
      console.warn("User profile not found in both UserAccounts and Engineers. Granting fallback engineer role.");
      profile = { email: user.email, username: user.email?.split('@')[0] };
      role = "engineer";
    }
  } else {
    profile = snap.data();
    role = (profile.role || "").toLowerCase();
  }

  const rolesArray = Array.isArray(allowedRoles) 
    ? allowedRoles.map(r => r.toLowerCase()) 
    : [allowedRoles.toLowerCase()];

  if (!rolesArray.includes(role)) {
    // Cross-role protection
    if (role === "admin" || role === "administrator") {
      window.location.href = `${getAppRoot()}/views/Admin/AdminDashboard.php`;
    } else if (role === "engineer") {
      window.location.href = `${getAppRoot()}/views/Engineer/dashboard.php`;
    } else {
      window.location.href = `${getAppRoot()}/views/login.php`;
    }
    throw new Error("Unauthorized role");
  }

  // Final Reveal
  document.body.classList.remove('auth-protected');
  document.body.classList.add('auth-ready');

  return { user, profile };
}

/**
 * Standard logout function.
 */
export async function logoutAndGoHome() {
  await signOut(auth);
  window.location.href = `${getAppRoot()}/views/login.php`;
}
