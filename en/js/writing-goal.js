(()=>{let fmt=n=>1e4<=n?(n/1e4).toFixed(1)+"万":1e3<=n?(n/1e3).toFixed(1)+"k":String(n),C=2*Math.PI*45,init=()=>{let el=document.getElementById("writing-goal-widget");el&&fetch("/writing-stats.json").then(r=>r.json()).then(data=>((el,data)=>{var pct=Math.min(100,Math.round(data.totalWordsThisYear/data.annualGoal*100)),offset=C-C*pct/100;el.innerHTML=`
      <div class="writing-goal-ring-container">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="writingGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="var(--red-1, #ff5252)" />
              <stop offset="100%" stop-color="var(--red-2, #ff7c7c)" />
            </linearGradient>
          </defs>
          <circle class="writing-goal-ring-bg" cx="50" cy="50" r="45" />
          <circle class="writing-goal-ring-fg" cx="50" cy="50" r="45"
            stroke-dasharray="${C}" stroke-dashoffset="${offset}" />
        </svg>
        <div class="writing-goal-ring-text">
          <div class="writing-goal-percent">${pct}%</div>
          <div class="writing-goal-label">已完成</div>
        </div>
      </div>
      <div class="writing-goal-stats">
        <div class="writing-goal-stat">
          <span class="writing-goal-stat-label">📝 今日日均</span>
          <span class="writing-goal-stat-value">${fmt(data.dailyAverage)} 字</span>
        </div>
        <div class="writing-goal-stat">
          <span class="writing-goal-stat-label">🎯 年度目标</span>
          <span class="writing-goal-stat-value">${fmt(data.totalWordsThisYear)} / ${fmt(data.annualGoal)}</span>
        </div>
        <div class="writing-goal-stat">
          <span class="writing-goal-stat-label">📅 本月发文</span>
          <span class="writing-goal-stat-value">${data.thisMonthPosts} 篇</span>
        </div>
        <div class="writing-goal-stat">
          <span class="writing-goal-stat-label">📚 累计</span>
          <span class="writing-goal-stat-value">${fmt(data.totalWords)} 字 · ${data.totalPosts} 篇</span>
        </div>
      </div>
    `})(el,data)).catch(()=>{el.innerHTML='<div class="writing-goal-loading">暂无数据</div>'})};"loading"===document.readyState?document.addEventListener("DOMContentLoaded",init):init(),document.addEventListener("pjax:complete",()=>setTimeout(init,200))})();