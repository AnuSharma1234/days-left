const quotes = [
  "The future belongs to those who believe in the beauty of their dreams.",
  "Every day is a new opportunity to grow closer to your goal.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your limit is not the deadline — it's just a milestone.",
  "The countdown is on, and every moment counts.",
  "Dream big, work hard, stay focused.",
  "Time is your most valuable resource — use it wisely.",
  "Great things never come from comfort zones.",
  "Keep going. You're closer than you think.",
  "The only way to do great work is to love what you do."
];

const setupScreen = document.getElementById('setup-screen');
const dashboard = document.getElementById('dashboard');
const celebration = document.getElementById('celebration');
const editModal = document.getElementById('edit-modal');

const eventNameInput = document.getElementById('event-name');
const targetDateInput = document.getElementById('target-date');
const githubUsernameInput = document.getElementById('github-username');
const saveBtn = document.getElementById('save-btn');

const countdownEl = document.getElementById('countdown');
const weeksCountEl = document.getElementById('weeks-count');
const eventTitleEl = document.getElementById('event-title');
const targetDateDisplay = document.getElementById('target-date-display');
const currentDateDisplay = document.getElementById('current-date-display');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const quoteEl = document.getElementById('quote');

const editBtn = document.getElementById('edit-btn');
const resetBtn = document.getElementById('reset-btn');

const editEventName = document.getElementById('edit-event-name');
const editTargetDate = document.getElementById('edit-target-date');
const editGithubUsername = document.getElementById('edit-github-username');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const githubWidget = document.getElementById('github-widget');
const githubUsernameDisplay = document.getElementById('github-username-display');
const githubGraph = document.getElementById('github-graph');
const githubLink = document.getElementById('github-link');

const celebrationText = document.getElementById('celebration-text');
const celebrationEvent = document.getElementById('celebration-event');

const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

let confettiParticles = [];
let animationId = null;

function init() {
  const today = new Date().toISOString().split('T')[0];
  targetDateInput.setAttribute('min', today);

  chrome.storage.local.get(['eventName', 'targetDate', 'createdAt', 'githubUsername'], (result) => {
    if (result.eventName && result.targetDate) {
      showDashboard(result.eventName, result.targetDate, result.createdAt, result.githubUsername);
    } else {
      showSetup();
    }
  });
}

function showSetup() {
  setupScreen.classList.remove('hidden');
  dashboard.classList.add('hidden');
  celebration.classList.add('hidden');
}

function showDashboard(eventName, targetDate, createdAt, githubUsername) {
  setupScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  celebration.classList.add('hidden');

  updateDashboard(eventName, targetDate, createdAt);
  updateGithubWidget(githubUsername);
}

function updateGithubWidget(githubUsername) {
  const contributionsContainer = document.getElementById('github-contributions');
  if (githubUsername && githubUsername.trim()) {
    const username = githubUsername.trim();
    githubUsernameDisplay.textContent = username;
    githubWidget.classList.add('visible');
    
    const graphSVG = generateContributionGraph();
    contributionsContainer.innerHTML = `
      <div class="github-graph-container">
        ${graphSVG}
        <div class="github-profile-card">
          <div class="github-avatar">
            <svg viewBox="0 0 16 16" fill="currentColor" width="32" height="32">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>
          <div class="github-username-text">@${username}</div>
        </div>
      </div>
    `;
    
    document.getElementById('github-link').href = `https://github.com/${username}`;
  } else {
    githubWidget.classList.remove('visible');
  }
}

function generateContributionGraph() {
  const weeks = 26;
  const days = 7;
  const cellSize = 10;
  const cellGap = 2;
  
  let svg = `<svg width="${weeks * (cellSize + cellGap)}" height="${days * (cellSize + cellGap)}" viewBox="0 0 ${weeks * (cellSize + cellGap)} ${days * (cellSize + cellGap)}" xmlns="http://www.w3.org/2000/svg">`;
  
  const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  
  const seed = 12345;
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const x = w * (cellSize + cellGap);
      const y = d * (cellSize + cellGap);
      const pseudoRandom = Math.sin(seed + w * 7 + d * 13) * 10000;
      const level = Math.floor((pseudoRandom - Math.floor(pseudoRandom)) * 5);
      svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colors[level]}" rx="2"/>`;
    }
  }
  
  svg += '</svg>';
  return svg;
}

function updateDashboard(eventName, targetDate, createdAt) {
  const today = new Date();
  const target = new Date(targetDate);
  const created = new Date(createdAt);

  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  eventTitleEl.textContent = eventName;
  targetDateDisplay.textContent = formatDate(targetDate);
  currentDateDisplay.textContent = formatDate(today.toISOString().split('T')[0]);

  if (diffDays <= 0) {
    showCelebration(eventName);
    return;
  }

  countdownEl.textContent = diffDays;
  weeksCountEl.textContent = Math.max(0, Math.floor(diffDays / 7));
  if (quoteEl) {
    quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  }

  const totalDays = (target - created) / (1000 * 60 * 60 * 24);
  const elapsedDays = (today - created) / (1000 * 60 * 60 * 24);
  const progressPercent = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  progressFill.style.width = `${progressPercent}%`;
  progressText.textContent = `${Math.round(progressPercent)}% elapsed`;
}

function showCelebration(eventName) {
  dashboard.classList.add('hidden');
  celebration.classList.remove('hidden');
  celebrationText.textContent = "Target Reached!";
  celebrationEvent.textContent = eventName;
  startConfetti();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

saveBtn.addEventListener('click', () => {
  const eventName = eventNameInput.value.trim();
  const targetDate = targetDateInput.value;
  const githubUsername = githubUsernameInput.value.trim();

  if (!eventName || !targetDate) {
    alert('Please fill in both fields');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  if (targetDate < today) {
    alert('Target date must be today or in the future');
    return;
  }

  chrome.storage.local.set({
    eventName: eventName,
    targetDate: targetDate,
    createdAt: today,
    githubUsername: githubUsername
  }, () => {
    showDashboard(eventName, targetDate, today, githubUsername);
  });
});

editBtn.addEventListener('click', () => {
  chrome.storage.local.get(['eventName', 'targetDate', 'githubUsername'], (result) => {
    editEventName.value = result.eventName;
    editTargetDate.value = result.targetDate;
    editGithubUsername.value = result.githubUsername || '';
    editModal.classList.remove('hidden');
  });
});

saveEditBtn.addEventListener('click', () => {
  const eventName = editEventName.value.trim();
  const targetDate = editTargetDate.value;
  const githubUsername = editGithubUsername.value.trim();

  if (!eventName || !targetDate) {
    alert('Please fill in both fields');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  if (targetDate < today) {
    alert('Target date must be today or in the future');
    return;
  }

  chrome.storage.local.get(['createdAt'], (result) => {
    chrome.storage.local.set({
      eventName: eventName,
      targetDate: targetDate,
      createdAt: result.createdAt || today,
      githubUsername: githubUsername
    }, () => {
      editModal.classList.add('hidden');
      showDashboard(eventName, targetDate, result.createdAt || today, githubUsername);
    });
  });
});

cancelEditBtn.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

resetBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset? This will delete your current target.')) {
    chrome.storage.local.clear(() => {
      stopConfetti();
      showSetup();
      eventNameInput.value = '';
      targetDateInput.value = '';
      githubUsernameInput.value = '';
    });
  }
});

function startConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  confettiParticles = [];
  const colors = ['#ffffff', '#22c55e', '#f59e0b', '#ef4444', '#888888'];

  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5
    });
  }

  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach(p => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;

    if (p.y > confettiCanvas.height) {
      p.y = -20;
      p.x = Math.random() * confettiCanvas.width;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
    ctx.restore();
  });

  animationId = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

init();