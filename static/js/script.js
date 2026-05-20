/* ===== AUTUMN LEAVES — Edinburgh ===== */
(function() {
  const layer = document.getElementById('sakuraLayer');
  const symbols = ['🍂','🍁','🍃','·','°'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = symbols[i % symbols.length];
    p.style.cssText = `
      left:${Math.random()*100}%;
      animation-duration:${10+Math.random()*14}s;
      animation-delay:${Math.random()*12}s;
      font-size:${10+Math.random()*10}px;
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

/* ===== NUMPAD SYSTEM — CALCULATOR STATE MACHINE ===== */
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
    if (op === 'akar' || op === 'NOT') {
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
  const panel = getCurrentPanel();
  if (!panel) return;
  const st = calcState[panel];
  const op = panel === 'arith' ? arithOp : logicOp;
  const isUnary = (panel === 'arith' && op === 'akar') || (panel === 'logic' && op === 'NOT');
  if (isUnary) return;
  st.state = st.state === 'a' ? 'b' : 'a';
  updateScreen(panel);
}

/* ===== COMBINED KEYBOARD SUPPORT ===== */
document.addEventListener('keydown', e => {
  const pane = document.querySelector('.tab-pane.active');
  if (!pane) return;

  // Standard calculator keyboard
  if (pane.id === 'tab-standar') {
    if (e.key >= '0' && e.key <= '9')  { e.preventDefault(); stdNum(e.key); }
    else if (e.key === '.')             { e.preventDefault(); stdNum('.'); }
    else if (e.key === '+')             { e.preventDefault(); stdOp('＋'); }
    else if (e.key === '-')             { e.preventDefault(); stdOp('－'); }
    else if (e.key === '*')             { e.preventDefault(); stdOp('×'); }
    else if (e.key === '/')             { e.preventDefault(); stdOp('÷'); }
    else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); stdEquals(); }
    else if (e.key === 'Backspace')     { e.preventDefault(); stdDelete(); }
    else if (e.key === 'Escape')        { e.preventDefault(); stdClearAll(); }
    else if (e.key === 'Delete')        { e.preventDefault(); stdClearEntry(); }
    else if (e.key === '%')             { e.preventDefault(); stdInput('percent'); }
    return;
  }

  // Aritmatika / Logika numpad keyboard
  const panel = getCurrentPanel();
  if (!panel) return;
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' && !document.activeElement.hidden) return;

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
function loading(btn, v) { if (btn) v ? btn.classList.add('loading') : btn.classList.remove('loading'); }

function showResult(ids, data) {
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
    const exprEl = document.getElementById('arith-expr');
    const subEl  = document.getElementById('arith-sub');
    if (exprEl) { exprEl.textContent = d.result; exprEl.classList.remove('entering-b'); }
    if (subEl)  subEl.textContent = d.rumus;
    showResult({ empty:'rce-arith', body:'rcb-arith', num:'rn-arith', rumus:'rf-arith', steps:'rs-arith' },
               { answer: d.result, rumus: d.rumus, langkah: d.langkah });
    calcState.arith = { a: d.result, b: '', state: 'a' };
    loadHistory();
  } catch(err) { if (btn) loading(btn, false); showErr('Gagal terhubung ke server.'); }
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
  } catch(err) { if (btn) loading(btn,false); showErr('Gagal terhubung ke server.'); }
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
    const labels = {decimal:'Decimal (10)',binary:'Binary (2)',octal:'Octal (8)',hexadecimal:'Hex (16)'};
    document.getElementById('rg-basis').innerHTML =
      Object.entries(d.semua).map(([k,v])=>`
        <div class="basis-cell">
          <div class="bc-label">${labels[k]}</div>
          <div class="bc-val">${esc(v)}</div>
        </div>`).join('');
    loadHistory();
  } catch(err) { loading(btn,false); showErr('Gagal terhubung ke server.'); }
}

/* ===== SUHU ===== */
async function konversiSuhu() {
  const nilai = document.getElementById('suhu-nilai').value;
  const dari  = document.getElementById('suhu-dari').value;
  const btn   = document.querySelector('#sub-suhu .btn-keisan');
  if (nilai==='') return showErr('Nilai suhu harus diisi!');
  loading(btn,true);
  try {
    const d = await apiPost('/api/konversi-suhu',{nilai:parseFloat(nilai),dari});
    loading(btn,false);
    if (d.error) return showErr(d.error);
    document.getElementById('rce-suhu').classList.add('d-none');
    document.getElementById('rcb-suhu').classList.remove('d-none');
    const items = [
      {label:'Celsius',key:'celsius',unit:'°C',emoji:'🌡'},
      {label:'Fahrenheit',key:'fahrenheit',unit:'°F',emoji:'🌡'},
      {label:'Kelvin',key:'kelvin',unit:' K',emoji:'🔬'},
      {label:'Reaumur',key:'reamur',unit:'°Ré',emoji:'🌡'},
    ];
    document.getElementById('rg-suhu').innerHTML = items.map(it=>`
      <div class="suhu-cell">
        <div class="sc-emoji">${it.emoji}</div>
        <div class="sc-label">${it.label}</div>
        <div class="sc-val">${d.result[it.key]}${it.unit}</div>
      </div>`).join('');
    document.getElementById('rs-suhu').innerHTML =
      (d.langkah||[]).map(l=>`<div class="step-row">${esc(l)}</div>`).join('');
    loadHistory();
  } catch(err) { loading(btn,false); showErr('Gagal terhubung ke server.'); }
}

/* ===== UANG ===== */
async function konversiUang() {
  const nilai = document.getElementById('uang-nilai').value;
  const dari  = document.getElementById('uang-dari').value;
  const ke    = document.getElementById('uang-ke').value;
  const btn   = document.querySelector('#sub-uang .btn-keisan');
  if (!nilai) return showErr('Jumlah harus diisi!');
  if (dari===ke) return showErr('Mata uang asal dan tujuan tidak boleh sama!');
  loading(btn,true);
  try {
    const d = await apiPost('/api/konversi-mata-uang',{nilai:parseFloat(nilai),dari,ke});
    loading(btn,false);
    if (d.error) return showErr(d.error);
    showResult({empty:'rce-uang',body:'rcb-uang',num:'rn-uang',steps:'rs-uang'},{answer:`${d.result} ${ke}`,langkah:d.langkah});
    loadHistory();
  } catch(err) { loading(btn,false); showErr('Gagal terhubung ke server.'); }
}

/* ===== FAKTORIAL ===== */
async function hitungFaktorial() {
  const n   = document.getElementById('fakt-n').value;
  const btn = document.querySelector('#tab-bonus .col-lg-6:first-child .btn-keisan');
  if (n==='') return showErr('Nilai n harus diisi!');
  loading(btn,true);
  try {
    const d = await apiPost('/api/faktorial',{n:parseInt(n)});
    loading(btn,false);
    if (d.error) return showErr(d.error);
    document.getElementById('ri-fakt').classList.remove('d-none');
    document.getElementById('rn-fakt').textContent = d.result;
    document.getElementById('rf-fakt').textContent = d.rumus;
    document.getElementById('rs-fakt').innerHTML = (d.langkah||[]).map(l=>`<div class="step-row">${esc(l)}</div>`).join('');
    loadHistory();
  } catch(err) { loading(btn,false); showErr('Gagal terhubung ke server.'); }
}

/* ===== FIBONACCI ===== */
async function hitungFibonacci() {
  const n   = document.getElementById('fib-n').value;
  const btn = document.querySelector('#tab-bonus .col-lg-6:last-child .btn-keisan');
  if (n==='') return showErr('Nilai n harus diisi!');
  loading(btn,true);
  try {
    const d = await apiPost('/api/fibonacci',{n:parseInt(n)});
    loading(btn,false);
    if (d.error) return showErr(d.error);
    document.getElementById('ri-fib').classList.remove('d-none');
    document.getElementById('rn-fib').textContent = `F(${n}) = ${d.result}`;
    document.getElementById('rc-fib-deret').innerHTML = d.deret.map((v,i)=>`
      <span class="fib-chip ${i===parseInt(n)?'hl':''}">${v}</span>`).join('');
    document.getElementById('rs-fib').innerHTML = (d.langkah||[]).map(l=>`<div class="step-row">${esc(l)}</div>`).join('');
    loadHistory();
  } catch(err) { loading(btn,false); showErr('Gagal terhubung ke server.'); }
}

/* ===== HISTORY ===== */
async function loadHistory() {
  try {
    const d = await fetch('/api/history').then(r=>r.json());
    const body = document.getElementById('historyBody');
    if (!d.history || !d.history.length) {
      body.innerHTML='<div class="empty-hist"><div class="empty-kana">Empty</div><p>Belum ada riwayat.</p></div>';
      return;
    }
    body.innerHTML = d.history.map(h=>`
      <div class="hist-item">
        <div class="hist-op">${esc(h.operasi)}</div>
        <div class="hist-res">= ${esc(h.hasil)}</div>
      </div>`).join('');
  } catch(err) {}
}
async function clearHistory() {
  await fetch('/clear-history',{method:'POST'});
  loadHistory();
}

/* ===== STANDARD CALCULATOR ===== */
const std = {
  display: '0',
  prev: null,
  op: null,
  waitingForNext: false,
  history: [],
  justCalc: false,
  lastOp: null,
  lastNum: null,
};

const stdOpMap = { '＋':'+', '－':'-', '×':'*', '÷':'/' };
const stdOpDisplay = { '+':'＋', '-':'－', '*':'×', '/':'÷' };

function stdUpdateScreen() {
  const expr = document.getElementById('std-expr');
  const sub  = document.getElementById('std-sub');
  if (!expr) return;
  expr.textContent = std.display;
  if (std.prev !== null && std.op) {
    sub.textContent = `${std.prev} ${stdOpDisplay[std.op]}`;
  } else {
    sub.textContent = '';
  }
}

function stdNum(digit) {
  if (std.waitingForNext) {
    std.display = digit === '.' ? '0.' : digit;
    std.waitingForNext = false;
  } else {
    if (digit === '.' && std.display.includes('.')) return;
    if (std.display === '0' && digit !== '.') std.display = digit;
    else std.display += digit;
  }
  std.justCalc = false;
  stdUpdateScreen();
}

function stdOp(opSymbol) {
  const op = stdOpMap[opSymbol];
  const current = parseFloat(std.display);

  if (std.prev !== null && !std.waitingForNext && std.op) {
    const result = stdCalculate(std.prev, current, std.op);
    std.display = stdFormat(result);
    std.prev = result;
  } else {
    std.prev = current;
  }

  std.op = op;
  std.waitingForNext = true;
  std.justCalc = false;

  document.querySelectorAll('#tab-standar .nk-op2').forEach(b => b.classList.remove('active-op'));
  document.querySelectorAll('#tab-standar .nk-op2').forEach(b => {
    if (b.textContent.trim() === opSymbol) b.classList.add('active-op');
  });

  stdUpdateScreen();
}

function stdEquals() {
  const current = parseFloat(std.display);
  if (std.op === null && std.lastOp === null) return;

  const b = std.waitingForNext ? (std.lastNum !== null ? std.lastNum : current) : current;
  const a = std.prev !== null ? std.prev : current;

  if (!std.waitingForNext) {
    std.lastNum = current;
    std.lastOp  = std.op;
  }

  const result = stdCalculate(a, b, std.op || std.lastOp);
  const exprStr = `${a} ${stdOpDisplay[std.op || std.lastOp]} ${b}`;
  stdAddHistory(exprStr, stdFormat(result));

  std.display = stdFormat(result);
  std.prev = result;
  std.waitingForNext = true;
  std.justCalc = true;

  document.querySelectorAll('#tab-standar .nk-op2').forEach(b => b.classList.remove('active-op'));

  const sub = document.getElementById('std-sub');
  if (sub) sub.textContent = `${exprStr} =`;
  const expr = document.getElementById('std-expr');
  if (expr) expr.textContent = std.display;
}

function stdCalculate(a, b, op) {
  a = parseFloat(a); b = parseFloat(b);
  switch(op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? (showErr('Tidak bisa dibagi nol!'), 0) : a / b;
    default: return b;
  }
}

function stdFormat(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  if (!Number.isInteger(n)) {
    n = parseFloat(n.toPrecision(12));
  }
  return String(n);
}

function stdInput(fn) {
  const current = parseFloat(std.display) || 0;
  let result;
  let exprStr;
  switch(fn) {
    case 'percent':
      result = current / 100;
      exprStr = `${current}%`;
      break;
    case 'sqrt':
      if (current < 0) return showErr('Akar dari bilangan negatif tidak valid!');
      result = Math.sqrt(current);
      exprStr = `√(${current})`;
      break;
    case 'square':
      result = current * current;
      exprStr = `${current}²`;
      break;
    case 'inverse':
      if (current === 0) return showErr('Tidak bisa 1/0!');
      result = 1 / current;
      exprStr = `1/(${current})`;
      break;
    default: return;
  }
  stdAddHistory(exprStr, stdFormat(result));
  std.display = stdFormat(result);
  std.prev = result;
  std.waitingForNext = true;
  document.getElementById('std-expr').textContent = std.display;
  document.getElementById('std-sub').textContent = exprStr + ' =';
}

function stdToggleSign() {
  if (std.display === '0') return;
  std.display = std.display.startsWith('-') ? std.display.slice(1) : '-' + std.display;
  stdUpdateScreen();
}

function stdDelete() {
  if (std.waitingForNext || std.display.length <= 1) {
    std.display = '0';
    std.waitingForNext = false;
  } else {
    std.display = std.display.slice(0, -1) || '0';
  }
  stdUpdateScreen();
}

function stdClearEntry() {
  std.display = '0';
  std.waitingForNext = false;
  stdUpdateScreen();
}

function stdClearAll() {
  std.display = '0';
  std.prev = null;
  std.op = null;
  std.waitingForNext = false;
  std.justCalc = false;
  std.lastNum = null;
  std.lastOp = null;
  document.querySelectorAll('#tab-standar .nk-op2').forEach(b => b.classList.remove('active-op'));
  stdUpdateScreen();
}

function stdAddHistory(expr, result) {
  std.history.unshift({ expr, result });
  if (std.history.length > 30) std.history.pop();
  stdRenderHistory();
}

function stdRenderHistory() {
  const list  = document.getElementById('std-hist-list');
  const count = document.getElementById('std-hist-count');
  if (!list) return;
  if (!std.history.length) {
    count.textContent = 'Belum ada perhitungan';
    list.innerHTML = '';
    return;
  }
  count.textContent = `${std.history.length} perhitungan`;
  list.innerHTML = std.history.map((h, i) => `
    <div class="std-hist-item" onclick="stdRecall(${i})">
      <div class="shi-expr">${esc(h.expr)}</div>
      <div class="shi-result">${esc(h.result)}</div>
    </div>
  `).join('');
}

function stdRecall(i) {
  const item = std.history[i];
  if (!item) return;
  std.display = item.result;
  std.prev = parseFloat(item.result);
  std.waitingForNext = true;
  stdUpdateScreen();
}

/* ===== INIT ===== */
loadHistory();
updateScreen('arith');
updateScreen('logic');
stdUpdateScreen();
