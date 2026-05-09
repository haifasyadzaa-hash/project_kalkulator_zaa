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
