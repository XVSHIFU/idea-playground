// Development-only browser checks; not in the public file allowlist.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'@playwright/test');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:4310/click-collapse/?debug');
 await page.waitForTimeout(9000);console.log(await page.locator('#loading').innerText(),await page.locator('#loading').getAttribute('class'));console.log(await page.locator('#diagnostics').innerText());console.log(JSON.stringify(errors));
 await page.screenshot({path:process.env.SCREENSHOT_PATH||'/tmp/click-collapse-preview.png'});await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
