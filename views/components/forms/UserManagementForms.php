<?php
/**
 * views/components/forms/UserManagementForms.php
 * Create Account Form Modal for JAIROADS
 */
?>

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>

<div id="createAccountModal" class="modal-overlay" style="display: none;">
    <div class="modal-card">
        <div class="flex justify-between items-start mb-8">
            <div>
                <div class="text-xs font-extrabold text-[#78350F] tracking-widest uppercase mb-1">JAIROADS</div>
                <h2 class="text-3xl font-black text-slate-900 leading-tight tracking-tight">Create Engineer Account</h2>
                <p class="text-slate-400 text-sm font-medium mt-2">
                    Fill in the details below. Your email will be auto-formatted as <span class="text-amber-900 font-bold">username@engineer.ph</span>
                </p>
            </div>
            <button type="button" class="text-slate-400 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition-colors" onclick="closeCreateModal()">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>

        <form id="createAccountForm" class="space-y-6">
            <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input type="text" name="fullName" placeholder="e.g. Gavriel Santos" required 
                       class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 focus:border-amber-300 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400">
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Username / Email</label>
                <div class="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 focus-within:border-amber-300 focus-within:bg-white transition-colors">
                    <input type="text" name="username" id="username" placeholder="gavriel" required 
                           class="bg-transparent border-none outline-none text-sm font-medium text-slate-700 flex-1 placeholder:text-slate-400">
                    <span class="text-amber-900 font-bold text-sm ml-2">@engineer.ph</span>
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Position</label>
                <div class="grid grid-cols-2 gap-4">
                    <div class="role-option active" data-role="Engineer" onclick="setAccountRole('Engineer')">
                        <div class="font-bold text-sm role-title">Engineer</div>
                        <div class="text-[11px] text-slate-400 font-medium mt-0.5 leading-tight">Technical & Field Operations</div>
                    </div>
                    <div class="role-option" data-role="Admin" onclick="setAccountRole('Admin')">
                        <div class="font-bold text-sm role-title">Admin</div>
                        <div class="text-[11px] text-slate-400 font-medium mt-0.5 leading-tight">System & Administrative Access</div>
                    </div>
                    <input type="hidden" name="position" id="roleInput" value="Engineer">
                </div>
            </div>

            <div id="engineerFieldsSection" class="space-y-6" style="display: block;">
                <div class="flex flex-col gap-2">
                    <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rank</label>
                    <select name="rank" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 focus:border-amber-300 focus:bg-white focus:outline-none transition-colors appearance-none custom-select-icon cursor-pointer">
                        <option value="Engineer I">Engineer I</option>
                        <option value="Engineer II">Engineer II</option>
                        <option value="Engineer III" selected>Engineer III</option>
                        <option value="Engineer IV">Engineer IV</option>
                    </select>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Municipality Assigned</label>
                    <select name="municipality" id="formMunicipalityCreate" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 focus:border-amber-300 focus:bg-white focus:outline-none transition-colors appearance-none custom-select-icon cursor-pointer">
                        <option value="">Select Municipality</option>
                    </select>
                </div>
            </div>

            <div class="pt-2 border-t border-slate-100 space-y-6">
                <div class="flex flex-col gap-2">
                    <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    <input type="password" name="password" id="acctPassword" placeholder="Min. 8 characters" required 
                           class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 focus:border-amber-300 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400">
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                    <div id="confirmPassWrapper" class="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 focus-within:border-amber-300 focus-within:bg-white transition-all duration-300">
                        <input type="password" name="confirmPassword" id="acctConfirmPassword" placeholder="Re-enter password" required 
                               class="bg-transparent border-none outline-none text-sm font-medium text-slate-700 flex-1 placeholder:text-slate-400">
                        <div id="matchSuccessIcon" class="hidden text-emerald-500">
                            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <p id="passwordNote" class="text-[10px] text-slate-400 font-bold ml-1 tracking-widest uppercase transition-colors duration-300">Match the password</p>
                </div>
            </div>

            <div class="pt-6">
                <button type="submit" class="w-full bg-[#78350F] text-white font-black py-4 rounded-xl shadow-lg shadow-amber-900/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                    Submit Entry
                </button>
            </div>
        </form>
    </div>
</div>

<style>
/* ==========================================================================
   Modal Component Styles
   ========================================================================== */

/* Overlay Background */
.modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background-color: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

/* Card Container */
.modal-card {
    background-color: #ffffff;
    width: 100%;
    max-width: 540px; 
    border-radius: 24px; 
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    position: relative;
    transform: translateY(10px);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    max-height: 90vh; 
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2.5rem; /* Standardized 40px padding */
}

.modal-overlay.active .modal-card {
    transform: translateY(0);
}

/* Soft Scrollbar Integration */
.modal-card::-webkit-scrollbar { width: 6px; }
.modal-card::-webkit-scrollbar-track { background: transparent; margin: 20px 0; }
.modal-card::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
.modal-card::-webkit-scrollbar-thumb:hover { background-color: #cbd5e1; }

/* Custom Select Dropdown Arrow */
.custom-select-icon {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
}

/* Role Selection Cards */
.role-option {
    padding: 1rem;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #f8fafc;
}

.role-option:hover {
    border-color: #fde68a;
    background: #fffbeb;
}

.role-option.active {
    border: 2px solid #fbbf24;
    background: #fffbeb;
    padding: calc(1rem - 1px); /* Prevents layout jump when border thickens */
}

.role-option.active .role-title { color: #78350f; }

/* ==========================================================================
   Password Match Animations
   ========================================================================== */

/* The satisfying 'pop' for the checkmark icon */
@keyframes popIn {
    0% { transform: scale(0.5) rotate(-15deg); opacity: 0; }
    60% { transform: scale(1.2) rotate(10deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* A soft outward glow for the input box */
@keyframes borderPulse {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.animate-pop-in {
    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.animate-border-pulse {
    animation: borderPulse 0.6s ease-out forwards;
}

/* Dynamic Password Match States */
.pass-match-border {
    border-color: #10b981 !important; 
    background-color: #ecfdf5 !important;
}

.pass-match-text { color: #059669 !important; }
</style>

<script>
/**
 * UI Interaction Controller
 */
function setAccountRole(role) {
    document.getElementById('roleInput').value = role;
    const engFields = document.getElementById('engineerFieldsSection');
    
    if (role === 'Admin') {
        engFields.style.display = 'none';
    } else {
        engFields.style.display = 'block';
    }

    document.querySelectorAll('.role-option').forEach(opt => {
        if (opt.dataset.role === role) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function closeCreateModal() {
    const modal = document.getElementById('createAccountModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Password Match Validation & Animation Logic
document.getElementById('acctConfirmPassword').addEventListener('input', function() {
    const p1 = document.getElementById('acctPassword').value;
    const p2 = this.value;
    const wrapper = document.getElementById('confirmPassWrapper');
    const note = document.getElementById('passwordNote');
    const icon = document.getElementById('matchSuccessIcon');

    if (p1 && p1 === p2) {
        // Only trigger if it wasn't already matching to prevent spamming the animation
        if (!wrapper.classList.contains('pass-match-border')) {
            wrapper.classList.add('pass-match-border', 'animate-border-pulse');
            note.classList.add('pass-match-text');
            note.innerText = 'Passwords Match!';
            
            // Show and animate the checkmark icon
            icon.style.display = 'block';
            
            // Force browser repaint to restart the animation if re-triggered quickly
            icon.classList.remove('animate-pop-in');
            void icon.offsetWidth; 
            icon.classList.add('animate-pop-in');
        }
    } else {
        // Remove styling and hide icon if they don't match
        wrapper.classList.remove('pass-match-border', 'animate-border-pulse');
        note.classList.remove('pass-match-text');
        note.innerText = 'Match the password';
        icon.style.display = 'none';
        icon.classList.remove('animate-pop-in');
    }
});

// Initialize Icons (Required if rendering dynamically in a SPA)
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}
</script>