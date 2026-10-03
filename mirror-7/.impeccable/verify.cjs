const { chromium } = require('../../protocol-zoo/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL, fileURLToPath } = require('node:url');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const pages = ['index.html','archive/1997-tutorial.html','forum/thread-8821.html','manual/desktop-buffer.html','security/incident-2041.html','forum/thread-1706.html'];
(async()=>{
 const browser = await chromium.launch({channel:'msedge',headless:true});
 const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',offline:true});
 const page = await context.newPage(); const errors=[]; let links=0;
 page.on('pageerror',e=>errors.push(e.message)); page.on('requestfailed',r=>errors.push(r.url()));
 const shots = path.join(__dirname,'review'); fs.mkdirSync(shots,{recursive:true});
 try {
 for(const file of pages){
  await page.goto(pathToFileURL(path.join(root,file)).href);
  assert.equal(await page.locator('h1').count(),1);
  const refs=await page.locator('a[href],link[href]').evaluateAll(es=>es.map(e=>e.href));
  for(const ref of refs){const url=new URL(ref); assert.equal(url.protocol,'file:');assert.ok(fs.existsSync(fileURLToPath(url)),ref); if(url.hash){const content=fs.readFileSync(fileURLToPath(url),'utf8');assert.ok(content.includes('id="'+url.hash.slice(1)+'"'),ref);}links++;}
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:width===1440?1000:844});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${file} overflows at ${width}`);
   if(width!==320) await page.screenshot({path:path.join(shots,file.replaceAll('/','-').replace('.html','')+`-${width}.png`),fullPage:true});
  }
 }
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);
 await page.locator('.record a').first().click();assert.ok(page.url().endsWith('1997-tutorial.html'));
 await page.goBack();assert.ok(page.url().endsWith('index.html'));
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.tagName),'A');
 await page.goto(pathToFileURL(path.join(root,'security/incident-2041.html')).href);
 await page.locator('summary').click();assert.equal(await page.locator('details').getAttribute('open'),'');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({pages:pages.length,localReferences:links,widths:[1440,390,320],screenshots:12,offline:true,navigation:'passed',disclosure:'passed',browserErrors:errors},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
