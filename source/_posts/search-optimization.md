---
title: Hexo 搜索体验优化纪实
date: 2026-06-16 6:00
cover: https://img.monkeyiu.icu/{year}/{month}/{md5}.{extName}/20260616062459825.webp
urlname: search-optimization
categories: 技术
tags:
  - Hexo
  - 前端
  - 搜索
excerpt: 从只有标题的简单搜索，到上下文预览 + 精确跳转 + 高亮定位，记录一次完整的搜索体验优化过程。
---

 ## 写在前面

 博客一直用 Reimu 主题内置的 `generator_search` 作为站内搜索方案。功能虽能用，但体验上有个明显缺口：

 > 搜索结果只有**文章标题**，没有上下文预览，没有关键词高亮，点到文章里还得自己找。

 正好借这个机会，把搜索体验从"能用"做到"好用"。下面记录完整的优化过程。

 ---

 ## 第一版：上下文摘要 + 高亮

 最朴素的诉求：搜索结果里能告诉我**关键词在文章的哪个位置**。

 ### 思路

 `generator_search` 的工作流很简单——Hexo 构建时把全文内容写入 `search.json`，前端 JS 读取后做字符串匹配渲染。

 原来每篇文章只渲染一个标题链接：

 ```javascript
 // 优化前 —— 只有标题
 searchResult.insertAdjacentHTML(
   "beforeend",
   `<a href="${hit.url}">${hit.title}</a>`
 );
 ```

 改造后增加 `getSnippet` 函数，从正文中截取关键词附近的上下文片段，并用 `<mark>` 高亮：

 ```javascript
 function getSnippet(text, keyword, contextLen = 60) {
   const lower = text.toLowerCase();
   const kwLower = keyword.toLowerCase();
   const idx = lower.indexOf(kwLower);
   if (idx === -1) return "";

   const start = Math.max(0, idx - contextLen);
   const end = Math.min(text.length, idx + keyword.length + contextLen);
   let snippet = text.slice(start, end);

   if (start > 0) snippet = "…" + snippet;
   if (end < text.length) snippet = snippet + "…";

   const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
   const re = new RegExp("(" + escaped + ")", "gi");
   snippet = snippet.replace(re, "<mark class=\"search-highlight\">$1</mark>");
   return snippet;
 }
```

同时配上 CSS 样式，搜索结果从一行链接变成了带有上下文预览的卡片：

```css
 .reimu-hit-item {
   padding: 12px 16px;
   border-bottom: 1px solid var(--red-5);
 }
 .reimu-hit-snippet {
   font-size: 0.85rem;
   line-height: 1.5;
   color: var(--highlight-foreground);
   display: -webkit-box;
   -webkit-line-clamp: 3;
   -webkit-box-orient: vertical;
   overflow: hidden;
 }
 .search-highlight {
   background-color: var(--red-2);
   color: var(--red-6);
   padding: 1px 4px;
   border-radius: 3px;
 }
 ```

 ### 效果

 搜索"弦"时不再干巴巴地列一个标题，而是能看到"知音少，**弦**断有谁听"这样的上下文片段。

 ---

 ## 第二版：一处匹配一条结果

 第一版有个明显的问题：**一篇文章只出现一次**。

 比如一篇文章里"弦"出现了 5 次，搜索结果里还是只有一条，看不到 —— 原来这篇里藏了这么多处相关内容。

 ### 改造

 新增 `findAllOccurrences` 函数，遍历全文找出**每一个**匹配位置，各自生成上下文片段：

 ```javascript
 function findAllOccurrences(text, keyword, maxResults = 10) {
   var results = [];
   var idx = 0;
   var occurrenceNum = 0;
   while ((idx = lower.indexOf(kwLower, idx)) !== -1) {
     // 截取 + 高亮，逻辑同 getSnippet
     results.push({ snippet: snippet, occurrenceNum: occurrenceNum });
     occurrenceNum++;
     idx += keyword.length;
     if (results.length >= maxResults) break;
   }
   return results;
 }
 ```

 `displayHits` 函数同步修改：遍历每篇文章时，把所有匹配位置展平成一个数组，再按分页渲染。于是搜索"弦"时能看到：

 > 弦断有谁听？
 > …知音少，**弦**断有谁听？…
 >
 > 弦断有谁听？
 > …因为没人懂，就算琴**弦**拨断了…
 >
 > 弦断有谁听？
 > …破琴绝**弦**，终身不再弹琴。…

 每一条对应一个独立的位置。

 ---

 ## 第三版：点到哪跳哪

 多条结果是好事，但点进去之后呢？浏览器默认停留在页首，还得手动滚动查找。

 解决方案是在**搜索结果链接点击时**做三件事：

 1. 关闭搜索弹窗
 2. 把搜索词和匹配序号存入 `sessionStorage`
 3. 用 `window.location.href` 跳转（避开 PJAX 干扰）

 ```javascript
 el.querySelector("a").addEventListener("click", function(e) {
   e.preventDefault();
   _$(".popup").classList.remove("show");
   _$("#mask").classList.add("hide");
   document.body.style.overflow = "";
   sessionStorage.setItem("reimu_search_query", query);
   sessionStorage.setItem("reimu_search_occurrence", item.occurrenceNum);
   window.location.href = this.getAttribute("href");
 });
 ```

 在目标页面通过 `search-scroll.js` 读取存储的信息，找到第 N 个匹配位置，滚动到视野中央并高亮：

 ```javascript
 var treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
 var count = 0;
 while (treeWalker.nextNode()) {
   // ... 遍历文本节点
   if (count === occurrenceNum) {
     var mark = document.createElement("mark");
     mark.style.backgroundColor = "#ff5252";
     mark.style.color = "#fff";
     range.surroundContents(mark);
     mark.scrollIntoView({ behavior: "smooth", block: "center" });
     return;
   }
 }
 ```

 ### 关于 <mark> 的默认样式

 浏览器原生的 `<mark>` 标签默认是黄色背景。一开始我写了一版 CSS 规则 `.search-target-highlight` 但发现没用 —— 因为 `search.css` 没有被文章页面加载，页面只引用了主题生成的 `style.css`。

 解决方案就是放弃 CSS class，直接在 JS 里**内联样式**。这样无论 PJAX 怎么加载、主题怎么组合 HTML，高亮颜色永远是确定的深红色。

 ### PJAX 兼容

 这个主题开启了 PJAX（局部刷新导航），会导致两点问题：
 - 点击搜索结果链接时，PJAX 拦截跳转，弹窗不自动关
 - 跳转后的新页面不会重新执行 `search-scroll.js`

 解决方式：
 - 点击事件里手动关弹窗 + 调用 `window.location.href` 整页跳转（避开 PJAX 拦截）
 - 通过主题 injector 把 `search-scroll.js` 注入到每页的 `body_end`

 ```yaml
 # themes/reimu/_config.yml
 injector:
   body_end: <script src="/js/search-scroll.js"></script>
 ```

 这样每次页面加载（包括 PJAX 后的加载）都会执行一次关键词定位。

 ---

 ## 最终成果：一条搜索的生命周期

 整个搜索体验的完整流程如下：

 ```mermaid
 graph TD
   A[输入关键词] --> B[generator_search.js 遍历 search.json]
   B --> C[findAllOccurrences 找出全部匹配位置]
   C --> D[每条匹配渲染为一个独立结果条目]
   D --> E[点击某一条结果]
   E --> F[关闭弹窗 / 存入搜索词和序号 / 全页跳转]
   F --> G[目标页面加载]
   G --> H[search-scroll.js 读取 sessionStorage]
   H --> I[DOM 遍历找到第 N 个匹配]
   I --> J[内联样式高亮 + 滚动到视野中央]
 ```

 ---

 ## 文件改动清单

 涉及文件不多，但改动覆盖了搜索的整个链路：

 | 文件 | 作用 | 改动要点 |
 |------|------|---------|
 | `themes/reimu/source/js/generator_search.js` | 搜索核心 JS | 新增 `getSnippet`、`findAllOccurrences`；改写 `displayHits` |
 | `source/js/search-scroll.js` | 目标页定位高亮 | 新建，读取 `sessionStorage` 跳转到指定匹配位置 |
 | `source/css/search.css` | 搜索样式 | 新建，定义结果卡片和摘要样式 |
 | `themes/reimu/_config.yml` | 主题配置 | injector 注入 `search-scroll.js` |

 ---

 ## 可以做得更好

 几个可以继续优化的方向（暂时不急）：

 - **搜索中文时不区分全角/半角**：搜"弦"和搜"ｘｉａｎ"应该命中相同结果
 - **加载动画**：search.json 较大时（博客几百篇后），加一个 loading 状态
 - **键盘导航**：搜索结果支持 ↑↓ 键切换、回车跳转
 - **搜索词保留**：跳转到文章后，如果点浏览器返回，搜索词还在

 ---

 ## 最后说两句

 从"只有标题"到"一处匹配一条结果 + 点击精确定位"，本质就是把搜索从前端的一次字符串匹配，变成了一条有状态的交互链路。核心不在于代码有多复杂（其实加起来不到 200 行），而在于**把搜索后的每一个心理预期都对应到一个具体的行为**：

 搜到了 → 想看在哪 → 点进去 → 帮我翻到那里。

 每一步都照顾到，体验自然就上来了。
