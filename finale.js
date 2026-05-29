/* ============================================================
   presenta/finale.js
   Grand finale — interactive pan/zoom mega-flow of the full
   comprehensive_intelligence_chancellor pipeline, with an
   execution-order playhead animation.
   ============================================================ */
(() => {
  const slide = document.getElementById('slide-18');
  if (!slide) return;
  const stage = slide.querySelector('.finale-stage');
  const svg = slide.querySelector('.mf-svg');
  const vp = slide.querySelector('.mf-vp');
  if (!stage || !svg || !vp) return;

  const NS = 'http://www.w3.org/2000/svg';
  const VIEW_W = 4560, VIEW_H = 1420;

  // ---------- tiny dom helpers ----------
  function el(tag, attrs, txt) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (txt != null) n.textContent = txt;
    return n;
  }
  function text(x, y, str, cls, fs, anchor) {
    return el('text', { x, y, 'text-anchor': anchor || 'middle', class: cls, 'font-size': fs }, str);
  }

  // ---------- spec containers ----------
  const nodes = [];   // node specs
  const edges = [];   // edge specs {d, cls, to}
  const labels = [];  // free text {x,y,str,cls,fs,anchor}
  const fields = [];  // mongo fields {id,label,cx,skip}

  const addNode = (o) => nodes.push(o);
  const addLabel = (x, y, str, cls, fs, anchor) => labels.push({ x, y, str, cls, fs, anchor });
  function vline(x, y1, y2, cls, to) { edges.push({ d: `M ${x} ${y1} L ${x} ${y2}`, cls, to }); }
  function hline(x1, x2, y, cls, to) { edges.push({ d: `M ${x1} ${y} L ${x2} ${y}`, cls, to }); }
  function path(d, cls, to) { edges.push({ d, cls, to }); }

  // ---------- layout constants ----------
  const SPINE_CY = 150;
  const MONGO_Y = 1158, MONGO_TOP = MONGO_Y;

  // ---------- critic-worker LoopAgent block (shared) ----------
  // Renders the governance cycle: evaluator (critic) grades → escalation_checker
  // decides → on FAIL, enhanced_search refines and loops back; on PASS, exit.
  // Returns the y-coordinate of the loop box bottom.
  function loopBlock(cx, key, topY, kicker, evalLabel, enhLabel) {
    const h = 286;
    addNode({ id: key + '_loop', x: cx - 190, y: topY, w: 380, h, kind: 'loop', kicker });
    const ey = topY + 64, sy = topY + 132, ny = topY + 200; // mini node tops
    addNode({ id: key + '_eval', x: cx - 100, y: ey, w: 200, h: 48, cls: 'critic mini', title: evalLabel, tsize: evalLabel.length > 11 ? 15 : 20 });
    addNode({ id: key + '_esc', x: cx - 100, y: sy, w: 200, h: 48, cls: 'mini', title: 'escalation_checker', tsize: 15 });
    addNode({ id: key + '_enh', x: cx - 100, y: ny, w: 200, h: 48, cls: 'worker mini', title: enhLabel, tsize: enhLabel.length > 13 ? 15 : 16 });
    vline(cx, ey + 48, sy, '', key + '_esc');                                      // evaluator → escalation_checker
    edges.push({ d: `M ${cx} ${sy + 48} L ${cx} ${ny}`, cls: 'fail', to: key + '_enh' });  // FAIL → refine
    path(`M ${cx - 100} ${ny + 24} L ${cx - 168} ${ny + 24} L ${cx - 168} ${ey + 24} L ${cx - 100} ${ey + 24}`, 'loopback', null); // loop back to re-grade
    addLabel(cx - 176, (ey + ny) / 2 + 34, '↻', 'mf-loopback-ico', 30, 'middle');
    addLabel(cx + 106, sy + 76, 'FAIL', 'mf-fail-lbl', 13, 'start');
    return topY + h;
  }

  // ---------- standard research pipeline ----------
  function stdPipe(cx, key, titleLines, field, fieldLabel) {
    addNode({ id: key, x: cx - 150, y: 104, w: 300, h: 92, cls: 'agent', kind: 'header', kicker: 'SequentialAgent', title: titleLines, tsize: 21 });
    addNode({ id: key + '_planner', x: cx - 160, y: 300, w: 320, h: 74, cls: 'worker', title: 'section_planner', tsize: 22 });
    addNode({ id: key + '_researcher', x: cx - 160, y: 402, w: 320, h: 74, cls: 'worker', title: 'researcher', tsize: 24 });
    addNode({ id: key + '_tool', x: cx - 120, y: 494, w: 240, h: 48, cls: 'tool', title: 'google_search', tsize: 19 });
    const boxBottom = loopBlock(cx, key, 560, 'quality_assurance_loop', 'evaluator', 'enhanced_search');
    addNode({ id: key + '_composer', x: cx - 160, y: 882, w: 320, h: 74, cls: 'composer', title: 'report_composer', tsize: 22 });

    vline(cx, 196, 300, '', key + '_planner');
    vline(cx, 374, 402, '', key + '_researcher');
    vline(cx, 476, 494, 'tool', key + '_tool');
    vline(cx, 542, 560, '', key + '_loop');
    vline(cx, boxBottom, 882, 'pass', key + '_composer');
    addLabel(cx + 22, 876, 'PASS → exit', 'mf-pass-lbl', 13, 'start');
    vline(cx, 956, MONGO_TOP, 'store', field);
    fields.push({ id: field, label: fieldLabel, cx });
  }

  // ---------- prospect pipeline (no composer) ----------
  function prospectPipe(cx, key) {
    addNode({ id: key, x: cx - 150, y: 104, w: 300, h: 92, cls: 'agent', kind: 'header', kicker: 'SequentialAgent', title: ['prospect_', 'researcher'], tsize: 21 });
    addNode({ id: key + '_persona', x: cx - 160, y: 300, w: 320, h: 74, cls: 'worker', title: 'persona_researcher', tsize: 19 });
    const boxBottom = loopBlock(cx, key, 424, 'persona_quality_check', 'persona_evaluator', 'enhanced_persona');
    addNode({ id: key + '_datagen', x: cx - 160, y: 744, w: 320, h: 74, cls: 'worker', title: 'persona_data_generator', tsize: 17 });
    addNode({ id: key + '_apollo', x: cx - 160, y: 846, w: 320, h: 74, cls: 'tool', title: 'apollo_param_generator', tsize: 17 });

    vline(cx, 196, 300, '', key + '_persona');
    vline(cx, 374, 424, '', key + '_loop');
    vline(cx, boxBottom, 744, 'pass', key + '_datagen');
    addLabel(cx + 22, 738, 'PASS → exit', 'mf-pass-lbl', 13, 'start');
    vline(cx, 818, 846, '', key + '_apollo');
    vline(cx, 920, MONGO_TOP, 'store', 'prospect_research');
    addLabel(cx + 174, 892, 'no composer', 'mf-kicker', 14, 'start');
    fields.push({ id: 'prospect_research', label: 'prospect_research', cx });
  }

  // ---------- conditional sales pipeline ----------
  function condPipe(cx, key) {
    addNode({ id: key, x: cx - 150, y: 104, w: 300, h: 92, cls: 'cond', kind: 'header', kicker: 'conditional · LlmAgent', title: ['sales_', 'intelligence'], tsize: 20 });
    addNode({ id: key + '_gate', x: cx - 95, y: 300, w: 190, h: 150, cls: 'cond', kind: 'diamond', title: 'skip_sales?', tsize: 19 });
    addNode({ id: key + '_skip', x: cx - 160, y: 500, w: 320, h: 300, cls: 'cond skip', kind: 'header', kicker: 'no target → SKIP', title: ['PIPELINE', 'SKIPPED'], tsize: 24 });

    vline(cx, 196, 300, 'route', key + '_gate');
    vline(cx, 450, 500, 'skip', key + '_skip');
    vline(cx, 800, MONGO_TOP, 'skip', 'target_org_research');
    addLabel(cx, 478, 'reads user_analysis', 'mf-kicker', 15, 'middle');
    fields.push({ id: 'target_org_research', label: 'target_org_research', cx, skip: true });
  }

  // ---------- spine (sequential order, left → right) ----------
  const SP = [
    { id: 'user', cx: 180, w: 240, render: { cls: 'input', kicker: 'request', title: ['USER', 'PROMPT'], tsize: 22 } },
    { id: 'user_input_analyzer', cx: 520, w: 280, render: { cls: 'classifier', kicker: 'LlmAgent', title: ['user_input_', 'analyzer'], tsize: 19 } },
    { id: 'project_creator', cx: 860, w: 240, render: { cls: 'agent', kicker: 'LlmAgent', title: 'project_creator', tsize: 17 } },
    { id: 'market_prompt_builder', cx: 1150, w: 280, render: { cls: 'builder', kicker: 'LlmAgent', title: ['market_', 'prompt_builder'], tsize: 18 } },
    { id: 'market', cx: 1500, w: 300, pipe: true },
    { id: 'segmentation_prompt_builder', cx: 1850, w: 280, render: { cls: 'builder', kicker: 'LlmAgent', title: ['segmentation_', 'prompt_builder'], tsize: 17 } },
    { id: 'segmentation', cx: 2200, w: 300, pipe: true },
    { id: 'org_prompt_builder', cx: 2550, w: 280, render: { cls: 'builder', kicker: 'LlmAgent', title: ['org_', 'prompt_builder'], tsize: 18 } },
    { id: 'org', cx: 2900, w: 300, pipe: true },
    { id: 'conditional_sales_prompt_builder', cx: 3250, w: 280, render: { cls: 'builder', kicker: 'LlmAgent', title: ['sales_', 'prompt_builder'], tsize: 18 } },
    { id: 'sales', cx: 3600, w: 300, pipe: true },
    { id: 'prospect_prompt_builder', cx: 3950, w: 280, render: { cls: 'builder', kicker: 'LlmAgent', title: ['prospect_', 'prompt_builder'], tsize: 17 } },
    { id: 'prospect', cx: 4300, w: 300, pipe: true },
  ];

  // spine non-pipeline nodes
  SP.forEach((s) => {
    if (s.pipe) return;
    const r = s.render;
    addNode({ id: s.id, x: s.cx - s.w / 2, y: 104, w: s.w, h: 92, cls: r.cls, kind: 'header', kicker: r.kicker, title: r.title, tsize: r.tsize });
  });
  // pipelines
  stdPipe(1500, 'market', ['market_', 'intelligence'], 'market_context', 'market_context');
  stdPipe(2200, 'segmentation', ['segmentation_', 'intel'], 'market_segment', 'market_segment');
  stdPipe(2900, 'org', ['org_', 'intelligence'], 'client_org_research', 'client_org_research');
  condPipe(3600, 'sales');
  prospectPipe(4300, 'prospect');

  // project_creator tool + init edge
  addNode({ id: 'project_creator_tool', x: 740, y: 236, w: 240, h: 50, cls: 'tool', title: 'create_blank_project', tsize: 15 });
  vline(860, 196, 236, 'tool', 'project_creator_tool');
  path('M 860 286 L 860 1204 L 1240 1204', 'init', 'mongo_init');
  addLabel(872, 1150, 'create_blank_project → blank doc', 'mf-kicker', 14, 'start');

  // spine horizontal edges
  for (let i = 0; i < SP.length - 1; i++) {
    const a = SP[i], b = SP[i + 1];
    hline(a.cx + a.w / 2, b.cx - b.w / 2, SPINE_CY, '', b.id);
  }

  // ---------- mongo doc ----------
  const STORED = {
    market_context: 'TAM · SAM · SOM',
    market_segment: 'personas + ICP',
    client_org_research: 'org graph',
    target_org_research: 'targets',
    prospect_research: 'apollo JSON',
  };

  // ================= RENDER =================
  // background containers
  vp.appendChild(el('rect', { x: 40, y: 68, width: 4480, height: 168, rx: 18, class: 'mf-chancellor' }));
  labels.push({ x: 70, y: 52, str: 'comprehensive_intelligence_chancellor   ·   SequentialAgent  (12 sequential steps)', cls: 'mf-kicker', fs: 24, anchor: 'start' });

  const mongoX = 1240, mongoW = 3240, mongoH = 190;
  vp.appendChild(el('rect', { x: mongoX, y: MONGO_Y, width: mongoW, height: mongoH, rx: 18, class: 'mf-mongo' }));
  labels.push({ x: mongoX + 20, y: MONGO_Y - 18, str: 'MongoDB · projects collection — fields fill as each after_agent_callback fires', cls: 'mf-kicker', fs: 22, anchor: 'start' });

  // edges
  function arrowFor(cls) {
    cls = cls || '';
    if (cls.includes('loopback')) return 'url(#mfa-loop)';
    if (cls.includes('store') || cls.includes('pass')) return 'url(#mfa-store)';
    if (cls.includes('tool') || cls.includes('init')) return 'url(#mfa-tool)';
    if (cls.includes('route') || cls.includes('skip') || cls.includes('fail')) return 'url(#mfa-route)';
    return 'url(#mfa)';
  }
  edges.forEach((e) => {
    const p = el('path', { d: e.d, class: 'mf-edge ' + (e.cls || ''), 'marker-end': arrowFor(e.cls) });
    if (e.to) p.setAttribute('data-to', e.to);
    vp.appendChild(p);
  });

  // nodes
  function renderTitle(g, cx, cy, title, cls, fs) {
    const lines = Array.isArray(title) ? title : (title != null ? [title] : []);
    if (!lines.length) return;
    const lh = fs + 6;
    let y = cy - ((lines.length - 1) * lh) / 2 + fs * 0.34;
    lines.forEach((l) => { g.appendChild(text(cx, y, l, cls, fs)); y += lh; });
  }
  nodes.forEach((n) => {
    const g = el('g', { class: 'mf-node ' + (n.cls || ''), 'data-id': n.id });
    g.dataset.bx = n.x; g.dataset.by = n.y; g.dataset.bw = n.w; g.dataset.bh = n.h;
    const cx = n.x + n.w / 2;
    if (n.kind === 'diamond') {
      const pts = `${cx},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${cx},${n.y + n.h} ${n.x},${n.y + n.h / 2}`;
      g.appendChild(el('polygon', { points: pts }));
      renderTitle(g, cx, n.y + n.h / 2, n.title, 'mf-title', n.tsize || 20);
    } else if (n.kind === 'loop') {
      g.appendChild(el('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: 16, class: 'mf-loopbox' }));
      if (n.kicker) g.appendChild(text(n.x + 16, n.y + 32, n.kicker, 'mf-kicker', 15, 'start'));
      const bw = 100, bx = n.x + n.w - bw - 12, by = n.y + 12;
      g.appendChild(el('rect', { x: bx, y: by, width: bw, height: 30, rx: 15, class: 'mf-loopbadge' }));
      g.appendChild(el('circle', { cx: bx + 18, cy: by + 15, r: 9, class: 'mf-loopring' }));
      g.appendChild(text(bx + 60, by + 21, '≤ 5×', 'mf-loopbadge-txt', 15));
      const lkey = n.id.replace(/_loop$/, '');
      const it = text(n.x + 16, n.y + n.h - 14, 'iteration · idle', 'mf-itercount', 14, 'start');
      it.setAttribute('id', 'iter-' + lkey);
      g.appendChild(it);
    } else {
      g.appendChild(el('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: n.rx || 12 }));
      if (n.kicker) g.appendChild(text(cx, n.y + 28, n.kicker, 'mf-kicker', 16));
      const cy = n.kind === 'header' ? n.y + n.h / 2 + 12 : n.y + n.h / 2;
      renderTitle(g, cx, cy, n.title, n.cls && n.cls.includes('mini') ? 'mf-title' : 'mf-title', n.tsize || 22);
    }
    vp.appendChild(g);
  });

  // mongo fields
  fields.forEach((f) => {
    const g = el('g', {});
    g.appendChild(text(f.cx, MONGO_Y + 56, f.label + ' :', 'mf-fieldlabel', 20));
    g.appendChild(el('rect', { x: f.cx - 165, y: MONGO_Y + 78, width: 330, height: 64, rx: 12, class: 'mf-chip', id: 'fc-' + f.id }));
    const val = text(f.cx, MONGO_Y + 118, 'awaiting…', 'mf-fieldval', 22);
    val.setAttribute('id', 'fv-' + f.id);
    g.appendChild(val);
    vp.appendChild(g);
  });

  // free labels
  labels.forEach((l) => vp.appendChild(text(l.x, l.y, l.str, l.cls, l.fs, l.anchor)));

  // markers (added to svg-level defs)
  const defs = el('defs', {});
  const mk = (id, fill) => {
    const m = el('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' });
    m.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill }));
    return m;
  };
  defs.appendChild(mk('mfa', '#3b4a66'));
  defs.appendChild(mk('mfa-store', '#34d399'));
  defs.appendChild(mk('mfa-tool', '#fbbf24'));
  defs.appendChild(mk('mfa-route', '#f472b6'));
  defs.appendChild(mk('mfa-loop', '#a78bfa'));
  svg.insertBefore(defs, svg.firstChild);

  // ================= PAN / ZOOM =================
  let view = { x: 0, y: 0, k: 1 };
  const KMIN = 0.06, KMAX = 4;
  const apply = () => vp.setAttribute('transform', `translate(${view.x},${view.y}) scale(${view.k})`);

  function toUser(clientX, clientY) {
    const ctm = svg.getScreenCTM();
    const p = svg.createSVGPoint(); p.x = clientX; p.y = clientY;
    return p.matrixTransform(ctm.inverse());
  }
  const stageW = () => svg.clientWidth || stage.clientWidth;
  const stageH = () => svg.clientHeight || stage.clientHeight;

  function fit() {
    const sw = stageW(), sh = stageH();
    const k = Math.min(sw / VIEW_W, sh / VIEW_H) * 0.94;
    view = { k, x: (sw - VIEW_W * k) / 2, y: (sh - VIEW_H * k) / 2 };
    apply();
  }

  function zoomAt(ux, uy, factor) {
    const nk = Math.max(KMIN, Math.min(KMAX, view.k * factor));
    const cx = (ux - view.x) / view.k, cy = (uy - view.y) / view.k;
    view.k = nk; view.x = ux - cx * nk; view.y = uy - cy * nk;
    apply();
  }

  // wheel zoom toward cursor
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const u = toUser(e.clientX, e.clientY);
    zoomAt(u.x, u.y, e.deltaY < 0 ? 1.14 : 0.877);
  }, { passive: false });

  // drag to pan
  let dragging = false, prevU = null, moved = 0;
  stage.addEventListener('pointerdown', (e) => {
    dragging = true; moved = 0; prevU = toUser(e.clientX, e.clientY);
    stage.classList.add('is-grabbing');
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    moved += Math.abs(e.movementX) + Math.abs(e.movementY);
    const u = toUser(e.clientX, e.clientY);
    view.x += u.x - prevU.x; view.y += u.y - prevU.y;
    prevU = u; apply();
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false; stage.classList.remove('is-grabbing');
    try { stage.releasePointerCapture(e.pointerId); } catch (_) { }
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // click a node → zoom to it (suppressed if it was a drag)
  let tween = null;
  function animateTo(target, ms) {
    if (tween) cancelAnimationFrame(tween);
    const start = { ...view }, t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / ms), e = ease(t);
      view.x = start.x + (target.x - start.x) * e;
      view.y = start.y + (target.y - start.y) * e;
      view.k = start.k + (target.k - start.k) * e;
      apply();
      if (t < 1) tween = requestAnimationFrame(frame);
    };
    tween = requestAnimationFrame(frame);
  }
  function zoomToNode(g) {
    const bx = +g.dataset.bx, by = +g.dataset.by, bw = +g.dataset.bw, bh = +g.dataset.bh;
    const sw = stageW(), sh = stageH(), pad = 110;
    const k = Math.max(KMIN, Math.min(KMAX, Math.min(sw / (bw + pad * 2), sh / (bh + pad * 2))));
    animateTo({ k, x: sw / 2 - k * (bx + bw / 2), y: sh / 2 - k * (by + bh / 2) }, 480);
  }
  vp.addEventListener('click', (e) => {
    if (moved > 7) return;
    const g = e.target.closest('.mf-node');
    if (g) zoomToNode(g);
  });

  // control buttons
  slide.querySelector('.finale-controls').addEventListener('click', (e) => {
    const b = e.target.closest('.mf-btn'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'fit') fit();
    else if (act === 'replay') startPlay();
    else if (act === 'zoomin' || act === 'zoomout') zoomAt(stageW() / 2, stageH() / 2, act === 'zoomin' ? 1.3 : 0.77);
  });

  // ================= PLAYHEAD =================
  // critic-worker cycle: enter loop, then grade→check→refine several times,
  // ending on a passing grade — makes the iterative governance visible.
  function cyc(key, cycles) {
    const s = [{ id: key + '_loop' }];
    for (let i = 0; i < cycles; i++) {
      s.push({ id: key + '_eval', iter: i + 1 }, { id: key + '_esc', iter: i + 1 });
      if (i < cycles - 1) s.push({ id: key + '_enh', iter: i + 1 });
    }
    return s;
  }
  const PLAY = [
    { id: 'user' }, { id: 'user_input_analyzer' }, { id: 'project_creator' }, { id: 'project_creator_tool' },
    { id: 'market_prompt_builder' },
    { id: 'market' }, { id: 'market_planner' }, { id: 'market_researcher' }, { id: 'market_tool' },
    ...cyc('market', 3), { id: 'market_composer', store: 'market_context' },
    { id: 'segmentation_prompt_builder' },
    { id: 'segmentation' }, { id: 'segmentation_planner' }, { id: 'segmentation_researcher' }, { id: 'segmentation_tool' },
    ...cyc('segmentation', 2), { id: 'segmentation_composer', store: 'market_segment' },
    { id: 'org_prompt_builder' },
    { id: 'org' }, { id: 'org_planner' }, { id: 'org_researcher' }, { id: 'org_tool' },
    ...cyc('org', 2), { id: 'org_composer', store: 'client_org_research' },
    { id: 'conditional_sales_prompt_builder' },
    { id: 'sales' }, { id: 'sales_gate' }, { id: 'sales_skip', skip: 'target_org_research' },
    { id: 'prospect_prompt_builder' },
    { id: 'prospect' }, { id: 'prospect_persona' }, ...cyc('prospect', 2),
    { id: 'prospect_datagen' }, { id: 'prospect_apollo', store: 'prospect_research' },
  ];
  const dur = (s) => s.store ? 760 : /_(eval|enh|esc|loop|gate)$/.test(s.id) ? 280 : 430;

  const byId = (id) => vp.querySelector(`.mf-node[data-id="${id}"]`);
  const edgeTo = (id) => vp.querySelector(`.mf-edge[data-to="${id}"]`);

  function storeField(field, isSkip) {
    const chip = document.getElementById('fc-' + field), val = document.getElementById('fv-' + field);
    if (!chip || !val) return;
    if (isSkip) { chip.classList.add('null'); val.classList.add('null'); val.textContent = 'null · skipped'; }
    else { chip.classList.add('stored'); val.classList.add('stored'); val.textContent = STORED[field] + ' ✓'; }
    const e = edgeTo(field); if (e) { e.classList.add('is-done'); }
  }

  function resetViz() {
    vp.querySelectorAll('.mf-node').forEach((g) => { g.classList.remove('is-active', 'is-done'); g.classList.add('is-pending'); });
    vp.querySelectorAll('.mf-edge').forEach((e) => e.classList.remove('is-live', 'is-done'));
    fields.forEach((f) => {
      const chip = document.getElementById('fc-' + f.id), val = document.getElementById('fv-' + f.id);
      if (chip) chip.classList.remove('stored', 'null');
      if (val) { val.classList.remove('stored', 'null'); val.textContent = 'awaiting…'; }
    });
    vp.querySelectorAll('.mf-itercount').forEach((t) => t.textContent = 'iteration · idle');
  }

  let timer = null, idx = 0, prevId = null;
  function markDone(id) {
    const g = byId(id); if (g) { g.classList.remove('is-active'); g.classList.add('is-done'); }
    const e = edgeTo(id); if (e) { e.classList.remove('is-live'); e.classList.add('is-done'); }
  }
  function tick() {
    if (idx >= PLAY.length) {
      if (prevId) markDone(prevId);
      timer = setTimeout(() => { if (slide.classList.contains('is-active')) startPlay(); }, 2400);
      return;
    }
    const s = PLAY[idx];
    if (prevId) markDone(prevId);
    const g = byId(s.id);
    if (g) { g.classList.remove('is-pending'); g.classList.add('is-active'); }
    const e = edgeTo(s.id); if (e) e.classList.add('is-live');
    if (s.iter) {
      const k = s.id.replace(/_(eval|esc|enh)$/, '');
      const t = document.getElementById('iter-' + k);
      if (t) t.textContent = 'iteration ' + s.iter + ' / 5';
    }
    if (s.store) storeField(s.store, false);
    if (s.skip) storeField(s.skip, true);
    prevId = s.id; idx++;
    timer = setTimeout(tick, dur(s));
  }
  function startPlay() { stopPlay(); resetViz(); idx = 0; prevId = null; timer = setTimeout(tick, 350); }
  function stopPlay() { if (timer) { clearTimeout(timer); timer = null; } }

  // ================= activation wiring =================
  function onActivate() { fit(); startPlay(); }
  function onDeactivate() { stopPlay(); }

  const mo = new MutationObserver(() => {
    if (slide.classList.contains('is-active')) { if (!timer) onActivate(); }
    else onDeactivate();
  });
  mo.observe(slide, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('resize', () => { if (slide.classList.contains('is-active')) fit(); });

  // initial layout (in case the slide is already active / for first paint)
  fit();
  if (slide.classList.contains('is-active')) startPlay();
  else resetViz();
})();
