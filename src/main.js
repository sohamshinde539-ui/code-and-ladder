// Basic interactivity for Code & Ladder
(function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  // Example static ladder data
  const ladders = [
    { title: 'Algorithm Basics', desc: 'Warm-up problems: arrays, strings, hashing.' },
    { title: 'Data Structures I', desc: 'Stacks, queues, linked lists, and trees.' },
    { title: 'Dynamic Programming Intro', desc: 'Classic subproblems and tabulation.' }
  ];

  const list = document.getElementById('ladder-list');
  if (list) {
    ladders.forEach(l => {
      const li = document.createElement('li');
      li.innerHTML = `<h4>${l.title}</h4><p>${l.desc}</p>`;
      list.appendChild(li);
    });
  }
})();
