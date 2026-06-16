 # 博客优化方案

 基于对项目结构和配置的全面排查，整理出以下可优化项，按 **影响程度** 从高到低排列。

 ## P0 — 阻塞性问题

 ### 1. `_config.yml` 中文编码损坏

 **问题**：站点主配置 `_config.yml` 中的中文内容（标题、副标题、描述、加密文案等）已变成乱码，如 `title: 鍚?涔?褰?澶?`。

 **原因**：文件被以 `GBK`/`GB2312` 编码打开并保存，但 Hexo 要求 UTF-8 编码。

 **修复**：将 `_config.yml` 顶部的中文内容重新用正确的 UTF-8 中文写入：
 ```yaml
 title: 何处归途
 subtitle: 悟已往之不谏，知来者之可追
 description: 昨夜寒蛩不住鸣，惊回千里梦，起来独自绕阶行。知音少，弦断有谁听？
 ```

 同时 `themes/reimu/_config.yml` 中大量中文注释也出现了同样问题，虽然注释不影响功能，但建议一并修复。

 ### 2. `themes/reimu/_config.yml` 中文注释编码损坏

 **问题**：主题配置文件内的中文注释同样显示为乱码，影响后续修改时识别配置项用途。

 **修复**：用 UTF-8 编码重新打开并保存整个文件，或参考 Reimu 主题原始仓库的 `_config.yml` 恢复注释。

 ---

 ## P1 — 功能性缺失

 ### 3. 站点搜索未启用

 **问题**：`algolia_search` 和 `generator_search` 均为 `false`，访客无法搜索全站内容。

 **建议**：二选一。
 - **轻量方案**：启用 `generator_search`（无需第三方服务）
   ```yaml
   # themes/reimu/_config.yml
   generator_search:
     enable: true
     field: all   # 搜索全部内容
     content: true
   ```
 - **高级方案**：配置 Algolia 搜索（需注册 Algolia 账号），搜索体验更好。

 ### 4. 缺少 RSS 支持

 **问题**：主题配置了 `rss: atom.xml`，但未安装 `hexo-generator-feed` 插件，RSS 功能实际不工作。

 **建议**：
 ```bash
 npm install hexo-generator-feed --save
 ```
 安装后即自动在 `/atom.xml` 生成 RSS Feed。

 ### 5. 缺少 Sitemap

 **问题**：没有 Sitemap 生成插件，搜索引擎爬虫抓取效率低。

 **建议**：
 ```bash
 npm install hexo-generator-sitemap --save
 ```
 安装后在站点配置中可设定 `sitemap` 相关选项。

 ---

 ## P2 — 内容与文件整洁

 ### 6. 草稿积压过多

 **问题**：`source/_drafts/` 下有 **20 篇草稿**，许多已经可以清理。

 **建议**：
 - 确认哪些草稿仍需用 → 用 `hexo publish <文件名>` 发布
 - 废弃的草稿 → 直接删除
 - 长期搁置的草稿 → 挪到外部归档文件夹

 ### 7. 发布文章中有格式问题

 **问题**：
 - `gaokao.md`：日期 `date: 2026-6-7 2锛?0` 格式有误，冒号写成了全角符号，Hexo 解析会出问题。应改为 `date: 2026-06-07 02:00:00`。
 - `ip-card.md`：加密文章内容为空。建议补充正文或删除此篇。
 - `gaokao.md` 的 tags 中有一个空标签项（`-` 后无内容），建议删除。

 ### 8. 源码根目录有无关文件

 **问题**：`source/` 根目录下有 `1.tex`、`1.aux`、`1.log`、`1.pdf`、`1.svg`、`1.synctex.gz` 等 LaTeX 编译残留文件。

 **建议**：删除这些文件，它们不会影响 Hexo 站点，但保持目录干净更好。

 ### 9. 画廊页面 HTML 结构问题

 **问题**：`source/gallery/index.md` 中有两个独立的 `<div class="gallery-grid">`，第二个 div 被错误地关闭在了一个子项内。

 **建议**：合并为一个 grid 容器，统一管理子项。

 ### 10. 友链页面 markdown 语法问题

 **问题**：`source/friend/index.md` 中演示代码块混用了 `~~~yml` 和 ` ```yml `，两个分隔符嵌套在一起，渲染异常。

 **建议**：统一为一种格式：
 ````markdown
 ```yml
 - name: 您的名字
   url: 您的网址
   desc: 简短描述
   image: 一张图片
 ```
 ````

 ---

 ## P3 — 体验优化

 ### 11. 首页侧边栏功能单一

 **问题**：目前侧边栏只启用了 `ip-card` widget，分类、标签、归档、最新文章等均未启用。

 **建议**：在 `themes/reimu/_config.yml` 的 `widgets` 中添加更多元素：
 ```yaml
 widgets:
   - ip-card
   - category
   - tag
   - archive
   - recent_posts
 ```

 ### 12. 关闭 `post_asset_folder`

 **建议**：如果后续文章主要使用图床外链图片，建议在 `_config.yml` 中关闭：
 ```yaml
 post_asset_folder: false
 ```
 减少每篇文章的资源文件夹数量，简化目录结构。

 ### 13. 更新 scaffold 模板

 **问题**：当前的 `scaffolds/post.md` 非常简陋，只有 `title`、`date`、`tags`。

 **建议**：预填常用的 Front-matter 字段，减少每次手动输入：
 ```markdown
 ---
 title: {{ title }}
 date: {{ date }}
 urlname:
 categories:
 tags:
 excerpt:
 cover:
 ---
 ```

 ### 14. 删除未使用的 `_config.landscape.yml`

 **问题**：当前主题是 `reimu`，`landscape` 是 Hexo 默认主题，其配置文件 `_config.landscape.yml` 完全无效。

 **建议**：直接删除此文件，消除困惑。

 ### 15. `themes/reimu/_config.yml` 中部分注释含敏感信息

 **问题**：评论系统部分的 default comment title 包含开玩笑的内容，如 `"请在这里留下银行卡号及密码"`，可能会让访客困惑。

 **建议**：改为更友善的提示。

 ---

 ## P4 — 长期建议

 ### 16. 考虑自动化部署

 当前是手动 `hexo deploy`。可以配置 GitHub Actions：
 - 推送到源码仓库时自动 `hexo generate` + 部署到 GitHub Pages
 - 配合 `dependabot.yml`（已有）可实现依赖自动更新

 ### 17. 考虑启用 Service Worker / PWA

 主题支持 `service_worker`（当前关闭），开启后可提供离线访问能力，提升移动端体验。

 ### 18. 添加阅读统计与分析

 - 已集成了 `busuanzi` 计数（footer 中已启用）
 - 如需更详细分析，可开启 Google Analytics 或百度统计（当前均为 `false`）

 ---

 ## 优化优先级总结

 | 优先级 | 事项 | 预估耗时 |
 |--------|------|---------|
 | P0 | 修复 `_config.yml` 编码乱码 | 10 分钟 |
 | P0 | 修复主题配置编码 | 15 分钟 |
 | P1 | 启用搜索（generator_search） | 2 分钟 |
 | P1 | 安装 RSS / Sitemap 插件 | 5 分钟 |
 | P2 | 清理草稿 + 修复文章格式 | 20 分钟 |
 | P2 | 清理 source 根目录无关文件 | 2 分钟 |
 | P2 | 修复画廊/友链页面 | 5 分钟 |
 | P3 | 丰富侧边栏 + 更新 scaffold | 10 分钟 |
 | P3 | 删除 landscape 旧配置 | 1 分钟 |
 | P4 | 引入 CI/CD 自动化 | 30 分钟 |
