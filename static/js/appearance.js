(() => {
    let saved;
    try { saved = localStorage.getItem('site-appearance'); } catch (_) {}
    document.documentElement.dataset.theme = saved === 'light' || saved === 'dark'
        ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();
