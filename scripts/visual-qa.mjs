import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin=process.env.QA_ORIGIN || 'http://localhost:4173';
const output=path.resolve(process.env.QA_OUTPUT || 'work/editorial-qa');
const widths=[1440,1280,1024,768,430,390,360];
const people=['bottle-cap-grandma','breakfast-shop-owner','community-kitchen-mother','community-volunteer','couple-story-one','couple-story-two'];
const routes=['/','/guogang','/people','/goods','/about',...people.map(s=>'/people/'+s),...Array.from({length:5},(_,i)=>'/goods/goods-0'+(i+1))];
const major=new Set(['/','/guogang','/people','/goods','/about','/people/bottle-cap-grandma','/goods/goods-05']);
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={origin,widths,pages:[],map:[],interactions:[],errors:[]};
const context=await browser.newContext();
const page=await context.newPage();
page.on('pageerror',error=>report.errors.push(error.message));
async function ready(){
 await page.addStyleTag({content:'html{scroll-behavior:auto !important}'});
 await page.evaluate(async()=>{
  await document.fonts.ready;
  document.querySelectorAll('img[loading="lazy"]').forEach(im=>im.loading='eager');
  await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));
  window.scrollTo(0,0);
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 });
}
function name(route){return route==='/'?'home':route.slice(1).replaceAll('/','-')}
for(const width of widths){
 await page.setViewportSize({width,height:1000});
 for(const route of routes){
  await page.goto(origin+route,{waitUntil:'networkidle'});await ready();
  const audit=await page.evaluate(({route,width})=>{
   const outside=[...document.querySelectorAll('main *')].filter(el=>{
    if(el.closest('.guogang-map-scroll, [inert]')||el.classList.contains('sr-only'))return false;
    const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left<-1);
   }).map(el=>({tag:el.tagName,class:el.className,text:el.textContent.slice(0,65)}));
   const contentEscapes=[...document.querySelectorAll('.narrative-scene')].flatMap(scene=>{
    const bounds=scene.getBoundingClientRect();
    return [...scene.querySelectorAll('h1,h2,p,figure')].filter(el=>el.getBoundingClientRect().bottom>bounds.bottom+1).map(el=>({scene:scene.id,element:el.tagName,text:el.textContent.slice(0,60)}));
   });
   const broken=[...document.images].filter(im=>!im.complete||im.naturalWidth===0).map(im=>im.getAttribute('src'));
   const headingLines=[...document.querySelectorAll('h1,h2,h3')].map(el=>{
    const lines=[];const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;
    while ((node = walker.nextNode()))for(let i=0;i<node.textContent.length;i++){
     const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect();
     if(!r.width)continue;let line=lines.find(l=>Math.abs(l.y-r.y)<2);if(!line){line={y:r.y,text:''};lines.push(line)}line.text+=node.textContent[i];
    }
    return {text:el.textContent,size:getComputedStyle(el).fontSize,lines:lines.map(l=>l.text)};
   });
   return {route,width,contentEscapes,pageOverflow:document.documentElement.scrollWidth>innerWidth,outside,broken,headingLines,h1:document.querySelectorAll('h1').length};
  },{route,width});
  report.pages.push(audit);
  if(major.has(route))await page.screenshot({path:path.join(output,`${name(route)}-${width}.png`),fullPage:true,animations:'disabled'});
  else if(width===1440||width===360)await page.screenshot({path:path.join(output,`${name(route)}-${width}.png`),fullPage:true,animations:'disabled'});
  if(route==='/guogang'){
   await page.locator('.guogang-map-scroll').screenshot({path:path.join(output,`map-${width}.png`)});
   const ids=await page.locator('[data-landmark]').evaluateAll(es=>es.map(e=>e.dataset.landmark));
   for(const id of ids){
    const landmark=page.locator(`[data-landmark="${id}"]`);
    await landmark.hover();
    await page.waitForFunction(id=>getComputedStyle(document.querySelector(`[data-landmark="${id}"] img`)).transform==='matrix(1, 0, 0, 1, 0, -8)',id);
    await landmark.click();
    const state=await page.evaluate(id=>{
     const object=document.querySelector(`[data-landmark="${id}"]`);const label=document.querySelector(`[data-label="${id}"]`);
     const labels=[...document.querySelectorAll('[data-label]')];const objects=[...document.querySelectorAll('[data-landmark] img')];
     const intersects=(a,b)=>a.left<b.right-.5&&a.right>b.left+.5&&a.top<b.bottom-.5&&a.bottom>b.top+.5;
     const collisions=[];
     for(let i=0;i<labels.length;i++){
      const a=labels[i].getBoundingClientRect();
      for(let j=i+1;j<labels.length;j++)if(intersects(a,labels[j].getBoundingClientRect()))collisions.push([labels[i].textContent,labels[j].textContent]);
      for(const image of objects)if(intersects(a,image.getBoundingClientRect()))collisions.push([labels[i].textContent,image.parentElement.dataset.landmark]);
     }
     return {id,name:label.textContent,expanded:object.getAttribute('aria-expanded'),transform:getComputedStyle(object.querySelector('img')).transform,labelSize:getComputedStyle(label).fontSize,collisions};
    },id);
    report.map.push({width,...state});
    // Individual close views include the exposed base and its real HTML label.
    const r=await landmark.boundingBox();const l=await page.locator(`[data-label="${id}"]`).boundingBox();
    const left=Math.max(0,Math.min(r.x,l.x)-20),top=Math.max(0,Math.min(r.y,l.y)-24);
    const right=Math.min(width,Math.max(r.x+r.width,l.x+l.width)+20),bottom=Math.min(1000,Math.max(r.y+r.height,l.y+l.height)+24);
    if(width===1440||width===360)await page.screenshot({path:path.join(output,`map-${width}-${id}.png`),clip:{x:left,y:top,width:right-left,height:bottom-top}});
    await landmark.focus();assert.equal(await landmark.getAttribute('aria-expanded'),'true',`${width} ${id} focus preserves the clicked selection`);
   }
  }
 }
 console.log(`Inspected ${width}px: ${routes.length} routes, 14 map objects`);
 await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
}
// Navigation, image galleries, touch selection/panning and reduced motion.
await page.setViewportSize({width:390,height:844});await page.goto(origin,{waitUntil:'networkidle'});await ready();
await page.getByRole('button',{name:'開啟選單'}).click();assert.equal(await page.getByRole('button',{name:'關閉選單'}).getAttribute('aria-expanded'),'true');
await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'開啟選單'}).getAttribute('aria-expanded'),'false');
await page.getByRole('button',{name:'開啟選單'}).click();await page.locator('#primary-navigation').getByRole('link',{name:'人與過港'}).click();await page.waitForURL('**/people*');
report.interactions.push('mobile menu open, Escape, destination navigation');
await page.goto(origin+'/goods',{waitUntil:'networkidle'});await ready();
for(const gallery of await page.locator('.product-gallery').all()){
 const next=gallery.locator('.product-gallery-arrow-next');if(await next.count()){
  const initial=await gallery.locator('img').getAttribute('src');await next.click();await page.waitForFunction(({label,initial})=>document.querySelector(`[aria-label="${label}"] img`).getAttribute('src')!==initial,{label:await gallery.getAttribute('aria-label'),initial});
  await gallery.locator('.product-gallery-arrow-prev').click();assert.equal(await gallery.locator('img').getAttribute('src'),initial);
 }
}
report.interactions.push('every multi-image product gallery next and previous');
assert.equal(await page.locator('a[href="tel:0224588802"]').first().getAttribute('href'),'tel:0224588802');report.interactions.push('telephone inquiry link');
const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const tp=await touch.newPage();
await tp.goto(origin+'/guogang',{waitUntil:'networkidle'});await tp.addStyleTag({content:'html{scroll-behavior:auto !important}'});
const ids=await tp.locator('[data-landmark]').evaluateAll(es=>es.map(e=>e.dataset.landmark));
for(const id of ids){await tp.locator('#map-place-picker').selectOption(id);const item=tp.locator(`[data-landmark="${id}"]`);await item.tap();assert.equal(await item.getAttribute('aria-expanded'),'true');}
report.interactions.push('all 14 landmarks selected and tapped at 390px');
// A drag pans only the map, and never activates the object underneath.
await page.goto(origin+'/guogang',{waitUntil:'networkidle'});await ready();
const viewport=page.locator('.guogang-map-scroll');await viewport.scrollIntoViewIfNeeded();
await viewport.evaluate(el=>el.scrollLeft=0);const box=await viewport.boundingBox();
await page.mouse.move(box.x+box.width-40,box.y+box.height*.87);await page.mouse.down();
await page.mouse.move(box.x+40,box.y+box.height*.87,{steps:12});await page.mouse.up();
assert.ok(await viewport.evaluate(el=>el.scrollLeft)>100,'mouse drag pans map');
assert.equal(await page.locator('#map-place-picker').inputValue(),'','drag does not select landmark');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
const touchMap=tp.locator('.guogang-map-scroll');await touchMap.scrollIntoViewIfNeeded();
await touchMap.evaluate(el=>el.scrollLeft=0);const touchBox=await touchMap.boundingBox();
const client=await touch.newCDPSession(tp);
const swipe=async(x1,y1,x2,y2)=>{
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y:y1}]});
 for(let step=1;step<=12;step++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x1+(x2-x1)*step/12,y:y1+(y2-y1)*step/12}]});
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
};
await swipe(touchBox.x+touchBox.width-30,touchBox.y+touchBox.height*.75,touchBox.x+30,touchBox.y+touchBox.height*.75);
assert.ok(await touchMap.evaluate(el=>el.scrollLeft)>100,'touch drag pans map');
const pageY=await tp.evaluate(()=>scrollY);const visible=await touchMap.boundingBox();
const startY=Math.min(700,visible.y+visible.height*.7);
await swipe(195,startY,195,startY-150);
await tp.waitForFunction(y=>scrollY>y+40,pageY);
report.interactions.push('mouse and touch horizontal map drag, no drag activation, vertical page swipe');
await tp.emulateMedia({reducedMotion:'reduce'});assert.equal(await tp.locator('[data-landmark] img').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');report.interactions.push('reduced-motion map transition');
await touch.close();await browser.close();
await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
const failures=report.pages.filter(p=>p.pageOverflow||p.contentEscapes.length||p.outside.length||p.broken.length||p.h1!==1);
const collisions=report.map.filter(m=>m.collisions.length||m.expanded!=='true');
console.log(JSON.stringify({pages:report.pages.length,mapStates:report.map.length,failures,collisions,errors:report.errors,interactions:report.interactions},null,2));
assert.equal(failures.length+collisions.length+report.errors.length,0,'Browser regression defects; see report.json');
