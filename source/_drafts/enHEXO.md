---
title: HEXO
cover: /covers/hexo.webp
urlname: Hexo
lang: en
---

Common HEXO Commands

   ```bash
   hexo clean    # Clean old cache and public folder
   hexo generate # Regenerate static files
   ```

### For local debugging, you can simply use:

   ```bash
   hexo server
   ```

   * Hexo will automatically build and start a local server
   * By default, visit `http://localhost:4000` to see your changes

### For deployment, you need to build first, then push to GitHub/Vercel to see changes online:

   ```bash
   hexo clean
   hexo deploy
   ```

---

### ⚡ Special Cases

* If you only changed **post content**, sometimes `hexo generate` is enough.
* If you changed **theme config or theme source code**, it’s recommended to use:

  ```bash
  hexo clean && hexo g && hexo s
  ```

  This helps avoid the “theme changes not applied” issue caused by