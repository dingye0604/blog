# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概况

**迟到了的碎碎念** — 个人随笔博客。静态站点，无服务器、无数据库，Markdown 写文章，Python 生成 HTML，托管于 GitHub Pages（国内可访问）。

## 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 站点生成 | **自定义 Python 脚本** | 熟悉 Python，全控制，无框架锁 |
| 模板引擎 | **Jinja2** | Python 生态，灵活 |
| 内容格式 | **Markdown + Frontmatter** | 易读写，VS Code 原生支持 |
| 图片 | **content/ 目录下直接存放** | 构建时自动复制到 output/ |
| 前端 | **纯 HTML + CSS + 少量 Vanilla JS** | 轻量，无需构建工具链 |
| 部署 | **GitHub Pages** | 免费，国内可访问，无服务器 |
| 字体 | 系统字体栈（宋体/无衬线） | 无需加载外部字体，国内访问快 |

## 目录结构

```
D:\web\
├── CLAUDE.md                 # 本文件
├── build.py                  # 主构建脚本（读取 content/ → 生成 output/）
├── requirements.txt          # Python 依赖
├── content/                  # 文章源文件 (.md)
│   ├── 2024/
│   │   ├── 好东西.md
│   │   ├── 悠闲.md
│   │   └── ...
│   ├── 2025/
│   │   └── ...
│   └── 2026/
│       └── ...
├── templates/                # Jinja2 模板
│   ├── base.html             # 基础骨架（header/nav/footer）
│   ├── index.html            # 首页（文章列表）
│   ├── article.html          # 文章页
│   └── year.html             # 年份归档页
├── static/                   # 前端静态资源
│   ├── css/
│   │   └── style.css         # 全局样式
│   ├── js/
│   │   └── main.js           # 交互脚本
│   └── images/               # 图片资源
├── output/                   # 构建输出（git 推送的目录）
│   ├── index.html
│   ├── 2024/
│   ├── 2025/
│   ├── 2026/
│   ├── static/
│   └── ...
├── 2024/                     # 原始 .docx 存档（不参与构建）
├── 2025/
├── 2026/
└── README.md
```

## 文章规范

### Frontmatter

每篇 Markdown 文章以 YAML frontmatter 开头：

```yaml
---
title: 灯与烟
date: 2026-05-08
tags: [随笔, 南京]
desc: 从逛灯会写起，论拥挤、拜神与存在的意义。
---
```

### 写作约定

- 文件名：中文标题（与 `title` 一致），`.md` 扩展名
- 分类：按年份放在 `content/YYYY/` 下
- 图片：放在 `content/YYYY/` 或 `content/YYYY/images/` 下，在 Markdown 中用相对路径引用（如 `![描述](images/photo.jpg)`）。构建时会自动复制所有非 `.md` 文件到 `output/`
- 标签：小范围标签集，保持一致性（常用标签：随笔、书评、影评、辩论、南京、莆田、成长、社会）

### 从 .docx 迁移

```
pip install python-docx
python scripts/convert_docx.py content/2026/灯与烟.docx  →  需手动整理为 Markdown
```

docx→md 无法完全自动化（格式、分段需要人工调整），转换脚本只做文本提取，最终格式由人工整理。

## 构建 & 开发

```bash
# 安装依赖
pip install -r requirements.txt

# 构建站点（读取 content/ → 写入 output/）
python build.py

# 本地预览
python -m http.server 8000 -d output/
# 浏览器访问 http://localhost:8000

# 构建 + 预览（一步）
python build.py && python -m http.server 8000 -d output/
```

## 部署（GitHub Pages）

```bash
# 方案 A：推送到 gh-pages 分支
git checkout gh-pages
cp -r output/* .
git add -A && git commit -m "deploy"
git push origin gh-pages

# 方案 B：用 GitHub Actions 自动部署（后续配置）
```

部署相关操作（git push、新建分支等）须先问我。

## 前端设计原则

风格：现代中式杂志风，墨韵纸香。

- **整体布局**：最大宽度 1020px，正文内容区限制 780px 保证阅读舒适
- **配色**：暖白底色（#faf8f5），深灰正文（#2c2c2c），朱砂红点缀（#9e4a3e）
- **排版**：正文 17px/1.85 行高，标题与正文形成强烈字体对比
- **留白**：大量呼吸空间，段落间距大于常规
- **装饰**：极简，细线分割、卡片左侧朱砂红悬停指示线、引用块装饰引号
- **动效**：页面淡入、导航栏滚动阴影、卡片悬停反馈、图片悬停放大
- **响应式**：优先桌面阅读体验，兼顾移动端

## 交互功能（后续迭代）

- 文章目录/归档时间线
- 标签筛选
- 全文搜索（前端索引）
- 阅读进度指示
- 文章字数统计 & 阅读时长估计
- 评论区（可接入第三方如 giscus/utterances，基于 GitHub Issues）

## Git 纪律

- 不提交 `output/` 目录（由 GitHub Actions 构建部署，或部署时单独处理）
- 不提交 `.env`、密钥、token
- 不提交 `__pycache__/`、`.pyc` 文件
- 不提交 `static/` 中自动生成的资源
