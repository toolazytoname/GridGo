# Design CSS Reference

**Source**: UI/app.html (v1.4.0, 2026-06) — 缓存于 /tmp/gridgo-design.html

**原则**: 这是 1:1 还原 GridGo UI 的真值源。任何 gg-* 样式以这里为标准。

```css

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:oklch(99% 0.002 240);--surface:oklch(100% 0 0);--surface-warm:oklch(98% 0.003 240);
      --fg:oklch(18% 0.012 250);--fg-2:oklch(28% 0.012 250);--muted:oklch(54% 0.012 250);--meta:oklch(72% 0.008 250);
      --border:oklch(92% 0.005 250);--border-soft:oklch(95% 0.004 250);
      --accent:oklch(58% 0.18 255);--accent-hover:oklch(52% 0.19 255);--accent-active:oklch(46% 0.20 255);
      --success:oklch(70% 0.16 145);--warning:oklch(70% 0.16 45);--danger:oklch(65% 0.20 25);
      --font-display:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;
      --font-body:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;
      --font-mono:'SF Mono',ui-monospace,'JetBrains Mono',Menlo,Monaco,Consolas,monospace;
      --space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:20px;--space-6:24px;--space-8:32px;--space-12:48px;
      --radius-sm:8px;--radius-md:12px;--radius-lg:18px;--radius-pill:980px;
      --ease-standard:cubic-bezier(0.28,0,0.22,1);
    }
    html{height:100%}
    body{font-family:var(--font-body);background:var(--bg);color:var(--fg);min-height:100%;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}

    /* ── Topbar ── */
    .topbar{height:52px;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:10px;position:sticky;top:0;z-index:50}
    .topbar-logo{display:inline-flex;align-items:center;gap:7px;text-decoration:none;color:var(--fg);line-height:1}
    .topbar-mark{width:26px;height:26px;color:var(--fg);flex-shrink:0}
    .topbar-wordmark{display:inline-flex;align-items:baseline;gap:4px;font-family:var(--font-display);font-size:15px;font-weight:600;letter-spacing:-0.02em;white-space:nowrap}
    .topbar-wordmark b{font-weight:600;color:var(--fg)}
    .topbar-wordmark i{font-style:normal;color:var(--accent);font-weight:500;font-size:13px;transform:translateY(-1px)}
    .topbar-wordmark em{font-style:normal;font-weight:500;color:var(--meta);letter-spacing:-0.005em}
    .okr-selector{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;background:var(--bg);border:1px solid var(--border);font-size:13px;font-weight:500;color:var(--fg);cursor:pointer;transition:all .15s}
    .okr-selector:hover{border-color:var(--muted)}
    .okr-selector svg{width:14px;height:14px;color:var(--muted)}
    .topbar-spacer{flex:1}
    .topbar-avatar{width:30px;height:30px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:600;cursor:pointer}
    .topbar-btn{width:30px;height:30px;border-radius:8px;background:transparent;border:none;display:grid;place-items:center;cursor:pointer;color:var(--muted);transition:all .15s}
    .topbar-btn:hover{background:var(--bg);color:var(--fg)}
    .topbar-btn svg{width:16px;height:16px}

    /* ── Content area ── */
    .view-content{flex:1;padding-bottom:80px}

    /* ── Bottom Tab Nav ── */
    .tab-bar{height:64px;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--border);display:flex;position:fixed;bottom:0;left:0;right:0;z-index:50;padding-bottom:env(safe-area-inset-bottom)}
    .tab-item{display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;color:var(--muted);transition:all .15s;position:relative}
    .tab-item svg{width:22px;height:22px;flex-shrink:0}
    .tab-item span{font-size:10px;font-weight:500;letter-spacing:.02em}
    .tab-item.active{color:var(--accent)}
    .tab-item.active::before{content:'';position:absolute;top:-1px;left:50%;transform:translateX(-50%);width:32px;height:2.5px;background:var(--accent);border-radius:0 0 2px 2px}

    /* ── Panel ── */
    .panel{display:none;padding:var(--space-5) var(--space-5) var(--space-6)}
    .panel.active{display:block}

    /* ── Matrix ── */
    .matrix-header{display:flex;justify-content:space-between;align-items:baseline;margin:8px 0 18px;gap:14px;flex-wrap:wrap}
    .matrix-header h2{font-family:var(--font-display);font-size:20px;font-weight:600;letter-spacing:-0.025em;color:var(--fg);margin:0}
    .matrix-header-date{font-family:var(--font-display);font-size:13px;font-weight:500;color:var(--meta);letter-spacing:-0.005em;margin-left:4px}
    .matrix-header-summary{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
    .matrix-header-summary b{color:var(--fg);font-weight:600}
    .matrix-focus-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:14px;display:flex;flex-direction:column;gap:8px}
    .matrix-focus-head{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--accent);letter-spacing:.04em;text-transform:uppercase}
    .matrix-focus-icon{width:14px;height:14px;color:var(--accent)}
    .matrix-focus-body{font-size:12.5px;color:var(--muted);line-height:1.65}
    .matrix-focus-body b{color:var(--fg);font-weight:600}
    .eisenhower-grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;min-height:480px}
    .eq-cell{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;display:flex;flex-direction:column;overflow:hidden}
    .eq-cell.q1{border-top:2.5px solid var(--accent)}
    .eq-cell.q2{border-top:2.5px solid var(--success)}
    .eq-cell.q3{border-top:2.5px solid var(--warning)}
    .eq-cell.q4{border-top:2.5px solid var(--muted)}
    .eq-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
    .eq-label{font-size:10.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-2)}
    .eq-count{font-size:10.5px;font-weight:600;color:var(--meta);background:var(--bg);border:1px solid var(--border-soft);padding:1px 7px;border-radius:999px;font-variant-numeric:tabular-nums}
    .eq-tasks{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:5px}
    .eq-task{display:flex;align-items:flex-start;gap:8px;padding:8px 9px;border-radius:8px;background:var(--bg);cursor:pointer;transition:background-color 220ms var(--ease-standard),transform 180ms cubic-bezier(0.34,1.56,0.64,1)}
    .eq-task:hover{background:oklch(96% 0.005 240)}
    .eq-task:active{transform:scale(0.985);transition-duration:80ms}
    .eq-task-check{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0;margin-top:1px;cursor:pointer;display:grid;place-items:center;transition:background-color 220ms var(--ease-standard),border-color 220ms var(--ease-standard),transform 180ms cubic-bezier(0.34,1.56,0.64,1)}
    .eq-task-check:hover{border-color:var(--muted)}
    .eq-task-check:active{transform:scale(0.88);transition-duration:80ms}
    .eq-task-check.done{background:var(--success);border-color:var(--success)}
    .eq-task-check.done::after{content:'';width:6px;height:6px;background:#fff;border-radius:50%}
    .eq-task-title{font-size:13px;font-weight:500;color:var(--fg);line-height:1.4}
    .eq-task-title.done{text-decoration:line-through;color:var(--muted)}
    .eq-task-okr{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:500;color:var(--accent);background:oklch(94% 0.008 255);padding:2px 6px;border-radius:4px;margin-top:3px}
    .eq-task-meta{font-size:11px;color:var(--muted);margin-top:2px}
    .eq-add{margin-top:6px;padding:6px 10px;border-radius:7px;border:1px dashed var(--border);font-size:12px;color:var(--muted);cursor:pointer;text-align:center;transition:border-color 220ms var(--ease-standard),color 220ms var(--ease-standard),background-color 220ms var(--ease-standard)}
    .eq-add:hover{border-color:var(--accent);color:var(--accent);background:oklch(96% 0.008 255)}

    /* ── List ── */
    .list-header{display:flex;justify-content:space-between;align-items:center;margin:6px 0 20px;flex-wrap:wrap;gap:8px}
    .list-header h2{font-family:var(--font-display);font-size:18px;font-weight:600;letter-spacing:-0.02em}
    .list-filters{display:flex;gap:6px;flex-wrap:wrap}
    .filter-pill{padding:4px 12px;border-radius:999px;font-size:12px;font-weight:500;border:1px solid var(--border);background:var(--surface);color:var(--muted);cursor:pointer;transition:all .15s}
    .filter-pill.active{background:var(--accent);color:#fff;border-color:var(--accent)}
    .okr-tree{display:flex;flex-direction:column;gap:8px}
    .okr-item{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .okr-header{display:flex;align-items:center;gap:10px;padding:13px 16px;cursor:pointer;user-select:none}
    .okr-expand{width:20px;height:20px;display:grid;place-items:center;color:var(--muted);flex-shrink:0;transition:transform .2s}
    .okr-expand.open{transform:rotate(90deg)}
    .okr-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
    .okr-title{flex:1;font-size:14px;font-weight:600;color:var(--fg)}
    .okr-progress-bar{width:72px;height:4px;background:var(--border);border-radius:2px;overflow:hidden;flex-shrink:0}
    .okr-progress-fill{height:100%;background:var(--accent);border-radius:2px;transition:width .3s}
    .okr-progress-label{font-size:11px;font-weight:500;color:var(--muted);min-width:30px;text-align:right;font-variant-numeric:tabular-nums}
    .okr-body{display:none;padding:0 16px 8px}
    .okr-body.open{display:block}

    /* Tree: KR level */
    .tree-children{padding-left:20px;border-left:1.5px solid var(--border);margin-left:22px}
    .tree-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);cursor:pointer;transition:background-color 220ms var(--ease-standard),transform 180ms cubic-bezier(0.34,1.56,0.64,1);border-radius:4px;margin:0 -6px;padding-left:6px;padding-right:6px}
    .tree-row:hover{background:oklch(96% 0.005 240)}
    .tree-row:active{transform:scale(0.99);transition-duration:80ms}
    .tree-row:last-child{border-bottom:none}
    .tree-expand{width:18px;height:18px;display:grid;place-items:center;color:var(--muted);flex-shrink:0;transition:transform .2s}
    .tree-expand.open{transform:rotate(90deg)}
    .tree-check{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0;cursor:pointer;display:grid;place-items:center;transition:background-color 220ms var(--ease-standard),border-color 220ms var(--ease-standard),transform 180ms cubic-bezier(0.34,1.56,0.64,1)}
    .tree-check:hover{border-color:var(--muted)}
    .tree-check:active{transform:scale(0.88);transition-duration:80ms}
    .tree-check.done{background:var(--success);border-color:var(--success)}
    .tree-check.done::after{content:'';width:5px;height:5px;background:#fff;border-radius:50%}
    .tree-label{flex:1;font-size:13px;color:var(--fg)}
    .tree-label.done{text-decoration:line-through;color:var(--muted)}
    .tree-meta{display:flex;gap:5px;align-items:center;flex-shrink:0}
    .tree-tag{font-size:10px;font-weight:500;padding:2px 6px;border-radius:4px}
    .tree-tag.q1{background:oklch(94% 0.008 255);color:var(--accent)}
    .tree-tag.q2{background:oklch(94% 0.008 145);color:var(--success)}
    .tree-tag.q3{background:oklch(94% 0.008 45);color:var(--warning)}
    .tree-date{font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}

    /* Tree: sub-task level */
    .sub-children{display:none;padding-left:18px;border-left:1.5px solid oklch(88% 0.005 240);margin-left:21px}
    .sub-children.open{display:block}
    .sub-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid oklch(94% 0.003 240);cursor:pointer;transition:background-color 220ms var(--ease-standard),transform 180ms cubic-bezier(0.34,1.56,0.64,1);border-radius:4px;margin:0 -4px;padding-left:4px;padding-right:4px}
    .sub-row:hover{background:oklch(96% 0.005 240)}
    .sub-row:active{transform:scale(0.99);transition-duration:80ms}
    .sub-row:last-child{border-bottom:none}
    .sub-dot{width:6px;height:6px;border-radius:50%;background:var(--border);flex-shrink:0}
    .sub-check{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0;cursor:pointer;display:grid;place-items:center;transition:background-color 220ms var(--ease-standard),border-color 220ms var(--ease-standard),transform 180ms cubic-bezier(0.34,1.56,0.64,1)}
    .sub-check:hover{border-color:var(--muted)}
    .sub-check:active{transform:scale(0.85);transition-duration:80ms}
    .sub-check.done{background:var(--success);border-color:var(--success)}
    .sub-check.done::after{content:'';width:4px;height:4px;background:#fff;border-radius:50%}
    .sub-label{flex:1;font-size:12px;color:var(--fg)}
    .sub-label.done{text-decoration:line-through;color:var(--muted)}
    .sub-meta{font-size:10px;color:var(--muted)}

    /* ── Gantt ── */
    .gantt-header{display:flex;justify-content:space-between;align-items:center;margin:6px 0 20px}
    .gantt-header h2{font-family:var(--font-display);font-size:18px;font-weight:600;letter-spacing:-0.02em}
    .btn-ghost{padding:5px 12px;border-radius:7px;font-size:12px;font-weight:500;color:var(--fg);background:transparent;border:1px solid var(--border);cursor:pointer;transition:all .15s;transition:transform 180ms cubic-bezier(0.34,1.56,0.64,1),background .15s,border-color .15s,color .15s}
    .btn-share{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;color:var(--accent);background:color-mix(in oklab,var(--accent) 10%,transparent);border:1px solid color-mix(in oklab,var(--accent) 22%,transparent);cursor:pointer;transition:all .15s;transition:transform 180ms cubic-bezier(0.34,1.56,0.64,1),background .15s,border-color .15s,color .15s;white-space:nowrap}
/* ── A11y: 全局焦点环（键盘用户可见） ── */
    :focus{outline:none}
    :focus-visible{outline:3px solid color-mix(in oklab,var(--accent) 60%,transparent);outline-offset:2px;border-radius:4px}
    button:focus-visible,a:focus-visible,[tabindex]:focus-visible{outline-offset:3px}
    .btn-ghost:focus-visible,.btn-share:focus-visible,.btn-primary:focus-visible{outline-offset:3px}
    .sub-tab:focus-visible{outline-color:var(--accent)}

    /* ── 按钮 :disabled 状态 ── */
    .btn-ghost:disabled,.btn-share:disabled,.btn-primary:disabled,.sub-tab:disabled{opacity:.5;cursor:not-allowed;pointer-events:none}

    /* ── Loading / Error / Empty 三态样式 ── */
    .state-block{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;text-align:center;color:var(--muted);gap:12px}
    .state-block-icon{width:48px;height:48px;color:var(--meta);opacity:.6}
    .state-block-title{font-size:14px;font-weight:600;color:var(--fg);margin:0}
    .state-block-desc{font-size:12px;color:var(--muted);max-width:320px;margin:0;line-height:1.5}
    .state-block-action{margin-top:8px}
    .skeleton{background:linear-gradient(90deg,var(--surface) 0%,var(--surface-warm) 50%,var(--surface) 100%);background-size:200% 100%;animation:skel 1.4s ease-in-out infinite;border-radius:6px;color:transparent}
    @keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}

    /* ── Reduced motion（必须遵守 WCAG 2.3.3） ── */
    
    /* ── Emil Kowalski: sub-view entry ── */
    .sub-view{display:none;width:100%}
    .panel.active .sub-view.active{animation:subIn 240ms cubic-bezier(0.16,1,0.3,1) both}
    @keyframes subIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

    /* ── Press spring: 按钮按下微回弹 ── */
    .btn-primary,.btn-ghost,.btn-share,.sub-tab{transition:transform 180ms cubic-bezier(0.34,1.56,0.64,1),background .15s,border-color .15s,color .15s}
    .btn-primary:active,.btn-ghost:active,.btn-share:active,.sub-tab:active{transform:scale(0.96);transition-duration:60ms}

    /* ── OKR 进度条加载动画 ── */
    /* ── Achievements ── */
    .ach-header{display:flex;justify-content:space-between;align-items:center;margin:6px 0 20px}
    .ach-header h2{font-family:var(--font-display);font-size:18px;font-weight:600;letter-spacing:-0.02em}
    .ach-section{margin-top:22px}
    .ach-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:13px;font-weight:600;color:var(--fg);letter-spacing:-0.01em}
    .ach-section-meta{font-size:11px;font-weight:500;color:var(--muted);letter-spacing:0}
    .ach-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
    .ach-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;transition:background-color 220ms var(--ease-standard),transform 180ms cubic-bezier(0.34,1.56,0.64,1),border-color 220ms var(--ease-standard);cursor:pointer}
    .ach-card:hover{background:var(--bg);border-color:var(--muted)}
    .ach-card:active{transform:scale(0.97);transition-duration:80ms}
    .ach-card-icon{display:flex;justify-content:center;align-items:center;height:24px;margin-bottom:6px}
    .ach-card-num{font-family:var(--font-display);font-size:22px;font-weight:700;letter-spacing:-0.03em;color:var(--fg)}
    .ach-card-label{font-size:11px;color:var(--muted);margin-top:4px}
    .ach-okr-list{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .ach-okr-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);transition:background-color 220ms var(--ease-standard),transform 180ms cubic-bezier(0.34,1.56,0.64,1);cursor:pointer}
    .ach-okr-item:hover{background:var(--bg)}
    .ach-okr-item:active{transform:scale(0.995);transition-duration:80ms}
    .ach-okr-item:last-child{border-bottom:none}
    .ach-okr-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
    .ach-okr-info{flex:1;min-width:0}
    .ach-okr-name{flex:1;font-size:13px;font-weight:500;color:var(--fg)}
    .ach-okr-bar{height:5px;background:var(--bg);border-radius:3px;overflow:hidden}
    .ach-okr-fill{height:100%;border-radius:3px;transition:width 600ms cubic-bezier(0.16,1,0.3,1)}
    .ach-okr-fill.o1{background:var(--accent)}
    .ach-okr-fill.o2{background:var(--success)}
    .ach-okr-fill.o3{background:var(--warning)}
    .ach-okr-fill.o4{background:var(--muted)}
    .ach-okr-pct{font-size:13px;font-weight:600;color:var(--success);font-variant-numeric:tabular-nums}

    /* ── 成就卡片入场（错落） ── */
    .ach-card{animation:cardIn 320ms cubic-bezier(0.16,1,0.3,1) both}
    .ach-card:nth-child(1){animation-delay:0ms}
    .ach-card:nth-child(2){animation-delay:40ms}
    .ach-card:nth-child(3){animation-delay:80ms}
    .ach-card:nth-child(4){animation-delay:120ms}
    @keyframes cardIn{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}

    /* ── 我的 Tab ── */
    .me-profile{display:flex;align-items:center;gap:18px;padding:20px 22px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent),white 86%),color-mix(in oklab,var(--accent),transparent 92%));border:1px solid var(--border);border-radius:18px;margin:6px 0 16px}
    .me-avatar{width:64px;height:64px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-family:var(--font-display);font-size:26px;font-weight:600;letter-spacing:.02em;box-shadow:0 6px 18px color-mix(in oklab,var(--accent),transparent 70%);flex-shrink:0}
    .me-id{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
    .me-name-row{display:flex;align-items:center;gap:8px}
    .me-name{font-family:var(--font-display);font-size:20px;font-weight:600;letter-spacing:-0.02em;color:var(--fg)}
    .me-badge{font-size:10px;font-weight:700;letter-spacing:.06em;padding:2px 6px;border-radius:5px;background:color-mix(in oklab,var(--warn) 70%,white);color:color-mix(in oklab,var(--warn) 60%,#3a2400);line-height:1.3}
    .me-role{font-size:12px;color:var(--fg-2);font-weight:500}
    .me-bio{font-size:12px;color:var(--muted);line-height:1.45;margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .me-edit{flex-shrink:0;align-self:flex-start;background:var(--bg);border:1px solid var(--border);color:var(--fg);font-size:12px;font-weight:500;padding:7px 12px;border-radius:8px;cursor:pointer;font-family:inherit}
    .me-edit:hover{background:var(--surface);border-color:var(--muted)}
    .me-edit:active{transform:scale(0.97)}

    /* 数据条 */
    .me-stats{display:flex;align-items:stretch;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 4px;margin-bottom:16px}
    .me-stat{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0}
    .me-stat-num{font-family:var(--font-display);font-size:22px;font-weight:700;letter-spacing:-0.03em;color:var(--fg);font-variant-numeric:tabular-nums;line-height:1.1}
    .me-stat-label{font-size:11px;color:var(--muted);font-weight:500}
    .me-stat-sep{width:1px;background:var(--border);margin:4px 0}

    /* 快捷入口 */
    .me-quick{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px}
    .me-quick-card{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg);border:1px solid var(--border);border-radius:14px;cursor:pointer;font-family:inherit;text-align:left;transition:background .15s,border-color .15s}
    .me-quick-card:hover{background:var(--surface);border-color:var(--muted)}
    .me-quick-card:active{transform:scale(0.99)}
    .me-quick-icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;color:var(--accent);background:color-mix(in oklab,var(--accent),transparent 88%)}
    .me-quick-icon.okr{color:var(--accent)}
    .me-quick-icon.share{color:var(--success);background:color-mix(in oklab,var(--success),transparent 88%)}
    .me-quick-icon svg{width:18px;height:18px}
    .me-quick-text{flex:1;min-width:0}
    .me-quick-title{font-size:13px;font-weight:600;color:var(--fg);line-height:1.3}
    .me-quick-sub{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.3}
    .me-chevron{width:14px;height:14px;color:var(--meta);flex-shrink:0}

    /* 设置分组 */
    .me-section-title{font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;padding:0 6px;margin:8px 0 8px}
    .me-list{background:var(--bg);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:18px}
    .me-row{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid var(--border-soft);cursor:pointer;transition:background .15s}
    .me-row:last-child{border-bottom:none}
    .me-row:hover{background:var(--surface)}
    .me-row:active{background:var(--surface)}
    .me-row-icon{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;flex-shrink:0;color:var(--accent);background:color-mix(in oklab,var(--accent),transparent 90%)}
    .me-row-icon svg{width:16px;height:16px}
    .me-row-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
    .me-row-title{font-size:13.5px;font-weight:500;color:var(--fg);line-height:1.3}
    .me-row-sub{font-size:11.5px;color:var(--muted);line-height:1.3}
    .me-row-danger .me-row-icon{color:var(--danger);background:color-mix(in oklab,var(--danger),transparent 90%)}
    .me-row-danger .me-row-title{color:var(--danger)}

    /* 我的 tab 入场（错落） */
    .me-profile,.me-stats,.me-quick,.me-list{animation:cardIn 320ms cubic-bezier(0.16,1,0.3,1) both}
    .me-profile{animation-delay:0ms}
    .me-stats{animation-delay:40ms}
    .me-quick{animation-delay:80ms}
    .me-list{animation-delay:120ms}

    .me-footer{text-align:center;font-size:11px;color:var(--meta);padding:8px 0 4px;letter-spacing:.04em}

    @media (max-width:600px){
      .me-quick{grid-template-columns:1fr}
      .me-bio{display:none}
    }


    /* ── Empty state block ── */
    .state-block{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;text-align:center;color:var(--muted);gap:12px;min-height:240px}
    .state-block-icon{width:44px;height:44px;color:var(--meta);opacity:.5}
    .state-block-title{font-size:14px;font-weight:600;color:var(--fg);margin:0}
    .state-block-desc{font-size:12px;color:var(--muted);max-width:320px;margin:0;line-height:1.5}
    .state-block-action{margin-top:4px}

@media (prefers-reduced-motion:reduce){
      *,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}
      .skeleton{animation:none}
    }

    /* ── 平板/大屏：1024-1280 优化（避免拥挤） ── */
    @media (max-width:1024px) and (min-width:769px){
      .panel{padding:var(--space-4) var(--space-4) var(--space-5)}
      .eisenhower-grid{min-height:380px}
    }
    @media (max-width:1280px) and (min-width:1025px){
      .panel{padding:var(--space-5) var(--space-6) var(--space-6)}
    }
    @media (min-width:1600px){
      .panel{padding:28px 40px var(--space-8);max-width:1400px;margin:0 auto}
    }
    .btn-share:hover{background:color-mix(in oklab,var(--accent) 18%,transparent);border-color:color-mix(in oklab,var(--accent) 35%,transparent)}
    .btn-share:active{transform:scale(.97)}
    .btn-share svg{width:14px;height:14px;flex-shrink:0}
    .btn-ghost:hover{background:var(--surface)}
    /* ── OKR 类别图标（替代 emoji ） ── */
    .okr-dot{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;font-size:10px;font-weight:600;line-height:1;flex-shrink:0;box-shadow:0 1px 2px rgba(0,0,0,.1),inset 0 1px 0 rgba(255,255,255,.15)}
    .okr-dot.o1{background:var(--accent);color:#fff}
    .okr-dot.o2{background:var(--success);color:#fff}
    .okr-dot.o3{background:var(--warning);color:#fff}
    .okr-dot.o4{background:var(--muted);color:#fff}
    .okr-dot.t{background:var(--fg);color:#fff}
    .okr-dot.e{background:#0066cc;color:#fff}
    /* ── 分享目标 SVG 图标（替代 ） ── */
    .icon-share{width:20px;height:20px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.6px;stroke-linecap:round;stroke-linejoin:round}
    .icon-wechat{stroke:#07C160}
    .icon-moments{stroke:#1296DB}
    .icon-twitter{stroke:#1DA1F2}
    .icon-email{stroke:#4A5560}
    /* ── 成就/统计图标（替代奖杯） ── */
    .icon{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7px;stroke-linecap:round;stroke-linejoin:round;color:var(--muted)}
    .icon.accent{color:var(--accent)}
    /* ── Emoji 图标替代 .icon ── */
    .icon-emoji{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;font-size:18px;line-height:1;flex-shrink:0}

    /* ── Icon solid variant（实心色块，色差更强） ── */
    .icon-solid{width:18px;height:18px;fill:currentColor;color:var(--accent)}
    .icon-solid.btn-share-icon{color:var(--accent)}

    /* ── 升级 .btn-share 内 SVG：让图标更醒目 ── */
    .btn-share svg.icon{fill:currentColor;fill-opacity:0.15}
    .btn-share svg.icon path,.btn-share svg.icon rect,.btn-share svg.icon circle{stroke:currentColor}

    /* ── 成就卡图标（surface 背景上需要更重） ── */
    .ach-card-icon svg.icon{width:22px;height:22px}
    .ach-card-icon svg.icon path,.ach-card-icon svg.icon circle,.ach-card-icon svg.icon rect{fill:currentColor;fill-opacity:0.12;stroke:currentColor;stroke-width:1.6}

    .icon-trophy{stroke:#FFC107}
    .icon-medal{stroke:#EAB308}
    .icon-calendar{stroke:#4A5560}
    .icon-chart{stroke:#4A5560}
    .icon-fire{stroke:#FF9800}
    .icon-rocket{stroke:#EAB308}
    /* ── 图标容器（用于 OKR 标签和成就） ── */
    .okr-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:500;color:var(--fg);background:var(--surface)}
    .okr-badge .okr-dot{flex-shrink:0;margin-right:-1px}
    .gantt-section{margin-bottom:24px}
    .gantt-section-label{font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:12px}
    .gantt-months{display:grid;grid-template-columns:160px repeat(6,1fr);border-bottom:1px solid var(--border);padding-bottom:10px;margin-bottom:16px}
    .gantt-months span{font-size:10px;font-weight:500;color:var(--muted);text-align:center}
    .gantt-months span:first-child{text-align:left}
    .gantt-row{display:grid;grid-template-columns:160px repeat(6,1fr);align-items:center;margin-bottom:12px}
    .gantt-task-label{font-size:12px;font-weight:500;color:var(--fg);padding-left:4px;padding-right:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gantt-bar-container{position:relative;height:22px}
    .gantt-grid{position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr);pointer-events:none}
    .gantt-grid-col{border-left:1px solid var(--border);height:100%}
    .gantt-bar{position:absolute;height:18px;border-radius:6px;top:2px;display:flex;align-items:center;padding:0 8px;font-size:10px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gantt-bar.o1{background:var(--accent)}
    .gantt-bar.o2{background:var(--success)}
    .gantt-bar.o3{background:var(--warning)}
    .gantt-bar.o4{background:var(--meta);color:#fff}
    /* ── Gantt drag ── */
    .gantt-bar{cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;transition:box-shadow .12s var(--ease-standard)}
    .gantt-bar.dragging{opacity:.94;box-shadow:0 3px 12px rgba(0,0,0,.24);z-index:5;transition:none}
    .gantt-bar::before,.gantt-bar::after{content:'';position:absolute;top:0;bottom:0;width:5px;opacity:0;transition:opacity .12s}
    .gantt-bar::before{left:0;border-radius:6px 0 0 6px}
    .gantt-bar::after{right:0;border-radius:0 6px 6px 0}
    .gantt-bar:hover::before,.gantt-bar:hover::after{opacity:.4;background:rgba(255,255,255,.6)}
    .gantt-drag-tip{position:fixed;display:none;transform:translateX(-50%);background:var(--fg);color:var(--bg);font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;pointer-events:none;z-index:1000;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25)}
    .gantt-hint-row{font-size:11px;color:var(--muted);margin:-4px 0 12px;display:flex;align-items:center;gap:6px}

    /* ── Calendar ── */
    .cal-header{display:flex;justify-content:center;align-items:center;margin:6px 0 20px}
    .cal-header h2{font-family:var(--font-display);font-size:18px;font-weight:600;letter-spacing:-0.02em}
    .cal-nav{display:flex;gap:6px;align-items:center}
    .cal-nav-btn{width:30px;height:30px;border-radius:8px;background:var(--surface);border:1px solid var(--border);display:grid;place-items:center;cursor:pointer;color:var(--muted);transition:all .15s}
    .cal-nav-btn:hover{color:var(--fg)}
    .cal-month{font-size:14px;font-weight:600;color:var(--fg);min-width:130px;text-align:center}
    .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
    .cal-dow{font-size:10px;font-weight:600;color:var(--muted);text-align:center;padding:3px 0;letter-spacing:.04em}
    .cal-day{border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:5px 3px;cursor:pointer;transition:all .15s;min-height:68px;overflow:hidden}
    .cal-day:hover{background:oklch(96% 0.005 240)}
    .cal-day.other-month{opacity:.25}
    .cal-day.today{background:oklch(94% 0.008 255)}
    .cal-day.today .cal-day-num{background:var(--accent);color:#fff}
    .cal-day-num{font-size:11px;font-weight:600;color:var(--fg);width:24px;height:24px;display:grid;place-items:center;border-radius:50%;flex-shrink:0;margin-bottom:3px}
    .cal-tasks{display:flex;flex-direction:column;gap:2px;width:100%;align-items:center}
    .cal-task-item{display:flex;align-items:center;gap:2px;width:100%;padding:2px 3px;border-radius:4px;background:var(--surface);border:1px solid var(--border);cursor:pointer;transition:all .12s}
    .cal-task-item:hover{background:var(--bg);border-color:var(--muted)}
    .cal-task-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
    .cal-task-dot.o1{background:var(--accent)}
    .cal-task-dot.o2{background:var(--success)}
    .cal-task-dot.o3{background:var(--warning)}
    .cal-task-title{font-size:9px;font-weight:500;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;line-height:1.3}
    .cal-task-more{font-size:9px;color:var(--muted);text-align:center;padding:1px 0}

    /* ── Modal ── */
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:none;place-items:center;z-index:200;backdrop-filter:blur(4px)}
    .modal-overlay.open{display:grid}
    .modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;width:min(480px,92vw);box-shadow:0 20px 60px rgba(0,0,0,.15)}
    .modal h3{font-family:var(--font-display);font-size:17px;font-weight:600;letter-spacing:-0.02em;margin-bottom:14px}
    .form-group{margin-bottom:12px}
    .form-label{display:block;font-size:11px;font-weight:600;color:var(--muted);margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase}
    .form-input{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:14px;font-family:var(--font-body);color:var(--fg);background:var(--bg);outline:none;transition:border-color .15s}
    .form-input:focus{border-color:var(--accent)}
    .form-select{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:14px;font-family:var(--font-body);color:var(--fg);background:var(--bg);outline:none;cursor:pointer}
    .modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}
    .btn-cancel{padding:8px 14px;border-radius:8px;font-size:13px;font-weight:500;background:transparent;border:1px solid var(--border);color:var(--muted);cursor:pointer;transition:all .15s}
    .btn-cancel:hover{color:var(--fg)}
    .btn-confirm{padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;background:var(--accent);color:#fff;border:none;cursor:pointer;transition:opacity .15s}
    .btn-confirm:hover{opacity:.88}

    /* ── OKR Manager Overlay ── */
    .okr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;place-items:center;z-index:270;backdrop-filter:blur(8px)}
    .okr-overlay.open{display:grid}
    .okr-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;width:min(680px,94vw);max-height:88vh;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.18);display:flex;flex-direction:column}
    .okr-list{flex:1;overflow-y:auto;padding:14px 24px}
    .okr-list-row{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:12px}
    .okr-list-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
    .okr-list-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
    .okr-list-name{flex:1;font-size:14px;font-weight:600;color:var(--fg)}
    .okr-list-actions{display:flex;gap:4px}
    .okr-act-btn{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--surface);cursor:pointer;display:grid;place-items:center;color:var(--muted);transition:all .12s}
    .okr-act-btn:hover{color:var(--fg);border-color:var(--muted)}
    .okr-act-btn.danger:hover{color:var(--danger);border-color:var(--danger)}
    .okr-progress-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
    .okr-progress-bar{flex:1;height:5px;background:var(--border);border-radius:3px;overflow:hidden}
    .okr-progress-fill{height:100%;border-radius:3px;background:var(--accent)}
    .okr-progress-label{font-size:11px;font-weight:600;color:var(--muted);min-width:30px;text-align:right}
    .okr-kr-list{margin-top:8px;padding-left:14px;border-left:2px solid var(--border)}
    .okr-kr-row{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12px;color:var(--fg)}
    .okr-kr-row .kr-check{width:13px;height:13px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0;cursor:pointer}
    .okr-kr-row .kr-check.done{background:var(--success);border-color:var(--success)}
    .okr-kr-row .kr-name{flex:1}
    .okr-kr-row .kr-name.done{text-decoration:line-through;color:var(--muted)}
    .okr-kr-row .kr-pct{font-size:10px;color:var(--muted);font-weight:600}
    .okr-kr-add{display:flex;align-items:center;gap:6px;margin-top:8px;padding-top:8px;border-top:1px dashed var(--border)}
    .okr-kr-input{flex:1;padding:5px 9px;border:1px solid var(--border);border-radius:6px;font-size:11px;background:var(--bg);color:var(--fg);outline:none}
    .okr-kr-input:focus{border-color:var(--accent)}
    .okr-add-form{background:var(--bg);border:1px dashed var(--border);border-radius:14px;padding:14px;margin-bottom:12px}
    .okr-add-row{display:flex;gap:8px;margin-bottom:8px}
    .okr-add-name{flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--surface);color:var(--fg);outline:none}
    .okr-add-name:focus{border-color:var(--accent)}

    /* ── OKR inline edit ── */
    .okr-list-name{cursor:text;padding:2px 6px;border-radius:5px;transition:background .12s;margin-left:-6px}
    .okr-list-name:hover{background:oklch(96% 0.005 240)}
    .okr-kr-row .kr-name{cursor:text;padding:2px 4px;border-radius:4px;transition:background .12s}
    .okr-kr-row .kr-name:hover{background:oklch(96% 0.005 240)}
    .okr-kr-row .kr-pct{cursor:text;padding:2px 4px;border-radius:4px;transition:background .12s;min-width:32px;text-align:right}
    .okr-kr-row .kr-pct:hover{background:oklch(96% 0.005 240);color:var(--fg-2)}
    .okr-inline-input{flex:1;border:1px solid var(--accent);border-radius:5px;padding:2px 6px;font:inherit;color:var(--fg);background:var(--bg);outline:none;min-width:0;font-weight:inherit}
    .okr-inline-input.pct{width:42px;flex:none;text-align:right;font-variant-numeric:tabular-nums;font-weight:600}

    /* ── OKR delete confirm (inline) ── */
    .okr-list-row.confirming{border-color:var(--danger);background:oklch(99% 0.005 25)}
    .okr-confirm{display:flex;align-items:center;gap:10px;padding:9px 11px;background:oklch(97% 0.010 25);border-radius:8px;margin-top:10px;font-size:12px;color:var(--fg)}
    .okr-confirm-text{flex:1;line-height:1.4}
    .okr-confirm-actions{display:flex;gap:6px;flex-shrink:0}
    .okr-confirm-btn{padding:4px 12px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid var(--border);background:var(--bg);color:var(--fg);transition:all .12s}
    .okr-confirm-btn:hover{border-color:var(--muted)}
    .okr-confirm-btn.danger{background:var(--danger);color:#fff;border-color:var(--danger)}
    .okr-confirm-btn.danger:hover{background:oklch(55% 0.20 25);border-color:oklch(55% 0.20 25)}
    .okr-add-color-pick{display:flex;gap:6px;margin-bottom:8px}
    .okr-color-dot{width:18px;height:18px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:transform .12s}
    .okr-color-dot:hover{transform:scale(1.15)}
    .okr-color-dot.sel{border-color:var(--fg)}

    /* Sub-task inline edit (in task edit mode) */
    .task-sub-edit{display:flex;align-items:center;gap:6px;padding:4px 0}
    .task-sub-edit-remove{width:18px;height:18px;border-radius:4px;border:none;background:transparent;color:var(--muted);cursor:pointer;font-size:14px;line-height:1}
    .task-sub-edit-remove:hover{color:var(--danger)}
    .task-sub-edit-input{flex:1;padding:5px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;background:var(--bg);color:var(--fg);outline:none}
    .task-sub-edit-input:focus{border-color:var(--accent)}
    .task-sub-add-row{display:flex;gap:6px;margin-top:6px}

    /* ── Task Detail / Edit Overlay ── */
    .task-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;place-items:center;z-index:280;backdrop-filter:blur(8px)}
    .task-overlay.open{display:grid}
    .task-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;width:min(560px,94vw);max-height:88vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,.18)}
    .task-head{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 24px 14px;border-bottom:1px solid var(--border)}
    .task-head-left{display:flex;align-items:center;gap:10px}
    .task-pill{font-size:10px;font-weight:600;padding:3px 8px;border-radius:999px}
    .task-pill.q1{background:oklch(94% 0.008 255);color:var(--accent)}
    .task-pill.q2{background:oklch(94% 0.008 145);color:var(--success)}
    .task-pill.q3{background:oklch(94% 0.008 45);color:var(--warning)}
    .task-pill.q4{background:var(--bg);color:var(--muted)}
    .task-status{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px}
    .task-status .dot{width:6px;height:6px;border-radius:50%;background:var(--muted)}
    .task-status.done .dot{background:var(--success)}
    .task-close{width:28px;height:28px;border-radius:8px;border:none;background:transparent;color:var(--muted);cursor:pointer;display:grid;place-items:center}
    .task-close:hover{background:var(--bg);color:var(--fg)}
    .task-body{padding:18px 24px}
    .task-title{font-family:var(--font-display);font-size:20px;font-weight:700;letter-spacing:-.02em;color:var(--fg);line-height:1.3;margin-bottom:10px}
    .task-title.done{text-decoration:line-through;color:var(--muted)}
    .task-meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
    .task-meta-row{display:flex;flex-direction:column;gap:3px}
    .task-meta-label{font-size:10px;font-weight:600;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
    .task-meta-val{font-size:13px;color:var(--fg);font-weight:500}
    .task-desc{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:13px;color:var(--fg);line-height:1.6;margin-bottom:14px}
    .task-desc-empty{color:var(--muted);font-style:italic}
    .task-children{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:14px}
    .task-children-head{font-size:10px;font-weight:600;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
    .task-children-count{background:var(--surface);padding:2px 7px;border-radius:999px;font-weight:500}
    .task-sub{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)}
    .task-sub:last-child{border-bottom:none}
    .task-sub-check{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0;cursor:pointer;display:grid;place-items:center}
    .task-sub-check.done{background:var(--success);border-color:var(--success)}
    .task-sub-check.done::after{content:'';width:5px;height:5px;background:#fff;border-radius:50%}
    .task-sub-text{font-size:12px;color:var(--fg);flex:1}
    .task-sub-text.done{text-decoration:line-through;color:var(--muted)}
    .task-sub-meta{font-size:10px;color:var(--muted)}
    .task-foot{display:flex;justify-content:space-between;align-items:center;padding:14px 24px;border-top:1px solid var(--border);gap:8px}
    .task-foot-left{display:flex;gap:6px}
    .task-foot-right{display:flex;gap:8px}
    .task-btn{padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--bg);color:var(--muted);transition:all .15s}
    .task-btn:hover{color:var(--fg);border-color:var(--muted)}
    .task-btn.primary{background:var(--accent);color:#fff;border-color:var(--accent)}
    .task-btn.primary:hover{background:var(--accent-hover);border-color:var(--accent-hover)}
    .task-btn.danger{color:var(--danger)}
    .task-btn.danger:hover{background:oklch(96% 0.008 30);border-color:var(--danger)}
    .task-form-field{margin-bottom:14px}
    .task-form-label{display:block;font-size:11px;font-weight:600;color:var(--muted);margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase}
    .task-form-input,.task-form-select,.task-form-textarea{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:10px;font-size:13px;font-family:var(--font-body);color:var(--fg);background:var(--bg);outline:none;transition:border-color .15s}
    .task-form-input:focus,.task-form-select:focus,.task-form-textarea:focus{border-color:var(--accent)}
    .task-form-textarea{resize:vertical;min-height:72px;line-height:1.5}
    .task-form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .task-form-quad{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px}
    .task-form-quad label{display:flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:11px;color:var(--fg);cursor:pointer;transition:all .15s}
    .task-form-quad label.on{border-color:var(--accent);background:oklch(96% 0.008 255);color:var(--accent);font-weight:600}
    .task-form-quad input{display:none}

    /* ── Responsive ── */
    /* Small mobile (≤360px) — iPhone SE 1st gen / compact */
    @media(max-width:360px){
      .topbar{padding:0 10px;gap:6px}
      .topbar-mark{width:22px;height:22px}
      .topbar-wordmark{font-size:13px;gap:3px}
      .topbar-wordmark i{font-size:11px}
      .panel{padding:10px 10px var(--space-5)}
      .eisenhower-grid{gap:6px;min-height:auto}
      .eq-cell{min-height:0;padding:8px}
      .eq-task-title{font-size:12px}
      .eq-task-meta,.eq-task-okr{font-size:10px}
      .eq-add{font-size:11px;padding:5px}
      .cal-grid{gap:2px}
      .cal-day{min-height:42px;padding:3px 2px;border-radius:7px}
      .cal-task-title{font-size:8px}
      .gantt-row{grid-template-columns:78px repeat(6,1fr);gap:0}
      .gantt-task-label{font-size:10px;padding-left:6px}
      .gantt-bar{font-size:9px;padding:0 5px}
      .matrix-today-summary{gap:6px}
      .matrix-today-stat-num{font-size:17px}
      .matrix-today-stat-label{font-size:9px}
      .ach-card{padding:12px 10px}
      .ach-card-num{font-size:18px}
      .retro-stats{grid-template-columns:repeat(2,1fr);gap:8px}
      .retro-stat-num{font-size:18px}
      .gantt-summary-cards{grid-template-columns:1fr;gap:8px}
    }
    /* Standard mobile (≤600px) — phones incl. 390/430 foldable */
    @media(max-width:600px){
      .topbar{padding:0 14px;gap:8px}
      .okr-selector{padding:4px 10px}
      .login-cta{padding:4px 10px;font-size:11px}
      .panel{padding:14px 14px var(--space-6)}
      .sub-tabs{padding:0 14px;top:52px}
      .sub-tab{padding:9px 12px;font-size:12px}
      .matrix-header h2{font-size:16px}
      .eisenhower-grid{grid-template-columns:1fr;grid-template-rows:repeat(4,auto);min-height:0;gap:8px}
      .eq-cell{min-height:0;padding:10px}
      .eq-header{margin-bottom:6px}
      .eq-label{font-size:11px}
      .eq-count{font-size:11px;min-width:20px;height:20px;line-height:20px}
      .eq-tasks{gap:4px}
      .eq-task-title{font-size:13px}
      .eq-task-meta,.eq-task-okr{font-size:11px}
      .matrix-today-summary{grid-template-columns:repeat(3,1fr);gap:8px}
      .matrix-today-stat{padding:10px 6px}
      .matrix-today-stat-num{font-size:18px}
      .matrix-today-stat-label{font-size:10px}
      /* Gantt: switch to vertical scroll-friendly horizontal scroll container */
      .gantt-section{overflow-x:auto;-webkit-overflow-scrolling:touch}
      .gantt-header{flex-wrap:wrap;gap:8px}
      .gantt-header h2{font-size:16px}
      .gantt-months{grid-template-columns:110px repeat(6,1fr);min-width:560px}
      .gantt-row{grid-template-columns:110px repeat(6,1fr);min-width:560px;gap:0}
      .gantt-task-label{font-size:11px;padding-left:8px}
      .gantt-summary-cards{grid-template-columns:repeat(3,1fr);gap:8px}
      .gantt-summary{padding:10px 8px}
      .gantt-summary-num{font-size:18px}
      .gantt-summary-label{font-size:9px}
      /* Calendar: compact grid */
      .cal-header{flex-wrap:wrap;gap:8px}
      .cal-header h2{font-size:16px}
      .cal-month{min-width:auto;font-size:13px}
      .cal-nav-btn{width:28px;height:28px}
      .cal-grid{gap:3px}
      .cal-day{min-height:56px;padding:4px 2px;border-radius:8px}
      .cal-day-num{width:22px;height:22px;font-size:10px}
      .cal-task-title{font-size:9px}
      .ach-grid{grid-template-columns:repeat(3,1fr);gap:8px}
      .ach-card{padding:12px 10px}
      .ach-card-num{font-size:20px}
      .ach-card-label{font-size:10px}
      .ach-okr-item{padding:10px 12px;gap:10px}
      .ach-okr-name{font-size:12px}
      .ach-okr-pct{font-size:12px}
      /* Retro: 2x2 stat grid on phones */
      .retro-summary{padding:14px}
      .retro-stats{grid-template-columns:repeat(2,1fr);gap:10px}
      .retro-stat-num{font-size:20px}
      /* Sub-tabs right cluster */
      .sub-tabs-right .btn-share{padding:4px 8px;font-size:11px}
    }
    /* Compact mobile (≤480px) — narrow phones */
    @media(max-width:480px){
      .topbar-btn:nth-of-type(2){display:none} /* hide notification to make room */
      .topbar-share{width:28px;height:28px}
      .topbar-share svg{width:14px;height:14px}
      .topbar-avatar{width:28px;height:28px;font-size:12px}
      .ach-grid{grid-template-columns:repeat(2,1fr)}
      .matrix-today-summary{grid-template-columns:repeat(3,1fr)}
      .gantt-summary-cards{grid-template-columns:repeat(3,1fr)}
      .auth-card{padding:24px;border-radius:16px}
      .auth-mark{width:38px;height:38px}
      .auth-wordmark{font-size:24px;gap:5px}
      .auth-wordmark i{font-size:20px}
    }
    /* Tablet (601-900px) — small tablets, foldable open */
    @media(min-width:601px) and (max-width:900px){
      .panel{padding:16px 18px var(--space-6)}
      .eisenhower-grid{gap:10px}
      .eq-cell{min-height:160px;padding:14px}
      .cal-day{min-height:62px}
      .gantt-summary-cards{gap:10px}
    }
    /* Mid tablet (901-1024px) — iPad portrait, small laptop */
    @media(min-width:901px) and (max-width:1024px){
      .panel{padding:var(--space-5) var(--space-4) var(--space-6)}
      .eisenhower-grid{min-height:420px}
      .eq-cell{min-height:180px}
    }

    /* ── Sub Tabs (二级Tab) ── */
    .sub-tabs{display:flex;gap:0;padding:0 20px 10px;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none;align-items:center}
    .sub-tabs-right{margin-left:auto;flex-shrink:0;display:flex;align-items:center;gap:8px;padding-right:4px}
    .sub-tabs-right .btn-share{padding:5px 10px;font-size:12px;font-weight:500;border-radius:7px}
    .sub-tabs-right .btn-share:hover{transform:none;box-shadow:none}
    .sub-tabs::-webkit-scrollbar{display:none}
    .sub-tab{padding:11px 14px;font-size:13px;font-weight:500;color:var(--muted);border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0}
    .sub-tab:hover{color:var(--fg)}
    .sub-tab.active{color:var(--fg);border-bottom-color:var(--accent);font-weight:600}
    .sub-view{display:none!important;width:100%}
    .sub-view.active,.panel.active .sub-view.active{display:block!important}

    /* ── Login/Register Modal ── */
    .auth-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;place-items:center;z-index:300;backdrop-filter:blur(8px)}
    .auth-overlay.open{display:grid}
    .auth-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:36px;width:min(420px,92vw);box-shadow:0 30px 80px rgba(0,0,0,.2)}
    .auth-logo{display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:var(--fg);margin-bottom:14px;line-height:1}
    .auth-mark{width:48px;height:48px;color:var(--fg);flex-shrink:0}
    .auth-wordmark{display:inline-flex;align-items:baseline;gap:6px;font-family:var(--font-display);font-size:30px;font-weight:600;letter-spacing:-0.025em;white-space:nowrap}
    .auth-wordmark b{font-weight:600;color:var(--fg)}
    .auth-wordmark i{font-style:normal;color:var(--accent);font-weight:500;font-size:24px;transform:translateY(-2px)}
    .auth-wordmark em{font-style:normal;font-weight:500;color:var(--meta);letter-spacing:-0.005em}
    .auth-tagline{font-size:13px;color:var(--muted);margin-bottom:24px}
    .auth-tabs{display:flex;gap:4px;background:var(--bg);border-radius:10px;padding:3px;margin-bottom:20px}
    .auth-tab{flex:1;padding:8px;border-radius:8px;font-size:13px;font-weight:500;color:var(--muted);cursor:pointer;transition:all .15s;text-align:center;border:none;background:transparent}
    .auth-tab.active{background:var(--surface);color:var(--fg);box-shadow:0 1px 3px rgba(0,0,0,.06)}
    .auth-field{margin-bottom:14px}
    .auth-field label{display:block;font-size:11px;font-weight:600;color:var(--muted);margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase}
    .auth-field input{width:100%;padding:11px 14px;border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:var(--font-body);color:var(--fg);background:var(--bg);outline:none;transition:border-color .15s}
    .auth-field input:focus{border-color:var(--accent)}
    .auth-submit{width:100%;padding:12px;border-radius:10px;font-size:14px;font-weight:600;background:var(--accent);color:#fff;border:none;cursor:pointer;margin-top:6px;transition:opacity .15s}
    .auth-submit:hover{opacity:.88}
    .auth-divider{display:flex;align-items:center;gap:10px;margin:18px 0;font-size:11px;color:var(--muted)}
    .auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--border)}
    .auth-socials{display:flex;gap:8px}
    .auth-social{flex:1;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--bg);cursor:pointer;display:grid;place-items:center;transition:all .15s}
    .auth-social:hover{background:var(--surface);border-color:var(--muted)}
    .auth-social svg{width:18px;height:18px;color:var(--fg)}

    /* ── 复盘 (Retrospective) ── */
    .retro-summary{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px;margin-bottom:14px}
    .retro-summary-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .retro-summary-title{font-size:15px;font-weight:600;color:var(--fg)}
    .retro-summary-period{font-size:11px;color:var(--muted);background:var(--bg);padding:3px 8px;border-radius:999px}
    .retro-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .retro-stat{text-align:center}
    .retro-stat-num{font-family:var(--font-display);font-size:22px;font-weight:700;letter-spacing:-0.02em;color:var(--fg)}
    .retro-stat-num.good{color:var(--success)}
    .retro-stat-num.warn{color:var(--warning)}
    .retro-stat-label{font-size:10px;color:var(--muted);margin-top:2px}
    .retro-time-bars{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px;margin-bottom:14px}
    .retro-time-bars h3{font-size:14px;font-weight:600;margin-bottom:14px}
    .retro-time-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
    .retro-time-label{font-size:12px;font-weight:500;color:var(--fg);min-width:80px}
    .retro-time-track{flex:1;height:8px;background:var(--bg);border-radius:4px;overflow:hidden}
    .retro-time-fill{height:100%;border-radius:4px}
    .retro-time-val{font-size:11px;font-weight:600;color:var(--muted);min-width:50px;text-align:right;font-variant-numeric:tabular-nums}
    .retro-insights{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px}
    .retro-insights h3{font-size:14px;font-weight:600;margin-bottom:12px}
    .retro-insight{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
    .retro-insight:last-child{border-bottom:none}
    .retro-insight-icon{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-size:14px;flex-shrink:0}
    .retro-insight-icon.good{background:oklch(94% 0.008 145);color:var(--success)}
    .retro-insight-icon.warn{background:oklch(94% 0.008 45);color:var(--warning)}
    .retro-insight-icon.info{background:oklch(94% 0.008 255);color:var(--accent)}
    .retro-insight-text{flex:1;font-size:12px;color:var(--fg);line-height:1.5}
    .retro-insight-text b{font-weight:600}

    /* ── 分享 (Share) ── */
    .share-cover{background:linear-gradient(135deg,var(--accent),color-mix(in oklab,var(--accent),var(--fg) 25%));border-radius:16px;padding:18px 20px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden}
    .share-cover::after{content:'';position:absolute;top:-40px;right:-20px;width:140px;height:140px;background:rgba(255,255,255,.06);border-radius:50%;pointer-events:none}
    .share-cover-eyebrow{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.85;margin-bottom:6px;display:flex;align-items:center;gap:5px}
    .share-cover-eyebrow svg{width:11px;height:11px}
    .share-cover-title{font-family:var(--font-display);font-size:19px;font-weight:600;letter-spacing:-0.022em;line-height:1.25;margin-bottom:10px;position:relative;z-index:1}
    .share-cover-meta{font-size:11.5px;opacity:.85;position:relative;z-index:1;display:flex;align-items:center;gap:6px}
    .share-cover-meta svg{width:12px;height:12px;opacity:.7;flex-shrink:0}
    .share-link-row{display:flex;gap:8px;margin-bottom:14px}
    .share-link-input{flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:12px;font-family:var(--font-mono);color:var(--fg);background:var(--bg)}
    .share-link-copy{padding:10px 14px;border-radius:10px;background:var(--accent);color:#fff;border:none;font-size:12px;font-weight:600;cursor:pointer}
    .share-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px}
    .share-target{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:all 220ms var(--ease-standard)}
    .share-target:hover{border-color:var(--accent);background:var(--bg);transform:translateY(-1px)}
    .share-target-icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;font-size:18px;background:var(--bg);border:1px solid var(--border-soft);transition:all 220ms var(--ease-standard)}
    .share-target:hover .share-target-icon{border-color:transparent;background:color-mix(in oklab,var(--accent),transparent 92%)}
    .share-target-label{font-size:11px;color:var(--fg);font-weight:500;letter-spacing:-0.005em}
    .share-section-label{font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin:6px 0 10px}
    .share-visibility{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:6px 16px}
    .share-visibility h3{font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin:10px 0 6px}
    .share-vis-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-soft)}
    .share-vis-row:last-child{border-bottom:none}
    .share-vis-label{font-size:13px;color:var(--fg);font-weight:500}
    .share-vis-sub{font-size:11px;color:var(--muted);margin-top:2px}
    /* ── Share overlay (calendar/gantt) ── */
    #share-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:900;place-items:center}
    #share-overlay.open{display:grid}
    .share-panel{background:var(--bg);border-radius:18px;width:380px;max-width:92vw;max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.18)}
    .share-panel-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .share-panel-header h2{font-family:var(--font-display);font-size:18px;font-weight:600;letter-spacing:-0.02em}
    .share-panel-close{width:28px;height:28px;border-radius:50%;border:none;background:var(--surface);cursor:pointer;font-size:16px;display:grid;place-items:center;color:var(--muted)}
    .share-panel-preview{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px}
    .share-panel-preview h3{font-size:13px;font-weight:600;margin-bottom:8px;color:var(--fg)}
    .share-panel-preview-hint{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px}
    /* ── Shared read-only view ── */
    .shared-view{display:none;flex-direction:column;height:100vh}
    .shared-view.active{display:flex}
    .shared-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:var(--bg)}
    .shared-header-brand{font-family:var(--font-display);font-size:16px;font-weight:700;letter-spacing:-0.02em;color:var(--fg)}
    .shared-header-badge{font-size:11px;color:var(--muted);background:var(--surface);padding:3px 10px;border-radius:20px;border:1px solid var(--border)}
    .shared-body{flex:1;overflow-y:auto;padding:20px}
    .switch{position:relative;width:36px;height:20px;background:var(--border);border-radius:10px;cursor:pointer;transition:background .15s;flex-shrink:0}
    .switch.on{background:var(--accent)}
    .switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .15s}
    .switch.on::after{transform:translateX(16px)}

    /* ── 勋章 (Badges) ── */
    .badge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
    .badge-item{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px 10px;text-align:center;position:relative;transition:all .15s}
    .badge-item.locked{opacity:.4;filter:grayscale(80%)}
    .badge-item:hover:not(.locked){transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.06)}
    .badge-icon{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;margin:0 auto 8px;font-size:24px;background:linear-gradient(135deg,oklch(58% 0.18 255),oklch(48% 0.20 270));color:#fff}
    .badge-icon.gold{background:linear-gradient(135deg,#FFD86F,#FF9F1C)}
    .badge-icon.silver{background:linear-gradient(135deg,#D7D9DD,#9CA0A8)}
    .badge-icon.green{background:linear-gradient(135deg,#7EE8B5,#16A34A)}
    .badge-name{font-size:12px;font-weight:600;color:var(--fg);margin-bottom:3px}
    .badge-desc{font-size:10px;color:var(--muted);line-height:1.4}

    /* ── 日历: 日视图 / 周视图 ── */
    .day-view{padding:14px;background:var(--surface);border-radius:14px;margin-bottom:14px}
    .day-view-time-row{display:grid;grid-template-columns:60px 1fr;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);min-height:46px;align-items:start}
    .day-view-time-row:last-child{border-bottom:none}
    .day-view-hour{font-size:11px;font-weight:500;color:var(--muted);font-variant-numeric:tabular-nums}
    .day-view-events{display:flex;flex-direction:column;gap:4px}
    .day-view-event{padding:5px 9px;border-radius:6px;background:oklch(94% 0.008 255);border-left:3px solid var(--accent);font-size:12px;color:var(--fg);cursor:pointer;transition:all .15s}
    .day-view-event:hover{filter:brightness(.96);transform:translateX(1px)}
    .day-view-event.q2{background:oklch(94% 0.008 145);border-left-color:var(--success)}
    .day-view-event.q3{background:oklch(94% 0.008 45);border-left-color:var(--warning)}
    .day-view-event.q4{background:var(--bg);border-left-color:var(--muted)}
    .day-view-event b{font-weight:600;display:block;margin-bottom:1px}
    .day-view-event span{font-size:10px;color:var(--muted)}

    .week-view{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
    .week-view-col{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 4px;min-height:300px;display:flex;flex-direction:column;gap:4px}
    .week-view-col.today{border-color:var(--accent);background:oklch(98% 0.005 255)}
    .week-view-day-label{font-size:10px;font-weight:600;color:var(--muted);text-align:center;text-transform:uppercase;letter-spacing:.04em}
    .week-view-col.today .week-view-day-label{color:var(--accent)}
    .week-view-day-num{font-size:18px;font-weight:700;color:var(--fg);text-align:center;font-family:var(--font-display);margin-bottom:4px}
    .week-view-col.today .week-view-day-num{color:var(--accent)}
    .week-view-event{font-size:10px;padding:4px 5px;border-radius:4px;background:oklch(94% 0.008 255);color:var(--fg);line-height:1.3;cursor:pointer;transition:all .12s}
    .week-view-event:hover{filter:brightness(.94);transform:translateX(1px)}
    .week-view-event.q2{background:oklch(94% 0.008 145)}
    .week-view-event.q3{background:oklch(94% 0.008 45)}

    /* ── 列表: 进行中 / 已完成 子视图 ── */
    .completed-group{margin-bottom:14px}
    .completed-group-header{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
    .completed-group-count{font-size:10px;font-weight:500;background:var(--bg);padding:2px 7px;border-radius:999px}

    /* ── 列表: 搜索/分类 ── */
    .list-search{display:flex;gap:8px;margin-bottom:12px}
    .list-search-input{flex:1;padding:9px 12px 9px 36px;border:1px solid var(--border);border-radius:10px;font-size:13px;background:var(--bg);color:var(--fg);outline:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236e6e73' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='M21 21l-4.35-4.35'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:12px center}
    .list-search-input:focus{border-color:var(--accent)}

    /* ── 甘特: 季度/年度 ── */
    .gantt-summary-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
    .gantt-summary{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center}
    .gantt-summary-num{font-family:var(--font-display);font-size:24px;font-weight:700;letter-spacing:-0.02em;color:var(--fg)}
    .gantt-summary-num.warn{color:var(--warning)}
    .gantt-summary-num.good{color:var(--success)}
    .gantt-summary-label{font-size:10px;color:var(--muted);margin-top:3px}

    /* ── 矩阵: 今日/本周 sub-views ── */
    .matrix-today-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
    .matrix-today-stat{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center}
    .matrix-today-stat-num{font-family:var(--font-display);font-size:20px;font-weight:700;letter-spacing:-0.02em}
    .matrix-today-stat-num.q1{color:var(--accent)}
    .matrix-today-stat-num.q2{color:var(--success)}
    .matrix-today-stat-num.q3{color:var(--warning)}
    .matrix-today-stat-num.q4{color:var(--muted)}
    .matrix-today-stat-label{font-size:10px;color:var(--muted);margin-top:2px}

    /* ── Login入口按钮 ── */
    .login-cta{padding:5px 12px;border-radius:8px;background:var(--accent);color:#fff;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:opacity .15s}
    .topbar-share{width:30px;height:30px;border-radius:8px;background:transparent;border:none;display:grid;place-items:center;cursor:pointer;color:var(--muted);transition:all .15s;position:relative}
    .topbar-share:hover{background:var(--surface);color:var(--accent)}
    .topbar-share svg{width:16px;height:16px}
    .login-cta:hover{opacity:.88}

    /* ── Impeccable polish: a11y + 状态 + 响应式 ── */
    :focus{outline:none}
    :focus-visible{outline:3px solid color-mix(in oklab,var(--accent) 60%,transparent);outline-offset:2px;border-radius:4px}
    button:focus-visible,a:focus-visible,[tabindex]:focus-visible{outline-offset:3px}
    .btn-ghost:focus-visible,.btn-share:focus-visible,.btn-primary:focus-visible,.sub-tab:focus-visible{outline-offset:3px}
    .btn-ghost:disabled,.btn-share:disabled,.btn-primary:disabled,.sub-tab:disabled{opacity:.5;cursor:not-allowed;pointer-events:none}
    .state-block{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;text-align:center;color:var(--muted);gap:12px;min-height:240px}
    .state-block-icon{width:44px;height:44px;color:var(--meta);opacity:.5}
    .state-block-title{font-size:14px;font-weight:600;color:var(--fg);margin:0}
    .state-block-desc{font-size:12px;color:var(--muted);max-width:320px;margin:0;line-height:1.5}
    .state-block-action{margin-top:4px}
    .skeleton{background:linear-gradient(90deg,var(--surface) 0%,var(--surface-warm) 50%,var(--surface) 100%);background-size:200% 100%;animation:skel 1.4s ease-in-out infinite;border-radius:6px;color:transparent;min-height:1em}
    @keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @media (prefers-reduced-motion:reduce){
      *,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}
      .skeleton{animation:none;background:var(--surface)}
    }
    @media (max-width:1024px) and (min-width:769px){
      .panel{padding:var(--space-4) var(--space-4) var(--space-5)}
      .eisenhower-grid{min-height:380px}
    }
    @media (max-width:1280px) and (min-width:1025px){
      .panel{padding:var(--space-5) var(--space-6) var(--space-6)}
    }
    @media (min-width:1600px){
      .panel{padding:28px 40px var(--space-8);max-width:1400px;margin:0 auto}
    }
  
```
