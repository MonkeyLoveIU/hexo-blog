---
title:  Pandoc + XeLaTeX 中英文论文 PDF 生成
date: 2026-6-5
password: monkey
abstract: 这是一篇加密文章，你得有密码才能偷看。
message: 施主，佛门重地，输入密码方可入内。
cover: https://img.monkeyiu.icu/{year}/{month}/{md5}.{extName}/one.webp
urlname: pandoc
categories: 论文
tags:
  - 阅读
  - 翻译
excerpt: 中英文对照
---





# 📘 Pandoc + XeLaTeX 中文论文 PDF 生成技术文档

> **项目背景**：基于 Pandoc + XeLaTeX 将 Markdown / LaTeX 学术论文转换为 PDF，记录完整的踩坑与解决过程。
>
> **环境**：Windows 11 + PowerShell + TeX Live 2026 + Pandoc
>
> **文档版本**：v1.0

---

## 📑 目录

1. [项目概述](#1-项目概述)
2. [环境配置](#2-环境配置)
3. [核心命令解析](#3-核心命令解析)
4. [问题排查与解决方案](#4-问题排查与解决方案)
5. [完整模板](#5-完整模板)
6. [最佳实践](#6-最佳实践)
7. [常用命令速查](#7-常用命令速查)
8. [经验总结](#8-经验总结)

---

## 1. 项目概述

### 1.1 目标

将学术论文（Markdown 或 LaTeX 格式）通过 Pandoc 转换为高质量 PDF，支持：
- ✅ 中英文混排
- ✅ 数学公式
- ✅ 自定义模板
- ✅ 学术排版

### 1.2 技术栈

| 工具 | 版本 | 用途 |
|------|------|------|
| Pandoc | 最新版 | 文档格式转换 |
| TeX Live | 2026 | LaTeX 编译系统 |
| XeLaTeX | TeX Live 内置 | PDF 引擎（支持中文）|
| PowerShell | Windows 11 | 命令行执行 |

### 1.3 工作流程

```
Markdown (.md)              LaTeX (.tex)
    ↓                            ↓
  Pandoc + Template        直接编译
    ↓                            ↓
  生成 .tex 中间文件      XeLaTeX
    ↓                            ↓
  XeLaTeX 编译            PDF 输出
    ↓
   PDF 输出
```

---

## 2. 环境配置

### 2.1 软件安装路径

```

pandoc: https://github.com/jgm/pandoc/releases
TeX Live：D:\texlive\2026\bin\windows\
关键工具：
  - xelatex.exe     ← PDF 编译引擎
  - latexmk.exe     ← 自动化编译工具
  - fc-cache.exe    ← 字体缓存
  - fc-list.exe     ← 字体列表
```

### 2.2 验证安装

```powershell
# 检查 Pandoc
pandoc --version

# 检查 XeLaTeX
D:\texlive\2026\bin\windows\xelatex.exe --version

# 检查字体（搜索思源宋体）
D:\texlive\2026\bin\windows\fc-list.exe | Select-String "Source Han Serif"
```

### 2.3 中文字体准备

**推荐字体**：思源宋体（Source Han Serif）

#### 字体文件命名规则

| 字重 | 文件名 | XeLaTeX 调用名 |
|------|--------|---------------|
| Regular | SourceHanSerifCN-Regular.otf | `Source Han Serif CN` |
| Bold | SourceHanSerifCN-Bold.otf | `Source Han Serif CN Bold` |
| SemiBold | SourceHanSerifCN-SemiBold.otf | `Source Han Serif CN SemiBold` |
| Light | SourceHanSerifCN-Light.otf | `Source Han Serif CN Light` |
| Medium | SourceHanSerifCN-Medium.otf | `Source Han Serif CN Medium` |

⚠️ **关键提示**：
- **CN** = 中国版（推荐）
- **SC** = 简体中文（旧版命名）
- 必须与系统实际安装的字体名**完全一致**

#### 字体安装建议

✅ **正确方式**：右键字体文件 → **"为所有用户安装"**
- 安装位置：`C:\Windows\Fonts\`
- 所有程序（包括 XeLaTeX）都能识别

❌ **错误方式**：直接双击 → "安装"
- 安装位置：`C:\Users\<用户>\AppData\Local\Microsoft\Windows\Fonts\`
- **XeLaTeX 可能无法识别**

---

## 3. 核心命令解析

### 3.1 基础命令

```powershell
pandoc "D:\mdbook\src\lunwei\2.md" `
  --template="D:\mdbook\template.tex" `
  --metadata-file="D:\mdbook\metadata.yaml" `
  --pdf-engine="D:\texlive\2026\bin\windows\xelatex.exe" `
  -o "D:\mdbook\src\lunwei\output.pdf"
```

### 3.2 参数详解

| 参数 | 作用 | 示例 |
|------|------|------|
| 输入文件 | 源 Markdown | `"D:\...\2.md"` |
| `` ` `` | PowerShell 续行符 | 等同于 Linux 的 `\` |
| `--template` | 指定 LaTeX 模板 | 控制排版样式 |
| `--metadata-file` | 元数据文件 | 提供变量（标题、作者等）|
| `--pdf-engine` | 指定 PDF 引擎 | xelatex 支持中文 |
| `-o` | 输出文件 | 生成的 PDF 路径 |

### 3.3 转换流程

```
Markdown 输入
      ↓
Pandoc 解析
      ↓
套用 template.tex 模板
      ↓
读取 metadata.yaml 变量
      ↓
生成中间 .tex 文件
      ↓
XeLaTeX 编译
      ↓
PDF 输出
```

---

## 4. 问题排查与解决方案

### 4.1 问题一：字体找不到（SC vs CN）

#### 错误信息
```
! Package fontspec Error:
The font "Source Han Serif SC SemiBold" cannot be found
```

#### 原因分析
- 模板使用旧版命名 `Source Han Serif SC`
- 实际安装的字体为 `Source Han Serif CN`

#### 诊断方法
```powershell
# 列出所有思源字体
D:\texlive\2026\bin\windows\fc-list.exe | Select-String "Source Han Serif"
```

#### 解决方案
```powershell
(Get-Content "D:\mdbook\template.tex") `
  -replace "Source Han Serif SC", "Source Han Serif CN" |
  Set-Content "D:\mdbook\template.tex" -Encoding UTF8
```

---

### 4.2 问题二：字体在用户目录不被识别

#### 错误信息
```
The font "Source Han Serif CN" cannot be found
```
（即使 fc-list 显示存在）

#### 原因分析
- 字体安装在 `C:\Users\<用户>\AppData\Local\Microsoft\Windows\Fonts\`（仅当前用户）
- XeLaTeX 只识别 `C:\Windows\Fonts\`（系统级）

#### 解决方案

**方案 A：复制到系统目录（推荐）**

⚠️ 需要**管理员权限**的 PowerShell

```powershell
Copy-Item "C:\Users\lenovo\AppData\Local\Microsoft\Windows\Fonts\SourceHanSerifCN-*.otf" `
          "C:\Windows\Fonts\" -Force
```

**方案 B：刷新 TeX Live 字体缓存**

```powershell
D:\texlive\2026\bin\windows\fc-cache.exe -fv
```

**方案 C：换用系统自带字体（最稳）**

```powershell
(Get-Content "D:\mdbook\template.tex") `
  -replace "Source Han Serif CN SemiBold", "SimSun" `
  -replace "Source Han Serif CN", "SimSun" |
  Set-Content "D:\mdbook\template.tex" -Encoding UTF8
```

---

### 4.3 问题三：`\texorpdfstring` 未定义

#### 错误信息
```
! Undefined control sequence.
<argument> \texorpdfstring
```

#### 原因分析
- Pandoc 自动在标题中插入 `\texorpdfstring`
- 该命令来自 `hyperref` 宏包
- 模板未加载该宏包

#### 解决方案

在 `template.tex` 的 `\begin{document}` 之前添加：

```latex
\usepackage{hyperref}
```

PowerShell 一键修复：

```powershell
$path = "D:\mdbook\template.tex"
(Get-Content $path -Raw) `
  -replace '\\begin\{document\}', "\usepackage{hyperref}`r`n\begin{document}" |
  Set-Content $path -Encoding UTF8
```

---

### 4.4 问题四：`\tightlist` 未定义

#### 错误信息
```
! Undefined control sequence.
l.55 \tightlist
```

#### 原因分析
- Pandoc 列表自动生成 `\tightlist` 命令
- 模板需要定义该命令

#### 解决方案

在模板 `\begin{document}` 之前添加：

```latex
\providecommand{\tightlist}{\setlength{\itemsep}{0pt}\setlength{\parskip}{0pt}}
```

---

### 4.5 问题五：裸 LaTeX 命令导致编译失败

#### 错误信息
```
! Missing $ inserted.
l.30 ... NAVIER-STOKES EQUATIONS\ast
```

或

```
l.68 ...condition \({ \pmb u } = 0\) on \partial
```

#### 原因分析
- Markdown 中包含**未用 `$` 包裹**的 LaTeX 命令
- 通常来自 PDF 复制粘贴的残留

#### 常见裸命令清单

| 错误 | 正确 |
|------|------|
| `\ast` | `$\ast$` |
| `\dagger` | `$\dagger$` |
| `\ddagger` | `$\ddagger$` |
| `\partial` | `$\partial$` |
| `\nabla` | `$\nabla$` |
| `\alpha` | `$\alpha$` |

#### 解决方案

**单个修复**：

```powershell
$path = "D:\mdbook\src\lunwei\2.md"
(Get-Content $path -Raw) `
  -replace '\\ast', '$^\ast$' `
  -replace '\\dagger', '$^\dagger$' `
  -replace '\\ddagger', '$^\ddagger$' |
  Set-Content $path -Encoding UTF8
```

**批量清洗脚本**：

```powershell
$path = "D:\mdbook\src\lunwei\2.md"
$content = Get-Content $path -Raw

$cmds = @('partial', 'alpha', 'beta', 'gamma', 'delta', 'epsilon',
          'theta', 'lambda', 'mu', 'nu', 'pi', 'rho', 'sigma',
          'tau', 'phi', 'omega', 'Omega', 'Delta', 'Gamma',
          'Sigma', 'Lambda', 'Theta', 'infty', 'nabla', 'cdot',
          'times', 'leq', 'geq', 'neq', 'in', 'subset', 'cup',
          'cap', 'forall', 'exists', 'rightarrow', 'leftarrow',
          'sum', 'int', 'prod', 'lim', 'sup', 'inf')

foreach ($cmd in $cmds) {
    $content = $content -replace "(?<!\$)\\$cmd(?![a-zA-Z])(?!\$)", "`$\$cmd`$"
}

Set-Content $path $content -Encoding UTF8
```

⚠️ **重要**：不要重复执行替换命令，否则会嵌套（如 `$^$^\ast$$`）。

---

### 4.6 问题六：PowerShell here-string 编码错误

#### 错误信息
```
! LaTeX Error: Missing \begin{document}.
l.1 @
```

#### 原因分析
- PowerShell 的 `@'...'@` 写入文件时编码异常
- BOM 或换行符问题

#### 解决方案

**用记事本手动编辑**（最稳）：

1. `notepad D:\mdbook\template.tex`
2. 全选删除
3. 粘贴新内容
4. **文件 → 另存为 → 编码选 UTF-8**

---

### 4.7 问题七：MiKTeX 与 TeX Live 共存冲突

#### 现象

```powershell
fc-cache -fv
# 实际运行的是 E:\MIKTEX\miktex\bin\x64\fc-cache.exe
```

#### 原因分析
- 系统装了两套 LaTeX
- PATH 优先级导致调用错误的 fc-cache

#### 解决方案

**使用完整路径**调用 TeX Live 工具：

```powershell
D:\texlive\2026\bin\windows\fc-cache.exe -fv
D:\texlive\2026\bin\windows\fc-list.exe
D:\texlive\2026\bin\windows\xelatex.exe
```

---

## 5. 完整模板

### 5.1 推荐 template.tex（稳定版）

```latex
\documentclass[a4paper,12pt,oneside]{article}

% ========== 基础宏包 ==========
\usepackage{amsmath, amssymb, amsthm}
\usepackage{geometry}
\usepackage{booktabs}
\usepackage{microtype}

% ========== 页面设置 ==========
\geometry{a4paper, left=2.5cm, right=2.5cm, top=3cm, bottom=3cm}

% ========== 中英文字体 ==========
\usepackage{xeCJK}
\usepackage{fontspec}

% 中文字体
\setCJKmainfont[
  BoldFont={Source Han Serif CN SemiBold},
  AutoFakeBold=true
]{Source Han Serif CN}

% 英文字体
\setmainfont{Times New Roman}

% ========== 行距与公式 ==========
\linespread{1.3}
\xeCJKsetup{CJKmath=true}

% ========== 数学定理环境 ==========
\newtheorem{theorem}{定理}[section]
\newtheorem{definition}[theorem]{定义}
\newtheorem{lemma}[theorem]{引理}
\renewcommand{\proofname}{证明}

% ========== Pandoc 必需命令 ==========
\usepackage{hyperref}
\providecommand{\tightlist}{%
  \setlength{\itemsep}{0pt}\setlength{\parskip}{0pt}}

\begin{document}
$body$
\end{document}
```

### 5.2 metadata.yaml 示例

```yaml
title: "论文标题"
author: "作者姓名"
date: "2026-06-05"
abstract: |
  这里是摘要内容...
```

---

## 6. 最佳实践

### 6.1 三种工作流对比

| 方式 | 难度 | 稳定性 | 适合场景 |
|------|------|--------|---------|
| **直接 LaTeX (.tex)** | 中 | ⭐⭐⭐⭐⭐ | 学术论文、复杂排版 |
| **干净 Markdown + Pandoc** | 低 | ⭐⭐⭐⭐ | 笔记、博客、报告 |
| **PDF 复制 → Markdown → PDF** | ❌ | ⭐ | **不推荐** |

### 6.2 Markdown 写作规范

✅ **正确写法**：

```markdown
# 一级标题

## 二级标题

正文文字，行内公式 $E = mc^2$，块级公式：

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

- 列表项 1
- 列表项 2
```

❌ **错误写法**：

```markdown
# Title with \ast symbol           ← 裸 LaTeX
公式 E = mc^2 没有 $ 包裹           ← 上下标会出错
on \partial \Omega                  ← 裸命令
```

### 6.3 LaTeX 源码编译最佳实践

获得 .tex 源码后：

```powershell
# 进入目录
cd "D:\path\to\source"

# 自动化编译（推荐）
D:\texlive\2026\bin\windows\latexmk.exe -xelatex main.tex

# 或手动编译
D:\texlive\2026\bin\windows\xelatex.exe main.tex
D:\texlive\2026\bin\windows\bibtex.exe main
D:\texlive\2026\bin\windows\xelatex.exe main.tex
D:\texlive\2026\bin\windows\xelatex.exe main.tex
```

---

## 7. 常用命令速查

### 7.1 字体相关

```powershell
# 列出所有中文字体
D:\texlive\2026\bin\windows\fc-list.exe :lang=zh

# 搜索特定字体
D:\texlive\2026\bin\windows\fc-list.exe | Select-String "Source"

# 刷新字体缓存
D:\texlive\2026\bin\windows\fc-cache.exe -fv

# 复制字体到系统目录（需管理员）
Copy-Item "C:\Users\<用户>\AppData\Local\Microsoft\Windows\Fonts\*.otf" `
          "C:\Windows\Fonts\" -Force
```

### 7.2 文件操作

```powershell
# 查看文件前 N 行
Get-Content "file.md" -TotalCount 10

# 查看指定范围行
Get-Content "file.md" | Select-Object -Skip 60 -First 20

# 搜索文件内容
Select-String -Path "file.tex" -Pattern "关键词"

# 替换文本
(Get-Content $path -Raw) -replace "旧", "新" |
  Set-Content $path -Encoding UTF8
```

### 7.3 编译命令

```powershell
# Markdown → PDF
pandoc input.md --template=template.tex `
  --pdf-engine=xelatex -o output.pdf

# LaTeX → PDF
latexmk -xelatex main.tex

# 清理临时文件
latexmk -c
```

---

## 8. 经验总结

### 8.1 核心教训

1. ✅ **字体名必须与系统完全一致**（区分 CN/SC/TC）
2. ✅ **字体安装要"为所有用户安装"**，避免用户目录问题
3. ✅ **Pandoc 模板必须包含 hyperref 和 tightlist**
4. ✅ **Markdown 中所有 LaTeX 命令必须用 `$` 包裹**
5. ✅ **优先使用 .tex 源码**，而非从 PDF 转回 Markdown
6. ✅ **使用 latexmk 自动化编译**，免去手动多次运行
7. ✅ **多个 LaTeX 发行版共存时，使用完整路径调用**

### 8.2 调试方法论

遇到错误时，按以下顺序排查：

```
1. 看错误行号 → 定位问题位置
       ↓
2. 看错误类型 → 字体？宏包？语法？
       ↓
3. 查模板配置 → 是否缺少必要定义？
       ↓
4. 查源文件 → 是否有非法字符？
       ↓
5. 简化测试 → 用最小可重现示例
       ↓
6. 换工具链 → Markdown 不行就用 LaTeX
```

### 8.3 推荐资源

- **texlive**: https://mirrors.tuna.tsinghua.edu.cn/CTAN/systems/texlive/Images/
注意：如果下载时看到一个几 KB 的 texlive.iso.sha256 别点错了，我们要下载的是那个 5 GB 左右的 texlive.iso 本体。

2. 解压/挂载与启动安装
挂载 ISO：下载完成后，在 Windows 10/11 系统中，直接双击这个 texlive.iso 文件，系统会自动把它像 U 盘一样挂载到一个新的盘符。

以管理员身份运行：进入这个虚拟盘，找到 install-tl-windows.bat。

⚠️ 死命令：必须右键点击它，选择“以管理员身份运行”。否则后面写入系统环境变量时会因为权限不足而静默失败，导致你白等半小时。

xelatex --version

- **Pandoc 文档**：https://pandoc.org/MANUAL.html
- **TeX Live 官网**：https://www.tug.org/texlive/
- **思源宋体下载**：https://github.com/adobe-fonts/source-han-serif
- **arXiv 论文源码**：每篇论文页面右侧 "Other formats → Download source"

### 8.4 项目实战回顾

本项目完整经历的问题：

| 序号 | 问题 | 耗时 | 解决方案 |
|------|------|------|---------|
| 1 | SC vs CN 字体名错误 | ⏱️ 15 min | 全局替换 |
| 2 | 用户字体目录不识别 | ⏱️ 20 min | 复制到系统目录 |
| 3 | hyperref 宏包缺失 | ⏱️ 5 min | 添加 \usepackage |
| 4 | tightlist 未定义 | ⏱️ 5 min | 添加 \providecommand |
| 5 | Markdown 裸 LaTeX | ⏱️ 30 min | 正则批量替换 |
| 6 | 替换命令重复执行 | ⏱️ 10 min | 反向修复 |
| 7 | PowerShell 编码问题 | ⏱️ 10 min | 改用记事本 |
| 8 | 最终方案：直接编译 .tex | ⏱️ 5 min | 下载 arXiv 源码 |

**总耗时**：约 100 分钟
**最终方案**：放弃 Markdown，直接使用 arXiv .tex 源码，**5 分钟编译成功** ✅

---

## 📌 附录 A：完整命令流程

```powershell
# ========== 准备阶段 ==========
# 1. 检查字体
D:\texlive\2026\bin\windows\fc-list.exe | Select-String "Source Han Serif"

# 2. 检查模板
Select-String -Path "D:\mdbook\template.tex" -Pattern "Source Han Serif"

# ========== 修复阶段 ==========
# 3. 修复字体名
(Get-Content "D:\mdbook\template.tex") `
  -replace "Source Han Serif SC", "Source Han Serif CN" |
  Set-Content "D:\mdbook\template.tex" -Encoding UTF8

# 4. 添加 hyperref 和 tightlist（手动编辑模板）
notepad D:\mdbook\template.tex

# ========== 编译阶段 ==========
# 5. Markdown → PDF
pandoc "D:\mdbook\src\lunwei\2.md" `
  --template="D:\mdbook\template.tex" `
  --metadata-file="D:\mdbook\metadata.yaml" `
  --pdf-engine="D:\texlive\2026\bin\windows\xelatex.exe" `
  -o "D:\mdbook\src\lunwei\output.pdf"

# 或者：LaTeX → PDF（推荐）
cd "D:\运行库\arXiv-2606.04831v1"
D:\texlive\2026\bin\windows\latexmk.exe -xelatex main.tex

# ========== 查看结果 ==========
start D:\mdbook\src\lunwei\output.pdf
```

---

## 📌 附录 B：常见错误速查表

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `font ... cannot be found` | 字体名错误或未安装 | 检查 fc-list，替换字体名 |
| `Undefined control sequence \texorpdfstring` | 缺 hyperref | 添加 `\usepackage{hyperref}` |
| `Undefined control sequence \tightlist` | 缺定义 | 添加 `\providecommand{\tightlist}{...}` |
| `Missing $ inserted` | 裸 LaTeX 命令 | 用 `$...$` 包裹 |
| `File ... not found` | 缺少 .cls 或图片 | 检查文件路径 |
| `Latexmk: Veto ... .bib ... didn't exist` | 缺参考文献 | 创建空 .bib 或忽略 |

---

**文档结束**

📧 如有问题或改进建议，欢迎补充完善本文档。

🎓 **核心箴言**：
> 论文用 LaTeX 写，笔记用 Markdown 写，不要把 PDF 复制到 Markdown 再转回 PDF。