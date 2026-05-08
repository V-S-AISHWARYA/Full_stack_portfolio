'use strict';

const root = document.documentElement;
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
setTheme(savedTheme, true);

function setTheme(theme, init = false) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);

  // Sync intro buttons
  document.querySelectorAll('.intro-theme-btn').forEach(btn => btn.classList.remove('active'));
  const target = document.getElementById(theme === 'dark' ? 'btnDark' : 'btnLight');
  if (target) target.classList.add('active');

  if (!init) showToast(`${theme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated`);
}

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ─── CURSOR ──────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.transform = `translate(${mx - 5}px,${my - 5}px)`;
});

(function animRing() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  cursorRing.style.transform = `translate(${rx - 17}px,${ry - 17}px)`;
  requestAnimationFrame(animRing);
})();

function addHoverables() {
  document.querySelectorAll('a, button, .mood-btn, .skill-tag, .project-item, .contact-link-item, .resume-bar, .intro-theme-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('big'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('big'));
  });
}

// ─── TOAST ───────────────────────────────────────────────────
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ─── PAGE ROUTING ─────────────────────────────────────────────
let currentPage = 'intro';
const transition = document.getElementById('pageTransition');
const pageLoaded = {};

function showPage(id) {
  if (id === currentPage) return;
  transition.className = 'page-transition in';

  setTimeout(() => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(id);
    if (page) page.classList.add('active');
    window.scrollTo(0, 0);
    currentPage = id;

    // Load data for page on first visit
    if (!pageLoaded[id]) {
      pageLoaded[id] = true;
      if (id === 'about') { loadSkills(); loadStats(); }
      if (id === 'work')  loadProjects();
    }

    // Trigger entrance animations
    if (id === 'intro') runIntroAnim();
    if (id === 'work')  setTimeout(triggerProjectAnim, 200);

    // Flip transition out
    requestAnimationFrame(() => requestAnimationFrame(() => {
      transition.className = 'page-transition out';
      setTimeout(() => { transition.className = 'page-transition'; }, 500);
    }));

    addHoverables();
  }, 420);
}

// Nav & button delegation
document.addEventListener('click', e => {
  const el = e.target.closest('[data-page]');
  if (el) { e.preventDefault(); showPage(el.getAttribute('data-page')); }
});

// ─── INTRO ANIMATIONS ────────────────────────────────────────
function runIntroAnim() {
  document.querySelectorAll('#intro [data-animate]').forEach(el => {
    el.classList.remove('show');
    const delay = parseInt(el.getAttribute('data-delay') || 0);
    setTimeout(() => el.classList.add('show'), delay);
  });
}

// ─── NAV SCROLL ──────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 10);
});

// ─── API HELPERS ─────────────────────────────────────────────
async function apiFetch(endpoint) {
  const res = await fetch('/api' + endpoint);
  if (!res.ok) throw new Error(`API ${endpoint} → ${res.status}`);
  return res.json();
}

// ─── LOAD SKILLS ─────────────────────────────────────────────
async function loadSkills() {
  const grid = document.getElementById('skillsGrid');
  try {
    const { data } = await apiFetch('/skills');
    grid.innerHTML = data.map(s => `<div class="skill-tag">${s.name}</div>`).join('');
    addHoverables();
  } catch {
    grid.innerHTML = `
      <div class="skill-tag">/ Node.js</div>
      <div class="skill-tag">JavaScript</div>
      <div class="skill-tag">Java</div>
      <div class="skill-tag">Python</div>
      <div class="skill-tag">MySQLWorkbench</div>
      <div class="skill-tag">C++</div>
      <div class="skill-tag">Figma</div>
    `;
  }
}

// ─── LOAD STATS ──────────────────────────────────────────────
async function loadStats() {
  const grid = document.getElementById('statsGrid');
  try {
    const { data } = await apiFetch('/stats');
    grid.innerHTML = data.map(s => `
      <div class="stat">
        <span class="stat-num">${s.value}</span>
        <span class="stat-label">${s.label}</span>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = `
      <div class="stat"><span class="stat-num">3+</span><span class="stat-label">Hackathons</span></div>
      <div class="stat"><span class="stat-num">20+</span><span class="stat-label">Projects</span></div>
      <div class="stat"><span class="stat-num">8+</span><span class="stat-label">Winnings</span></div>
    `;
  }
}

// ─── LOAD PROJECTS ────────────────────────────────────────────
async function loadProjects() {
  const list = document.getElementById('projectsList');
  try {
    const { data } = await apiFetch('/projects');
    list.innerHTML = data.map((p, i) => {
      const num = String(i + 1).padStart(3, '0');
      const tagsHtml = p.tags.map(t => `<span class="project-tag">${t}</span>`).join('');
      const ghLink = p.github_url
        ? `<a class="project-link" href="${p.github_url}" target="_blank" rel="noopener">
             <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
             GitHub
           </a>` : '';
      const liveLink = p.live_url
        ? `<a class="project-link" href="${p.live_url}" target="_blank" rel="noopener">↗ Live Demo</a>`
        : '';
      return `
        <div class="project-item" style="transition-delay:${i * 80}ms">
          <span class="project-num">${num}</span>
          <div class="project-main">
            <div class="project-tags">${tagsHtml}</div>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description}</p>
          </div>
          <div class="project-links">${ghLink}${liveLink}</div>
        </div>`;
    }).join('');
    addHoverables();
    triggerProjectAnim();
  } catch {
    list.innerHTML = `<p style="color:var(--text-muted);font-family:'DM Mono',monospace;font-size:.8rem;padding:40px 0">
      Could not load projects — ensure MySQL is running and seeded.</p>`;
  }
}

function triggerProjectAnim() {
  document.querySelectorAll('.project-item').forEach((el, i) => {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('visible'), i * 90);
  });
}

// ─── CONTACT FORM ─────────────────────────────────────────────
let selectedMood = 'chat';

// Mood buttons
document.getElementById('moodBtns')?.addEventListener('click', e => {
  const btn = e.target.closest('.mood-btn');
  if (!btn) return;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMood = btn.getAttribute('data-mood');
});

// Char counter
document.getElementById('fmessage')?.addEventListener('input', function () {
  document.getElementById('charCount').textContent = this.value.length;
});

// Send
document.getElementById('sendBtn')?.addEventListener('click', async () => {
  const name    = document.getElementById('fname').value.trim();
  const email   = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmessage').value.trim();
  const btn     = document.getElementById('sendBtn');

  if (!name || !email || !message) {
    showToast('Please fill in all fields ✗', 'error'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Invalid email address ✗', 'error'); return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, mood: selectedMood, message }),
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('formContent').style.display = 'none';
      document.getElementById('successState').classList.add('show');
      showToast('Message sent! ✓', 'success');
    } else {
      showToast(data.error || 'Something went wrong ✗', 'error');
      btn.disabled = false; btn.textContent = 'Send It ↗';
    }
  } catch {
    showToast('Network error — please try again ✗', 'error');
    btn.disabled = false; btn.textContent = 'Send It ↗';
  }
});

function resetForm() {
  document.getElementById('formContent').style.display = '';
  document.getElementById('successState').classList.remove('show');
  document.getElementById('fname').value = '';
  document.getElementById('femail').value = '';
  document.getElementById('fmessage').value = '';
  document.getElementById('charCount').textContent = '0';
  document.getElementById('sendBtn').disabled = false;
  document.getElementById('sendBtn').textContent = 'Send It ↗';
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
}

// ─── INIT ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  runIntroAnim();
  addHoverables();
});
