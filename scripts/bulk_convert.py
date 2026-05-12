#!/usr/bin/env python3
"""批量将 .docx 转换为 Markdown 并存入 content/。"""

import os
import re
import shutil
from datetime import datetime
from pathlib import Path

from docx import Document

ROOT = Path("D:/web")
CONTENT = ROOT / "content"

# 已转换的文件（跳过）
SKIP_FILES = {
    "好东西.docx", "二十一梦.docx", "灯与烟.docx"
}

def infer_tags(title: str) -> list:
    """从标题推断标签。"""
    t = title.lower()
    tags = []
    if any(k in t for k in ["辩", "国辩", "半决赛"]):
        tags.append("辩论")
    if any(k in t for k in ["红楼", "西游", "水浒", "三国", "金庸", "鲁迅"]):
        tags.append("书评")
    if any(k in t for k in ["电影", "观后感", "影评", "好东西", "灯"]):
        tags.append("影评")
    if any(k in t for k in ["石宇奇", "体育", "奥运", "比赛", "羽球"]):
        tags.append("随笔")
    if not tags:
        tags.append("随笔")
    # 额外判断
    if any(k in t for k in ["南京", "瞻琪", "石室岩"]):
        if "南京" not in tags:
            tags.append("南京")
    return tags


def docx_to_markdown(docx_path: Path) -> str:
    """提取 docx 文本，保留段落。"""
    doc = Document(str(docx_path))
    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)
    return "\n\n".join(paragraphs)


def make_frontmatter(title: str, date_str: str, tags: list) -> str:
    tags_str = ", ".join(f'"{t}"' for t in tags)
    return f"""---
title: {title}
date: {date_str}
tags: [{tags_str}]
---

"""


def process_year(year_dir: Path):
    """处理某一年份目录下的所有文件。"""
    year = year_dir.name
    content_year = CONTENT / year
    content_year.mkdir(parents=True, exist_ok=True)

    for item in sorted(year_dir.iterdir()):
        if item.name.startswith("~$"):
            continue  # Word 临时文件

        if item.suffix.lower() == ".docx":
            if item.name in SKIP_FILES:
                print(f"  [skip] {item.name}")
                continue

            title = item.stem
            # 清理文件名中的额外信息
            title = re.sub(r"\s*陈顶立（.*?）\s*", "", title).strip()
            title = re.sub(r"\s*（.*?）\s*", "", title).strip()

            # 日期：优先用文件修改时间
            mtime = datetime.fromtimestamp(item.stat().st_mtime)
            date_str = mtime.strftime("%Y-%m-%d")

            tags = infer_tags(title)

            md_path = content_year / f"{title}.md"
            if md_path.exists():
                print(f"  [exists] {md_path.name}")
                continue

            text = docx_to_markdown(item)
            frontmatter = make_frontmatter(title, date_str, tags)
            md_path.write_text(frontmatter + text, encoding="utf-8")
            print(f"  [convert] {item.name} -> {md_path.name}")

        elif item.suffix.lower() in (".md",):
            # 复制已有的 Markdown 文件
            dst = content_year / item.name
            if not dst.exists():
                shutil.copy2(item, dst)
                print(f"  [copy md] {item.name}")

        elif item.suffix.lower() in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"):
            # 复制图片
            dst = content_year / item.name
            if not dst.exists():
                shutil.copy2(item, dst)
                print(f"  [copy img] {item.name}")


def main():
    print("批量转换开始...\n")
    for year in ["2024", "2025", "2026"]:
        year_dir = ROOT / year
        if not year_dir.exists():
            continue
        print(f"[{year}]")
        process_year(year_dir)
        print()
    print("完成。")


if __name__ == "__main__":
    main()
