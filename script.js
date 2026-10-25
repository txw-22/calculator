// ========================================
// Warm Glass Calculator
// Vanilla JavaScript
// ========================================


// ===== 01. 계산기 상태 =====

let currentInput = '0';

let firstOperand = null;

let operator = null;

let waitingForSecondOperand = false;

let justCalculated = false;

let calculationHistory = '';


// ===== 02. DOM 요소 =====

const display = document.getElementById('display');

const historyDisplay = document.getElementById('history-display');

const buttons = document.querySelector('.buttons');

const soundToggle = document.getElementById('sound-toggle');

const soundIcon = document.getElementById('sound-icon');


// ===== 03. 사운드 설정 =====

// 기본값은 OFF
let soundEnabled = false;

try {
  soundEnabled =
    localStorage.getItem('calculator-sound') === 'on';
} catch (error) {
  console.warn('사운드 설정을 불러올 수 없습니다.', error);
}

let audioContext = null;


// ===== 04. 화면 업데이트 =====

function updateDisplay() {
  if (!display) return;

  display.textContent = currentInput;

  // 긴 숫자에 맞게 글자 크기 조절
  display.classList.toggle(
    'is-long',
    currentInput.length > 9
  );

  display.classList.toggle(
    'is-very-long',
    currentInput.length > 13
  );

  // 숫자가 길어져도 마지막 숫자가 보이도록 처리
  display.scrollLeft = display.scrollWidth;
}


function updateHistoryDisplay() {
  if (!historyDisplay) return;

  historyDisplay.textContent = calculationHistory;

  historyDisplay.scrollLeft = historyDisplay.scrollWidth;
}


// ===== 05. 연산자 기호 =====

function getOperatorSymbol(op) {
  switch (op) {
    case 'add':
      return '+';

    case 'subtract':
      return '−';

    case 'multiply':
      return '×';

    case 'divide':
      return '÷';

    default:
      return '';
  }
}


// ===== 06. 계산기 초기화 =====

function resetCalculator() {
  currentInput = '0';

  firstOperand = null;

  operator = null;

  waitingForSecondOperand = false;

  justCalculated = false;

  calculationHistory = '';

  updateDisplay();

  updateHistoryDisplay();
}


// ===== 07. 계산 오류 처리 =====

function setCalculationError() {
  currentInput = 'Error';

  firstOperand = null;

  operator = null;

  waitingForSecondOperand = true;

  justCalculated = true;

  calculationHistory = '';

  updateDisplay();

  updateHistoryDisplay();
}


// ===== 08. 숫자 입력 =====

function inputDigit(digit) {

  // 오류 상태에서는 새로운 계산 시작
  if (currentInput === 'Error') {
    resetCalculator();
  }

  if (waitingForSecondOperand) {

    // 이전 계산이 끝난 경우 새로운 입력 시작
    if (justCalculated) {
      firstOperand = null;

      operator = null;

      calculationHistory = '';

      updateHistoryDisplay();
    }

    currentInput = digit;

    waitingForSecondOperand = false;

    justCalculated = false;

  } else {

    if (currentInput === '0') {
      currentInput = digit;
    } else {
      currentInput += digit;
    }

  }

  updateDisplay();
}


// ===== 09. 소수점 입력 =====

function inputDecimal() {

  if (currentInput === 'Error') {
    resetCalculator();
  }

  // 새로운 입력 시작
  if (waitingForSecondOperand) {

    if (justCalculated) {
      firstOperand = null;

      operator = null;

      calculationHistory = '';

      updateHistoryDisplay();
    }

    currentInput = '0.';

    waitingForSecondOperand = false;

    justCalculated = false;

    updateDisplay();

    return;
  }

  // 소수점 중복 방지
  if (!currentInput.includes('.')) {
    currentInput += '.';
  }

  updateDisplay();
}


// ===== 10. 사칙연산 계산 =====

function calculate(first, second, op) {

  let result;

  switch (op) {

    case 'add':
      result = first + second;
      break;

    case 'subtract':
      result = first - second;
      break;

    case 'multiply':
      result = first * second;
      break;

    case 'divide':

      if (second === 0) {
        return 'Error';
      }

      result = first / second;
      break;

    default:
      return second;
  }

  // 무한대 등 계산 불가능한 결과 처리
  if (!Number.isFinite(result)) {
    return 'Error';
  }

  // 일반적인 계산의 부동소수점 오차 완화
  return Number(result.toPrecision(12));
}


// ===== 11. 계산 실행 =====

function performCalculation(nextOperator) {

  if (currentInput === 'Error') {
    resetCalculator();
    return;
  }

  const inputValue = Number(currentInput);

  if (!Number.isFinite(inputValue)) {
    setCalculationError();
    return;
  }

  // 연산자를 연속으로 누르면 마지막 연산자로 변경
  if (operator && waitingForSecondOperand) {

    if (nextOperator !== 'equals') {

      operator = nextOperator;

      calculationHistory =
        String(firstOperand) +
        ' ' +
        getOperatorSymbol(operator);

      updateHistoryDisplay();

      return;
    }

    // 두 번째 피연산자가 없으면 첫 번째 값으로 계산
    waitingForSecondOperand = false;

    currentInput = String(firstOperand);
  }

  const secondOperand = Number(currentInput);

  const previousFirstOperand = firstOperand;

  const previousOperator = operator;

  let result = secondOperand;

  if (firstOperand === null) {

    firstOperand = secondOperand;

  } else if (operator) {

    result = calculate(
      firstOperand,
      secondOperand,
      operator
    );

    if (result === 'Error') {
      setCalculationError();
      return;
    }

    currentInput = String(result);

    firstOperand = result;
  }

  // 등호를 누른 경우
  if (nextOperator === 'equals') {

    if (previousOperator && previousFirstOperand !== null) {

      calculationHistory =
        String(previousFirstOperand) +
        ' ' +
        getOperatorSymbol(previousOperator) +
        ' ' +
        String(secondOperand) +
        ' =';

    } else {

      calculationHistory = '';

    }

    firstOperand = null;

    operator = null;

    waitingForSecondOperand = true;

    justCalculated = true;

  } else {

    operator = nextOperator;

    waitingForSecondOperand = true;

    justCalculated = false;

    calculationHistory =
      String(firstOperand) +
      ' ' +
      getOperatorSymbol(operator);
  }

  updateDisplay();

  updateHistoryDisplay();
}


// ===== 12. 부호 변경 =====

function toggleSign() {

  if (currentInput === 'Error') return;

  const value = Number(currentInput);

  if (value === 0) {
    currentInput = '0';
  } else {
    currentInput = String(-value);
  }

  updateDisplay();
}


// ===== 13. 백분율 =====

function applyPercent() {

  if (currentInput === 'Error') return;

  const value = Number(currentInput);

  const result = value / 100;

  if (!Number.isFinite(result)) {
    setCalculationError();
    return;
  }

  currentInput = String(
    Number(result.toPrecision(12))
  );

  updateDisplay();
}


// ===== 14. 한 글자 삭제 =====

function deleteLastDigit() {

  if (currentInput === 'Error') {
    resetCalculator();
    return;
  }

  // 연산자가 선택된 상태에서는 입력값을 유지
  if (waitingForSecondOperand && operator) {
    return;
  }

  // 계산 직후 삭제를 누르면 입력값 초기화
  if (justCalculated) {
    resetCalculator();
    return;
  }

  if (currentInput.length <= 1) {
    currentInput = '0';

  } else {

    currentInput = currentInput.slice(0, -1);

    if (
      currentInput === '-' ||
      currentInput === ''
    ) {
      currentInput = '0';
    }
  }

  updateDisplay();
}


// ========================================
// Soft Click Sound
// Web Audio API
// ========================================


// ===== 15. 사운드 버튼 상태 =====

function updateSoundToggleUI() {

  if (!soundToggle || !soundIcon) return;

  soundIcon.textContent =
    soundEnabled ? '🔊' : '🔇';

  soundToggle.setAttribute(
    'aria-pressed',
    String(soundEnabled)
  );

  soundToggle.setAttribute(
    'aria-label',
    soundEnabled
      ? '키패드 소리 끄기'
      : '키패드 소리 켜기'
  );

  soundToggle.title =
    soundEnabled
      ? '키패드 소리 끄기'
      : '키패드 소리 켜기';
}


// ===== 16. 오디오 초기화 =====

function ensureAudioContext() {

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch((error) => {
      console.warn(
        '오디오 재생을 시작하지 못했습니다.',
        error
      );
    });
  }

  return audioContext;
}


// ===== 17. Soft Click 효과음 =====

function playClickSound(type = 'number') {

  if (!soundEnabled) return;

  try {

    const context = ensureAudioContext();

    if (!context) return;

    const now = context.currentTime;

    // 버튼 종류별 미세한 소리 차이
    const soundPresets = {

      number: {
        start: 480,
        end: 290,
        volume: 0.035,
        duration: 0.045
      },

      operator: {
        start: 560,
        end: 330,
        volume: 0.04,
        duration: 0.055
      },

      equals: {
        start: 650,
        end: 370,
        volume: 0.045,
        duration: 0.065
      },

      clear: {
        start: 400,
        end: 240,
        volume: 0.035,
        duration: 0.055
      }

    };

    const preset =
      soundPresets[type] ||
      soundPresets.number;

    // 짧은 전자음 생성
    const oscillator = context.createOscillator();

    const gainNode = context.createGain();

    const filter = context.createBiquadFilter();

    oscillator.type = 'triangle';

    oscillator.frequency.setValueAtTime(
      preset.start,
      now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      preset.end,
      now + preset.duration
    );

    // 소리를 부드럽게 만들기
    filter.type = 'lowpass';

    filter.frequency.setValueAtTime(
      1400,
      now
    );

    // 클릭 시 빠르게 올라갔다가 사라지는 볼륨
    gainNode.gain.setValueAtTime(
      0.0001,
      now
    );

    gainNode.gain.exponentialRampToValueAtTime(
      preset.volume,
      now + 0.004
    );

    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      now + preset.duration
    );

    // 오디오 연결
    oscillator.connect(filter);

    filter.connect(gainNode);

    gainNode.connect(context.destination);

    oscillator.start(now);

    oscillator.stop(
      now + preset.duration + 0.01
    );

    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    };

  } catch (error) {

    console.warn(
      '효과음을 재생할 수 없습니다.',
      error
    );

  }
}


// ===== 18. 사운드 ON/OFF =====

function toggleSound() {

  soundEnabled = !soundEnabled;

  try {

    localStorage.setItem(
      'calculator-sound',
      soundEnabled ? 'on' : 'off'
    );

  } catch (error) {

    console.warn(
      '사운드 설정을 저장할 수 없습니다.',
      error
    );

  }

  updateSoundToggleUI();

  // 사운드를 켤 때 미리 듣기
  if (soundEnabled) {
    playClickSound('number');
  }
}


// ========================================
// Event Listeners
// ========================================


// ===== 19. 사운드 버튼 클릭 =====

if (soundToggle) {

  soundToggle.addEventListener(
    'click',
    toggleSound
  );

}


// ===== 20. 계산기 버튼 클릭 =====

if (buttons) {

  buttons.addEventListener('click', (event) => {

    const target = event.target.closest('button');

    if (!target || !buttons.contains(target)) {
      return;
    }

    const {
      type,
      num,
      op
    } = target.dataset;


    // AC
    if (type === 'clear') {

      playClickSound('clear');

      resetCalculator();

      return;
    }


    // 연산 및 특수 기능
    if (op) {

      if (op === 'neg') {

        playClickSound('operator');

        toggleSign();

        return;
      }

      if (op === 'percent') {

        playClickSound('operator');

        applyPercent();

        return;
      }

      playClickSound(
        op === 'equals'
          ? 'equals'
          : 'operator'
      );

      performCalculation(op);

      return;
    }


    // 숫자 및 소수점
    if (num !== undefined) {

      playClickSound('number');

      if (num === '.') {

        inputDecimal();

      } else {

        inputDigit(num);

      }

    }

  });

}


// ===== 21. 키보드 입력 =====

document.addEventListener('keydown', (event) => {

  // Ctrl, Alt, Meta 조합은 브라우저에 맡김
  if (
    event.ctrlKey ||
    event.altKey ||
    event.metaKey
  ) {
    return;
  }

  const key = event.key;


  // 숫자 입력
  if (/^[0-9]$/.test(key)) {

    event.preventDefault();

    playClickSound('number');

    inputDigit(key);

    return;
  }


  // 소수점
  if (key === '.') {

    event.preventDefault();

    playClickSound('number');

    inputDecimal();

    return;
  }


  // 사칙연산
  const operatorKeys = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide'
  };

  if (operatorKeys[key]) {

    event.preventDefault();

    playClickSound('operator');

    performCalculation(
      operatorKeys[key]
    );

    return;
  }


  // 계산 실행
  if (
    key === '=' ||
    key === 'Enter'
  ) {

    event.preventDefault();

    playClickSound('equals');

    performCalculation('equals');

    return;
  }


  // 초기화
  if (
    key === 'Escape' ||
    key === 'Delete' ||
    key === 'c' ||
    key === 'C'
  ) {

    event.preventDefault();

    playClickSound('clear');

    resetCalculator();

    return;
  }


  // 한 글자 삭제
  if (key === 'Backspace') {

    event.preventDefault();

    playClickSound('number');

    deleteLastDigit();

    return;
  }


  // 백분율
  if (key === '%') {

    event.preventDefault();

    playClickSound('operator');

    applyPercent();

    return;
  }

});


// ===== 22. 초기 화면 =====

updateDisplay();

updateHistoryDisplay();

updateSoundToggleUI();