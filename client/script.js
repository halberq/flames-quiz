const FLAMES_RESULTS = ["Fubu", "Lover", "Affection", "Marriage", "Enemy", "Sibling"];

function calculateFlames(name1, name2) {
  const clean = (s) => s.toLowerCase().replace(/[^a-z]/g, "").split("");
  const a = clean(name1);
  const b = clean(name2);

  for (const ch of [...a]) {
    const idx = b.indexOf(ch);
    if (idx !== -1) {
      b.splice(idx, 1);
      a.splice(a.indexOf(ch), 1);
    }
  }

  const count = a.length + b.length;
  if (count === 0) return { count, result: null }; 

  const pool = [...FLAMES_RESULTS];
  let i = 0;
  while (pool.length > 1) {
    i = (i + count - 1) % pool.length;
    pool.splice(i, 1);
  }

  return { count, result: pool[0] };
}

document.querySelector("#flames-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const n1 = document.querySelector("#name1").value;
  const n2 = document.querySelector("#name2").value;
  const { result } = calculateFlames(n1, n2);
  document.querySelector("#output").textContent = result ?? "Same letters. Try different names!";
});