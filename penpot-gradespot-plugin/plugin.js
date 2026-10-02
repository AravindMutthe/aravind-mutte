// GradeSpot Designer v2 — Penpot plugin (no server needed).
// Redesign brief from Aravind (2026-10-02):
//  - menu styled like his portfolio site (logo-mark + wordmark, links, CTA button)
//  - modern font (Inter), dummy lorem text, image & logo placeholders
//  - exact pages: Home, About, Services, Courses, CCNA, SOC Analyst,
//    Digital Marketing, CompTIA Pentest+, CompTIA Network+, Team, Contact
// RULE: structure only — every number, testimonial, date, fee, name is a
// bracketed placeholder until Aravind confirms real facts. Never invent claims.

penpot.ui.open("GradeSpot Designer", "index.html?theme=" + penpot.theme, {
  width: 340,
  height: 660,
});

let lastStep = "";
function progress(step) {
  lastStep = step;
  penpot.ui.sendMessage({ type: "progress", detail: step });
}

// ---------- design tokens ----------
const C = {
  orange: "#EA580C", orangeDark: "#C2410C", orangeSoft: "#FFF7ED",
  dark: "#111827", gray: "#4B5563", lightGray: "#9CA3AF",
  bgGray: "#F9FAFB", border: "#E5E7EB", white: "#FFFFFF",
  navy: "#0F172A", navyBorder: "#1E293B", navyText: "#94A3B8",
  imgBg: "#E9EDF2", imgBorder: "#D1D5DB", imgLabel: "#9CA3AF",
};
const W = 1440;          // board width
const MX = 80;           // side margin
const CW = W - MX * 2;   // content width 1280

// ---------- dummy text ----------
const LOREM_H = "Lorem ipsum dolor sit amet";
const LOREM_S = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
const LOREM_P = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.";
const LOREM_Q = "Lorem ipsum dolor sit amet, consectetur?";

// ---------- shape helpers ----------
// NOTE: shape width/height are READ-ONLY in the plugin API — use resize().
function rect(parent, name, x, y, w, h, fill) {
  const r = penpot.createRectangle();
  r.name = name;
  r.x = x; r.y = y;
  r.resize(w, h);
  r.fills = [{ fillColor: fill }];
  parent.appendChild(r);
  return r;
}

function outlinedRect(parent, name, x, y, w, h, strokeColor, strokeWidth) {
  const r = penpot.createRectangle();
  r.name = name;
  r.x = x; r.y = y;
  r.resize(w, h);
  r.fills = [];
  r.strokes = [{ strokeColor: strokeColor, strokeWidth: strokeWidth, strokeStyle: "solid", strokeAlignment: "center" }];
  parent.appendChild(r);
  return r;
}

function circle(parent, name, x, y, d, fill, strokeColor) {
  const c = penpot.createEllipse();
  c.name = name;
  c.x = x; c.y = y;
  c.resize(d, d);
  c.fills = fill ? [{ fillColor: fill }] : [];
  if (strokeColor) {
    c.strokes = [{ strokeColor: strokeColor, strokeWidth: 1, strokeStyle: "solid", strokeAlignment: "center" }];
  }
  parent.appendChild(c);
  return c;
}

function label(parent, name, str, x, y, w, opts) {
  opts = opts || {};
  const t = penpot.createText(str);
  if (!t) return null;
  t.name = name;
  t.growType = "auto-height";
  t.resize(w, Math.max(t.height, 24));
  t.x = x; t.y = y;
  t.fontFamily = opts.font || "Inter";
  t.fontSize = String(opts.size || 16);
  t.fontWeight = opts.weight || "400";
  t.fills = [{ fillColor: opts.color || C.dark }];
  if (opts.align) t.align = opts.align;
  parent.appendChild(t);
  return t;
}

function button(parent, name, x, y, w, h, text, bg, fg) {
  rect(parent, name + " bg", x, y, w, h, bg);
  label(parent, name + " label", text, x, y + h / 2 - 11, w,
    { size: 16, weight: "700", color: fg, align: "center" });
}

function outlineButton(parent, name, x, y, w, h, text, color) {
  rect(parent, name + " bg", x, y, w, h, C.white);
  outlinedRect(parent, name + " border", x, y, w, h, color, 2);
  label(parent, name + " label", text, x, y + h / 2 - 11, w,
    { size: 16, weight: "700", color: color, align: "center" });
}

// pill chip, returns its width
function chip(parent, name, x, y, text, fg, bg) {
  fg = fg || C.orange; bg = bg || C.white;
  const tw = 14 * text.length * 0.62 + 32;
  const w = Math.max(90, Math.min(tw, 440));
  rect(parent, name + " bg", x, y, w, 36, bg);
  outlinedRect(parent, name + " border", x, y, w, 36, C.border, 1);
  label(parent, name + " label", text, x + 8, y + 8, w - 16,
    { size: 13, weight: "700", color: fg, align: "center" });
  return w;
}

// ---------- logo (portfolio-style: mark + wordmark) ----------
function logoMark(parent, name, x, y, s) {
  rect(parent, name + " mark", x, y, s, s, C.orange);
  label(parent, name + " initials", "GS", x, y + s / 2 - 14, s,
    { size: 20, weight: "800", color: C.white, align: "center" });
}

function logoLockup(parent, name, x, y, dark) {
  logoMark(parent, name, x, y, 44);
  label(parent, name + " wordmark", "GradeSpot", x + 56, y + 8, 220,
    { size: 20, weight: "800", color: dark ? C.dark : C.white });
}

// ---------- image placeholder ----------
function img(parent, name, x, y, w, h, caption) {
  rect(parent, name, x, y, w, h, C.imgBg);
  outlinedRect(parent, name + " border", x, y, w, h, C.imgBorder, 1);
  circle(parent, name + " glyph", x + w / 2 - 16, y + h / 2 - 36, 32, C.imgLabel);
  label(parent, name + " label", caption || "IMAGE", x, y + h / 2 + 8, w,
    { size: 13, weight: "700", color: C.imgLabel, align: "center" });
}

// ---------- navbar: menu like Aravind's portfolio ----------
// portfolio pattern: logo-mark + wordmark | links | CTA button (hamburger on mobile)
const NAV_LINKS = ["Home", "About", "Services", "Courses", "Team", "Contact"];
function navbar(board, y, active) {
  const h = 76;
  rect(board, "nav bg", 0, y, W, h, C.white);
  rect(board, "nav border", 0, y + h - 1, W, 1, C.border);
  logoLockup(board, "nav logo", MX, y + 16, true);
  let lx = 520;
  NAV_LINKS.forEach((l) => {
    const on = (l === active);
    label(board, "nav " + l, l, lx, y + 27, 100,
      { size: 15, weight: on ? "700" : "500", color: on ? C.dark : C.gray });
    if (on) rect(board, "nav active " + l, lx, y + 54, 30, 3, C.orange);
    lx += 100;
  });
  const bw = 170;
  button(board, "nav cta", W - MX - bw, y + 15, bw, 46, "Enroll Now", C.orange, C.white);
  return y + h;
}

// ---------- shared sections ----------
// centered section header: eyebrow + H2 + sub. Returns next y.
function secHead(board, name, y, eyebrow, title, sub) {
  let yy = y;
  if (eyebrow) {
    label(board, name + " eyebrow", eyebrow.toUpperCase(), MX, yy, CW,
      { size: 13, weight: "700", color: C.orange, align: "center" });
    yy += 30;
  }
  label(board, name + " title", title, MX, yy, CW,
    { size: 40, weight: "700", color: C.dark, align: "center" });
  yy += 62;
  if (sub) {
    label(board, name + " sub", sub, (W - 760) / 2, yy, 760,
      { size: 17, color: C.gray, align: "center" });
    yy += 68;
  } else {
    yy += 8;
  }
  return yy;
}

function pageHero(board, y, title, sub) {
  const h = 380;
  rect(board, "pagehero bg", 0, y, W, h, C.navy);
  label(board, "pagehero title", title, MX, y + 118, CW,
    { size: 48, weight: "800", color: C.white, align: "center" });
  label(board, "pagehero sub", sub, (W - 760) / 2, y + 198, 760,
    { size: 17, color: C.navyText, align: "center" });
  return y + h;
}

// row of partner/employer logo placeholders. Returns next y.
function logoStrip(board, name, y, eyebrowText, count) {
  let yy = y;
  label(board, name + " eyebrow", eyebrowText, MX, yy, CW,
    { size: 13, weight: "700", color: C.lightGray, align: "center" });
  yy += 38;
  const gap = 24, bw = (CW - gap * (count - 1)) / count;
  for (let i = 0; i < count; i++) {
    const bx = MX + i * (bw + gap);
    rect(board, name + " box " + i, bx, yy, bw, 76, C.white);
    outlinedRect(board, name + " box " + i + " border", bx, yy, bw, 76, C.border, 1);
    label(board, name + " label " + i, "[Logo]", bx, yy + 27, bw,
      { size: 14, weight: "700", color: C.lightGray, align: "center" });
  }
  return yy + 76;
}

function footer(board, y) {
  const h = 460;
  rect(board, "footer bg", 0, y, W, h, C.navy);
  logoLockup(board, "f logo", MX, y + 52, false);
  label(board, "f blurb", LOREM_S, MX, y + 120, 300,
    { size: 14, color: C.navyText });
  for (let i = 0; i < 4; i++) {
    circle(board, "f social " + i, MX + i * 52, y + 210, 40, null, "#334155");
    label(board, "f social icon " + i, "○", MX + i * 52, y + 218, 40,
      { size: 16, color: C.navyText, align: "center" });
  }
  // col 2: explore
  label(board, "f h2", "Explore", 480, y + 52, 200,
    { size: 16, weight: "700", color: C.white });
  NAV_LINKS.forEach((l, i) => {
    label(board, "f link " + i, l, 480, y + 90 + i * 30, 200,
      { size: 14, color: C.navyText });
  });
  // col 3: courses
  label(board, "f h3", "Courses", 760, y + 52, 260,
    { size: 16, weight: "700", color: C.white });
  ["CCNA", "SOC Analyst", "Digital Marketing", "CompTIA Pentest+", "CompTIA Network+"].forEach((l, i) => {
    label(board, "f course " + i, l, 760, y + 90 + i * 30, 260,
      { size: 14, color: C.navyText });
  });
  // col 4: contact placeholders
  label(board, "f h4", "Contact", 1060, y + 52, 300,
    { size: 16, weight: "700", color: C.white });
  ["[Phone number]", "[Email address]", "[Office address, Hyderabad]", "[Working hours]"].forEach((l, i) => {
    label(board, "f contact " + i, l, 1060, y + 90 + i * 30, 300,
      { size: 14, color: C.navyText });
  });
  rect(board, "f divider", MX, y + h - 72, CW, 1, C.navyBorder);
  label(board, "f copy", "© 2026 GradeSpot IT Solutions. All rights reserved.",
    MX, y + h - 46, 600, { size: 13, color: C.navyText });
  label(board, "f legal", "Privacy Policy   •   Terms of Use",
    W - MX - 320, y + h - 46, 320, { size: 13, color: C.navyText, align: "right" });
  return y + h;
}

function ctaBand(board, y, title, sub) {
  const h = 360;
  rect(board, "cta bg", 0, y, W, h, C.orange);
  label(board, "cta title", title, MX, y + 90, CW,
    { size: 38, weight: "700", color: C.white, align: "center" });
  label(board, "cta sub", sub, (W - 640) / 2, y + 156, 640,
    { size: 17, color: C.white, align: "center" });
  const bw = 220;
  button(board, "cta btn", (W - bw) / 2, y + 236, bw, 54, "Enroll Now", C.white, C.orange);
  return y + h;
}

// FAQ accordion rows (collapsed look). items: [question, ...]. Returns next y.
function faqList(board, name, y, questions) {
  let yy = y;
  questions.forEach((q, i) => {
    rect(board, name + " item " + i, MX, yy, CW, 76, C.white);
    outlinedRect(board, name + " item " + i + " border", MX, yy, CW, 76, C.border, 1);
    label(board, name + " q " + i, q, MX + 28, yy + 26, CW - 120, { size: 17, weight: "600" });
    label(board, name + " plus " + i, "+", MX + CW - 60, yy + 22, 40,
      { size: 28, color: C.orange, align: "center" });
    yy += 88;
  });
  return yy;
}

// checkmark bullet row
function checkRow(board, name, x, y, w, text) {
  circle(board, name + " dot", x, y + 2, 22, C.orangeSoft);
  label(board, name + " check", "✓", x, y, 22,
    { size: 15, weight: "700", color: C.orange, align: "center" });
  label(board, name + " text", text, x + 36, y, w - 36, { size: 16 });
}

// ---------- HOME ----------
function drawHome(board) {
  let y = 0;
  y = navbar(board, y, "Home");

  // hero
  const hh = 660;
  rect(board, "hero bg", 0, y, W, hh, C.orangeSoft);
  chip(board, "hero badge", MX, y + 88, "LOREM IPSUM DOLOR");
  label(board, "hero h1", LOREM_H + " sed do eiusmod tempor.",
    MX, y + 148, 620, { size: 54, weight: "800", color: C.dark });
  label(board, "hero sub", LOREM_P, MX, y + 330, 560, { size: 18, color: C.gray });
  button(board, "hero cta1", MX, y + 452, 210, 54, "Explore Courses", C.orange, C.white);
  outlineButton(board, "hero cta2", MX + 226, y + 452, 210, 54, "Our Services", C.orange);
  img(board, "hero image", MX + 720, y + 88, 560, 484, "HERO IMAGE");
  y += hh;

  // trust chips (placeholders only)
  let yy = y + 56;
  let cx = MX;
  ["[000]+ Lorem", "[00]+ Ipsum", "[0]+ Dolor"].forEach((c, i) => {
    const w = chip(board, "trust " + i, cx, yy, c, C.dark, C.white);
    cx += w + 12;
  });
  y = yy + 36 + 56;

  // logo strip
  y = logoStrip(board, "partners", y, "LOREM IPSUM DOLOR SIT AMET", 5) + 72;

  // courses grid
  yy = secHead(board, "courses", y, "Our programs", "Popular courses", LOREM_S);
  const courses = [
    ["CCNA", "Networking"], ["SOC Analyst", "Cyber Security"],
    ["Digital Marketing", "Marketing"], ["CompTIA Pentest+", "Cyber Security"],
    ["CompTIA Network+", "Networking"],
  ];
  const cw2 = (CW - 4 * 24) / 5;
  courses.forEach((c, i) => {
    const bx = MX + i * (cw2 + 24), by = yy, chh = 420;
    rect(board, "course " + i, bx, by, cw2, chh, C.white);
    outlinedRect(board, "course " + i + " border", bx, by, cw2, chh, C.border, 1);
    img(board, "course img " + i, bx + 16, by + 16, cw2 - 32, 150, "IMAGE");
    chip(board, "course cat " + i, bx + 16, by + 182, c[1], C.orange, C.orangeSoft);
    label(board, "course title " + i, c[0], bx + 16, by + 232, cw2 - 32,
      { size: 19, weight: "700" });
    label(board, "course desc " + i, LOREM_S, bx + 16, by + 264, cw2 - 32,
      { size: 13, color: C.gray });
    label(board, "course meta " + i, "[Duration]  •  [Level]", bx + 16, by + 348, cw2 - 32,
      { size: 12, color: C.lightGray });
    label(board, "course link " + i, "View course →", bx + 16, by + 378, 200,
      { size: 14, weight: "700", color: C.orange });
  });
  y = yy + 420 + 72;

  // why choose us
  yy = secHead(board, "why", y, "Why GradeSpot", "Lorem ipsum dolor sit", LOREM_S);
  const feats = ["Lorem ipsum", "Dolor sit", "Amet consectetur", "Adipiscing elit"];
  const fw = (CW - 3 * 24) / 4;
  feats.forEach((f, i) => {
    const bx = MX + i * (fw + 24);
    rect(board, "feat " + i, bx, yy, fw, 250, C.white);
    outlinedRect(board, "feat " + i + " border", bx, yy, fw, 250, C.border, 1);
    rect(board, "feat icon " + i, bx + 28, yy + 28, 52, 52, C.orangeSoft);
    label(board, "feat title " + i, f, bx + 28, yy + 100, fw - 56, { size: 19, weight: "700" });
    label(board, "feat desc " + i, LOREM_S, bx + 28, yy + 134, fw - 56,
      { size: 14, color: C.gray });
  });
  y = yy + 250 + 72;

  // career support (CyberAegis-inspired structure, zero borrowed claims)
  const ch = 600;
  rect(board, "career bg", 0, y, W, ch, C.bgGray);
  let cy = y + 72;
  label(board, "career eyebrow", "CAREER SUPPORT", MX, cy, 600,
    { size: 13, weight: "700", color: C.orange });
  label(board, "career h2", "From learning to getting hired", MX, cy + 30, 600,
    { size: 36, weight: "700" });
  label(board, "career sub", LOREM_S, MX, cy + 82, 560, { size: 16, color: C.gray });
  ["Resume building", "Mock interviews", "LinkedIn profile optimization",
   "Soft-skills coaching", "1:1 mentorship", "Job-search guidance"].forEach((t, i) => {
    checkRow(board, "career " + i, MX, cy + 140 + i * 48, 560, t);
  });
  rect(board, "career card", MX + 680, cy, 600, 456, C.navy);
  label(board, "career card t", "Career outcomes", MX + 724, cy + 44, 520,
    { size: 24, weight: "700", color: C.white });
  label(board, "career card d", LOREM_S, MX + 724, cy + 88, 512,
    { size: 15, color: C.navyText });
  [["—", "Lorem"], ["—", "Ipsum"], ["—", "Dolor"]].forEach((s, i) => {
    const bx = MX + 724 + i * 170;
    label(board, "career stat n " + i, s[0], bx, cy + 200, 160,
      { size: 40, weight: "700", color: C.white, align: "center" });
    label(board, "career stat l " + i, s[1], bx, cy + 252, 160,
      { size: 13, color: C.navyText, align: "center" });
  });
  button(board, "career cta", MX + 724, cy + 340, 300, 52,
    "Start Your Career Journey", C.orange, C.white);
  y += ch;

  // steps
  yy = secHead(board, "steps", y + 72, "How it works", "Lorem ipsum dolor sit", "");
  const steps = ["Lorem ipsum", "Dolor sit", "Amet consectetur", "Adipiscing elit"];
  steps.forEach((s, i) => {
    const bx = MX + i * 320;
    circle(board, "step n " + i, bx, yy, 56, C.orange);
    label(board, "step num " + i, String(i + 1), bx, yy + 14, 56,
      { size: 22, weight: "800", color: C.white, align: "center" });
    label(board, "step t " + i, s, bx + 72, yy + 4, 230, { size: 18, weight: "700" });
    label(board, "step d " + i, LOREM_S, bx + 72, yy + 32, 230,
      { size: 14, color: C.gray });
  });
  y = yy + 120 + 72;

  // testimonials
  yy = secHead(board, "testi", y, "Testimonials", "What learners say", "");
  const tw = (CW - 2 * 24) / 3;
  for (let i = 0; i < 3; i++) {
    const bx = MX + i * (tw + 24);
    rect(board, "testi " + i, bx, yy, tw, 300, C.white);
    outlinedRect(board, "testi " + i + " border", bx, yy, tw, 300, C.border, 1);
    label(board, "testi quote " + i, '"' + LOREM_S + '"', bx + 28, yy + 28, tw - 56,
      { size: 15, color: C.gray });
    circle(board, "testi avatar " + i, bx + 28, yy + 200, 52, C.imgBg);
    label(board, "testi name " + i, "[Full name]", bx + 96, yy + 206, 220,
      { size: 16, weight: "700" });
    label(board, "testi role " + i, "[Role / batch]", bx + 96, yy + 232, 220,
      { size: 13, color: C.lightGray });
  }
  y = yy + 300 + 72;

  // FAQ
  yy = secHead(board, "faq", y, "FAQ", "Frequently asked questions", "");
  y = faqList(board, "faq", yy, [LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q]) + 72;

  y = ctaBand(board, y, "Ready to start learning?", LOREM_S);
  y = footer(board, y);
  return y;
}

// ---------- ABOUT ----------
function drawAbout(board) {
  let y = 0;
  y = navbar(board, y, "About");
  y = pageHero(board, y, "About Us", LOREM_P);

  // mission split
  let yy = y + 72;
  img(board, "about image", MX, yy, 560, 420, "ABOUT IMAGE");
  label(board, "about eyebrow", "OUR MISSION", MX + 640, yy + 20, 640,
    { size: 13, weight: "700", color: C.orange });
  label(board, "about h2", LOREM_H + " sed do.", MX + 640, yy + 50, 640,
    { size: 36, weight: "700" });
  label(board, "about p1", LOREM_P, MX + 640, yy + 140, 640,
    { size: 16, color: C.gray });
  label(board, "about p2", LOREM_P, MX + 640, yy + 250, 640,
    { size: 16, color: C.gray });
  y = yy + 420 + 72;

  // stats (placeholders)
  yy = y;
  rect(board, "stats bg", 0, yy, W, 220, C.navy);
  for (let i = 0; i < 4; i++) {
    const bx = MX + i * 320;
    label(board, "stat n " + i, "[000]+", bx, yy + 60, 280,
      { size: 44, weight: "800", color: C.white, align: "center" });
    label(board, "stat l " + i, "Lorem ipsum", bx, yy + 124, 280,
      { size: 15, color: C.navyText, align: "center" });
  }
  y = yy + 220 + 72;

  // values
  yy = secHead(board, "values", y, "Our values", "What we stand for", "");
  const vw = (CW - 2 * 24) / 3;
  ["Lorem ipsum", "Dolor sit", "Amet consectetur"].forEach((v, i) => {
    const bx = MX + i * (vw + 24);
    rect(board, "val " + i, bx, yy, vw, 220, C.orangeSoft);
    label(board, "val t " + i, v, bx + 32, yy + 48, vw - 64,
      { size: 22, weight: "700", align: "center" });
    label(board, "val d " + i, LOREM_S, bx + 32, yy + 92, vw - 64,
      { size: 15, color: C.gray, align: "center" });
  });
  y = yy + 220 + 72;

  // timeline
  yy = secHead(board, "story", y, "Our story", "Lorem ipsum dolor", "");
  rect(board, "timeline line", MX + 8, yy, 2, 4 * 110, C.border);
  for (let i = 0; i < 4; i++) {
    const by = yy + i * 110;
    circle(board, "tl dot " + i, MX, by, 18, C.orange);
    label(board, "tl year " + i, "[20XX]", MX + 40, by - 4, 120,
      { size: 15, weight: "700", color: C.orange });
    label(board, "tl t " + i, LOREM_H, MX + 40, by + 22, 900, { size: 17, weight: "600" });
    label(board, "tl d " + i, LOREM_S, MX + 40, by + 50, 900,
      { size: 14, color: C.gray });
  }
  y = yy + 4 * 110 + 72;

  y = ctaBand(board, y, "Want to know more?", LOREM_S);
  y = footer(board, y);
  return y;
}

// ---------- SERVICES ----------
function drawServices(board) {
  let y = 0;
  y = navbar(board, y, "Services");
  y = pageHero(board, y, "Our Services", LOREM_P);

  let yy = secHead(board, "svc", y + 72, "What we do", "Services for every need", LOREM_S);
  const svcs = ["Corporate Training", "Cyber Security", "Web Development",
                "Digital Marketing", "Cloud Consulting", "IT Support"];
  const sw = (CW - 2 * 24) / 3;
  svcs.forEach((s, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const bx = MX + col * (sw + 24), by = yy + row * 300;
    rect(board, "svc " + i, bx, by, sw, 276, C.white);
    outlinedRect(board, "svc " + i + " border", bx, by, sw, 276, C.border, 1);
    rect(board, "svc icon " + i, bx + 32, by + 32, 56, 56, C.orangeSoft);
    label(board, "svc title " + i, s, bx + 32, by + 110, sw - 64, { size: 21, weight: "700" });
    label(board, "svc desc " + i, LOREM_S, bx + 32, by + 146, sw - 64,
      { size: 15, color: C.gray });
    label(board, "svc link " + i, "Learn more →", bx + 32, by + 228, 200,
      { size: 15, weight: "700", color: C.orange });
  });
  y = yy + 2 * 300 + 72;

  // process
  yy = secHead(board, "proc", y, "Process", "How we work", "");
  const steps = ["Lorem ipsum", "Dolor sit", "Amet consectetur", "Adipiscing elit"];
  steps.forEach((s, i) => {
    const bx = MX + i * 320;
    circle(board, "proc n " + i, bx, yy, 56, C.navy);
    label(board, "proc num " + i, String(i + 1), bx, yy + 14, 56,
      { size: 22, weight: "800", color: C.white, align: "center" });
    label(board, "proc t " + i, s, bx + 72, yy + 4, 230, { size: 18, weight: "700" });
    label(board, "proc d " + i, LOREM_S, bx + 72, yy + 32, 230,
      { size: 14, color: C.gray });
  });
  y = yy + 120 + 72;

  y = ctaBand(board, y, "Have a project in mind?", LOREM_S);
  y = footer(board, y);
  return y;
}

// ---------- COURSES ----------
const COURSE_CATALOG = [
  ["ccna", "CCNA", "Networking"],
  ["soc-analyst", "SOC Analyst", "Cyber Security"],
  ["digital-marketing", "Digital Marketing", "Marketing"],
  ["comptia-pentest", "CompTIA Pentest+", "Cyber Security"],
  ["comptia-network", "CompTIA Network+", "Networking"],
];

function drawCourses(board) {
  let y = 0;
  y = navbar(board, y, "Courses");
  y = pageHero(board, y, "Our Courses", LOREM_P);

  let yy = y + 56;
  let cx = MX;
  ["All", "Networking", "Cyber Security", "Marketing"].forEach((c, i) => {
    const w = chip(board, "filter " + i, cx, yy, c, i === 0 ? C.white : C.dark, i === 0 ? C.orange : C.white);
    cx += w + 12;
  });
  yy += 36 + 56;

  COURSE_CATALOG.forEach((c, i) => {
    const by = yy + i * 300, chh = 276;
    rect(board, "clist " + i, MX, by, CW, chh, C.white);
    outlinedRect(board, "clist " + i + " border", MX, by, CW, chh, C.border, 1);
    img(board, "clist img " + i, MX + 24, by + 24, 320, 228, "IMAGE");
    chip(board, "clist cat " + i, MX + 380, by + 32, c[2], C.orange, C.orangeSoft);
    label(board, "clist title " + i, c[0], MX + 380, by + 84, 700,
      { size: 30, weight: "700" });
    label(board, "clist desc " + i, LOREM_P, MX + 380, by + 130, 560,
      { size: 15, color: C.gray });
    label(board, "clist meta " + i, "[Duration]  •  [Level]  •  [Mode]",
      MX + 380, by + 216, 560, { size: 13, color: C.lightGray });
    button(board, "clist cta " + i, MX + CW - 240, by + 110, 200, 52,
      "View Course", C.orange, C.white);
  });
  y = yy + 5 * 300 + 72;

  y = ctaBand(board, y, "Not sure which course fits?", LOREM_S);
  y = footer(board, y);
  return y;
}

// ---------- COURSE DETAIL (one board per course) ----------
function drawCourseDetail(board, key) {
  const found = COURSE_CATALOG.find((c) => c[0] === key);
  const name = found ? found[1] : key;
  const cat = found ? found[2] : "Lorem";
  let y = 0;
  y = navbar(board, y, "Courses");

  // breadcrumb
  label(board, "crumb", "Home  /  Courses  /  " + name, MX, y + 32, CW,
    { size: 14, color: C.lightGray });
  y += 72;

  // course hero
  const hh = 560;
  rect(board, "chero bg", 0, y, W, hh, C.orangeSoft);
  chip(board, "chero cat", MX, y + 72, cat.toUpperCase());
  label(board, "chero h1", name, MX, y + 128, 620, { size: 52, weight: "800" });
  label(board, "chero sub", LOREM_P, MX, y + 210, 560, { size: 17, color: C.gray });
  let mx = MX;
  ["[Duration]", "[Level]", "[Mode]"].forEach((m, i) => {
    const w = chip(board, "chero meta " + i, mx, y + 330, m, C.dark, C.white);
    mx += w + 12;
  });
  button(board, "chero cta1", MX, y + 400, 210, 54, "Enroll Now", C.orange, C.white);
  outlineButton(board, "chero cta2", MX + 226, y + 400, 240, 54, "Download Syllabus", C.orange);
  img(board, "chero image", MX + 720, y + 72, 560, 416, "COURSE IMAGE");
  y += hh;

  // what you will learn
  let yy = secHead(board, "learn", y + 72, "Curriculum", "What you will learn", "");
  for (let i = 0; i < 6; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    checkRow(board, "learn " + i, MX + col * 640, yy + row * 56, 620, LOREM_S);
  }
  y = yy + 3 * 56 + 72;

  // modules
  yy = secHead(board, "mods", y, "Syllabus", "Course modules", "");
  for (let i = 0; i < 6; i++) {
    const by = yy + i * 92;
    rect(board, "mod " + i, MX, by, CW, 80, C.white);
    outlinedRect(board, "mod " + i + " border", MX, by, CW, 80, C.border, 1);
    label(board, "mod n " + i, "Module " + (i + 1), MX + 28, by + 28, 140,
      { size: 15, weight: "700", color: C.orange });
    label(board, "mod t " + i, LOREM_H, MX + 180, by + 28, 800, { size: 16, weight: "600" });
    label(board, "mod m " + i, "[N] lessons", MX + CW - 160, by + 28, 132,
      { size: 14, color: C.lightGray, align: "right" });
  }
  y = yy + 6 * 92 + 72;

  // upcoming batches (CyberAegis-style cards, placeholders only)
  yy = secHead(board, "batch", y, "Batches", "Upcoming batches", "");
  const bww = (CW - 2 * 24) / 3;
  for (let i = 0; i < 3; i++) {
    const bx = MX + i * (bww + 24);
    rect(board, "batch " + i, bx, yy, bww, 300, C.navy);
    label(board, "batch mode " + i, "[Weekday / Weekend]", bx + 32, yy + 36, bww - 64,
      { size: 13, weight: "700", color: C.orange });
    label(board, "batch date " + i, "[Start date]", bx + 32, yy + 66, bww - 64,
      { size: 26, weight: "700", color: C.white });
    label(board, "batch time " + i, "[Timing]", bx + 32, yy + 110, bww - 64,
      { size: 15, color: C.navyText });
    label(board, "batch seats " + i, "[N] seats left", bx + 32, yy + 140, bww - 64,
      { size: 15, color: C.navyText });
    button(board, "batch cta " + i, bx + 32, yy + 200, 220, 48,
      "Reserve Seat", C.orange, C.white);
  }
  y = yy + 300 + 72;

  // career support checklist
  const chh = 520;
  rect(board, "ccareer bg", 0, y, W, chh, C.bgGray);
  let cy = y + 64;
  label(board, "ccareer h2", "Career support included", MX, cy, 700,
    { size: 32, weight: "700" });
  ["Resume building", "Mock interviews", "LinkedIn profile optimization",
   "Soft-skills coaching", "1:1 mentorship", "Job-search guidance"].forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    checkRow(board, "ccareer " + i, MX + col * 640, cy + 80 + row * 56, 620, t);
  });
  label(board, "ccareer note", LOREM_S, MX, cy + 80 + 3 * 56 + 16, 900,
    { size: 15, color: C.gray });
  y += chh;

  // FAQ
  yy = secHead(board, "cfaq", y + 72, "FAQ", "Course FAQs", "");
  y = faqList(board, "cfaq", yy, [LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q]) + 72;

  y = ctaBand(board, y, "Ready to enroll in " + name + "?", LOREM_S);
  y = footer(board, y);
  return y;
}

// ---------- TEAM ----------
function drawTeam(board) {
  let y = 0;
  y = navbar(board, y, "Team");
  y = pageHero(board, y, "Our Team", LOREM_P);

  let yy = secHead(board, "tm", y + 72, "Leadership", "Meet the team", LOREM_S);
  const tw = (CW - 2 * 24) / 3;
  for (let i = 0; i < 3; i++) {
    const bx = MX + i * (tw + 24), th = 520;
    rect(board, "tm " + i, bx, yy, tw, th, C.white);
    outlinedRect(board, "tm " + i + " border", bx, yy, tw, th, C.border, 1);
    img(board, "tm photo " + i, bx + 32, yy + 32, 160, 160, "PHOTO");
    label(board, "tm name " + i, "[Full name]", bx + 216, yy + 60, tw - 248,
      { size: 22, weight: "700" });
    label(board, "tm role " + i, "[Role / title]", bx + 216, yy + 94, tw - 248,
      { size: 15, weight: "700", color: C.orange });
    label(board, "tm bio " + i, LOREM_P, bx + 32, yy + 224, tw - 64,
      { size: 15, color: C.gray });
    label(board, "tm social " + i, "[LinkedIn profile]", bx + 32, yy + 420, 240,
      { size: 14, weight: "700", color: C.orange });
  }
  y = yy + 520 + 72;

  // culture values
  yy = secHead(board, "tval", y, "Culture", "What we stand for", "");
  ["Lorem ipsum", "Dolor sit", "Amet consectetur"].forEach((v, i) => {
    const bx = MX + i * (tw + 24);
    rect(board, "tval " + i, bx, yy, tw, 180, C.orangeSoft);
    label(board, "tval t " + i, v, bx + 32, yy + 52, tw - 64,
      { size: 21, weight: "700", align: "center" });
    label(board, "tval d " + i, LOREM_S, bx + 32, yy + 92, tw - 64,
      { size: 14, color: C.gray, align: "center" });
  });
  y = yy + 180 + 72;

  // hiring strip with logo placeholders
  y = logoStrip(board, "hiring", y, "LOREM IPSUM DOLOR SIT AMET", 4) + 72;

  y = ctaBand(board, y, "Want to join the team?", LOREM_S);
  y = footer(board, y);
  return y;
}

// ---------- CONTACT ----------
function drawContact(board) {
  let y = 0;
  y = navbar(board, y, "Contact");
  y = pageHero(board, y, "Contact Us", LOREM_P);

  let yy = y + 72;
  // form (left)
  rect(board, "form", MX, yy, 620, 640, C.white);
  outlinedRect(board, "form border", MX, yy, 620, 640, C.border, 1);
  label(board, "form t", "Send us a message", MX + 40, yy + 36, 540,
    { size: 24, weight: "700" });
  const fields = ["Your name", "Email address", "Phone number"];
  fields.forEach((f, i) => {
    const fy = yy + 96 + i * 92;
    label(board, "fld label " + i, f, MX + 40, fy, 540, { size: 14, weight: "600" });
    outlinedRect(board, "fld box " + i, MX + 40, fy + 26, 540, 48, C.border, 1);
    label(board, "fld ph " + i, "Lorem ipsum", MX + 56, fy + 41, 400,
      { size: 14, color: C.lightGray });
  });
  const my = yy + 96 + 3 * 92;
  label(board, "fld label m", "Message", MX + 40, my, 540, { size: 14, weight: "600" });
  outlinedRect(board, "fld box m", MX + 40, my + 26, 540, 120, C.border, 1);
  label(board, "fld ph m", "Lorem ipsum dolor sit amet…", MX + 56, my + 42, 400,
    { size: 14, color: C.lightGray });
  button(board, "form send", MX + 40, my + 172, 220, 52, "Send Message", C.orange, C.white);

  // info cards (right)
  const infos = [
    ["[Phone number]", "Lorem ipsum dolor"],
    ["[Email address]", "Lorem ipsum dolor"],
    ["[Office address]", "Lorem ipsum, Hyderabad"],
    ["[Working hours]", "Lorem ipsum dolor"],
  ];
  infos.forEach((inf, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = MX + 660 + col * 320, by = yy + row * 250;
    rect(board, "cinfo " + i, bx, by, 300, 220, C.white);
    outlinedRect(board, "cinfo " + i + " border", bx, by, 300, 220, C.border, 1);
    rect(board, "cinfo icon " + i, bx + 24, by + 24, 44, 44, C.orangeSoft);
    label(board, "cinfo t " + i, inf[0], bx + 24, by + 86, 252, { size: 17, weight: "700" });
    label(board, "cinfo d " + i, inf[1], bx + 24, by + 116, 252,
      { size: 14, color: C.gray });
  });
  // whatsapp button
  button(board, "wa", MX + 660, yy + 2 * 250 + 24, 300, 52, "WhatsApp Us", "#059669", C.white);
  y = yy + 640 + 72;

  // map placeholder
  img(board, "map", MX, y, CW, 320, "MAP PLACEHOLDER");
  y += 320 + 72;

  y = footer(board, y);
  return y;
}

// ---------- dispatcher ----------
const PAGES = {
  home: ["Home", drawHome],
  about: ["About", drawAbout],
  services: ["Services", drawServices],
  courses: ["Courses", drawCourses],
  team: ["Team", drawTeam],
  contact: ["Contact", drawContact],
};
COURSE_CATALOG.forEach((c) => {
  PAGES[c[0]] = [c[1], function (board) { return drawCourseDetail(board, c[0]); }];
});

function drawSitePage(key) {
  const def = PAGES[key];
  if (!def) throw new Error("unknown page: " + key);
  progress("Drawing " + def[0] + "…");
  const board = penpot.createBoard();
  board.name = def[0];
  board.x = 0; board.y = 0;
  board.resize(W, 200);
  board.fills = [{ fillColor: C.white }];
  const h = Math.ceil(def[1](board));
  board.resize(W, h);
  return { board: def[0], height: h };
}

penpot.ui.onMessage((message) => {
  if (!message || typeof message.type !== "string") return;
  try {
    if (message.type === "draw") {
      const r = drawSitePage(message.page);
      penpot.ui.sendMessage({
        type: "done", ok: true,
        detail: "Drew '" + r.board + "' (" + r.height + "px tall) on this page.",
      });
    } else if (message.type === "new-page") {
      const p = penpot.createPage("Designs v2");
      penpot.ui.sendMessage({
        type: "done", ok: true,
        detail: "Created page 'Designs v2' — click it in the pages panel, then draw each board.",
      });
    } else if (message.type === "test-hero") {
      progress("Drawing test hero…");
      const board = penpot.createBoard();
      board.name = "Test hero";
      board.resize(W, 900);
      board.fills = [{ fillColor: C.white }];
      navbar(board, 0, "Home");
      img(board, "test image", MX, 160, 600, 400, "TEST IMAGE");
      logoStrip(board, "test logos", 620, "LOGO STRIP TEST", 3);
      penpot.ui.sendMessage({ type: "done", ok: true, detail: "Test hero drawn." });
    }
  } catch (err) {
    penpot.ui.sendMessage({
      type: "done", ok: false,
      detail: "Error at '" + lastStep + "': " + (err && err.message ? err.message : String(err)),
    });
  }
});
