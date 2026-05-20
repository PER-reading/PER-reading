(function () {
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const QUESTIONS = [
    { q: '恋愛で重視するのは？', A: '安定', B: '刺激' },
    { q: '決断の速度は？', A: '慎重', B: '直感' },
    { q: '仕事スタイルは？', A: '段取り', B: '突破' },
    { q: '疲れた時は？', A: '一人時間', B: '誰かに相談' },
    { q: '理想の関係は？', A: '信頼継続', B: '共鳴成長' }
  ];

  const TYPES = {
    AA: { title: '静心調和型', feature: '安心を育てる共感力', strength: '信頼形成・継続力', caution: '慎重すぎる停滞' },
    AB: { title: '月光創造型', feature: '柔らかい革新性', strength: '変化適応', caution: '感情の振れ幅' },
    BA: { title: '陽炎推進型', feature: '行動先行の実行力', strength: '突破力', caution: '対話不足' },
    BB: { title: '天麗共鳴型', feature: '惹きつける華やかさ', strength: '魅力拡散', caution: '持続設計' }
  };

  const PAIR_RULES = {
    '子-巳': { type: 'すれ違い型', comment: '惹かれるが距離調整が鍵。' },
    '卯-巳': { type: '補完信頼型', comment: '違いが支え合いに変わる。' },
    '午-酉': { type: 'すれ違い型', comment: '価値観のすり合わせが重要。' },
    '丑-卯': { type: '静かな共存型', comment: '静かな安心を育てる相性。' }
  };

  function cyclicalDistance(a, b) {
    const diff = Math.abs(a - b);
    return Math.min(diff, 60 - diff);
  }

  function kanshiNo(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return null;
    const base = new Date('1900-01-01T00:00:00');
    const days = Math.floor((date - base) / 86400000);
    return ((days % 60) + 60) % 60 + 1;
  }

  function kanshiLabel(no) {
    return `${STEMS[(no - 1) % 10]}${BRANCHES[(no - 1) % 12]}`;
  }

  function compatibility(no1, no2) {
    const b1 = BRANCHES[(no1 - 1) % 12];
    const b2 = BRANCHES[(no2 - 1) % 12];
    const pair = PAIR_RULES[`${b1}-${b2}`] || PAIR_RULES[`${b2}-${b1}`] || { type: '努力成長型', comment: '歩み寄りで伸びる関係。' };
    const dist = cyclicalDistance(no1, no2);
    const score = Math.max(55, 100 - Math.round((dist / 30) * 45));
    return { pair, score, b1, b2, dist };
  }

  function drawCircle(canvas, active) {
    const x = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2, r = 145;
    x.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 1; i <= 60; i++) {
      const a = (Math.PI * 2 / 60) * i - Math.PI / 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      x.fillStyle = i === active ? '#c793ff' : '#7d5ea0';
      x.beginPath();
      x.arc(px, py, i === active ? 5 : 2.5, 0, Math.PI * 2);
      x.fill();
    }
  }

  function drawRadar(canvas, vals) {
    const g = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2, max = 130;
    g.clearRect(0, 0, canvas.width, canvas.height);
    for (let l = 1; l <= 5; l++) {
      g.strokeStyle = 'rgba(255,255,255,.2)';
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i - Math.PI / 2;
        const rr = max * l / 5;
        const px = cx + Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr;
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.closePath();
      g.stroke();
    }
    g.fillStyle = 'rgba(203,154,255,.45)';
    g.beginPath();
    vals.forEach((v, i) => {
      const a = (Math.PI * 2 / 6) * i - Math.PI / 2;
      const rr = max * (v / 100);
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    });
    g.closePath();
    g.fill();
  }

  function boot(root) {
    const questionEl = root.querySelector('[data-per-question]');
    const progress = root.querySelector('[data-per-progress]');
    const startBtn = root.querySelector('[data-per-start]');
    const nextBtn = root.querySelector('[data-per-next]');
    const answerBtns = root.querySelectorAll('[data-per-answer]');
    const selfDob = root.querySelector('[data-per-self-dob]');
    const partnerDob = root.querySelector('[data-per-partner-dob]');
    const circle = root.querySelector('[data-per-circle]');
    const radar = root.querySelector('[data-per-radar]');
    const feedback = root.querySelector('[data-per-feedback]');

    let idx = 0, selected = 'A';
    const answers = [];

    const renderQ = () => {
      questionEl.textContent = QUESTIONS[idx] ? `${idx + 1}. ${QUESTIONS[idx].q}` : '回答完了。次へで結果を表示します。';
      progress.style.width = `${(idx / QUESTIONS.length) * 100}%`;
    };

    answerBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        selected = btn.dataset.perAnswer;
        answerBtns.forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
      });
    });

    startBtn?.addEventListener('click', () => {
      root.querySelector('[data-per-diagnosis]').scrollIntoView({ behavior: 'smooth' });
    });



    root.querySelectorAll('[data-per-share]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = btn.getAttribute('data-per-share');
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('PER Readingで相性診断しました');
        const links = {
          line: `https://social-plugins.line.me/lineit/share?url=${url}`,
          x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
          instagram: 'https://www.instagram.com/'
        };
        const target = links[kind];
        if (target) window.open(target, '_blank', 'noopener,noreferrer');
      });
    });

    const copyBtn = root.querySelector('[data-per-copy]');
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (feedback) {
          feedback.textContent = 'リンクをコピーしました。';
          feedback.hidden = false;
        }
      } catch (e) {
        if (feedback) {
          feedback.textContent = 'コピーに失敗しました。';
          feedback.hidden = false;
        }
      }
    });
    nextBtn?.addEventListener('click', () => {
      if (idx < QUESTIONS.length) {
        answers[idx] = selected;
        idx += 1;
        renderQ();
      }
      if (idx === QUESTIONS.length) {
        const n1 = kanshiNo(selfDob.value);
        const n2 = kanshiNo(partnerDob.value);
        if (!n1 || !n2) {
          if (feedback) {
            feedback.textContent = '生年月日を正しく入力してください。';
            feedback.hidden = false;
          }
          return;
        }
        if (feedback) feedback.hidden = true;
        const key = `${answers[0] || 'A'}${answers[1] || 'A'}`;
        const t = TYPES[key] || TYPES.AA;
        const c = compatibility(n1, n2);

        root.querySelector('[data-per-result]').hidden = false;
        root.querySelector('[data-per-compat]').hidden = false;
        root.querySelector('[data-per-universe]').hidden = false;
        root.querySelector('[data-per-type-title]').textContent = t.title;
        root.querySelector('[data-per-type-feature]').textContent = `特徴: ${t.feature}`;
        root.querySelector('[data-per-type-strength]').textContent = `強み: ${t.strength}`;
        root.querySelector('[data-per-type-caution]').textContent = `注意点: ${t.caution}`;
        root.querySelector('[data-per-report]').textContent = `あなた:${kanshiLabel(n1)} / お相手:${kanshiLabel(n2)} / 相性:${c.pair.type}`;
        root.querySelector('[data-per-compat-score]').textContent = `${c.score}点`;
        root.querySelector('[data-per-compat-type]').textContent = c.pair.type;
        root.querySelector('[data-per-compat-text]').textContent = c.pair.comment;
        drawCircle(circle, n1);
        drawRadar(radar, [c.score, 78, 84, 72, 88, 80]);
      }
    });

    renderQ();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-per-app]').forEach(boot);
  });
})();
