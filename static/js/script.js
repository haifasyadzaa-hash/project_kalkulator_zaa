/* ===== SAKURA PETALS ===== */
(function() {
  const layer = document.getElementById('sakuraLayer');
  const symbols = ['🌸','🌺','·','✿','°'];
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = symbols[i % symbols.length];
    p.style.cssText = `
      left:${Math.random()*100}%;
      animation-duration:${9+Math.random()*12}s;
      animation-delay:${Math.random()*10}s;
      font-size:${10+Math.random()*8}px;
    `;
    layer.appendChild(p);
  }
})();

/* ===== THEME ===== */
const html = document.documentElement;
document.getElementById('themeToggle').addEventListener('click', () => {
  const t = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', t);
  localStorage.setItem('kp-theme', t);
  document.getElementById('themeIcon').className = t === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
});
(function() {
  const t = localStorage.getItem('kp-theme') || 'light';
  html.setAttribute('data-theme', t);
  document.getElementById('themeIcon').className = t === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
})();

/* ===== TAB SWITCH ===== */
function switchTab(btn, id) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + id).classList.add('active');
  if (id === 'aritmatika') updateScreen('arith');
  else if (id === 'logika') updateScreen('logic');
  else if (id === 'standar') stdUpdateScreen();
}

/* ===== SUB TAB ===== */
function switchSub(btn, id) {
  btn.closest('.tab-pane').querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
  btn.closest('.tab-pane').querySelectorAll('.sub-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('sub-' + id).classList.add('active');
}

/* ===== OP BUTTONS ===== */
let arithOp = 'tambah';
let logicOp = 'AND';

function setArithOp(btn, op) {
  document.querySelectorAll('#tab-aritmatika .op-key').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  arithOp = op;
  const bGrp = document.getElementById('arith-b-grp');
  bGrp.style.display = op === 'akar' ? 'none' : 'flex';
  // if akar, force active to A
  if (op === 'akar') setActiveInput('arith-a');
}
function setLogicOp(btn, op) {
  document.querySelectorAll('#tab-logika .op-key').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  logicOp = op;
  const bGrp = document.getElementById('logic-b-grp');
  bGrp.style.display = op === 'NOT' ? 'none' : 'flex';
  if (op === 'NOT') setActiveInput('logic-a');
}

/* ===== NUMPAD SYSTEM — CALCULATOR STATE MACHINE ===== */
// State: 'a' = entering A, 'b' = entering B
const calcState = {
  arith: { a: '', b: '', state: 'a' },
  logic: { a: '', b: '', state: 'a' }
};

function getCurrentPanel() {
  const pane = document.querySelector('.tab-pane.active');
  if (!pane) return null;
  if (pane.id === 'tab-aritmatika') return 'arith';
  if (pane.id === 'tab-logika')     return 'logic';
  return null;
}

function updateScreen(panel) {
  const st = calcState[panel];
  const exprEl = document.getElementById(panel + '-expr');
  const subEl  = document.getElementById(panel + '-sub');
  if (!exprEl) return;

  const opSymbols = {
    tambah:'＋', kurang:'－', kali:'×', bagi:'÷',
    pangkat:'xⁿ', akar:'√', modulus:'mod', floor:'//',
    AND:'AND', OR:'OR', NOT:'NOT', XOR:'XOR', NAND:'NAND', NOR:'NOR'
  };
  const op = panel === 'arith' ? arithOp : logicOp;
  const opSym = opSymbols[op] || op;

  if (st.state === 'a') {
    exprEl.textContent = st.a || '0';
    exprEl.classList.remove('entering-b');
    subEl.textContent = '';
  } else {
    exprEl.textContent = st.b || '0';
    exprEl.classList.add('entering-b');
    if (op === 'akar') {
      subEl.textContent = `${opSym}`;
    } else {
      subEl.textContent = `${st.a || '0'} ${opSym}`;
    }
  }

  // sync hidden inputs
  document.getElementById(panel + '-a').value = st.a;
  document.getElementById(panel + '-b').value = st.b;
}

function numInput(char) {
  const panel = getCurrentPanel();
  if (!panel) return;
  const st = calcState[panel];
  const key = st.state; // 'a' or 'b'

  if (char === '.') {
    if (st[key].includes('.')) return;
    if (st[key] === '' || st[key] === '-') st[key] += '0';
  }
  if (st[key] === '0' && char !== '.') st[key] = char;
  else st[key] += char;

  updateScreen(panel);
}

function numDelete() {
  const panel = getCurrentPanel();
  if (!panel) return;
  const st = calcState[panel];
  const key = st.state;
  st[key] = st[key].slice(0, -1);
  updateScreen(panel);
}

function numClear() {
  const panel = getCurrentPanel();
  if (!panel) return;
  const st = calcState[panel];
  // C once clears current field, C again resets all
  if (st[st.state] === '') {
    st.a = ''; st.b = ''; st.state = 'a';
  } else {
    st[st.state] = '';
  }
  updateScreen(panel);
}

function numToggleSign() {
  const panel = getCurrentPanel();
  if (!panel) return;
  const st = calcState[panel];
  const key = st.state;
  if (!st[key] || st[key] === '0') return;
  st[key] = st[key].startsWith('-') ? st[key].slice(1) : '-' + st[key];
  updateScreen(panel);
}

// Called when user picks an operator — auto move to entering B
function setArithOp(btn, op) {
  document.querySelectorAll('#tab-aritmatika .op-key').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  arithOp = op;
  const st = calcState.arith;
  if (op === 'akar') {
    // unary: stay on A, clear B
    st.b = ''; st.state = 'a';
  } else {
    // move to entering B if A has value
    if (st.a !== '') st.state = 'b';
  }
  updateScreen('arith');
}

function setLogicOp(btn, op) {
  document.querySelectorAll('#tab-logika .op-key').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  logicOp = op;
  const st = calcState.logic;
  if (op === 'NOT') {
    st.b = ''; st.state = 'a';
  } else {
    if (st.a !== '') st.state = 'b';
  }
  updateScreen('logic');
}

function switchNumpadTarget() {
  // manual toggle A↔B (still usable via keyboard Tab)
  const panel = getCurrentPanel();
  if (!panel) return;
  const st = calcState[panel];
  const op = panel === 'arith' ? arithOp : logicOp;
  const isUnary = (panel === 'arith' && op === 'akar') || (panel === 'logic' && op === 'NOT');
  if (isUnary) return;
  st.state = st.state === 'a' ? 'b' : 'a';
  updateScreen(panel);
}

/* ===== PHYSICAL KEYBOARD SUPPORT ===== */
document.addEventListener('keydown', e => {
  const panel = getCurrentPanel();
  if (!panel) return;
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' && !document.activeElement.hidden) return; // don't intercept real inputs

  if (e.key >= '0' && e.key <= '9') { e.preventDefault(); numInput(e.key); }
  else if (e.key === '.') { e.preventDefault(); numInput('.'); }
  else if (e.key === 'Backspace') { e.preventDefault(); numDelete(); }
  else if (e.key === 'Delete' || e.key === 'Escape') { e.preventDefault(); numClear(); }
  else if (e.key === 'Tab') { e.preventDefault(); switchNumpadTarget(); }
  else if (e.key === '-') { e.preventDefault(); numToggleSign(); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    if (panel === 'arith') hitungAritmatika();
    else if (panel === 'logic') hitungLogika();
  }
});

/* ===== HELPERS ===== */
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
async function apiPost(url, body) {
  const r = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  return r.json();
}
function showErr(msg) {
  const t = document.getElementById('errToast');
  t.textContent = '⚠ ' + msg;
  t.classList.remove('d-none');
  setTimeout(() => t.classList.add('d-none'), 3500);
}
function loading(btn, v) { v ? btn.classList.add('loading') : btn.classList.remove('loading'); }

function showResult(ids, data) {
  // ids: { empty, body, num, rumus, steps, extra }
  document.getElementById(ids.empty).classList.add('d-none');
  document.getElementById(ids.body).classList.remove('d-none');
  if (ids.num)   document.getElementById(ids.num).textContent = data.answer || '';
  if (ids.rumus) document.getElementById(ids.rumus).textContent = data.rumus || '';
  if (ids.steps) {
    document.getElementById(ids.steps).innerHTML =
      (data.langkah||[]).map(l=>`<div class="step-row">${esc(l)}</div>`).join('');
  }
}

/* ===== ARITMATIKA ===== */
async function hitungAritmatika() {
  const st = calcState.arith;
  const a = st.a;
  const b = st.b;
  const btn = document.querySelector('#tab-aritmatika .nk-keisan');
  if (!a || a === '-') return showErr('Nilai A harus diisi!');
  if (arithOp !== 'akar' && (!b || b === '-')) return showErr('Nilai B harus diisi! Pilih operator dulu lalu masukkan B.');
  if (btn) loading(btn, true);
  try {
    const d = await apiPost('/api/aritmatika', { operasi: arithOp, a: parseFloat(a), b: arithOp !== 'akar' ? parseFloat(b) : null });
    if (btn) loading(btn, false);
    if (d.error) return showErr(d.error);
    // show result on screen briefly
    const exprEl = document.getElementById('arith-expr');
    const subEl  = document.getElementById('arith-sub');
    if (exprEl) { exprEl.textContent = d.result; exprEl.classList.remove('entering-b'); }
    if (subEl)  subEl.textContent = d.rumus;
    showResult({ empty:'rce-arith', body:'rcb-arith', num:'rn-arith', rumus:'rf-arith', steps:'rs-arith' },
               { answer: d.result, rumus: d.rumus, langkah: d.langkah });
    // reset state for next calculation
    calcState.arith = { a: d.result, b: '', state: 'a' };
    loadHistory();
  } catch { if (btn) loading(btn, false); showErr('Gagal terhubung ke server.'); }
}

/* ===== LOGIKA ===== */
async function hitungLogika() {
  const st = calcState.logic;
  const a = st.a;
  const b = st.b;
  const btn = document.querySelector('#tab-logika .nk-keisan');
  if (!a || a==='-') return showErr('Nilai A harus diisi!');
  if (logicOp!=='NOT' && (!b||b==='-')) return showErr('Nilai B harus diisi! Pilih operator dulu lalu masukkan B.');
  if (btn) loading(btn,true);
  try {
    const d = await apiPost('/api/logika',{operasi:logicOp, a:parseInt(a), b:logicOp!=='NOT'?parseInt(b):null});
    if (btn) loading(btn,false);
    if (d.error) return showErr(d.error);
    const exprEl = document.getElementById('logic-expr');
    const subEl  = document.getElementById('logic-sub');
    if (exprEl) { exprEl.textContent = d.result; exprEl.classList.remove('entering-b'); }
    if (subEl)  subEl.textContent = d.rumus;
    showResult({empty:'rce-logic',body:'rcb-logic',num:'rn-logic',rumus:'rf-logic',steps:'rs-logic'},{answer:d.result,rumus:d.rumus,langkah:d.langkah});
    calcState.logic = { a: d.result, b: '', state: 'a' };
    loadHistory();
  } catch { if (btn) loading(btn,false); showErr('Gagal terhubung ke server.'); }
}

/* ===== BASIS ===== */
async function konversiBasis() {
  const nilai = document.getElementById('basis-nilai').value.trim();
  const dari  = document.getElementById('basis-dari').value;
  const ke    = document.getElementById('basis-ke').value;
  const btn   = document.querySelector('#sub-basis .btn-keisan');
  if (!nilai) return showErr('Nilai harus diisi!');
  loading(btn,true);
  try {
    const d = await apiPost('/api/konversi-basis',{nilai,dari,ke});
    loading(btn,false);
    if (d.error) return showErr(d.error);
    showResult({empty:'rce-basis',body:'rcb-basis',num:'rn-basis',steps:'rs-basis'},{answer:d.result,langkah:d.langkah});
    // basis grid
    const labels = {decimal:'デシマル (10)',binary:'バイナリ (2)',octal:'オクタル (8)',hexadecimal:'ヘックス (16)'};
    document.getElementById('rg-basis').innerHTML =
      Object.entries(d.semua).map(([k,v])=>`
        <div class="basis-cell">
          <div class="bc-label">${labels[k]}</div>
          <div class="bc-val">${esc(v)}</div>
        </div>`).join('');
    loadHistory();
  } catch { loading(btn,false); showErr('Gagal terhubung ke server.'); }
}

/* ===== SUHU ===== */