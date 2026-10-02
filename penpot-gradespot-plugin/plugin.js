// GradeSpot Designer — Penpot plugin (no server needed).
// Generates GradeSpot website designs directly on the canvas.
// Design input: reference-site analysis (gsitssolutions.com + cyberaegis.in).
// RULE: structure only — every number, testimonial, date, fee, name is a
// bracketed placeholder until Aravind confirms real facts. Never invent claims.

penpot.ui.open("GradeSpot Designer", "index.html?theme=" + penpot.theme, {
  width: 320,
  height: 560,
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
  navy: "#0F172A", navyBorder: "#1F2937", green: "#059669",
};
const W = 1440;          // board width
const MX = 80;           // side margin
const CW = W - MX * 2;   // content width 1280

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
  const t = penpot.createText(text);
  const tw = 14 * text.length * 0.62 + 32;
  const w = Math.max(90, Math.min(tw, 420));
  rect(parent, name + " bg", x, y, w, 36, bg);
  outlinedRect(parent, name + " border", x, y, w, 36, C.border, 1);
  if (t) {
    t.name = name + " label";
    t.growType = "auto-height";
    t.resize(w - 16, 24);
    t.x = x + 8; t.y = y + 8;
    t.fontFamily = "Inter"; t.fontSize = "13"; t.fontWeight = "700";
    t.fills = [{ fillColor: fg }];
    t.align = "center";
    parent.appendChild(t);
  }
  return w;
}

// ---------- global components ----------
function navbar(board, y, active) {
  rect(board, "nav bg", 0, y, W, 72, C.white);
  rect(board, "nav border", 0, y + 71, W, 1, C.border);
  label(board, "logo", "GradeSpot", MX, y + 18, 260,
    { size: 28, weight: "700", color: C.orange });
  const links = ["Home", "Courses", "Services", "About", "Contact"];
  links.forEach((l, i) => {
    const on = (l === active);
    label(board, "nav " + l, l, 600 + i * 118, y + 26, 110,
      { size: 16, color: on ? C.dark : C.gray, weight: on ? "700" : "400" });
  });
  button(board, "nav cta", W - MX - 190, y + 14, 190, 44,
    "Talk to a Trainer", C.orange, C.white);
  return y + 72;
}

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
    label(board, name + " sub", sub, (W - 720) / 2, yy, 720,
      { size: 17, color: C.gray, align: "center" });
    yy += 64;
  } else {
    yy += 8;
  }
  return yy;
}

function footer(board, y) {
  const h = 420;
  rect(board, "footer bg", 0, y, W, h, C.navy);
  // col 1: brand
  label(board, "f brand", "GradeSpot", MX, y + 48, 260,
    { size: 26, weight: "700", color: C.orange });
  label(board, "f blurb", "IT training and technology services from Hyderabad — practical skills, real projects.",
    MX, y + 92, 300, { size: 14, color: C.lightGray });
  // col 2: quick links
  label(board, "f h2", "Quick Links", 460, y + 48, 200,
    { size: 16, weight: "700", color: C.white });
  ["Home", "About Us", "Courses", "Services", "Contact"].forEach((l, i) => {
    label(board, "f link " + i, l, 460, y + 84 + i * 30, 200,
      { size: 14, color: C.lightGray });
  });
  // col 3: courses
  label(board, "f h3", "Popular Courses", 720, y + 48, 240,
    { size: 16, weight: "700", color: C.white });
  ["DevOps & Cloud", "Cyber Security", "Web Development", "Digital Marketing"].forEach((l, i) => {
    label(board, "f course " + i, l, 720, y + 84 + i * 30, 240,
      { size: 14, color: C.lightGray });
  });
  // col 4: contact (placeholders until confirmed)
  label(board, "f h4", "Contact", 1020, y + 48, 340,
    { size: 16, weight: "700", color: C.white });
  ["[Phone number]", "[Email address]", "[Office address, Hyderabad]", "[Working hours]"].forEach((l, i) => {
    label(board, "f contact " + i, l, 1020, y + 84 + i * 30, 340,
      { size: 14, color: C.lightGray });
  });
  rect(board, "f divider", MX, y + h - 70, CW, 1, C.navyBorder);
  label(board, "f copy", "© 2026 GradeSpot IT Solutions. All rights reserved.",
    MX, y + h - 44, 600, { size: 13, color: C.lightGray });
  label(board, "f legal", "Privacy Policy   •   Terms of Use",
    W - MX - 320, y + h - 44, 320, { size: 13, color: C.lightGray, align: "right" });
  return y + h;
}

function ctaBand(board, y, title, sub) {
  const h = 340;
  rect(board, "cta bg", 0, y, W, h, C.orange);
  label(board, "cta title", title, MX, y + 84, CW,
    { size: 38, weight: "700", color: C.white, align: "center" });
  label(board, "cta sub", sub, (W - 640) / 2, y + 150, 640,
    { size: 17, color: C.white, align: "center" });
  const bw = 220;
  rect(board, "cta btn bg", (W - bw) / 2, y + 224, bw, 54, C.white);
  label(board, "cta btn label", "Talk to a Trainer", (W - bw) / 2, y + 241, bw,
    { size: 16, weight: "700", color: C.orange, align: "center" });
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

// ---------- HOME page ----------
function homeHero(board, y) {
  const h = 660;
  rect(board, "hero bg", 0, y, W, h, C.orangeSoft);
  // left copy
  chip(board, "hero chip", MX, y + 90, "IT TRAINING & SERVICES — HYDERABAD");
  label(board, "hero h1", "Job-ready IT skills, taught the practical way.",
    MX, y + 150, 620, { size: 56, weight: "700", color: C.dark });
  label(board, "hero sub",
    "Classroom & online training in DevOps, Cloud, Cybersecurity and Web Development — plus technology services for businesses. Real projects, not just slides.",
    MX, y + 330, 560, { size: 18, color: C.gray });
  button(board, "hero cta1", MX, y + 450, 210, 54, "Explore Courses", C.orange, C.white);
  outlineButton(board, "hero cta2", MX + 226, y + 450, 210, 54, "Our Services", C.orange);
  // trust chips
  const chips = ["[Learners] Trained", "[Courses] Offered", "[?] Mentors"];
  let cx = MX;
  chips.forEach((c, i) => {
    const w = chip(board, "trust " + i, cx, y + 540, c, C.dark, C.white);
    cx += w + 12;
  });
  // right visual placeholder
  rect(board, "hero visual", MX + 720, y + 90, 560, 480, C.orange);
  label(board, "hero visual label", "[Hero image / visual]", MX + 720, y + 310, 560,
    { size: 22, weight: "700", color: C.white, align: "center" });
  return y + h;
}

function partnersStrip(board, y) {
  let yy = y + 56;
  label(board, "partners label", "OUR STUDENTS WORK WITH", MX, yy, CW,
    { size: 13, weight: "700", color: C.lightGray, align: "center" });
  yy += 40;
  for (let i = 0; i < 5; i++) {
    const bx = MX + i * 248;
    rect(board, "partner " + i, bx, yy, 224, 72, C.bgGray);
    label(board, "partner label " + i, "[Employer logo]", bx, yy + 26, 224,
      { size: 14, color: C.lightGray, align: "center" });
  }
  return yy + 72 + 56;
}

function servicesGrid(board, y) {
  let yy = secHead(board, "services", y, "What we do",
    "Training and services under one roof",
    "Pick a career track as a learner, or a technology partner as a business.");
  const items = [
    ["Corporate Training", "Upskill teams with customized on-site and online programs."],
    ["Cyber Security", "Assessments, SOC training and security best practices."],
    ["Web Development", "Modern websites and web apps, designed and built for you."],
    ["Digital Marketing", "SEO, ads and content that grow local businesses."],
  ];
  items.forEach((s, i) => {
    const col = i % 4, bx = MX + col * 320, by = yy;
    rect(board, "svc " + i, bx, by, 296, 240, C.white);
    outlinedRect(board, "svc " + i + " border", bx, by, 296, 240, C.border, 1);
    rect(board, "svc icon " + i, bx + 28, by + 28, 52, 52, C.orangeSoft);
    label(board, "svc title " + i, s[0], bx + 28, by + 100, 240, { size: 20, weight: "700" });
    label(board, "svc desc " + i, s[1], bx + 28, by + 134, 240, { size: 15, color: C.gray });
    label(board, "svc link " + i, "Learn more →", bx + 28, by + 196, 200,
      { size: 15, weight: "700", color: C.orange });
  });
  return yy + 240 + 72;
}

function coursesPreview(board, y) {
  let yy = secHead(board, "courses", y, "Popular programs",
    "Career-focused courses with hands-on labs",
    "Every program includes real projects and mentor guidance.");
  const items = [
    ["DevOps & Cloud", "CI/CD, Kubernetes, AWS & Azure.", "[Duration]"],
    ["Cyber Security", "SOC skills & ethical hacking.", "[Duration]"],
    ["Web Development", "Full-stack, portfolio-ready.", "[Duration]"],
    ["Digital Marketing", "SEO, ads & analytics.", "[Duration]"],
  ];
  items.forEach((c, i) => {
    const bx = MX + (i % 4) * 320, by = yy;
    rect(board, "course " + i, bx, by, 296, 300, C.white);
    outlinedRect(board, "course " + i + " border", bx, by, 296, 300, C.border, 1);
    rect(board, "course img " + i, bx, by, 296, 140, C.bgGray);
    label(board, "course img label " + i, "[Course art]", bx, by + 58, 296,
      { size: 14, color: C.lightGray, align: "center" });
    rect(board, "course dur " + i, bx + 20, by + 156, 110, 28, C.orangeSoft);
    label(board, "course dur label " + i, c[2], bx + 20, by + 161, 110,
      { size: 12, weight: "700", color: C.orange, align: "center" });
    label(board, "course title " + i, c[0], bx + 20, by + 194, 256, { size: 19, weight: "700" });
    label(board, "course desc " + i, c[1], bx + 20, by + 224, 256, { size: 14, color: C.gray });
    label(board, "course link " + i, "View details →", bx + 20, by + 262, 200,
      { size: 14, weight: "700", color: C.orange });
  });
  yy += 300 + 40;
  outlineButton(board, "courses all", (W - 240) / 2, yy, 240, 52, "View All Courses", C.orange);
  return yy + 52 + 72;
}

function batchesSection(board, y) {
  let yy = secHead(board, "batches", y, "Upcoming batches",
    "Pick a batch that fits your schedule",
    "New batches open regularly — enquire to reserve your seat.");
  // header row
  const cols = [MX, MX + 330, MX + 560, MX + 800, MX + 1040];
  ["Course", "Duration", "Starts", "Timings", ""].forEach((h, i) => {
    label(board, "batch h " + i, h, cols[i], yy, 200, { size: 13, weight: "700", color: C.lightGray });
  });
  yy += 30;
  const rows = [
    ["DevOps & Cloud", "[Duration]", "[Start date]", "[Timings]"],
    ["Cyber Security", "[Duration]", "[Start date]", "[Timings]"],
    ["Web Development", "[Duration]", "[Start date]", "[Timings]"],
  ];
  rows.forEach((r, i) => {
    rect(board, "batch row " + i, MX, yy, CW, 72, i % 2 ? C.white : C.bgGray);
    outlinedRect(board, "batch row " + i + " border", MX, yy, CW, 72, C.border, 1);
    r.forEach((cell, j) => {
      label(board, "batch cell " + i + "-" + j, cell, cols[j], yy + 25, 220,
        { size: 15, weight: j === 0 ? "700" : "400", color: j === 0 ? C.dark : C.gray });
    });
    button(board, "batch enq " + i, cols[4], yy + 14, 150, 44, "Enquire", C.orange, C.white);
    yy += 84;
  });
  return yy + 40;
}

function statsBand(board, y) {
  const h = 260;
  rect(board, "stats bg", 0, y, W, h, C.orange);
  const stats = [["Learners Trained"], ["Courses Offered"], ["Expert Mentors"], ["Hiring Partners"]];
  stats.forEach((s, i) => {
    const cx = MX + i * 320;
    label(board, "stat num " + i, "—", cx, y + 80, 296,
      { size: 52, weight: "700", color: C.white, align: "center" });
    label(board, "stat label " + i, s[0], cx, y + 150, 296,
      { size: 16, color: C.white, align: "center" });
  });
  label(board, "stats note", "Real numbers appear here once confirmed.",
    MX, y + 210, CW, { size: 13, color: C.white, align: "center" });
  return y + h;
}

function whyUs(board, y) {
  let yy = secHead(board, "why", y, "Why GradeSpot",
    "Practical learning, honest guidance",
    "What makes the experience different.");
  const items = [
    ["Hands-on Labs", "Every concept practiced in live lab environments."],
    ["Real Projects", "Build a portfolio employers can actually see."],
    ["Mentor Support", "Guidance from working industry professionals."],
    ["Career Prep", "Resume, interviews and job-search assistance."],
  ];
  items.forEach((s, i) => {
    const bx = MX + (i % 4) * 320, by = yy;
    rect(board, "why " + i, bx, by, 296, 210, C.white);
    outlinedRect(board, "why " + i + " border", bx, by, 296, 210, C.border, 1);
    rect(board, "why icon " + i, bx + 28, by + 28, 48, 48, C.orangeSoft);
    label(board, "why title " + i, s[0], bx + 28, by + 96, 240, { size: 19, weight: "700" });
    label(board, "why desc " + i, s[1], bx + 28, by + 128, 240, { size: 14, color: C.gray });
  });
  return yy + 210 + 72;
}

function stepsSection(board, y, title, steps) {
  let yy = secHead(board, "steps", y, "How it works", title, "");
  steps.forEach((s, i) => {
    const bx = MX + (i % 4) * 320;
    label(board, "step num " + i, "0" + (i + 1), bx, yy, 100,
      { size: 44, weight: "700", color: C.orange });
    label(board, "step title " + i, s[0], bx, yy + 60, 280, { size: 19, weight: "700" });
    label(board, "step desc " + i, s[1], bx, yy + 92, 280, { size: 14, color: C.gray });
  });
  return yy + 190 + 56;
}

function testimonials(board, y) {
  let yy = secHead(board, "testi", y, "Student stories",
    "Hear it from our learners",
    "Verified reviews appear here — placeholders only for now.");
  for (let i = 0; i < 3; i++) {
    const bx = MX + i * 427, by = yy;
    rect(board, "testi " + i, bx, by, 403, 260, C.white);
    outlinedRect(board, "testi " + i + " border", bx, by, 403, 260, C.border, 1);
    rect(board, "testi avatar " + i, bx + 28, by + 28, 52, 52, C.bgGray);
    label(board, "testi name " + i, "[Student name]", bx + 96, by + 30, 240,
      { size: 16, weight: "700" });
    label(board, "testi role " + i, "[Course completed]", bx + 96, by + 54, 240,
      { size: 14, color: C.gray });
    label(board, "testi quote " + i, "[Verified student review appears here.]",
      bx + 28, by + 104, 347, { size: 15, color: C.gray });
    label(board, "testi stars " + i, "★★★★★", bx + 28, by + 200, 200,
      { size: 16, color: C.orange });
  }
  return yy + 260 + 72;
}

function drawHome(board) {
  let y = 0;
  y = navbar(board, y, "Home");
  y = homeHero(board, y);
  y = partnersStrip(board, y);
  y = servicesGrid(board, y);
  y = coursesPreview(board, y);
  y = batchesSection(board, y);
  y = careerSection(board, y);
  y = statsBand(board, y);
  y = whyUs(board, y);
  y = stepsSection(board, y, "From enquiry to job-ready",
    [["Choose a Program", "Talk to a counsellor and pick your track."],
     ["Learn by Doing", "Live classes plus hands-on labs and projects."],
     ["Get Career-Ready", "Resume reviews, mock interviews, soft skills."],
     ["Launch Your Career", "Apply with confidence and mentor support."]]);
  y = testimonials(board, y);
  let yy = secHead(board, "faq", y, "FAQ", "Common questions", "");
  yy = faqList(board, "faq", yy, [
    "What programs does GradeSpot offer?",
    "Are classes online or in person?",
    "Do I get placement assistance?",
    "How do I enroll in a course?",
  ]);
  yy += 16;
  outlineButton(board, "faq all", (W - 200) / 2, yy, 200, 48, "View All FAQs", C.orange);
  y = yy + 48 + 72;
  y = ctaBand(board, y, "Ready to start your IT career?",
    "Talk to a trainer today — get honest guidance on the right program for you.");
  y = footer(board, y);
  return y;
}

// ---------- inner-page hero ----------
function pageHero(board, y, eyebrow, title, sub) {
  const h = 380;
  rect(board, "phero bg", 0, y, W, h, C.orangeSoft);
  label(board, "phero eyebrow", eyebrow.toUpperCase(), MX, y + 100, CW,
    { size: 13, weight: "700", color: C.orange, align: "center" });
  label(board, "phero title", title, MX, y + 134, CW,
    { size: 48, weight: "700", color: C.dark, align: "center" });
  label(board, "phero sub", sub, (W - 700) / 2, y + 210, 700,
    { size: 17, color: C.gray, align: "center" });
  return y + h;
}

// ---------- ABOUT ----------
function drawAbout(board) {
  let y = 0;
  y = navbar(board, y, "About");
  y = pageHero(board, y, "About us", "The team behind GradeSpot",
    "An IT training and services company from Hyderabad, built on practical learning.");
  // story + image
  let yy = y + 72;
  label(board, "story eyebrow", "OUR STORY", MX, yy, 600,
    { size: 13, weight: "700", color: C.orange });
  label(board, "story h2", "Practical skills for real careers", MX, yy + 30, 600,
    { size: 36, weight: "700" });
  label(board, "story body",
    "GradeSpot IT Solutions helps learners build job-ready skills through hands-on training, and helps businesses with web development, cybersecurity and digital services. [Company story to be confirmed — founding year, mission detail.]",
    MX, yy + 92, 600, { size: 16, color: C.gray });
  rect(board, "story img", MX + 680, yy, 600, 380, C.bgGray);
  label(board, "story img label", "[Team / office photo]", MX + 680, yy + 178, 600,
    { size: 16, color: C.lightGray, align: "center" });
  y = yy + 380 + 72;
  // mission / vision
  let my = secHead(board, "mv", y, "What drives us", "Mission & vision", "");
  [["Our Mission", "[Mission statement — to be confirmed.]"],
   ["Our Vision", "[Vision statement — to be confirmed.]"]].forEach((m, i) => {
    const bx = MX + i * 640;
    rect(board, "mv " + i, bx, my, 600, 200, C.white);
    outlinedRect(board, "mv " + i + " border", bx, my, 600, 200, C.border, 1);
    rect(board, "mv accent " + i, bx, my, 600, 6, C.orange);
    label(board, "mv title " + i, m[0], bx + 32, my + 32, 500, { size: 22, weight: "700" });
    label(board, "mv body " + i, m[1], bx + 32, my + 70, 520, { size: 15, color: C.gray });
  });
  y = my + 200 + 72;
  // timeline
  let ty = secHead(board, "timeline", y, "Journey", "Milestones", "");
  const miles = ["[Milestone 1]", "[Milestone 2]", "[Milestone 3]", "[Milestone 4]"];
  miles.forEach((m, i) => {
    const bx = MX + i * 320;
    label(board, "mile dot " + i, "●", bx, ty, 40, { size: 20, color: C.orange });
    label(board, "mile year " + i, "[Year]", bx, ty + 32, 200, { size: 16, weight: "700" });
    label(board, "mile text " + i, m, bx, ty + 58, 260, { size: 14, color: C.gray });
  });
  y = ty + 130 + 56;
  // leadership (placeholders only)
  let ly = secHead(board, "team", y, "Leadership", "Meet the team",
    "Profiles appear here once confirmed.");
  for (let i = 0; i < 3; i++) {
    const bx = MX + i * 427;
    rect(board, "leader " + i, bx, ly, 403, 300, C.white);
    outlinedRect(board, "leader " + i + " border", bx, ly, 403, 300, C.border, 1);
    rect(board, "leader photo " + i, bx + 28, ly + 28, 96, 96, C.bgGray);
    label(board, "leader name " + i, "[Full name]", bx + 140, ly + 44, 230, { size: 19, weight: "700" });
    label(board, "leader role " + i, "[Role / title]", bx + 140, ly + 72, 230,
      { size: 14, color: C.orange, weight: "700" });
    label(board, "leader bio " + i, "[Short bio — to be confirmed.]",
      bx + 28, ly + 150, 347, { size: 14, color: C.gray });
  }
  y = ly + 300 + 72;
  y = ctaBand(board, y, "Want to know more?", "Talk to our team — we answer honestly.");
  y = footer(board, y);
  return y;
}

// ---------- COURSES ----------
function drawCourses(board) {
  let y = 0;
  y = navbar(board, y, "Courses");
  y = pageHero(board, y, "Programs", "Find your career track",
    "Hands-on courses across DevOps, Cloud, Security and Development.");
  // filter chips
  let yy = y + 48;
  const filters = ["All", "DevOps & Cloud", "Cyber Security", "Development", "Marketing"];
  let fx = MX;
  filters.forEach((f, i) => {
    const w = chip(board, "filter " + i, fx, yy, f, i === 0 ? C.white : C.dark, i === 0 ? C.orange : C.white);
    fx += w + 12;
  });
  yy += 36 + 40;
  // course grid 3 x 2
  const courses = [
    ["DevOps & Cloud", "CI/CD, Kubernetes, AWS & Azure with live labs.", "[Duration]", "[Mode]"],
    ["Cyber Security", "SOC analysis and ethical hacking fundamentals.", "[Duration]", "[Mode]"],
    ["Web Development", "Modern full-stack development, portfolio-ready.", "[Duration]", "[Mode]"],
    ["Digital Marketing", "SEO, paid ads and analytics for growth.", "[Duration]", "[Mode]"],
    ["Cloud Architect", "Designing reliable systems on AWS & Azure.", "[Duration]", "[Mode]"],
    ["Python Programming", "From basics to automation and backends.", "[Duration]", "[Mode]"],
  ];
  courses.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const bx = MX + col * 427, by = yy + row * 380;
    rect(board, "cat " + i, bx, by, 403, 340, C.white);
    outlinedRect(board, "cat " + i + " border", bx, by, 403, 340, C.border, 1);
    rect(board, "cat img " + i, bx, by, 403, 150, C.bgGray);
    label(board, "cat img label " + i, "[Course art]", bx, by + 64, 403,
      { size: 14, color: C.lightGray, align: "center" });
    let tx = bx + 24;
    [[c[2], tx], [c[3], tx + 120]].forEach((tg, j) => {
      rect(board, "cat tag " + i + "-" + j, tg[1], by + 168, 108, 28, C.orangeSoft);
      label(board, "cat tag label " + i + "-" + j, tg[0], tg[1], by + 173, 108,
        { size: 12, weight: "700", color: C.orange, align: "center" });
    });
    label(board, "cat title " + i, c[0], bx + 24, by + 206, 355, { size: 21, weight: "700" });
    label(board, "cat desc " + i, c[1], bx + 24, by + 240, 355, { size: 14, color: C.gray });
    button(board, "cat btn " + i, bx + 24, by + 282, 160, 42, "View Details", C.orange, C.white);
  });
  y = yy + 2 * 380 + 56;
  y = ctaBand(board, y, "Not sure which program fits?",
    "Get free career guidance — no pressure, no spam.");
  y = footer(board, y);
  return y;
}

// ---------- COURSE DETAIL (template) ----------
function drawCourseDetail(board) {
  let y = 0;
  y = navbar(board, y, "Courses");
  // course hero
  const hh = 420;
  rect(board, "chero bg", 0, y, W, hh, C.navy);
  label(board, "chero eyebrow", "COURSE", MX, y + 80, 700,
    { size: 13, weight: "700", color: C.orange });
  label(board, "chero title", "[Course Name]", MX, y + 112, 700,
    { size: 48, weight: "700", color: C.white });
  label(board, "chero tagline", "[One-line outcome: what the learner will be able to do.]",
    MX, y + 184, 620, { size: 17, color: C.lightGray });
  let mx = MX;
  ["[Duration]", "[Mode]", "[Level]"].forEach((m, i) => {
    const w = chip(board, "chero meta " + i, mx, y + 250, m, C.white, C.navyBorder);
    mx += w + 12;
  });
  button(board, "chero cta", MX, y + 310, 200, 52, "Enroll Now", C.orange, C.white);
  y += hh;
  // outcomes
  let yy = secHead(board, "outcomes", y + 56, "Outcomes", "What you will learn", "");
  const outs = ["[Learning outcome 1]", "[Learning outcome 2]", "[Learning outcome 3]",
    "[Learning outcome 4]", "[Learning outcome 5]", "[Learning outcome 6]"];
  outs.forEach((o, i) => {
    const col = i % 2, bx = MX + col * 640, by = yy + Math.floor(i / 2) * 56;
    rect(board, "out dot " + i, bx, by + 4, 22, 22, C.orangeSoft);
    label(board, "out check " + i, "✓", bx, by + 2, 22,
      { size: 15, weight: "700", color: C.orange, align: "center" });
    label(board, "out text " + i, o, bx + 36, by, 580, { size: 16 });
  });
  y = yy + 3 * 56 + 56;
  // curriculum accordion
  yy = secHead(board, "curr", y, "Curriculum", "Module by module", "");
  const mods = ["Module 1: [Title]", "Module 2: [Title]", "Module 3: [Title]", "Module 4: [Title]"];
  mods.forEach((m, i) => {
    rect(board, "mod " + i, MX, yy, CW, 72, C.white);
    outlinedRect(board, "mod " + i + " border", MX, yy, CW, 72, C.border, 1);
    label(board, "mod t " + i, m, MX + 28, yy + 24, CW - 120, { size: 17, weight: "600" });
    label(board, "mod plus " + i, "+", MX + CW - 60, yy + 20, 40,
      { size: 28, color: C.orange, align: "center" });
    yy += 84;
  });
  y = yy + 40;
  // features grid
  yy = secHead(board, "cfeat", y, "Included", "Program features", "");
  const feats = [
    ["Live Classes", "[Delivery detail.]"], ["Hands-on Labs", "[Delivery detail.]"],
    ["Real Projects", "[Delivery detail.]"], ["Career Support", "[Delivery detail.]"],
  ];
  feats.forEach((f, i) => {
    const bx = MX + (i % 4) * 320;
    rect(board, "cfeat " + i, bx, yy, 296, 170, C.bgGray);
    label(board, "cfeat t " + i, f[0], bx + 24, yy + 28, 248, { size: 18, weight: "700" });
    label(board, "cfeat d " + i, f[1], bx + 24, yy + 60, 248, { size: 14, color: C.gray });
  });
  y = yy + 170 + 72;
  // enroll form
  yy = secHead(board, "enroll", y, "Enroll", "Reserve your seat", "");
  rect(board, "form bg", MX, yy, 620, 420, C.white);
  outlinedRect(board, "form border", MX, yy, 620, 420, C.border, 1);
  ["Full name", "Phone number", "Email address"].forEach((f, i) => {
    label(board, "form label " + i, f, MX + 32, yy + 32 + i * 92, 300, { size: 14, weight: "600" });
    outlinedRect(board, "form field " + i, MX + 32, yy + 58 + i * 92, 556, 48, C.border, 1);
  });
  button(board, "form submit", MX + 32, yy + 340, 220, 50, "Request Callback", C.orange, C.white);
  rect(board, "form side", MX + 660, yy, 620, 420, C.orangeSoft);
  label(board, "form side t", "Prefer WhatsApp?", MX + 700, yy + 60, 540,
    { size: 22, weight: "700" });
  label(board, "form side d", "Message us directly and get batch details, fees and a free demo invite.",
    MX + 700, yy + 100, 520, { size: 15, color: C.gray });
  outlineButton(board, "form wa", MX + 700, yy + 190, 240, 52, "Chat on WhatsApp", C.green);
  y = yy + 420 + 72;
  y = footer(board, y);
  return y;
}

// ---------- SERVICES ----------
function drawServices(board) {
  let y = 0;
  y = navbar(board, y, "Services");
  y = pageHero(board, y, "For businesses", "Technology services that deliver",
    "Websites, security and marketing — executed by the same team that trains engineers.");
  let yy = secHead(board, "svclist", y + 56, "Services", "What we do for clients", "");
  const svcs = [
    ["Web Development", "Business websites and web apps — fast, secure, maintainable.", ["Business sites", "Web applications", "Redesigns"]],
    ["Cyber Security", "Assessments and hardening for small and mid-size businesses.", ["Security audits", "Best-practice hardening", "Team training"]],
    ["Digital Marketing", "SEO, advertising and content tuned for local growth.", ["SEO", "Ad campaigns", "Content"]],
    ["Corporate Training", "Custom upskilling programs for your engineering team.", ["On-site workshops", "Online cohorts", "Custom curricula"]],
    ["Network Infrastructure", "Design and setup of reliable office networks.", ["LAN/Wi-Fi design", "Hardware setup", "Maintenance"]],
    ["Brand & Logo Design", "Visual identity that looks professional from day one.", ["Logo design", "Brand kits", "Guidelines"]],
  ];
  svcs.forEach((s, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const bx = MX + col * 427, by = yy + row * 400;
    rect(board, "svc2 " + i, bx, by, 403, 360, C.white);
    outlinedRect(board, "svc2 " + i + " border", bx, by, 403, 360, C.border, 1);
    rect(board, "svc2 accent " + i, bx, by, 403, 6, C.orange);
    rect(board, "svc2 icon " + i, bx + 28, by + 34, 52, 52, C.orangeSoft);
    label(board, "svc2 title " + i, s[0], bx + 28, by + 106, 347, { size: 21, weight: "700" });
    label(board, "svc2 desc " + i, s[1], bx + 28, by + 142, 347, { size: 14, color: C.gray });
    s[2].forEach((b, j) => {
      label(board, "svc2 bullet " + i + "-" + j, "✓  " + b, bx + 28, by + 200 + j * 30, 347,
        { size: 14, color: C.gray });
    });
    label(board, "svc2 link " + i, "Request a quote →", bx + 28, by + 306, 240,
      { size: 15, weight: "700", color: C.orange });
  });
  y = yy + 2 * 400 + 56;
  y = stepsSection(board, y, "How engagements work",
    [["Choose a Service", "Tell us what you need — site, security, marketing."],
     ["Request a Meeting", "A short call to understand scope and goals."],
     ["Receive a Plan", "A clear proposal with timeline and pricing."],
     ["We Deliver", "Build, review, launch — with support after."]]);
  y = ctaBand(board, y, "Have a project in mind?",
    "Tell us about it — get a clear plan and honest pricing.");
  y = footer(board, y);
  return y;
}

// ---------- CONTACT ----------
function drawContact(board) {
  let y = 0;
  y = navbar(board, y, "Contact");
  y = pageHero(board, y, "Get in touch", "Let's talk",
    "Questions about courses or services? Send a message — we reply within one business day.");
  let yy = y + 56;
  // form + info cards
  rect(board, "cform bg", MX, yy, 620, 480, C.white);
  outlinedRect(board, "cform border", MX, yy, 620, 480, C.border, 1);
  label(board, "cform h", "Send us a message", MX + 36, yy + 36, 400, { size: 22, weight: "700" });
  ["Full name", "Phone number", "Email address", "Your message"].forEach((f, i) => {
    const fh = i === 3 ? 96 : 48;
    const fy = yy + 90 + i * (i === 3 ? 92 : 84);
    label(board, "cform label " + i, f, MX + 36, fy, 300, { size: 14, weight: "600" });
    outlinedRect(board, "cform field " + i, MX + 36, fy + 26, 548, fh, C.border, 1);
  });
  button(board, "cform submit", MX + 36, yy + 404, 200, 50, "Send Message", C.orange, C.white);
  const infos = [
    ["Call Us", "[Phone number]", "[Working hours]"],
    ["Email Us", "[Email address]", "[Response time]"],
    ["Visit Us", "[Office address]", "[Hyderabad]"],
    ["WhatsApp", "[Chat link]", "[Timings]"],
  ];
  infos.forEach((inf, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = MX + 660 + col * 320, by = yy + row * 250;
    rect(board, "cinfo " + i, bx, by, 300, 220, C.white);
    outlinedRect(board, "cinfo " + i + " border", bx, by, 300, 220, C.border, 1);
    rect(board, "cinfo icon " + i, bx + 24, by + 24, 44, 44, C.orangeSoft);
    label(board, "cinfo t " + i, inf[0], bx + 24, by + 86, 252, { size: 18, weight: "700" });
    label(board, "cinfo d1 " + i, inf[1], bx + 24, by + 116, 252, { size: 14, color: C.gray });
    label(board, "cinfo d2 " + i, inf[2], bx + 24, by + 140, 252, { size: 14, color: C.gray });
  });
  y = yy + 480 + 56;
  y = stepsSection(board, y, "How enrolment works",
    [["Submit Enquiry", "Fill the form or ping us on WhatsApp."],
     ["Career Guidance", "A counsellor helps you pick the right track."],
     ["Attend Free Demo", "Experience a real class before you commit."],
     ["Start Learning", "Join your batch and build your portfolio."]]);
  // map placeholder
  rect(board, "map", MX, y, CW, 320, C.bgGray);
  outlinedRect(board, "map border", MX, y, CW, 320, C.border, 1);
  label(board, "map label", "[Embedded map — office location]", MX, y + 148, CW,
    { size: 16, color: C.lightGray, align: "center" });
  y += 320 + 72;
  y = footer(board, y);
  return y;
}

// ---------- dispatcher ----------
const PAGES = {
  home: ["Home", drawHome],
  about: ["About", drawAbout],
  courses: ["Courses", drawCourses],
  "course-detail": ["Course Detail (template)", drawCourseDetail],
  services: ["Services", drawServices],
  contact: ["Contact", drawContact],
  team: ["Team", drawTeam],
};

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

function drawAllPages() {
  const keys = Object.keys(PAGES);
  const drawn = [];
  let y = 0;
  keys.forEach((key) => {
    const def = PAGES[key];
    progress("Drawing " + def[0] + "… (" + (drawn.length + 1) + "/" + keys.length + ")");
    const board = penpot.createBoard();
    board.name = def[0];
    board.x = 0; board.y = y;
    board.resize(W, 200);
    board.fills = [{ fillColor: C.white }];
    const h = Math.ceil(def[1](board));
    board.resize(W, h);
    y += h + 120;
    drawn.push(def[0]);
  });
  return drawn;
}

penpot.ui.onMessage((message) => {
  if (!message || typeof message.type !== "string") return;
  if (message.type === "draw") {
    try {
      if (message.page === "all") {
        const drawn = drawAllPages();
        penpot.ui.sendMessage({
          type: "done", ok: true,
          detail: "Drew " + drawn.length + " pages: " + drawn.join(", ") + ".",
        });
      } else {
        const r = drawSitePage(message.page);
        penpot.ui.sendMessage({
          type: "done", ok: true,
          detail: "Drew '" + r.board + "' (" + r.height + "px tall) on this page.",
        });
      }
    } catch (err) {
      penpot.ui.sendMessage({
        type: "done", ok: false,
        detail: "Error at '" + lastStep + "': " + (err && err.message ? err.message : String(err)),
      });
    }
  }
  // "test-hero" is handled by the earlier listener; everything else ignored
});

// ---------- career support (CyberAegis-inspired structure, zero borrowed claims) ----------
function careerSection(board, y) {
  const h = 560;
  rect(board, "career bg", 0, y, W, h, C.bgGray);
  let yy = y + 72;
  label(board, "career eyebrow", "CAREER SUPPORT", MX, yy, 600,
    { size: 13, weight: "700", color: C.orange });
  label(board, "career h2", "From learning to getting hired", MX, yy + 30, 600,
    { size: 36, weight: "700" });
  label(board, "career sub", "Structured career preparation built into every program.",
    MX, yy + 82, 560, { size: 16, color: C.gray });
  const items = ["Resume building", "Mock interviews", "LinkedIn profile optimization",
    "Soft-skills coaching", "1:1 mentorship", "Job-search guidance"];
  items.forEach((t, i) => {
    const by = yy + 140 + i * 46;
    rect(board, "career dot " + i, MX, by + 2, 22, 22, C.white);
    label(board, "career check " + i, "✓", MX, by, 22,
      { size: 15, weight: "700", color: C.orange, align: "center" });
    label(board, "career item " + i, t, MX + 36, by, 520, { size: 16 });
  });
  // right: outcomes card (placeholders only — no borrowed numbers)
  rect(board, "career card", MX + 680, yy, 600, 416, C.navy);
  label(board, "career card t", "Career outcomes", MX + 724, yy + 44, 520,
    { size: 24, weight: "700", color: C.white });
  label(board, "career card d",
    "Verified placement numbers and hiring-partner logos appear here once confirmed.",
    MX + 724, yy + 88, 512, { size: 15, color: C.lightGray });
  [["—", "Career Support"], ["—", "Hiring Partners"], ["—", "Mock Interviews"]].forEach((s, i) => {
    const bx = MX + 724 + i * 170;
    label(board, "career stat n " + i, s[0], bx, yy + 190, 160,
      { size: 40, weight: "700", color: C.white, align: "center" });
    label(board, "career stat l " + i, s[1], bx, yy + 242, 160,
      { size: 13, color: C.lightGray, align: "center" });
  });
  button(board, "career cta", MX + 724, yy + 316, 280, 52,
    "Start Your Career Journey", C.orange, C.white);
  return y + h;
}

// ---------- TEAM page (matches GradeSpot's Team Members page) ----------
function drawTeam(board) {
  let y = 0;
  y = navbar(board, y, "About");
  y = pageHero(board, y, "Our team", "Meet the leadership",
    "The people guiding GradeSpot's training and services.");
  let yy = y + 72;
  for (let i = 0; i < 3; i++) {
    const bx = MX + i * 427;
    rect(board, "tm " + i, bx, yy, 403, 360, C.white);
    outlinedRect(board, "tm " + i + " border", bx, yy, 403, 360, C.border, 1);
    rect(board, "tm photo " + i, bx + 28, yy + 28, 120, 120, C.bgGray);
    label(board, "tm photo label " + i, "[Photo]", bx + 28, yy + 80, 120,
      { size: 14, color: C.lightGray, align: "center" });
    label(board, "tm name " + i, "[Full name]", bx + 164, yy + 48, 211,
      { size: 20, weight: "700" });
    label(board, "tm role " + i, "[Role / title]", bx + 164, yy + 80, 211,
      { size: 14, color: C.orange, weight: "700" });
    label(board, "tm bio " + i,
      "[Short bio — background, expertise, and what they lead at GradeSpot. To be confirmed.]",
      bx + 28, yy + 172, 347, { size: 14, color: C.gray });
    label(board, "tm social " + i, "[LinkedIn profile]", bx + 28, yy + 300, 240,
      { size: 14, weight: "700", color: C.orange });
  }
  y = yy + 360 + 72;
  // values strip
  let vy = secHead(board, "tvalues", y, "Culture", "What we stand for", "");
  ["Practical First", "Honest Guidance", "Student Success"].forEach((v, i) => {
    const bx = MX + i * 427;
    rect(board, "tval " + i, bx, vy, 403, 140, C.orangeSoft);
    label(board, "tval t " + i, v, bx + 28, vy + 40, 347,
      { size: 20, weight: "700", align: "center" });
    label(board, "tval d " + i, "[One-line description.]", bx + 28, vy + 76, 347,
      { size: 14, color: C.gray, align: "center" });
  });
  y = vy + 140 + 72;
  y = ctaBand(board, y, "Want to join the team?",
    "We are always looking for passionate trainers and engineers.");
  y = footer(board, y);
  return y;
}
