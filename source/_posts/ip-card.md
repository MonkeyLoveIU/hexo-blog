---
title: 访客の网络小情报
date: 2026-5-26 22：00
password: monkey
abstract: 这是一篇加密文章，你得有密码才能偷看。
message: 施主，佛门重地，输入密码方可入内。
cover: https://img.monkeyiu.icu/{year}/{month}/{md5}.{extName}/twelve.webp
urlname: ip-card
categories: 控件
tags:
  - 访客
  - 情报
excerpt: 博客侧边栏
---



# 🕵️ 访客の网络小情报 - 一个有温度的博客侧边栏

> 一个为 Hexo 博客打造的访客信息卡片，集 IP 地理定位、天气查询、智能问候、设备指纹、访客留言、Telegram 实时通知于一身。让每一位到访的朋友，都能感受到博主的用心 ✨

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Hexo](https://img.shields.io/badge/Hexo-5.x-orange)

---

## 📖 项目简介

传统的博客侧边栏只能显示统计数据（PV/UV、文章数等），冷冰冰且千篇一律。

**「访客の网络小情报」** 打破常规，让侧边栏成为博主与访客之间的**温度桥梁**：

- 🌍 **看见** —— 实时展示访客的网络、设备、地理信息
- 💬 **对话** —— 根据地区、时间、天气智能展示"博主の小纸条"
- 👋 **互动** —— 访客可主动留言打招呼，博主立刻收到推送
- 🤖 **守护** —— 通过 Cloudflare Worker 中转，访客信息实时推送到博主手机

---

## ✨ 功能特色

### 🎯 1. 终端风 SVG 卡片
精致的 SVG 风格卡片，自带科幻外星人贴纸，瞬间提升博客逼格。

### 📊 2. 多维度访客情报
- **网络情报**：IP 地址、地理位置、网络类型、带宽、延迟
- **设备情报**：浏览器、操作系统、屏幕分辨率、色深、内存、CPU 核心
- **访问情报**：来源、时间、访问次数（含"老朋友"识别）

### ☁️ 3. 实时天气信息
基于访客 IP 自动识别所在城市，调用 `wttr.in` 接口获取实时天气。

### 💌 4. 博主の小纸条（智能问候）
根据**多维度组合**触发不同问候语：

| 维度 | 示例 |
|------|------|
| **节日彩蛋** | 春节、圣诞节、生日 |
| **特殊时段** | 深夜、清晨、午饭、深夜 |
| **天气感知** | 雨天提醒带伞、雪天提醒保暖 |
| **星期组合** | 周一打气、周五祝福 |
| **新老访客** | 首次欢迎、回访感谢 |
| **地区专属** | 30+ 省份/城市/国家专属问候 |

### 👋 5. 双通道访客互动
- **手动打招呼** → 推送到博主微信（Server 酱）
- **自动访客提醒** → 推送到博主 Telegram（Cloudflare Worker 中转）

### 🛡️ 6. 完善的防护机制
- ✅ 24 小时去重，防止刷新轰炸
- ✅ 自动过滤搜索引擎爬虫
- ✅ 博主本人访问不通知
- ✅ Token 隐藏在 Worker，不暴露前端
- ✅ 留言防刷限制（1 小时 1 次）

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                     访客浏览器                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Hexo 博客侧边栏（ip-card.ejs）                  │   │
│  │  ├─ SVG 卡片（card.net.coffee）                  │   │
│  │  ├─ IP 查询（myip.ipip.net）                     │   │
│  │  ├─ 天气查询（wttr.in）                          │   │
│  │  ├─ 设备/网络/行为信息收集                       │   │
│  │  ├─ 智能问候语匹配引擎                           │   │
│  │  └─ 访客留言表单                                 │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
       手动打招呼                 自动通知
               │                      │
               ▼                      ▼
    ┌──────────────────┐   ┌────────────────────────┐
    │  Server 酱 API   │   │  Cloudflare Worker     │
    │  (sct.ftqq.com)  │   │  (无服务器中转)        │
    └────────┬─────────┘   └───────────┬────────────┘
             │                         │
             ▼                         ▼
    ┌──────────────────┐   ┌────────────────────────┐
    │  📱 博主微信      │   │  📱 博主 Telegram      │
    │  (公众号推送)     │   │  (Bot 实时推送)        │
    └──────────────────┘   └────────────────────────┘
```

---

## 🚀 快速开始

### 前置条件

- Hexo 博客（已运行）
- Telegram 账号（用于接收自动通知）
- 微信（用于接收主动留言）
- Cloudflare 账号（免费）

---

### 第一步：部署 Cloudflare Worker

1. 访问 https://dash.cloudflare.com/，注册账号
2. 进入 **Workers & Pages** → **Create application** → **Hello World**
3. 命名 Worker（如 `sayhello-bot`）→ Deploy
4. **Edit code**，粘贴以下代码：

```javascript
const BOT_TOKEN = '你的 Telegram Bot Token';
const CHAT_ID   = '你的 Chat ID';

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const data = await request.json();
      const text = `
👀 *有访客访问了你的博客*

📍 *位置*：${data.location || '未知'}
☁️ *天气*：${data.weather || '未获取'}
💻 *系统*：${data.os || '未知'}
🌐 *浏览器*：${data.browser || '未知'}
📡 *网络*：${data.network || '未知'}
✋ *输入*：${data.touch || '未知'}
🕐 *时间*：${data.time}
📄 *页面*：${data.page}
      `.trim();

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: text, parse_mode: 'Markdown' })
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false }), { status: 500 });
    }
  }
};
```

5. 替换 Token / Chat ID，点击 **Deploy**
6. 记录 Worker 地址：`https://sayhello-bot.xxx.workers.dev`

---

### 第二步：申请 Server 酱

1. 访问 https://sct.ftqq.com/
2. 微信扫码登录，关注公众号
3. 获取 **SendKey**

---

### 第三步：创建侧边栏组件

在 Hexo 主题的 `widget/` 目录下创建 `ip-card.ejs`，粘贴完整代码（见项目源文件）。

---

### 第四步：在主题配置中启用

打开主题 `_config.yml`，在侧边栏配置中加入：

```yaml
sidebar:
  widgets:
    - ip-card  # 添加这一行
```

---

### 第五步：替换配置

在 `ip-card.ejs` 中找到这两处，替换为你的实际信息：

```javascript
const WORKER_URL = 'https://sayhello-bot.xxx.workers.dev';  // 你的 Worker 地址
const SEND_KEY   = 'SCT123456Txxxxxxxxxxx';                 // 你的 Server 酱 SendKey
const ownerKeywords = ['你的城市'];                          // 不通知自己的城市
```

---

### 第六步：生成部署

```bash
hexo clean && hexo g && hexo d
```

---

## 📂 项目结构

```
your-hexo-blog/
├── themes/
│   └── your-theme/
│       └── layout/
│           └── widget/
│               └── ip-card.ejs          # 🎯 主组件文件
├── _config.yml                          # 主题配置
└── README.md                            # 本文档

cloudflare-worker/
└── worker.js                            # 🎯 Worker 代码（在 CF 后台编辑）
```

---

## 🎨 自定义指南

### 修改地区问候语

打开 `ip-card.ejs`，找到 `const greetings = {...}`：

```javascript
const greetings = {
  '北京': { emoji: '🏛️', message: '帝都的朋友你好！' },
  '上海': { emoji: '🌃', message: '魔都的朋友！' },
  // ★ 添加新地区
  '你的家乡': { emoji: '🏡', message: '你想说的话' }
};
```

### 修改智能问候逻辑

找到 `getSmartGreeting(ctx)` 函数，按需修改判断分支：

```javascript
// 例：添加生日彩蛋
if (month === 8 && date === 15) {
  return { emoji: '🎂', message: '今天是博主的生日！' };
}
```

### 修改自动通知规则

```javascript
// 改成只通知首次访问
if (!ctx.isNew) return;

// 改成 1 小时去重
if (lastNotify && now - parseInt(lastNotify) < 3600 * 1000) return;
```

---

## 🔌 调用的第三方服务

| 服务 | 用途 | 是否免费 |
|------|------|---------|
| [card.net.coffee](https://card.net.coffee) | SVG 卡片生成 | ✅ 免费 |
| [myip.ipip.net](https://myip.ipip.net) | IP 地理位置 | ✅ 免费 |
| [wttr.in](https://wttr.in) | 实时天气 | ✅ 免费无需 Key |
| [Cloudflare Workers](https://workers.cloudflare.com) | 边缘函数 | ✅ 每天 10w 次 |
| [Telegram Bot API](https://core.telegram.org/bots) | 推送通知 | ✅ 完全免费 |
| [Server 酱](https://sct.ftqq.com) | 微信推送 | ⚠️ 免费版每天 5 条 |

---

## 🛠️ 技术栈

- **前端**：原生 JavaScript（无依赖）
- **模板引擎**：EJS（Hexo 主题）
- **样式**：内联 CSS + CSS Variables
- **图标**：Font Awesome 6
- **无服务器**：Cloudflare Workers (V8 isolates)
- **推送服务**：Telegram Bot API + Server 酱

---

## 📊 浏览器兼容性

| 浏览器 | 最低版本 | 备注 |
|--------|---------|------|
| Chrome | 60+ | ✅ 完整支持 |
| Firefox | 55+ | ⚠️ 网络类型 API 不支持 |
| Safari | 11+ | ⚠️ 部分 API 受限 |
| Edge | 79+ | ✅ 完整支持 |
| 移动端浏览器 | iOS 11+ / Android 6+ | ✅ 完整支持 |

---

## 🐛 常见问题

### Q1：访客 IP 显示「未知」？
**A**：可能是 `myip.ipip.net` 接口超时或被拦截，会自动降级。

### Q2：Telegram 收不到通知？
**A**：检查以下几项：
1. 是否给 Bot 主动发过 `/start` 激活
2. BOT_TOKEN 和 CHAT_ID 是否正确
3. Worker 是否成功部署
4. 浏览器控制台是否有错误

### Q3：天气一直加载不出来？
**A**：`wttr.in` 在国内偶尔较慢，会自动降级到不显示天气。

### Q4：本地 `hexo serve` 不触发通知？
**A**：可能被 24h 去重锁拦截，控制台执行：
```javascript
localStorage.removeItem('auto_notify_time');
location.reload();
```

---

## 🔐 安全与隐私

### 数据收集范围
本组件**只收集浏览器公开 API 提供的信息**，不涉及任何隐私敏感数据。

### 数据流向
- 所有信息**只发送给博主本人**
- 不上传到任何第三方分析平台
- 不写入任何 Cookie，仅使用 `localStorage`

### Token 安全
- Telegram Bot Token 存储在 **Cloudflare Worker**，前端不暴露
- Server 酱 SendKey 写在前端（已知风险），如需更安全可同样套 Worker

---

## 🌟 项目亮点

1. **零依赖** —— 纯原生 JS，体积小性能高
2. **零后端** —— 借助 Cloudflare Workers 实现 Serverless
3. **零费用** —— 全套免费服务，永久可用
4. **高扩展** —— 模块化设计，易于自定义
5. **有温度** —— 不是冷冰冰的统计，是与访客的对话

---

## 📝 更新日志

### v1.0.0 (2026-05-26)
- 🎉 初版发布
- ✨ 基础 IP 卡片 + 设备识别
- ✨ 智能问候语系统
- ✨ Telegram + Server 酱双通道通知
- ✨ Cloudflare Worker 中转
- ✨ 访客留言表单

---

## 🤝 致谢

- 感谢 [card.net.coffee](https://card.net.coffee) 提供精美的 SVG 卡片
- 感谢 [ipip.net](https://www.ipip.net) 提供 IP 查询服务
- 感谢 [wttr.in](https://wttr.in) 提供免费天气 API
- 感谢 [Cloudflare](https://cloudflare.com) 提供慷慨的免费额度
- 感谢 [Server 酱](https://sct.ftqq.com) 提供微信推送服务

---

## 📄 License

MIT License - 自由使用、修改、分发，欢迎二次创作！

---

## 💬 联系作者

- 📧 Email: kawayida@proton.me
- 🌐 Blog: [你的博客地址]
- 💌 通过侧边栏的「跟博主打个招呼」直接联系！

---

<div align="center">

**如果这个项目对你有帮助，欢迎点个 ⭐ Star！**

Made with ❤️ by Monkey

</div>