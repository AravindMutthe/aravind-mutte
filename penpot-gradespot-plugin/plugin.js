// GradeSpot Designer — Penpot plugin (no server needed).
// Generates GradeSpot website designs directly on the canvas.

penpot.ui.open("GradeSpot Designer", "index.html?theme=" + penpot.theme, {
  width: 300,
  height: 460,
});

let lastStep = "";
function progress(step) {
  lastStep = step;
  penpot.ui.sendMessage({ type: "progress", detail: step });
}

// ---------- helpers ----------
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
  r.strokes = [{
    strokeColor: strokeColor,
    strokeWidth: strokeWidth,
    strokeStyle: "solid",
    strokeAlignment: "center",
  }];
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
  const ORANGE = "#EA580C";
  const DARK = "#111827";
  const GRAY = "#4B5563";
  const LIGHT = "#FFF7ED";
  const BORDER = "#E5E7EB";
  let shapes = 0;
  const count = (s) => { shapes++; return s; };

  progress("Creating 1440×900 board…");
  // Draw on the currently active page: Penpot plugins can only modify the
  // active page, and page switches don't take effect synchronously.
  const targetPage = penpot.currentPage;
  const board = penpot.createBoard();
  board.name = "Homepage - Test Hero";
  board.resize(1440, 900);
  board.x = 0; board.y = 0;
  board.fills = [{ fillColor: "#FFFFFF" }];

  // nav
  progress("Drawing navbar…");
  count(rect(board, "nav bg", 0, 0, 1440, 72, "#FFFFFF"));
  count(rect(board, "nav border", 0, 71, 1440, 1, BORDER));
  count(label(board, "logo", "GradeSpot", 80, 18, 240, { size: 28, weight: "700", color: ORANGE }));
  const links = ["Home", "Courses", "About", "Contact"];
  links.forEach((l, i) => {
    count(label(board, "nav " + l, l, 640 + i * 110, 26, 100, { size: 16, color: GRAY }));
  });
  button(board, "nav cta", 1220, 14, 140, 44, "Enroll Now", ORANGE, "#FFFFFF");
  shapes += 2;

  // hero
  progress("Drawing hero section…");
  count(rect(board, "hero bg", 0, 72, 1440, 528, LIGHT));
  count(label(board, "eyebrow", "HYDERABAD  •  IT TRAINING", 80, 140, 500, {
    size: 14, weight: "700", color: ORANGE,
  }));
  count(label(board, "headline", "Job-ready IT skills, taught the practical way.", 80, 168, 620, {
    size: 54, weight: "700", color: DARK,
  }));
  count(label(board, "subhead",
    "Classroom & online training in DevOps, Cloud, Cybersecurity and Web Development - with real projects, not just slides.",
    80, 330, 560, { size: 18, color: GRAY }));
  button(board, "hero cta 1", 80, 430, 200, 52, "Explore Courses", ORANGE, "#FFFFFF");
  shapes += 2;
  count(rect(board, "hero cta 2 bg", 296, 430, 160, 52, "#FFFFFF"));
  count(outlinedRect(board, "hero cta 2 border", 296, 430, 160, 52, ORANGE, 2));
  count(label(board, "hero cta 2 label", "Talk to Us", 296, 447, 160, {
    size: 16, weight: "700", color: ORANGE, align: "center",
  }));

  // hero visual placeholder
  count(rect(board, "hero visual", 880, 140, 480, 380, ORANGE));
  count(label(board, "hero visual label", "Hero visual", 880, 310, 480, {
    size: 24, weight: "700", color: "#FFFFFF", align: "center",
  }));

  // feature cards
  progress("Drawing feature cards…");
  const cards = [
    ["DevOps & Cloud", "CI/CD, Kubernetes, AWS & Azure - hands-on labs."],
    ["Cyber Security", "Ethical hacking & SOC skills with live practice."],
    ["Web Development", "Modern full-stack builds, portfolio-ready."],
  ];
  cards.forEach((c, i) => {
    const cx = 80 + i * 440;
    count(rect(board, "card " + i + " bg", cx, 660, 400, 180, "#FFFFFF"));
    count(outlinedRect(board, "card " + i + " border", cx, 660, 400, 180, BORDER, 1));
    count(rect(board, "card " + i + " accent", cx, 660, 400, 6, ORANGE));
    count(label(board, "card " + i + " title", c[0], cx + 28, 692, 344, {
      size: 22, weight: "700", color: DARK,
    }));
    count(label(board, "card " + i + " body", c[1], cx + 28, 730, 344, { size: 15, color: GRAY }));
  });

  return { page: targetPage ? targetPage.name : "current page", board: board.name, shapes: shapes };
}

// ---------- message handling ----------
// Penpot's bridge sends internal messages (e.g. {type:"success"}) — ignore them.
penpot.ui.onMessage((message) => {
  if (!message || typeof message.type !== "string") return;
  if (message.type === "test-hero") {
    try {
      const result = generateTestHero();
      penpot.ui.sendMessage({
        type: "done", ok: true,
        detail: "Drew '" + result.board + "' (" + result.shapes + " shapes) on page '" + result.page + "'.",
      });
    } catch (err) {
      penpot.ui.sendMessage({
        type: "done", ok: false,
        detail: "Error at '" + lastStep + "': " + (err && err.message ? err.message : String(err)),
      });
    }
  }
  // all other message types are ignored silently
});
