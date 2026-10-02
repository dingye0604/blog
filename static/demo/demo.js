(() => {
  'use strict';
  const embedded = window.parent !== window;
  if (embedded) document.body.classList.add('embedded');
  const glass = document.querySelector('#glass-styles');
  const content = document.querySelector('#note-content');
  const reading = content.innerHTML;
  const notes = {
    reading: {title:'阅读与写作', html:reading},
    project: {title:'项目手记', html:'<h1>项目手记</h1><p class="demo-lead">从日常使用里，找到值得改进的细节。</p><h2>AbsolutelyBaseline</h2><p>在 Baseline 的基础上调整配色与排版。暖色中性背景、衬线正文，以及少量陶土色点缀。</p><h2>AbsolutelyGlass</h2><p>保留基础主题的配色和排版，增加半透明面板、模糊与边缘高光。</p><blockquote><p>主题负责视觉，笔记仍然属于你。</p></blockquote><h2>在这里体验</h2><p>切换主题、选择明暗模式，或调节玻璃面板的不透明度。这里呈现的是网页中的主题效果。</p>'},
    signal: {title:'信号与系统', html:'<h1>信号与系统</h1><p class="demo-lead">一页学习笔记，看看公式、代码和表格的样子。</p><h2>离散时间卷积</h2><p>对离散时间线性时不变系统，零状态响应可由输入 x[n] 与单位冲激响应 h[n] 卷积得到（假设卷积存在）。</p><pre><code>y[n] = Σ x[k] h[n − k]\n       k = −∞ … +∞</code></pre><h2>一个有限长例子</h2><pre><code>x = [1, 2, 1]\nh = [1, -1]\ny = [1, 1, -1, -1]</code></pre><table><thead><tr><th>序列</th><th>长度</th></tr></thead><tbody><tr><td>输入 x</td><td>3</td></tr><tr><td>冲激响应 h</td><td>2</td></tr><tr><td>输出 y</td><td>4</td></tr></tbody></table><h2>边界条件</h2><p>上面的有限长序列均从 n = 0 起，其余位置补零。线性卷积结果长度为 3 + 2 − 1 = 4。</p>'}
  };
  function outline() {
    const nav = document.querySelector('#outline'); nav.replaceChildren();
    content.querySelectorAll('h2').forEach((heading, i) => {
      heading.id = 'section-' + i;
      const a = document.createElement('a'); a.href = '#' + heading.id; a.textContent = heading.textContent;
      a.addEventListener('click', event => { event.preventDefault(); heading.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); });
      nav.append(a);
    });
  }
  document.querySelectorAll('[data-note]').forEach(button => button.addEventListener('click', () => {
    const note = notes[button.dataset.note]; content.innerHTML = note.html;
    document.querySelector('#tab-title').textContent = note.title;
    document.querySelector('#breadcrumb').textContent = '我的空间 / ' + note.title;
    document.querySelectorAll('[data-note]').forEach(b => { const active = b === button; b.classList.toggle('is-active',active); b.setAttribute('aria-pressed',String(active)); });
    document.querySelector('.markdown-preview-view').scrollTop = 0; outline();
  }));
  function apply({theme, mode, opacity}) {
    if (theme === 'glass' || theme === 'baseline') {
      glass.disabled = theme === 'baseline'; document.body.classList.toggle('baseline', theme === 'baseline');
      document.querySelector('#demo-theme').value = theme;
    }
    if (mode === 'light' || mode === 'dark') {
      document.body.classList.remove('theme-light','theme-dark'); document.body.classList.add('theme-' + mode);
      document.querySelector('#demo-mode').value = mode;
    }
    if (typeof opacity === 'number' && Number.isFinite(opacity)) document.body.style.setProperty('--ca-panel-opacity',String(Math.max(0,Math.min(1,opacity))));
  }
  document.querySelector('#demo-theme').addEventListener('change', e => apply({theme:e.target.value}));
  document.querySelector('#demo-mode').addEventListener('change', e => apply({mode:e.target.value}));
  window.addEventListener('message', e => {
    if (e.source !== parent || e.origin !== location.origin || e.data?.type !== 'theme-config') return;
    apply(e.data);
  });
  // Pointer coordinates are forwarded only to the same-origin host for surface motion.
  const pointer = matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  let point = null, frame = 0;
  document.addEventListener('pointermove', e => {
    if (!embedded || !pointer.matches) return;
    point = {type:'preview-pointer', x:e.clientX, y:e.clientY};
    if (!frame) frame = requestAnimationFrame(() => { parent.postMessage(point,location.origin); frame = 0; });
  }, {passive:true});
  document.addEventListener('pointerleave', () => { if (embedded) parent.postMessage({type:'preview-leave'},location.origin); });
  outline();
  if (embedded) parent.postMessage({type:'preview-ready'},location.origin);
})();
