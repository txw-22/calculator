// script.js

// 계산기 상태 변수
let currentInput = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let calculationHistory = '';

// DOM 요소 참조 (타입 캐스팅은 브라우저 환경에서 안전한 접근을 위해 필요)
const display = document.getElementById('display');
const historyDisplay = document.getElementById('history-display');
const buttons = document.querySelector('.buttons');

// 화면 업데이트 함수
function updateDisplay() {
  if (display) {
    if (currentInput.length > 10 && currentInput !== 'Error') {
      // 긴 숫자는 지수 표기법 또는 소수점 제한으로 표시
      display.textContent = parseFloat(currentInput).toPrecision(10);
    } else {
      display.textContent = currentInput;
    }
  }
}

function updateHistoryDisplay() {
  if (historyDisplay) {
    historyDisplay.textContent = calculationHistory;
  }
}

// 연산자 이름을 기호로 변환
function getOperatorSymbol(op) {
  switch (op) {
    case 'add': return '+';
    case 'subtract': return '-';
    case 'multiply': return '×';
    case 'divide': return '÷';
    default: return '';
  }
}

// 숫자 버튼 처리
function inputDigit(digit) {
  if (waitingForSecondOperand === true) {
    currentInput = digit;
    waitingForSecondOperand = false;
  } else {
    currentInput = currentInput === '0' || currentInput === 'Error' ? digit : currentInput + digit;
  }
  updateDisplay();
}

// 소수점 처리
function inputDecimal(dot) {
  if (waitingForSecondOperand === true) {
    currentInput = '0.';
    waitingForSecondOperand = false;
    updateDisplay();
    return;
  }
  if (!currentInput.includes(dot) && currentInput !== 'Error') {
    currentInput += dot;
  }
  updateDisplay();
}

// AC (초기화) 처리
function resetCalculator() {
  currentInput = '0';
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  calculationHistory = '';
  updateHistoryDisplay();
  updateDisplay();
}

// 실제 사칙연산 함수
function calculate(first, second, op) {
  switch (op) {
    case 'add':
      return first + second;
    case 'subtract':
      return first - second;
    case 'multiply':
      return first * second;
    case 'divide':
      if (second === 0) {
        return 'Error'; // 0으로 나누기 오류 처리
      }
      return first / second;
    default:
      return second;
  }
}

// 연산 로직
function performCalculation(nextOperator) {
  const inputValue = parseFloat(currentInput);

  if (currentInput === 'Error') {
    resetCalculator();
    return;
  }

  if (operator && waitingForSecondOperand) {
    // 연산자를 연속으로 누르면 새 연산자로만 변경
    operator = nextOperator;
    const opSymbol = getOperatorSymbol(operator);
    calculationHistory = String(firstOperand) + ' ' + opSymbol;
    updateHistoryDisplay();
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (operator) {
    // 이전 연산 수행
    const result = calculate(firstOperand, inputValue, operator);

    currentInput = String(result);
    firstOperand = result;
  }

  // 다음 상태 설정
  waitingForSecondOperand = true;

  if (nextOperator === 'equals') {
    operator = null;
    calculationHistory = ''; // '='이면 히스토리 비움
  } else {
    operator = nextOperator;
    // 히스토리 업데이트: (현재까지의 결과) + (새 연산자 기호)
    const operatorSymbol = getOperatorSymbol(operator);
    calculationHistory = String(firstOperand) + ' ' + operatorSymbol;
  }

  updateHistoryDisplay();
  updateDisplay();
}

// --- 마우스 클릭 이벤트 리스너 ---
if (buttons) {
  buttons.addEventListener('click', (event) => {
    const target = event.target;
    // 버튼이 아니거나, data-num, data-op, data-type 속성이 없으면 무시
    if (!target.matches('button')) {
      return;
    }

    const { type, num, op } = target.dataset;

    if (type === 'clear') {
      resetCalculator();
      return;
    }

    if (op) {
      // +/- 와 % 는 바로 적용 (단항 연산)
      if (op === 'neg') {
        if (currentInput !== 'Error') {
          currentInput = String(parseFloat(currentInput) * -1);
          updateDisplay();
        }
        return;
      }
      if (op === 'percent') {
        if (currentInput !== 'Error') {
          currentInput = String(parseFloat(currentInput) / 100);
          updateDisplay();
        }
        return;
      }
      performCalculation(op);
      return;
    }

    if (num) {
      if (num === '.') {
        inputDecimal(num);
      } else {
        inputDigit(num);
      }
      return;
    }
  });
}

// --- 키보드 이벤트 리스너 ---
document.addEventListener('keydown', (event) => {
  const key = event.key;

  // 1. 숫자 및 소수점 처리
  if (key >= '0' && key <= '9') {
    event.preventDefault();
    inputDigit(key);
  } else if (key === '.') {
    event.preventDefault();
    inputDecimal(key);
  }

  // 2. 연산자 처리
  else if (key === '+' || key === '-' || key === '*' || key === '/') {
    event.preventDefault();
    let op;
    switch (key) {
      case '+':
        op = 'add';
        break;
      case '-':
        op = 'subtract';
        break;
      case '*':
        op = 'multiply';
        break;
      case '/':
        op = 'divide';
        break;
    }
    performCalculation(op);
  }

  // 3. 등호 및 Enter 처리
  else if (key === '=' || key === 'Enter') {
    event.preventDefault();
    performCalculation('equals');
  }

  // 4. 초기화 (AC)
  else if (key === 'Delete' || key === 'c' || key === 'C') {
    event.preventDefault();
    resetCalculator();
  }

  // 5. 한 글자 지우기 (Backspace)
  else if (key === 'Backspace') {
    event.preventDefault();
    if (currentInput.length > 1 && currentInput !== 'Error' && !waitingForSecondOperand) {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = '0';
    }
    updateDisplay();
  }
});

// 초기 화면 표시
updateDisplay();
updateHistoryDisplay();