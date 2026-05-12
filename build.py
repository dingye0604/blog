#!/usr/bin/env python3
"""静态站点生成器：读取 content/ 下的 Markdown，生成 output/ 下的 HTML。"""

import os
import shutil
from pathlib import Path
from collections import defaultdict

import frontmatter
import markdown
from jinja2 import Environment, FileSystemLoader

# ── 配置 ──────────────────────────────────────────
CONTENT_DIR = Path("content")
TEMPLATES_DIR = Path("templates")
STATIC_DIR = Path("static")
OUTPUT_DIR = Path("output")

# ── Jinja2 ────────────────────────────────────────
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=True,
)

# Markdown 扩展：表格、脚注、 fenced code、TOC
md = markdown.Markdown(extensions=[
    "extra",
    "toc",
    "fenced_code",
    "nl2br",
])


def get_articles():
    """扫描 content/ 下的 .md 文件，返回按日期倒序的文章列表。"""
    articles = []
    for md_path in sorted(CONTENT_DIR.rglob("*.md")):
        post = frontmatter.load(str(md_path))
        rel = md_path.relative_to(CONTENT_DIR)
        year = rel.parts[0]
        slug = rel.stem
        url = f"/{year}/{slug}.html"
        articles.append({
            "meta": post.metadata,
            "content": post.content,
            "year": year,
            "slug": slug,
            "url": url,
            "path": md_path,
        })

    def _date_key(a):
        d = a["meta"].get("date", "")
        if hasattr(d, "strftime"):
            return d.strftime("%Y-%m-%d")
        return str(d)

    articles.sort(key=_date_key, reverse=True)
    return articles


def copy_static():
    """复制 static/ 到 output/static/。"""
    dst = OUTPUT_DIR / "static"
    if dst.exists():
        shutil.rmtree(dst)
    if STATIC_DIR.exists():
        shutil.copytree(STATIC_DIR, dst)


def copy_content_assets():
    """复制 content/ 下的非 .md 文件（图片、PDF 等）到 output/。"""
    for item in CONTENT_DIR.rglob("*"):
        if item.is_file() and item.suffix.lower() not in (".md", ".txt"):
            rel = item.relative_to(CONTENT_DIR)
            dst = OUTPUT_DIR / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, dst)


def build_index(articles):
    """生成首页。"""
    template = env.get_template("index.html")
    html = template.render(articles=articles)
    (OUTPUT_DIR / "index.html").write_text(html, encoding="utf-8")


def build_articles(articles):
    """生成每篇文章的详情页。"""
    template = env.get_template("article.html")
    for art in articles:
        md.reset()
        body_html = md.convert(art["content"])
        toc = md.toc

        html = template.render(
            article=art,
            content=body_html,
            toc=toc,
            articles=articles,
        )

        out = OUTPUT_DIR / art["year"] / f"{art['slug']}.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")


def build_year_pages(articles):
    """生成年份归档页（如 /2024/index.html）。"""
    by_year = defaultdict(list)
    for a in articles:
        by_year[a["year"]].append(a)

    template = env.get_template("year.html")
    for year, arts in sorted(by_year.items(), reverse=True):
        html = template.render(year=year, articles=arts, all_articles=articles)
        out = OUTPUT_DIR / year / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")


def build():
    """完整构建流程。"""
    # 清理并重建输出目录
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True)

    copy_static()
    copy_content_assets()

    articles = get_articles()
    if not articles:
        print("Warning: no .md files found in content/")
        return

    build_index(articles)
    build_articles(articles)
    build_year_pages(articles)

    print(f"Built {len(articles)} articles -> {OUTPUT_DIR}")


if __name__ == "__main__":
    build()
