

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAIROADS — Sign In</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
    <style>
       /* ── Reset & Tokens ───────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --amber:   #FBBF24;
            --brown:   #78350F;
            --dark-br: #3d1a03;
            --ink:     #0f172a;
            --muted:   #64748b;
            --border:  #e2e8f0;
            --surface: #f8fafc;
            --red:     #ef4444;
            --white:   #ffffff;
        }

        html, body {
            height: 100%;
            font-family: 'DM Sans', sans-serif;
            background: var(--ink);
            overflow: hidden;
        }

        /* ── Layout ───────────────────────────────────────────────────────── */
        .root {
            display: grid;
            grid-template-columns: 420px 1fr;
            height: 100vh;
        }

        /* ── LEFT PANEL ───────────────────────────────────────────────────── */
        .left {
            background: var(--white);
            display: flex;
            flex-direction: column;
            padding: 48px 52px;
            position: relative;
            z-index: 10;
            box-shadow: 4px 0 40px rgba(0,0,0,0.12);
            overflow-y: auto;
        }

        /* Brand */
        .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: auto;
            padding-bottom: 48px;
        }

        .brand-mark {
            width: 36px; height: 36px;
            background: linear-gradient(135deg, var(--amber), var(--brown));
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
        }

        .brand-mark svg { width: 20px; height: 20px; }

        .brand-name {
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.12em;
            color: var(--ink);
            text-transform: uppercase;
        }

        /* Form area */
        .form-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .eyebrow {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: var(--amber);
            margin-bottom: 12px;
        }

        .form-area h1 {
            font-family: 'DM Serif Display', serif;
            font-size: 2.6rem;
            line-height: 1.1;
            color: var(--ink);
            margin-bottom: 8px;
        }

        .subtitle {
            font-size: 14px;
            color: var(--muted);
            margin-bottom: 44px;
            line-height: 1.6;
        }

        /* Fields */
        .field { margin-bottom: 20px; }

        .field label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #374151;
            margin-bottom: 8px;
        }

        .input-wrap {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
        }

        .input-wrap .prefix-icon {
            position: absolute;
            left: 14px;
            width: 16px; height: 16px;
            color: #9ca3af;
            pointer-events: none;
            z-index: 2;
        }

        .input-wrap input {
            display: block;
            width: 100%;
            padding: 13px 44px 13px 42px;
            border: 1.5px solid var(--border);
            border-radius: 10px;
            font-size: 14px;
            font-family: 'DM Sans', sans-serif;
            color: var(--ink);
            background: var(--surface);
            transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .input-wrap input:focus {
            outline: none;
            border-color: var(--amber);
            background: var(--white);
            box-shadow: 0 0 0 3px rgba(251,191,36,0.15);
        }

        .input-wrap input.error-input {
            border-color: var(--red);
            box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        /* Toggle password */
        .toggle-pw {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none; border: none;
            padding: 4px;
            cursor: pointer; color: #9ca3af;
            display: flex; align-items: center;
            justify-content: center;
            transition: color 0.2s;
            z-index: 3;
        }
        .toggle-pw:hover { color: var(--amber); }
        .toggle-pw svg { width: 18px; height: 18px; pointer-events: none; }

        /* Error message */
        .error-msg {
            margin-top: 8px;
            font-size: 12px;
            color: var(--red);
            font-weight: 600;
            display: none;
            align-items: center;
            gap: 5px;
        }
        .error-msg.show { display: flex; }
        .error-msg svg { width: 13px; height: 13px; flex-shrink: 0; }

        /* Options row */
        .options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
        }

        .remember {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--muted);
            cursor: pointer;
            user-select: none;
        }

        .remember input[type="checkbox"] {
            width: 15px; height: 15px;
            accent-color: var(--brown);
            cursor: pointer;
        }

        .forgot {
            font-size: 13px;
            font-weight: 600;
            color: var(--brown);
            text-decoration: none;
            transition: color 0.2s;
        }
        .forgot:hover { color: var(--amber); }

        /* Submit button */
        .btn-submit {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, var(--brown), var(--dark-br));
            color: var(--white);
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            font-family: 'DM Sans', sans-serif;
            letter-spacing: 0.04em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
            box-shadow: 0 8px 24px -4px rgba(120,53,15,0.35);
            position: relative;
            overflow: hidden;
        }

        .btn-submit:hover:not(:disabled) {
            opacity: 0.92;
            transform: translateY(-1px);
            box-shadow: 0 12px 28px -4px rgba(120,53,15,0.45);
        }

        .btn-submit:active:not(:disabled) {
            transform: translateY(0);
        }

        .btn-submit:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        /* Loading spinner */
        .spinner {
            width: 18px; height: 18px;
            border: 2px solid rgba(255,255,255,0.35);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
            display: none;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .btn-submit.loading .spinner  { display: block; }
        .btn-submit.loading .btn-text { display: none; }
        .btn-submit.loading .btn-icon { display: none; }

        /* Auth error banner */
        .auth-error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #dc2626;
            font-weight: 600;
            display: none;
            align-items: center;
            gap: 10px;
        }
        .auth-error.show { display: flex; }
        .auth-error svg { width: 16px; height: 16px; flex-shrink: 0; }

        /* Footer note */
        .left-footer {
            margin-top: auto;
            padding-top: 40px;
            text-align: center;
            font-size: 12px;
            color: var(--muted);
        }

        .left-footer a {
            color: var(--brown);
            font-weight: 700;
            text-decoration: none;
        }

        /* ── RIGHT PANEL ──────────────────────────────────────────────────── */
        .right {
            position: relative;
            overflow: hidden;
            background: var(--ink);
        }

        /* All design panels share this base */
        .panel {
            position: absolute;
            inset: 0;
            display: none;
            align-items: center;
        }

        .panel.active { display: flex; }

        /* Panel content */
        .panel-content {
            position: relative;
            z-index: 5;
            padding: 80px;
            color: var(--white);
            max-width: 640px;
        }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: rgba(255,255,255,0.7);
            background: rgba(255,255,255,0.05);
            margin-bottom: 28px;
        }

        .tag-dot {
            width: 6px; height: 6px;
            border-radius: 50%;
            background: var(--amber);
            animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
        }

        .panel-title {
            font-family: 'DM Serif Display', serif;
            font-size: clamp(2.8rem, 4.5vw, 4.2rem);
            line-height: 1.08;
            margin-bottom: 20px;
        }

        .panel-sub {
            font-size: 15px;
            line-height: 1.7;
            color: rgba(255,255,255,0.55);
            max-width: 440px;
        }

        /* ── PANEL 1: Stats ───────────────────────────────────────────────── */
        .p1-bg {
            background: radial-gradient(ellipse at 80% 20%, #3d2311 0%, var(--ink) 65%);
        }

        /* Decorative amber arc */
        .p1-arc {
            position: absolute;
            top: -120px; right: -120px;
            width: 600px; height: 600px;
            border: 1px solid rgba(251,191,36,0.12);
            border-radius: 50%;
            pointer-events: none;
        }
        .p1-arc::before {
            content: '';
            position: absolute;
            inset: 60px;
            border: 1px solid rgba(251,191,36,0.08);
            border-radius: 50%;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            margin-top: 44px;
        }

        .stat-card {
            padding: 20px 22px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            backdrop-filter: blur(12px);
            transition: background 0.2s, border-color 0.2s;
        }

        .stat-card:hover {
            background: rgba(255,255,255,0.07);
            border-color: rgba(251,191,36,0.25);
        }

        .stat-val {
            font-family: 'DM Serif Display', serif;
            font-size: 26px;
            color: var(--white);
            display: block;
            margin-bottom: 4px;
        }

        .stat-lab {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.4);
        }

        /* ── PANEL 2: Blueprint ───────────────────────────────────────────── */
        .p2-bg {
            background: #0f1729;
            background-image:
                linear-gradient(rgba(30,41,59,0.6) 1px, transparent 1px),
                linear-gradient(90deg, rgba(30,41,59,0.6) 1px, transparent 1px);
            background-size: 40px 40px;
        }

        .p2-road {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
        }

        .p2-road::before,
        .p2-road::after {
            content: '';
            position: absolute;
            left: -20%;
            width: 140%;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent);
        }

        .p2-road::before { top: 38%; transform: rotate(-12deg); }
        .p2-road::after  { top: 62%; transform: rotate(-12deg); }

        .steps {
            display: flex;
            gap: 48px;
            margin-top: 48px;
        }

        .step-num {
            font-family: 'DM Serif Display', serif;
            font-size: 48px;
            font-style: italic;
            color: #38bdf8;
            line-height: 1;
            margin-bottom: 8px;
        }

        .step-lab {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: rgba(255,255,255,0.5);
        }

        /* ── PANEL 3: Dashboard Preview ───────────────────────────────────── */
        .p3-bg {
            background: linear-gradient(135deg, #1a1208 0%, #0f172a 100%);
        }

        .glass-ui {
            position: absolute;
            right: -80px;
            bottom: -40px;
            width: 620px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 20px;
            padding: 24px;
            transform: perspective(1200px) rotateY(-18deg) rotateX(6deg);
            box-shadow: 0 60px 120px rgba(0,0,0,0.6);
            backdrop-filter: blur(20px);
            pointer-events: none;
        }

        .glass-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .glass-title-bar {
            width: 110px; height: 9px;
            background: rgba(255,255,255,0.15);
            border-radius: 5px;
        }

        .glass-btn-mock {
            width: 70px; height: 26px;
            background: linear-gradient(135deg, var(--amber), var(--brown));
            border-radius: 7px;
            opacity: 0.85;
        }

        .mock-row {
            display: flex; align-items: center;
            gap: 14px; padding: 11px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .mock-row:last-child { border-bottom: none; }

        .mock-cell {
            height: 9px;
            background: rgba(255,255,255,0.08);
            border-radius: 4px;
            flex-shrink: 0;
        }

        .mock-badge {
            height: 20px;
            border-radius: 999px;
            flex-shrink: 0;
        }

        /* ── Switcher ─────────────────────────────────────────────────────── */
        .switcher {
            position: absolute;
            bottom: 28px;
            right: 28px;
            display: flex;
            gap: 4px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            padding: 5px;
            border-radius: 999px;
            backdrop-filter: blur(12px);
            z-index: 20;
        }

        .sw-btn {
            padding: 7px 18px;
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.55);
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            font-family: 'DM Sans', sans-serif;
            letter-spacing: 0.06em;
            cursor: pointer;
            transition: all 0.25s;
        }

        .sw-btn.active {
            background: var(--white);
            color: var(--ink);
        }

        /* ── Toast ────────────────────────────────────────────────────────── */
        .toast {
            position: fixed;
            top: 24px; left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background: var(--ink);
            color: var(--white);
            padding: 12px 24px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            display: flex; align-items: center; gap: 8px;
            border: 1px solid rgba(255,255,255,0.08);
        }

        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        .toast.success { background: #166534; border-color: #22c55e; }
        .toast.error   { background: #7f1d1d; border-color: var(--red); }

        /* ── Responsive ───────────────────────────────────────────────────── */
        @media (max-width: 900px) {
            .root { grid-template-columns: 1fr; }
            .right { display: none; }
            .left { padding: 40px 32px; }
        }
    </style>
</head>
<body>

<div class="root">

    <!-- ══ LEFT: LOGIN FORM ══════════════════════════════════════════════════ -->
    <div class="left">
        <div class="brand">
            <div class="brand-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
            </div>
            <span class="brand-name">JAIROADS</span>
        </div>

        <div class="form-area">
            <h1>Welcome <em>back.</em></h1>
            <p class="subtitle">Sign in to access your console and manage road maintenance projects across the Central Cluster.</p>

            <!-- Auth Error Banner -->
            <div class="auth-error" id="authError">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span id="authErrorText">Invalid credentials. Please try again.</span>
            </div>

            <form id="loginForm" novalidate>
                <!-- Username / Email -->
                <div class="field">
                    <label for="emailInput">Username or Email</label>
                    <div class="input-wrap">
                        <svg class="prefix-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <input type="text" id="emailInput" placeholder="username or email@engineer.ph" autocomplete="username">
                    </div>
                    <div class="error-msg" id="emailError">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>Please enter your username or email.</span>
                    </div>
                </div>

                <!-- Password -->
                <div class="field">
                    <label for="passwordInput">Password</label>
                    <div class="input-wrap">
                        <svg class="prefix-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <input type="password" id="passwordInput" placeholder="••••••••" autocomplete="current-password">
                        <button type="button" class="toggle-pw" id="togglePw" aria-label="Toggle password visibility">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                    <div class="error-msg" id="passwordError">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>Please enter your password.</span>
                    </div>
                </div>

                <div class="options">
                    <label class="remember">
                        <input type="checkbox" id="rememberMe"> Remember me
                    </label>
                    <a href="#" class="forgot">Forgot password?</a>
                </div>

                <button type="submit" class="btn-submit" id="submitBtn">
                    <div class="spinner"></div>
                    <span class="btn-text">Sign In</span>
                    <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                </button>
            </form>
        </div>

    </div>

    <!-- ══ RIGHT: PANELS ═════════════════════════════════════════════════════ -->
    <div class="right">

        <!-- Panel 1: Stats -->
        <div class="panel p1-bg active" id="p1">
            <div class="p1-arc"></div>
            <div class="panel-content">
                <h2 class="panel-title"><span>JaiRoads:</span>Road Maintenance Project<br>Monitoring & Archiving System</h2>
                <p class="panel-sub">A comprehensive road maintenance tracking and archiving system designed for precision and efficiency in infrastructure growth.</p>
                <div class="stats-grid">
                    <div class="stat-card"><span class="stat-val">1,284 KM</span><span class="stat-lab">Roads Monitored</span></div>
                    <div class="stat-card"><span class="stat-val">42</span><span class="stat-lab">Active Projects</span></div>
                    <div class="stat-card"><span class="stat-val">98%</span><span class="stat-lab">Compliance Rate</span></div>
                    <div class="stat-card"><span class="stat-val">Central</span><span class="stat-lab">Cluster Node</span></div>
                </div>
            </div>
        </div>

        <!-- Panel 2: Blueprint -->
        <div class="panel p2-bg" id="p2">
            <div class="p2-road"></div>
            <div class="panel-content">
                <div class="tag"><span class="tag-dot"></span> System Architecture</div>
                <h2 class="panel-title">Engineering<br>The Future</h2>
                <p class="panel-sub">Data-driven insights for road maintenance. Archive, track, and optimize every kilometer of progress within the Central Cluster.</p>
                <div class="steps">
                    <div>
                        <div class="step-num">01.</div>
                        <div class="step-lab">Track</div>
                    </div>
                    <div>
                        <div class="step-num">02.</div>
                        <div class="step-lab">Archive</div>
                    </div>
                    <div>
                        <div class="step-num">03.</div>
                        <div class="step-lab">Optimize</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Panel 3: Dashboard preview -->
        <div class="panel p3-bg" id="p3">
            <div class="panel-content">
                <div class="tag"><span class="tag-dot"></span> Platform Preview</div>
                <h2 class="panel-title">Modern<br>Workflow</h2>
                <p class="panel-sub">Manage engineers, municipalities, and project ranks through an intuitive interface built for high-performance teams.</p>
            </div>
            <div class="glass-ui">
                <div class="glass-header">
                    <div class="glass-title-bar"></div>
                    <div class="glass-btn-mock"></div>
                </div>
                <div class="mock-row">
                    <div class="mock-cell" style="width:32%"></div>
                    <div class="mock-cell" style="width:18%"></div>
                    <div class="mock-cell" style="width:22%"></div>
                    <div class="mock-badge" style="width:52px;background:rgba(251,191,36,0.25);"></div>
                </div>
                <div class="mock-row">
                    <div class="mock-cell" style="width:24%"></div>
                    <div class="mock-cell" style="width:15%"></div>
                    <div class="mock-cell" style="width:28%"></div>
                    <div class="mock-badge" style="width:52px;background:rgba(34,197,94,0.2);"></div>
                </div>
                <div class="mock-row">
                    <div class="mock-cell" style="width:38%"></div>
                    <div class="mock-cell" style="width:12%"></div>
                    <div class="mock-cell" style="width:20%"></div>
                    <div class="mock-badge" style="width:52px;background:rgba(239,68,68,0.2);"></div>
                </div>
                <div class="mock-row">
                    <div class="mock-cell" style="width:20%"></div>
                    <div class="mock-cell" style="width:30%"></div>
                    <div class="mock-cell" style="width:16%"></div>
                    <div class="mock-badge" style="width:52px;background:rgba(251,191,36,0.25);"></div>
                </div>
                <div class="mock-row">
                    <div class="mock-cell" style="width:28%"></div>
                    <div class="mock-cell" style="width:14%"></div>
                    <div class="mock-cell" style="width:24%"></div>
                    <div class="mock-badge" style="width:52px;background:rgba(34,197,94,0.2);"></div>
                </div>
            </div>
        </div>

        <!-- Switcher (Hidden to preserve layout anchor) -->
        <div class="switcher" style="visibility: hidden; pointer-events: none;">
            <button class="sw-btn active" data-target="p1">Stats View</button>
            <button class="sw-btn" data-target="p2">Blueprint</button>
            <button class="sw-btn" data-target="p3">Dashboard</button>
        </div>
    </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<!-- Firebase (Modular version used in config/guard) -->
<script type="module">
    import { auth, db } from "../public/js/firebase-config.js";
    import { setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
    import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    // ── Persist session if "Remember me" was checked ─────────────────────────────
    const persisted = localStorage.getItem('jairoads_remember');
    setPersistence(auth, persisted === 'true' ? browserLocalPersistence : browserSessionPersistence);

    // ── Redirect already-authenticated users ─────────────────────────────────────
    let redirectHandled = false;

    onAuthStateChanged(auth, async (user) => {
        if (!user || redirectHandled) return;
        redirectHandled = true;

        try {
            const accountDoc = await getDoc(doc(db, 'UserAccounts', user.uid));
            if (accountDoc.exists()) {
                const role = accountDoc.data().role || 'Engineer';
                redirectByRole(role);
            }
        } catch (err) {
            console.warn('Redirect check failed:', err);
        }
    });

    // ── Panel switcher ────────────────────────────────────────────────────────────
    document.querySelectorAll('.sw-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.sw-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(btn.dataset.target).classList.add('active');
            btn.classList.add('active');
        });
    });

    // ── Password toggle ───────────────────────────────────────────────────────────
    const pwInput  = document.getElementById('passwordInput');
    const togglePw = document.getElementById('togglePw');

    if (togglePw && pwInput) {
        togglePw.addEventListener('click', () => {
            const isText = pwInput.type === 'text';
            pwInput.type = isText ? 'password' : 'text';
            
            // Toggle icons - logic: if it's bullets (password), show regular eye. If it's text, show slashed eye.
            const isVisible = pwInput.type === 'text';
            togglePw.innerHTML = isVisible
                ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                   </svg>`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                   </svg>`;
        });
    }

    // ── Toast helper ──────────────────────────────────────────────────────────────
    function showToast(msg, type = '') {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.className   = `toast ${type} show`;
        setTimeout(() => t.classList.remove('show'), 3500);
    }

    // ── Form validation helpers ───────────────────────────────────────────────────
    function setError(inputId, errorId, show) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        input.classList.toggle('error-input', show);
        error.classList.toggle('show', show);
    }

    function clearErrors() {
        setError('emailInput',    'emailError',    false);
        setError('passwordInput', 'passwordError', false);
        document.getElementById('authError').classList.remove('show');
    }

    // ── Role-based redirect ───────────────────────────────────────────────────────
    function redirectByRole(role) {
        const r = (role || 'Engineer').toLowerCase();
        if (r === 'admin' || r === 'administrator') {
            window.location.replace('Admin/AdminDashboard.php');
        } else {
            window.location.replace('Engineer/dashboard.php');
        }
    }

    // ── Map Firebase Auth error codes to friendly messages ───────────────────────
    function friendlyError(code) {
        const map = {
            'auth/user-not-found':       'No account found with this email.',
            'auth/wrong-password':       'Incorrect password. Please try again.',
            'auth/invalid-email':        'Please enter a valid email address.',
            'auth/user-disabled':        'This account has been disabled.',
            'auth/too-many-requests':    'Too many attempts. Please wait a moment and try again.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/invalid-credential':   'Invalid credentials. Please try again.',
            'auth/invalid-login-credentials': 'Invalid credentials. Please try again.'
        };
        return map[code] || 'Sign in failed. Please check your credentials.';
    }

    // ── Form submission ───────────────────────────────────────────────────────────
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const rawInput = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value;
        const remember = document.getElementById('rememberMe').checked;

        // Client-side validation
        let valid = true;
        if (!rawInput) { setError('emailInput', 'emailError', true); valid = false; }
        if (!password) { setError('passwordInput', 'passwordError', true); valid = false; }
        if (!valid) return;

        // Auto-append domain if user typed just a username
        const email = rawInput.includes('@') ? rawInput : `${rawInput}@engineer.ph`;

        // Persist preference
        localStorage.setItem('jairoads_remember', remember);
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

        // Loading state
        const btn = document.getElementById('submitBtn');
        btn.classList.add('loading');
        btn.disabled = true;

        // Prevent onAuthStateChanged from stealing the redirect so we can show the toast
        redirectHandled = true;

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const uid  = cred.user.uid;

            // Fetch role from Firestore
            let role = 'Engineer';
            try {
                const accountDoc = await getDoc(doc(db, 'UserAccounts', uid));
                if (accountDoc.exists()) {
                    role = accountDoc.data().role || 'Engineer';
                }
            } catch (err) {
                console.warn('Could not fetch role, defaulting to Engineer:', err);
            }

            showToast('Signed in successfully!', 'success');

            // Small delay so toast is visible before redirect
            setTimeout(() => redirectByRole(role), 800);

        } catch (err) {
            btn.classList.remove('loading');
            btn.disabled = false;

            console.error("Login Error:", err);
            const errEl = document.getElementById('authError');
            
            // Fix: prioritize friendlyError over the raw technical message
            const message = friendlyError(err.code) || err.message;
            document.getElementById('authErrorText').textContent = message;
            errEl.classList.add('show');

            // Shake the form
            const form = document.getElementById('loginForm');
            form.style.animation = 'none';
            void form.offsetWidth;
            form.style.animation = 'shake 0.4s ease';
        }
    });

    // ── Shake keyframes (injected dynamically) ────────────────────────────────────
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%  { transform: translateX(-6px); }
            40%  { transform: translateX(6px); }
            60%  { transform: translateX(-4px); }
            80%  { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    // ── Clear auth error when user starts typing ──────────────────────────────────
    ['emailInput', 'passwordInput'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            document.getElementById('authError').classList.remove('show');
        });
    });
</script>

</body>
</html>