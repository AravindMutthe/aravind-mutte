// GradeSpot Designer v3.1 — Penpot plugin (no server needed).
// Replicates the two reference sites' structure completely — headers, navbars,
// footers and full section inventory on every page.
// v3.1: draws each page in small async chunks (yielding to the renderer
// between sections) so large boards can't wedge the Penpot tab.
// RULE: structure/layout only — all copy is lorem ipsum dummy text and every
// number, testimonial, date, fee, name, badge or contact detail is a bracketed
// placeholder until Aravind confirms real facts. Never invent claims.

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

// ---------- dispatcher (async) ----------
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
  })();
});
