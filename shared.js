(() => {
'use strict';
tailwind.config={theme:{extend:{colors:{ink:'#07337c',inks:'#0a46a8',or:'#f25500',ord:'#d94b00',mut:'#5f7094',line:'#dfe5f0',bg2:'#f5f5f5',red:'#e5251c',grn:'#12a150'},fontFamily:{sans:['Lexend','system-ui','-apple-system','Segoe UI','Roboto','sans-serif']}}}};
const $=id=>document.getElementById(id);
const load=(k,d)=>{try{const r=JSON.parse(localStorage.getItem(k));return r??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const TF=window.TF={$,load,save,busy:()=>false,nameOpen:false};

/* ---------- Filtro de nombres (local) ---------- */
const BLOCK_WORDS=['puta','putas','puto','putos','putita','putito','hdp','ctm','csm','lpqtp','lpqtpm','pendeja','pendejo','pendejos','pelotudo','pelotuda','pelotudos','forro','forra','garca','mierda','mierdas','culo','culos','culiao','culiado','culiada','orto','verga','vergon','pija','pijas','pijudo','poronga','chota','choto','pajero','pajera','follar','follame','chupala','chupame','mamada','mamame','tetas','vagina','pene','penes','semen','sexo','porno','porn','pornhub','orgasmo','violar','violacion','pederasta','pedofilo','pedofilia','pedophile','maricon','maricones','trolo','trolos','sudaca','tortillera','joto','negrata','mogolico','mongolico','mongolo','retrasado','retrasada','subnormal','matate','suicidate','kys','terrorista','genocida','nazi','nazis','neonazi','nazismo','heil','reich','swastika','esvastica','hitler','mussolini','goebbels','himmler','eichmann','mengele','binladen','fuck','fucker','fucked','fucking','fck','fuk','fvck','shit','shitty','shithead','bullshit','bitch','bitches','biatch','bastard','asshole','dick','dickhead','cock','cunt','cunts','pussy','whore','slut','sluts','nigger','niggers','nigga','niggas','faggot','fag','fags','retard','retarded','tranny','chink','spic','kike','wetback','rape','rapist','cum','jizz','nude','nudes','penis','dildo','blowjob','handjob'];
const BLOCK_CONTAINS=['hitler','nazism','neonazi','siegheil','heilhitler','kukluxklan','swastika','esvastica','mussolini','goebbels','himmler','eichmann','mengele','binladen','alqaeda','alqaida','holohoax','hijodeputa','hijoputa','hijueputa','putamadre','putaquete','putaquetepario','conchadetumadre','conchetumadre','conchetumare','conchatumadre','pendejo','pelotud','mierda','maricon','chupapija','chupamela','chupala','masturb','pedofil','pederast','pedophile','violador','violacion','fuck','motherfuck','asshole','bitch','bastard','cocksucker','nigger','faggot'];
const BLOCK_SET=new Set(BLOCK_WORDS), LEET={'0':'o','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','!':'i'};
const strip=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const shrink=(t,n)=>t.replace(/(.)\1{2,}/g,(m,c)=>c.repeat(n));
TF.blocked=name=>{
  const base=strip(String(name).toLowerCase()), compact=base.replace(/\s+/g,'');
  if(compact.includes('1488')||compact.includes('kkk')) return true;
  for(const one of ['i','l']){
    const leet=base.replace(/[013457@$!]/g,c=>c==='1'?one:LEET[c]);
    const raw=leet.replace(/[^a-z]+/g,' ').trim().split(' ').filter(Boolean);
    for(const n of [1,2]){
      const tokens=raw.map(t=>shrink(t,n)), sq=shrink(raw.join(''),n);
      if(tokens.some(t=>BLOCK_SET.has(t))||BLOCK_CONTAINS.some(w=>sq.includes(w))||(sq.length>=4&&BLOCK_SET.has(sq))) return true;
    }
  }
  return false;
};

/* ---------- Panel lateral: estadísticas + ranking + historial ---------- */
TF.side=({logKey,rankKey,fmt,unit,bad,higher})=>{
  $('side').innerHTML=`<div class="card"><h2>Estadísticas</h2><div id="stats" class="grid grid-cols-4 gap-2 text-center"></div></div>
  <div class="card flex-1 min-h-0 flex flex-col"><h2>Ranking · Top 10</h2><ol id="rankList" class="flex flex-col gap-1.5 overflow-auto"></ol><p id="rankEmpty" class="text-mut text-sm">Todavía no hay nombres en el ranking.</p></div>
  <div class="card"><h2>Historial</h2><ol id="history" class="flex flex-wrap gap-1.5 max-h-[76px] overflow-hidden"></ol><p id="emptyMsg" class="text-mut text-sm">Todavía no hiciste ningún intento.</p></div>`;
  let res=load(logKey,[]), rank=load(rankKey,[]); if(!Array.isArray(res))res=[]; if(!Array.isArray(rank))rank=[];
  const api={
    log(ms){res.push({ms});save(logKey,res.slice(-20));api.render()},
    rank(name,ms){const e={name,ms,ts:Date.now()};rank.push(e);rank.sort((a,b)=>(higher?b.ms-a.ms:a.ms-b.ms)||a.ts-b.ts);const pos=rank.indexOf(e)+1;rank=rank.slice(0,100);save(rankKey,rank);api.render();return pos},
    render(){
      const ok=res.filter(r=>r.ms!=null).map(r=>r.ms), best=ok.length?(higher?Math.max(...ok):Math.min(...ok)):null;
      const avg=ok.length?Math.round(ok.reduce((a,b)=>a+b,0)/ok.length):null, last=res[res.length-1];
      const S=[['Mejor ('+unit+')',best!=null?fmt(best):'—','text-or'],['Promedio ('+unit+')',avg!=null?fmt(avg):'—',''],['Último ('+unit+')',last?(last.ms==null?bad:fmt(last.ms)):'—',''],['Intentos',res.length,'']];
      $('stats').innerHTML=S.map(s=>`<div class="bg-bg2 rounded-2xl p-2"><b class="block text-xl sm:text-2xl font-extrabold tabular-nums ${s[2]}">${s[1]}</b><span class="block text-[9px] uppercase tracking-wide text-mut leading-tight">${s[0]}</span></div>`).join('');
      const h=$('history');h.innerHTML='';$('emptyMsg').hidden=res.length>0;
      res.slice().reverse().slice(0,12).forEach(r=>{const li=document.createElement('li');li.className='bg-bg2 rounded-lg px-3 h-8 flex items-center font-bold text-sm tabular-nums '+(r.ms==null?'text-red':r.ms===best?'text-or':'');li.textContent=r.ms==null?bad:fmt(r.ms)+' '+unit;h.appendChild(li)});
      const rl=$('rankList');rl.innerHTML='';$('rankEmpty').hidden=rank.length>0;
      rank.slice(0,10).forEach((r,i)=>{const li=document.createElement('li'),c=i===0?'text-or':'';li.className='flex items-center gap-2 bg-bg2 rounded-xl px-3 py-1.5 tabular-nums';li.innerHTML=`<span class="text-mut text-xs min-w-[28px] ${c}">${i+1}.</span><span class="flex-1 font-semibold truncate"></span><span class="font-bold ${c}">${fmt(r.ms)} ${unit}</span>`;li.children[1].textContent=r.name;rl.appendChild(li)});
    }
  };
  api.render();return api;
};

/* ---------- Modal de nombre con teclado en pantalla ---------- */
let M=null;
TF.askName=(label,done)=>{
  if(!M){
    const m=document.createElement('div');
    m.hidden=true;m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
    m.className='fixed inset-0 z-10 bg-[rgba(3,22,56,.72)] flex items-center justify-center p-2 sm:p-3 [&[hidden]]:hidden';
    m.innerHTML=`<div class="bg-white rounded-3xl w-full max-w-3xl max-h-full overflow-auto p-3 sm:p-6 flex flex-col gap-2 sm:gap-3"><div class="flex items-baseline justify-between gap-3 flex-wrap"><h3 class="font-bold text-lg" id="nmT"></h3><div id="nmL" class="text-3xl font-extrabold text-or tabular-nums"></div></div><div id="nmBox" class="flex items-center min-h-[56px] px-4 border-[3px] border-ink rounded-2xl text-3xl font-extrabold tracking-wider uppercase overflow-hidden whitespace-pre" aria-live="polite"></div><div id="nmErr" class="text-red font-semibold text-sm min-h-[1.4em]" aria-live="polite"></div><div id="nmKb" class="flex flex-col gap-1.5 sm:gap-2"></div></div>`;
    document.body.appendChild(m);
    const rows=[[...'1234567890'],[...'QWERTYUIOP'],[...'ASDFGHJKLÑ'],[...'ZXCVBNM','BACK'],['SKIP','SPACE','SAVE']];
    const L={BACK:['⌫','dk w'],SPACE:['Espacio','sp'],SAVE:['Guardar','sv w'],SKIP:['Omitir','sk w']};
    const kb=m.querySelector('#nmKb');
    rows.forEach(r=>{const d=document.createElement('div');d.className='flex gap-1 sm:gap-2';r.forEach(k=>{const b=document.createElement('button');b.type='button';b.dataset.k=k;b.className='key '+(L[k]?L[k][1]:'');b.textContent=L[k]?L[k][0]:k;if(k==='BACK')b.setAttribute('aria-label','Borrar');d.appendChild(b)});kb.appendChild(d)});
    M={m,kb,box:m.querySelector('#nmBox'),err:m.querySelector('#nmErr'),buf:'',cb:null};
    const upd=()=>{M.box.innerHTML='';if(!M.buf){const p=document.createElement('span');p.className='text-[#a9b5cc] font-semibold';p.textContent='TU NOMBRE';M.box.appendChild(p)}else M.box.appendChild(document.createTextNode(M.buf));const c=document.createElement('span');c.className='caret';M.box.appendChild(c);kb.querySelector('[data-k=SAVE]').classList.toggle('off',!M.buf.trim())};
    const clr=()=>{M.err.textContent='';M.box.style.borderColor=''};
    const close=n=>{m.hidden=true;TF.nameOpen=false;const cb=M.cb;M.cb=null;cb&&cb(n)};
    const press=k=>{
      clr();
      if(k==='BACK'){M.buf=M.buf.slice(0,-1)}
      else if(k==='SKIP'){return close(null)}
      else if(k==='SAVE'){const n=M.buf.trim();if(!n)return;if(TF.blocked(n)){M.err.textContent='Nombre no permitido. Probá con otro.';M.box.style.borderColor='#e5251c';return}return close(n)}
      else{const ch=k==='SPACE'?' ':k;if(M.buf.length>=12||(ch===' '&&(!M.buf||M.buf.endsWith(' '))))return;M.buf+=ch}
      upd();
    };
    M.upd=upd;
    kb.addEventListener('pointerdown',e=>{const k=e.target.closest('[data-k]');if(!k)return;e.preventDefault();k.classList.add('p');setTimeout(()=>k.classList.remove('p'),120);press(k.dataset.k)});
    document.addEventListener('keydown',e=>{
      if(!TF.nameOpen)return;
      e.stopImmediatePropagation();
      if(e.key==='Backspace'){e.preventDefault();press('BACK')}
      else if(e.key==='Enter'){e.preventDefault();press('SAVE')}
      else if(e.key==='Escape'){e.preventDefault();press('SKIP')}
      else if(/^[a-zA-ZñÑ0-9 ]$/.test(e.key)){e.preventDefault();press(e.key===' '?'SPACE':e.key.toUpperCase())}
    },true);
  }
  M.buf='';M.cb=done;M.err.textContent='';M.box.style.borderColor='';
  M.m.querySelector('#nmT').textContent='¡Terminaste! Ingresá tu nombre';
  M.m.querySelector('#nmL').textContent=label;
  M.upd();M.m.hidden=false;TF.nameOpen=true;
};

/* ---------- Encabezado + PWA ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  const b=document.body,h=$('hdr');
  if(h){
    h.className='flex-none bg-white border-b border-line flex items-center justify-between gap-2 px-3 sm:px-4 py-2';
    h.innerHTML=`<a href="./index.html" class="flex-none"><img src="./img/trodia_fest.png" alt="Trodia Fest" class="h-8 sm:h-11 w-auto max-w-[34vw]" draggable="false"></a><div class="flex items-center gap-2 sm:gap-4 min-w-0">${b.dataset.back?'<a href="./index.html" class="flex-none border-2 border-ink rounded-full px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold hover:bg-ink hover:text-white">Menú</a>':''}<h1 class="font-extrabold uppercase text-sm sm:text-2xl leading-none truncate">${b.dataset.title||''}</h1></div>`;
  }
  if('serviceWorker' in navigator){
    const had=!!navigator.serviceWorker.controller;let pend=false;
    navigator.serviceWorker.register('./Sw.js').then(r=>setInterval(()=>r.update().catch(()=>{}),36e5)).catch(()=>{});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)pend=true});
    setInterval(()=>{if(pend&&!TF.nameOpen&&!TF.busy())location.reload()},5000);
  }
  document.addEventListener('contextmenu',e=>e.preventDefault());
});
})();
