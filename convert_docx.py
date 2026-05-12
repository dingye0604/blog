from docx import Document
import os
import sys

files = [
    ("D:/web/2024/好东西.docx", "D:/web/content/2024/好东西.md", "2024"),
    ("D:/web/2025/二十一梦.docx", "D:/web/content/2025/二十一梦.md", "2025"),
    ("D:/web/2026/灯与烟.docx", "D:/web/content/2026/灯与烟.md", "2026"),
]

for docx_path, md_path, year in files:
    if not os.path.exists(docx_path):
        print(f"Warning: {docx_path} not found, skipping.")
        continue

    doc = Document(docx_path)
    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)

    title = os.path.splitext(os.path.basename(docx_path))[0]
    # Infer date from directory year, use Jan 1 as placeholder
    date = f"{year}-01-01"

    frontmatter = f"""---
title: {title}
date: {date}
---

"""

    content = frontmatter + "\n\n".join(paragraphs)

    os.makedirs(os.path.dirname(md_path), exist_ok=True)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Created: {md_path}")
