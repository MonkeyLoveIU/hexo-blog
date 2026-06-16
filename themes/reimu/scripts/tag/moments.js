/**
 * {% moments datafile %}
 * 朋友圈风格碎碎念
 */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const template = ({ content, time, images, location }) => {
  const imageHtml = images && images.length > 0 ? 
    `<div class="moments-images">
      ${images.map(img => `<img src="${img}" class="moments-image" loading="lazy">`).join('')}
    </div>` : '';
  const ts = Date.now();
  const uniqueId = `moment-${time.replace(/[\s:]/g, '-')}-${ts}`;

  return `<div class="moments-item" data-aos="fade-up" id="${uniqueId}">
    <div class="moments-header">
      <div class="moments-avatar">
        <img src="https://img.monkeyiu.icu/{year}/{month}/{md5}.{extName}/20260616064532250.webp" alt="avatar" loading="lazy">
      </div>
      <div class="moments-user-info">
        <span class="moments-username">Monkey Love IU</span>
        <span class="moments-time">${time}</span>
      </div>
    </div>
    <div class="moments-body">
      <div class="moments-text">${content}</div>
      ${imageHtml}
      ${location ? `<div class="moments-location">${location}</div>` : ''}
    </div>
    <div class="moments-actions">
      <button class="moments-like-btn" data-moment-id="${uniqueId}">
        <svg class="moments-like-icon" viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span class="moments-like-count">赞</span>
      </button>
      <button class="moments-comment-toggle" data-target="${uniqueId}">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>评论</span>
      </button>
    </div>
    <div class="moments-comments-wrapper" style="display:none">
      <div id="waline-${uniqueId}" class="moments-comments"></div>
    </div>
  </div>`;
};

const loadFile = (arg) => {
  if (arg) {
    let filepath = path.join(hexo.source_dir, arg);
    if (fs.existsSync(filepath)) {
      let content = fs.readFileSync(filepath);
      if (!content) return;
      let load = yaml.load(content);
      if (!load) return;
      return insertHtml(load);
    }
  }
};

const insertHtml = (load) => {
  let content = `<div class="moments-wrap">`;
  load.forEach((item, index) => {
    if (!item.content) return;
    content += template(item);
  });
  content += `</div>`;
  return content;
};

hexo.extend.tag.register("moments", (args) => {
  return loadFile(args[0]);
});