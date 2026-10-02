const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
fs.mkdirSync('output/playwright',{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const errors=[]; const results=[];
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400) errors.push(r.status()+' '+r.url());});
 await page.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('iframe').count(),0,'Home must not load the demo');
 const articleLinks=await page.locator('.editorial-row').evaluateAll(es=>es.map(e=>e.href));
 assert.equal(articleLinks.length,3);
 assert.match(await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily),/Site WenKai/);
 assert.match(await page.locator('.editorial-row h3').first().evaluate(e=>getComputedStyle(e).fontFamily),/Songti/);
 await page.goto('http://127.0.0.1:8000/projects.html',{waitUntil:'networkidle'});
 const f=page.frameLocator('#theme-preview');
 for (const theme of ['glass','baseline']) for (const mode of ['light','dark']) {
   await page.locator(`[data-preview-theme="${theme}"]`).click(); await page.locator(`[data-preview-mode="${mode}"]`).click();
   await page.waitForTimeout(700);
   assert.equal(await f.locator('#glass-styles').evaluate(e=>e.disabled),theme==='baseline');
   assert(await f.locator('body').evaluate((e,m)=>e.classList.contains('theme-'+m),mode));
   const style=await f.locator('.mod-root .workspace-leaf-content').evaluate(e=>({blur:getComputedStyle(e).backdropFilter,bg:getComputedStyle(e).backgroundColor}));
   assert.equal(style.blur.includes('24px'),theme==='glass');
   await page.locator('.preview-shell').screenshot({path:`output/playwright/${theme}-${mode}.png`});
   const center=await f.locator('.workspace-tab-header.is-active').evaluate(e=>{
     const r=e.getBoundingClientRect(),t=e.querySelector('span').getBoundingClientRect();
     return {dx:t.x+t.width/2-r.x-r.width/2,dy:t.y+t.height/2-r.y-r.height/2};
   });
   assert(Math.abs(center.dx)<1 && Math.abs(center.dy)<1,'Tab title must be centered');
   results.push({theme,mode,...style,center});
 }
 await page.locator('[data-preview-theme="glass"]').click(); await page.locator('[data-preview-mode="light"]').click();
 await page.locator('#glass-opacity').fill('28');
 await page.waitForTimeout(200);
 assert.equal(await f.locator('body').evaluate(e=>e.style.getPropertyValue('--ca-panel-opacity')),'0.28');
 assert.match(await f.locator('.mod-root .workspace-leaf-content').evaluate(e=>getComputedStyle(e).backgroundColor),/0.28/);
 await page.locator('#glass-opacity').fill('64');
 await f.locator('[data-note="signal"]').click(); assert.equal(await f.locator('#note-content h1').textContent(),'信号与系统');
 assert.equal(await f.locator('#outline a').count(),3);
 await f.locator('#outline a').last().click(); await page.waitForTimeout(600); assert((await f.locator('.markdown-preview-view').evaluate(e=>e.scrollTop))>0);
 await f.locator('[data-note="project"]').click(); assert.equal(await f.locator('#note-content h1').textContent(),'项目手记');
 await f.locator('[data-note="reading"]').click();
 await page.locator('[data-preview-theme="baseline"]').focus(); await page.keyboard.press('Enter'); assert.equal(await page.locator('[data-preview-theme="baseline"]').getAttribute('aria-pressed'),'true'); assert(await page.locator('#glass-opacity').isDisabled());
 await page.locator('[data-preview-theme="glass"]').click();
 await page.locator('.appearance-toggle').click(); assert.equal(await page.locator('html').getAttribute('data-theme'),'dark'); await page.reload(); assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.locator('.preview-shell').scrollIntoViewIfNeeded(); await page.waitForTimeout(750); await page.screenshot({path:'output/playwright/site-dark.png'});
 await page.locator('.appearance-toggle').click();
 for(const el of await page.locator('.reveal').all()) {await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(750);}
 await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(300); await page.screenshot({path:'output/playwright/projects-desktop.png',fullPage:true});
 // Pointer-driven transforms, then motion preference live change.
 await page.locator('.preview-shell').scrollIntoViewIfNeeded();
 const r=await page.locator('#theme-preview').boundingBox(); await page.mouse.move(r.x+r.width*.85,r.y+r.height*.3); await page.waitForTimeout(300);
 assert.notEqual(await page.locator('.preview-shell').evaluate(e=>getComputedStyle(e).getPropertyValue('--ry').trim()),'0.000deg');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.preview-shell').evaluate(e=>getComputedStyle(e).transform),'none');
 results.push({interactions:'themes, modes, opacity, notes, outline, keyboard, appearance persistence, pointer, reduced-motion passed'});
 for(const url of ['http://127.0.0.1:8000/projects.html','http://127.0.0.1:8000/writing.html','http://127.0.0.1:8000/about.html',...articleLinks]) {
   const response=await page.goto(url,{waitUntil:'networkidle'}); assert.equal(response.status(),200);
   assert(await page.locator('h1').count()); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 // Centered article tilt on all listing surfaces, including a page with no iframe.
 await page.emulateMedia({reducedMotion:'no-preference'});
 for (const path of ['/', '/writing.html', '/2026/']) {
   await page.goto('http://127.0.0.1:8000'+path,{waitUntil:'networkidle'});
   const row=page.locator('.article-tilt').first();await row.scrollIntoViewIfNeeded();await page.waitForTimeout(800);
   const box=await row.boundingBox();
   await page.mouse.move(box.x+box.width*.8,box.y+box.height*.25);await page.waitForTimeout(350);
   assert(Math.abs(parseFloat(await row.evaluate(e=>e.style.getPropertyValue('--article-ry'))))>.15);
   const transform=await row.evaluate(e=>({origin:getComputedStyle(e).transformOrigin,width:e.offsetWidth,height:e.offsetHeight}));
   const [ox,oy]=transform.origin.split(' ').map(parseFloat);
   assert(Math.abs(ox-transform.width/2)<1 && Math.abs(oy-transform.height/2)<1);
   await page.mouse.move(5,5);await page.waitForTimeout(1100);
   assert.equal(await row.evaluate(e=>e.style.getPropertyValue('--article-ry')),'0.000deg');
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await row.evaluate(e=>getComputedStyle(e).transform),'none');
   await page.emulateMedia({reducedMotion:'no-preference'});
 }
 results.push({articleMotion:'home / writing / year: centered tilt, reset and reduced motion passed'});
 await page.goto(articleLinks[0]);
 assert.match(await page.locator('.article-body').evaluate(e=>getComputedStyle(e).fontFamily),/Songti/); await page.screenshot({path:'output/playwright/article-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844}); await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'}); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'output/playwright/home-mobile.png',fullPage:true});
 await page.goto('http://127.0.0.1:8000/projects.html',{waitUntil:'networkidle'});
 await page.locator('[data-preview-theme="baseline"]').click(); await f.locator('[data-note="signal"]').click(); assert.equal(await f.locator('#note-content h1').textContent(),'信号与系统');
 assert(await f.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('[data-preview-theme="glass"]').click(); await f.locator('[data-note="reading"]').click(); await page.waitForTimeout(300);
 await page.screenshot({path:'output/playwright/projects-mobile.png',fullPage:true});
 await page.setViewportSize({width:320,height:740}); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto('http://127.0.0.1:8000/static/demo/index.html'); await page.locator('#demo-theme').selectOption('baseline'); await page.locator('#demo-mode').selectOption('dark'); assert(await page.locator('#glass-styles').evaluate(e=>e.disabled));
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}}); await nojs.goto('http://127.0.0.1:8000/'); assert(await nojs.locator('.writing-section').isVisible()); await nojs.goto('http://127.0.0.1:8000/projects.html');assert(await nojs.locator('noscript').isVisible()); await nojs.close();
 results.push({mobile:'390px and 320px no horizontal overflow; theme and note controls work',standalone:'theme/mode controls work',noJS:'writing and fallback visible'});
 // Simulate a visitor with no installed WenKai by bypassing local() only in this test.
 const remoteFont=await browser.newPage();let fontDownloaded=false;
 await remoteFont.route('**/wenkai.css',async route=>{
   const response=await route.fetch();const css=(await response.text()).replace(/local\([^)]*\),?\s*/g,'');
   await route.fulfill({response,body:css});
 });
 remoteFont.on('response',r=>{if(r.url().endsWith('/site-wenkai.woff2') && r.status()===200)fontDownloaded=true});
 await remoteFont.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 await remoteFont.evaluate(()=>document.fonts.ready);
 assert(fontDownloaded,'Self-hosted WOFF2 must load when local font is unavailable');
 assert(await remoteFont.evaluate(()=>document.fonts.check('16px "Site WenKai"','做一些喜欢的东西')));
 const cdp=await remoteFont.context().newCDPSession(remoteFont);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
 const doc=await cdp.send('DOM.getDocument');const h1=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'.hero h1'});
 const fonts=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:h1.nodeId});
 assert(fonts.fonts.some(font=>font.isCustomFont && font.familyName==='Site WenKai'));
 results.push({selfHostedFont:fonts.fonts});await remoteFont.close();
 assert.deepEqual(errors,[]); fs.writeFileSync('output/playwright/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
