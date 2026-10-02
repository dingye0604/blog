# 迟到了的碎碎念

Python + Jinja2 静态个人网站。首页展示开源主题与最新文字，文章仍按 content/YYYY/ 管理。

## 本次改版

- 首页、作品、文字归档与关于页；原有 17 篇文章和年份归档 URL 不变。
- 首页只保留简短作品介绍，交互演示集中在作品页。
- 界面使用霞鹜文楷；原有宋体正文、文章标题与等宽代码字体保持不变。字体使用本机字体或自托管 WOFF2 子集，未安装字体的访客也可加载。
- 暖白 / 石墨灰配色，网站外观自动跟随系统，可手动切换并记住选择。
- 项目实时预览位于 static/demo/，iframe 隔离，使用 static/vendor/ 的原始主题 CSS。
- 主题、预览明暗、笔记和大纲可切换，Glass 可调面板不透明度。
- 鼠标轻微倾斜与局部高光；移动端和 reduced-motion 简化。没有后台持续动画循环。
- 文章列表以条目自身中心轻微倾斜，离开平滑复位，覆盖首页、文字页与年份归档。演示文档标签去掉应用关闭按钮的预留空间，保持标题水平及垂直居中。
- 无截图依赖；不包含 Obsidian 本体、app.css、用户笔记或 Windows Acrylic 插件。
- 上游许可、字体许可、源地址和 SHA-256 见 static/vendor/NOTICE.md、sources.json。

## 构建与预览

正常的项目环境可运行：

```powershell
.\venv\Scripts\python.exe build.py --output-dir output/preview-local
.\venv\Scripts\python.exe -m http.server 8000 --bind 127.0.0.1 -d output/preview-local
```

当前机器原有 venv 的 Python 启动器引用了不可用的 WindowsApps Python。此次使用现有 Codex Python 运行时，并加载 venv 中已安装的依赖，未安装或修改全局依赖：

```powershell
& 'C:\Users\CDL\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -c "import sys,runpy; sys.path.insert(0,'D:/web/venv/Lib/site-packages'); sys.argv=['build.py','--output-dir','output/preview-20261002']; runpy.run_path('build.py',run_name='__main__')"
& 'C:\Users\CDL\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 8000 --bind 127.0.0.1 -d output/preview-20261002
```

浏览器访问 http://127.0.0.1:8000/ 。上述 Codex 路径只用于本机开发，网站产物不依赖它。依赖版本仍见 requirements.txt。

子路径构建：`python build.py --output-dir output/subpath-preview/blog --base-url /blog`。
构建现在覆盖同名产物但不删除目录；需要干净产物时选一个新的输出目录，以免旧文件残留。不要将本机备份或验证目录发布。

## 浏览器验证

可复现脚本使用已有 Playwright 与 Microsoft Edge，无需安装项目 npm 依赖：

```powershell
$env:PLAYWRIGHT_MODULE = 'C:/Users/CDL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
node scripts/verify_preview.cjs
```

先在端口 8000 启动预览。脚本生成 output/playwright/results.json 与截图，包括：

- Glass / Baseline × 浅色 / 深色的真实 computed styles。
- Glass 透明度、笔记内容、大纲滚动、键盘 Enter 操作。
- 网站外观持久化、鼠标驱动 transform、reduced-motion。
- 首页、作品、文字、关于和最新文章的浏览器运行。
- 390px / 320px 布局、独立演示、无 JavaScript 降级。
- 页面运行错误与 HTTP 资源错误。

2026-10-03 本机结果：上述检查通过，浏览器错误 0。另对根路径及 /blog 两份构建各检查 295 个本地链接，缺失 0；上游 CSS SHA-256 一致。桌面、手机尺寸、文章页和主题截图已人工查看。

这些结果来自 Edge 的浏览器模拟尺寸；未进行真实手机、Safari、Lighthouse 或 Windows 原生 Acrylic 验证。网页预览的基础布局为本项目提供，不能当作完整 Obsidian 的功能验证。

第二轮细节验证通过：四种主题组合的文档标签中心偏差均为 0px；三个文章列表页面的倾斜、中心原点、离开复位和 reduced-motion 均通过。强制绕过 local() 后，浏览器实际加载自托管字体，渲染字体确认为 Site WenKai。首页不再加载演示 iframe；浏览器运行与资源错误仍为 0。

## 字体维护

`static/fonts/site-wenkai.woff2` 是霞鹜文楷 Regular 的网页子集（2507 字符，563412 字节），内部名称为 Site WenKai。保留上游版权与完整 OFL，见同目录 `LXGWWenKai.OFL.txt`；来源及哈希见 `source.json`。不修改或安装系统字体。

新增界面文字如包含当前子集没有的字，需要重新生成；否则这些字会使用后备字体。生成脚本扫描现有文章、模板、演示和交互脚本，常规构建不需要字体工具。此次复用已有环境中的 fontTools / Brotli：

```powershell
& D:\conda\envs\ISACsrtp\python.exe scripts\subset_ui_font.py C:\Users\CDL\AppData\Local\Microsoft\Windows\Fonts\LXGWWenKai-Regular.ttf
```

字体许可来源：https://github.com/lxgw/LxgwWenKai/blob/main/OFL.txt 。字体文件与 CSS 均由本站提供，不依赖外部字体 CDN。

## 保留与恢复

改版前备份在 output/redesign-backup-20261002-233953/，包含 build.py、AGENTS.md、.gitignore、templates/ 和 static/。原始 content/ 与 D:/obsidianPlugin 未修改。

第二轮细化前备份在 output/refinement-backup-20261003-001514/，保留上一轮 templates/、static/、scripts/、AGENTS.md 与本说明。

需要恢复时先保存当前改动，再从备份复制回对应文件。新增文件单独审阅处理，不执行批量删除或 git reset。推送 main 会触发现有 GitHub Pages 工作流；发布结果以对应提交的 Action 和线上页面为准。
