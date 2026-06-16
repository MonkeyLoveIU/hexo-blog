# HTML完整知识体系学习文档

## 📋 目录

1. [HTML基础概念](#1-html基础概念)
2. [文档结构](#2-文档结构)
3. [文本内容标签](#3-文本内容标签)
4. [语义化HTML](#4-语义化html)
5. [链接与导航](#5-链接与导航)
6. [图像与多媒体](#6-图像与多媒体)
7. [列表](#7-列表)
8. [表格](#8-表格)
9. [表单详解](#9-表单详解)
10. [HTML5新特性](#10-html5新特性)
11. [元数据与SEO](#11-元数据与seo)
12. [可访问性](#12-可访问性)
13. [最佳实践](#13-最佳实践)
14. [实战项目](#14-实战项目)

---

## 1. HTML基础概念

### 什么是HTML？

HTML（HyperText Markup Language）超文本标记语言，是构建网页的标准语言。它不是编程语言，而是**标记语言**，用标签来描述网页的结构和内容。

### 核心概念

- **标签（Tag）**: 用尖括号包围的关键字，如 `<p>`
- **元素（Element）**: 开始标签 + 内容 + 结束标签，如 `<p>内容</p>`
- **属性（Attribute）**: 提供元素额外信息，如 `<a href="url">`
- **嵌套（Nesting）**: 元素可以包含其他元素

### 标签分类

**双标签（成对标签）**:
```html
<p>段落内容</p>
<div>容器内容</div>
```

**单标签（自闭合标签）**:
```html
<img src="image.jpg" alt="图片">
<br>
<hr>
<input type="text">
```

---

## 2. 文档结构

### 标准HTML文档结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题</title>
    <meta name="description" content="页面描述">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- 页面内容 -->
    <script src="script.js"></script>
</body>
</html>
```

### 各部分说明

**`<!DOCTYPE html>`**
- 文档类型声明，告诉浏览器使用HTML5标准
- 必须放在文档最前面
- 不区分大小写，但建议大写

**`<html lang="zh-CN">`**
- 根元素，包裹整个HTML文档
- `lang`属性指定页面主要语言（有助于搜索引擎和屏幕阅读器）

**`<head>`区域**
- 包含元数据，不会在页面上显示
- 包括：字符集、标题、样式表链接、脚本等

**`<body>`区域**
- 包含所有可见内容
- 页面的主体部分

### 完整示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 字符编码 -->
    <meta charset="UTF-8">
    
    <!-- 响应式设计必备 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- 页面标题（显示在浏览器标签） -->
    <title>我的第一个网页</title>
    
    <!-- SEO相关 -->
    <meta name="description" content="这是一个学习HTML的示例页面">
    <meta name="keywords" content="HTML, 学习, 教程">
    <meta name="author" content="你的名字">
    
    <!-- 网站图标 -->
    <link rel="icon" href="favicon.ico" type="image/x-icon">
    
    <!-- 外部样式表 -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>欢迎来到我的网页</h1>
    <p>这是正文内容。</p>
</body>
</html>
```

---

## 3. 文本内容标签

### 标题标签 `<h1>` - `<h6>`

```html
<h1>一级标题 - 最重要</h1>
<h2>二级标题</h2>
<h3>三级标题</h3>
<h4>四级标题</h4>
<h5>五级标题</h5>
<h6>六级标题 - 最小</h6>
```

**使用原则**:
- 一个页面只用一个 `<h1>`（通常是页面主标题）
- 按层级顺序使用，不要跳级
- 不要为了样式选择标题级别（用CSS控制样式）

### 段落标签 `<p>`

```html
<p>这是一个段落。段落会自动换行，前后有间距。</p>
<p>这是另一个段落。浏览器会自动处理段落间的空白。</p>
```

### 换行与水平线

```html
<!-- 换行 -->
<p>第一行<br>第二行</p>

<!-- 水平分割线 -->
<p>段落一</p>
<hr>
<p>段落二</p>
```

### 文本格式化标签

```html
<!-- 强调（通常显示为斜体） -->
<em>强调的内容</em>

<!-- 重要（通常显示为粗体） -->
<strong>重要的内容</strong>

<!-- 标记/高亮 -->
<mark>高亮显示的文本</mark>

<!-- 删除线 -->
<del>已删除的内容</del>

<!-- 下划线 -->
<ins>插入的内容</ins>

<!-- 小字体 -->
<small>小号文本</small>

<!-- 下标 -->
H<sub>2</sub>O

<!-- 上标 -->
E=mc<sup>2</sup>

<!-- 代码 -->
<code>console.log('Hello')</code>

<!-- 预格式化文本（保留空格和换行） -->
<pre>
function hello() {
    console.log("保留格式");
}
</pre>

<!-- 引用 -->
<blockquote cite="https://example.com">
    这是一段引用的内容，通常会有缩进。
</blockquote>

<!-- 行内引用 -->
<p>正如某人所说：<q>这是一句引用</q></p>

<!-- 缩写 -->
<abbr title="HyperText Markup Language">HTML</abbr>
```

### 实际应用示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>文章示例</title>
</head>
<body>
    <h1>深入理解HTML文本标签</h1>
    
    <p>HTML提供了丰富的文本标签，让我们能够<strong>准确表达</strong>内容的含义。
    这不仅有助于<em>搜索引擎理解</em>页面内容，也能提升<mark>可访问性</mark>。</p>
    
    <p>化学公式示例：H<sub>2</sub>O（水），物理公式：E=mc<sup>2</sup></p>
    
    <blockquote>
        <p>"代码是写给人看的，顺便让计算机执行而已。"</p>
        <footer>— 某位程序员</footer>
    </blockquote>
    
    <p>如果你想在页面上显示代码，使用<code>&lt;code&gt;</code>标签。
    对于多行代码，使用<code>&lt;pre&gt;</code>标签：</p>
    
    <pre><code>function greet(name) {
    return `Hello, ${name}!`;
}</code></pre>
</body>
</html>
```

---

## 4. 语义化HTML

### 什么是语义化？

语义化HTML是指使用恰当的标签来描述内容的含义，而不是仅仅关注样式。

**为什么重要？**
- 提升SEO（搜索引擎更好理解页面结构）
- 增强可访问性（屏幕阅读器能更好地解读）
- 代码可读性更强
- 便于维护

### HTML5语义化标签

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>语义化页面结构</title>
</head>
<body>
    <!-- 页面头部 -->
    <header>
        <h1>网站名称</h1>
        <nav>
            <ul>
                <li><a href="#home">首页</a></li>
                <li><a href="#about">关于</a></li>
                <li><a href="#contact">联系</a></li>
            </ul>
        </nav>
    </header>
    
    <!-- 主要内容 -->
    <main>
        <!-- 文章 -->
        <article>
            <header>
                <h2>文章标题</h2>
                <p>发布于 <time datetime="2024-01-15">2024年1月15日</time></p>
            </header>
            
            <section>
                <h3>第一部分</h3>
                <p>文章内容...</p>
            </section>
            
            <section>
                <h3>第二部分</h3>
                <p>更多内容...</p>
            </section>
            
            <footer>
                <p>作者：张三</p>
            </footer>
        </article>
        
        <!-- 侧边栏 -->
        <aside>
            <h3>相关链接</h3>
            <ul>
                <li><a href="#">链接1</a></li>
                <li><a href="#">链接2</a></li>
            </ul>
        </aside>
    </main>
    
    <!-- 页面底部 -->
    <footer>
        <p>&copy; 2024 版权所有</p>
    </footer>
</body>
</html>
```

### 各标签详解

**`<header>`** - 头部区域
- 页面或区块的头部
- 可包含logo、导航、标题等
- 一个页面可以有多个header

**`<nav>`** - 导航区域
- 主要导航链接集合
- 不是所有链接组都需要用nav
- 一个页面可以有多个nav（如主导航、侧边导航）

**`<main>`** - 主要内容
- 文档的主体内容
- 一个页面只能有一个main
- 不能是header、footer、aside、nav的后代

**`<article>`** - 独立文章
- 可独立分发或复用的内容
- 如博客文章、新闻、评论等
- 可以嵌套（如文章内的评论）

**`<section>`** - 章节/区块
- 主题性内容分组
- 通常包含标题
- 用于划分文档的不同主题部分

**`<aside>`** - 侧边内容
- 与主内容相关但独立的内容
- 如侧边栏、引用、广告等

**`<footer>`** - 底部区域
- 页面或区块的底部
- 通常包含版权、联系方式、相关链接

**`<figure>` 和 `<figcaption>`** - 图表内容
```html
<figure>
    <img src="chart.png" alt="销售图表">
    <figcaption>2024年第一季度销售数据</figcaption>
</figure>
```

**`<time>`** - 时间/日期
```html
<p>会议时间：<time datetime="2024-12-25T14:00">12月25日下午2点</time></p>
```

### 非语义化 vs 语义化对比

**不好的做法（非语义化）**:
```html
<div id="header">
    <div id="nav">
        <div class="nav-item">首页</div>
        <div class="nav-item">关于</div>
    </div>
</div>
<div id="content">
    <div class="post">
        <div class="title">文章标题</div>
        <div class="text">文章内容</div>
    </div>
</div>
<div id="footer">版权信息</div>
```

**好的做法（语义化）**:
```html
<header>
    <nav>
        <a href="#home">首页</a>
        <a href="#about">关于</a>
    </nav>
</header>
<main>
    <article>
        <h2>文章标题</h2>
        <p>文章内容</p>
    </article>
</main>
<footer>版权信息</footer>
```

---

## 5. 链接与导航

### 基础链接 `<a>`

```html
<!-- 外部链接 -->
<a href="https://www.example.com">访问示例网站</a>

<!-- 新标签页打开 -->
<a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
    在新窗口打开
</a>

<!-- 相对路径 -->
<a href="about.html">关于页面</a>
<a href="../index.html">上级目录</a>
<a href="images/photo.jpg">图片</a>

<!-- 锚点链接（页面内跳转） -->
<a href="#section1">跳转到第一部分</a>
<h2 id="section1">第一部分</h2>

<!-- 邮件链接 -->
<a href="mailto:example@email.com">发送邮件</a>
<a href="mailto:example@email.com?subject=反馈&body=您好">带主题和内容的邮件</a>

<!-- 电话链接 -->
<a href="tel:+8613800138000">拨打电话</a>

<!-- 下载链接 -->
<a href="document.pdf" download>下载PDF</a>
<a href="document.pdf" download="我的文档.pdf">重命名下载</a>
```

### 链接属性详解

**`target`属性**:
- `_self`: 默认，当前窗口打开
- `_blank`: 新窗口打开
- `_parent`: 父框架打开
- `_top`: 顶层框架打开

**`rel`属性**（关系）:
- `noopener`: 防止新页面访问window.opener（安全）
- `noreferrer`: 不发送referrer信息（隐私）
- `nofollow`: 告诉搜索引擎不要跟踪此链接
- `external`: 标记外部链接

### 导航菜单示例

```html
<!-- 水平导航栏 -->
<nav>
    <ul>
        <li><a href="index.html" class="active">首页</a></li>
        <li><a href="products.html">产品</a></li>
        <li><a href="about.html">关于我们</a></li>
        <li><a href="contact.html">联系方式</a></li>
    </ul>
</nav>

<!-- 下拉菜单结构 -->
<nav>
    <ul>
        <li><a href="index.html">首页</a></li>
        <li>
            <a href="products.html">产品</a>
            <ul>
                <li><a href="products/electronics.html">电子产品</a></li>
                <li><a href="products/books.html">图书</a></li>
                <li><a href="products/clothes.html">服装</a></li>
            </ul>
        </li>
        <li><a href="about.html">关于</a></li>
    </ul>
</nav>

<!-- 面包屑导航 -->
<nav aria-label="面包屑导航">
    <ol>
        <li><a href="/">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li><a href="/products/electronics">电子产品</a></li>
        <li aria-current="page">笔记本电脑</li>
    </ol>
</nav>
```

---

## 6. 图像与多媒体

### 图像 `<img>`

```html
<!-- 基础用法 -->
<img src="photo.jpg" alt="风景照片">

<!-- 指定尺寸 -->
<img src="photo.jpg" alt="风景照片" width="300" height="200">

<!-- 响应式图片 -->
<img src="small.jpg" 
     srcset="small.jpg 300w, 
             medium.jpg 600w, 
             large.jpg 1200w"
     sizes="(max-width: 600px) 300px,
            (max-width: 1200px) 600px,
            1200px"
     alt="响应式图片">

<!-- 不同格式的图片 -->
<picture>
    <source srcset="image.webp" type="image/webp">
    <source srcset="image.jpg" type="image/jpeg">
    <img src="image.jpg" alt="图片描述">
</picture>

<!-- 懒加载 -->
<img src="photo.jpg" alt="风景" loading="lazy">
```

### 图像属性说明

- **`src`**: 图片路径（必需）
- **`alt`**: 替代文本（必需，SEO和可访问性）
- **`width/height`**: 尺寸（防止布局跳动）
- **`loading`**: lazy（延迟加载）或 eager（立即加载）
- **`srcset`**: 不同分辨率的图片源
- **`sizes`**: 告诉浏览器图片显示尺寸

### 视频 `<video>`

```html
<!-- 基础视频 -->
<video src="movie.mp4" controls width="640" height="360">
    您的浏览器不支持video标签。
</video>

<!-- 多格式支持 -->
<video controls width="640" height="360" poster="poster.jpg">
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.webm" type="video/webm">
    <source src="movie.ogv" type="video/ogg">
    <p>您的浏览器不支持HTML5视频。
       <a href="movie.mp4">下载视频</a>
    </p>
</video>

<!-- 自动播放静音（适合背景视频） -->
<video autoplay muted loop playsinline>
    <source src="background.mp4" type="video/mp4">
</video>

<!-- 带字幕的视频 -->
<video controls>
    <source src="movie.mp4" type="video/mp4">
    <track kind="subtitles" src="subtitles-cn.vtt" srclang="zh" label="中文" default>
    <track kind="subtitles" src="subtitles-en.vtt" srclang="en" label="English">
</video>
```

### 视频属性

- **`controls`**: 显示控制条
- **`autoplay`**: 自动播放（通常需配合muted）
- **`loop`**: 循环播放
- **`muted`**: 静音
- **`poster`**: 封面图
- **`preload`**: none/metadata/auto（预加载策略）

### 音频 `<audio>`

```html
<!-- 基础音频 -->
<audio src="music.mp3" controls>
    您的浏览器不支持audio标签。
</audio>

<!-- 多格式支持 -->
<audio controls>
    <source src="music.mp3" type="audio/mpeg">
    <source src="music.ogg" type="audio/ogg">
    <source src="music.wav" type="audio/wav">
    您的浏览器不支持HTML5音频。
</audio>

<!-- 自动播放背景音乐 -->
<audio autoplay loop>
    <source src="background.mp3" type="audio/mpeg">
</audio>
```

### 嵌入内容 `<iframe>`

```html
<!-- 嵌入网页 -->
<iframe src="https://example.com" 
        width="800" 
        height="600" 
        title="示例网站">
</iframe>

<!-- 嵌入YouTube视频 -->
<iframe width="560" 
        height="315" 
        src="https://www.youtube.com/embed/VIDEO_ID" 
        title="YouTube视频"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
</iframe>

<!-- 嵌入地图 -->
<iframe src="https://www.google.com/maps/embed?pb=..."
        width="600" 
        height="450" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy">
</iframe>
```

### SVG图形

```html
<!-- 内联SVG -->
<svg width="100" height="100">
    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>

<!-- 作为图片引用 -->
<img src="icon.svg" alt="图标">

<!-- 复杂SVG示例 -->
<svg width="200" height="200" viewBox="0 0 200 200">
    <rect x="10" y="10" width="180" height="180" fill="lightblue" stroke="navy" stroke-width="2"/>
    <circle cx="100" cy="100" r="50" fill="yellow"/>
    <text x="100" y="110" text-anchor="middle" font-size="20">Hello</text>
</svg>
```

---

## 7. 列表

### 无序列表 `<ul>`

```html
<ul>
    <li>苹果</li>
    <li>香蕉</li>
    <li>橙子</li>
</ul>

<!-- 嵌套列表 -->
<ul>
    <li>水果
        <ul>
            <li>苹果</li>
            <li>香蕉</li>
        </ul>
    </li>
    <li>蔬菜
        <ul>
            <li>胡萝卜</li>
            <li>西红柿</li>
        </ul>
    </li>
</ul>
```

### 有序列表 `<ol>`

```html
<!-- 数字列表 -->
<ol>
    <li>第一步</li>
    <li>第二步</li>
    <li>第三步</li>
</ol>

<!-- 指定起始数字 -->
<ol start="5">
    <li>第五项</li>
    <li>第六项</li>
</ol>

<!-- 倒序 -->
<ol reversed>
    <li>第三名</li>
    <li>第二名</li>
    <li>第一名</li>
</ol>

<!-- 不同类型 -->
<ol type="A">
    <li>项目A</li>
    <li>项目B</li>
</ol>

<ol type="I">
    <li>罗马数字I</li>
    <li>罗马数字II</li>
</ol>
```

**type属性值**:
- `1`: 数字（默认）
- `A`: 大写字母
- `a`: 小写字母
- `I`: 大写罗马数字
- `i`: 小写罗马数字

### 描述列表/自定义列表 `<dl>`

```html
<dl>
    <dt>HTML</dt>
    <dd>超文本标记语言，用于创建网页结构。</dd>
    
    <dt>CSS</dt>
    <dd>层叠样式表，用于设置网页样式。</dd>
    
    <dt>JavaScript</dt>
    <dd>编程语言，为网页添加交互功能。</dd>
</dl>

<!-- 一个术语多个描述 -->
<dl>
    <dt>Firefox</dt>
    <dt>Mozilla Firefox</dt>
    <dd>由Mozilla基金会开发的免费开源浏览器。</dd>
    
    <dt>Chrome</dt>
    <dd>由Google开发的浏览器。</dd>
    <dd>基于Chromium项目。</dd>
</dl>
```

### 实际应用示例

```html
<!-- 导航菜单 -->
<nav>
    <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/about">关于</a></li>
        <li><a href="/contact">联系</a></li>
    </ul>
</nav>

<!-- 教程步骤 -->
<article>
    <h2>制作蛋糕步骤</h2>
    <ol>
        <li>准备材料：面粉、鸡蛋、糖、黄油</li>
        <li>混合干性材料</li>
        <li>加入湿性材料搅拌</li>
        <li>倒入模具</li>
        <li>烤箱180度烘烤30分钟</li>
    </ol>
</article>

<!-- 术语表 -->
<section>
    <h2>Web开发术语</h2>
    <dl>
        <dt>前端</dt>
        <dd>网站或应用程序用户可见和交互的部分。</dd>
        
        <dt>后端</dt>
        <dd>服务器端逻辑、数据库操作等用户看不到的部分。</dd>
        
        <dt>全栈</dt>
        <dd>同时掌握前端和后端开发技能的开发者。</dd>
    </dl>
</section>
```

---

## 8. 表格

### 基础表格

```html
<table>
    <tr>
        <th>姓名</th>
        <th>年龄</th>
        <th>城市</th>
    </tr>
    <tr>
        <td>张三</td>
        <td>25</td>
        <td>北京</td>
    </tr>
    <tr>
        <td>李四</td>
        <td>30</td>
        <td>上海</td>
    </tr>
</table>

<!-- 复杂表格示例 -->
<table border="1">
    <caption>课程表</caption>
    <thead>
        <tr>
            <th>时间</th>
            <th>周一</th>
            <th>周二</th>
            <th>周三</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>9:00-10:00</td>
            <td rowspan="2">数学</td>
            <td>英语</td>
            <td>物理</td>
        </tr>
        <tr>
            <td>10:00-11:00</td>
            <td>化学</td>
            <td>历史</td>
        </tr>
    </tbody>
</table>
```

### 表格可访问性

```html
<table>
    <caption>学生成绩单</caption>
    <thead>
        <tr>
            <!-- scope属性提升可访问性 -->
            <th scope="col">姓名</th>
            <th scope="col">数学</th>
            <th scope="col">英语</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">张三</th>
            <td>95</td>
            <td>88</td>
        </tr>
        <tr>
            <th scope="row">李四</th>
            <td>87</td>
            <td>92</td>
        </tr>
    </tbody>
</table>
```

---

## 9. 表单详解

### 基础表单结构

```html
<form action="/submit" method="POST">
    <!-- 文本输入 -->
    <label for="username">用户名：</label>
    <input type="text" id="username" name="username" required>
    
    <!-- 提交按钮 -->
    <button type="submit">提交</button>
</form>
```

### 各种输入类型

```html
<form>
    <!-- 文本输入 -->
    <label for="name">姓名：</label>
    <input type="text" id="name" name="name" placeholder="请输入姓名">
    
    <!-- 密码 -->
    <label for="pwd">密码：</label>
    <input type="password" id="pwd" name="password" minlength="6">
    
    <!-- 邮箱 -->
    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email" placeholder="example@email.com">
    
    <!-- 电话 -->
    <label for="tel">电话：</label>
    <input type="tel" id="tel" name="phone" pattern="[0-9]{11}">
    
    <!-- 数字 -->
    <label for="age">年龄：</label>
    <input type="number" id="age" name="age" min="1" max="120" step="1">
    
    <!-- 网址 -->
    <label for="website">网站：</label>
    <input type="url" id="website" name="url" placeholder="https://example.com">
    
    <!-- 日期 -->
    <label for="birthday">生日：</label>
    <input type="date" id="birthday" name="birthday">
    
    <!-- 时间 -->
    <label for="meeting">会议时间：</label>
    <input type="time" id="meeting" name="meeting">
    
    <!-- 日期时间 -->
    <label for="appointment">预约时间：</label>
    <input type="datetime-local" id="appointment" name="appointment">
    
    <!-- 颜色选择器 -->
    <label for="color">选择颜色：</label>
    <input type="color" id="color" name="color" value="#ff0000">
    
    <!-- 范围滑块 -->
    <label for="volume">音量：</label>
    <input type="range" id="volume" name="volume" min="0" max="100" value="50">
    
    <!-- 搜索框 -->
    <label for="search">搜索：</label>
    <input type="search" id="search" name="search">
    
    <!-- 文件上传 -->
    <label for="file">上传文件：</label>
    <input type="file" id="file" name="file" accept="image/*" multiple>
    
    <!-- 隐藏字段 -->
    <input type="hidden" name="user_id" value="12345">
</form>
```

### 单选框和复选框

```html
<!-- 单选框 radio -->
<fieldset>
    <legend>选择性别：</legend>
    <label>
        <input type="radio" name="gender" value="male" checked>
        男
    </label>
    <label>
        <input type="radio" name="gender" value="female">
        女
    </label>
    <label>
        <input type="radio" name="gender" value="other">
        其他
    </label>
</fieldset>

<!-- 复选框 checkbox -->
<fieldset>
    <legend>选择爱好：</legend>
    <label>
        <input type="checkbox" name="hobbies" value="reading">
        阅读
    </label>
    <label>
        <input type="checkbox" name="hobbies" value="music" checked>
        音乐
    </label>
    <label>
        <input type="checkbox" name="hobbies" value="sports">
        运动
    </label>
</fieldset>
```

### 下拉选择

```html
<!-- 基础下拉框 -->
<label for="city">选择城市：</label>
<select id="city" name="city">
    <option value="">请选择</option>
    <option value="beijing">北京</option>
    <option value="shanghai" selected>上海</option>
    <option value="guangzhou">广州</option>
    <option value="shenzhen">深圳</option>
</select>

<!-- 分组选择 -->
<label for="food">选择食物：</label>
<select id="food" name="food">
    <optgroup label="水果">
        <option value="apple">苹果</option>
        <option value="banana">香蕉</option>
    </optgroup>
    <optgroup label="蔬菜">
        <option value="carrot">胡萝卜</option>
        <option value="tomato">西红柿</option>
    </optgroup>
</select>

<!-- 多选 -->
<label for="languages">选择语言（按住Ctrl多选）：</label>
<select id="languages" name="languages" multiple size="4">
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="js">JavaScript</option>
    <option value="python">Python</option>
</select>
```

### 文本域

```html
<label for="message">留言：</label>
<textarea id="message" 
          name="message" 
          rows="5" 
          cols="50" 
          placeholder="请输入留言内容..."
          maxlength="500"></textarea>
```

### 按钮

```html
<!-- 提交按钮 -->
<button type="submit">提交表单</button>

<!-- 重置按钮 -->
<button type="reset">重置</button>

<!-- 普通按钮 -->
<button type="button" onclick="alert('点击了')">点击我</button>

<!-- 图片按钮 -->
<input type="image" src="submit.png" alt="提交">

<!-- 旧式按钮（不推荐） -->
<input type="submit" value="提交">
<input type="reset" value="重置">
<input type="button" value="按钮">
```

### 表单验证属性

```html
<form>
    <!-- 必填 -->
    <input type="text" name="username" required>
    
    <!-- 最小/最大长度 -->
    <input type="text" name="password" minlength="6" maxlength="20">
    
    <!-- 数字范围 -->
    <input type="number" name="age" min="18" max="100">
    
    <!-- 正则验证 -->
    <input type="tel" name="phone" pattern="[0-9]{11}" title="请输入11位手机号">
    
    <!-- 禁用 -->
    <input type="text" name="field" disabled>
    
    <!-- 只读 -->
    <input type="text" name="field" readonly value="不可修改">
    
    <!-- 自动聚焦 -->
    <input type="text" name="field" autofocus>
    
    <!-- 自动完成 -->
    <input type="text" name="email" autocomplete="email">
</form>
```

### 完整注册表单示例

```html
<form action="/register" method="POST" novalidate>
    <fieldset>
        <legend>用户注册</legend>
        
        <!-- 用户名 -->
        <div>
            <label for="username">用户名 *</label>
            <input type="text" 
                   id="username" 
                   name="username" 
                   required 
                   minlength="3"
                   maxlength="20"
                   pattern="[a-zA-Z0-9_]+"
                   placeholder="3-20个字符，字母数字下划线"
                   aria-describedby="username-help">
            <small id="username-help">仅支持字母、数字和下划线</small>
        </div>
        
        <!-- 邮箱 -->
        <div>
            <label for="email">邮箱 *</label>
            <input type="email" 
                   id="email" 
                   name="email" 
                   required
                   placeholder="example@email.com">
        </div>
        
        <!-- 密码 -->
        <div>
            <label for="password">密码 *</label>
            <input type="password" 
                   id="password" 
                   name="password" 
                   required
                   minlength="8"
                   placeholder="至少8个字符">
        </div>
        
        <!-- 确认密码 -->
        <div>
            <label for="confirm-pwd">确认密码 *</label>
            <input type="password" 
                   id="confirm-pwd" 
                   name="confirm_password" 
                   required>
        </div>
        
        <!-- 性别 -->
        <div>
            <label>性别 *</label>
            <label><input type="radio" name="gender" value="male" required> 男</label>
            <label><input type="radio" name="gender" value="female"> 女</label>
            <label><input type="radio" name="gender" value="other"> 其他</label>
        </div>
        
        <!-- 生日 -->
        <div>
            <label for="birthday">生日</label>
            <input type="date" id="birthday" name="birthday">
        </div>
        
        <!-- 兴趣 -->
        <div>
            <label>兴趣爱好</label>
            <label><input type="checkbox" name="interests" value="tech"> 科技</label>
            <label><input type="checkbox" name="interests" value="sports"> 运动</label>
            <label><input type="checkbox" name="interests" value="art"> 艺术</label>
        </div>
        
        <!-- 自我介绍 -->
        <div>
            <label for="bio">自我介绍</label>
            <textarea id="bio" 
                      name="bio" 
                      rows="4" 
                      maxlength="200"
                      placeholder="简单介绍一下自己（选填）"></textarea>
        </div>
        
        <!-- 同意条款 -->
        <div>
            <label>
                <input type="checkbox" name="agree" required>
                我同意<a href="/terms">服务条款</a>和<a href="/privacy">隐私政策</a> *
            </label>
        </div>
        
        <!-- 按钮组 -->
        <div>
            <button type="submit">注册</button>
            <button type="reset">重置</button>
        </div>
    </fieldset>
</form>
```

---

## 10. HTML5新特性

### 语义化标签（已在前面介绍）

- `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
- `<figure>`, `<figcaption>`, `<time>`, `<mark>`

### Canvas画布

```html
<canvas id="myCanvas" width="400" height="300"></canvas>

<script>
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 绘制矩形
ctx.fillStyle = '#FF0000';
ctx.fillRect(10, 10, 100, 50);

// 绘制圆形
ctx.beginPath();
ctx.arc(200, 100, 50, 0, 2 * Math.PI);
ctx.fillStyle = '#00FF00';
ctx.fill();

// 绘制文字
ctx.font = '30px Arial';
ctx.fillStyle = '#0000FF';
ctx.fillText('Hello Canvas', 50, 200);
</script>
```

### 本地存储

```html
<script>
// localStorage - 永久存储
localStorage.setItem('username', '张三');
const user = localStorage.getItem('username');
localStorage.removeItem('username');
localStorage.clear();

// sessionStorage - 会话存储（关闭浏览器后清除）
sessionStorage.setItem('token', 'abc123');
const token = sessionStorage.getItem('token');
</script>
```

### 地理定位

```html
<button onclick="getLocation()">获取位置</button>
<p id="location"></p>

<script>
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('location').textContent = '浏览器不支持地理定位';
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    document.getElementById('location').textContent = 
        `纬度: ${lat}, 经度: ${lon}`;
}

function showError(error) {
    console.error('定位错误:', error.message);
}
</script>
```

### 拖放API

```html
<style>
    #drop-zone {
        width: 300px;
        height: 200px;
        border: 2px dashed #ccc;
        padding: 20px;
    }
    .draggable {
        padding: 10px;
        margin: 10px;
        background: lightblue;
        cursor: move;
    }
</style>

<div class="draggable" draggable="true" id="drag1">拖动我</div>
<div id="drop-zone">拖放区域</div>

<script>
const draggable = document.getElementById('drag1');
const dropZone = document.getElementById('drop-zone');

draggable.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text', e.target.id);
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text');
    const element = document.getElementById(data);
    dropZone.appendChild(element);
});
</script>
```

### Web Workers（后台线程）

```html
<!-- main.html -->
<button onclick="startWorker()">启动Worker</button>
<p id="result"></p>

<script>
let worker;

function startWorker() {
    if (typeof(Worker) !== "undefined") {
        if (!worker) {
            worker = new Worker("worker.js");
        }
        worker.onmessage = function(event) {
            document.getElementById("result").textContent = event.data;
        };
    }
}
</script>

<!-- worker.js -->
<script>
// 这是在worker文件中的代码
let i = 0;
function timedCount() {
    i++;
    postMessage(i);
    setTimeout(timedCount, 1000);
}
timedCount();
</script>
```

### 新的输入类型（已在表单部分介绍）

- email, url, tel, number, range, date, time, color, search

### 数据属性 data-*

```html
<div id="user" 
     data-id="12345" 
     data-name="张三" 
     data-role="admin">
    用户信息
</div>

<script>
const user = document.getElementById('user');
console.log(user.dataset.id);    // "12345"
console.log(user.dataset.name);  // "张三"
console.log(user.dataset.role);  // "admin"

// 设置data属性
user.dataset.age = "25";
</script>
```

---

## 11. 元数据与SEO

### Head区域的重要标签

```html
<head>
    <!-- 必需：字符编码 -->
    <meta charset="UTF-8">
    
    <!-- 必需：响应式设计 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- 必需：页面标题 -->
    <title>页面标题 - 网站名称</title>
    
    <!-- 页面描述（搜索结果摘要） -->
    <meta name="description" content="简洁准确的页面描述，140-160字符">
    
    <!-- 关键词（现在对SEO影响较小） -->
    <meta name="keywords" content="关键词1, 关键词2, 关键词3">
    
    <!-- 作者 -->
    <meta name="author" content="作者名">
    
    <!-- 搜索引擎索引控制 -->
    <meta name="robots" content="index, follow">
    <!-- noindex: 不索引, nofollow: 不跟踪链接 -->
    
    <!-- 网站图标 -->
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    
    <!-- 规范链接（避免重复内容） -->
    <link rel="canonical" href="https://example.com/page">
    
    <!-- 语言和地区 -->
    <link rel="alternate" hreflang="en" href="https://example.com/en/">
    <link rel="alternate" hreflang="zh-CN" href="https://example.com/zh/">
    
    <!-- Open Graph（社交媒体分享） -->
    <meta property="og:title" content="页面标题">
    <meta property="og:description" content="页面描述">
    <meta property="og:image" content="https://example.com/image.jpg">
    <meta property="og:url" content="https://example.com/page">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="页面标题">
    <meta name="twitter:description" content="页面描述">
    <meta name="twitter:image" content="https://example.com/image.jpg">
    
    <!-- 主题色（移动浏览器地址栏颜色） -->
    <meta name="theme-color" content="#4285f4">
</head>
```

### 结构化数据（Schema.org）

```html
<!-- 文章结构化数据 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "image": "https://example.com/image.jpg",
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-20",
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "publisher": {
    "@type": "Organization",
    "name": "网站名",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "description": "文章描述"
}
</script>

<!-- 面包屑导航 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "首页",
    "item": "https://example.com"
  },{
    "@type": "ListItem",
    "position": 2,
    "name": "产品",
    "item": "https://example.com/products"
  },{
    "@type": "ListItem",
    "position": 3,
    "name": "当前页"
  }]
}
</script>
```

---

## 12. 可访问性

### ARIA属性

```html
<!-- 角色定义 -->
<nav role="navigation">
    <ul role="menubar">
        <li role="menuitem"><a href="/">首页</a></li>
        <li role="menuitem"><a href="/about">关于</a></li>
    </ul>
</nav>

<!-- 标签关联 -->
<button aria-label="关闭对话框">×</button>
<button aria-labelledby="btn-text">
    <span id="btn-text">提交表单</span>
</button>

<!-- 描述 -->
<input type="text" 
       aria-describedby="password-help">
<span id="password-help">密码至少8位</span>

<!-- 状态 -->
<button aria-pressed="false">静音</button>
<div aria-expanded="false">折叠内容</div>
<input type="checkbox" aria-checked="true">

<!-- 隐藏内容 -->
<div aria-hidden="true">对屏幕阅读器隐藏</div>

<!-- 实时区域 -->
<div aria-live="polite">状态更新会被朗读</div>
<div aria-live="assertive">紧急通知</div>
```

### 键盘导航

```html
<!-- tabindex控制焦点顺序 -->
<div tabindex="0">可聚焦的div</div>
<div tabindex="-1">程序控制焦点，不在tab顺序中</div>
<button tabindex="1">第一个tab</button>
<button tabindex="2">第二个tab</button>

<!-- 跳过导航链接 -->
<a href="#main-content" class="skip-link">跳到主内容</a>
<nav>
    <!-- 导航内容 -->
</nav>
<main id="main-content">
    <!-- 主要内容 -->
</main>
```

### 语义化和可访问性最佳实践

```html
<!-- 好的做法 -->
<button onclick="doSomething()">点击</button>
<a href="/page">链接</a>

<!-- 不好的做法（避免） -->
<div onclick="doSomething()">点击</div>
<span onclick="goToPage()">链接</span>

<!-- 图片一定要有alt -->
<img src="photo.jpg" alt="详细的图片描述">

<!-- 装饰性图片alt为空 -->
<img src="decoration.png" alt="">

<!-- 表单标签关联 -->
<label for="email">邮箱</label>
<input type="email" id="email" name="email">

<!-- 或者包裹形式 -->
<label>
    邮箱
    <input type="email" name="email">
</label>
```

---

## 13. 最佳实践

### 代码规范

```html
<!-- 使用小写标签 -->
<div>正确</div>
<DIV>不推荐</DIV>

<!-- 属性值用引号 -->
<img src="photo.jpg" alt="图片">
<img src=photo.jpg alt=图片> <!-- 不推荐 -->

<!-- 关闭所有标签 -->
<p>段落</p>
<br> <!-- 自闭合标签也写完整 -->

<!-- 合理缩进 -->
<div>
    <p>段落</p>
    <ul>
        <li>项目1</li>
        <li>项目2</li>
    </ul>
</div>

<!-- 使用语义化标签 -->
<article>文章内容</article>
<!-- 而不是 -->
<div class="article">文章内容</div>
```

### 性能优化

```html
<!-- 异步加载脚本 -->
<script src="script.js" async></script>
<script src="script.js" defer></script>

<!-- 懒加载图片 -->
<img src="photo.jpg" loading="lazy" alt="图片">

<!-- 预加载关键资源 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="critical.css" as="style">

<!-- DNS预解析 -->
<link rel="dns-prefetch" href="https://example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://example.com">

<!-- 响应式图片 -->
<picture>
    <source media="(min-width: 800px)" srcset="large.jpg">
    <source media="(min-width: 400px)" srcset="medium.jpg">
    <img src="small.jpg" alt="响应式图片">
</picture>
```

### 安全性

```html
<!-- 外部链接加 rel -->
<a href="https://external.com" target="_blank" rel="noopener noreferrer">
    外部链接
</a>

<!-- 表单防止自动完成敏感信息 -->
<input type="password" autocomplete="new-password">

<!-- CSP内容安全策略 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

### 常见错误避免

```html
<!-- ❌ 错误：块级元素放在行内元素中 -->
<span><div>内容</div></span>

<!-- ✅ 正确 -->
<div><span>内容</span></div>

<!-- ❌ 错误：p标签嵌套 -->
<p>段落<p>嵌套段落</p></p>

<!-- ✅ 正确 -->
<p>段落一</p>
<p>段落二</p>

<!-- ❌ 错误：缺少必需属性 -->
<img src="photo.jpg">

<!-- ✅ 正确 -->
<img src="photo.jpg" alt="图片描述">

<!-- ❌ 错误：内联样式过多 -->
<div style="color: red; font-size: 16px; margin: 10px;">内容</div>

<!-- ✅ 正确：使用CSS类 -->
<div class="highlight">内容</div>
```

---

## 14. 实战项目

### 项目1：个人简历页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>张三 - 前端工程师</title>
    <meta name="description" content="张三的个人简历，前端工程师">
</head>
<body>
    <header>
        <h1>张三</h1>
        <p>前端工程师</p>
        <nav>
            <a href="#about">关于我</a>
            <a href="#skills">技能</a>
            <a href="#experience">经历</a>
            <a href="#contact">联系</a>
        </nav>
    </header>
    
    <main>
        <section id="about">
            <h2>关于我</h2>
            <img src="avatar.jpg" alt="张三的头像" width="150">
            <p>热爱前端开发，3年工作经验，精通HTML、CSS、JavaScript。</p>
        </section>
        
        <section id="skills">
            <h2>专业技能</h2>
            <ul>
                <li>HTML5 / CSS3</li>
                <li>JavaScript / ES6+</li>
                <li>React / Vue</li>
                <li>响应式设计</li>
            </ul>
        </section>
        
        <section id="experience">
            <h2>工作经历</h2>
            <article>
                <h3>前端工程师 - XX科技公司</h3>
                <time datetime="2021-06">2021年6月</time> - 至今
                <ul>
                    <li>负责公司官网的开发和维护</li>
                    <li>参与多个大型项目的前端架构设计</li>
                </ul>
            </article>
        </section>
        
        <section id="contact">
            <h2>联系方式</h2>
            <address>
                <p>邮箱：<a href="mailto:zhangsan@email.com">zhangsan@email.com</a></p>
                <p>电话：<a href="tel:+8613800138000">138-0013-8000</a></p>
                <p>GitHub: <a href="https://github.com/zhangsan" target="_blank" rel="noopener">@zhangsan</a></p>
            </address>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 张三. 保留所有权利。</p>
    </footer>
</body>
</html>
```

### 项目2：博客文章页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>深入理解CSS布局 - 我的博客</title>
    <meta name="description" content="详细讲解CSS中Flexbox和Grid布局的使用技巧">
    <meta name="author" content="博主名">
</head>
<body>
    <header>
        <h1>我的技术博客</h1>
        <nav>
            <ul>
                <li><a href="/">首页</a></li>
                <li><a href="/articles">文章</a></li>
                <li><a href="/about">关于</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article>
            <header>
                <h1>深入理解CSS布局</h1>
                <p>
                    <time datetime="2024-01-15">2024年1月15日</time>
                    由 <span>张三</span> 发布
                </p>
                <p>阅读时间：约8分钟</p>
            </header>
            
            <figure>
                <img src="css-layout.jpg" alt="CSS布局示意图" width="800">
                <figcaption>CSS布局的演进历程</figcaption>
            </figure>
            
            <section>
                <h2>引言</h2>
                <p>CSS布局是前端开发中的核心技能。从早期的<code>float</code>布局，
                到现代的Flexbox和Grid，布局技术不断进化...</p>
            </section>
            
            <section>
                <h2>Flexbox布局</h2>
                <p>Flexbox（弹性盒子）是一维布局模型，特别适合处理行或列的布局。</p>
                
                <h3>基础用法</h3>
                <pre><code>.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}</code></pre>
                
                <p>主要属性包括：</p>
                <ul>
                    <li><code>justify-content</code>：主轴对齐</li>
                    <li><code>align-items</code>：交叉轴对齐</li>
                    <li><code>flex-direction</code>：主轴方向</li>
                </ul>
            </section>
            
            <section>
                <h2>Grid布局</h2>
                <p>Grid是二维布局系统，可以同时处理行和列。</p>
                
                <figure>
                    <img src="grid-demo.jpg" alt="Grid布局示例" width="600">
                    <figcaption>Grid网格布局示例</figcaption>
                </figure>
            </section>
            
            <section>
                <h2>总结</h2>
                <p>选择合适的布局方式取决于具体需求：</p>
                <ul>
                    <li>一维布局用Flexbox</li>
                    <li>二维布局用Grid</li>
                    <li>简单场景可以结合使用</li>
                </ul>
            </section>
            
            <footer>
                <p>标签: 
                    <a href="/tag/css" rel="tag">CSS</a>, 
                    <a href="/tag/layout" rel="tag">布局</a>
                </p>
            </footer>
        </article>
        
        <section>
            <h3>相关文章</h3>
            <ul>
                <li><a href="/article1">CSS动画入门</a></li>
                <li><a href="/article2">响应式设计实践</a></li>
            </ul>
        </section>
        
        <section>
            <h3>评论</h3>
            <form action="/submit-comment" method="POST">
                <label for="name">姓名：</label>
                <input type="text" id="name" name="name" required>
                
                <label for="email">邮箱：</label>
                <input type="email" id="email" name="email" required>
                
                <label for="comment">评论：</label>
                <textarea id="comment" name="comment" rows="5" required></textarea>
                
                <button type="submit">提交评论</button>
            </form>
        </section>
    </main>
    
    <aside>
        <section>
            <h3>关于作者</h3>
            <p>资深前端开发者，热爱分享技术...</p>
        </section>
        
        <section>
            <h3>热门文章</h3>
            <ol>
                <li><a href="/popular1">JavaScript闭包详解</a></li>
                <li><a href="/popular2">React Hooks最佳实践</a></li>
                <li><a href="/popular3">前端性能优化指南</a></li>
            </ol>
        </section>
    </aside>
    
    <footer>
        <p>&copy; 2024 我的技术博客. 保留所有权利。</p>
        <nav>
            <a href="/privacy">隐私政策</a> |
            <a href="/terms">使用条款</a> |
            <a href="/rss">RSS订阅</a>
        </nav>
    </footer>
</body>
</html>
```

### 项目3：产品展示页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>商品名称 - 在线商城</title>
    <meta name="description" content="商品详细描述，包含特性、价格等信息">
    
    <!-- Open Graph -->
    <meta property="og:title" content="商品名称">
    <meta property="og:description" content="商品描述">
    <meta property="og:image" content="https://example.com/product.jpg">
    <meta property="og:type" content="product">
</head>
<body>
    <header>
        <h1>在线商城</h1>
        <nav>
            <a href="/">首页</a>
            <a href="/products">产品</a>
            <a href="/cart">购物车 (0)</a>
            <a href="/login">登录</a>
        </nav>
        
        <form action="/search" method="GET" role="search">
            <label for="search">搜索商品：</label>
            <input type="search" id="search" name="q" placeholder="搜索...">
            <button type="submit">搜索</button>
        </form>
    </header>
    
    <nav aria-label="面包屑导航">
        <ol>
            <li><a href="/">首页</a></li>
            <li><a href="/products">产品</a></li>
            <li><a href="/products/electronics">电子产品</a></li>
            <li aria-current="page">无线耳机</li>
        </ol>
    </nav>
    
    <main>
        <article itemscope itemtype="https://schema.org/Product">
            <header>
                <h1 itemprop="name">高端无线蓝牙耳机</h1>
                <p itemprop="description">主动降噪，超长续航，HiFi音质</p>
            </header>
            
            <section>
                <h2>产品图片</h2>
                <figure>
                    <img src="product-main.jpg" 
                         alt="无线耳机正面图" 
                         width="600"
                         itemprop="image">
                </figure>
                
                <div>
                    <img src="thumb1.jpg" alt="图片1" width="100">
                    <img src="thumb2.jpg" alt="图片2" width="100">
                    <img src="thumb3.jpg" alt="图片3" width="100">
                    <img src="thumb4.jpg" alt="图片4" width="100">
                </div>
            </section>
            
            <section>
                <h2>价格信息</h2>
                <p>
                    <data itemprop="price" value="899">¥899.00</data>
                    <del>原价：¥1299.00</del>
                </p>
                
                <form action="/add-to-cart" method="POST">
                    <label for="quantity">数量：</label>
                    <input type="number" 
                           id="quantity" 
                           name="quantity" 
                           value="1" 
                           min="1" 
                           max="10">
                    
                    <label for="color">颜色：</label>
                    <select id="color" name="color" required>
                        <option value="">请选择</option>
                        <option value="black">黑色</option>
                        <option value="white">白色</option>
                        <option value="blue">蓝色</option>
                    </select>
                    
                    <button type="submit">加入购物车</button>
                    <button type="button">立即购买</button>
                </form>
            </section>
            
            <section>
                <h2>产品特性</h2>
                <ul>
                    <li>
                        <strong>主动降噪：</strong>
                        高级ANC技术，有效降低环境噪音
                    </li>
                    <li>
                        <strong>长续航：</strong>
                        单次充电可使用30小时
                    </li>
                    <li>
                        <strong>舒适佩戴：</strong>
                        人体工学设计，长时间佩戴不累
                    </li>
                    <li>
                        <strong>HiFi音质：</strong>
                        40mm动圈单元，三频均衡
                    </li>
                </ul>
            </section>
            
            <section>
                <h2>技术规格</h2>
                <table>
                    <caption>产品参数</caption>
                    <tbody>
                        <tr>
                            <th scope="row">品牌</th>
                            <td>XX品牌</td>
                        </tr>
                        <tr>
                            <th scope="row">型号</th>
                            <td>XH-2000</td>
                        </tr>
                        <tr>
                            <th scope="row">连接方式</th>
                            <td>蓝牙5.3</td>
                        </tr>
                        <tr>
                            <th scope="row">电池容量</th>
                            <td>500mAh</td>
                        </tr>
                        <tr>
                            <th scope="row">重量</th>
                            <td>250g</td>
                        </tr>
                    </tbody>
                </table>
            </section>
            
            <section>
                <h2>产品视频</h2>
                <video controls width="640" poster="video-poster.jpg">
                    <source src="product-demo.mp4" type="video/mp4">
                    <source src="product-demo.webm" type="video/webm">
                    <p>您的浏览器不支持视频播放。
                       <a href="product-demo.mp4">下载视频</a>
                    </p>
                </video>
            </section>
            
            <section>
                <h2>用户评价</h2>
                <article>
                    <header>
                        <strong>用户A</strong>
                        <time datetime="2024-01-10">2024年1月10日</time>
                        <data value="5">⭐⭐⭐⭐⭐</data>
                    </header>
                    <p>音质很棒，降噪效果出色，非常满意！</p>
                </article>
                
                <article>
                    <header>
                        <strong>用户B</strong>
                        <time datetime="2024-01-12">2024年1月12日</time>
                        <data value="4">⭐⭐⭐⭐</data>
                    </header>
                    <p>性价比很高，唯一的缺点是有点重。</p>
                </article>
            </section>
            
            <section>
                <h2>常见问题</h2>
                <dl>
                    <dt>支持哪些设备？</dt>
                    <dd>支持所有带蓝牙功能的设备，包括手机、平板、电脑等。</dd>
                    
                    <dt>保修期多久？</dt>
                    <dd>提供1年质保，终身维修服务。</dd>
                    
                    <dt>是否支持有线连接？</dt>
                    <dd>是的，配备3.5mm音频线，可有线连接使用。</dd>
                </dl>
            </section>
        </article>
        
        <aside>
            <section>
                <h3>相关产品</h3>
                <ul>
                    <li>
                        <img src="related1.jpg" alt="产品1" width="100">
                        <a href="/product1">真无线耳机</a>
                        <data value="599">¥599</data>
                    </li>
                    <li>
                        <img src="related2.jpg" alt="产品2" width="100">
                        <a href="/product2">运动耳机</a>
                        <data value="299">¥299</data>
                    </li>
                </ul>
            </section>
        </aside>
    </main>
    
    <footer>
        <section>
            <h3>客户服务</h3>
            <ul>
                <li><a href="/help">帮助中心</a></li>
                <li><a href="/shipping">配送信息</a></li>
                <li><a href="/returns">退换货政策</a></li>
            </ul>
        </section>
        
        <section>
            <h3>关于我们</h3>
            <ul>
                <li><a href="/about">公司简介</a></li>
                <li><a href="/contact">联系我们</a></li>
                <li><a href="/careers">招聘信息</a></li>
            </ul>
        </section>
        
        <section>
            <h3>关注我们</h3>
            <ul>
                <li><a href="https://weibo.com/" target="_blank" rel="noopener">微博</a></li>
                <li><a href="https://weixin.qq.com/" target="_blank" rel="noopener">微信</a></li>
            </ul>
        </section>
        
        <p>&copy; 2024 在线商城. 保留所有权利。</p>
    </footer>
</body>
</html>
```

### 项目4：联系表单页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>联系我们 - 公司名称</title>
</head>
<body>
    <header>
        <h1>公司名称</h1>
        <nav>
            <a href="/">首页</a>
            <a href="/about">关于</a>
            <a href="/services">服务</a>
            <a href="/contact" aria-current="page">联系</a>
        </nav>
    </header>
    
    <main>
        <h1>联系我们</h1>
        
        <section>
            <h2>我们很乐意听到您的声音</h2>
            <p>有任何问题或建议？请填写下面的表单，我们会尽快回复您。</p>
        </section>
        
        <form action="/submit-contact" method="POST" id="contact-form">
            <fieldset>
                <legend>基本信息</legend>
                
                <div>
                    <label for="name">姓名 *</label>
                    <input type="text" 
                           id="name" 
                           name="name" 
                           required 
                           autocomplete="name"
                           placeholder="请输入您的姓名">
                </div>
                
                <div>
                    <label for="email">邮箱 *</label>
                    <input type="email" 
                           id="email" 
                           name="email" 
                           required
                           autocomplete="email"
                           placeholder="example@email.com">
                </div>
                
                <div>
                    <label for="phone">电话</label>
                    <input type="tel" 
                           id="phone" 
                           name="phone"
                           autocomplete="tel"
                           pattern="[0-9]{11}"
                           placeholder="手机号码（选填）">
                </div>
                
                <div>
                    <label for="company">公司</label>
                    <input type="text" 
                           id="company" 
                           name="company"
                           autocomplete="organization">
                </div>
            </fieldset>
            
            <fieldset>
                <legend>咨询信息</legend>
                
                <div>
                    <label for="subject">主题 *</label>
                    <select id="subject" name="subject" required>
                        <option value="">请选择咨询主题</option>
                        <option value="general">一般咨询</option>
                        <option value="support">技术支持</option>
                        <option value="sales">销售咨询</option>
                        <option value="partnership">合作洽谈</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                
                <div>
                    <label>优先级</label>
                    <label>
                        <input type="radio" name="priority" value="low" checked>
                        低
                    </label>
                    <label>
                        <input type="radio" name="priority" value="medium">
                        中
                    </label>
                    <label>
                        <input type="radio" name="priority" value="high">
                        高
                    </label>
                </div>
                
                <div>
                    <label for="message">详细信息 *</label>
                    <textarea id="message" 
                              name="message" 
                              rows="8" 
                              required
                              minlength="10"
                              maxlength="1000"
                              placeholder="请详细描述您的问题或需求..."></textarea>
                    <small>至少10个字符，最多1000个字符</small>
                </div>
                
                <div>
                    <label for="attachment">附件</label>
                    <input type="file" 
                           id="attachment" 
                           name="attachment"
                           accept=".pdf,.doc,.docx,.jpg,.png"
                           multiple>
                    <small>支持格式：PDF, Word, 图片（最多5MB）</small>
                </div>
            </fieldset>
            
            <fieldset>
                <legend>偏好设置</legend>
                
                <div>
                    <label>希望的联系方式</label>
                    <label>
                        <input type="checkbox" name="contact_method" value="email" checked>
                        邮件
                    </label>
                    <label>
                        <input type="checkbox" name="contact_method" value="phone">
                        电话
                    </label>
                    <label>
                        <input type="checkbox" name="contact_method" value="wechat">
                        微信
                    </label>
                </div>
                
                <div>
                    <label>
                        <input type="checkbox" name="newsletter" value="yes">
                        订阅我们的新闻邮件
                    </label>
                </div>
            </fieldset>
            
            <div>
                <label>
                    <input type="checkbox" name="agree" required>
                    我已阅读并同意<a href="/privacy" target="_blank">隐私政策</a> *
                </label>
            </div>
            
            <div>
                <button type="submit">提交</button>
                <button type="reset">重置</button>
            </div>
        </form>
        
        <section>
            <h2>其他联系方式</h2>
            <address>
                <p><strong>地址：</strong>北京市朝阳区XX街道XX号</p>
                <p><strong>电话：</strong><a href="tel:+861012345678">010-1234-5678</a></p>
                <p><strong>邮箱：</strong><a href="mailto:info@company.com">info@company.com</a></p>
                <p><strong>工作时间：</strong>周一至周五 9:00-18:00</p>
            </address>
        </section>
        
        <section>
            <h2>办公地点</h2>
            <iframe src="https://www.google.com/maps/embed?pb=..."
                    width="100%" 
                    height="400" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy"
                    title="公司地图位置">
            </iframe>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 公司名称. 保留所有权利。</p>
    </footer>
</body>
</html>
```

---

## 15. 学习路线建议

### 初级阶段（1-2周）
1. ✅ HTML基础语法和文档结构
2. ✅ 常用文本标签
3. ✅ 列表、链接、图片
4. ✅ 简单表格和表单
5. 🎯 实践：制作个人简介页面

### 中级阶段（2-3周）
1. ✅ 语义化HTML5标签
2. ✅ 复杂表单和验证
3. ✅ 多媒体元素（视频、音频）
4. ✅ 基础SEO和元数据
5. 🎯 实践：制作博客页面或产品展示页

### 高级阶段（3-4周）
1. ✅ 可访问性（ARIA）
2. ✅ 结构化数据
3. ✅ 性能优化
4. ✅ HTML5 API（Canvas、Storage等）
5. 🎯 实践：完整的网站项目

### 持续学习
- 📖 阅读MDN文档
- 💻 多写代码，多做项目
- 🔍 关注Web标准更新
- 👥 参与开源项目
- 📝 写技术博客总结经验

---

## 16. 学习资源推荐

### 官方文档
- **MDN Web Docs**: https://developer.mozilla.org/zh-CN/
- **W3C规范**: https://www.w3.org/
- **HTML Living Standard**: https://html.spec.whatwg.org/

### 在线教程
- freeCodeCamp
- W3Schools
- 菜鸟教程

### 验证工具
- **HTML验证器**: https://validator.w3.org/
- **WAVE可访问性工具**: https://wave.webaim.org/
- **Schema标记测试**: https://search.google.com/test/rich-results

### 练习平台
- CodePen
- JSFiddle
- GitHub Pages（托管项目）

---

## 17. 常见面试题

### 基础题
1. **DOCTYPE的作用是什么？**
   - 声明文档类型，告诉浏览器用哪个HTML版本解析
   - HTML5使用 `<!DOCTYPE html>`

2. **HTML5新增了哪些语义化标签？**
   - header, nav, main, article, section, aside, footer
   - figure, figcaption, time, mark

3. **行内元素和块级元素有什么区别？**
   - 块级：独占一行，可设置宽高（div, p, h1-h6）
   - 行内：不独占，宽高由内容决定（span, a, img）

4. **src和href的区别？**
   - src：嵌入资源，会暂停其他资源加载（img, script）
   - href：引用资源，不阻塞（link, a）

### 进阶题
1. **如何优化网页加载性能？**
   - 懒加载图片（loading="lazy"）
   - 异步加载脚本（async/defer）
   - 使用CDN
   - 压缩资源
   - 使用合适的图片格式

2. **什么是语义化HTML？为什么重要？**
   - 用恰当标签描述内容含义
   - 好处：SEO、可访问性、可维护性

3. **如何提升网页可访问性？**
   - 使用语义化标签
   - 提供alt文本
   - 合理使用ARIA属性
   - 支持键盘导航
   - 足够的颜色对比度

---

## 总结

HTML是Web开发的基石。掌握HTML不仅是学会标签的使用，更重要的是理解：

1. **语义化**：用正确的标签表达内容含义
2. **结构化**：合理组织页面结构
3. **可访问性**：让所有人都能访问你的内容
4. **标准化**：遵循Web标准和最佳实践

记住：**多写代码，多做项目，持续学习！**

祝你学习愉快！🚀
```

### 完整的表格结构

```html
<table>
    <!-- 表格标题 -->
    <caption>2024年销售数据</caption>
    
    <!-- 表头 -->
    <thead>
        <tr>
            <th>季度</th>
            <th>销售额</th>
            <th>增长率</th>
        </tr>
    </thead>
    
    <!-- 表格主体 -->
    <tbody>
        <tr>
            <td>Q1</td>
            <td>100万</td>
            <td>10%</td>
        </tr>
        <tr>
            <td>Q2</td>
            <td>120万</td>
            <td>20%</td>
        </tr>
        <tr>
            <td>Q3</td>
            <td>150万</td>
            <td>25%</td>
        </tr>
    </tbody>
    
    <!-- 表格底部（汇总） -->
    <tfoot>
        <tr>
            <td>合计</td>
            <td>370万</td>
            <td>-</td>
        </tr>
    </tfoot>
</table>
```

### 单元格合并

```html
<!-- 横跨多列 colspan -->
<table border="1">
    <tr>
        <th>名称</th>
        <th colspan="2">详细信息</th>
    </tr>
    <tr>
        <td>产品A</td>
        <td>描述</td>
        <td>价格</td>
    </tr>
</table>

<!-- 纵跨多行 rowspan -->
<table border="1">
    <tr>
        <th rowspan="2">类别</th>
        <th>产品</th>
        <th>价格</th>
    </tr>
    <tr>
        <td>笔记本</td>
        <td>5000</td>
    </tr>
    <tr>
        <td rowspan="2">食品</td>
        <td>苹果</td>
        <td>5</td>
    </tr>
    <tr>
        <td>香蕉</td>
        <td>3</td>
    </tr>
</table>