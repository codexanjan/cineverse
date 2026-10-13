import { chromium } from "@playwright/test";
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  for(const [route,name] of [["/","landing"],["/login","login"],["/categories","categories"],["/discover","discovery"],["/profile","profile"]]){
    await page.goto(`http://localhost:3000${route}`);
    if(route==="/categories") await page.locator(".category-tile").first().waitFor();
    if(route==="/discover") await page.locator(".movie").first().waitFor();
    if(route==="/profile") await page.getByLabel("Display name").waitFor();
    if(route==="/") await page.locator(".intro-copy h1").waitFor();
    await page.evaluate(async()=>{await Promise.all(Array.from(document.images).filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{})));});
    await page.screenshot({path:`../cineverse-${name}.png`,fullPage:true});
    console.log(name,await page.evaluate(()=>({images:Array.from(document.images).filter(i=>i.complete&&i.naturalWidth>0&&!i.src.includes("poster.svg")).length,fallbacks:Array.from(document.images).filter(i=>i.src.includes("poster.svg")).length,overflow:document.documentElement.scrollWidth>innerWidth})));
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto("http://localhost:3000");
  await page.screenshot({path:"../cineverse-landing-mobile.png",fullPage:true});
} finally {await browser.close();}
