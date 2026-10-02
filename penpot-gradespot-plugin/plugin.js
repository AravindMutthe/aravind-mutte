// GradeSpot Designer v3 — Penpot plugin (no server needed).
// Brief from Aravind (2026-10-02): replicate the two reference sites COMPLETELY —
// their headers, navbars, footers and full section inventory on every page.
// Primary skeleton: gsitssolutions.com (nav, footer, home/about/course/service
// page structures). Training-specific sections: cyberaegis.in (batches grid,
// career support, marquee ticker, categories, steps).
// RULE: structure/layout only — all copy is lorem ipsum dummy text and every
// number, testimonial, date, fee, name, badge or contact detail is a bracketed
// placeholder until Aravind confirms real facts. Never invent claims.
// Menu visual style follows Aravind's portfolio (logo-mark + wordmark + CTA).

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
  green: "#059669",
};
const W = 1440;
const MX = 80;
const CW = W - MX * 2;

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

// ---------- NAVBAR: gsitssolutions.com menu, portfolio visual style ----------
// GSI top-level: Home | About Us | Trainings | Resources ▾ | Digital | Services | Contact Us
// Resources ▾ children: Team Members, Why Choose Us, Testimonials, Blog,
//   Student Certifications, Certificate Verification
const NAV_LINKS = ["Home", "About Us", "Trainings", "Resources ▾", "Digital", "Services", "Contact Us"];
function navbar(board, y, active) {
  const h = 76;
  rect(board, "nav bg", 0, y, W, h, C.white);
  rect(board, "nav border", 0, y + h - 1, W, 1, C.border);
  logoLockup(board, "nav logo", MX, y + 16, true);
  let lx = 400;
  NAV_LINKS.forEach((l) => {
    const plain = l.replace(" ▾", "");
    const on = (plain === active) ||
      (plain === "Resources" && (active === "Team Members" || active === "Why Choose Us")) ||
      (plain === "Trainings" && ["CCNA", "SOC Analyst", "Digital Marketing", "CompTIA Pentest+", "CompTIA Network+"].indexOf(active) >= 0);
    label(board, "nav " + plain, l, lx, y + 27, 104,
      { size: 14, weight: on ? "700" : "500", color: on ? C.dark : C.gray });
    if (on) rect(board, "nav active " + plain, lx, y + 54, 30, 3, C.orange);
    lx += 98;
  });
  const bw = 170;
  button(board, "nav cta", W - MX - bw, y + 15, bw, 46, "Talk to a Trainer", C.orange, C.white);
  return y + h;
}

// ---------- FOOTER: gsitssolutions.com structure ----------
// brand | Company | Solutions | Contact Info + bottom bar
function footer(board, y) {
  const h = 470;
  rect(board, "footer bg", 0, y, W, h, C.navy);
  // col 1: brand
  logoLockup(board, "f logo", MX, y + 52, false);
  label(board, "f blurb", LOREM_S, MX, y + 120, 280, { size: 14, color: C.navyText });
  for (let i = 0; i < 4; i++) {
    circle(board, "f social " + i, MX + i * 52, y + 210, 40, null, "#334155");
    label(board, "f social icon " + i, "○", MX + i * 52, y + 218, 40,
      { size: 16, color: C.navyText, align: "center" });
  }
  // col 2: Company
  label(board, "f h2", "Company", 440, y + 52, 200, { size: 16, weight: "700", color: C.white });
  ["Meet Our Team", "Help & FAQs", "Our Services", "Why Choose Us"].forEach((l, i) => {
    label(board, "f co " + i, l, 440, y + 90 + i * 30, 220, { size: 14, color: C.navyText });
  });
  // col 3: Solutions
  label(board, "f h3", "Solutions", 700, y + 52, 240, { size: 16, weight: "700", color: C.white });
  ["Corporate Training", "Cyber Security", "Web Development", "Digital Marketing", "Case Studies"].forEach((l, i) => {
    label(board, "f sol " + i, l, 700, y + 90 + i * 30, 260, { size: 14, color: C.navyText });
  });
  // col 4: Contact Info
  label(board, "f h4", "Contact Info", 990, y + 52, 340, { size: 16, weight: "700", color: C.white });
  ["[Email address]", "[Alternate email]", "[Phone number]", "[Alternate phone]"].forEach((l, i) => {
    label(board, "f contact " + i, l, 990, y + 90 + i * 30, 340, { size: 14, color: C.navyText });
  });
  // bottom bar
  rect(board, "f divider", MX, y + h - 72, CW, 1, C.navyBorder);
  label(board, "f copy", "© [Year] GradeSpot IT Solutions Pvt. Ltd.",
    MX, y + h - 46, 600, { size: 13, color: C.navyText });
  label(board, "f legal", "Home      Testimonials      Our Services      Terms and Conditions",
    W - MX - 480, y + h - 46, 480, { size: 13, color: C.navyText, align: "right" });
  return y + h;
}

// floating WhatsApp chat button (CyberAegis pattern) — call after total height known
function whatsappFloat(board, totalH) {
  circle(board, "wa float", W - 110, totalH - 110, 64, C.green);
  label(board, "wa float label", "WA", W - 110, totalH - 92, 64,
    { size: 18, weight: "800", color: C.white, align: "center" });
}

// ---------- shared sections ----------
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

function ctaBand(board, y, title, sub, btnText) {
  const h = 360;
  rect(board, "cta bg", 0, y, W, h, C.orange);
  label(board, "cta title", title, MX, y + 90, CW,
    { size: 38, weight: "700", color: C.white, align: "center" });
  label(board, "cta sub", sub, (W - 640) / 2, y + 156, 640,
    { size: 17, color: C.white, align: "center" });
  const bw = 240;
  button(board, "cta btn", (W - bw) / 2, y + 236, bw, 54, btnText || "Talk to a Trainer", C.white, C.orange);
  return y + h;
}

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

function checkRow(board, name, x, y, w, text) {
  circle(board, name + " dot", x, y + 2, 22, C.orangeSoft);
  label(board, name + " check", "✓", x, y, 22,
    { size: 15, weight: "700", color: C.orange, align: "center" });
  label(board, name + " text", text, x + 36, y, w - 36, { size: 16 });
}

// stat counter band (GSI pattern) — stats: [[value, label]...]
function statsBand(board, name, y, stats) {
  const h = 220;
  rect(board, name + " bg", 0, y, W, h, C.navy);
  const n = stats.length, colw = CW / n;
  stats.forEach((s, i) => {
    const bx = MX + i * colw;
    label(board, name + " n " + i, s[0], bx, y + 60, colw,
      { size: 44, weight: "800", color: C.white, align: "center" });
    label(board, name + " l " + i, s[1], bx, y + 124, colw,
      { size: 15, color: C.navyText, align: "center" });
  });
  return y + h;
}

// marquee ticker strip (CyberAegis pattern)
function marquee(board, y) {
  const h = 64;
  rect(board, "ticker bg", 0, y, W, h, C.dark);
  label(board, "ticker text",
    "LOREM IPSUM DOLOR  •  SIT AMET CONSECTETUR  •  ADIPISCING ELIT  •  SED DO EIUSMOD  •  TEMPOR INCIDIDUNT  •  LOREM IPSUM DOLOR  •  SIT AMET",
    MX, y + 21, CW, { size: 14, weight: "700", color: C.white, align: "center" });
  return y + h;
}

// numbered process steps — steps: [[num, title, desc]...]
function processSteps(board, name, y, steps) {
  let yy = y;
  const n = steps.length, colw = CW / n;
  steps.forEach((s, i) => {
    const bx = MX + i * colw;
    label(board, name + " num " + i, s[0], bx, yy, colw,
      { size: 44, weight: "800", color: C.orange });
    label(board, name + " t " + i, s[1], bx, yy + 58, colw - 24, { size: 18, weight: "700" });
    label(board, name + " d " + i, s[2], bx, yy + 88, colw - 24,
      { size: 14, color: C.gray });
  });
  return yy + 170;
}

// leadership cards (GSI "Meet Our Leadership")
function leadershipCards(board, name, y) {
  const tw = (CW - 2 * 24) / 3;
  for (let i = 0; i < 3; i++) {
    const bx = MX + i * (tw + 24), th = 460;
    rect(board, name + " " + i, bx, y, tw, th, C.white);
    outlinedRect(board, name + " " + i + " border", bx, y, tw, th, C.border, 1);
    img(board, name + " photo " + i, bx + 32, y + 32, tw - 64, 240, "PHOTO");
    label(board, name + " name " + i, "[Full name]", bx + 32, y + 296, tw - 64,
      { size: 20, weight: "700" });
    label(board, name + " role " + i, "[Role / title]", bx + 32, y + 328, tw - 64,
      { size: 14, weight: "700", color: C.orange });
    label(board, name + " bio " + i, LOREM_S, bx + 32, y + 358, tw - 64,
      { size: 14, color: C.gray });
  }
  return y + 460;
}

// testimonial cards — placeholders only
function testimonialCards(board, name, y, count) {
  const gap = 24, tw = (CW - (count - 1) * gap) / count;
  for (let i = 0; i < count; i++) {
    const bx = MX + i * (tw + gap), th = 300;
    rect(board, name + " " + i, bx, y, tw, th, C.white);
    outlinedRect(board, name + " " + i + " border", bx, y, tw, th, C.border, 1);
    label(board, name + " quote " + i, '"' + LOREM_S + '"', bx + 28, y + 28, tw - 56,
      { size: 15, color: C.gray });
    circle(board, name + " avatar " + i, bx + 28, y + 200, 52, C.imgBg);
    label(board, name + " name " + i, "[Full name]", bx + 96, y + 206, tw - 140,
      { size: 16, weight: "700" });
    label(board, name + " role " + i, "[Course / role]", bx + 96, y + 232, tw - 140,
      { size: 13, color: C.lightGray });
  }
  return y + 300;
}

// ---------- HOME ----------
// Section order replicates gsitssolutions.com home + cyberaegis.in home.
function drawHome(board) {
  let y = 0;
  y = navbar(board, y, "Home");

  // 1. hero (GSI: H1 + paragraph + dual CTA; CyberAegis: trust chips)
  const hh = 680;
  rect(board, "hero bg", 0, y, W, hh, C.orangeSoft);
  chip(board, "hero badge", MX, y + 80, "LOREM IPSUM DOLOR");
  label(board, "hero h1", LOREM_H + " sed do eiusmod tempor.",
    MX, y + 140, 620, { size: 54, weight: "800", color: C.dark });
  label(board, "hero sub", LOREM_P, MX, y + 322, 560, { size: 18, color: C.gray });
  button(board, "hero cta1", MX, y + 452, 230, 54, "Talk to a Trainer", C.orange, C.white);
  outlineButton(board, "hero cta2", MX + 246, y + 452, 230, 54, "Explore Trainings", C.orange);
  img(board, "hero image", MX + 720, y + 80, 560, 500, "HERO IMAGE");
  y += hh;

  // trust chips (placeholders only)
  let yy = y + 48;
  let cx = MX;
  ["[000]+ Lorem", "[00]+ Ipsum", "[0]+ Dolor"].forEach((c, i) => {
    const w = chip(board, "trust " + i, cx, yy, c, C.dark, C.white);
    cx += w + 12;
  });
  y = yy + 36 + 48;

  // 2. marquee ticker (CyberAegis)
  y = marquee(board, y);

  // 3. featured services (GSI card grid)
  yy = secHead(board, "fsvc", y + 72, "Featured Services", "Lorem ipsum dolor sit", LOREM_S);
  const fsvcs = ["Corporate Training", "Cyber Security", "Web Development", "Digital Marketing"];
  const fw = (CW - 3 * 24) / 4;
  fsvcs.forEach((s, i) => {
    const bx = MX + i * (fw + 24);
    rect(board, "fsvc " + i, bx, yy, fw, 260, C.white);
    outlinedRect(board, "fsvc " + i + " border", bx, yy, fw, 260, C.border, 1);
    rect(board, "fsvc icon " + i, bx + 28, yy + 28, 52, 52, C.orangeSoft);
    label(board, "fsvc title " + i, s, bx + 28, yy + 100, fw - 56, { size: 19, weight: "700" });
    label(board, "fsvc desc " + i, LOREM_S, bx + 28, yy + 134, fw - 56,
      { size: 14, color: C.gray });
  });
  y = yy + 260 + 72;

  // 4. experience intro block (GSI: years badge + H2 + credential badges)
  const eh = 420;
  rect(board, "exp bg", 0, y, W, eh, C.white);
  yy = y + 72;
  img(board, "exp image", MX, yy, 480, 276, "IMAGE");
  rect(board, "exp badge", MX + 360, yy + 200, 200, 120, C.orange);
  label(board, "exp badge n", "[X]", MX + 360, yy + 216, 200,
    { size: 36, weight: "800", color: C.white, align: "center" });
  label(board, "exp badge l", "Years of experience", MX + 360, yy + 260, 200,
    { size: 13, color: C.white, align: "center" });
  label(board, "exp h2", LOREM_H + " sed do.", MX + 600, yy + 10, 680,
    { size: 34, weight: "700" });
  label(board, "exp p", LOREM_P, MX + 600, yy + 100, 660, { size: 16, color: C.gray });
  cx = MX + 600;
  ["[Certification badge]", "[Approval badge]"].forEach((b, i) => {
    const w = chip(board, "exp cred " + i, cx, yy + 220, b, C.orange, C.orangeSoft);
    cx += w + 12;
  });
  y += eh;

  // 5. upcoming batches grid (CyberAegis)
  yy = secHead(board, "batch", y + 72, "Admissions open", "Upcoming batches", LOREM_S);
  const bcourses = ["CCNA", "SOC Analyst", "Digital Marketing", "CompTIA Pentest+", "CompTIA Network+", LOREM_H];
  const bw2 = (CW - 2 * 24) / 3;
  bcourses.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const bx = MX + col * (bw2 + 24), by = yy + row * 300;
    rect(board, "batch " + i, bx, by, bw2, 276, C.white);
    outlinedRect(board, "batch " + i + " border", bx, by, bw2, 276, C.border, 1);
    label(board, "batch c " + i, c, bx + 28, by + 28, bw2 - 56, { size: 20, weight: "700" });
    chip(board, "batch dur " + i, bx + 28, by + 64, "[Duration]", C.orange, C.orangeSoft);
    label(board, "batch date " + i, "[Start date]", bx + 28, by + 120, bw2 - 56,
      { size: 16, weight: "600" });
    label(board, "batch time " + i, "[Class timings]", bx + 28, by + 150, bw2 - 56,
      { size: 14, color: C.gray });
    button(board, "batch cta " + i, bx + 28, by + 196, 200, 48, "Enquire Now", C.green, C.white);
  });
  y = yy + 2 * 300 + 72;

  // 6. social proof band (GSI: trusted-by + checklist + CTA)
  const sph = 380;
  rect(board, "sp bg", 0, y, W, sph, C.bgGray);
  yy = y + 72;
  label(board, "sp h2", "Lorem ipsum dolor sit amet", MX, yy, 600, { size: 32, weight: "700" });
  ["Lorem ipsum dolor", "Consectetur adipiscing", "Sed do eiusmod"].forEach((t, i) => {
    checkRow(board, "sp " + i, MX, yy + 80 + i * 48, 560, t);
  });
  button(board, "sp cta", MX, yy + 80 + 3 * 48 + 8, 230, 52, "Talk to a Trainer", C.orange, C.white);
  img(board, "sp image", MX + 720, yy, 560, 236, "IMAGE");
  y += sph;

  // 7. stats counter band (GSI)
  y = statsBand(board, "hstats", y,
    [["[0000]", "Lorem ipsum"], ["[0000]", "Dolor sit"], ["[000]", "Amet"], ["[00]", "Consectetur"]]) + 0;

  // 8. course category cards (CyberAegis: 6 categories)
  yy = secHead(board, "cats", y + 72, "Categories", "Explore by category", "");
  const cats = ["Cyber Security", "Software Development", "Cloud & DevOps", "Data & Analytics", "AI", "Software Testing"];
  const catw = (CW - 2 * 24) / 3;
  cats.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const bx = MX + col * (catw + 24), by = yy + row * 220;
    rect(board, "cat " + i, bx, by, catw, 196, C.white);
    outlinedRect(board, "cat " + i + " border", bx, by, catw, 196, C.border, 1);
    rect(board, "cat icon " + i, bx + 28, by + 28, 48, 48, C.orangeSoft);
    label(board, "cat t " + i, c, bx + 28, by + 94, catw - 56, { size: 19, weight: "700" });
    label(board, "cat d " + i, LOREM_S, bx + 28, by + 126, catw - 56,
      { size: 13, color: C.gray });
  });
  y = yy + 2 * 220 + 72;

  // 9. why choose us (CyberAegis: 4 cards)
  yy = secHead(board, "why", y, "Why choose us", "Lorem ipsum dolor sit", "");
  const whys = ["Lorem ipsum", "Dolor sit", "Amet consectetur", "Adipiscing elit"];
  whys.forEach((w2, i) => {
    const bx = MX + i * (fw + 24);
    rect(board, "why " + i, bx, yy, fw, 240, C.white);
    outlinedRect(board, "why " + i + " border", bx, yy, fw, 240, C.border, 1);
    rect(board, "why icon " + i, bx + 28, yy + 28, 52, 52, C.orangeSoft);
    label(board, "why t " + i, w2, bx + 28, yy + 100, fw - 56, { size: 19, weight: "700" });
    label(board, "why d " + i, LOREM_S, bx + 28, yy + 134, fw - 56,
      { size: 14, color: C.gray });
  });
  y = yy + 240 + 72;

  // 10. career & placement support split (CyberAegis)
  const ch = 600;
  rect(board, "career bg", 0, y, W, ch, C.bgGray);
  let cy = y + 72;
  label(board, "career eyebrow", "CAREER SUPPORT", MX, cy, 600,
    { size: 13, weight: "700", color: C.orange });
  label(board, "career h2", "From learning to getting hired", MX, cy + 30, 600,
    { size: 36, weight: "700" });
  ["Resume building", "Mock interviews", "LinkedIn profile optimization",
   "Soft-skills coaching", "1:1 mentorship", "Job-search guidance"].forEach((t, i) => {
    checkRow(board, "career " + i, MX, cy + 120 + i * 48, 560, t);
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

  // 11. leadership preview (GSI)
  yy = secHead(board, "lead", y + 72, "Expert team", "Meet our leadership", LOREM_S);
  y = leadershipCards(board, "lead", yy) + 72;

  // 12. students-work-with logo strip (GSI)
  y = logoStrip(board, "hire", y + 24, "OUR STUDENTS WORK WITH", 5) + 72;

  // 13. testimonials
  yy = secHead(board, "testi", y, "Testimonials", "What learners say", "");
  y = testimonialCards(board, "testi", yy, 3) + 72;

  // 14. how it works — 5 steps (CyberAegis)
  yy = secHead(board, "steps", y, "How it works", "Lorem ipsum dolor sit", "");
  y = processSteps(board, "steps", yy,
    [["01", LOREM_H, LOREM_S], ["02", LOREM_H, LOREM_S], ["03", LOREM_H, LOREM_S],
     ["04", LOREM_H, LOREM_S], ["05", LOREM_H, LOREM_S]]) + 72;

  // 15. FAQ + View All (GSI)
  yy = secHead(board, "faq", y, "FAQ", "Most common questions", "");
  y = faqList(board, "faq", yy, [LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q]) + 24;
  label(board, "faq viewall", "View All →", MX, y, 200,
    { size: 15, weight: "700", color: C.orange });
  y += 48 + 48;

  // 16. final CTA band (CyberAegis)
  y = ctaBand(board, y, "Take the next step toward professional success", LOREM_S, "Talk to a Trainer");

  // 17. footer + floating WhatsApp
  y = footer(board, y);
  whatsappFloat(board, y);
  return y;
}

// ---------- ABOUT US ----------
// Order replicates gsitssolutions.com/about + cyberaegis.in/about-us.
function drawAbout(board) {
  let y = 0;
  y = navbar(board, y, "About Us");
  y = pageHero(board, y, "About Us", LOREM_P);

  // story block with photo + badge (CyberAegis) / experience intro (GSI)
  let yy = y + 72;
  img(board, "story image", MX, yy, 560, 400, "STORY IMAGE");
  rect(board, "story badge", MX + 440, yy + 300, 220, 120, C.orange);
  label(board, "story badge n", "[X]+", MX + 440, yy + 318, 220,
    { size: 34, weight: "800", color: C.white, align: "center" });
  label(board, "story badge l", "Years of excellence", MX + 440, yy + 362, 220,
    { size: 13, color: C.white, align: "center" });
  label(board, "story eyebrow", "OUR STORY", MX + 640, yy + 10, 640,
    { size: 13, weight: "700", color: C.orange });
  label(board, "story h2", LOREM_H + " sed do.", MX + 640, yy + 40, 640,
    { size: 34, weight: "700" });
  label(board, "story p", LOREM_P, MX + 640, yy + 130, 640, { size: 16, color: C.gray });
  // value chips (CyberAegis)
  let vx = MX + 640;
  ["[Value]", "[Value]", "[Value]"].forEach((v, i) => {
    const w = chip(board, "story chip " + i, vx, yy + 300, v, C.dark, C.white);
    vx += w + 12;
  });
  y = yy + 420 + 72;

  // credential badges (GSI: ISO / AICTE pattern — placeholders only)
  yy = y;
  let bx = MX;
  ["[Certification badge]", "[Approval badge]", "[Recognition badge]"].forEach((b, i) => {
    const w = chip(board, "cred " + i, bx, yy, b, C.orange, C.orangeSoft);
    bx += w + 16;
  });
  y = yy + 36 + 56;

  // about bullets (GSI: 6-bullet narrative)
  yy = secHead(board, "ab", y, "Who we are", "About GradeSpot IT Solutions", "");
  for (let i = 0; i < 6; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    checkRow(board, "ab " + i, MX + col * 640, yy + row * 60, 620, LOREM_S);
  }
  y = yy + 3 * 60 + 72;

  // mission / vision cards (CyberAegis)
  const mw = (CW - 24) / 2;
  ["Our Mission", "Our Vision"].forEach((t, i) => {
    const bx2 = MX + i * (mw + 24);
    rect(board, "mv " + i, bx2, y, mw, 240, C.white);
    outlinedRect(board, "mv " + i + " border", bx2, y, mw, 240, C.border, 1);
    rect(board, "mv bar " + i, bx2, y, 6, 240, C.orange);
    label(board, "mv t " + i, t, bx2 + 40, y + 36, mw - 80, { size: 24, weight: "700" });
    label(board, "mv d " + i, LOREM_P, bx2 + 40, y + 80, mw - 80,
      { size: 15, color: C.gray });
  });
  y += 240 + 72;

  // how we work — 4 steps (GSI: 01 Choose a Service → 02 Request a Meeting → 03 Receive Custom Plan → 04 Let's Make it Happen)
  yy = secHead(board, "how", y, "Process", "How we work", "");
  y = processSteps(board, "how", yy,
    [["01", "Choose a Service", LOREM_S], ["02", "Request a Meeting", LOREM_S],
     ["03", "Receive Custom Plan", LOREM_S], ["04", "Let's Make it Happen", LOREM_S]]) + 72;

  // support band with phone CTA (GSI)
  const sh = 240;
  rect(board, "support bg", 0, y, W, sh, C.navy);
  label(board, "support t", "Lorem ipsum dolor sit amet", MX, y + 70, 700,
    { size: 30, weight: "700", color: C.white });
  label(board, "support d", LOREM_S, MX, y + 120, 640, { size: 15, color: C.navyText });
  button(board, "support cta", W - MX - 260, y + 93, 260, 54, "[Phone number]", C.orange, C.white);
  y += sh;

  // timeline (CyberAegis pattern — neutral milestones, no copied history)
  yy = secHead(board, "tl", y + 72, "Journey", "Our journey", "");
  rect(board, "tl line", MX + 8, yy, 2, 4 * 110, C.border);
  for (let i = 0; i < 4; i++) {
    const by = yy + i * 110;
    circle(board, "tl dot " + i, MX, by, 18, C.orange);
    label(board, "tl year " + i, "[20XX]", MX + 40, by - 4, 120,
      { size: 15, weight: "700", color: C.orange });
    label(board, "tl t " + i, LOREM_H, MX + 40, by + 22, 900, { size: 17, weight: "600" });
    label(board, "tl d " + i, LOREM_S, MX + 40, by + 50, 900, { size: 14, color: C.gray });
  }
  y = yy + 4 * 110 + 72;

  // leadership (GSI)
  yy = secHead(board, "alead", y, "Expert team", "Meet our leadership", "");
  y = leadershipCards(board, "alead", yy) + 72;

  // students-work-with strip (GSI)
  y = logoStrip(board, "ahire", y + 24, "OUR STUDENTS WORK WITH", 5) + 72;

  // FAQ (GSI)
  yy = secHead(board, "afaq", y, "FAQ", "Frequently asked questions", "");
  y = faqList(board, "afaq", yy, [LOREM_Q, LOREM_Q, LOREM_Q]) + 72;

  y = ctaBand(board, y, "Ready to start your career journey?", LOREM_S, "Talk to a Trainer");
  y = footer(board, y);
  whatsappFloat(board, y);
  return y;
}

// ---------- TRAININGS ----------
// Replicates cyberaegis.in/training: header → course grid → contact block.
// (GSI nav label for this page is "Trainings".)
const COURSE_CATALOG = [
  ["ccna", "CCNA", "Networking"],
  ["soc-analyst", "SOC Analyst", "Cyber Security"],
  ["digital-marketing", "Digital Marketing", "Marketing"],
  ["comptia-pentest", "CompTIA Pentest+", "Cyber Security"],
  ["comptia-network", "CompTIA Network+", "Networking"],
];

function courseCard(board, name, x, y, w, c) {
  const chh = 380;
  rect(board, name, x, y, w, chh, C.white);
  outlinedRect(board, name + " border", x, y, w, chh, C.border, 1);
  img(board, name + " img", x + 20, y + 20, w - 40, 170, "IMAGE");
  chip(board, name + " cat", x + 20, y + 206, c[2], C.orange, C.orangeSoft);
  label(board, name + " title", c[1], x + 20, y + 254, w - 40, { size: 22, weight: "700" });
  label(board, name + " meta", "[Duration]  •  [Mode]", x + 20, y + 290, w - 40,
    { size: 13, color: C.lightGray });
  button(board, name + " cta", x + 20, y + 322, w - 40, 44, "View Course", C.orange, C.white);
  return chh;
}

function drawTrainings(board) {
  let y = 0;
  y = navbar(board, y, "Trainings");
  y = pageHero(board, y, "Our Trainings", LOREM_P);

  // filter chips
  let yy = y + 56;
  let cx = MX;
  ["All", "Networking", "Cyber Security", "Marketing"].forEach((c, i) => {
    const w = chip(board, "filter " + i, cx, yy, c, i === 0 ? C.white : C.dark, i === 0 ? C.orange : C.white);
    cx += w + 12;
  });
  yy += 36 + 48;

  // course grid
  const gw = (CW - 2 * 24) / 3;
  COURSE_CATALOG.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    courseCard(board, "tc " + i, MX + col * (gw + 24), yy + row * 404, gw, c);
  });
  // 6th slot: lorem placeholder card
  courseCard(board, "tc 5", MX + 2 * (gw + 24), yy + 1 * 404, gw, ["x", LOREM_H, "Lorem"]);
  y = yy + 2 * 404 + 72;

  // contact info block (CyberAegis training page ends with contact block)
  const chh = 220;
  rect(board, "tcontact bg", 0, y, W, chh, C.bgGray);
  label(board, "tcontact t", "Lorem ipsum dolor sit amet?", MX, y + 60, 700,
    { size: 28, weight: "700" });
  label(board, "tcontact d", LOREM_S, MX, y + 108, 640, { size: 15, color: C.gray });
  button(board, "tcontact cta", W - MX - 260, y + 83, 260, 54, "Contact Us", C.orange, C.white);
  y += chh;

  y = ctaBand(board, y, "Not sure which training fits?", LOREM_S, "Talk to a Trainer");
  y = footer(board, y);
  whatsappFloat(board, y);
  return y;
}

// ---------- COURSE DETAIL ----------
// Replicates gsitssolutions.com course pages: hero → program features →
// overview/outcomes → delivery modes → stats band → testimonials → FAQ →
// registration form → final CTA.
function drawCourseDetail(board, key) {
  const found = COURSE_CATALOG.find((c) => c[0] === key);
  const name = found ? found[1] : key;
  const cat = found ? found[2] : "Lorem";
  let y = 0;
  y = navbar(board, y, name);

  // breadcrumb
  label(board, "crumb", "Home  /  Trainings  /  " + name, MX, y + 32, CW,
    { size: 14, color: C.lightGray });
  y += 72;

  // hero (GSI: course name + outcome tagline + Contact CTA)
  const hh = 560;
  rect(board, "chero bg", 0, y, W, hh, C.orangeSoft);
  chip(board, "chero cat", MX, y + 72, cat.toUpperCase());
  label(board, "chero h1", name, MX, y + 128, 620, { size: 52, weight: "800" });
  label(board, "chero tag", LOREM_S, MX, y + 200, 560, { size: 18, color: C.gray });
  let mx = MX;
  ["[Duration]", "[Level]", "[Mode]"].forEach((m, i) => {
    const w = chip(board, "chero meta " + i, mx, y + 300, m, C.dark, C.white);
    mx += w + 12;
  });
  button(board, "chero cta1", MX, y + 380, 210, 54, "Enroll Now", C.orange, C.white);
  outlineButton(board, "chero cta2", MX + 226, y + 380, 240, 54, "Contact Us", C.orange);
  img(board, "chero image", MX + 720, y + 72, 560, 416, "COURSE IMAGE");
  y += hh;

  // program features grid (GSI: 5 features)
  let yy = secHead(board, "feat", y + 72, "Program", "Program features", "");
  const feats = ["Lorem ipsum", "Dolor sit", "Amet consectetur", "Adipiscing elit", "Sed do eiusmod"];
  const fw = (CW - 4 * 24) / 5;
  feats.forEach((f, i) => {
    const bx = MX + i * (fw + 24);
    rect(board, "pf " + i, bx, yy, fw, 220, C.white);
    outlinedRect(board, "pf " + i + " border", bx, yy, fw, 220, C.border, 1);
    rect(board, "pf icon " + i, bx + 24, yy + 24, 48, 48, C.orangeSoft);
    label(board, "pf t " + i, f, bx + 24, yy + 92, fw - 48, { size: 16, weight: "700" });
    label(board, "pf d " + i, LOREM_S, bx + 24, yy + 122, fw - 48,
      { size: 13, color: C.gray });
  });
  y = yy + 220 + 72;

  // overview + learning outcomes (GSI)
  const oh = 480;
  rect(board, "ov bg", 0, y, W, oh, C.bgGray);
  yy = y + 64;
  label(board, "ov eyebrow", "OVERVIEW", MX, yy, 600,
    { size: 13, weight: "700", color: C.orange });
  label(board, "ov h2", "Course overview", MX, yy + 30, 600, { size: 34, weight: "700" });
  label(board, "ov p", LOREM_P, MX, yy + 90, 560, { size: 16, color: C.gray });
  label(board, "ov h3", "What you will learn", MX + 680, yy, 600, { size: 24, weight: "700" });
  for (let i = 0; i < 4; i++) {
    checkRow(board, "ov " + i, MX + 680, yy + 56 + i * 52, 600, LOREM_S);
  }
  img(board, "ov image", MX, yy + 250, 560, 166, "IMAGE");
  y += oh;

  // delivery modes (GSI: Live Classes / Recorded Videos / Hands-On Practicals)
  yy = secHead(board, "modes", y + 72, "Flexible", "Delivery modes", "");
  ["Lorem ipsum", "Dolor sit", "Amet consectetur"].forEach((m2, i) => {
    const bx = MX + i * ((CW - 2 * 24) / 3 + 24);
    const mw2 = (CW - 2 * 24) / 3;
    rect(board, "mode " + i, bx, yy, mw2, 200, C.white);
    outlinedRect(board, "mode " + i + " border", bx, yy, mw2, 200, C.border, 1);
    rect(board, "mode icon " + i, bx + 28, yy + 28, 48, 48, C.orangeSoft);
    label(board, "mode t " + i, m2, bx + 28, yy + 96, mw2 - 56, { size: 19, weight: "700" });
    label(board, "mode d " + i, LOREM_S, bx + 28, yy + 128, mw2 - 56,
      { size: 14, color: C.gray });
  });
  y = yy + 200 + 72;

  // curriculum modules
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
  yy = secHead(board, "cbatch", y, "Batches", "Upcoming batches", "");
  const bww = (CW - 2 * 24) / 3;
  for (let i = 0; i < 3; i++) {
    const bx = MX + i * (bww + 24);
    rect(board, "cbatch " + i, bx, yy, bww, 300, C.navy);
    label(board, "cbatch mode " + i, "[Weekday / Weekend]", bx + 32, yy + 36, bww - 64,
      { size: 13, weight: "700", color: C.orange });
    label(board, "cbatch date " + i, "[Start date]", bx + 32, yy + 66, bww - 64,
      { size: 26, weight: "700", color: C.white });
    label(board, "cbatch time " + i, "[Class timings]", bx + 32, yy + 110, bww - 64,
      { size: 15, color: C.navyText });
    button(board, "cbatch cta " + i, bx + 32, yy + 200, 220, 48, "Enquire Now", C.green, C.white);
  }
  y = yy + 300 + 72;

  // stats band (GSI course pages)
  y = statsBand(board, "cstats", y,
    [["[000]", "Lorem"], ["[00]", "Ipsum"], ["[0]", "Dolor"], ["[000]", "Sit"]]);

  // testimonials (GSI)
  yy = secHead(board, "ctesti", y + 72, "Testimonials", "What learners say", "");
  y = testimonialCards(board, "ctesti", yy, 3) + 72;

  // FAQ (GSI)
  yy = secHead(board, "cfaq", y, "FAQ", "Course FAQs", "");
  y = faqList(board, "cfaq", yy, [LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q]) + 72;

  // registration form (GSI course pages end with a form)
  const fh = 620;
  rect(board, "reg bg", 0, y, W, fh, C.bgGray);
  yy = y + 64;
  label(board, "reg h2", "Register your interest", MX, yy, 600, { size: 32, weight: "700" });
  label(board, "reg d", LOREM_S, MX, yy + 52, 560, { size: 15, color: C.gray });
  const fields = ["Your name", "Email address", "Phone number"];
  fields.forEach((f, i) => {
    const fx = MX + 680 + (i % 1) * 0;
    const fy = yy + i * 92;
    label(board, "reg label " + i, f, fx, fy, 520, { size: 14, weight: "600" });
    outlinedRect(board, "reg box " + i, fx, fy + 26, 520, 48, C.border, 1);
    label(board, "reg ph " + i, "Lorem ipsum", fx + 16, fy + 41, 400,
      { size: 14, color: C.lightGray });
  });
  const ry = yy + 3 * 92;
  label(board, "reg label c", "Select course", MX + 680, ry, 520, { size: 14, weight: "600" });
  outlinedRect(board, "reg box c", MX + 680, ry + 26, 520, 48, C.border, 1);
  label(board, "reg ph c", name, MX + 696, ry + 41, 400, { size: 14, color: C.lightGray });
  button(board, "reg send", MX, yy + 420, 240, 54, "Submit", C.orange, C.white);
  y += fh;

  // final enroll CTA
  y = ctaBand(board, y, "Ready to enroll in " + name + "?", LOREM_S, "Enroll Now");
  y = footer(board, y);
  whatsappFloat(board, y);
  return y;
}

// ---------- SERVICES ----------
// Replicates gsitssolutions.com/our-services: catalogue + FAQ + help CTA.
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

  // engagement process (GSI about pattern, reused for services)
  yy = secHead(board, "sproc", y, "Process", "How we work", "");
  y = processSteps(board, "sproc", yy,
    [["01", "Choose a Service", LOREM_S], ["02", "Request a Meeting", LOREM_S],
     ["03", "Receive Custom Plan", LOREM_S], ["04", "Let's Make it Happen", LOREM_S]]) + 72;

  // why-us band
  const wh = 300;
  rect(board, "whyus bg", 0, y, W, wh, C.navy);
  label(board, "whyus t", "Lorem ipsum dolor sit amet", MX, y + 70, 700,
    { size: 30, weight: "700", color: C.white });
  label(board, "whyus d", LOREM_P, MX, y + 125, 640, { size: 15, color: C.navyText });
  button(board, "whyus cta", W - MX - 260, y + 123, 260, 54, "Talk to a Trainer", C.orange, C.white);
  y += wh;

  // FAQ (GSI services page)
  yy = secHead(board, "sfaq", y + 72, "FAQ", "Service FAQs", "");
  y = faqList(board, "sfaq", yy, [LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q]) + 72;

  // help CTA
  y = ctaBand(board, y, "Need help choosing a service?", LOREM_S, "Talk to a Trainer");
  y = footer(board, y);
  whatsappFloat(board, y);
  return y;
}

// ---------- TEAM MEMBERS ----------
// Replicates gsitssolutions.com/team-members: title + leadership cards.
function drawTeam(board) {
  let y = 0;
  y = navbar(board, y, "Team Members");
  y = pageHero(board, y, "Team Members", LOREM_P);

  let yy = secHead(board, "tm", y + 72, "Leadership", "Meet our leadership", LOREM_S);
  y = leadershipCards(board, "tm", yy) + 72;

  // values strip
  yy = secHead(board, "tval", y, "Culture", "What we stand for", "");
  const vw = (CW - 2 * 24) / 3;
  ["Lorem ipsum", "Dolor sit", "Amet consectetur"].forEach((v, i) => {
    const bx = MX + i * (vw + 24);
    rect(board, "tval " + i, bx, yy, vw, 180, C.orangeSoft);
    label(board, "tval t " + i, v, bx + 32, yy + 52, vw - 64,
      { size: 21, weight: "700", align: "center" });
    label(board, "tval d " + i, LOREM_S, bx + 32, yy + 92, vw - 64,
      { size: 14, color: C.gray, align: "center" });
  });
  y = yy + 180 + 72;

  y = ctaBand(board, y, "Want to join the team?", LOREM_S, "Contact Us");
  y = footer(board, y);
  whatsappFloat(board, y);
  return y;
}

// ---------- CONTACT US ----------
// Replicates cyberaegis.in/contact-us: form → enrolment steps → info cards → map.
function drawContact(board) {
  let y = 0;
  y = navbar(board, y, "Contact Us");
  y = pageHero(board, y, "Contact Us", LOREM_P);

  // enquiry form + info (CyberAegis "Send Us A Message")
  let yy = y + 72;
  rect(board, "form", MX, yy, 620, 640, C.white);
  outlinedRect(board, "form border", MX, yy, 620, 640, C.border, 1);
  label(board, "form t", "Send us a message", MX + 40, yy + 36, 540, { size: 24, weight: "700" });
  ["Your name", "Email address", "Phone number"].forEach((f, i) => {
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

  // 4 contact-info cards (CyberAegis: Call / Email / Visit / Hours)
  const infos = ["Call Us", "Email Us", "Visit Us", "Working Hours"];
  infos.forEach((inf, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = MX + 660 + col * 320, by = yy + row * 250;
    rect(board, "cinfo " + i, bx, by, 300, 220, C.white);
    outlinedRect(board, "cinfo " + i + " border", bx, by, 300, 220, C.border, 1);
    rect(board, "cinfo icon " + i, bx + 24, by + 24, 44, 44, C.orangeSoft);
    label(board, "cinfo t " + i, inf, bx + 24, by + 86, 252, { size: 17, weight: "700" });
    label(board, "cinfo d1 " + i, "[Lorem ipsum]", bx + 24, by + 116, 252,
      { size: 14, color: C.gray });
    label(board, "cinfo d2 " + i, "[Dolor sit amet]", bx + 24, by + 140, 252,
      { size: 14, color: C.gray });
  });
  button(board, "wa", MX + 660, yy + 2 * 250 + 24, 300, 52, "WhatsApp Us", C.green, C.white);
  y = yy + 640 + 72;

  // 5-step enrolment process (CyberAegis contact page)
  yy = secHead(board, "enrol", y, "Enrolment", "How enrolment works", "");
  y = processSteps(board, "enrol", yy,
    [["01", "Submit Enquiry", LOREM_S], ["02", "Career Guidance", LOREM_S],
     ["03", "Attend Free Demo", LOREM_S], ["04", "Choose Batch", LOREM_S],
     ["05", "Start Learning", LOREM_S]]) + 72;

  // map placeholder
  img(board, "map", MX, y, CW, 320, "MAP PLACEHOLDER");
  y += 320 + 72;

  // repeated contact block (CyberAegis)
  const chh = 200;
  rect(board, "cblock bg", 0, y, W, chh, C.bgGray);
  label(board, "cblock t", "Lorem ipsum dolor sit amet?", MX, y + 56, 700, { size: 26, weight: "700" });
  label(board, "cblock d", "[Phone]  •  [Email]  •  [Address, Hyderabad]  •  [Hours]",
    MX, y + 104, 900, { size: 15, color: C.gray });
  y += chh;

  y = footer(board, y);
  whatsappFloat(board, y);
  return y;
}

// ---------- dispatcher ----------
const PAGES = {
  home: ["Home", drawHome],
  about: ["About Us", drawAbout],
  trainings: ["Trainings", drawTrainings],
  services: ["Services", drawServices],
  team: ["Team Members", drawTeam],
  contact: ["Contact Us", drawContact],
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
      penpot.createPage("Designs v3");
      penpot.ui.sendMessage({
        type: "done", ok: true,
        detail: "Created page 'Designs v3' — click it in the pages panel, then draw each board.",
      });
    } else if (message.type === "test-hero") {
      progress("Drawing test hero…");
      const board = penpot.createBoard();
      board.name = "Test hero";
      board.resize(W, 900);
      board.fills = [{ fillColor: C.white }];
      navbar(board, 0, "Home");
      img(board, "test image", MX, 160, 600, 400, "TEST IMAGE");
      footer(board, 620);
      penpot.ui.sendMessage({ type: "done", ok: true, detail: "Test hero drawn." });
    }
  } catch (err) {
    penpot.ui.sendMessage({
      type: "done", ok: false,
      detail: "Error at '" + lastStep + "': " + (err && err.message ? err.message : String(err)),
    });
  }
});
