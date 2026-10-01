// GradeSpot Designer — Penpot plugin (no server needed).
// Generates GradeSpot website designs directly on the canvas.

penpot.ui.open("GradeSpot Designer", "index.html?theme=" + penpot.theme, {
  width: 300,
  height: 430,
});

// ---------- helpers ----------
function rect(parent, name, x, y, w, h, fill) {
  const r = penpot.createRectangle();
  r.name = name;
  r.x = x; r.y = y; r.width = w; r.height = h;
  r.fills = [{ fillColor: fill }];
  parent.appendChild(r);
  return r;
}

function label(parent, name, str, x, y, w, opts) {
  opts = opts || {};
  const t = penpot.createText(str);
  if (!t) return null;
  t.name = name;
  t.x = x; t.y = y; t.width = w;
  t.growType = "auto-height";
  t.fontFamily = opts.font || "Inter";
  t.fontSize = String(opts.size || 16);
  t.fontWeight = opts.weight || "400";
  t.fills = [{ fillColor: opts.color || "#111827" }];
  if (opts.align) t.align = opts.align;
  parent.appendChild(t);
  return t;
}

function button(parent, name, x, y, w, h, text, bg, fg) {
  rect(parent, name + " bg", x, y, w, h, bg);
  label(parent, name + " label", text, x, y + h / 2 - 11, w, {
    size: 16, weight: "700", color: fg, align: "center",
  });
}

// ---------- test generator: sample hero ----------
function generateTestHero() {
  const page = penpot.createPage();
  page.name = "GradeSpot - Test";

  const board = penpot.createBoard();
  board.name = "Homepage - Test Hero";
  board.x = 0; board.y = 0; board.width = 1440; board.height = 900;
  board.fills = [{ fillColor: "#FFFFFF" }];
  page.appendChild(board);

  const ORANGE = "#EA580C";
  const DARK = "#111827";
  const GRAY = "#4B5563";
  const LIGHT = "#FFF7ED";
  const BORDER = "#E5E7EB";

  // nav
  rect(board, "nav bg", 0, 0, 1440, 72, "#FFFFFF");
  rect(board, "nav border", 0, 71, 1440, 1, BORDER);
  label(board, "logo", "GradeSpot", 80, 18, 240, { size: 28, weight: "700", color: ORANGE });
  const links = ["Home", "Courses", "About", "Contact"];
  links.forEach((l, i) => {
    label(board, "nav " + l, l, 640 + i * 110, 26, 100, { size: 16, color: GRAY });
  });
  button(board, "nav cta", 1220, 14, 140, 44, "Enroll Now", ORANGE, "#FFFFFF");

  // hero
  rect(board, "hero bg", 0, 72, 1440, 528, LIGHT);
  label(board, "eyebrow", "HYDERABAD  •  IT TRAINING", 80, 140, 500, {
    size: 14, weight: "700", color: ORANGE,
  });
  label(board, "headline", "Job-ready IT skills, taught the practical way.", 80, 168, 620, {
    size: 54, weight: "700", color: DARK,
  });
  label(board, "subhead",
    "Classroom & online training in DevOps, Cloud, Cybersecurity and Web Development - with real projects, not just slides.",
    80, 330, 560, { size: 18, color: GRAY });
  button(board, "hero cta 1", 80, 430, 200, 52, "Explore Courses", ORANGE, "#FFFFFF");
  rect(board, "hero cta 2 bg", 296, 430, 160, 52, "#FFFFFF");
  const outline = penpot.createRectangle();
  outline.name = "hero cta 2 border";
  outline.x = 296; outline.y = 430; outline.width = 160; outline.height = 52;
  outline.fills = [];
  outline.strokes = [{ strokeColor: ORANGE, strokeWidth: 2, strokeStyle: "solid", strokeAlignment: "center" }];
  board.appendChild(outline);
  label(board, "hero cta 2 label", "Talk to Us", 296, 447, 160, {
    size: 16, weight: "700", color: ORANGE, align: "center",
  });

  // hero visual placeholder
  rect(board, "hero visual", 880, 140, 480, 380, ORANGE);
  label(board, "hero visual label", "Hero visual", 880, 310, 480, {
    size: 24, weight: "700", color: "#FFFFFF", align: "center",
  });

  // feature cards
  const cards = [
    ["DevOps & Cloud", "CI/CD, Kubernetes, AWS & Azure - hands-on labs."],
    ["Cyber Security", "Ethical hacking & SOC skills with live practice."],
    ["Web Development", "Modern full-stack builds, portfolio-ready."],
  ];
  cards.forEach((c, i) => {
    const cx = 80 + i * 440;
    rect(board, "card " + i + " bg", cx, 660, 400, 180, "#FFFFFF");
    const border = penpot.createRectangle();
    border.name = "card " + i + " border";
    border.x = cx; border.y = 660; border.width = 400; border.height = 180;
    border.fills = [];
    border.strokes = [{ strokeColor: BORDER, strokeWidth: 1, strokeStyle: "solid", strokeAlignment: "center" }];
    board.appendChild(border);
    rect(board, "card " + i + " accent", cx, 660, 400, 6, ORANGE);
    label(board, "card " + i + " title", c[0], cx + 28, 692, 344, {
      size: 22, weight: "700", color: DARK,
    });
    label(board, "card " + i + " body", c[1], cx + 28, 730, 344, { size: 15, color: GRAY });
  });

  return { page: page.name, board: board.name, shapes: 30 };
}

// ---------- message handling ----------
penpot.ui.onMessage((message) => {
  try {
    if (message.type === "test-hero") {
      const result = generateTestHero();
      penpot.ui.sendMessage({ type: "done", ok: true, detail: "Drew '" + result.board + "' on page '" + result.page + "'." });
    } else {
      penpot.ui.sendMessage({ type: "done", ok: false, detail: "Unknown command: " + message.type });
    }
  } catch (err) {
    penpot.ui.sendMessage({ type: "done", ok: false, detail: "Error: " + (err && err.message ? err.message : String(err)) });
  }
});
