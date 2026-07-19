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
const saveBtn = document.getElementById('save-btn');

const countdownEl = document.getElementById('countdown');
const weeksCountEl = document.getElementById('weeks-count');
const eventTitleEl = document.getElementById('event-title');
const targetDateDisplay = document.getElementById('target-date-display');
const currentDateDisplay = document.getElementById('current-date-display');
const quoteEl = document.getElementById('quote');

const editBtn = document.getElementById('edit-btn');
const resetBtn = document.getElementById('reset-btn');

const editEventName = document.getElementById('edit-event-name');
const editTargetDate = document.getElementById('edit-target-date');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const celebrationText = document.getElementById('celebration-text');
const celebrationEvent = document.getElementById('celebration-event');

const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

let confettiParticles = [];
let animationId = null;

function init() {
  const today = new Date().toISOString().split('T')[0];
  targetDateInput.setAttribute('min', today);

  chrome.storage.local.get(['eventName', 'targetDate', 'createdAt'], (result) => {
    if (result.eventName && result.targetDate) {
      showDashboard(result.eventName, result.targetDate, result.createdAt);
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

function showDashboard(eventName, targetDate, createdAt) {
  setupScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  celebration.classList.add('hidden');

  updateDashboard(eventName, targetDate, createdAt);
}

function updateDashboard(eventName, targetDate, createdAt) {
  const today = new Date();
  const target = parseDateInput(targetDate);
  const created = parseDateInput(createdAt);

  const diffDays = getDaysLeft(targetDate, today);
  const weeksLeft = getWeeksLeft(targetDate, today);

  eventTitleEl.textContent = eventName;
  targetDateDisplay.textContent = formatDate(targetDate);
  currentDateDisplay.textContent = formatDate(getLocalDateString(today));

  if (diffDays <= 0) {
    showCelebration(eventName);
    return;
  }

  countdownEl.textContent = diffDays;
  weeksCountEl.textContent = formatWeeksLeft(weeksLeft);
  if (quoteEl) {
    quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  }
 
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
    createdAt: today
  }, () => {
    showDashboard(eventName, targetDate, today);
  });
});

editBtn.addEventListener('click', () => {
  chrome.storage.local.get(['eventName', 'targetDate'], (result) => {
    editEventName.value = result.eventName;
    editTargetDate.value = result.targetDate;
    editModal.classList.remove('hidden');
  });
});

saveEditBtn.addEventListener('click', () => {
  const eventName = editEventName.value.trim();
  const targetDate = editTargetDate.value;

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
      createdAt: result.createdAt || today
    }, () => {
      editModal.classList.add('hidden');
      showDashboard(eventName, targetDate, result.createdAt || today);
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