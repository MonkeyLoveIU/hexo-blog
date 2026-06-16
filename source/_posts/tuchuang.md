---
title: 图床
date: 2025-12-11 17.32
cover: https://img.monkeyiu.icu/{year}/{month}/{md5}.{extName}/fourteen.webp
urlname: tu
categories: 技术
tags:
  - 图床
excerpt: 基于 Cloudflare R2
---



# 🖼️ 图床项目文档

> 基于 Cloudflare R2 的高性能图片托管解决方案

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare](https://img.shields.io/badge/Powered%20by-Cloudflare%20R2-orange.svg)](https://developers.cloudflare.com/r2/)

## 📖 项目简介

这是一个现代化的图床(图片托管)解决方案,利用 Cloudflare R2 对象存储提供快速、稳定、低成本的图片存储和分发服务。项目支持通过 PicList 等主流图床管理工具进行上传和管理,适合个人博客、内容创作者和开发者使用。

### ✨ 核心特性

- 🚀 **高性能存储** - 基于 Cloudflare R2,零出站费用,全球 CDN 加速
- 💰 **成本友好** - 10GB 免费存储额度,超出部分极低费率
- 🔒 **安全可靠** - S3 兼容 API,支持访问控制和加密存储
- 🛠️ **易于集成** - 兼容 PicList、PicGo 等主流图床工具
- ⚡ **即时访问** - 通过自定义域名或 R2.dev 快速访问图片
- 📊 **使用统计** - 查看存储用量和请求统计

## 🏗️ 系统架构

```
┌─────────────┐
│   用户端    │
│ (PicList等) │
└──────┬──────┘
       │ 上传/管理
       ▼
┌─────────────────────────────┐
│    Cloudflare R2 API        │
│  (S3 兼容接口)              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   R2 对象存储               │
│   - 图片文件存储            │
│   - 元数据管理              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Cloudflare CDN            │
│   - 全球边缘节点分发        │
│   - 自定义域名支持          │
└─────────────────────────────┘
```

## 🚀 快速开始

### 前置要求

- Cloudflare 账户(免费版即可)
- PicList 或其他 S3 兼容的图床工具
- 一个域名(可选,用于自定义访问地址)

### 第一步: 创建 R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **R2 Object Storage** 页面
3. 点击 **Create bucket** 创建新存储桶
4. 输入存储桶名称(如 `my-image-hosting`)
5. 选择存储位置(建议选择离目标用户最近的区域)

### 第二步: 生成 API 令牌

1. 在 R2 页面点击 **Manage R2 API Tokens**
2. 点击 **Create API Token**
3. 设置权限:
   - **Permission**: Admin Read & Write
   - **TTL**: 永久或自定义过期时间
4. 记录生成的:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

### 第三步: 配置 PicList

1. 下载并安装 [PicList](https://github.com/Kuingsmile/PicList)
2. 打开 PicList 设置,选择 **Amazon S3**
3. 填入配置信息:

```yaml
应用密钥ID: <你的 Access Key ID>
应用密钥: <你的 Secret Access Key>
桶名: my-image-hosting
文件路径: {year}/{month}/ (可自定义)
自定义节点: <你的 R2 Endpoint URL>
自定义域名: (可选,配置后使用)
```

4. 点击 **确定** 保存配置
5. 点击 **设为默认图床**

### 第四步: 配置公共访问(可选)

#### 方案 A: 使用 R2.dev 域名

1. 在 R2 存储桶设置中,启用 **Public access**
2. 获取自动生成的 `*.r2.dev` 域名
3. 在 PicList 中填入此域名作为自定义域名

#### 方案 B: 绑定自定义域名

1. 在 Cloudflare 添加你的域名
2. 在 R2 存储桶中点击 **Connect Domain**
3. 选择要绑定的域名或子域名(如 `img.yourdomain.com`)
4. Cloudflare 会自动配置 DNS 记录
5. 在 PicList 中使用此自定义域名

## 📝 使用指南

### 上传图片

**通过 PicList 上传:**

1. 拖拽图片到 PicList 上传区域
2. 或使用快捷键 Ctrl+Shift+P (Windows) / Cmd+Shift+P (Mac)
3. 上传成功后自动复制图片链接

**支持的图片格式:**
- JPEG/JPG
- PNG
- GIF
- WebP
- BMP
- SVG

### 图片管理

**查看已上传图片:**
- 在 PicList 的相册中查看所有已上传图片
- 支持预览、复制链接、删除等操作

**在 Cloudflare Dashboard 管理:**
1. 进入 R2 存储桶页面
2. 点击存储桶名称查看所有文件
3. 可进行查看、下载、删除等操作

### 获取图片链接

上传成功后,图片链接格式为:

```
https://your-custom-domain.com/{year}/{month}/filename.jpg
```

或

```
https://your-bucket.r2.dev/{year}/{month}/filename.jpg
```

## ⚙️ 高级配置

### 自定义上传路径

在 PicList 中可以设置文件路径模板:

```
{year}/{month}/{day}/        # 按日期分类
{year}/{month}/{md5}          # 使用 MD5 命名
images/{fullName}            # 保留原文件名
{year}/{month}/{timestamp}   # 使用时间戳
```

### 图片压缩

PicList 支持上传前自动压缩:

1. 在设置中启用 **上传前压缩**
2. 设置压缩质量(建议 80-90)
3. 可显著减少存储空间和加载时间

### 设置访问控制

**限制公共访问:**

如果只想在特定应用中使用,不启用 Public Access,仅通过 S3 API 访问。

## 💡 最佳实践


### 命名规范

- 使用英文和数字命名
- 避免特殊字符和空格
- 建议使用时间戳或哈希值避免重名

### 备份策略

虽然 R2 提供高可靠性,仍建议:

1. 定期导出重要图片清单
2. 关键图片保留本地副本
3. 使用版本控制(如果需要)

### 性能优化

- 上传前适当压缩图片(80-90% 质量)
- 使用 WebP 格式提升性能
- 启用 CDN 缓存加速访问
- 为图片添加合适的缓存头

## 📊 费用说明

### Cloudflare R2 定价

| 项目 | 免费额度 | 超出费用 |
|------|---------|---------|
| 存储空间 | 10 GB | $0.015/GB/月 |
| Class A 操作 | 100万次/月 | $4.50/百万次 |
| Class B 操作 | 1000万次/月 | $0.36/百万次 |
| 出站流量 | **完全免费** | **完全免费** |

> **注意**: R2 最大的优势是零出站费用,相比 AWS S3 可节省大量成本。

### 成本估算示例

**个人博客场景:**
- 存储: 5GB 图片
- 月访问: 10万次
- **预计费用**: $0(在免费额度内)

**中型网站场景:**
- 存储: 50GB 图片
- 月访问: 500万次
- **预计费用**: 约 $0.60/月




## 🤝 常见问题


**Q: 支持哪些图片格式?**

A: 支持所有常见格式,包括 JPEG、PNG、GIF、WebP、SVG 等。


**Q: 图片会被压缩吗?**

A: R2 不会自动压缩,保持原始质量。建议在上传前使用 PicList 的压缩功能。

## 📚 参考资源

- [Cloudflare R2 官方文档](https://developers.cloudflare.com/r2/)
- [PicList GitHub 仓库](https://github.com/Kuingsmile/PicList)
- [S3 API 兼容性说明](https://developers.cloudflare.com/r2/api/s3/api/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- Cloudflare 提供优秀的 R2 存储服务
- PicList 团队开发的出色图床工具
