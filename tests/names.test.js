const fs=require('fs');const path=require('path');const ROOT=path.resolve(__dirname, '..');const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(ROOT, 'index.html'),'utf8');
async function check(lang){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/'});
  const w=dom.window,d=w.document;const errs=[];
  w.addEventListener('error',e=>errs.push(e.message));
  dom.virtualConsole.on('jsdomError',e=>errs.push(e.message));
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 375}});
  Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 192}});
  const click=el=>{if(!el)throw new Error('nenalezeno');el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
  const q=s=>d.querySelector(s), qa=s=>[...d.querySelectorAll(s)];
  click(qa('[data-act="parentlang"]').find(b=>b.dataset.lang===lang));
  d.getElementById('pin1').value='1234'; click(q('[data-act="savepin"]'));
  // zalozeni hrace uz chce i tridu, bez ni je tlacitko zakazane a profil
  // nevznikne; test pak spadl na prvni obrazovce, kterou uz neuvidel
  click(q('[data-act="newplayer"]')); d.querySelector('#nm').value='Sam';
  click(qa('[data-gr]').find(b=>b.dataset.gr==='3')); click(q('[data-go]'));
  // panel vyberu zavodnika pred startem; prvni misto na mape treťáka je
  // mala nasobilka, kterou treti trida opakuje a ma otevrenou od zacatku
  click(q('[data-act="play"]'));
  const start=qa('.pickitem .nm').map(e=>e.textContent);
  click(q('[data-more]'));
  const garage=qa('.item .nm').map(e=>e.textContent);
  // Police s natery a s kacencimi dily jsou od R11 slozene, takze se
  // jmena dilu overi az po otevreni kazde z nich; otevrena je vzdycky
  // jedna, proto se police prochazeji po jedne. Do prohlidky patri
  // i samotna cedulka slozene police, protoze i ta je text, ktery dite
  // cte a ktery musi byt ve vsech trech jazycich.
  const bars=qa('.shelfhead').map(b=>b.dataset.sec);
  for(const sec of bars){
    garage.push(...qa('#'+sec+' .shelfname, #'+sec+' .shelfsub, #'+sec+' .shelfworn').map(e=>e.textContent));
    click(qa('.shelfhead').find(b=>b.dataset.sec===sec));
    garage.push(...qa('#'+sec+' .item .nm').map(e=>e.textContent));
  }
  const bad=[...start,...garage].filter(x=>!x||x==='undefined'||/undefined/.test(x));
  console.log('['+lang+'] pred startem:', start.join(', '));
  console.log('['+lang+'] v garazi   :', garage.filter(x=>!/^🪙/.test(x)).join(', '));
  console.log('['+lang+'] vadnych popisku:', bad.length?bad.join('|'):'zadny', '| chyby:', errs.length?errs.join('|'):'zadne');
}
(async()=>{ for(const l of ['cs','en','de']) await check(l); process.exit(0); })();
