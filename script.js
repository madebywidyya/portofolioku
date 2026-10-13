const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ========== API HELPERS ========== */
async function apiGet(action = "getAll") {
  const url = `${CONFIG.APPS_SCRIPT_URL}?action=${action}&token=${encodeURIComponent(CONFIG.API_TOKEN)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return res.json();
}

async function apiPost(payload) {
  const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...payload, token: CONFIG.API_TOKEN })
  });
  if (!res.ok) throw new Error("Network error");
  return res.json();
}

/* ========== RENDER ========== */
function render(d) {
  // Profile
  if (d.profile) {
    const p = d.profile;
    if (p.tagline) $("#tagline").textContent = p.tagline;
    if (p.intro) $("#intro").textContent = p.intro;
    if (p.name) $("#bioName").textContent = p.name;
    if (p.bio) $("#bioText").textContent = p.bio;
    if (p.location) $("#location").textContent = p.location;
    if (p.education) $("#education").textContent = p.education;
    if (p.motto) $("#motto").textContent = p.motto;
    if (p.photo) $("#profilePhoto").src = p.photo;
  }

  // Journey
  if (d.journey?.length) {
    $("#journeyList").innerHTML = d.journey.map(x =>
      `<article class="timeline-item reveal">
        <div class="timeline-dot">${x.icon || "✦"}</div>
        <div class="timeline-content"><small>${x.year}</small><h3>${x.title}</h3><p>${x.text}</p></div>
      </article>`
    ).join("");
  }

  // Hobbies
  if (d.hobbies?.length) {
    $("#hobbiesList").innerHTML = d.hobbies.map(x =>
      `<article class="hobby-card reveal"><div class="hobby-icon">${x.icon || "♡"}</div><h3>${x.title}</h3><p>${x.text}</p></article>`
    ).join("");
  }

  // Favorites
  if (d.favorites?.length) {
    $("#favoritesList").innerHTML = d.favorites.map(x =>
      `<article class="favorite-card reveal"><div class="icon">${x.icon || "✦"}</div><div><span>${x.label}</span><strong>${x.value}</strong></div></article>`
    ).join("");
  }

  // Idols
  if (d.idols?.length) {
    $("#idolsList").innerHTML = d.idols.map(x =>
      `<article class="idol-card reveal">
        <div class="idol-img" style="background-image:url('${x.image || ""}')"></div>
        <div class="idol-info">
          <span class="role">${x.role || ""} ${x.country ? "• " + x.country : ""}</span>
          <h3>${x.name}</h3>
          <p>${x.reason || ""}</p>
          ${x.link ? `<a href="${x.link}" target="_blank" rel="noopener">learn more ↗</a>` : ""}
        </div>
      </article>`
    ).join("");
  }

  // Dreams
  if (d.dreams?.length) {
    $("#dreamsList").innerHTML = d.dreams.map(x =>
      `<article class="dream-card reveal"><div class="icon">${x.icon || "✦"}</div><h3>${x.title}</h3><p>${x.text}</p></article>`
    ).join("");
  }

  // Skills
  if (d.skills?.length) {
    $("#skillsList").innerHTML = d.skills.map(x =>
      `<div class="skill reveal">
        <div class="skill-top"><span>${x.name}</span><span>${x.level}%</span></div>
        <div class="skill-track"><div class="skill-bar" data-level="${x.level}"></div></div>
      </div>`
    ).join("");
  }

  // Projects
  if (d.projects?.length) {
    $("#projectsList").innerHTML = d.projects.map(x =>
      `<article class="project-card reveal" data-category="${x.category || "Web"}">
        <div class="project-icon">${x.icon || "🌐"}</div>
        <h3>${x.title}</h3>
        <p>${x.text}</p>
        <div class="project-tools">${x.tools || ""}</div>
      </article>`
    ).join("");
  }

  // Currently
  if (d.currently?.length) {
    $("#currentlyList").innerHTML = d.currently.map(x =>
      `<article class="currently-card reveal"><span>${x.label}</span><p>${x.value}</p></article>`
    ).join("");
  }

  // Fun facts
  window.funFacts = d.funFacts || [];

  // Gallery
  if (d.gallery?.length) {
    $("#galleryList").innerHTML = d.gallery.map((x, i) => {
      const cls = x.size === "tall" ? "tall" : x.size === "wide" ? "wide" : "";
      return `<div class="photo-item ${cls}"><img src="${x.image}" alt="${x.caption || "photo " + (i + 1)}" loading="lazy"></div>`;
    }).join("");
  } else {
    $("#galleryList").innerHTML = `
      <div class="photo-placeholder tall"><span>photo 01</span></div>
      <div class="photo-placeholder"><span>photo 02</span></div>
      <div class="photo-placeholder"><span>photo 03</span></div>
      <div class="photo-placeholder wide"><span>photo 04</span></div>
      <div class="photo-placeholder"><span>photo 05</span></div>
      <div class="photo-placeholder tall"><span>photo 06</span></div>`;
  }

  // Messages (approved only)
  if (d.messages?.length) {
    $("#messagesList").innerHTML = d.messages.map(m =>
      `<div class="message-card reveal">
        <div class="msg-name">${escapeHtml(m.name)}</div>
        <div class="msg-text">${escapeHtml(m.message)}</div>
        <div class="msg-time">${m.timestamp || ""}</div>
      </div>`
    ).join("");
  }

  // Social
  if (d.social) {
    if (d.social.instagram) $("#igLink").href = d.social.instagram;
    if (d.social.github) $("#ghLink").href = d.social.github;
    if (d.social.email) $("#emailLink").href = d.social.email;
  }

  // Visit count
  if (d.stats?.total_visits != null) {
    $("#visitCount").textContent = formatNumber(d.stats.total_visits);
  }

  activateReveal();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function activateReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        const bar = entry.target.querySelector(".skill-bar");
        if (bar) bar.style.width = bar.dataset.level + "%";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal:not(.visible)").forEach(el => observer.observe(el));
}

/* ========== LOAD DATA ========== */
async function loadData() {
  try {
    const data = await apiGet("getAll");
    if (data.error) throw new Error(data.error);
    render(data);

    // Log visit (fire-and-forget)
    apiPost({ action: "visit" }).catch(() => {});
  } catch (e) {
    console.warn("Apps Script failed, trying fallback...", e);
    if (CONFIG.USE_FALLBACK) {
      try {
        const res = await fetch("data.json");
        const data = await res.json();
        render(data);
      } catch (e2) {
        console.error("Fallback also failed", e2);
        $("#loader p").textContent = "Failed to load data";
      }
    }
  }
}

/* ========== FORMS ========== */
function setupForms() {
  // Guestbook
  $("#guestbookForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("#gbName").value.trim();
    const message = $("#gbMessage").value.trim();
    const status = $("#gbStatus");
    if (!name || !message) return;

    status.textContent = "Sending...";
    try {
      const res = await apiPost({ action: "message", name, message });
      if (res.success) {
        status.textContent = "✓ Message sent! Waiting for approval.";
        $("#guestbookForm").reset();
      } else {
        status.textContent = res.error || "Failed to send.";
      }
    } catch {
      status.textContent = "Network error. Please try again.";
    }
  });

  // Contact
  $("#contactForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("#ctName").value.trim();
    const email = $("#ctEmail").value.trim();
    const message = $("#ctMessage").value.trim();
    const status = $("#ctStatus");
    if (!name || !email || !message) return;

    status.textContent = "Sending...";
    try {
      const res = await apiPost({ action: "contact", name, email, message });
      if (res.success) {
        status.textContent = "✓ Message sent! Thank you.";
        $("#contactForm").reset();
      } else {
        status.textContent = res.error || "Failed to send.";
      }
    } catch {
      status.textContent = "Network error. Please try again.";
    }
  });
}

/* ========== UI EVENTS ========== */
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupForms();
  $("#year").textContent = new Date().getFullYear();

  // Theme
  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    $("#themeToggle").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
    localStorage.setItem("portfolio-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
  if (localStorage.getItem("portfolio-theme") === "dark") {
    document.body.classList.add("dark");
    $("#themeToggle").textContent = "☀";
  }

  // Mobile menu
  $("#menuBtn").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => $("#navLinks").classList.remove("open")));

  // Fun fact
  $("#funFactBtn").addEventListener("click", () => {
    const facts = window.funFacts || [];
    if (!facts.length) return;
    const current = $("#funResult").textContent;
    let next = facts[Math.floor(Math.random() * facts.length)];
    while (facts.length > 1 && next === current) next = facts[Math.floor(Math.random() * facts.length)];
    $("#funResult").textContent = next;
  });

  // Project filters
  $$("#projectFilters button").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("#projectFilters button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      $$(".project-card").forEach(card => {
        card.style.display = (f === "all" || card.dataset.category === f) ? "flex" : "none";
      });
    });
  });

  // Back to top
  const top = $("#topBtn");
  window.addEventListener("scroll", () => top.classList.toggle("show", scrollY > 500));
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // Custom cursor
  const dot = $(".cursor-dot"), ring = $(".cursor-ring");
  window.addEventListener("mousemove", e => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
    ring.style.left = e.clientX + "px";
    ring.style.top = e.clientY + "px";
  });

  // Loader
  setTimeout(() => {
    $("#loader").style.opacity = "0";
    setTimeout(() => $("#loader").style.display = "none", 650);
  }, 800);
});
