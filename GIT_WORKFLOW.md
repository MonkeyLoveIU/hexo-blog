 # Git 工作流 — 博客源码管理

 ## 日常写文章流程

 ```bash
 # 1. 写文章（hexo new post "标题" 或在 source/_posts/ 里直接新建 .md）
 # 2. 本地预览
 hexo clean && hexo generate
 hexo server
 # 3. 确认没问题后，部署到线上
 hexo deploy
 # 4. 把源码改动提交到 GitHub 备份（source 分支）
 git add .
 git commit -m "写清楚改了什么"
 git push origin source
 ```

 ## 常用 git 命令

 ### 查看状态
 ```bash
 git status                 # 看哪些文件改了
 git diff                   # 看改了什么内容
 git log --oneline          # 看提交历史
 ```

 ### 提交改动
 ```bash
 git add .                  # 添加所有改动
 git add 文件名              # 只添加某个文件
 git commit -m "说明"       # 提交到本地仓库
 ```

 ### 推送到 GitHub
 ```bash
 git push origin source     # 推送到 GitHub 的 source 分支
 ```

 ### 拉取最新源码（换设备时）
 ```bash
 git pull origin source     # 拉取 GitHub 上的最新源码
 ```

 ## 你仓库的两个分支

 | 分支 | 用途 | 谁管理 |
 |------|------|--------|
 | `main` | 线上博客（HTML 页面） | `hexo deploy` 自动推 |
 | `source` | 源码备份（.md 配置等） | 你手动 `git push` |

 ## 一句话口诀

 **写完文章 → hexo deploy 发到线上 → git push 备份源码**

 两条线互不干扰。

## 版本回退

### 回退到某个历史版本
git log --oneline          # 先看提交历史，找到要回退的 commit id
git reset --hard <commit-id>   # 回退到那个版本（慎用，会丢掉之后的所有改动）

### 只想撤销某个文件的改动
git checkout -- 文件名          # 放弃这个文件的未提交修改
git restore 文件名              # 同上（新版写法）

### 包版本会一起回退吗？

**会的。** 因为 package.json 和 package-lock.json 都被 git 跟踪了。

回退到旧的 commit 后，这两个文件也会变回旧版本。但 
ode_modules/ 不会被恢复（它在 .gitignore 里）。

所以回退完需要跑：

pm install    # 根据回退后的 package-lock.json 重新安装对应版本的依赖

### 安全回退：先试再看
git stash                     # 临时藏起当前未提交的改动
git log --oneline             # 找目标 commit-id
git checkout <commit-id>      # 只查看那个版本（detached HEAD）
确认没问题后，再决定：
git checkout source           # 切回 source 分支，放弃回退
或
git reset --hard <commit-id>  # 正式回退
git stash pop                 # 把藏起的改动恢复回来
