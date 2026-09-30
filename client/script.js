const FLAMES = [
  { key: "F", label: "Fubu" },
  { key: "L", label: "Lover" },
  { key: "A", label: "Affection" },
  { key: "M", label: "Marriage" },
  { key: "E", label: "Enemy" },
  { key: "S", label: "Sibling" },
];

const $ = (sel) => document.querySelector(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let runId = 0; // lets a restart cancel an animation in progress

const clean = (s) => s.toLowerCase().replace(/[^a-z]/g, "").split("");

function cancelLetters(a, b) {
  const crossedA = a.map(() => false);
  const crossedB = b.map(() => false);
  const pairs = [];
  a.forEach((ch, i) => {
    const j = b.findIndex((c, k) => c === ch && !crossedB[k]);
    if (j !== -1) {
      crossedA[i] = crossedB[j] = true;
      pairs.push([i, j]);
    }
  });
  const count = crossedA.filter((x) => !x).length + crossedB.filter((x) => !x).length;
  return { pairs, count };
}

function eliminate(count) {
  const pool = FLAMES.map((_, i) => i);
  const order = [];
  let i = 0;
  while (pool.length > 1) {
    i = (i + count - 1) % pool.length;
    order.push(pool.splice(i, 1)[0]);
  }
  return { order, winner: pool[0] };
}

function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

function renderTiles(container, chars) {
  container.innerHTML = "";
  return chars.map((ch) => {
    const t = document.createElement("span");
    t.className = "tile";
    t.textContent = ch;
    container.appendChild(t);
    return t;
  });
}

async function play(name1, name2) {
  const id = ++runId;
  const a = clean(name1);
  const b = clean(name2);
  const { pairs, count } = cancelLetters(a, b);

  show("#page-cancel");
  $("#reveal-btn").classList.add("hidden");
  $("#count-text").textContent = "";
  const tilesA = renderTiles($("#letters-a"), a);
  const tilesB = renderTiles($("#letters-b"), b);

  await wait(700);
  for (const [i, j] of pairs) {
    if (id !== runId) return;
    tilesA[i].classList.add("crossed");
    tilesB[j].classList.add("crossed");
    await wait(450);
  }
  if (id !== runId) return;

  if (count === 0) {
    $("#count-text").textContent = "Every letter matched! Try two different names.";
    $("#reveal-btn").textContent = "Try again";
    $("#reveal-btn").classList.remove("hidden");
    $("#reveal-btn").onclick = restart;
    return;
  }

  $("#count-text").textContent = `${count} letter${count === 1 ? "" : "s"} left`;
  $("#reveal-btn").textContent = "Count through FLAMES";
  $("#reveal-btn").classList.remove("hidden");
  $("#reveal-btn").onclick = () => runElimination(count, id);
}

async function runElimination(count, id) {
  show("#page-result");
  $("#final").classList.add("hidden");
  const row = $("#flames-row");
  row.innerHTML = "";
  const cards = FLAMES.map((f) => {
    const c = document.createElement("div");
    c.className = "flame";
    c.innerHTML = `<b>${f.key}</b><small>${f.label}</small>`;
    row.appendChild(c);
    return c;
  });

  const { order, winner } = eliminate(count);
  await wait(700);
  for (const idx of order) {
    if (id !== runId) return;
    cards[idx].classList.add("counting");
    await wait(650);
    cards[idx].classList.remove("counting");
    cards[idx].classList.add("out");
    await wait(450);
  }
  if (id !== runId) return;

  cards[winner].classList.add("winner");
  await wait(600);
  $("#result-message").textContent = FLAMES[winner].label;
  $("#final").classList.remove("hidden");
}

function restart() {
  runId++;
  $("#name1").value = "";
  $("#name2").value = "";
  $("#form-error").textContent = "";
  show("#page-names");
  $("#name1").focus();
}

$("#names-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const n1 = $("#name1");
  const n2 = $("#name2");
  const bad = [n1, n2].filter((el) => clean(el.value).length === 0);
  n1.classList.remove("err");
  n2.classList.remove("err");
  if (bad.length) {
    bad.forEach((el) => {
      void el.offsetWidth; // restart shake animation
      el.classList.add("err");
    });
    $("#form-error").textContent = "Please enter two names (letters only).";
    return;
  }
  $("#form-error").textContent = "";
  play(n1.value, n2.value);
});

$("#restart-btn").addEventListener("click", restart);