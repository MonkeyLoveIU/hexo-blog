 # Monkey Love IU 博客 — 项目文档

 ## 项目概览

 本项目是基于 **Hexo 7.3.0** 静态博客框架 + **Reimu** 主题搭建的个人博客，部署于 GitHub Pages（自定义域名 `monkeyiu.icu`）。

 **定位**：个人生活记录与技术分享，支持中英双语。

 **在线地址**：https://monkeyiu.icu
 **源码仓库**：`git@github.com:MonkeyLoveIU/hexo-blog.git`

 ---

 ## 目录结构

 ```
 my-blog-CE/
 ├── _config.yml              # 站点主配置
 ├── _config.landscape.yml    # 旧主题 landscape 配置（未使用，可删除）
 ├── package.json             # Node 依赖
 ├── scaffolds/               # 新建文章/页面的模板
 │   ├── post.md              # 文章模板
 │   ├── page.md              # 页面模板
 │   └── draft.md             # 草稿模板
 ├── source/                  # 源代码目录（写作用）
 │   ├── _posts/              # 已发布的博客文章（Markdown）
 │   ├── _drafts/             # 草稿（不发布）
 │   ├── about/index.md       # 关于页面
 │   ├── diary/index.md       # 碎碎念/朋友圈页面
 │   ├── friend/index.md      # 友情链接页面
 │   ├── friend/_data.yml     # 友链数据
 │   ├── gallery/index.md     # 画廊/作品展示页面
 │   ├── gallery-items/       # 画廊子页面（HTML）
 │   ├── data/                # 结构化数据
 │   │   ├── moments.yml      # 碎碎念时间线数据
 │   │   ├── covers.yml       # 文章封面轮播图列表
 │   │   └── avatar/          # 头像目录
 │   ├── images/              # 本地图片资源
 │   ├── css/                 # 自定义 CSS
 │   ├── js/                  # 自定义 JS
 │   ├── live2d-models/       # Live2D 模型
 │   ├── live2dw/             # Live2D 组件
 │   └── CNAME                # 自定义域名（GitHub Pages 用）
 ├── themes/
 │   └── reimu/               # Reimu 主题
 ├── public/                  # 生成的静态文件（.gitignore 已忽略）
 ├── .deploy_git/             # 部署用 Git 工作目录（.gitignore 已忽略）
 ├── .github/dependabot.yml   # 依赖自动更新配置
 └── db.json                  # Hexo 数据库缓存（.gitignore 已忽略）
 ```

 ---

 ## 常用命令

 | 命令 | 作用 |
 |------|------|
 | `npm run server` / `hexo server` | 启动本地预览（默认 http://localhost:4000） |
 | `npm run build` / `hexo generate` | 生成静态文件到 `public/` |
 | `npm run deploy` / `hexo deploy` | 生成并部署到 GitHub Pages |
 | `npm run clean` / `hexo clean` | 清除缓存和生成文件 |
 | `hexo new post "<标题>"` | 新建一篇博客文章 |
 | `hexo new page "<页面名>"` | 新建一个页面 |
 | `hexo new draft "<标题>"` | 新建一篇草稿 |
 | `hexo publish <草稿名>` | 将草稿发布为正式文章 |

 ---

 ## 写文章指南

 ### 1. 新建文章

 ```bash
 hexo new post "文章标题"
 ```

 会在 `source/_posts/` 下生成 `.md` 文件，包含默认 Front-matter。

 ### 2. Front-matter 字段说明

 ```yaml
 ---
 title: 文章标题
 date: 2026-06-16 12:00:00
 cover: https://example.com/cover.jpg     # 文章封面图
 urlname: my-post-slug                    # URL 自定义别名（推荐必填）
 categories: 分类名                       # 只能有一个分类
 tags:
   - 标签1
   - 标签2
 excerpt: 文章摘要
 lang: en                                 # 英文文章加上此字段
 password: my-password                    # 加密文章密码
 abstract: 加密文章简介                    # 加密时显示
 message: 密码提示                         # 加密提示文字
 toc: true                                # 是否显示目录
 ---
 ```

 **关键字段**：
 - `urlname` — 自定义 URL 后缀，**强烈建议填写**，否则 URL 会自动生成
 - `lang: en` — 标记为英文文章，出现在 `/en/` 路径下
 - `password` — 配合 `abstract` / `message` 启用加密

 ### 3. 写英文文章

 在 Front-matter 中添加 `lang: en`，文章会自动归类到 `/en/` 路径下。

 ### 4. 加密文章

 Front-matter 中添加 `password`、`abstract`、`message` 字段即可（依赖 `hexo-blog-encrypt` 插件，已安装）。

 ### 5. 图片引用

 **推荐方式**：使用图床外链，支持模板语法：
 ```
 https://img.monkeyiu.icu/{year}/{month}/{md5}.{extName}/one.webp
 ```

 本地图片放在 `source/images/` 目录，文章中引用路径为 `../images/xxx.webp`。

 ---

 ## 页面管理

 | 页面 | 文件路径 | 说明 |
 |------|---------|------|
 | 关于 | `source/about/index.md` | 个人简介 + IP 卡片 |
 | 日记/碎碎念 | `source/diary/index.md` | 展示 `moments.yml` 时间线 |
 | 友情链接 | `source/friend/index.md` | 展示 `_data.yml` 友链 |
 | 画廊 | `source/gallery/index.md` | HTML 作品展示 |

 **编辑数据**：
 - 碎碎念 → `source/data/moments.yml`
 - 友链 → `source/friend/_data.yml`
 - 封面池 → `source/data/covers.yml`
 - 个人简介 → `source/about/index.md`

 ---

 ## 配置说明

 ### 站点主配置 `_config.yml`

 核心字段：
 - `url: https://monkeyiu.icu` — 站点正式域名
 - `permalink: :year/:month/:day/:urlname/` — 文章永久链接格式
 - `theme: reimu` — 当前主题
 - `deploy` — Git 部署配置（repo + branch）

 ### 主题配置 `themes/reimu/_config.yml`

 控制导航菜单、Banner、头像、评论（Waline）、Live2D 看板娘、背景音乐、动画效果等。

 ---

 ## 部署流程

 ```bash
 hexo clean          # 清理缓存（改配置或主题时需要）
 hexo deploy         # 生成 + 部署到 GitHub Pages
 ```
