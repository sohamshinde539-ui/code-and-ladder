// Snake & Ladder with coding questions
(function () {
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  // Game elements
  const boardEl = document.getElementById('board');
  const positionEl = document.getElementById('position');
  const lastRollEl = document.getElementById('last-roll');
  const messageEl = document.getElementById('message');
  const rollBtn = document.getElementById('roll-btn');
  const resetBtn = document.getElementById('reset-btn');

  const qModal = document.getElementById('question-modal');
  const qText = document.getElementById('q-text');
  const qChoices = document.getElementById('q-choices');
  const qCancel = document.getElementById('q-cancel');
  const modalBackdrop = document.getElementById('modal-backdrop');

  if (!boardEl) return; // not on game page

  // Snakes and ladders mapping
  // Keys are starts; values are ends
  const ladders = {
    4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 99
  };
  const snakes = {
    16: 6, 48: 30, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
  };

  // Simple coding questions (multiple-choice)
  const QUESTIONS = [
    { q: 'What is the time complexity of binary search?', choices: ['O(n)', 'O(log n)', 'O(n log n)'], answer: 1 },
    { q: 'Which keyword declares a constant in JavaScript?', choices: ['let', 'var', 'const'], answer: 2 },
    { q: 'HTTP status for "Not Found"?', choices: ['200', '301', '404'], answer: 2 },
    { q: 'Array method to add an item to the end?', choices: ['push', 'pop', 'shift'], answer: 0 },
    { q: 'Git command to upload local commits?', choices: ['git fetch', 'git push', 'git pull'], answer: 1 }
  ];

  // Build board: serpentine numbering 1..100 (bottom-left is 1)
  const SQUARES = 100;
  const squares = [];
  for (let row = 9; row >= 0; row--) {
    const isEvenRowFromBottom = ((9 - row) % 2 === 0);
    for (let col = 0; col < 10; col++) {
      const indexInRow = isEvenRowFromBottom ? col : (9 - col);
      const num = row * 10 + indexInRow + 1;
      const div = document.createElement('div');
      div.className = 'square';
      div.dataset.num = String(num);
      div.textContent = String(num);
      if (ladders[num]) div.classList.add('ladder');
      if (snakes[num]) div.classList.add('snake');
      boardEl.appendChild(div);
      squares[num] = div;
    }
  }

  let pos = 1;
  let canRoll = true;
  let token = document.createElement('div');
  token.className = 'token';
  squares[pos].appendChild(token);
  updateStatus();

  function updateStatus(msg) {
    positionEl.textContent = String(pos);
    if (msg) messageEl.textContent = msg; else messageEl.textContent = '';
  }

  function rollDice() {
    if (!canRoll) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    lastRollEl.textContent = String(roll);
    let next = pos + roll;
    if (next > 100) {
      updateStatus(`Need exactly ${100 - pos} to finish.`);
      return;
    }
    moveTo(next).then(() => {
      if (pos === 100) {
        updateStatus('You win!');
        canRoll = false;
        return;
      }
      // Ladder auto climb
      if (ladders[pos]) {
        const dest = ladders[pos];
        moveTo(dest).then(() => updateStatus(`You climbed a ladder to ${dest}!`));
        return;
      }
      // Snake: ask question
      if (snakes[pos]) {
        askQuestion().then(correct => {
          if (correct) {
            updateStatus('Correct! You avoided the snake.');
          } else {
            const dest = snakes[pos];
            moveTo(dest).then(() => updateStatus(`Wrong! You slid down the snake to ${dest}.`));
          }
        });
      }
    });
  }

  function moveTo(target) {
    return new Promise(resolve => {
      pos = target;
      squares[pos].appendChild(token);
      updateStatus();
      setTimeout(resolve, 200); // small delay for UX
    });
  }

  function askQuestion() {
    return new Promise(resolve => {
      const item = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      qText.textContent = item.q;
      qChoices.innerHTML = '';
      item.choices.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn choice-btn';
        btn.textContent = c;
        btn.addEventListener('click', () => {
          hideModal();
          resolve(idx === item.answer);
        });
        qChoices.appendChild(btn);
      });
      qCancel.onclick = () => { hideModal(); resolve(false); };
      showModal();
    });
  }

  function showModal() {
    qModal.hidden = false;
  }
  function hideModal() {
    qModal.hidden = true;
  }
  modalBackdrop?.addEventListener('click', hideModal);

  rollBtn?.addEventListener('click', rollDice);
  resetBtn?.addEventListener('click', () => {
    pos = 1;
    canRoll = true;
    lastRollEl.textContent = '-';
    squares[pos].appendChild(token);
    updateStatus('Game reset.');
  });
})();
