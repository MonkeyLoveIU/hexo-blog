---
title: 初雪物语2
date: 2025-12-12
cover: /covers/fifteen.webp
urlname: xuemo
categories: 雪
tags:
  - 初雪
excerpt: 谁言天公不好客。
---


{% raw %}
<div class="custom-snow-post">
  <style>
    /* 所有的样式前面都加了 .custom-snow-post 以限制范围 */
    .custom-snow-post {
      font-family: 'Georgia', 'STHeiti', serif;
      background: linear-gradient(135deg, #c9b4b3ff 0%, #c3cfe2 100%);
      color: #2c3e50;
      line-height: 1.8;
      position: relative;
      border-radius: 10px;
      overflow: hidden; /* 防止雪花飘到文章外面 */
      padding: 20px;
    }

    /* 雪花动画 */
    @keyframes snowfall-local {
      0% { transform: translateY(-10px) translateX(0); opacity: 1; }
      100% { transform: translateY(600px) translateX(50px); opacity: 0; }
    }

    .custom-snow-post .snowflake {
      position: absolute; /* 改为 absolute 以便限制在框内 */
      top: -20px;
      color: white;
      font-size: 1.5em;
      opacity: 0.8;
      pointer-events: none;
      animation: snowfall-local linear infinite;
      z-index: 1;
      text-shadow: 0 0 5px rgba(0,0,0,0.1);
    }

    .custom-snow-post .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 40px 0;
      border-bottom: 2px solid rgba(44, 62, 80, 0.2);
    }

    .custom-snow-post .title {
      font-size: 28px;
      font-weight: 300;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .custom-snow-post .content {
      background: rgba(255, 255, 255, 0.6);
      padding: 30px;
      border-radius: 8px;
      backdrop-filter: blur(5px);
      z-index: 2;
      position: relative;
    }
    
    .custom-snow-post .quote-section {
      margin: 30px 0;
      padding: 20px;
      border-left: 4px solid #3498db;
      background: rgba(255,255,255,0.5);
    }
    
    .custom-snow-post .highlight {
      color: #e74c3c;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
  </style>

  <div id="localSnowContainer"></div>

  <div class="header">
    <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 10px;">2025年12月 · 初雪</div>
    <h1 class="title">谁言天公不好客<br>漫天飞雪送一人</h1>
  </div>

  <div class="content">
    <p>醒来打开手机，看了会，等出去洗漱才发现窗外的景已成雪染。</p>
    <p>今年的第一场雪这么的猝不及防。</p>
    <p>转眼已经在家里呆了一年了。</p>
    <p>这一年的我改变了多少，做了些什么，只有我自己知道。</p>
    <p>悔吗？那是当然了。恨吗？那也是当然了。</p>
    <p>可生活依然是要继续的。</p>
    <p>这两天刷到这么一句诗词：</p>
    <div class="quote-section">
      
      <div style="font-size: 20px; margin-top: 10px; font-style: italic;">“谁言天公不好客，漫天飞雪送一人”</div>
    </div>

    <p>我没有那么好的向往。</p>
    
    <div class="highlight">
      须知，往后续写<br>写少年的茫然，失意，无能为力
    </div>
  </div>

  <script>
    (function(){
      // 这里的脚本只在当前div范围内运行
      const container = document.querySelector('.custom-snow-post');
      const snowContainer = document.getElementById('localSnowContainer');
      
      function createSnowflake() {
        if(!container || !snowContainer) return;
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        
        // 限制在容器宽度内
        const randomLeft = Math.random() * container.offsetWidth;
        const randomDuration = Math.random() * 5 + 5; 
        
        snowflake.style.left = randomLeft + 'px';
        snowflake.style.animationDuration = randomDuration + 's';
        
        snowContainer.appendChild(snowflake);
        
        setTimeout(() => snowflake.remove(), randomDuration * 1000);
      }
      
      // 稍微减少一点雪量，避免卡顿
      const interval = setInterval(createSnowflake, 500);
      
      // 简单的清理机制（可选）
      // if (window.location.pathname !== currentPath) clearInterval(interval);
    })();
  </script>
</div>
{% endraw %}