/**
 * ================================================
 *  WIDIYA SARI PORTFOLIO — Google Apps Script
 * ================================================
 *  Setup:
 *  1. Buat Google Spreadsheet baru
 *  2. Rename spreadsheet jadi "Portfolio Widiya"
 *  3. Buat sheet-sheet sesuai nama di bawah (lihat README)
 *  4. Extensions → Apps Script → paste kode ini
 *  5. Ganti SPREADSHEET_ID dan API_TOKEN
 *  6. Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  7. Copy URL Web App ke config.js di website
 */

// ========== CONFIG ==========
const SPREADSHEET_ID = "PASTE_YOUR_SPREADSHEET_ID_HERE"; // dari URL spreadsheet
const API_TOKEN = "widiya-portfolio-2026";               // harus sama dengan config.js
const ADMIN_EMAIL = "";                                  // opsional: email untuk notifikasi

// ========== MAIN HANDLERS ==========
function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  try {
    const params = method === "GET"
      ? (e.parameter || {})
      : JSON.parse(e.postData?.contents || "{}");

    // Token check
    if (params.token !== API_TOKEN) {
      return jsonResponse({ error: "Invalid token" });
    }

    const action = params.action || "getAll";

    if (method === "GET" || action === "getAll") {
      return jsonResponse(getAllData());
    }

    switch (action) {
      case "visit":
        return jsonResponse(logVisit());
      case "message":
        return jsonResponse(addMessage(params.name, params.message));
      case "contact":
        return jsonResponse(addContact(params.name, params.email, params.message));
      default:
        return jsonResponse({ error: "Unknown action" });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========== DATA READERS ==========
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(name);
}

function sheetToObjects(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  return data.slice(1)
    .filter(row => row.some(cell => cell !== ""))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });
}

function getProfile() {
  const rows = sheetToObjects("Profile");
  if (!rows.length) return {};
  // Profile sheet: key | value
  const map = {};
  rows.forEach(r => {
    if (r.key) map[String(r.key).toLowerCase()] = r.value;
  });
  return {
    name: map.name || "",
    tagline: map.tagline || "",
    intro: map.intro || "",
    bio: map.bio || "",
    location: map.location || "",
    education: map.education || "",
    motto: map.motto || "",
    photo: map.photo || ""
  };
}

function getSocial() {
  const rows = sheetToObjects("Social");
  const map = {};
  rows.forEach(r => {
    if (r.key) map[String(r.key).toLowerCase()] = r.value;
  });
  return {
    instagram: map.instagram || "#",
    github: map.github || "#",
    email: map.email || "mailto:hello@example.com"
  };
}

function getStats() {
  const sheet = getSheet("Stats");
  if (!sheet) return { total_visits: 0, today_visits: 0 };
  const data = sheet.getDataRange().getValues();
  // Stats: key | value  → total_visits, today_visits, last_date
  const map = {};
  data.slice(1).forEach(row => {
    if (row[0]) map[String(row[0]).toLowerCase()] = row[1];
  });
  return {
    total_visits: Number(map.total_visits) || 0,
    today_visits: Number(map.today_visits) || 0
  };
}

function getApprovedMessages() {
  const rows = sheetToObjects("Messages");
  return rows
    .filter(r => String(r.approved).toUpperCase() === "TRUE" || r.approved === true)
    .map(r => ({
      name: r.name || "Anonymous",
      message: r.message || "",
      timestamp: formatTimestamp(r.timestamp)
    }))
    .reverse() // newest first
    .slice(0, 30);
}

function getAllData() {
  return {
    profile: getProfile(),
    journey: sheetToObjects("Journey"),
    hobbies: sheetToObjects("Hobbies"),
    favorites: sheetToObjects("Favorites"),
    idols: sheetToObjects("Idols"),
    dreams: sheetToObjects("Dreams"),
    skills: sheetToObjects("Skills").map(s => ({
      name: s.name,
      level: Number(s.level) || 0
    })),
    projects: sheetToObjects("Projects"),
    currently: sheetToObjects("Currently"),
    funFacts: sheetToObjects("FunFacts").map(f => f.text || f.fact || "").filter(Boolean),
    gallery: sheetToObjects("Gallery"),
    messages: getApprovedMessages(),
    social: getSocial(),
    stats: getStats()
  };
}

// ========== WRITE ACTIONS ==========
function logVisit() {
  const sheet = getSheet("Stats");
  if (!sheet) return { success: false, error: "Stats sheet missing" };

  const data = sheet.getDataRange().getValues();
  const map = {};
  const rowIndex = {}; // key → row number (1-based)
  data.forEach((row, i) => {
    if (row[0]) {
      const k = String(row[0]).toLowerCase();
      map[k] = row[1];
      rowIndex[k] = i + 1;
    }
  });

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  let total = Number(map.total_visits) || 0;
  let todayCount = Number(map.today_visits) || 0;
  const lastDate = map.last_date || "";

  total += 1;
  if (lastDate === today) {
    todayCount += 1;
  } else {
    todayCount = 1;
  }

  // Update cells
  if (rowIndex["total_visits"]) sheet.getRange(rowIndex["total_visits"], 2).setValue(total);
  else sheet.appendRow(["total_visits", total]);

  if (rowIndex["today_visits"]) sheet.getRange(rowIndex["today_visits"], 2).setValue(todayCount);
  else sheet.appendRow(["today_visits", todayCount]);

  if (rowIndex["last_date"]) sheet.getRange(rowIndex["last_date"], 2).setValue(today);
  else sheet.appendRow(["last_date", today]);

  return { success: true, total_visits: total, today_visits: todayCount };
}

function addMessage(name, message) {
  if (!name || !message) return { success: false, error: "Name and message required" };
  if (String(name).length > 40 || String(message).length > 300) {
    return { success: false, error: "Too long" };
  }

  const sheet = getSheet("Messages");
  if (!sheet) return { success: false, error: "Messages sheet missing" };

  const timestamp = new Date();
  // Columns: Timestamp | Name | Message | Approved
  sheet.appendRow([timestamp, String(name).trim(), String(message).trim(), "FALSE"]);

  // Optional email notification
  if (ADMIN_EMAIL) {
    try {
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: "[Portfolio] New Guestbook Message",
        body: `Name: ${name}\nMessage: ${message}\n\nApprove it in the Messages sheet.`
      });
    } catch (e) { /* ignore mail errors */ }
  }

  return { success: true };
}

function addContact(name, email, message) {
  if (!name || !email || !message) return { success: false, error: "All fields required" };

  const sheet = getSheet("Contacts");
  if (!sheet) return { success: false, error: "Contacts sheet missing" };

  const timestamp = new Date();
  // Columns: Timestamp | Name | Email | Message
  sheet.appendRow([timestamp, String(name).trim(), String(email).trim(), String(message).trim()]);

  if (ADMIN_EMAIL) {
    try {
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: "[Portfolio] New Contact Message",
        body: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
      });
    } catch (e) { /* ignore */ }
  }

  return { success: true };
}

function formatTimestamp(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "dd MMM yyyy");
  } catch {
    return String(val);
  }
}

/**
 * Helper: jalankan sekali untuk membuat semua sheet + header + sample data.
 * Di Apps Script editor: pilih fungsi setupSpreadsheet → Run
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheets = {
    "Profile": [["key", "value"],
      ["name", "Widiya Sari"],
      ["tagline", "Student • Dreamer • Creator • Learner"],
      ["intro", "Welcome to my little universe — a space for my journey, interests, dreams, projects, and the little things that make me, me."],
      ["bio", "A curious student who enjoys learning new things, creating digital projects, exploring ideas, and collecting meaningful memories along the way."],
      ["location", "Indonesia"],
      ["education", "SMA • Modern Pesantren"],
      ["motto", "Keep learning, keep creating, keep becoming."],
      ["photo", ""]
    ],
    "Journey": [["year", "title", "text", "icon"],
      ["Childhood", "Little Dreams", "A time of trying different interests and imagining many possible futures.", "🌱"],
      ["SMP", "A New Chapter", "Started a new learning journey and discovered more interests through school and pesantren life.", "📚"],
      ["SMA", "Growing & Exploring", "Learning, creating projects, joining activities, and figuring out what kind of future feels meaningful.", "🕌"],
      ["Today", "Building My Skills", "Exploring technology, design, science, writing, and new opportunities.", "💻"],
      ["Future", "Dream Bigger", "Keep learning, build useful things, help people, and explore opportunities beyond my comfort zone.", "🚀"]
    ],
    "Hobbies": [["icon", "title", "text"],
      ["📖", "Reading", "Stories, history, biographies, and anything that makes me curious."],
      ["🎨", "Designing", "Playing with layouts, colors, visuals, and creative ideas."],
      ["💻", "Web & Tech", "Learning HTML, CSS, JavaScript, JSON, and building little web experiments."],
      ["✍️", "Writing", "Turning ideas, experiences, and reflections into words."],
      ["🕌", "Islamic History", "Exploring stories and lessons from Islamic history and the lives of inspiring people."],
      ["📸", "Content & Memories", "Collecting moments and turning them into visual stories."]
    ],
    "Favorites": [["icon", "label", "value"],
      ["🎨", "Colors", "Cream • Cocoa • Maroon • Soft Green"],
      ["🌿", "Aesthetic", "Modern minimalist vintage"],
      ["📚", "Reading", "History, stories & inspiring biographies"],
      ["💻", "Creative space", "Canva, websites & digital projects"],
      ["☕", "Little things", "Cozy layouts, playlists & quiet moments"],
      ["🌏", "Dream destination", "Places where I can learn and grow"]
    ],
    "Idols": [["name", "role", "country", "image", "reason", "link"],
      ["Tian Xiwei", "Actress", "China", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80", "Admired for her bright energy, expressive acting, and charming presence.", "https://en.wikipedia.org/wiki/Tian_Xiwei"],
      ["My inspirations", "People who inspire me", "Everywhere", "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80", "I find inspiration in people who keep learning, create meaningful work, and stay kind.", ""]
    ],
    "Dreams": [["icon", "title", "text"],
      ["🎓", "Education", "Keep growing academically and find a university path that fits my interests and strengths."],
      ["🌏", "Go Further", "Experience international opportunities, learn from different cultures, and broaden my perspective."],
      ["💼", "Meaningful Career", "Build a career that is useful, challenging, flexible, and lets me keep learning."],
      ["🤍", "Help People", "Use my knowledge and skills to make a positive difference, even through small things."],
      ["💡", "Create", "Make useful digital projects, stories, designs, and ideas that people can actually use."],
      ["📚", "Never Stop Learning", "Keep exploring new subjects instead of being afraid of starting from zero."]
    ],
    "Skills": [["name", "level"],
      ["HTML", 70], ["CSS", 65], ["JavaScript", 45], ["JSON", 55],
      ["Canva & Visual Design", 75], ["Writing & Storytelling", 70],
      ["Presentation", 65], ["Creative Problem Solving", 70]
    ],
    "Projects": [["title", "category", "icon", "text", "tools"],
      ["Personal Web Experiments", "Web", "🌐", "Small responsive websites created while learning HTML, CSS, JavaScript, and JSON.", "HTML • CSS • JS • JSON"],
      ["Sirah Sahabiyah", "Education", "🕌", "A web concept for exploring the stories of female companions and lesser-known figures from Islamic history.", "HTML • CSS • JS • JSON"],
      ["AGROSORB", "Science", "🧪", "A science-project concept exploring coconut-shell-based bio-adsorbent for sustainable water purification.", "Research • Science • Presentation"],
      ["Digital Journal", "Productivity", "📔", "A personal journal and habit-tracking concept with mood, tasks, calendar, and local saving.", "HTML • CSS • JS • LocalStorage"],
      ["Creative Content", "Design", "🎨", "Visual storytelling experiments for social media, school activities, and personal projects.", "Canva • Design • Storytelling"]
    ],
    "Currently": [["label", "value"],
      ["Learning", "Web development & creative skills"],
      ["Exploring", "Future study and career possibilities"],
      ["Creating", "Personal websites & visual content"],
      ["Dreaming", "International experiences and meaningful work"]
    ],
    "FunFacts": [["text"],
      ["I can spend way too long choosing the perfect color palette."],
      ["I like turning ideas into websites instead of leaving them as ideas."],
      ["I enjoy discovering stories about people who are not always in the spotlight."],
      ["A good aesthetic can make studying feel a little more fun."],
      ["I believe starting from zero is still starting."]
    ],
    "Gallery": [["image", "caption", "size"],
      // Isi dengan URL foto. size: "" | "tall" | "wide"
    ],
    "Messages": [["timestamp", "name", "message", "approved"]],
    "Contacts": [["timestamp", "name", "email", "message"]],
    "Stats": [["key", "value"],
      ["total_visits", 0],
      ["today_visits", 0],
      ["last_date", ""]
    ],
    "Social": [["key", "value"],
      ["instagram", "#"],
      ["github", "#"],
      ["email", "mailto:hello@example.com"]
    ]
  };

  Object.keys(sheets).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.clear();
    const data = sheets[name];
    if (data.length) {
      sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    }
  });

  // Hapus Sheet1 default kalau ada
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log("Setup selesai! Semua sheet sudah dibuat.");
}
