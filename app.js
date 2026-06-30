let cur = 0, score = 0, answered = false, results = [];
let elapsed = 0, timerID = null;

function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}

function stopTimer(){clearInterval(timerID);timerID=null}

function startTimer(){
  stopTimer();
  timerID = setInterval(() => {
    elapsed++;
    const left = Math.max(0, TOTAL_TIME - elapsed);
    const el = document.getElementById('timer-val');
    const card = document.getElementById('timer-card');
    if(el) el.textContent = fmt(left);
    if(card){left <= 15 ? card.classList.add('urgent') : card.classList.remove('urgent')}
    if(left <= 0){stopTimer(); autoFail()}
  }, 25000);
}

function autoFail(){
  if(answered) return;
  answered = true; results.push(false);
  document.querySelectorAll('.opt').forEach(b => b.disabled = true);
  document.querySelectorAll('.opt')[Qs[cur].ans].classList.add('reveal');
  showFeedback(false, "Time's up! Moving on.");
  showExpl(); showNext(); updateSummary();
}

function render(){
  const app = document.getElementById('app');
  if(cur >= Qs.length){renderResult(app); return}
  const q = Qs[cur];
  const pct = Math.round((cur / Qs.length) * 100);
  const left = Math.max(0, TOTAL_TIME - elapsed);
  
  app.innerHTML = `
    <div class="page-header">
      <div class="page-title">Quiz Module</div>
      <div class="page-sub">Test your knowledge and challenge yourself.</div>
    </div>
    <div class="stat-row">
      <div class="stat-card"><div class="icon">🏆</div><div><div class="label">Score</div><div class="val" id="score-val">${score}</div></div></div>
      <div class="stat-card"><div class="icon">🎯</div><div><div class="label">Progress</div><div class="val">${cur+1} / ${Qs.length}</div></div></div>
      <div class="stat-card" id="timer-card"><div class="icon">⏱️</div><div><div class="label">Time</div><div class="val" id="timer-val">${fmt(left)}</div></div></div>
    </div>
    <div class="main-grid">
      <div class="q-panel fade-up">
        <div class="q-meta">Question ${cur+1} of ${Qs.length}</div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="q-text">${q.q}</div>
        <div class="options">
          ${q.opts.map((o,i) => `
            <button class="opt" onclick="choose(${i})">
              <span class="opt-key">${KEYS[i]}</span>
              <span>${o}</span>
            </button>`).join('')}
        </div>
        <div class="feedback" id="feedback">
          <div class="fb-dot"></div>
          <span id="fb-text"></span>
        </div>
        <div class="explanation" id="explanation">💡 &nbsp;${q.why}</div>
        <button class="next-btn" id="next-btn" onclick="nextQ()" disabled>
          ${cur === Qs.length-1 ? 'Finish Quiz →' : 'Next Question →'}
        </button>
      </div>
      <div class="summary-panel">
        <div class="summary-title">Quiz Summary</div>
        <div class="q-dots" id="q-dots">${dotHTML()}</div>
        <div class="ring-wrap">
          <svg width="170" height="170" viewBox="0 0 170 170">
            <circle class="ring-bg" cx="85" cy="85" r="66" stroke-width="11"/>
            <circle class="ring-fill" cx="85" cy="85" r="66"
              stroke-width="11"
              stroke="#16a34a"
              stroke-dasharray="${2*Math.PI*66}"
              stroke-dashoffset="${2*Math.PI*66-(score/Qs.length)*2*Math.PI*66}"
              transform="rotate(-90 85 85)" id="score-ring"/>
            <text x="85" y="81" text-anchor="middle"
              font-family="Inter,sans-serif" font-size="24" font-weight="700" fill="#111827"
              id="ring-pct">${Math.round((score/Qs.length)*100)}%</text>
            <text x="85" y="101" text-anchor="middle"
              font-family="Inter,sans-serif" font-size="12" fill="#9ca3af">accuracy</text>
          </svg>
        </div>
        <div class="summary-stats">
          <div><div class="ss-val green" id="ss-c">${score}</div><div class="ss-lbl">Correct</div></div>
          <div><div class="ss-val red" id="ss-w">${results.length-score}</div><div class="ss-lbl">Wrong</div></div>
          <div><div class="ss-val blue" id="ss-r">${Qs.length-results.length}</div><div class="ss-lbl">Remaining</div></div>
        </div>
      </div>
    </div>`;
  answered = false;
  startTimer();
}

function dotHTML(){
  return Qs.map((_,i) => {
    let cls = 'q-dot';
    if(i < results.length) cls += results[i] ? ' correct' : ' wrong';
    else if(i === cur) cls += ' active';
    return `<div class="${cls}">${i+1}</div>`;
  }).join('');
}

function updateSummary(){
  const circ = 2 * Math.PI * 66;
  const pct = Math.round((score / Qs.length) * 100);
  const ring = document.getElementById('score-ring');
  if(ring) ring.style.strokeDashoffset = circ - (score / Qs.length) * circ;
  const rp = document.getElementById('ring-pct'); if(rp) rp.textContent = pct + '%';
  const sc = document.getElementById('ss-c'); if(sc) sc.textContent = score;
  const sw = document.getElementById('ss-w'); if(sw) sw.textContent = results.length - score;
  const sr = document.getElementById('ss-r'); if(sr) sr.textContent = Qs.length - results.length;
  const sv = document.getElementById('score-val'); if(sv) sv.textContent = score;
  const dots = document.getElementById('q-dots'); if(dots) dots.innerHTML = dotHTML();
}

function choose(idx){
  if(answered) return;
  answered = true; stopTimer();
  const ok = idx === Qs[cur].ans;
  if(ok) score++;
  results.push(ok);
  
  document.querySelectorAll('.opt').forEach((b,i) => {
    b.disabled = true;
    if(i === idx) b.classList.add(ok ? 'sel-correct' : 'sel-wrong');
    if(!ok && i === Qs[cur].ans) b.classList.add('reveal');
  });
  
  showFeedback(ok, ok ? 'Correct! Great job.' : 'Incorrect — see the explanation below.');
  showExpl(); showNext(); updateSummary();
}

function showFeedback(ok,msg){
  const fb = document.getElementById('feedback');
  const tx = document.getElementById('fb-text');
  fb.className = 'feedback show ' + (ok ? 'ok' : 'bad');
  tx.textContent = msg;
}

function showExpl(){const e=document.getElementById('explanation');if(e) e.classList.add('show')}
function showNext(){const b=document.getElementById('next-btn');if(b) b.disabled=false}
function nextQ(){cur++;render()}

function renderResult(app){
  stopTimer();
  const pct = Math.round((score / Qs.length) * 100);
  let emoji = '😐', title = 'Almost there!', sub = "A bit more practice and you'll nail it.";
  
  if(pct === 100){emoji = '🏆'; title = 'Perfect score!'; sub = 'Outstanding! You know JavaScript inside out.'}
  else if(pct >= 80){emoji = '🎉'; title = 'Great job!'; sub = 'Solid understanding of JavaScript fundamentals.'}
  else if(pct >= 60){emoji = '👍'; title = 'Good effort!'; sub = "You're on the right track — review the ones you missed."}
  else if(pct < 40){emoji = '📚'; title = 'Keep going!'; sub = 'Go over the explanations and try again.'}
  
  const circ = 2 * Math.PI * 66;
  const offset = circ - (pct / 100) * circ;
  
  app.innerHTML = `
    <div class="page-header">
      <div class="page-title">Quiz Module</div>
      <div class="page-sub">Quiz complete — here are your results.</div>
    </div>
    <div class="result-wrap fade-up">
      <span class="result-emoji">${emoji}</span>
      <div class="result-title">${title}</div>
      <p class="result-sub">${sub}</p>
      <div style="display:flex;justify-content:center;margin-bottom:1.75rem">
        <svg width="170" height="170" viewBox="0 0 170 170">
          <circle cx="85" cy="85" r="66" stroke-width="11" stroke="#e5e7eb" fill="none"/>
          <circle cx="85" cy="85" r="66" stroke-width="11"
            stroke="#16a34a" fill="none" stroke-linecap="butt"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ}"
            transform="rotate(-90 85 85)" id="final-ring"/>
          <text x="85" y="81" text-anchor="middle"
            font-family="Inter,sans-serif" font-size="28" font-weight="700" fill="#111827">${pct}%</text>
          <text x="85" y="101" text-anchor="middle"
            font-family="Inter,sans-serif" font-size="12" fill="#9ca3af">${score} / ${Qs.length} correct</text>
        </svg>
      </div>
      <div class="result-stats">
        <div class="r-stat green"><div class="rv">${score}</div><div class="rl">Correct</div></div>
        <div class="r-stat red"><div class="rv">${Qs.length-score}</div><div class="rl">Wrong</div></div>
        <div class="r-stat blue"><div class="rv">${pct}%</div><div class="rl">Score</div></div>
      </div>
      <div class="review-section">
        <div class="review-heading">Question breakdown</div>
        ${results.map((ok,i) => `
          <div class="review-row ${ok ? 'c' : 'w'}">
            <span>${ok ? '✅' : '❌'}</span>
            <span class="rq">Q${i+1}: ${Qs[i].tag} — ${Qs[i].opts[Qs[i].ans]}</span>
            <span class="rb">${ok ? '+1 pt' : '0 pt'}</span>
          </div>`).join('')}
      </div>
      <button class="restart-btn" onclick="restart()">↺ &nbsp;Try Again</button>
    </div>`;
    
  setTimeout(() => {
    const r = document.getElementById('final-ring');
    if(r){r.style.transition='stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)'; r.style.strokeDashoffset = offset}
  }, 150);
}

function restart(){cur = 0; score = 0; answered = false; results = []; elapsed = 0; render()}

// Initialize app
render();
