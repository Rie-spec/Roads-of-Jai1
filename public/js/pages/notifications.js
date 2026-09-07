import { db } from '../firebase-config.js';
import { 
    collection, 
    onSnapshot, 
    orderBy, 
    query, 
    limit, 
    doc, 
    updateDoc, 
    writeBatch, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── Self-contained logic using centralized db ────────────────────────────────
const _db = db;

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICONS = {
    create: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    edit:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    delete: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    info:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function timeAgo(ts) {
    if (!ts) return 'just now';
    const ms = ts.toMillis ? ts.toMillis() : (ts.seconds ? ts.seconds * 1000 : ts);
    const seconds = Math.floor((Date.now() - ms) / 1000);
    if (seconds < 60)    return 'just now';
    if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function renderItem(n) {
    const iconClass  = `notif-icon-${n.type || 'info'}`;
    const icon       = ICONS[n.type] || ICONS.info;
    const unreadClass = n.read ? '' : 'is-unread';
    return `
        <div class="notif-item ${unreadClass}" data-id="${n.id}">
            <div class="notif-item-icon ${iconClass}">${icon}</div>
            <div class="notif-item-body">
                <p class="notif-item-title">${n.title || 'System Action'}</p>
                <p class="notif-item-msg">${n.message || ''}</p>
                <span class="notif-item-time">${timeAgo(n.createdAt)}</span>
            </div>
        </div>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Call once per page after DOMContentLoaded.
 * The `db` parameter is accepted for backward compatibility but ignored —
 * the module uses its own guaranteed Firestore instance.
 */
export function initNotifications(_ignoredDb) {
    const panel      = document.getElementById('notifPanel');
    const backdrop   = document.getElementById('notifBackdrop');
    const list       = document.getElementById('notifList');
    const empty      = document.getElementById('notifEmpty');
    const markAllBtn = document.getElementById('markAllReadBtn');
    const bellBtns   = document.querySelectorAll('.btn-notification');

    if (!panel || bellBtns.length === 0) {
        console.warn('initNotifications: missing #notifPanel or .btn-notification buttons');
        return;
    }

    // Badge logic for each button
    bellBtns.forEach(btn => {
        let badge = btn.querySelector('.notif-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notif-badge is-hidden';
            btn.appendChild(badge);
        }
        btn.style.position = 'relative';

        // Listeners for each button
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = panel.classList.contains('is-open');
            
            if (!isOpen) {
                const rect = btn.getBoundingClientRect();
                panel.style.top   = (rect.bottom + 14) + 'px';
                panel.style.right = (window.innerWidth - rect.right) + 'px';
                panel.style.left  = 'auto';
            }
            
            panel.classList.toggle('is-open', !isOpen);
            backdrop?.classList.toggle('is-open', !isOpen);
        });
    });

    const updateBadges = (count) => {
        bellBtns.forEach(btn => {
            const badge = btn.querySelector('.notif-badge');
            if (badge) {
                badge.textContent = count > 9 ? '9+' : String(count);
                badge.classList.toggle('is-hidden', count === 0);
            }
        });
    };

    backdrop?.addEventListener('click', () => {
        panel.classList.remove('is-open');
        backdrop.classList.remove('is-open');
    });

    window.addEventListener('resize', () => {
        if (panel.classList.contains('is-open')) {
            // Re-position based on the first visible button if possible
            const visibleBtn = Array.from(bellBtns).find(b => b.offsetWidth > 0);
            if (visibleBtn) {
                const rect = visibleBtn.getBoundingClientRect();
                panel.style.top   = (rect.bottom + 14) + 'px';
                panel.style.right = (window.innerWidth - rect.right) + 'px';
            }
        }
    });

    // Firestore listener
    let latestDocs = [];
    const q = query(collection(_db, 'Notifications'), orderBy('createdAt', 'desc'), limit(40));

    onSnapshot(q, (snapshot) => {
        latestDocs = snapshot.docs;
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const unreadCount = items.filter(n => !n.read).length;

        // Badges
        updateBadges(unreadCount);

        // Mark-all button state
        if (markAllBtn) {
            markAllBtn.disabled          = unreadCount === 0;
            markAllBtn.style.opacity     = unreadCount === 0 ? '0.4' : '1';
            markAllBtn.style.cursor      = unreadCount === 0 ? 'not-allowed' : 'pointer';
        }

        // Render list
        if (!list) return;
        if (items.length === 0) {
            list.innerHTML = '';
            if (empty) list.appendChild(empty);
        } else {
            if (empty && empty.parentNode) empty.remove();
            list.innerHTML = items.map(renderItem).join('');
        }
    }, (err) => {
        console.error('Notifications listener error:', err);
    });

    // Mark all read
    markAllBtn?.addEventListener('click', async () => {
        const unread = latestDocs.filter(d => !d.data().read);
        if (!unread.length) return;
        markAllBtn.textContent = 'Marking...';
        markAllBtn.disabled    = true;
        try {
            const batch = writeBatch(_db);
            unread.forEach(d => batch.update(doc(_db, 'Notifications', d.id), { read: true }));
            await batch.commit();
        } catch (err) {
            console.error('Mark all read failed:', err);
        } finally {
            markAllBtn.textContent = 'MARK ALL READ';
        }
    });

    // Mark single as read on click
    list.addEventListener('click', async (e) => {
        const item = e.target.closest('.notif-item.is-unread');
        if (!item) return;
        const id = item.dataset.id;
        if (id) {
            item.classList.remove('is-unread');
            try {
                await updateDoc(doc(_db, 'Notifications', id), { read: true });
            } catch (err) {
                console.error('Mark read failed:', err);
            }
        }
    });
}

/**
 * Log a notification to Firestore.
 * The `db` parameter is accepted for backward compatibility but ignored.
 */
export async function logNotification(_ignoredDb, { type = 'info', entity = '', title, message }) {
    try {
        await addDoc(collection(_db, 'Notifications'), {
            type,
            entity,
            title,
            message,
            read:      false,
            createdAt: serverTimestamp(),
            createdBy: 'Admin'
        });
    } catch (err) {
        console.warn('Failed to log notification:', err);
    }
}