(() => {
  'use strict';
  const root = document.documentElement;
  const appearance = document.querySelector('.appearance-toggle');
  const updateAppearance = () => { const dark = root.dataset.theme === 'dark'; appearance.textContent = dark ? '浅色' : '深色'; appearance.setAttribute('aria-label',dark?'切换为浅色网站':'切换为深色网站'); };
  updateAppearance();
  appearance.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('site-appearance',root.dataset.theme); } catch (_) {}
    updateAppearance();
  });
  matchMedia('(prefers-color-scheme:dark)').addEventListener('change', e => {
    let saved; try { saved = localStorage.getItem('site-appearance'); } catch (_) {}
    if (!saved) { root.dataset.theme = e.matches?'dark':'light'; updateAppearance(); }
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    const path = new URL(a.href).pathname;
    const article = /\/\d{4}\//.test(location.pathname);
    if (path === location.pathname || (article && path.endsWith('/writing.html'))) a.setAttribute('aria-current','page');
  });
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  if (!reduce.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:.04});
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('will-reveal'); observer.observe(el); });
    reduce.addEventListener('change', () => { if (reduce.matches) { observer.disconnect(); document.querySelectorAll('.will-reveal').forEach(el => el.classList.add('is-visible')); } });
  }
  // Article motion is independent of the project iframe. Measure the resting row
  // once on entry so its transformed bounds cannot feed back into the rotation.
  const articleMotion = matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference) and (min-width:768px)');
  document.querySelectorAll('.editorial-row,.article-card').forEach(row => {
    row.classList.add('article-tilt');
    let bounds, entryScroll=0, tx=0, ty=0, x=0, y=0, raf=0, previous=0;
    function tick(now) {
      const blend=1-Math.exp(-Math.min(now-(previous||now-16),64)/105); previous=now;
      x+=(tx-x)*blend; y+=(ty-y)*blend;
      if (Math.abs(tx-x)+Math.abs(ty-y)<.001) { x=tx;y=ty; }
      row.style.setProperty('--article-rx',(-y*1.8).toFixed(3)+'deg');
      row.style.setProperty('--article-ry',(x*.65).toFixed(3)+'deg');
      if (x!==tx || y!==ty) raf=requestAnimationFrame(tick);
      else { raf=0;previous=0; }
    }
    function reset() { tx=ty=0; if (!raf && (x || y)) raf=requestAnimationFrame(tick); }
    row.addEventListener('pointerenter',()=> { bounds=row.getBoundingClientRect(); entryScroll=window.scrollY; });
    row.addEventListener('pointermove',event=> {
      if (!articleMotion.matches || !bounds) return;
      tx=Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
      ty=Math.max(-1,Math.min(1,(event.clientY-bounds.top+window.scrollY-entryScroll)/bounds.height*2-1));
      if (!raf) raf=requestAnimationFrame(tick);
    },{passive:true});
    row.addEventListener('pointerleave',reset);
    row.addEventListener('pointercancel',reset);
    articleMotion.addEventListener('change',reset);
    window.addEventListener('blur',reset);
    window.addEventListener('resize',()=> { bounds=null;reset(); },{passive:true});
  });
  const iframe = document.querySelector('#theme-preview');
  if (!iframe) return;
  const shell = document.querySelector('.preview-shell');
  const slider = document.querySelector('#glass-opacity');
  const state = {type:'theme-config', theme:'glass', mode:root.dataset.theme || 'light', opacity:.64};
  const send = () => iframe.contentWindow?.postMessage(state,location.origin);
  function controls() {
    document.querySelectorAll('[data-preview-theme]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.previewTheme === state.theme)));
    document.querySelectorAll('[data-preview-mode]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.previewMode === state.mode)));
    slider.disabled = state.theme !== 'glass';
    slider.closest('label').classList.toggle('is-disabled',slider.disabled);
    document.querySelector('#preview-status').textContent = (state.theme === 'glass'?'AbsolutelyGlass':'AbsolutelyBaseline') + ' · ' + (state.mode==='light'?'浅色':'深色');
    send();
  }
  document.querySelectorAll('[data-preview-theme]').forEach(b => b.addEventListener('click', () => { state.theme=b.dataset.previewTheme; controls(); }));
  document.querySelectorAll('[data-preview-mode]').forEach(b => b.addEventListener('click', () => { state.mode=b.dataset.previewMode; controls(); }));
  slider.addEventListener('input', () => { state.opacity=Number(slider.value)/100; document.querySelector('output[for=glass-opacity]').textContent=slider.value+'%'; send(); });
  iframe.addEventListener('load',send); controls();
  const canMove = matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference) and (min-width:768px)');
  let targetX=0,targetY=0,x=0,y=0,raf=0,last=0;
  function tick(now) {
    const blend=1-Math.exp(-Math.min(now-(last||now-16),64)/100); last=now;
    x+=(targetX-x)*blend; y+=(targetY-y)*blend;
    shell.style.setProperty('--rx',(-y*1.4).toFixed(3)+'deg'); shell.style.setProperty('--ry',(x*1.7).toFixed(3)+'deg');
    if (Math.abs(targetX-x)+Math.abs(targetY-y)>.002) raf=requestAnimationFrame(tick); else { raf=0;last=0; }
  }
  function position(px,py) {
    if (!canMove.matches) return;
    const rect=shell.getBoundingClientRect();
    targetX=Math.max(-1,Math.min(1,(px-rect.left)/rect.width*2-1)); targetY=Math.max(-1,Math.min(1,(py-rect.top)/rect.height*2-1));
    shell.style.setProperty('--mx',(px-rect.left)+'px'); shell.style.setProperty('--my',(py-rect.top)+'px');
    if (!raf) raf=requestAnimationFrame(tick);
  }
  function reset() { targetX=targetY=0; if (!raf) raf=requestAnimationFrame(tick); }
  shell.addEventListener('pointermove',e=>position(e.clientX,e.clientY),{passive:true}); shell.addEventListener('pointerleave',reset);
  canMove.addEventListener('change',reset);
  window.addEventListener('blur',reset);
  window.addEventListener('message',e=>{
    if (e.source!==iframe.contentWindow || e.origin!==location.origin) return;
    if (e.data?.type==='preview-ready') send();
    if (e.data?.type==='preview-pointer' && Number.isFinite(e.data.x) && Number.isFinite(e.data.y)) { const rect=iframe.getBoundingClientRect();position(rect.left+e.data.x,rect.top+e.data.y); }
    if (e.data?.type==='preview-leave') reset();
  });
})();
