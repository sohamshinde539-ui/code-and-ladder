// Snake & Ladder with coding questions
(function () {
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  // Game elements
  const boardEl = document.getElementById('board');
  const overlayEl = document.getElementById('board-overlay');
  const positionEl = document.getElementById('position');
  const lastRollEl = document.getElementById('last-roll');
  const messageEl = document.getElementById('message');
  const rollBtn = document.getElementById('roll-btn');
  const resetBtn = document.getElementById('reset-btn');
  const diceEl = document.getElementById('dice');

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

  // Draw snakes and ladders overlay
  function squareCenter(n) {
    const i = n - 1;
    const rowBottom = Math.floor(i / 10);
    const col = (rowBottom % 2 === 0) ? (i % 10) : (9 - (i % 10));
    const x = (col + 0.5) * 10;           // percent
    const y = 100 - (rowBottom + 0.5) * 10; // percent from top
    return { x, y };
  }

  function drawOverlay() {
    if (!overlayEl) return;
    overlayEl.innerHTML = '';
    const svgNS = 'http://www.w3.org/2000/svg';

    // Ladders: straight lines
    Object.entries(ladders).forEach(([s, e]) => {
      const a = squareCenter(Number(s));
      const b = squareCenter(Number(e));
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', String(a.x));
      line.setAttribute('y1', String(a.y));
      line.setAttribute('x2', String(b.x));
      line.setAttribute('y2', String(b.y));
      line.setAttribute('stroke', 'var(--ladder)');
      line.setAttribute('stroke-width', '1.8');
      line.setAttribute('stroke-linecap', 'round');
      overlayEl.appendChild(line);
    });

    // Snakes: curved paths
    Object.entries(snakes).forEach(([s, e]) => {
      const a = squareCenter(Number(s));
      const b = squareCenter(Number(e));
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const cx = (a.x + b.x) / 2 - dy * 0.15; // perpendicular offset
      const cy = (a.y + b.y) / 2 + dx * 0.15;
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'var(--snake)');
      path.setAttribute('stroke-width', '2.2');
      path.setAttribute('stroke-linecap', 'round');
      overlayEl.appendChild(path);
    });
  }

  drawOverlay();
  window.addEventListener('resize', drawOverlay);

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

  async function rollDice() {
    if (!canRoll) return;
    canRoll = false;
    rollBtn?.setAttribute('disabled', 'true');

    const roll = Math.floor(Math.random() * 6) + 1;
    await animateDice(roll);
    lastRollEl.textContent = String(roll);

    let next = pos + roll;
    if (next > 100) {
      updateStatus(`Need exactly ${100 - pos} to finish.`);
      canRoll = true;
      rollBtn?.removeAttribute('disabled');
      return;
    }

    await moveTo(next);
    if (pos === 100) {
      updateStatus('You win!');
      rollBtn?.setAttribute('disabled', 'true');
      return;
    }

    // Ladder auto climb
    if (ladders[pos]) {
      const dest = ladders[pos];
      await moveTo(dest);
      updateStatus(`You climbed a ladder to ${dest}!`);
      canRoll = true;
      rollBtn?.removeAttribute('disabled');
      return;
    }

    // Snake: ask question
    if (snakes[pos]) {
      const correct = await askQuestion();
      if (correct) {
        updateStatus('Correct! You avoided the snake.');
      } else {
        const dest = snakes[pos];
        await moveTo(dest);
        updateStatus(`Wrong! You slid down the snake to ${dest}.`);
      }
    }

    canRoll = true;
    rollBtn?.removeAttribute('disabled');
  }

  function animateDice(final) {
    if (!diceEl) return Promise.resolve();
    diceEl.classList.add('rolling');
    let i = 0;
    const tick = setInterval(() => {
      diceEl.textContent = String(Math.floor(Math.random() * 6) + 1);
    }, 100);
    return new Promise(resolve => setTimeout(() => {
      clearInterval(tick);
      diceEl.classList.remove('rolling');
      diceEl.textContent = String(final);
      resolve();
    }, 700));
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
