---
title: HEXO
cover: /covers/hexo.webp
urlname: Hexo
---

HEXO常用命令

   ```bash
   hexo clean    # 清理旧缓存和 public
   hexo generate # 重新生成静态文件
   ```

### 本地调试时，可以直接用：

   ```bash
   hexo server
   ```

   * Hexo 会自动 build + 启动本地服务器
   * 默认访问 `http://localhost:4000` 就能看到修改后的效果

### 部署时，需要先构建，然后再推送到 GitHub/Vercel 才能在公网看到修改：

   ```bash
   hexo clean
   hexo deploy
   ```

---

### ⚡ 特殊情况

* 如果只是改了 **文章内容**，有时 `hexo generate` 就够了。
* 如果改了 **主题配置 / 主题源码**，建议用：

  ```bash
  hexo clean && hexo g && hexo s
  ```

  这样可以避免旧缓存导致的“主题没生效”问题。

---
