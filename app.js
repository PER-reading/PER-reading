const CSV_PATH = "per/PER_TEST/master_60.csv";

const personA = document.getElementById("personA");
const personB = document.getElementById("personB");
const result = document.getElementById("result");
const diagnoseBtn = document.getElementById("diagnoseBtn");
const scoreValue = document.getElementById("scoreValue");
const scoreGauge = document.getElementById("scoreGauge");

let kanshiList = [];

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/).map((line) => line.split(","));
  return rows.slice(1).map(([no, kanshi]) => ({
    no: Number(no),
    kanshi: (kanshi || "").trim(),
  })).filter((row) => row.no && row.kanshi);
}

function relationType(diff) {
  if (diff === 0) return "同一型";
  if (diff % 12 === 0) return "同支連動型";
  if (diff % 10 === 0) return "同干共鳴型";
  if (diff % 6 === 0) return "対向刺激型";
  return "通常相性";
}

function calcScore(cyclicalDiff) {
  return Math.max(40, 100 - Math.round((cyclicalDiff / 30) * 60));
}

function fillSelects(list) {
  for (const item of list) {
    const label = `${item.no}. ${item.kanshi}`;
    personA.add(new Option(label, String(item.no)));
    personB.add(new Option(label, String(item.no)));
  }
  personB.selectedIndex = 1;
}

function diagnose() {
  const aNo = Number(personA.value);
  const bNo = Number(personB.value);
  const a = kanshiList.find((x) => x.no === aNo);
  const b = kanshiList.find((x) => x.no === bNo);

  if (!a || !b) {
    result.textContent = "選択値が不正です。";
    scoreValue.textContent = "--";
    scoreGauge.style.setProperty("--score", 0);
    return;
  }

  const diff = Math.abs(a.no - b.no);
  const cyclicalDiff = Math.min(diff, 60 - diff);
  const type = relationType(cyclicalDiff);
  const score = calcScore(cyclicalDiff);

  scoreValue.textContent = `${score}`;
  scoreGauge.style.setProperty("--score", score);
  result.innerHTML = `
    <strong>${a.kanshi}</strong> × <strong>${b.kanshi}</strong><br>
    差分: ${diff}（60循環上の最短差: ${cyclicalDiff}）<br>
    判定: <strong>${type}</strong><br>
    リーディング: 価値観のテンポを揃えるほど、相性の伸びしろが開きます。
  `;
}

async function init() {
  try {
    const res = await fetch(CSV_PATH);
    if (!res.ok) throw new Error(`CSVの取得に失敗: ${res.status}`);
    kanshiList = parseCsv(await res.text());
    fillSelects(kanshiList);
    result.textContent = `CSV読込完了: ${kanshiList.length}件`;
  } catch (err) {
    result.textContent = `${err.message}。python3 -m http.server 5173 で起動してください。`;
  }
}

diagnoseBtn.addEventListener("click", diagnose);
init();
