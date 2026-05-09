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