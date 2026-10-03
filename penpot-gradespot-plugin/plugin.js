// GradeSpot Designer v4 — Penpot plugin (no server needed).
// v4: six new pages for the approved Axon sitemap — For Institutes, Pricing,
// Why Choose Us, Testimonials, Student Certifications, Certificate Verification.
// Navbar: adds Pricing link, CTA is now "For Institutes"; active-link logic
// covers Resources children, all course keys, and Services children.
// v3.1: draws each page in small async chunks (yielding to the renderer
// between sections) so large boards can't wedge the Penpot tab.
// RULE: structure/layout only — all copy is lorem ipsum dummy text and every
// number, testimonial, date, fee, name, badge or contact detail is a bracketed
// placeholder until Aravind confirms real facts. Never invent claims.
// Allowed real facts: business phone +91 91826 54056, WhatsApp 919885189951.

penpot.ui.open("GradeSpot Designer", "index.html?theme=" + penpot.theme, {
  width: 340,
  height: 660,
});

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

let lastStep = "";
function progress(step) {
  lastStep = step;
  penpot.ui.sendMessage({ type: "progress", detail: step });
}

// Run section steps with a breather between each so the renderer keeps up.
async function runSteps(board, name, steps) {
  let y = 0;
  for (let i = 0; i < steps.length; i++) {
    progress("Drawing " + name + " (" + (i + 1) + "/" + steps.length + ")…");
    y = steps[i](board, y);
    await sleep(350);
  }
  return y;
}

// ---------- design tokens ----------
const C = {
  orange: "#EA580C", orangeDark: "#C2410C", orangeSoft: "#FFF7ED",
  dark: "#111827", gray: "#4B5563", lightGray: "#9CA3AF",
  bgGray: "#F9FAFB", border: "#E5E7EB", white: "#FFFFFF",
  navy: "#0F172A", navyBorder: "#1E293B", navyText: "#94A3B8",
  imgBg: "#E9EDF2", imgBorder: "#D1D5DB", imgLabel: "#9CA3AF",
  green: "#059669", red: "#DC2626",
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
const NAV_LINKS = ["Home", "About Us", "Trainings", "Resources ▾", "Digital", "Services", "Pricing", "Contact Us"];
function navbar(board, y, active) {
  const h = 76;
  rect(board, "nav bg", 0, y, W, h, C.white);
  rect(board, "nav border", 0, y + h - 1, W, 1, C.border);
  logoLockup(board, "nav logo", MX, y + 16, true);
  let lx = 400;
  NAV_LINKS.forEach((l) => {
    const plain = l.replace(" ▾", "");
    const on = (plain === active) ||
      (plain === "Resources" && ["Team Members", "Why Choose Us", "Testimonials", "Student Certifications", "Certificate Verification"].indexOf(active) >= 0) ||
      (plain === "Trainings" && ["CCNA", "SOC Analyst", "Digital Marketing", "CompTIA Pentest+", "CompTIA Network+"].indexOf(active) >= 0) ||
      (plain === "Services" && ["For Institutes", "Pricing"].indexOf(active) >= 0);
    label(board, "nav " + plain, l, lx, y + 27, 104,
      { size: 14, weight: on ? "700" : "500", color: on ? C.dark : C.gray });
    if (on) rect(board, "nav active " + plain, lx, y + 54, 30, 3, C.orange);
    lx += 98;
  });
  const bw = 150;
  button(board, "nav cta", W - MX - bw, y + 15, bw, 46, "For Institutes", C.orange, C.white);
  return y + h;
}

// ---------- FOOTER: gsitssolutions.com structure ----------
function footer(board, y) {
  const h = 470;
  rect(board, "footer bg", 0, y, W, h, C.navy);
  logoLockup(board, "f logo", MX, y + 52, false);
  label(board, "f blurb", LOREM_S, MX, y + 120, 280, { size: 14, color: C.navyText });
  for (let i = 0; i < 4; i++) {
    circle(board, "f social " + i, MX + i * 52, y + 210, 40, null, "#334155");
    label(board, "f social icon " + i, "○", MX + i * 52, y + 218, 40,
      { size: 16, color: C.navyText, align: "center" });
  }
  label(board, "f h2", "Company", 440, y + 52, 200, { size: 16, weight: "700", color: C.white });
  ["Meet Our Team", "Help & FAQs", "Our Services", "Why Choose Us"].forEach((l, i) => {
    label(board, "f co " + i, l, 440, y + 90 + i * 30, 220, { size: 14, color: C.navyText });
  });
  label(board, "f h3", "Solutions", 700, y + 52, 240, { size: 16, weight: "700", color: C.white });
  ["Corporate Training", "Cyber Security", "Web Development", "Digital Marketing", "Case Studies"].forEach((l, i) => {
    label(board, "f sol " + i, l, 700, y + 90 + i * 30, 260, { size: 14, color: C.navyText });
  });
  label(board, "f h4", "Contact Info", 990, y + 52, 340, { size: 16, weight: "700", color: C.white });
  ["[Email address]", "[Alternate email]", "[Phone number]", "[Alternate phone]"].forEach((l, i) => {
    label(board, "f contact " + i, l, 990, y + 90 + i * 30, 340, { size: 14, color: C.navyText });
  });
  rect(board, "f divider", MX, y + h - 72, CW, 1, C.navyBorder);
  label(board, "f copy", "© [Year] GradeSpot IT Solutions Pvt. Ltd.",
    MX, y + h - 46, 600, { size: 13, color: C.navyText });
  label(board, "f legal", "Home      Testimonials      Our Services      Terms and Conditions",
    W - MX - 480, y + h - 46, 480, { size: 13, color: C.navyText, align: "right" });
  return y + h;
}

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

function marquee(board, y) {
  const h = 64;
  rect(board, "ticker bg", 0, y, W, h, C.dark);
  label(board, "ticker text",
    "LOREM IPSUM DOLOR  •  SIT AMET CONSECTETUR  •  ADIPISCING ELIT  •  SED DO EIUSMOD  •  TEMPOR INCIDIDUNT  •  LOREM IPSUM DOLOR  •  SIT AMET",
    MX, y + 21, CW, { size: 14, weight: "700", color: C.white, align: "center" });
  return y + h;
}

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

// ---------- HOME (chunked) ----------
function drawHome(board) {
  const steps = [
    (b, y) => navbar(b, y, "Home"),

    // hero + trust chips
    (b, y) => {
      const hh = 680;
      rect(b, "hero bg", 0, y, W, hh, C.orangeSoft);
      chip(b, "hero badge", MX, y + 80, "LOREM IPSUM DOLOR");
      label(b, "hero h1", LOREM_H + " sed do eiusmod tempor.",
        MX, y + 140, 620, { size: 54, weight: "800", color: C.dark });
      label(b, "hero sub", LOREM_P, MX, y + 322, 560, { size: 18, color: C.gray });
      button(b, "hero cta1", MX, y + 452, 230, 54, "Talk to a Trainer", C.orange, C.white);
      outlineButton(b, "hero cta2", MX + 246, y + 452, 230, 54, "Explore Trainings", C.orange);
      img(b, "hero image", MX + 720, y + 80, 560, 500, "HERO IMAGE");
      let yy = y + hh + 48;
      let cx = MX;
      ["[000]+ Lorem", "[00]+ Ipsum", "[0]+ Dolor"].forEach((c, i) => {
        const w = chip(b, "trust " + i, cx, yy, c, C.dark, C.white);
        cx += w + 12;
      });
      return yy + 36 + 48;
    },

    (b, y) => marquee(b, y),

    // featured services
    (b, y) => {
      let yy = secHead(b, "fsvc", y + 72, "Featured Services", "Lorem ipsum dolor sit", LOREM_S);
      const fsvcs = ["Corporate Training", "Cyber Security", "Web Development", "Digital Marketing"];
      const fw = (CW - 3 * 24) / 4;
      fsvcs.forEach((s, i) => {
        const bx = MX + i * (fw + 24);
        rect(b, "fsvc " + i, bx, yy, fw, 260, C.white);
        outlinedRect(b, "fsvc " + i + " border", bx, yy, fw, 260, C.border, 1);
        rect(b, "fsvc icon " + i, bx + 28, yy + 28, 52, 52, C.orangeSoft);
        label(b, "fsvc title " + i, s, bx + 28, yy + 100, fw - 56, { size: 19, weight: "700" });
        label(b, "fsvc desc " + i, LOREM_S, bx + 28, yy + 134, fw - 56,
          { size: 14, color: C.gray });
      });
      return yy + 260 + 72;
    },

    // experience intro block
    (b, y) => {
      const eh = 420;
      rect(b, "exp bg", 0, y, W, eh, C.white);
      const yy = y + 72;
      img(b, "exp image", MX, yy, 480, 276, "IMAGE");
      rect(b, "exp badge", MX + 360, yy + 200, 200, 120, C.orange);
      label(b, "exp badge n", "[X]", MX + 360, yy + 216, 200,
        { size: 36, weight: "800", color: C.white, align: "center" });
      label(b, "exp badge l", "Years of experience", MX + 360, yy + 260, 200,
        { size: 13, color: C.white, align: "center" });
      label(b, "exp h2", LOREM_H + " sed do.", MX + 600, yy + 10, 680,
        { size: 34, weight: "700" });
      label(b, "exp p", LOREM_P, MX + 600, yy + 100, 660, { size: 16, color: C.gray });
      let cx = MX + 600;
      ["[Certification badge]", "[Approval badge]"].forEach((t, i) => {
        const w = chip(b, "exp cred " + i, cx, yy + 220, t, C.orange, C.orangeSoft);
        cx += w + 12;
      });
      return y + eh;
    },

    // upcoming batches grid
    (b, y) => {
      let yy = secHead(b, "batch", y + 72, "Admissions open", "Upcoming batches", LOREM_S);
      const bcourses = ["CCNA", "SOC Analyst", "Digital Marketing", "CompTIA Pentest+", "CompTIA Network+", LOREM_H];
      const bw2 = (CW - 2 * 24) / 3;
      bcourses.forEach((c, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const bx = MX + col * (bw2 + 24), by = yy + row * 300;
        rect(b, "batch " + i, bx, by, bw2, 276, C.white);
        outlinedRect(b, "batch " + i + " border", bx, by, bw2, 276, C.border, 1);
        label(b, "batch c " + i, c, bx + 28, by + 28, bw2 - 56, { size: 20, weight: "700" });
        chip(b, "batch dur " + i, bx + 28, by + 64, "[Duration]", C.orange, C.orangeSoft);
        label(b, "batch date " + i, "[Start date]", bx + 28, by + 120, bw2 - 56,
          { size: 16, weight: "600" });
        label(b, "batch time " + i, "[Class timings]", bx + 28, by + 150, bw2 - 56,
          { size: 14, color: C.gray });
        button(b, "batch cta " + i, bx + 28, by + 196, 200, 48, "Enquire Now", C.green, C.white);
      });
      return yy + 2 * 300 + 72;
    },

    // social proof band
    (b, y) => {
      const sph = 380;
      rect(b, "sp bg", 0, y, W, sph, C.bgGray);
      const yy = y + 72;
      label(b, "sp h2", "Lorem ipsum dolor sit amet", MX, yy, 600, { size: 32, weight: "700" });
      ["Lorem ipsum dolor", "Consectetur adipiscing", "Sed do eiusmod"].forEach((t, i) => {
        checkRow(b, "sp " + i, MX, yy + 80 + i * 48, 560, t);
      });
      button(b, "sp cta", MX, yy + 80 + 3 * 48 + 8, 230, 52, "Talk to a Trainer", C.orange, C.white);
      img(b, "sp image", MX + 720, yy, 560, 236, "IMAGE");
      return y + sph;
    },

    (b, y) => statsBand(b, "hstats", y,
      [["[0000]", "Lorem ipsum"], ["[0000]", "Dolor sit"], ["[000]", "Amet"], ["[00]", "Consectetur"]]),

    // course category cards
    (b, y) => {
      let yy = secHead(b, "cats", y + 72, "Categories", "Explore by category", "");
      const cats = ["Cyber Security", "Software Development", "Cloud & DevOps", "Data & Analytics", "AI", "Software Testing"];
      const catw = (CW - 2 * 24) / 3;
      cats.forEach((c, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const bx = MX + col * (catw + 24), by = yy + row * 220;
        rect(b, "cat " + i, bx, by, catw, 196, C.white);
        outlinedRect(b, "cat " + i + " border", bx, by, catw, 196, C.border, 1);
        rect(b, "cat icon " + i, bx + 28, by + 28, 48, 48, C.orangeSoft);
        label(b, "cat t " + i, c, bx + 28, by + 94, catw - 56, { size: 19, weight: "700" });
        label(b, "cat d " + i, LOREM_S, bx + 28, by + 126, catw - 56,
          { size: 13, color: C.gray });
      });
      return yy + 2 * 220 + 72;
    },

    // why choose us
    (b, y) => {
      let yy = secHead(b, "why", y, "Why choose us", "Lorem ipsum dolor sit", "");
      const whys = ["Lorem ipsum", "Dolor sit", "Amet consectetur", "Adipiscing elit"];
      const fw = (CW - 3 * 24) / 4;
      whys.forEach((w2, i) => {
        const bx = MX + i * (fw + 24);
        rect(b, "why " + i, bx, yy, fw, 240, C.white);
        outlinedRect(b, "why " + i + " border", bx, yy, fw, 240, C.border, 1);
        rect(b, "why icon " + i, bx + 28, yy + 28, 52, 52, C.orangeSoft);
        label(b, "why t " + i, w2, bx + 28, yy + 100, fw - 56, { size: 19, weight: "700" });
        label(b, "why d " + i, LOREM_S, bx + 28, yy + 134, fw - 56,
          { size: 14, color: C.gray });
      });
      return yy + 240 + 72;
    },

    // career & placement support split
    (b, y) => {
      const ch = 600;
      rect(b, "career bg", 0, y, W, ch, C.bgGray);
      const cy = y + 72;
      label(b, "career eyebrow", "CAREER SUPPORT", MX, cy, 600,
        { size: 13, weight: "700", color: C.orange });
      label(b, "career h2", "From learning to getting hired", MX, cy + 30, 600,
        { size: 36, weight: "700" });
      ["Resume building", "Mock interviews", "LinkedIn profile optimization",
       "Soft-skills coaching", "1:1 mentorship", "Job-search guidance"].forEach((t, i) => {
        checkRow(b, "career " + i, MX, cy + 120 + i * 48, 560, t);
      });
      rect(b, "career card", MX + 680, cy, 600, 456, C.navy);
      label(b, "career card t", "Career outcomes", MX + 724, cy + 44, 520,
        { size: 24, weight: "700", color: C.white });
      label(b, "career card d", LOREM_S, MX + 724, cy + 88, 512,
        { size: 15, color: C.navyText });
      [["—", "Lorem"], ["—", "Ipsum"], ["—", "Dolor"]].forEach((s, i) => {
        const bx = MX + 724 + i * 170;
        label(b, "career stat n " + i, s[0], bx, cy + 200, 160,
          { size: 40, weight: "700", color: C.white, align: "center" });
        label(b, "career stat l " + i, s[1], bx, cy + 252, 160,
          { size: 13, color: C.navyText, align: "center" });
      });
      button(b, "career cta", MX + 724, cy + 340, 300, 52,
        "Start Your Career Journey", C.orange, C.white);
      return y + ch;
    },

    // leadership preview
    (b, y) => {
      const yy = secHead(b, "lead", y + 72, "Expert team", "Meet our leadership", LOREM_S);
      return leadershipCards(b, "lead", yy) + 72;
    },

    // students-work-with strip
    (b, y) => logoStrip(b, "hire", y + 24, "OUR STUDENTS WORK WITH", 5) + 72,

    // testimonials
    (b, y) => {
      const yy = secHead(b, "testi", y, "Testimonials", "What learners say", "");
      return testimonialCards(b, "testi", yy, 3) + 72;
    },

    // how it works — 5 steps
    (b, y) => {
      const yy = secHead(b, "steps", y, "How it works", "Lorem ipsum dolor sit", "");
      return processSteps(b, "steps", yy,
        [["01", LOREM_H, LOREM_S], ["02", LOREM_H, LOREM_S], ["03", LOREM_H, LOREM_S],
         ["04", LOREM_H, LOREM_S], ["05", LOREM_H, LOREM_S]]) + 72;
    },

    // FAQ + View All
    (b, y) => {
      const yy = secHead(b, "faq", y, "FAQ", "Most common questions", "");
      let y2 = faqList(b, "faq", yy, [LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q]) + 24;
      label(b, "faq viewall", "View All →", MX, y2, 200,
        { size: 15, weight: "700", color: C.orange });
      return y2 + 48 + 48;
    },

    // final CTA + footer + whatsapp
    (b, y) => {
      let y2 = ctaBand(b, y, "Take the next step toward professional success", LOREM_S, "Talk to a Trainer");
      y2 = footer(b, y2);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Home", steps);
}

// ---------- ABOUT US (chunked) ----------
function drawAbout(board) {
  const steps = [
    (b, y) => navbar(b, y, "About Us"),
    (b, y) => pageHero(b, y, "About Us", LOREM_P),

    // story block
    (b, y) => {
      const yy = y + 72;
      img(b, "story image", MX, yy, 560, 400, "STORY IMAGE");
      rect(b, "story badge", MX + 440, yy + 300, 220, 120, C.orange);
      label(b, "story badge n", "[X]+", MX + 440, yy + 318, 220,
        { size: 34, weight: "800", color: C.white, align: "center" });
      label(b, "story badge l", "Years of excellence", MX + 440, yy + 362, 220,
        { size: 13, color: C.white, align: "center" });
      label(b, "story eyebrow", "OUR STORY", MX + 640, yy + 10, 640,
        { size: 13, weight: "700", color: C.orange });
      label(b, "story h2", LOREM_H + " sed do.", MX + 640, yy + 40, 640,
        { size: 34, weight: "700" });
      label(b, "story p", LOREM_P, MX + 640, yy + 130, 640, { size: 16, color: C.gray });
      let vx = MX + 640;
      ["[Value]", "[Value]", "[Value]"].forEach((v, i) => {
        const w = chip(b, "story chip " + i, vx, yy + 300, v, C.dark, C.white);
        vx += w + 12;
      });
      return yy + 420 + 72;
    },

    // credential badges
    (b, y) => {
      let bx = MX;
      ["[Certification badge]", "[Approval badge]", "[Recognition badge]"].forEach((t, i) => {
        const w = chip(b, "cred " + i, bx, y, t, C.orange, C.orangeSoft);
        bx += w + 16;
      });
      return y + 36 + 56;
    },

    // about bullets
    (b, y) => {
      const yy = secHead(b, "ab", y, "Who we are", "About GradeSpot IT Solutions", "");
      for (let i = 0; i < 6; i++) {
        const col = i % 2, row = Math.floor(i / 2);
        checkRow(b, "ab " + i, MX + col * 640, yy + row * 60, 620, LOREM_S);
      }
      return yy + 3 * 60 + 72;
    },

    // mission / vision
    (b, y) => {
      const mw = (CW - 24) / 2;
      ["Our Mission", "Our Vision"].forEach((t, i) => {
        const bx = MX + i * (mw + 24);
        rect(b, "mv " + i, bx, y, mw, 240, C.white);
        outlinedRect(b, "mv " + i + " border", bx, y, mw, 240, C.border, 1);
        rect(b, "mv bar " + i, bx, y, 6, 240, C.orange);
        label(b, "mv t " + i, t, bx + 40, y + 36, mw - 80, { size: 24, weight: "700" });
        label(b, "mv d " + i, LOREM_P, bx + 40, y + 80, mw - 80,
          { size: 15, color: C.gray });
      });
      return y + 240 + 72;
    },

    // how we work — 4 steps
    (b, y) => {
      const yy = secHead(b, "how", y, "Process", "How we work", "");
      return processSteps(b, "how", yy,
        [["01", "Choose a Service", LOREM_S], ["02", "Request a Meeting", LOREM_S],
         ["03", "Receive Custom Plan", LOREM_S], ["04", "Let's Make it Happen", LOREM_S]]) + 72;
    },

    // support band
    (b, y) => {
      const sh = 240;
      rect(b, "support bg", 0, y, W, sh, C.navy);
      label(b, "support t", "Lorem ipsum dolor sit amet", MX, y + 70, 700,
        { size: 30, weight: "700", color: C.white });
      label(b, "support d", LOREM_S, MX, y + 120, 640, { size: 15, color: C.navyText });
      button(b, "support cta", W - MX - 260, y + 93, 260, 54, "[Phone number]", C.orange, C.white);
      return y + sh;
    },

    // timeline
    (b, y) => {
      const yy = secHead(b, "tl", y + 72, "Journey", "Our journey", "");
      rect(b, "tl line", MX + 8, yy, 2, 4 * 110, C.border);
      for (let i = 0; i < 4; i++) {
        const by = yy + i * 110;
        circle(b, "tl dot " + i, MX, by, 18, C.orange);
        label(b, "tl year " + i, "[20XX]", MX + 40, by - 4, 120,
          { size: 15, weight: "700", color: C.orange });
        label(b, "tl t " + i, LOREM_H, MX + 40, by + 22, 900, { size: 17, weight: "600" });
        label(b, "tl d " + i, LOREM_S, MX + 40, by + 50, 900, { size: 14, color: C.gray });
      }
      return yy + 4 * 110 + 72;
    },

    // leadership
    (b, y) => {
      const yy = secHead(b, "alead", y, "Expert team", "Meet our leadership", "");
      return leadershipCards(b, "alead", yy) + 72;
    },

    (b, y) => logoStrip(b, "ahire", y + 24, "OUR STUDENTS WORK WITH", 5) + 72,

    // FAQ
    (b, y) => {
      const yy = secHead(b, "afaq", y, "FAQ", "Frequently asked questions", "");
      return faqList(b, "afaq", yy, [LOREM_Q, LOREM_Q, LOREM_Q]) + 72;
    },

    (b, y) => {
      let y2 = ctaBand(b, y, "Ready to start your career journey?", LOREM_S, "Talk to a Trainer");
      y2 = footer(b, y2);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "About Us", steps);
}

// ---------- TRAININGS (chunked) ----------
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
  const steps = [
    (b, y) => navbar(b, y, "Trainings"),
    (b, y) => pageHero(b, y, "Our Trainings", LOREM_P),

    // filters + grid
    (b, y) => {
      let yy = y + 56;
      let cx = MX;
      ["All", "Networking", "Cyber Security", "Marketing"].forEach((c, i) => {
        const w = chip(b, "filter " + i, cx, yy, c, i === 0 ? C.white : C.dark, i === 0 ? C.orange : C.white);
        cx += w + 12;
      });
      yy += 36 + 48;
      const gw = (CW - 2 * 24) / 3;
      COURSE_CATALOG.forEach((c, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        courseCard(b, "tc " + i, MX + col * (gw + 24), yy + row * 404, gw, c);
      });
      courseCard(b, "tc 5", MX + 2 * (gw + 24), yy + 404, gw, ["x", LOREM_H, "Lorem"]);
      return yy + 2 * 404 + 72;
    },

    // contact block
    (b, y) => {
      const chh = 220;
      rect(b, "tcontact bg", 0, y, W, chh, C.bgGray);
      label(b, "tcontact t", "Lorem ipsum dolor sit amet?", MX, y + 60, 700,
        { size: 28, weight: "700" });
      label(b, "tcontact d", LOREM_S, MX, y + 108, 640, { size: 15, color: C.gray });
      button(b, "tcontact cta", W - MX - 260, y + 83, 260, 54, "Contact Us", C.orange, C.white);
      return y + chh;
    },

    (b, y) => {
      let y2 = ctaBand(b, y, "Not sure which training fits?", LOREM_S, "Talk to a Trainer");
      y2 = footer(b, y2);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Trainings", steps);
}

// ---------- COURSE DETAIL (chunked) ----------
function drawCourseDetail(board, key) {
  const found = COURSE_CATALOG.find((c) => c[0] === key);
  const name = found ? found[1] : key;
  const cat = found ? found[2] : "Lorem";
  const steps = [
    (b, y) => {
      let y2 = navbar(b, y, name);
      label(b, "crumb", "Home  /  Trainings  /  " + name, MX, y2 + 32, CW,
        { size: 14, color: C.lightGray });
      return y2 + 72;
    },

    // hero
    (b, y) => {
      const hh = 560;
      rect(b, "chero bg", 0, y, W, hh, C.orangeSoft);
      chip(b, "chero cat", MX, y + 72, cat.toUpperCase());
      label(b, "chero h1", name, MX, y + 128, 620, { size: 52, weight: "800" });
      label(b, "chero tag", LOREM_S, MX, y + 200, 560, { size: 18, color: C.gray });
      let mx = MX;
      ["[Duration]", "[Level]", "[Mode]"].forEach((m, i) => {
        const w = chip(b, "chero meta " + i, mx, y + 300, m, C.dark, C.white);
        mx += w + 12;
      });
      button(b, "chero cta1", MX, y + 380, 210, 54, "Enroll Now", C.orange, C.white);
      outlineButton(b, "chero cta2", MX + 226, y + 380, 240, 54, "Contact Us", C.orange);
      img(b, "chero image", MX + 720, y + 72, 560, 416, "COURSE IMAGE");
      return y + hh;
    },

    // program features
    (b, y) => {
      const yy = secHead(b, "feat", y + 72, "Program", "Program features", "");
      const feats = ["Lorem ipsum", "Dolor sit", "Amet consectetur", "Adipiscing elit", "Sed do eiusmod"];
      const fw = (CW - 4 * 24) / 5;
      feats.forEach((f, i) => {
        const bx = MX + i * (fw + 24);
        rect(b, "pf " + i, bx, yy, fw, 220, C.white);
        outlinedRect(b, "pf " + i + " border", bx, yy, fw, 220, C.border, 1);
        rect(b, "pf icon " + i, bx + 24, yy + 24, 48, 48, C.orangeSoft);
        label(b, "pf t " + i, f, bx + 24, yy + 92, fw - 48, { size: 16, weight: "700" });
        label(b, "pf d " + i, LOREM_S, bx + 24, yy + 122, fw - 48,
          { size: 13, color: C.gray });
      });
      return yy + 220 + 72;
    },

    // overview + outcomes
    (b, y) => {
      const oh = 480;
      rect(b, "ov bg", 0, y, W, oh, C.bgGray);
      const yy = y + 64;
      label(b, "ov eyebrow", "OVERVIEW", MX, yy, 600,
        { size: 13, weight: "700", color: C.orange });
      label(b, "ov h2", "Course overview", MX, yy + 30, 600, { size: 34, weight: "700" });
      label(b, "ov p", LOREM_P, MX, yy + 90, 560, { size: 16, color: C.gray });
      label(b, "ov h3", "What you will learn", MX + 680, yy, 600, { size: 24, weight: "700" });
      for (let i = 0; i < 4; i++) {
        checkRow(b, "ov " + i, MX + 680, yy + 56 + i * 52, 600, LOREM_S);
      }
      img(b, "ov image", MX, yy + 250, 560, 166, "IMAGE");
      return y + oh;
    },

    // delivery modes
    (b, y) => {
      const yy = secHead(b, "modes", y + 72, "Flexible", "Delivery modes", "");
      const mw2 = (CW - 2 * 24) / 3;
      ["Lorem ipsum", "Dolor sit", "Amet consectetur"].forEach((m2, i) => {
        const bx = MX + i * (mw2 + 24);
        rect(b, "mode " + i, bx, yy, mw2, 200, C.white);
        outlinedRect(b, "mode " + i + " border", bx, yy, mw2, 200, C.border, 1);
        rect(b, "mode icon " + i, bx + 28, yy + 28, 48, 48, C.orangeSoft);
        label(b, "mode t " + i, m2, bx + 28, yy + 96, mw2 - 56, { size: 19, weight: "700" });
        label(b, "mode d " + i, LOREM_S, bx + 28, yy + 128, mw2 - 56,
          { size: 14, color: C.gray });
      });
      return yy + 200 + 72;
    },

    // curriculum modules
    (b, y) => {
      const yy = secHead(b, "mods", y, "Syllabus", "Course modules", "");
      for (let i = 0; i < 6; i++) {
        const by = yy + i * 92;
        rect(b, "mod " + i, MX, by, CW, 80, C.white);
        outlinedRect(b, "mod " + i + " border", MX, by, CW, 80, C.border, 1);
        label(b, "mod n " + i, "Module " + (i + 1), MX + 28, by + 28, 140,
          { size: 15, weight: "700", color: C.orange });
        label(b, "mod t " + i, LOREM_H, MX + 180, by + 28, 800, { size: 16, weight: "600" });
        label(b, "mod m " + i, "[N] lessons", MX + CW - 160, by + 28, 132,
          { size: 14, color: C.lightGray, align: "right" });
      }
      return yy + 6 * 92 + 72;
    },

    // upcoming batches
    (b, y) => {
      const yy = secHead(b, "cbatch", y, "Batches", "Upcoming batches", "");
      const bww = (CW - 2 * 24) / 3;
      for (let i = 0; i < 3; i++) {
        const bx = MX + i * (bww + 24);
        rect(b, "cbatch " + i, bx, yy, bww, 300, C.navy);
        label(b, "cbatch mode " + i, "[Weekday / Weekend]", bx + 32, yy + 36, bww - 64,
          { size: 13, weight: "700", color: C.orange });
        label(b, "cbatch date " + i, "[Start date]", bx + 32, yy + 66, bww - 64,
          { size: 26, weight: "700", color: C.white });
        label(b, "cbatch time " + i, "[Class timings]", bx + 32, yy + 110, bww - 64,
          { size: 15, color: C.navyText });
        button(b, "cbatch cta " + i, bx + 32, yy + 200, 220, 48, "Enquire Now", C.green, C.white);
      }
      return yy + 300 + 72;
    },

    (b, y) => statsBand(b, "cstats", y,
      [["[000]", "Lorem"], ["[00]", "Ipsum"], ["[0]", "Dolor"], ["[000]", "Sit"]]),

    // testimonials
    (b, y) => {
      const yy = secHead(b, "ctesti", y + 72, "Testimonials", "What learners say", "");
      return testimonialCards(b, "ctesti", yy, 3) + 72;
    },

    // FAQ
    (b, y) => {
      const yy = secHead(b, "cfaq", y, "FAQ", "Course FAQs", "");
      return faqList(b, "cfaq", yy, [LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q]) + 72;
    },

    // registration form
    (b, y) => {
      const fh = 620;
      rect(b, "reg bg", 0, y, W, fh, C.bgGray);
      const yy = y + 64;
      label(b, "reg h2", "Register your interest", MX, yy, 600, { size: 32, weight: "700" });
      label(b, "reg d", LOREM_S, MX, yy + 52, 560, { size: 15, color: C.gray });
      ["Your name", "Email address", "Phone number"].forEach((f, i) => {
        const fy = yy + i * 92;
        label(b, "reg label " + i, f, MX + 680, fy, 520, { size: 14, weight: "600" });
        outlinedRect(b, "reg box " + i, MX + 680, fy + 26, 520, 48, C.border, 1);
        label(b, "reg ph " + i, "Lorem ipsum", MX + 696, fy + 41, 400,
          { size: 14, color: C.lightGray });
      });
      const ry = yy + 3 * 92;
      label(b, "reg label c", "Select course", MX + 680, ry, 520, { size: 14, weight: "600" });
      outlinedRect(b, "reg box c", MX + 680, ry + 26, 520, 48, C.border, 1);
      label(b, "reg ph c", name, MX + 696, ry + 41, 400, { size: 14, color: C.lightGray });
      button(b, "reg send", MX, yy + 420, 240, 54, "Submit", C.orange, C.white);
      return y + fh;
    },

    (b, y) => {
      let y2 = ctaBand(b, y, "Ready to enroll in " + name + "?", LOREM_S, "Enroll Now");
      y2 = footer(b, y2);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, name, steps);
}

// ---------- SERVICES (chunked) ----------
function drawServices(board) {
  const steps = [
    (b, y) => navbar(b, y, "Services"),
    (b, y) => pageHero(b, y, "Our Services", LOREM_P),

    // catalogue
    (b, y) => {
      const yy = secHead(b, "svc", y + 72, "What we do", "Services for every need", LOREM_S);
      const svcs = ["Corporate Training", "Cyber Security", "Web Development",
                    "Digital Marketing", "Cloud Consulting", "IT Support"];
      const sw = (CW - 2 * 24) / 3;
      svcs.forEach((s, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const bx = MX + col * (sw + 24), by = yy + row * 300;
        rect(b, "svc " + i, bx, by, sw, 276, C.white);
        outlinedRect(b, "svc " + i + " border", bx, by, sw, 276, C.border, 1);
        rect(b, "svc icon " + i, bx + 32, by + 32, 56, 56, C.orangeSoft);
        label(b, "svc title " + i, s, bx + 32, by + 110, sw - 64, { size: 21, weight: "700" });
        label(b, "svc desc " + i, LOREM_S, bx + 32, by + 146, sw - 64,
          { size: 15, color: C.gray });
        label(b, "svc link " + i, "Learn more →", bx + 32, by + 228, 200,
          { size: 15, weight: "700", color: C.orange });
      });
      return yy + 2 * 300 + 72;
    },

    // engagement process
    (b, y) => {
      const yy = secHead(b, "sproc", y, "Process", "How we work", "");
      return processSteps(b, "sproc", yy,
        [["01", "Choose a Service", LOREM_S], ["02", "Request a Meeting", LOREM_S],
         ["03", "Receive Custom Plan", LOREM_S], ["04", "Let's Make it Happen", LOREM_S]]) + 72;
    },

    // why-us band
    (b, y) => {
      const wh = 300;
      rect(b, "whyus bg", 0, y, W, wh, C.navy);
      label(b, "whyus t", "Lorem ipsum dolor sit amet", MX, y + 70, 700,
        { size: 30, weight: "700", color: C.white });
      label(b, "whyus d", LOREM_P, MX, y + 125, 640, { size: 15, color: C.navyText });
      button(b, "whyus cta", W - MX - 260, y + 123, 260, 54, "Talk to a Trainer", C.orange, C.white);
      return y + wh;
    },

    // FAQ
    (b, y) => {
      const yy = secHead(b, "sfaq", y + 72, "FAQ", "Service FAQs", "");
      return faqList(b, "sfaq", yy, [LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q]) + 72;
    },

    (b, y) => {
      let y2 = ctaBand(b, y, "Need help choosing a service?", LOREM_S, "Talk to a Trainer");
      y2 = footer(b, y2);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Services", steps);
}

// ---------- TEAM MEMBERS (chunked) ----------
function drawTeam(board) {
  const steps = [
    (b, y) => navbar(b, y, "Team Members"),
    (b, y) => pageHero(b, y, "Team Members", LOREM_P),

    (b, y) => {
      const yy = secHead(b, "tm", y + 72, "Leadership", "Meet our leadership", LOREM_S);
      return leadershipCards(b, "tm", yy) + 72;
    },

    // values strip
    (b, y) => {
      const yy = secHead(b, "tval", y, "Culture", "What we stand for", "");
      const vw = (CW - 2 * 24) / 3;
      ["Lorem ipsum", "Dolor sit", "Amet consectetur"].forEach((v, i) => {
        const bx = MX + i * (vw + 24);
        rect(b, "tval " + i, bx, yy, vw, 180, C.orangeSoft);
        label(b, "tval t " + i, v, bx + 32, yy + 52, vw - 64,
          { size: 21, weight: "700", align: "center" });
        label(b, "tval d " + i, LOREM_S, bx + 32, yy + 92, vw - 64,
          { size: 14, color: C.gray, align: "center" });
      });
      return yy + 180 + 72;
    },

    (b, y) => {
      let y2 = ctaBand(b, y, "Want to join the team?", LOREM_S, "Contact Us");
      y2 = footer(b, y2);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Team Members", steps);
}

// ---------- CONTACT US (chunked) ----------
function drawContact(board) {
  const steps = [
    (b, y) => navbar(b, y, "Contact Us"),
    (b, y) => pageHero(b, y, "Contact Us", LOREM_P),

    // form + info cards
    (b, y) => {
      const yy = y + 72;
      rect(b, "form", MX, yy, 620, 640, C.white);
      outlinedRect(b, "form border", MX, yy, 620, 640, C.border, 1);
      label(b, "form t", "Send us a message", MX + 40, yy + 36, 540, { size: 24, weight: "700" });
      ["Your name", "Email address", "Phone number"].forEach((f, i) => {
        const fy = yy + 96 + i * 92;
        label(b, "fld label " + i, f, MX + 40, fy, 540, { size: 14, weight: "600" });
        outlinedRect(b, "fld box " + i, MX + 40, fy + 26, 540, 48, C.border, 1);
        label(b, "fld ph " + i, "Lorem ipsum", MX + 56, fy + 41, 400,
          { size: 14, color: C.lightGray });
      });
      const my = yy + 96 + 3 * 92;
      label(b, "fld label m", "Message", MX + 40, my, 540, { size: 14, weight: "600" });
      outlinedRect(b, "fld box m", MX + 40, my + 26, 540, 120, C.border, 1);
      label(b, "fld ph m", "Lorem ipsum dolor sit amet…", MX + 56, my + 42, 400,
        { size: 14, color: C.lightGray });
      button(b, "form send", MX + 40, my + 172, 220, 52, "Send Message", C.orange, C.white);

      ["Call Us", "Email Us", "Visit Us", "Working Hours"].forEach((inf, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const bx = MX + 660 + col * 320, by = yy + row * 250;
        rect(b, "cinfo " + i, bx, by, 300, 220, C.white);
        outlinedRect(b, "cinfo " + i + " border", bx, by, 300, 220, C.border, 1);
        rect(b, "cinfo icon " + i, bx + 24, by + 24, 44, 44, C.orangeSoft);
        label(b, "cinfo t " + i, inf, bx + 24, by + 86, 252, { size: 17, weight: "700" });
        label(b, "cinfo d1 " + i, "[Lorem ipsum]", bx + 24, by + 116, 252,
          { size: 14, color: C.gray });
        label(b, "cinfo d2 " + i, "[Dolor sit amet]", bx + 24, by + 140, 252,
          { size: 14, color: C.gray });
      });
      button(b, "wa", MX + 660, yy + 2 * 250 + 24, 300, 52, "WhatsApp Us", C.green, C.white);
      return yy + 640 + 72;
    },

    // enrolment steps
    (b, y) => {
      const yy = secHead(b, "enrol", y, "Enrolment", "How enrolment works", "");
      return processSteps(b, "enrol", yy,
        [["01", "Submit Enquiry", LOREM_S], ["02", "Career Guidance", LOREM_S],
         ["03", "Attend Free Demo", LOREM_S], ["04", "Choose Batch", LOREM_S],
         ["05", "Start Learning", LOREM_S]]) + 72;
    },

    // map + contact block
    (b, y) => {
      img(b, "map", MX, y, CW, 320, "MAP PLACEHOLDER");
      let y2 = y + 320 + 72;
      const chh = 200;
      rect(b, "cblock bg", 0, y2, W, chh, C.bgGray);
      label(b, "cblock t", "Lorem ipsum dolor sit amet?", MX, y2 + 56, 700, { size: 26, weight: "700" });
      label(b, "cblock d", "[Phone]  •  [Email]  •  [Address, Hyderabad]  •  [Hours]",
        MX, y2 + 104, 900, { size: 15, color: C.gray });
      return y2 + chh;
    },

    (b, y) => {
      const y2 = footer(b, y);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Contact Us", steps);
}

// ---------- v4: B2B + Resources pages (chunked) ----------

// Real tier data from the approved B2B package-tiers draft (2026-10-02).
const TIERS = [
  {
    name: "Missed Enquiry Killer", tag: "WhatsApp Lead Automation",
    setup: "₹7,999", monthly: "₹1,999", popular: false,
    feats: [
      "WhatsApp Cloud API setup",
      "Instant auto-reply + lead capture",
      "Counsellor alerts (WhatsApp + email)",
      "1 admission broadcast / month",
      "1,000 Meta conversations / mo",
    ],
  },
  {
    name: "Admissions on Autopilot", tag: "Automation + Follow-up",
    setup: "₹14,999", monthly: "₹3,999", popular: true,
    feats: [
      "Everything in Tier 1",
      "Qualification chatbot",
      "Automated follow-up sequences",
      "CRM-lite dashboard + attribution",
      "2 numbers · 5,000 conversations / mo",
      "Monthly performance review call",
    ],
  },
  {
    name: "Institute OS", tag: "Automation + LMS + Labs",
    setup: "₹29,999", monthly: "₹7,999", popular: false,
    feats: [
      "Everything in Tier 2",
      "Watermarked video LMS",
      "Online test-series module",
      "PXE thin-client lab setup",
      "Priority support + quarterly review",
    ],
  },
];

function tierCards(board, name, y) {
  const tw = (CW - 2 * 24) / 3, th = 680;
  TIERS.forEach((t, i) => {
    const bx = MX + i * (tw + 24);
    rect(board, name + " " + i, bx, y, tw, th, C.white);
    outlinedRect(board, name + " " + i + " border", bx, y, tw, th,
      t.popular ? C.orange : C.border, t.popular ? 2 : 1);
    let yy = y + 32;
    if (t.popular) {
      chip(board, name + " pop " + i, bx + 28, yy, "MOST POPULAR", C.white, C.orange);
      yy += 52;
    }
    label(board, name + " tier " + i, "TIER " + (i + 1), bx + 28, yy, tw - 56,
      { size: 13, weight: "700", color: C.orange });
    label(board, name + " name " + i, t.name, bx + 28, yy + 24, tw - 56,
      { size: 23, weight: "800" });
    label(board, name + " tag " + i, t.tag, bx + 28, yy + 60, tw - 56,
      { size: 14, color: C.gray });
    label(board, name + " price " + i, t.monthly, bx + 28, yy + 104, tw - 56,
      { size: 44, weight: "800" });
    label(board, name + " per " + i, "/ month", bx + 28, yy + 156, tw - 56,
      { size: 15, color: C.gray });
    label(board, name + " setup " + i, t.setup + " one-time setup", bx + 28, yy + 184, tw - 56,
      { size: 14, weight: "600" });
    t.feats.forEach((f, j) => {
      checkRow(board, name + " f " + i + "_" + j, bx + 28, yy + 232 + j * 44, tw - 56, f);
    });
    button(board, name + " cta " + i, bx + 28, y + th - 84, tw - 56, 52,
      "Book a Demo", t.popular ? C.orange : C.dark, C.white);
  });
  return y + th;
}

function compareMatrix(board, name, y) {
  const rows = [
    ["WhatsApp Cloud API setup", 1, 1, 1],
    ["Auto-reply + lead capture", 1, 1, 1],
    ["Counsellor alerts", 1, 1, 1],
    ["Admission broadcasts", "1 / mo", "4 / mo", "Unlimited"],
    ["Qualification chatbot", 0, 1, 1],
    ["Follow-up sequences", 0, 1, 1],
    ["CRM-lite dashboard", 0, 1, 1],
    ["Watermarked video LMS", 0, 0, 1],
    ["Test-series module", 0, 0, 1],
    ["PXE thin-client lab setup", 0, 0, 1],
    ["Support", "Email", "WhatsApp", "Priority + quarterly review"],
  ];
  const colF = 560, colT = (CW - colF) / 3, rh = 52;
  rect(board, name + " hbg", MX, y, CW, 56, C.navy);
  label(board, name + " hf", "Features", MX + 28, y + 17, colF - 56,
    { size: 15, weight: "700", color: C.white });
  ["Tier 1", "Tier 2", "Tier 3"].forEach((t, i) => {
    label(board, name + " ht " + i, t, MX + colF + i * colT, y + 17, colT,
      { size: 15, weight: "700", color: C.white, align: "center" });
  });
  let yy = y + 56;
  rows.forEach((r, i) => {
    if (i % 2 === 1) rect(board, name + " zebra " + i, MX, yy, CW, rh, C.bgGray);
    outlinedRect(board, name + " row " + i, MX, yy, CW, rh, C.border, 1);
    label(board, name + " f " + i, r[0], MX + 28, yy + 15, colF - 56,
      { size: 15, weight: "600" });
    for (let j = 1; j <= 3; j++) {
      const v = r[j];
      const txt = v === 1 ? "✓" : v === 0 ? "—" : v;
      label(board, name + " c " + i + "_" + j, txt, MX + colF + (j - 1) * colT, yy + 13, colT,
        { size: v === 1 ? 20 : 14, weight: "700", color: v === 1 ? C.green : C.gray, align: "center" });
    }
    yy += rh;
  });
  return yy;
}

// ---------- FOR INSTITUTES (chunked) ----------
function drawForInstitutes(board) {
  const steps = [
    (b, y) => navbar(b, y, "For Institutes"),

    // hero — pain-killer headline + dual CTA
    (b, y) => {
      const hh = 620;
      rect(b, "ihero bg", 0, y, W, hh, C.navy);
      label(b, "ihero h1", "Stop losing admission enquiries after hours.",
        MX, y + 120, 700, { size: 52, weight: "800", color: C.white });
      label(b, "ihero sub", LOREM_P, MX, y + 300, 620, { size: 18, color: C.navyText });
      button(b, "ihero cta1", MX, y + 420, 220, 54, "Book a Demo", C.orange, C.white);
      button(b, "ihero cta2", MX + 236, y + 420, 220, 54, "Start Free Trial", C.white, C.orange);
      label(b, "ihero micro", "No credit card required  •  Cancel anytime",
        MX, y + 492, 620, { size: 14, color: C.navyText });
      img(b, "ihero image", MX + 780, y + 110, 500, 400, "PRODUCT IMAGE");
      return y + hh;
    },

    // problem → solution (3 pain cards)
    (b, y) => {
      const yy = secHead(b, "pain", y + 72, "The problem", "Sound familiar?", "");
      const pw = (CW - 2 * 24) / 3;
      ["Missed enquiries", "Manual follow-ups", "No visibility"].forEach((p, i) => {
        const bx = MX + i * (pw + 24);
        rect(b, "pain " + i, bx, yy, pw, 240, C.white);
        outlinedRect(b, "pain " + i + " border", bx, yy, pw, 240, C.border, 1);
        rect(b, "pain icon " + i, bx + 28, yy + 28, 48, 48, C.orangeSoft);
        label(b, "pain t " + i, p, bx + 28, yy + 96, pw - 56, { size: 20, weight: "700" });
        label(b, "pain d " + i, LOREM_S, bx + 28, yy + 130, pw - 56,
          { size: 14, color: C.gray });
      });
      return yy + 240 + 72;
    },

    // products teaser
    (b, y) => {
      const yy = secHead(b, "iprod", y, "Products", "Everything an institute needs", "");
      const pw = (CW - 2 * 24) / 3;
      TIERS.forEach((t, i) => {
        const bx = MX + i * (pw + 24);
        rect(b, "iprod " + i, bx, yy, pw, 260, C.white);
        outlinedRect(b, "iprod " + i + " border", bx, yy, pw, 260, C.border, 1);
        label(b, "iprod tier " + i, "TIER " + (i + 1), bx + 28, yy + 28, pw - 56,
          { size: 13, weight: "700", color: C.orange });
        label(b, "iprod name " + i, t.name, bx + 28, yy + 52, pw - 56,
          { size: 21, weight: "800" });
        label(b, "iprod price " + i, t.monthly + " / mo", bx + 28, yy + 120, pw - 56,
          { size: 26, weight: "800" });
        label(b, "iprod link " + i, "View pricing →", bx + 28, yy + 196, 200,
          { size: 15, weight: "700", color: C.orange });
      });
      return yy + 260 + 72;
    },

    // how it works — 5 steps
    (b, y) => {
      const yy = secHead(b, "isteps", y, "How it works", "Live in 5 steps", "");
      return processSteps(b, "isteps", yy,
        [["01", "Book a Demo", LOREM_S], ["02", "We Map Your Funnel", LOREM_S],
         ["03", "Setup & Integration", LOREM_S], ["04", "Team Training", LOREM_S],
         ["05", "Go Live", LOREM_S]]) + 72;
    },

    // proof stack: logo wall → stat blocks → case studies
    (b, y) => logoStrip(b, "iware", y + 24, "TRUSTED BY INSTITUTES", 4) + 48,
    (b, y) => statsBand(b, "istats", y,
      [["[X%]", "More enquiries captured"], ["[X%]", "Faster response time"],
       ["[X]", "Institutes onboard"], ["[X]", "Messages automated"]]),
    (b, y) => {
      const yy = secHead(b, "icase", y + 72, "Case studies", "Results our pilots see", "");
      const cw = (CW - 24) / 2;
      for (let i = 0; i < 2; i++) {
        const bx = MX + i * (cw + 24);
        rect(b, "icase " + i, bx, yy, cw, 300, C.white);
        outlinedRect(b, "icase " + i + " border", bx, yy, cw, 300, C.border, 1);
        img(b, "icase img " + i, bx + 28, yy + 28, cw - 56, 150, "IMAGE");
        label(b, "icase n " + i, "[Institute name]", bx + 28, yy + 194, cw - 56,
          { size: 18, weight: "700" });
        label(b, "icase r " + i, "[+X% admission enquiries]", bx + 28, yy + 224, cw - 56,
          { size: 15, weight: "700", color: C.green });
      }
      return yy + 300 + 72;
    },

    // integrations wall
    (b, y) => {
      let yy = secHead(b, "iint", y, "Integrations", "Plays well with your stack", "");
      let cx = MX;
      ["WhatsApp", "[CRM]", "[SMS gateway]", "[Payment gateway]", "[Google Sheets]"].forEach((t, i) => {
        const w = chip(b, "iint " + i, cx, yy, t, C.dark, C.white);
        cx += w + 12;
      });
      return yy + 36 + 72;
    },

    // pricing teaser
    (b, y) => {
      const ph = 280;
      rect(b, "iprice bg", 0, y, W, ph, C.orangeSoft);
      label(b, "iprice t", "Simple pricing, no surprises.", MX, y + 70, 700,
        { size: 30, weight: "700" });
      label(b, "iprice d", "Three tiers. Monthly billing. Cancel anytime.", MX, y + 118, 640,
        { size: 15, color: C.gray });
      button(b, "iprice cta", W - MX - 260, y + 113, 260, 54, "View Pricing", C.orange, C.white);
      return y + ph;
    },

    // FAQ
    (b, y) => {
      const yy = secHead(b, "ifaq", y + 72, "FAQ", "Questions institutes ask", "");
      return faqList(b, "ifaq", yy, [LOREM_Q, LOREM_Q, LOREM_Q, LOREM_Q]) + 72;
    },

    // demo booking form (4 fields)
    (b, y) => {
      const fh = 620;
      rect(b, "demo bg", 0, y, W, fh, C.bgGray);
      const yy = y + 64;
      label(b, "demo h2", "Book your demo", MX, yy, 560, { size: 32, weight: "700" });
      label(b, "demo d", LOREM_S, MX, yy + 52, 520, { size: 15, color: C.gray });
      label(b, "demo call", "Prefer to talk? Call +91 91826 54056", MX, yy + 140, 560,
        { size: 16, weight: "700" });
      label(b, "demo wa", "WhatsApp: 919885189951", MX, yy + 170, 560,
        { size: 16, weight: "600", color: C.green });
      button(b, "demo trial", MX, yy + 240, 260, 54, "Start Free Trial", C.dark, C.white);
      rect(b, "demo form", MX + 660, yy, 620, 480, C.white);
      outlinedRect(b, "demo form border", MX + 660, yy, 620, 480, C.border, 1);
      ["Your name", "Institute name", "Email address", "Phone number"].forEach((f, i) => {
        const fy = yy + 36 + i * 92;
        label(b, "demo fld " + i, f, MX + 700, fy, 540, { size: 14, weight: "600" });
        outlinedRect(b, "demo box " + i, MX + 700, fy + 26, 540, 48, C.border, 1);
        label(b, "demo ph " + i, "Lorem ipsum", MX + 716, fy + 41, 400,
          { size: 14, color: C.lightGray });
      });
      button(b, "demo send", MX + 700, yy + 36 + 4 * 92, 240, 52, "Book a Demo", C.orange, C.white);
      return y + fh;
    },

    (b, y) => {
      const y2 = footer(b, y);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "For Institutes", steps);
}

// ---------- PRICING (chunked) ----------
function drawPricing(board) {
  const steps = [
    (b, y) => navbar(b, y, "Pricing"),
    (b, y) => pageHero(b, y, "Pricing",
      "Simple pricing, no surprises. Meta's per-conversation WhatsApp fees are passed through at cost on every tier."),

    (b, y) => {
      const yy = secHead(b, "tiers", y + 72, "Plans", "Choose your plan", "");
      return tierCards(b, "tiers", yy) + 72;
    },

    (b, y) => {
      const yy = secHead(b, "cmp", y, "Compare", "Compare plans", "");
      return compareMatrix(b, "cmp", yy) + 72;
    },

    // pilot offer band
    (b, y) => {
      const ph = 300;
      rect(b, "pilot bg", 0, y, W, ph, C.navy);
      label(b, "pilot t", "Founding pilot offer", MX, y + 64, 700,
        { size: 30, weight: "700", color: C.white });
      label(b, "pilot d", "First 3 institutes: 50% off the setup fee in exchange for a quantified case study. Monthly billing, cancel anytime.",
        MX, y + 114, 640, { size: 15, color: C.navyText });
      button(b, "pilot cta", W - MX - 260, y + 123, 260, 54, "Claim Pilot Offer", C.orange, C.white);
      return y + ph;
    },

    // FAQ
    (b, y) => {
      const yy = secHead(b, "pfaq", y + 72, "FAQ", "Pricing FAQs", "");
      return faqList(b, "pfaq", yy, [
        "What are Meta's per-message charges?",
        LOREM_Q, LOREM_Q, LOREM_Q,
      ]) + 72;
    },

    (b, y) => {
      let y2 = ctaBand(b, y, "Ready to automate admissions?", LOREM_S, "Book a Demo");
      y2 = footer(b, y2);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Pricing", steps);
}

// ---------- WHY CHOOSE US (chunked) ----------
function drawWhyChooseUs(board) {
  const steps = [
    (b, y) => navbar(b, y, "Why Choose Us"),
    (b, y) => pageHero(b, y, "Why Choose Us", LOREM_P),

    // differentiator cards
    (b, y) => {
      const yy = secHead(b, "wcu", y + 72, "Differentiators", "Why learners choose GradeSpot", "");
      const diffs = ["[Differentiator 1]", "[Differentiator 2]", "[Differentiator 3]",
                     "[Differentiator 4]", "[Differentiator 5]", "[Differentiator 6]"];
      const dw = (CW - 2 * 24) / 3;
      diffs.forEach((d, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const bx = MX + col * (dw + 24), by = yy + row * 280;
        rect(b, "wcu " + i, bx, by, dw, 256, C.white);
        outlinedRect(b, "wcu " + i + " border", bx, by, dw, 256, C.border, 1);
        rect(b, "wcu icon " + i, bx + 28, by + 28, 52, 52, C.orangeSoft);
        label(b, "wcu t " + i, d, bx + 28, by + 100, dw - 56, { size: 20, weight: "700" });
        label(b, "wcu d " + i, LOREM_P, bx + 28, by + 134, dw - 56,
          { size: 14, color: C.gray });
      });
      return yy + 2 * 280 + 72;
    },

    // proof: placeholder stats band
    (b, y) => statsBand(b, "wstats", y,
      [["[0000]", "Lorem ipsum"], ["[0000]", "Dolor sit"], ["[000]", "Amet"], ["[00]", "Consectetur"]]),

    (b, y) => {
      let y2 = ctaBand(b, y, "Experience the GradeSpot difference", LOREM_S, "Explore Trainings");
      y2 = footer(b, y2);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Why Choose Us", steps);
}

// ---------- TESTIMONIALS (chunked) ----------
function drawTestimonials(board) {
  const steps = [
    (b, y) => navbar(b, y, "Testimonials"),
    (b, y) => pageHero(b, y, "Testimonials", LOREM_P),

    // wall of love
    (b, y) => {
      const yy = secHead(b, "tst", y + 72, "Wall of love", "What learners say", "");
      let y2 = testimonialCards(b, "tst", yy, 3) + 48;
      y2 = testimonialCards(b, "tst2", y2, 3) + 24;
      label(b, "tst note", "[Real learner testimonials will appear here — layout sample only]",
        MX, y2, CW, { size: 14, color: C.lightGray, align: "center" });
      return y2 + 48 + 48;
    },

    // video testimonials
    (b, y) => {
      const yy = secHead(b, "tvid", y, "Watch", "Video testimonials", "");
      const vw = (CW - 2 * 24) / 3;
      for (let i = 0; i < 3; i++) {
        const bx = MX + i * (vw + 24);
        img(b, "tvid " + i, bx, yy, vw, 300, "VIDEO");
        label(b, "tvid n " + i, "[Full name]", bx, yy + 320, vw, { size: 16, weight: "700" });
        label(b, "tvid r " + i, "[Course / role]", bx, yy + 346, vw,
          { size: 13, color: C.lightGray });
      }
      return yy + 380 + 72;
    },

    (b, y) => {
      let y2 = ctaBand(b, y, "Your story could be next", LOREM_S, "Explore Trainings");
      y2 = footer(b, y2);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Testimonials", steps);
}

// ---------- STUDENT CERTIFICATIONS (chunked) ----------
function drawCertifications(board) {
  const steps = [
    (b, y) => navbar(b, y, "Student Certifications"),
    (b, y) => pageHero(b, y, "Student Certifications", LOREM_P),

    // certificate gallery
    (b, y) => {
      const yy = secHead(b, "cert", y + 72, "Certified", "Our certified learners", "");
      const cw = (CW - 2 * 24) / 3;
      for (let i = 0; i < 6; i++) {
        const col = i % 3, row = Math.floor(i / 3);
        const bx = MX + col * (cw + 24), by = yy + row * 460;
        rect(b, "cert " + i, bx, by, cw, 436, C.white);
        outlinedRect(b, "cert " + i + " border", bx, by, cw, 436, C.border, 1);
        img(b, "cert img " + i, bx + 28, by + 28, cw - 56, 260, "CERTIFICATE");
        label(b, "cert n " + i, "[Student name]", bx + 28, by + 308, cw - 56,
          { size: 18, weight: "700" });
        label(b, "cert c " + i, "[Course]", bx + 28, by + 336, cw - 56,
          { size: 14, weight: "600", color: C.orange });
        label(b, "cert yr " + i, "[Year]", bx + 28, by + 362, cw - 56,
          { size: 13, color: C.lightGray });
      }
      return yy + 2 * 460 + 72;
    },

    // verify band
    (b, y) => {
      const vh = 260;
      rect(b, "vband bg", 0, y, W, vh, C.navy);
      label(b, "vband t", "Employers: verify any certificate instantly.", MX, y + 70, 700,
        { size: 28, weight: "700", color: C.white });
      label(b, "vband d", LOREM_S, MX, y + 118, 640, { size: 15, color: C.navyText });
      button(b, "vband cta", W - MX - 260, y + 103, 260, 54, "Verify Now", C.orange, C.white);
      return y + vh;
    },

    (b, y) => {
      const y2 = footer(b, y);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Student Certifications", steps);
}

// ---------- CERTIFICATE VERIFICATION (chunked) ----------
function drawVerify(board) {
  const steps = [
    (b, y) => navbar(b, y, "Certificate Verification"),
    (b, y) => pageHero(b, y, "Certificate Verification", LOREM_P),

    // lookup tool with sample result states
    (b, y) => {
      let yy = secHead(b, "lookup", y + 72, "Verify", "Check a certificate", "");
      const lw = 720, lx = (W - lw) / 2;
      rect(b, "lookup card", lx, yy, lw, 200, C.white);
      outlinedRect(b, "lookup card border", lx, yy, lw, 200, C.border, 1);
      label(b, "lookup label", "Certificate ID", lx + 40, yy + 36, 400,
        { size: 15, weight: "600" });
      outlinedRect(b, "lookup box", lx + 40, yy + 66, 440, 54, C.border, 1);
      label(b, "lookup ph", "[e.g. GS-2026-0001]", lx + 58, yy + 83, 400,
        { size: 15, color: C.lightGray });
      button(b, "lookup btn", lx + 500, yy + 66, 180, 54, "Verify", C.orange, C.white);
      yy += 200 + 56;

      // sample state: verified
      rect(b, "vs ok", lx, yy, lw, 240, C.white);
      outlinedRect(b, "vs ok border", lx, yy, lw, 240, C.green, 2);
      label(b, "vs ok badge", "✓ VERIFIED — SAMPLE STATE", lx + 40, yy + 28, 500,
        { size: 14, weight: "800", color: C.green });
      label(b, "vs ok n", "[Student full name]", lx + 40, yy + 66, 500,
        { size: 22, weight: "700" });
      label(b, "vs ok c", "[Course name]  •  [Issue date]  •  [Certificate ID]",
        lx + 40, yy + 104, 640, { size: 15, color: C.gray });

      yy += 240 + 32;
      // sample state: not found
      rect(b, "vs no", lx, yy, lw, 190, C.white);
      outlinedRect(b, "vs no border", lx, yy, lw, 190, C.red, 2);
      label(b, "vs no badge", "✗ NOT FOUND — SAMPLE STATE", lx + 40, yy + 28, 500,
        { size: 14, weight: "800", color: C.red });
      label(b, "vs no d", "[No record matches this ID. Check the ID and try again.]",
        lx + 40, yy + 66, 640, { size: 15, color: C.gray });
      return yy + 190 + 72;
    },

    // support band (real contact facts)
    (b, y) => {
      const sh = 280;
      rect(b, "vhelp bg", 0, y, W, sh, C.bgGray);
      label(b, "vhelp t", "Didn't find your certificate?", MX, y + 70, 700,
        { size: 28, weight: "700" });
      label(b, "vhelp d", "Call +91 91826 54056  •  WhatsApp 919885189951  •  [Email address]",
        MX, y + 118, 800, { size: 16, color: C.gray });
      button(b, "vhelp cta", W - MX - 260, y + 113, 260, 54, "Contact Us", C.orange, C.white);
      return y + sh;
    },

    (b, y) => {
      const y2 = footer(b, y);
      whatsappFloat(b, y2);
      return y2;
    },
  ];
  return runSteps(board, "Certificate Verification", steps);
}

// ---------- dispatcher (async) ----------
const PAGES = {
  home: ["Home", drawHome],
  about: ["About Us", drawAbout],
  trainings: ["Trainings", drawTrainings],
  services: ["Services", drawServices],
  "for-institutes": ["For Institutes", drawForInstitutes],
  pricing: ["Pricing", drawPricing],
  "why-choose-us": ["Why Choose Us", drawWhyChooseUs],
  testimonials: ["Testimonials", drawTestimonials],
  certifications: ["Student Certifications", drawCertifications],
  verify: ["Certificate Verification", drawVerify],
  team: ["Team Members", drawTeam],
  contact: ["Contact Us", drawContact],
};
COURSE_CATALOG.forEach((c) => {
  PAGES[c[0]] = [c[1], function (board) { return drawCourseDetail(board, c[0]); }];
});

async function drawSitePage(key) {
  const def = PAGES[key];
  if (!def) throw new Error("unknown page: " + key);
  const board = penpot.createBoard();
  board.name = def[0];
  board.x = 0; board.y = 0;
  board.resize(W, 200);
  board.fills = [{ fillColor: C.white }];
  const h = Math.ceil(await def[1](board));
  board.resize(W, h);
  return { board: def[0], height: h };
}

penpot.ui.onMessage((message) => {
  if (!message || typeof message.type !== "string") return;
  (async () => {
    try {
      if (message.type === "draw") {
        const r = await drawSitePage(message.page);
        penpot.ui.sendMessage({
          type: "done", ok: true,
          detail: "Drew '" + r.board + "' (" + r.height + "px tall) on this page.",
        });
      } else if (message.type === "new-page") {
        penpot.createPage("Designs v4");
        penpot.ui.sendMessage({
          type: "done", ok: true,
          detail: "Created page 'Designs v4' — click it in the pages panel, then draw each board.",
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
      } else if (message.type === "draw5") {
        const r = await drawV5Page(message.page);
        penpot.ui.sendMessage({
          type: "done", ok: true,
          detail: "Drew v5 '" + r.board + "' (" + r.height + "px tall) on this page.",
        });
      } else if (message.type === "new-page5") {
        penpot.createPage("Designs v5 — Next.js + Carbon");
        penpot.ui.sendMessage({
          type: "done", ok: true,
          detail: "Created page 'Designs v5 — Next.js + Carbon' — click it in the pages panel, then draw each board.",
        });
      }
    } catch (err) {
      penpot.ui.sendMessage({
        type: "done", ok: false,
        detail: "Error at '" + lastStep + "': " + (err && err.message ? err.message : String(err)),
      });
    }
  })();
});

// ==================== v5 — Designs v5: Next.js + Carbon ====================
// Real verified content (gsitssolutions.com audit 2026-10-03) + exported
// design tokens. Every board carries a route strip: Next.js route, the
// app-router file, and the Carbon component mapping for that page.
// Carbon = IBM Carbon Design System (@carbon/react). Theme note: keep
// Carbon's spacing/type scale; GradeSpot brand tokens below override the
// interactive/brand tokens in a custom Carbon theme (custom-theme.scss).

const T5 = {
  orange: "#F7631B", orangeLight: "#F98238", navy: "#0E2B3D",
  ink: "#111827", body: "#666666", muted: "#7A7A7A", sec: "#54595F",
  bgLight: "#F3F7FD", tint: "#EDF5FF", border: "#E7E7E7", borderD: "#DDDDDD",
  white: "#FFFFFF", black: "#000000", green: "#059669",
  footLink: "#9CA3AF", imgBg: "#E9EDF2", dark: "#0E2B3D",
};
const W5 = 1440, MX5 = 80, CW5 = W5 - MX5 * 2;
const MW5 = 390, MMX5 = 20, MCW5 = MW5 - MMX5 * 2;

// ---------- verified content ----------
const DATA5 = {
  stats: [["1,200+", "Certified Learners"], ["1,500+", "Students Enrolled"],
          ["250+", "Interns"], ["12", "Web Projects"], ["9 yrs", "Experience"]],
  badges: ["ISO 9001:2015 Certified", "AICTE-Approved Internships"],
  phones: ["+91 91826 54056", "+91 88866 60597"],
  emails: ["info@gsitssolutions.com", "hr@gsitssolutions.com"],
  address: "16-126, 2nd Floor, Road No.1, Sri Krishna Nagar, Near Sai Baba Temple, Dilsukhnagar, Hyderabad 500060",
  hours: "Office hours: 8:00 AM – 9:00 PM",
  courses: [
    { key: "soc-analyst", name: "SOC Analyst Training", tag: "Bestseller · 90-day",
      blurb: "Threat detection & incident response with Splunk, IBM QRadar and Microsoft Sentinel. Free EC-Council C|SA exam voucher." },
    { key: "ccna", name: "CCNA 200-301", tag: "Networking",
      blurb: "Networking fundamentals to enterprise routing & switching, with hands-on labs." },
    { key: "cyber-security-professional", name: "Cyber Security Professional", tag: "Career track",
      blurb: "End-to-end cybersecurity program — from fundamentals to SOC-ready skills." },
    { key: "azure-administrator", name: "Azure Administrator (AZ-104)", tag: "Cloud",
      blurb: "Deploy, manage and monitor Azure infrastructure. Cleared by our learners." },
    { key: "aws-cloud", name: "AWS Cloud", tag: "Cloud",
      blurb: "AWS architecture & services on the Solutions Architect track." },
    { key: "comptia-pentest-plus", name: "CompTIA Pentest+", tag: "Security",
      blurb: "Penetration testing — planning, exploitation and reporting." },
    { key: "comptia-network-plus", name: "CompTIA Network+", tag: "Networking",
      blurb: "Vendor-neutral networking certification track." },
    { key: "digital-marketing", name: "Digital Marketing", tag: "Marketing",
      blurb: "SEO, ads and analytics for real businesses." },
    { key: "web-development", name: "Web Development", tag: "Development",
      blurb: "Modern web development — design to deployment." },
    { key: "ceh", name: "CEH — Certified Ethical Hacker", tag: "Planned",
      blurb: "Ethical hacking certification track. Launching soon.", planned: true },
    { key: "aws-devops", name: "AWS + DevOps", tag: "Planned",
      blurb: "Cloud + DevOps tooling track. Launching soon.", planned: true },
  ],
  testimonials: [
    ["Naveen Bhaskari", "SOC Analyst @ Wipro", "The practical approach and supportive trainers made all the difference. Their guidance helped me land a job at Wipro as a SOC Analyst."],
    ["Shiva Gottam", "Cleared AZ-104", "I cleared my AZ-104 after the Azure Administrator training. Practical teaching with real-time examples."],
    ["Rohith Kumar", "AWS Solutions Architect", "Learned AWS Cloud and achieved my AWS Solutions Architect certification. Highly recommended."],
    ["Stanes Lovelene Bittari", "CCNA 200-301 & AZ-900", "Completed my CCNA 200-301 and AZ-900 here. Good assistance in certification exams too."],
    ["Riyaz Basha Shaik", "Cyber Security Professional", "Very hands-on teaching — even complex topics were easy to understand."],
    ["Kruthi Krishna Dwaraka", "Cloud certifications", "Learning Cloud at GradeSpot added so much value. Cleared my cloud certifications."],
    ["Network Administrator", "CCNA learner", "The CCNA course was amazing — knowledgeable trainers, hands-on labs and real-world examples."],
  ],
  team: [
    ["Nikhil Duth D", "Founder & MD"],
    ["Aravind Mutthe", "Co-Founder"],
    ["Name TBD", "Sr. Security Engineer & Technical Trainer"],
    ["Name TBD", "Sr. Security Engineer & Technical Trainer"],
    ["Name TBD", "Sr. Security Engineer & Technical Trainer"],
    ["Name TBD", "Sr. Security Engineer & Technical Trainer"],
  ],
  services: [
    ["Corporate Trainings", "Job-ready training across IT technologies, for students and corporates."],
    ["Cybersecurity Services", "Security assessments and solutions for diverse organizations."],
    ["Web Development", "Cost-effective, premium web design and development."],
    ["Digital Marketing", "SEO, ads and content that grow online presence."],
    ["Network Infrastructure", "Design and build of robust network infrastructure."],
    ["Logo Designing", "Brand identities and creative design work."],
  ],
  products: [
    ["WhatsApp Lead Automation", "Every enquiry answered in seconds, 24×7 — even at 2 AM."],
    ["Video LMS", "Your watermarked course library, hosted and managed for you."],
    ["PXE Lab Setup", "Boot 30 systems from one server. Zero per-PC installs."],
  ],
  tiers: [
    ["Starter", "₹7,999", "one-time setup", ["WhatsApp automation", "Lead dashboard", "Email support"]],
    ["Growth", "₹14,999", "one-time setup", ["Everything in Starter", "Video LMS included", "Priority support"]],
    ["Scale", "₹29,999", "one-time setup", ["Everything in Growth", "PXE lab setup", "Dedicated manager"]],
  ],
  faqs: [
    ["Do you offer online and offline classes?", "Yes — classroom training in Dilsukhnagar, Hyderabad, plus live online batches."],
    ["Will I get placement assistance?", "Career tracks include resume guidance, mock interviews and hiring-partner connects."],
    ["Are the trainers working professionals?", "Yes — our trainers are working security engineers and industry practitioners."],
    ["How do I verify a certificate?", "Open the Certificate Verification page and enter your certificate ID."],
  ],
  navLinks: ["Home", "Trainings ▾", "For Businesses", "For Institutes", "Pricing", "About", "Contact"],
};

// ---------- v5 helpers ----------
function v5board(name, vw) {
  vw = vw || W5;
  const b = penpot.createBoard();
  b.name = name; b.x = 0; b.y = 0;
  b.resize(vw, 400);
  b.fills = [{ fillColor: T5.white }];
  return b;
}
function routeStrip(board, route, file, carbon, vw) {
  vw = vw || W5;
  rect(board, "route bg", 0, 0, vw, 46, T5.navy);
  label(board, "route", "ROUTE " + route + "    ·    " + file + "    ·    Carbon: " + carbon,
    20, 14, vw - 40, { size: 12, weight: "700", color: T5.white });
  return 46;
}
function devTag(board, x, y, text, w) {
  w = w || 320;
  rect(board, "devtag bg " + text, x, y, w, 26, T5.tint);
  label(board, "devtag " + text, text, x + 10, y + 5, w - 20,
    { size: 11, weight: "700", color: T5.orange });
  return 34;
}
function v5logo(board, x, y, dark) {
  rect(board, "logo mark", x, y, 44, 44, T5.orange);
  label(board, "logo initials", "GS", x, y + 11, 44, { size: 20, weight: "800", color: T5.white, align: "center" });
  label(board, "logo word", "GradeSpot", x + 56, y + 9, 220, { size: 20, weight: "800", color: dark ? T5.dark : T5.white });
}
function v5kicker(board, x, y, w, text, align) {
  label(board, "kicker", text.toUpperCase(), x, y, w,
    { size: 13, weight: "700", color: T5.orange, align: align || "center" });
  return 30;
}
function v5btn(board, x, y, w, h, text, primary) {
  const bg = primary ? T5.orange : T5.white;
  rect(board, "btn bg " + text, x, y, w, h, bg);
  if (!primary) outlinedRect(board, "btn bd " + text, x, y, w, h, T5.orange, 2);
  label(board, "btn tx " + text, text, x, y + h / 2 - 11, w,
    { size: 16, weight: "700", color: primary ? T5.white : T5.orange, align: "center" });
}
function v5secHead(board, y, eyebrow, title, sub, carbonTag, vw, mx) {
  vw = vw || W5; mx = (mx === undefined) ? MX5 : mx;
  const cw = vw - mx * 2;
  let yy = y + 10;
  yy += devTag(board, mx, yy, "Carbon: " + carbonTag, 360); yy += 6;
  yy += v5kicker(board, mx, yy, cw, eyebrow); 
  label(board, "sec title", title, mx, yy, cw, { size: 40, weight: "700", color: T5.dark, align: "center" });
  yy += 62;
  if (sub) {
    label(board, "sec sub", sub, mx + (cw - 760) / 2, yy, 760, { size: 17, color: T5.body, align: "center" });
    yy += 72;
  } else { yy += 10; }
  return yy;
}

// ---------- v5 NAVBAR (desktop) ----------
function v5nav(board, y, active) {
  let yy = y;
  rect(board, "util bg", 0, yy, W5, 36, T5.navy);
  label(board, "util contact", DATA5.phones[0] + "   ·   " + DATA5.emails[0], MX5, yy + 10, 600,
    { size: 12, weight: "600", color: T5.white });
  label(board, "util badges", DATA5.badges.join("   ·   "), W5 - MX5 - 420, yy + 10, 420,
    { size: 12, weight: "600", color: T5.white, align: "right" });
  yy += 36;
  const h = 76;
  rect(board, "nav bg", 0, yy, W5, h, T5.white);
  rect(board, "nav border", 0, yy + h - 1, W5, 1, T5.border);
  v5logo(board, MX5, yy + 16, true);
  let lx = 330;
  DATA5.navLinks.forEach((l) => {
    const plain = l.replace(" ▾", "");
    const on = plain === active;
    label(board, "nav " + plain, l, lx, yy + 28, 130,
      { size: 14, weight: on ? "700" : "500", color: on ? T5.dark : T5.body });
    if (on) rect(board, "nav on " + plain, lx, yy + 54, 28, 3, T5.orange);
    lx += 118;
  });
  v5btn(board, W5 - MX5 - 190, yy + 15, 190, 46, "Get a Callback", true);
  yy += h;
  devTag(board, MX5, yy + 8, "Carbon: UI Shell Header (custom marketing nav)", 380);
  return yy + 42;
}

// ---------- v5 HERO (desktop, split audience) ----------
function v5hero(board, y) {
  const h = 640;
  rect(board, "hero bg", 0, y, W5, h, T5.bgLight);
  let yy = y + 90;
  yy += devTag(board, MX5, yy, "Carbon: Grid(16) · Tabs · Button", 340); yy += 14;
  yy += v5kicker(board, MX5, yy, 640, "Online & offline · Hyderabad", "left");
  label(board, "hero h1", "Launch your cybersecurity career with hands-on training", MX5, yy, 640,
    { size: 56, weight: "800", color: T5.dark });
  yy += 170;
  label(board, "hero sub", "SOC, ethical hacking, cloud and networking — taught by working security engineers. 1,500+ students enrolled.", MX5, yy, 600,
    { size: 17, color: T5.body });
  yy += 78;
  ["Students", "Businesses", "Institutes"].forEach((t, i) => {
    const bx = MX5 + i * 150;
    rect(board, "aud " + t, bx, yy, 138, 40, i === 0 ? T5.dark : T5.white);
    if (i !== 0) outlinedRect(board, "aud bd " + t, bx, yy, 138, 40, T5.borderD, 1);
    label(board, "aud tx " + t, t, bx, yy + 10, 138, { size: 14, weight: "700", color: i === 0 ? T5.white : T5.body, align: "center" });
  });
  yy += 62;
  v5btn(board, MX5, yy, 220, 54, "Explore Trainings", true);
  v5btn(board, MX5 + 236, yy, 220, 54, "Talk To A Trainer", false);
  yy += 84;
  label(board, "hero trust", "★ 1,200+ certified learners   ·   ISO 9001:2015   ·   AICTE-approved internships",
    MX5, yy, 700, { size: 13, weight: "600", color: T5.sec });
  // WhatsApp demo widget mock (right)
  const px = W5 - MX5 - 340, py = y + 110;
  rect(board, "wa mock", px, py, 340, 420, T5.white);
  outlinedRect(board, "wa mock bd", px, py, 340, 420, T5.borderD, 1);
  rect(board, "wa head", px, py, 340, 56, T5.green);
  label(board, "wa head tx", "GradeSpot Assistant  ● online", px + 20, py + 18, 300, { size: 14, weight: "700", color: T5.white });
  label(board, "wa b1", "Hi! Looking for a cybersecurity course?", px + 20, py + 90, 300, { size: 14, color: T5.dark });
  rect(board, "wa b1 bg", px + 12, py + 82, 300, 40, T5.bgLight);
  label(board, "wa b2", "Yes — SOC Analyst batch timings?", px + 20, py + 150, 300, { size: 14, color: T5.dark });
  rect(board, "wa b2 bg", px + 12, py + 142, 300, 40, T5.tint);
  label(board, "wa b3", "Weekend + weekday batches, online & offline. Shall I book a free counselling call?", px + 20, py + 210, 300, { size: 14, color: T5.dark });
  rect(board, "wa b3 bg", px + 12, py + 202, 300, 64, T5.bgLight);
  label(board, "wa cap", "LIVE PRODUCT DEMO — WhatsApp Lead Automation", px, py + 444, 340,
    { size: 12, weight: "700", color: T5.orange, align: "center" });
  devTag(board, px, py + 470, "Carbon: — (custom chat widget)", 300);
  return y + h;
}

// ---------- v5 STATS ----------
function v5stats(board, y) {
  rect(board, "stats bg", 0, y, W5, 190, T5.navy);
  const n = DATA5.stats.length, cw = CW5 / n;
  DATA5.stats.forEach((s, i) => {
    label(board, "stat n" + i, s[0], MX5 + i * cw, y + 52, cw, { size: 40, weight: "800", color: T5.white, align: "center" });
    label(board, "stat l" + i, s[1], MX5 + i * cw, y + 108, cw, { size: 14, weight: "600", color: T5.footLink, align: "center" });
  });
  devTag(board, MX5, y + 152, "Carbon: Grid(16)", 200);
  return y + 190;
}

// ---------- v5 CTA band ----------
function v5cta(board, y, title, sub) {
  const h = 300;
  rect(board, "cta bg", 0, y, W5, h, T5.orange);
  label(board, "cta t", title || "Not sure where to start?", MX5, y + 70, CW5,
    { size: 36, weight: "800", color: T5.white, align: "center" });
  label(board, "cta s", sub || "Talk to a trainer — free career counselling, no spam.", MX5, y + 128, CW5,
    { size: 17, color: T5.white, align: "center" });
  v5btn(board, W5 / 2 - 110, y + 180, 220, 54, "Get a Callback", false);
  devTag(board, MX5, y + 252, "Carbon: Button", 200);
  return y + h;
}

// ---------- v5 FOOTER (desktop) ----------
function v5footer(board, y) {
  const h = 480;
  rect(board, "footer bg", 0, y, W5, h, T5.black);
  v5logo(board, MX5, y + 48, false);
  label(board, "f blurb", "Cybersecurity & IT training institute and IT solutions company in Hyderabad.", MX5, y + 116, 300, { size: 14, color: T5.footLink });
  label(board, "f badges", DATA5.badges.join(" · "), MX5, y + 176, 320, { size: 13, weight: "600", color: T5.footLink });
  const cols = [
    ["Quick Links", ["Home", "About Us", "Trainings", "Pricing", "Contact Us"]],
    ["Top Courses", ["SOC Analyst Training", "CCNA 200-301", "Cyber Security Professional", "Azure Administrator", "Digital Marketing"]],
    ["Contact", [DATA5.emails[0], DATA5.emails[1], DATA5.phones[0], DATA5.phones[1]]],
  ];
  cols.forEach((c, i) => {
    const x = 440 + i * 330;
    label(board, "f h" + i, c[0], x, y + 48, 300, { size: 16, weight: "700", color: T5.white });
    c[1].forEach((l, j) => {
      label(board, "f l" + i + j, l, x, y + 88 + j * 32, 320, { size: 14, color: T5.footLink });
    });
  });
  label(board, "f addr", DATA5.address, MX5, y + 300, 500, { size: 13, color: T5.footLink });
  label(board, "f hours", DATA5.hours, MX5, y + 344, 500, { size: 13, color: T5.footLink });
  rect(board, "f div", MX5, y + h - 72, CW5, 1, "#333333");
  label(board, "f copy", "© 2026 GradeSpot IT Solutions Pvt. Ltd.", MX5, y + h - 44, 600, { size: 13, color: T5.footLink });
  devTag(board, W5 - MX5 - 320, y + h - 52, "Carbon: Grid (custom footer)", 320);
  return y + h;
}

function v5float(board, totalH, vw) {
  vw = vw || W5;
  circle(board, "wa float", vw - 110, totalH - 110, 64, T5.green);
  label(board, "wa float tx", "WA", vw - 110, totalH - 92, 64, { size: 18, weight: "800", color: T5.white, align: "center" });
}

// ---------- v5 inner page hero ----------
function v5pageHero(board, y, title, sub, crumb) {
  const h = 340;
  rect(board, "phero bg", 0, y, W5, h, T5.navy);
  label(board, "phero crumb", crumb || "Home / ", MX5, y + 92, CW5,
    { size: 13, weight: "600", color: T5.footLink, align: "center" });
  label(board, "phero t", title, MX5, y + 122, CW5, { size: 48, weight: "800", color: T5.white, align: "center" });
  if (sub) label(board, "phero s", sub, MX5, y + 200, CW5, { size: 17, color: T5.footLink, align: "center" });
  devTag(board, MX5, y + 286, "Carbon: Breadcrumb", 240);
  return y + h;
}

// ---------- v5 course cards ----------
function v5courseCard(board, x, y, w, c) {
  const h = 300;
  rect(board, "cc bg " + c.key, x, y, w, h, T5.white);
  outlinedRect(board, "cc bd " + c.key, x, y, w, h, T5.border, 1);
  const tagBg = c.planned ? T5.bgLight : T5.tint;
  rect(board, "cc tag bg " + c.key, x + 24, y + 24, 150, 30, tagBg);
  label(board, "cc tag " + c.key, c.tag, x + 24, y + 31, 150, { size: 12, weight: "700", color: c.planned ? T5.sec : T5.orange, align: "center" });
  label(board, "cc name " + c.key, c.name, x + 24, y + 72, w - 48, { size: 20, weight: "700", color: T5.dark });
  label(board, "cc blurb " + c.key, c.blurb, x + 24, y + 130, w - 48, { size: 14, color: T5.body });
  label(board, "cc more " + c.key, "Online & Offline   →", x + 24, y + h - 52, w - 48, { size: 14, weight: "700", color: T5.orange });
  return h;
}
function v5courseGrid(board, y, list, cols) {
  cols = cols || 3;
  const gap = 32, cw = (CW5 - gap * (cols - 1)) / cols;
  let yy = y;
  yy += devTag(board, MX5, yy, "Carbon: ClickableTile (" + cols + "-col)", 300); yy += 10;
  for (let r = 0; r < Math.ceil(list.length / cols); r++) {
    let rh = 0;
    for (let i = 0; i < cols; i++) {
      const c = list[r * cols + i];
      if (!c) continue;
      const h = v5courseCard(board, MX5 + i * (cw + gap), yy, cw, c);
      rh = Math.max(rh, h);
    }
    yy += rh + gap;
  }
  return yy + 20;
}

// ---------- v5 testimonials ----------
function v5testimonials(board, y) {
  let yy = y;
  yy += devTag(board, MX5, yy, "Carbon: Tile", 200); yy += 10;
  const list = DATA5.testimonials, cols = 3, gap = 32, cw = (CW5 - gap * (cols - 1)) / cols;
  for (let r = 0; r < Math.ceil(list.length / cols); r++) {
    let rh = 0;
    for (let i = 0; i < cols; i++) {
      const t = list[r * cols + i];
      if (!t) continue;
      const x = MX5 + i * (cw + gap);
      const h = 260;
      rect(board, "tm bg " + r + i, x, yy, cw, h, T5.white);
      outlinedRect(board, "tm bd " + r + i, x, yy, cw, h, T5.border, 1);
      label(board, "tm q " + r + i, "\u201C" + t[2] + "\u201D", x + 24, yy + 24, cw - 48, { size: 14, color: T5.body });
      label(board, "tm n " + r + i, t[0], x + 24, yy + h - 72, cw - 48, { size: 15, weight: "700", color: T5.dark });
      label(board, "tm r " + r + i, t[1], x + 24, yy + h - 46, cw - 48, { size: 13, color: T5.muted });
      rh = Math.max(rh, h);
    }
    yy += rh + gap;
  }
  return yy + 20;
}

// ---------- v5 FAQ (accordion mock) ----------
function v5faq(board, y, items) {
  items = items || DATA5.faqs;
  let yy = y;
  yy += devTag(board, MX5, yy, "Carbon: Accordion", 240); yy += 10;
  const w = 900, x = (W5 - w) / 2;
  items.forEach((f, i) => {
    rect(board, "faq bg " + i, x, yy, w, 76, T5.white);
    outlinedRect(board, "faq bd " + i, x, yy, w, 76, T5.border, 1);
    label(board, "faq q " + i, f[0], x + 24, yy + 26, w - 80, { size: 16, weight: "600", color: T5.dark });
    label(board, "faq c " + i, "+", x + w - 48, yy + 24, 32, { size: 22, weight: "700", color: T5.orange, align: "center" });
    yy += 88;
  });
  return yy + 20;
}

// ---------- v5 pricing tiers ----------
function v5tiers(board, y) {
  let yy = y;
  rect(board, "draft stamp", MX5, yy, 420, 36, "#FEF3C7");
  label(board, "draft tx", "DRAFT PRICING — not final, not published", MX5 + 14, yy + 10, 400, { size: 13, weight: "700", color: "#92400E" });
  yy += 56;
  yy += devTag(board, MX5, yy, "Carbon: Tile · Button", 260); yy += 10;
  const gap = 32, cw = (CW5 - gap * 2) / 3;
  DATA5.tiers.forEach((t, i) => {
    const x = MX5 + i * (cw + gap), h = 380;
    rect(board, "tier bg " + i, x, yy, cw, h, T5.white);
    outlinedRect(board, "tier bd " + i, x, yy, cw, h, i === 1 ? T5.orange : T5.border, i === 1 ? 2 : 1);
    if (i === 1) {
      rect(board, "tier pop", x, yy - 18, 130, 36, T5.orange);
      label(board, "tier pop tx", "POPULAR", x, yy - 9, 130, { size: 12, weight: "800", color: T5.white, align: "center" });
    }
    label(board, "tier n " + i, t[0], x + 32, yy + 32, cw - 64, { size: 20, weight: "700", color: T5.dark });
    label(board, "tier p " + i, t[1], x + 32, yy + 72, cw - 64, { size: 36, weight: "800", color: T5.orange });
    label(board, "tier per " + i, t[2], x + 32, yy + 122, cw - 64, { size: 13, color: T5.muted });
    t[3].forEach((f, j) => {
      label(board, "tier f" + i + j, "✓  " + f, x + 32, yy + 168 + j * 32, cw - 64, { size: 14, color: T5.body });
    });
    v5btn(board, x + 32, yy + h - 78, cw - 64, 50, "Choose " + t[0], i === 1);
  });
  return yy + 380 + 40;
}

// ---------- v5 services / products grid ----------
function v5tileGrid(board, y, items, carbonTag) {
  let yy = y;
  yy += devTag(board, MX5, yy, "Carbon: " + carbonTag, 340); yy += 10;
  const cols = 3, gap = 32, cw = (CW5 - gap * (cols - 1)) / cols;
  for (let r = 0; r < Math.ceil(items.length / cols); r++) {
    for (let i = 0; i < cols; i++) {
      const it = items[r * cols + i];
      if (!it) continue;
      const x = MX5 + i * (cw + gap), h = 220;
      rect(board, "tg bg " + r + i, x, yy, cw, h, T5.white);
      outlinedRect(board, "tg bd " + r + i, x, yy, cw, h, T5.border, 1);
      circle(board, "tg ic " + r + i, x + 28, yy + 28, 48, T5.tint);
      label(board, "tg n " + r + i, it[0], x + 28, yy + 96, cw - 56, { size: 18, weight: "700", color: T5.dark });
      label(board, "tg d " + r + i, it[1], x + 28, yy + 128, cw - 56, { size: 14, color: T5.body });
    }
    yy += 220 + gap;
  }
  return yy + 20;
}

// ---------- v5 team cards ----------
function v5team(board, y) {
  let yy = y;
  yy += devTag(board, MX5, yy, "Carbon: Tile", 200); yy += 10;
  const cols = 3, gap = 32, cw = (CW5 - gap * (cols - 1)) / cols;
  DATA5.team.forEach((m, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const x = MX5 + c * (cw + gap), yy2 = yy + r * (300 + gap);
    rect(board, "tm m bg " + i, x, yy2, cw, 300, T5.white);
    outlinedRect(board, "tm m bd " + i, x, yy2, cw, 300, T5.border, 1);
    circle(board, "tm m av " + i, x + cw / 2 - 48, yy2 + 36, 96, T5.imgBg);
    label(board, "tm m ini " + i, m[0].split(" ").map((s) => s[0]).join("").slice(0, 2), x + cw / 2 - 48, yy2 + 62, 96,
      { size: 28, weight: "800", color: T5.muted, align: "center" });
    label(board, "tm m n " + i, m[0], x + 24, yy2 + 160, cw - 48, { size: 18, weight: "700", color: T5.dark, align: "center" });
    label(board, "tm m r " + i, m[1], x + 24, yy2 + 192, cw - 48, { size: 14, color: T5.orange, align: "center" });
    if (m[0] === "Name TBD") label(board, "tm m ph " + i, "Photo on confirmation", x + 24, yy2 + 232, cw - 48, { size: 12, color: T5.muted, align: "center" });
  });
  return yy + Math.ceil(DATA5.team.length / cols) * (300 + gap) + 20;
}

// ---------- v5 process steps ----------
function v5process(board, y, steps) {
  let yy = y;
  yy += devTag(board, MX5, yy, "Carbon: Grid(16)", 240); yy += 10;
  const n = steps.length, gap = 32, cw = (CW5 - gap * (n - 1)) / n;
  steps.forEach((s, i) => {
    const x = MX5 + i * (cw + gap);
    circle(board, "ps n bg " + i, x, yy, 56, T5.orange);
    label(board, "ps n " + i, String(i + 1), x, yy + 14, 56, { size: 22, weight: "800", color: T5.white, align: "center" });
    label(board, "ps t " + i, s[0], x, yy + 76, cw, { size: 17, weight: "700", color: T5.dark });
    label(board, "ps d " + i, s[1], x, yy + 104, cw, { size: 14, color: T5.body });
  });
  return yy + 220;
}

// ---------- v5 verify box ----------
function v5verifyBox(board, y) {
  let yy = y;
  yy += devTag(board, MX5, yy, "Carbon: TextInput · Button · Tile", 360); yy += 10;
  const w = 760, x = (W5 - w) / 2;
  rect(board, "vf input", x, yy, w - 200, 60, T5.white);
  outlinedRect(board, "vf input bd", x, yy, w - 200, 60, T5.borderD, 1);
  label(board, "vf ph", "Enter certificate ID — try GS-2026-0042", x + 20, yy + 19, w - 240, { size: 15, color: T5.muted });
  v5btn(board, x + w - 180, yy, 180, 60, "Verify", true);
  yy += 100;
  rect(board, "vf res", x, yy, w, 190, T5.white);
  outlinedRect(board, "vf res bd", x, yy, w, 190, T5.green, 2);
  label(board, "vf ok", "✓  VALID CERTIFICATE (sample result)", x + 32, yy + 28, w - 64, { size: 16, weight: "700", color: T5.green });
  label(board, "vf dt", "Certificate ID: GS-2026-0042   ·   Course: SOC Analyst Training   ·   Issued: [date on confirmation]", x + 32, yy + 68, w - 64, { size: 14, color: T5.body });
  label(board, "vf note", "Result layout only — live lookup connects to the verification API route in production.", x + 32, yy + 128, w - 64, { size: 13, color: T5.muted });
  return yy + 190 + 30;
}

// ---------- v5 contact columns ----------
function v5contactCols(board, y) {
  let yy = y;
  yy += devTag(board, MX5, yy, "Carbon: TextInput · TextArea · Select · Button", 420); yy += 10;
  const lw = 560, rw = CW5 - lw - 64;
  label(board, "ct h", "Send an enquiry", MX5, yy, lw, { size: 24, weight: "700", color: T5.dark });
  const fields = ["Full name", "Phone (10-digit)", "Email", "I'm interested in ▾", "Message"];
  fields.forEach((f, i) => {
    const fh = f === "Message" ? 130 : 58;
    rect(board, "ct f" + i, MX5, yy + 56 + i * (i < 4 ? 78 : 78), lw, fh, T5.white);
    outlinedRect(board, "ct fb" + i, MX5, yy + 56 + i * 78, lw, fh, T5.borderD, 1);
    label(board, "ct fl" + i, f, MX5 + 18, yy + 56 + i * 78 + (fh === 58 ? 18 : 14), lw - 36, { size: 14, color: T5.muted });
  });
  yy += 56 + 4 * 78 + 130 + 24;
  v5btn(board, MX5, yy, 240, 54, "Send Enquiry", true);
  label(board, "ct note", "Submits to the Next.js API route → CRM + WhatsApp. Honeypot + 10-digit validation.", MX5, yy + 70, lw, { size: 13, color: T5.muted });
  const rx = MX5 + lw + 64;
  label(board, "ct ih", "Reach us directly", rx, y + 44, rw, { size: 24, weight: "700", color: T5.dark });
  const info = ["Call: " + DATA5.phones.join(" · "), "Mail: " + DATA5.emails.join(" · "), DATA5.address, DATA5.hours];
  info.forEach((t, i) => {
    label(board, "ct i" + i, t, rx, y + 100 + i * 56, rw, { size: 15, color: T5.body });
  });
  label(board, "ct map", "MAP EMBED", rx, y + 340, rw, { size: 13, weight: "700", color: T5.muted, align: "center" });
  rect(board, "ct map bg", rx, y + 320, rw, 220, T5.imgBg);
  return Math.max(yy + 110, y + 570);
}

// ==================== v5 desktop page drawers ====================
async function d5Home(board) {
  const featured = DATA5.courses.slice(0, 6);
  return runSteps(board, "Home", [
    (b, y) => v5nav(b, y, "Home"),
    (b, y) => v5hero(b, y),
    (b, y) => v5stats(b, y),
    (b, y) => v5secHead(b, y, "Trainings", "Job-ready courses, taught by practitioners", "Security, cloud, networking and marketing — online & offline.", "ClickableTile (3-col)", W5, MX5),
    (b, y) => v5courseGrid(b, y, featured, 3),
    (b, y) => v5secHead(b, y, "Why GradeSpot", "Training that treats you like a future colleague", "", "Tile (4-col)", W5, MX5),
    (b, y) => v5tileGrid(b, y, [
      ["Working trainers", "Learn from security engineers doing the job today."],
      ["Hands-on labs", "Real tools, real scenarios — not just slides."],
      ["Placement assistance", "Resume, mock interviews and hiring connects."],
      ["Online & offline", "Classroom in Dilsukhnagar + live online batches."],
    ], "Tile (4-col)"),
    (b, y) => v5secHead(b, y, "Testimonials", "Learners who got hired", "", "Tile", W5, MX5),
    (b, y) => v5testimonials(b, y),
    (b, y) => v5secHead(b, y, "FAQ", "Common questions", "", "Accordion", W5, MX5),
    (b, y) => v5faq(b, y),
    (b, y) => v5cta(b, y),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5About(board) {
  return runSteps(board, "About", [
    (b, y) => v5nav(b, y, "About"),
    (b, y) => v5pageHero(b, y, "About GradeSpot", "A cybersecurity & IT training institute — and an IT solutions company — in Hyderabad.", "Home / About"),
    (b, y) => {
      let yy = y + 70;
      yy += devTag(b, MX5, yy, "Carbon: Grid(16)", 240); yy += 16;
      label(b, "ab t", "Two businesses, one promise: practical skills.", MX5, yy, 600, { size: 32, weight: "700", color: T5.dark });
      label(b, "ab p", "GradeSpot IT Solutions runs job-focused training programs and delivers IT services — cybersecurity, web development, digital marketing and network infrastructure — to businesses. Our trainers are working engineers, and our classrooms run the same tools the industry uses.", MX5, yy + 110, 600, { size: 16, color: T5.body });
      label(b, "ab badges", "✓ " + DATA5.badges.join("     ✓ "), MX5, yy + 250, 600, { size: 14, weight: "700", color: T5.orange });
      rect(b, "ab img", MX5 + 700, yy, 580, 340, T5.imgBg);
      label(b, "ab img tx", "CAMPUS / CLASSROOM PHOTO", MX5 + 700, yy + 160, 580, { size: 13, weight: "700", color: T5.muted, align: "center" });
      return yy + 400;
    },
    (b, y) => v5stats(b, y),
    (b, y) => v5secHead(b, y, "Leadership", "Meet the team", "", "Tile", W5, MX5),
    (b, y) => v5team(b, y),
    (b, y) => v5cta(b, y, "Visit us in Dilsukhnagar", DATA5.address),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5Trainings(board) {
  return runSteps(board, "Trainings", [
    (b, y) => v5nav(b, y, "Trainings"),
    (b, y) => v5pageHero(b, y, "Trainings", "11 programs across security, cloud, networking, marketing and development.", "Home / Trainings"),
    (b, y) => {
      let yy = y + 50;
      yy += devTag(b, MX5, yy, "Carbon: Tabs (category filter)", 340); yy += 14;
      let xx = MX5;
      ["All", "Security", "Cloud", "Networking", "Marketing", "Development"].forEach((f, i) => {
        rect(b, "flt " + i, xx, yy, 130, 42, i === 0 ? T5.dark : T5.white);
        if (i !== 0) outlinedRect(b, "flt bd " + i, xx, yy, 130, 42, T5.borderD, 1);
        label(b, "flt tx " + i, f, xx, yy + 11, 130, { size: 14, weight: "700", color: i === 0 ? T5.white : T5.body, align: "center" });
        xx += 142;
      });
      return yy + 90;
    },
    (b, y) => v5courseGrid(b, y, DATA5.courses, 3),
    (b, y) => v5secHead(b, y, "FAQ", "Training questions", "", "Accordion", W5, MX5),
    (b, y) => v5faq(b, y),
    (b, y) => v5cta(b, y),
    (b, y) => v5footer(b, y),
  ]);
}

function d5CourseDetail(key) {
  const c = DATA5.courses.find((x) => x.key === key);
  return async function (board) {
    const soc = key === "soc-analyst";
    return runSteps(board, c.name, [
      (b, y) => v5nav(b, y, "Trainings"),
      (b, y) => v5pageHero(b, y, c.name, c.blurb, "Home / Trainings / " + c.name),
      (b, y) => {
        let yy = y + 50;
        yy += devTag(b, MX5, yy, "Carbon: Tag · Grid(16)", 280); yy += 14;
        let xx = MX5;
        const chips = soc ? ["90-day program", "Online & Offline", "Free EC-Council C|SA voucher"] : ["Online & Offline", c.planned ? "Launching soon" : "Admissions open"];
        chips.forEach((t) => {
          const w = 22 + t.length * 8;
          rect(b, "meta " + t, xx, yy, w, 38, T5.tint);
          label(b, "meta tx " + t, t, xx, yy + 10, w, { size: 13, weight: "700", color: T5.orange, align: "center" });
          xx += w + 14;
        });
        yy += 80;
        label(b, "ov h", "Course overview", MX5, yy, 800, { size: 28, weight: "700", color: T5.dark });
        label(b, "ov p", soc
          ? "Master threat detection, incident response and SIEM operations over 90 days. You will work with Splunk, IBM QRadar and Microsoft Sentinel on real attack scenarios, log analysis and threat intelligence — and prepare for certifications like Security+, CySA+, CEH, SC-200 and the EC-Council C|SA (exam voucher included free)."
          : c.blurb + " Full curriculum, batch dates and fees are shared on enquiry — talk to a trainer for the latest schedule.",
          MX5, yy + 48, 800, { size: 16, color: T5.body });
        const bx = MX5 + 880, bw = CW5 - 880;
        rect(b, "ov side", bx, yy, bw, 300, T5.bgLight);
        label(b, "ov side h", "Get the full syllabus", bx + 32, yy + 36, bw - 64, { size: 18, weight: "700", color: T5.dark });
        label(b, "ov side p", "Download the detailed curriculum PDF with module-wise topics, lab list and batch calendar.", bx + 32, yy + 76, bw - 64, { size: 14, color: T5.body });
        v5btn(b, bx + 32, yy + 170, bw - 64, 52, "Download Syllabus", true);
        devTag(b, bx + 32, yy + 244, "Carbon: Button", 200);
        return yy + 380;
      },
      (b, y) => {
        let yy = v5secHead(b, y, "Curriculum", soc ? "What you will master" : "Program structure", "", "Accordion", W5, MX5);
        const mods = soc
          ? ["Computer networking & Linux foundations", "Vulnerability assessment with Nessus & OpenVAS", "Malware analysis & forensics", "SIEM deep-dive: Splunk, IBM QRadar, Microsoft Sentinel", "Threat intelligence & MITRE ATT&CK", "Incident response playbooks & SOC workflows", "Certification prep: Security+, CySA+, CEH, SC-200, C|SA"]
          : ["Module 1 — Foundations", "Module 2 — Core concepts & tools", "Module 3 — Hands-on labs & projects", "Module 4 — Certification preparation", "Module 5 — Career guidance & interviews", "Full module-wise curriculum shared on enquiry"];
        const w = 900, x = (W5 - w) / 2;
        mods.forEach((m, i) => {
          rect(b, "mod " + i, x, yy, w, 64, T5.white);
          outlinedRect(b, "mod bd " + i, x, yy, w, 64, T5.border, 1);
          label(b, "mod tx " + i, m, x + 24, yy + 21, w - 80, { size: 15, weight: "600", color: T5.dark });
          label(b, "mod c " + i, "+", x + w - 48, yy + 18, 32, { size: 20, weight: "700", color: T5.orange, align: "center" });
          yy += 76;
        });
        return yy + 40;
      },
      (b, y) => v5secHead(b, y, "Related", "Keep exploring", "", "ClickableTile", W5, MX5),
      (b, y) => v5courseGrid(b, y, DATA5.courses.filter((x) => x.key !== key).slice(0, 3), 3),
      (b, y) => v5cta(b, y, "Talk to a trainer about " + c.name, "Free counselling · batch dates · fees."),
      (b, y) => v5footer(b, y),
    ]);
  };
}

async function d5Services(board) {
  return runSteps(board, "Services", [
    (b, y) => v5nav(b, y, "For Businesses"),
    (b, y) => v5pageHero(b, y, "IT Services for Businesses", "Cybersecurity, web, marketing and infrastructure — delivered by the same engineers who train.", "Home / Services"),
    (b, y) => v5secHead(b, y, "Services", "What we do for businesses", "", "Tile (3-col)", W5, MX5),
    (b, y) => v5tileGrid(b, y, DATA5.services, "Tile (3-col)"),
    (b, y) => v5secHead(b, y, "Process", "How engagements run", "", "Grid(16)", W5, MX5),
    (b, y) => v5process(b, y, [
      ["Discover", "We map your goals, systems and constraints."],
      ["Design", "You approve a scoped plan with timelines."],
      ["Build", "Our engineers deliver in weekly milestones."],
      ["Support", "Handover, docs and ongoing support."],
    ]),
    (b, y) => v5cta(b, y, "Start a project", "Tell us about your requirement — we reply within one business day."),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5Institutes(board) {
  return runSteps(board, "For Institutes", [
    (b, y) => v5nav(b, y, "For Institutes"),
    (b, y) => v5pageHero(b, y, "Automation for Training Institutes", "GradeSpot runs on Axon — our own institute-automation stack. Now packaged for institutes like yours.", "Home / For Institutes"),
    (b, y) => v5secHead(b, y, "Products", "Three products, one stack", "This website is the live demo — every product below powers GradeSpot itself.", "Tile (3-col)", W5, MX5),
    (b, y) => v5tileGrid(b, y, DATA5.products, "Tile (3-col)"),
    (b, y) => v5secHead(b, y, "Pricing", "Simple, one-time setup", "Recurring plans on confirmation. Below: draft proposal.", "Tile · Button", W5, MX5),
    (b, y) => v5tiers(b, y),
    (b, y) => v5secHead(b, y, "Pilot", "Live in 4 steps", "", "Grid(16)", W5, MX5),
    (b, y) => v5process(b, y, [
      ["Demo", "See it running on GradeSpot's own enquiries."],
      ["Setup", "We configure it for your courses & batches."],
      ["Pilot", "Run it on real enquiries for 2 weeks."],
      ["Scale", "Add LMS and lab setup when ready."],
    ]),
    (b, y) => v5cta(b, y, "Book a live demo", "We will run your own enquiry flow live on the call."),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5Pricing(board) {
  return runSteps(board, "Pricing", [
    (b, y) => v5nav(b, y, "Pricing"),
    (b, y) => v5pageHero(b, y, "Pricing", "Course fees on confirmation. Institute automation below is a draft proposal.", "Home / Pricing"),
    (b, y) => v5secHead(b, y, "Institute automation", "One-time setup · draft", "", "Tile · Button", W5, MX5),
    (b, y) => v5tiers(b, y),
    (b, y) => v5secHead(b, y, "FAQ", "Pricing questions", "", "Accordion", W5, MX5),
    (b, y) => v5faq(b, y, [
      ["Are course fees fixed?", "Fees vary by program and batch mode. Talk to a trainer for the current fee."],
      ["Is the institute pricing final?", "No — the tiers above are a draft proposal shared for feedback."],
      ["Do you offer instalments?", "Payment plans are discussed during counselling."],
    ]),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5Why(board) {
  return runSteps(board, "Why Choose Us", [
    (b, y) => v5nav(b, y, "About"),
    (b, y) => v5pageHero(b, y, "Why GradeSpot", "Six reasons learners pick us — all verifiable.", "Home / Why Choose Us"),
    (b, y) => v5tileGrid(b, y, [
      ["1,200+ certified learners", "Learners coached through certifications like AZ-104, CCNA and AWS."],
      ["Working trainers", "Security engineers teaching what they practice daily."],
      ["Hands-on labs", "Real tools — Splunk, QRadar, Sentinel — on real scenarios."],
      ["Online & offline", "Dilsukhnagar classrooms plus live online batches."],
      ["ISO 9001:2015", "Certified quality management across training delivery."],
      ["AICTE-approved internships", "Recognized internship programs for students."],
    ], "Tile (3-col)"),
    (b, y) => v5stats(b, y),
    (b, y) => v5cta(b, y),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5Testimonials(board) {
  return runSteps(board, "Testimonials", [
    (b, y) => v5nav(b, y, "About"),
    (b, y) => v5pageHero(b, y, "Learner Stories", "Real learners, real outcomes — quoted from our site.", "Home / Testimonials"),
    (b, y) => v5testimonials(b, y),
    (b, y) => v5cta(b, y, "Become our next story", "Talk to a trainer about your goals."),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5Certs(board) {
  const certs = ["EC-Council C|SA (free voucher with SOC)", "CEH", "CompTIA Security+", "CompTIA CySA+", "CompTIA Pentest+", "CompTIA Network+", "Microsoft SC-200", "Microsoft SC-900", "AZ-104", "AZ-900", "AWS Solutions Architect", "CCNA 200-301"];
  return runSteps(board, "Certifications", [
    (b, y) => v5nav(b, y, "About"),
    (b, y) => v5pageHero(b, y, "Student Certifications", "Industry certifications our training prepares you for.", "Home / Student Certifications"),
    (b, y) => {
      let yy = y + 60;
      yy += devTag(b, MX5, yy, "Carbon: Tag", 220); yy += 14;
      let xx = MX5, rowY = yy;
      certs.forEach((c) => {
        const w = 24 + c.length * 8.5;
        if (xx + w > W5 - MX5) { xx = MX5; rowY += 56; }
        rect(b, "cert " + c, xx, rowY, w, 42, T5.tint);
        label(b, "cert tx " + c, c, xx, rowY + 11, w, { size: 13, weight: "700", color: T5.orange, align: "center" });
        xx += w + 14;
      });
      return rowY + 110;
    },
    (b, y) => v5cta(b, y, "Earned a certificate with us?", "Verify it instantly on the Certificate Verification page."),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5Verify(board) {
  return runSteps(board, "Verify", [
    (b, y) => v5nav(b, y, "About"),
    (b, y) => v5pageHero(b, y, "Certificate Verification", "Employers and learners can verify any GradeSpot certificate here.", "Home / Certificate Verification"),
    (b, y) => v5verifyBox(b, y),
    (b, y) => v5secHead(b, y, "How it works", "", "", "Grid(16)", W5, MX5),
    (b, y) => v5process(b, y, [
      ["Enter ID", "Type the certificate ID from the certificate."],
      ["Verify", "We check it against our learner records."],
      ["Result", "Instant valid/invalid result with course details."],
    ]),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5Team(board) {
  return runSteps(board, "Team", [
    (b, y) => v5nav(b, y, "About"),
    (b, y) => v5pageHero(b, y, "Meet the Team", "Founders and senior security engineers.", "Home / Team Members"),
    (b, y) => v5team(b, y),
    (b, y) => v5cta(b, y, "Want to learn from this team?", "Talk to a trainer today."),
    (b, y) => v5footer(b, y),
  ]);
}

async function d5Contact(board) {
  return runSteps(board, "Contact", [
    (b, y) => v5nav(b, y, "Contact"),
    (b, y) => v5pageHero(b, y, "Contact Us", "Call, mail or drop by — we reply within one business day.", "Home / Contact"),
    (b, y) => v5contactCols(b, y),
    (b, y) => v5footer(b, y),
  ]);
}

// ==================== v5 system boards ====================
async function d5Tokens(board) {
  return runSteps(board, "Design Tokens", [
    (b, y) => {
      let yy = y + 60;
      label(b, "tk h", "GradeSpot design tokens — exported from gsitssolutions.com (2026-10-03)", MX5, yy, CW5, { size: 28, weight: "800", color: T5.dark });
      yy += 70;
      const sw = [["Brand orange", T5.orange, "#F7631B"], ["Orange light", T5.orangeLight, "#F98238"], ["Heading navy", T5.navy, "#0E2B3D"],
        ["Body text", T5.body, "#666666"], ["Muted", T5.muted, "#7A7A7A"], ["Section bg", T5.bgLight, "#F3F7FD"],
        ["Tint", T5.tint, "#EDF5FF"], ["Border", T5.border, "#E7E7E7"], ["Footer black", T5.black, "#000000"],
        ["White", T5.white, "#FFFFFF"], ["Success green", T5.green, "#059669"], ["Footer link", T5.footLink, "#9CA3AF"]];
      const cols = 4, gap = 32, cw = (CW5 - gap * (cols - 1)) / cols;
      sw.forEach((s, i) => {
        const r = Math.floor(i / cols), c = i % cols, x = MX5 + c * (cw + gap), yy2 = yy + r * 120;
        rect(b, "sw " + i, x, yy2, cw, 64, s[1]);
        outlinedRect(b, "sw bd " + i, x, yy2, cw, 64, T5.borderD, 1);
        label(b, "sw n " + i, s[0], x, yy2 + 74, cw, { size: 14, weight: "700", color: T5.dark });
        label(b, "sw v " + i, s[2], x, yy2 + 96, cw, { size: 13, color: T5.muted });
      });
      return yy + Math.ceil(sw.length / cols) * 120 + 40;
    },
    (b, y) => {
      let yy = y + 20;
      label(b, "ty h", "Type scale — Inter", MX5, yy, CW5, { size: 24, weight: "700", color: T5.dark }); yy += 60;
      [["Hero 80/800", 80, "800"], ["H1 56/800", 56, "800"], ["Section H2 40/700", 40, "700"], ["H4 20/700", 20, "700"], ["Body 17/400", 17, "400"], ["Small 13/600", 13, "600"]].forEach((t, i) => {
        label(b, "ty " + i, t[0].split(" ")[0] + " — The quick brown fox", MX5, yy, CW5, { size: t[1], weight: t[2], color: T5.dark });
        yy += t[1] + 26;
      });
      return yy + 20;
    },
    (b, y) => {
      let yy = y + 20;
      label(b, "sp h", "Radius · shadow · spacing", MX5, yy, CW5, { size: 24, weight: "700", color: T5.dark }); yy += 60;
      label(b, "sp r", "Radius: 5px buttons/cards · 8px feature cards · 30/40px pills · 50% avatars", MX5, yy, CW5, { size: 15, color: T5.body }); yy += 40;
      label(b, "sp s", "Shadows: header 0 8px 25px rgba(0,0,0,.04) · cards 0 5px 30px rgba(214,215,216,.57)", MX5, yy, CW5, { size: 15, color: T5.body }); yy += 40;
      label(b, "sp p", "Section rhythm: 120px top/bottom desktop · 50px mobile · container 1140px (1400 wide)", MX5, yy, CW5, { size: 15, color: T5.body });
      return yy + 80;
    },
  ]);
}

async function d5DevMap(board) {
  function table(b, y, title, rows) {
    let yy = y + 20;
    label(b, "dm h " + title, title, MX5, yy, CW5, { size: 24, weight: "700", color: T5.dark }); yy += 56;
    rows.forEach((r, i) => {
      rect(b, "dm r" + title + i, MX5, yy, CW5, 52, i % 2 ? T5.white : T5.bgLight);
      label(b, "dm c1 " + title + i, r[0], MX5 + 24, yy + 16, 420, { size: 14, weight: "700", color: T5.dark });
      label(b, "dm c2 " + title + i, r[1], MX5 + 460, yy + 16, CW5 - 484, { size: 14, color: T5.body });
      yy += 52;
    });
    return yy + 40;
  }
  return runSteps(board, "Dev Map", [
    (b, y) => table(b, y, "Next.js App Router — route → file", [
      ["/", "app/page.tsx"], ["/about", "app/about/page.tsx"], ["/trainings", "app/trainings/page.tsx"],
      ["/trainings/[slug]", "app/trainings/[slug]/page.tsx  (11 courses, MDX content)"],
      ["/services", "app/services/page.tsx"], ["/for-institutes", "app/for-institutes/page.tsx"],
      ["/pricing", "app/pricing/page.tsx"], ["/team", "app/team/page.tsx"],
      ["/why-choose-us", "app/why-choose-us/page.tsx"], ["/testimonials", "app/testimonials/page.tsx"],
      ["/certifications", "app/certifications/page.tsx"], ["/verify", "app/verify/page.tsx"],
      ["/contact", "app/contact/page.tsx"], ["API: verify", "app/api/verify/route.ts"],
      ["API: lead", "app/api/lead/route.ts → CRM + WhatsApp"],
    ]),
    (b, y) => table(b, y, "Section → Carbon component", [
      ["Site header/nav", "UI Shell: Header (custom marketing nav)"],
      ["Hero / grids", "Grid + Column (16-col) · Button (primary/secondary)"],
      ["Audience switch", "Tabs"], ["Course/service cards", "ClickableTile"],
      ["Testimonials", "Tile"], ["FAQ", "Accordion / AccordionItem"],
      ["Forms", "TextInput · TextArea · Select · Button"], ["Fee/batch tables", "DataTable"],
      ["Breadcrumbs", "Breadcrumb"], ["Callback popup", "Modal"],
      ["Filter chips", "Tag (filter variant)"], ["Footer", "Custom (Grid)"],
    ]),
    (b, y) => table(b, y, "Responsive — Carbon breakpoints", [
      ["Mobile board", "390px  →  Carbon sm (320–671, 4 cols): bottom tab bar, stacked"],
      ["Desktop board", "1440px  →  Carbon lg+ (1056+, 16 cols): full navbar"],
      ["Carbon md", "672–1055 (8 cols): tablet — nav collapses ≤1023"],
      ["Carbon xlg/max", "1312 / 1584: wide container 1400px"],
    ]),
    (b, y) => table(b, y, "Theme & data notes", [
      ["Theme", "Custom Carbon theme: keep Carbon spacing/type scale; GradeSpot tokens override brand/interactive in custom-theme.scss; Inter via next/font."],
      ["SEO/AEO", "generateMetadata per route; JSON-LD: Course, FAQPage, BreadcrumbList, Organization; shallow URLs; llms.txt optional."],
      ["Course content", "MDX per slug under content/courses/; SOC page carries the full verified curriculum."],
      ["Images", "next/image; hero art + campus photos replace grey placeholders."],
    ]),
  ]);
}

// ==================== v5 mobile kit (390) ====================
function m5nav(board, y, active) {
  rect(board, "mnav bg", 0, y, MW5, 64, T5.white);
  rect(board, "mnav bd", 0, y + 63, MW5, 1, T5.border);
  v5logo(board, MMX5, y + 12, true);
  circle(board, "mnav call", MW5 - MMX5 - 44, y + 10, 44, T5.orange);
  label(board, "mnav call tx", "☎", MW5 - MMX5 - 44, y + 18, 44, { size: 18, color: T5.white, align: "center" });
  return y + 64;
}
function m5tabbar(board, totalH, active) {
  const tabs = ["Home", "Courses", "Institutes", "Pricing", "Callback"];
  const h = 76, y = totalH - h;
  rect(board, "mtab bg", 0, y, MW5, h, T5.white);
  rect(board, "mtab bd", 0, y, MW5, 1, T5.borderD);
  tabs.forEach((t, i) => {
    const w = MW5 / tabs.length, on = t === active;
    label(board, "mtab " + t, t, i * w, y + 28, w, { size: 12, weight: on ? "800" : "600", color: on ? T5.orange : T5.muted, align: "center" });
    if (on) rect(board, "mtab on " + t, i * w + w / 2 - 14, y + 6, 28, 3, T5.orange);
  });
}
function m5secHead(board, y, eyebrow, title) {
  let yy = y + 8;
  label(board, "msec eb", eyebrow.toUpperCase(), MMX5, yy, MCW5, { size: 12, weight: "700", color: T5.orange, align: "center" });
  yy += 26;
  label(board, "msec t", title, MMX5, yy, MCW5, { size: 28, weight: "700", color: T5.dark, align: "center" });
  return yy + 52;
}
function m5hero(board, y) {
  let yy = y + 40;
  label(board, "mh eb", "ONLINE & OFFLINE · HYDERABAD", MMX5, yy, MCW5, { size: 12, weight: "700", color: T5.orange, align: "center" });
  yy += 30;
  label(board, "mh h1", "Launch your cybersecurity career", MMX5, yy, MCW5, { size: 36, weight: "800", color: T5.dark, align: "center" });
  yy += 110;
  label(board, "mh sub", "Hands-on SOC, ethical hacking, cloud & networking — taught by working security engineers.", MMX5, yy, MCW5, { size: 15, color: T5.body, align: "center" });
  yy += 92;
  ["Students", "Businesses", "Institutes"].forEach((t, i) => {
    rect(board, "mh aud " + t, MMX5, yy + i * 52, MCW5, 44, i === 0 ? T5.dark : T5.white);
    if (i !== 0) outlinedRect(board, "mh aud bd " + t, MMX5, yy + i * 52, MCW5, 44, T5.borderD, 1);
    label(board, "mh aud tx " + t, t, MMX5, yy + i * 52 + 12, MCW5, { size: 15, weight: "700", color: i === 0 ? T5.white : T5.body, align: "center" });
  });
  yy += 3 * 52 + 16;
  v5btn(board, MMX5, yy, MCW5, 54, "Explore Trainings", true); yy += 66;
  v5btn(board, MMX5, yy, MCW5, 54, "Talk To A Trainer", false); yy += 80;
  label(board, "mh trust", "★ 1,200+ certified · ISO 9001:2015 · AICTE approved", MMX5, yy, MCW5, { size: 12, weight: "600", color: T5.sec, align: "center" });
  return yy + 44;
}
function m5courseList(board, y, list) {
  let yy = y;
  list.forEach((c) => {
    const h = v5courseCard(board, MMX5, yy, MCW5, c);
    yy += h + 20;
  });
  return yy;
}
function m5footer(board, y) {
  let yy = y;
  rect(board, "mf bg", 0, yy, MW5, 560, T5.black);
  v5logo(board, MMX5, yy + 32, false); yy += 100;
  ["Quick Links", "Top Courses", "Contact"].forEach((h, i) => {
    label(board, "mf h" + i, h, MMX5, yy, MCW5, { size: 15, weight: "700", color: T5.white });
    yy += 34;
    const links = i === 0 ? ["Home", "Trainings", "Pricing", "Contact"] : i === 1 ? ["SOC Analyst", "CCNA 200-301", "Cyber Security Professional"] : [DATA5.phones[0], DATA5.emails[0]];
    links.forEach((l) => { label(board, "mf l" + i + l, l, MMX5, yy, MCW5, { size: 14, color: T5.footLink }); yy += 30; });
    yy += 12;
  });
  label(board, "mf copy", "© 2026 GradeSpot IT Solutions Pvt. Ltd.", MMX5, yy + 8, MCW5, { size: 12, color: T5.footLink, align: "center" });
  return y + 560;
}
function m5cta(board, y) {
  rect(board, "mcta bg", 0, y, MW5, 260, T5.orange);
  label(board, "mcta t", "Not sure where to start?", MMX5, y + 48, MCW5, { size: 26, weight: "800", color: T5.white, align: "center" });
  v5btn(board, MMX5 + 40, y + 120, MCW5 - 80, 54, "Get a Callback", false);
  return y + 260;
}
function m5tiers(board, y) {
  let yy = y + 10;
  rect(board, "m draft", MMX5, yy, MCW5, 36, "#FEF3C7");
  label(board, "m draft tx", "DRAFT PRICING — not final", MMX5, yy + 10, MCW5, { size: 12, weight: "700", color: "#92400E", align: "center" });
  yy += 52;
  DATA5.tiers.forEach((t, i) => {
    rect(board, "m tier " + i, MMX5, yy, MCW5, 300, T5.white);
    outlinedRect(board, "m tier bd " + i, MMX5, yy, MCW5, 300, i === 1 ? T5.orange : T5.border, i === 1 ? 2 : 1);
    label(board, "m tier n " + i, t[0], MMX5 + 24, yy + 24, MCW5 - 48, { size: 18, weight: "700", color: T5.dark });
    label(board, "m tier p " + i, t[1] + "  " + t[2], MMX5 + 24, yy + 56, MCW5 - 48, { size: 24, weight: "800", color: T5.orange });
    t[3].forEach((f, j) => label(board, "m tier f" + i + j, "✓  " + f, MMX5 + 24, yy + 104 + j * 30, MCW5 - 48, { size: 14, color: T5.body }));
    v5btn(board, MMX5 + 24, yy + 224, MCW5 - 48, 50, "Choose " + t[0], i === 1);
    yy += 320;
  });
  return yy;
}

async function m5Home(board) {
  return runSteps(board, "Home mobile", [
    (b, y) => m5nav(b, y, "Home"),
    (b, y) => m5hero(b, y),
    (b, y) => m5secHead(b, y, "Trainings", "Job-ready courses"),
    (b, y) => m5courseList(b, y, DATA5.courses.slice(0, 4)),
    (b, y) => m5cta(b, y),
    (b, y) => m5footer(b, y),
  ]);
}
async function m5Trainings(board) {
  return runSteps(board, "Trainings mobile", [
    (b, y) => m5nav(b, y, "Trainings"),
    (b, y) => m5secHead(b, y, "Trainings", "All programs"),
    (b, y) => m5courseList(b, y, DATA5.courses),
    (b, y) => m5cta(b, y),
    (b, y) => m5footer(b, y),
  ]);
}
async function m5Course(board) {
  const c = DATA5.courses[0];
  return runSteps(board, "Course mobile", [
    (b, y) => m5nav(b, y, "Trainings"),
    (b, y) => {
      let yy = y + 30;
      label(board, "mc crumb", "Home / Trainings", MMX5, yy, MCW5, { size: 12, weight: "600", color: T5.muted }); yy += 30;
      label(board, "mc t", c.name, MMX5, yy, MCW5, { size: 32, weight: "800", color: T5.dark }); yy += 100;
      label(board, "mc d", c.blurb, MMX5, yy, MCW5, { size: 15, color: T5.body }); yy += 120;
      v5btn(board, MMX5, yy, MCW5, 54, "Download Syllabus", true); yy += 70;
      v5btn(board, MMX5, yy, MCW5, 54, "Talk To A Trainer", false); yy += 84;
      return yy;
    },
    (b, y) => m5secHead(b, y, "Curriculum", "What you will master"),
    (b, y) => {
      let yy = y;
      ["Networking & Linux", "Vulnerability assessment", "Malware analysis", "SIEM: Splunk/QRadar/Sentinel", "Threat intel & ATT&CK", "Incident response", "Certification prep"].forEach((m, i) => {
        rect(b, "mm " + i, MMX5, yy, MCW5, 56, T5.white);
        outlinedRect(b, "mm bd " + i, MMX5, yy, MCW5, 56, T5.border, 1);
        label(b, "mm tx " + i, m, MMX5 + 16, yy + 18, MCW5 - 60, { size: 14, weight: "600", color: T5.dark });
        yy += 66;
      });
      return yy + 10;
    },
    (b, y) => m5cta(b, y),
    (b, y) => m5footer(b, y),
  ]);
}
async function m5Institutes(board) {
  return runSteps(board, "Institutes mobile", [
    (b, y) => m5nav(b, y, "For Institutes"),
    (b, y) => m5secHead(b, y, "For Institutes", "Automation that runs GradeSpot"),
    (b, y) => {
      let yy = y;
      DATA5.products.forEach((p, i) => {
        rect(b, "mp " + i, MMX5, yy, MCW5, 150, T5.white);
        outlinedRect(b, "mp bd " + i, MMX5, yy, MCW5, 150, T5.border, 1);
        label(b, "mp n " + i, p[0], MMX5 + 20, yy + 24, MCW5 - 40, { size: 17, weight: "700", color: T5.dark });
        label(b, "mp d " + i, p[1], MMX5 + 20, yy + 56, MCW5 - 40, { size: 14, color: T5.body });
        yy += 170;
      });
      return yy;
    },
    (b, y) => m5secHead(b, y, "Pricing", "One-time setup · draft"),
    (b, y) => m5tiers(b, y),
    (b, y) => m5cta(b, y),
    (b, y) => m5footer(b, y),
  ]);
}
async function m5Pricing(board) {
  return runSteps(board, "Pricing mobile", [
    (b, y) => m5nav(b, y, "Pricing"),
    (b, y) => m5secHead(b, y, "Pricing", "Institute automation"),
    (b, y) => m5tiers(b, y),
    (b, y) => m5footer(b, y),
  ]);
}
async function m5Contact(board) {
  return runSteps(board, "Contact mobile", [
    (b, y) => m5nav(b, y, "Contact"),
    (b, y) => m5secHead(b, y, "Contact", "Talk to us"),
    (b, y) => {
      let yy = y;
      ["Full name", "Phone (10-digit)", "Email", "Message"].forEach((f, i) => {
        const fh = f === "Message" ? 110 : 56;
        rect(b, "mf2 " + i, MMX5, yy, MCW5, fh, T5.white);
        outlinedRect(b, "mf2 bd " + i, MMX5, yy, MCW5, fh, T5.borderD, 1);
        label(b, "mf2 tx " + i, f, MMX5 + 16, yy + 17, MCW5 - 32, { size: 14, color: T5.muted });
        yy += fh + 16;
      });
      v5btn(b, MMX5, yy, MCW5, 54, "Send Enquiry", true); yy += 80;
      label(b, "mc info", DATA5.phones.join(" · ") + "\n" + DATA5.emails[0] + "\n" + DATA5.hours, MMX5, yy, MCW5, { size: 14, color: T5.body, align: "center" });
      return yy + 110;
    },
    (b, y) => m5footer(b, y),
  ]);
}

// ==================== v5 registries & draw ====================
const PAGES5 = {
  "tokens": { title: "00 · Design Tokens", route: "(system)", file: "design-tokens/", carbon: "Custom theme — GradeSpot tokens", make: d5Tokens },
  "devmap": { title: "01 · Dev Map — Next.js + Carbon", route: "(system)", file: "docs/", carbon: "Mapping reference", make: d5DevMap },
  "home": { title: "Home", route: "/", file: "app/page.tsx", carbon: "Grid · Tabs · Button · ClickableTile · Tile · Accordion", make: d5Home },
  "about": { title: "About Us", route: "/about", file: "app/about/page.tsx", carbon: "Grid · Tile · Button", make: d5About },
  "trainings": { title: "Trainings", route: "/trainings", file: "app/trainings/page.tsx", carbon: "Grid · Tag (filter) · ClickableTile", make: d5Trainings },
  "services": { title: "Services (For Businesses)", route: "/services", file: "app/services/page.tsx", carbon: "Grid · Tile · Button", make: d5Services },
  "for-institutes": { title: "For Institutes", route: "/for-institutes", file: "app/for-institutes/page.tsx", carbon: "Grid · Tile · Button · Modal", make: d5Institutes },
  "pricing": { title: "Pricing", route: "/pricing", file: "app/pricing/page.tsx", carbon: "Tile · Button · Accordion", make: d5Pricing },
  "why-choose-us": { title: "Why Choose Us", route: "/why-choose-us", file: "app/why-choose-us/page.tsx", carbon: "Grid · Tile", make: d5Why },
  "testimonials": { title: "Testimonials", route: "/testimonials", file: "app/testimonials/page.tsx", carbon: "Tile", make: d5Testimonials },
  "certifications": { title: "Student Certifications", route: "/certifications", file: "app/certifications/page.tsx", carbon: "Tag · Button", make: d5Certs },
  "verify": { title: "Certificate Verification", route: "/verify", file: "app/verify/page.tsx + app/api/verify/route.ts", carbon: "TextInput · Button · Tile", make: d5Verify },
  "team": { title: "Team Members", route: "/team", file: "app/team/page.tsx", carbon: "Tile", make: d5Team },
  "contact": { title: "Contact Us", route: "/contact", file: "app/contact/page.tsx + app/api/lead/route.ts", carbon: "TextInput · TextArea · Select · Button", make: d5Contact },
};
DATA5.courses.forEach((c) => {
  PAGES5["course-" + c.key] = {
    title: c.name, route: "/trainings/" + c.key, file: "app/trainings/[slug]/page.tsx",
    carbon: "Breadcrumb · Tag · Accordion · ClickableTile · Button", make: d5CourseDetail(c.key),
  };
});
const PAGES5M = {
  "m-home": { title: "Home · mobile", route: "/", file: "app/page.tsx (responsive)", carbon: "Grid sm · bottom tab bar", make: m5Home },
  "m-trainings": { title: "Trainings · mobile", route: "/trainings", file: "app/trainings/page.tsx (responsive)", carbon: "Grid sm · ClickableTile", make: m5Trainings },
  "m-course": { title: "SOC Analyst · mobile", route: "/trainings/soc-analyst", file: "app/trainings/[slug]/page.tsx", carbon: "Accordion · Button", make: m5Course },
  "m-institutes": { title: "For Institutes · mobile", route: "/for-institutes", file: "app/for-institutes/page.tsx", carbon: "Tile · Button", make: m5Institutes },
  "m-pricing": { title: "Pricing · mobile", route: "/pricing", file: "app/pricing/page.tsx", carbon: "Tile · Button", make: m5Pricing },
  "m-contact": { title: "Contact · mobile", route: "/contact", file: "app/contact/page.tsx", carbon: "TextInput · Button", make: m5Contact },
};

async function drawV5Page(key) {
  const mobile = key.indexOf("m-") === 0;
  const def = (mobile ? PAGES5M : PAGES5)[key];
  if (!def) throw new Error("unknown v5 page: " + key);
  const vw = mobile ? MW5 : W5;
  const board = v5board(def.title, vw);
  const stripH = 46;
  // Drawers lay out from y=0; shift every shape down to free the strip row.
  const h0 = Math.ceil(await def.make(board));
  const kids = board.children || [];
  for (let i = 0; i < kids.length; i++) {
    try { kids[i].y = kids[i].y + stripH; } catch (e) { /* keep going */ }
  }
  routeStrip(board, def.route, def.file, def.carbon, vw);
  const h = h0 + stripH;
  board.resize(vw, h);
  if (mobile) m5tabbar(board, h, key === "m-home" ? "Home" : key === "m-trainings" || key === "m-course" ? "Courses" : key === "m-institutes" ? "Institutes" : key === "m-pricing" ? "Pricing" : "Callback");
  else v5float(board, h);
  return { board: def.title, height: h };
}
