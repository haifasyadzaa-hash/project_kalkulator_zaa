// ── STATE ─────────────────────────────────────────────────────────────────
let arithState = {
  display: '0',
  expr: '',
  operand1: null,
  operator: null,
  waitingForOperand2: false,
  lastOp: null,
  lastVal: null,
};

let selectedLogicOp = 'AND';
let selectedTransform = 'base';
let history = JSON.parse(localStorage.getItem('calc-history') || '[]');

// ── THEME ─────────────────────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('calc-theme', html.dataset.theme);
}

// Terapkan tema yang tersimpan saat halaman dimuat
(function () {
  const savedTheme = localStorage.getItem('calc-theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
})();

// ── TABS ──────────────────────────────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
  if (name === 'history') renderHistory();
}

// ── ARITHMETIC ────────────────────────────────────────────────────────────
const s = arithState;

function updateArithDisplay() {
  const el = document.getElementById('arith-display');
  el.textContent = s.display;
  // Sesuaikan ukuran font berdasarkan panjang angka
  if (s.display.length > 10) {
    el.style.fontSize = '22px';
  } else if (s.display.length > 7) {
    el.style.fontSize = '28px';
  } else {
    el.style.fontSize = '36px';
  }
  document.getElementById('arith-expr').textContent = s.expr;
}

function arithInput(ch) {
  if (s.waitingForOperand2) {
    s.display = ch === '.' ? '0.' : ch;
    s.waitingForOperand2 = false;
  } else {
    if (ch === '.' && s.display.includes('.')) return;
    s.display = (s.display === '0' && ch !== '.') ? ch : s.display + ch;
  }
  updateArithDisplay();
}

function arithOp(op) {
  const current = parseFloat(s.display);
  if (s.operator && !s.waitingForOperand2) {
    calculate(current);
  } else {
    s.operand1 = current;
  }
  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷', '**': 'xʸ', '//': '÷₊' };
  s.expr = `${s.operand1} ${opSymbols[op] || op}`;
  s.operator = op;
  s.waitingForOperand2 = true;
  document.getElementById('arith-preview').textContent = '';
  updateArithDisplay();
}

async function calculate(b) {
  const op = s.operator;
  const a = s.operand1;
  if (!op) return;
  try {
    const res = await fetch('/api/arithmetic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a, b, op })
    });
    const data = await res.json();
    if (data.error) {
      s.display = 'Error';
      updateArithDisplay();
      return;
    }
    const val = data.result;
    const display = Number.isInteger(val)
      ? String(val)
      : parseFloat(val.toFixed(10)).toString();
    s.display = display;
    s.operand1 = val;
    s.lastVal = b;
    addHistory(data.formula, display, 'Aritmatika');
    document.getElementById('arith-preview').textContent = '= ' + display;
    updateArithDisplay();
    return data;
  } catch (e) {
    s.display = 'Error';
    updateArithDisplay();
  }
}

async function arithEquals() {
  const b = (s.lastOp === s.operator && s.waitingForOperand2)
    ? s.lastVal
    : parseFloat(s.display);
  s.lastOp = s.operator;
  await calculate(b);
  s.expr = '';
  s.operator = null;
  s.waitingForOperand2 = false;
  updateArithDisplay();
  // Animasi pop pada hasil
  const el = document.getElementById('arith-display');
  el.classList.add('pop');
  setTimeout(() => el.classList.remove('pop'), 200);
}

async function arithSpecial(action) {
  const val = parseFloat(s.display);
  if (action === 'clear') {
    s.display = '0';
    s.expr = '';
    s.operand1 = null;
    s.operator = null;
    s.waitingForOperand2 = false;
    document.getElementById('arith-preview').textContent = '';
  } else if (action === 'sign') {
    s.display = String(-val);
  } else if (action === 'back') {
    s.display = s.display.length > 1 ? s.display.slice(0, -1) : '0';
  } else if (action === 'sqrt') {
    s.operand1 = val;
    s.operator = 'sqrt';
    await calculate(0);
    s.operator = null;
    s.waitingForOperand2 = false;
    s.expr = '';
  } else if (action === '%') {
    s.expr = `${s.display} mod`;
    s.operand1 = val;
    s.operator = '%';
    s.waitingForOperand2 = true;
  }
  updateArithDisplay();
}
