/* Food Recall Digest: shared page script (cards, counters, reveal, Open all / Close all).
   Loaded from every page; no inline scripts or onclick handlers, so the CSP allows scripts only from this site. */
document.addEventListener('DOMContentLoaded',function(){
 var calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 var els=document.querySelectorAll('.reveal');
 if(calm||!('IntersectionObserver' in window)){els.forEach(function(x){x.classList.add('in')});}
 else{var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px 20% 0px'});
  els.forEach(function(x){io.observe(x)});
  setTimeout(function(){els.forEach(function(x){x.classList.add('in')})},3000);}  // safety net: nothing stays hidden (find-in-page, print, slow devices)
 document.querySelectorAll('[data-count]').forEach(function(n){var to=+n.getAttribute('data-count');if(calm||!to)return;var t0=null;
  function step(t){if(!t0)t0=t;var p=Math.min((t-t0)/900,1);n.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)}
  n.textContent='0';requestAnimationFrame(step);setTimeout(function(){n.textContent=to},1300)});
 document.querySelectorAll('.rc').forEach(function(c){
  c.querySelector('.rc-head').addEventListener('click',function(ev){if(ev.target.closest('a'))return;setCard(c,!c.classList.contains('open'),true)})});
 openHash();window.addEventListener('hashchange',openHash);
 document.addEventListener('click',function(ev){var a=ev.target.closest('a[href^="#"]');if(a&&a.getAttribute('href')===location.hash){ev.preventDefault();openHash()}});
});
document.documentElement.classList.add('js');
function setCard(c,open,animate){
 var body=c.querySelector('.rc-body'),btn=c.querySelector('.rc-toggle'),more=c.querySelector('.rc-more');
 var calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,fx=animate&&!calm&&body.animate;
 if(open===c.classList.contains('open'))return;
 if(open){body.querySelectorAll('img[loading=lazy]').forEach(function(i){i.loading='eager'});  // iPhone Safari can skip lazy photos in a just-opened card
  c.classList.add('open');btn.setAttribute('aria-expanded','true');more.textContent='Hide details';
  if(fx){var hh=body.scrollHeight;body.animate([{height:'0px',opacity:0,transform:'translateY(-10px)'},{height:hh+'px',opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.2,.8,.2,1)'})}
  if(animate){setTimeout(function(){c.scrollIntoView({behavior:calm?'auto':'smooth',block:'start'})},30);history.replaceState(null,'','#'+c.id)}
 }else{var done=function(){c.classList.remove('open');btn.setAttribute('aria-expanded','false');more.textContent='Show details'};
  if(fx){var a=body.animate([{height:body.scrollHeight+'px',opacity:1},{height:'0px',opacity:0}],{duration:260,easing:'ease-in'});a.onfinish=done}else done();
  if(animate&&location.hash==='#'+c.id)history.replaceState(null,'',location.pathname+location.search)}
}
function openHash(){var h=location.hash&&document.getElementById(location.hash.slice(1));if(!h)return;
 if(h.classList.contains('rc'))setCard(h,true,false);
 if(h.classList.contains('ng')){var m=h.querySelector('details.nmore');if(m)m.open=true}/* email "N more stories" link */
 var d=h.tagName==='DETAILS'?h:h.closest('details');while(d){d.open=true;d=d.parentElement&&d.parentElement.closest('details')}
 h.scrollIntoView({block:'start'})}
function setCards(o,el){var root=(el&&el.closest('section'))||document;root.querySelectorAll('.rc').forEach(function(c){setCard(c,o,false)})}
function setStores(o){document.querySelectorAll('details.stores').forEach(function(d){d.open=o})}
document.addEventListener('click',function(ev){var b=ev.target.closest('[data-act]');if(!b)return;
 var a=b.getAttribute('data-act');
 if(a==='cards-open')setCards(true,b);else if(a==='cards-close')setCards(false,b);
 else if(a==='stores-open')setStores(true);else if(a==='stores-close')setStores(false);
 else if(a==='share')share(b);});
// Share a recall card: the phone's share sheet, else copy the link. Only our own site's links are shared.
function share(b){var u=b.getAttribute('data-url')||'',t=b.getAttribute('data-title')||document.title;
 if(!/^https:\/\/foodrecalldigest\.com\//.test(u))u=location.href;
 var done=function(msg){var old=b.textContent;b.textContent=msg;setTimeout(function(){b.textContent=old},2000)};
 if(navigator.share){navigator.share({title:t,url:u}).catch(function(){});return}
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(function(){done('Link copied')},function(){done('Copy failed')});return}
 window.prompt('Copy this link:',u)}

/* Search box hints (user, Oct 20): the examples roll upward like a cylinder, one every few seconds.
   Generic on purpose: no store, brand, UPC or lot code is named. Hidden while the box has focus or text;
   reduced-motion users get a plain swap. The overlay is aria-hidden; the box keeps its label. */
document.addEventListener('DOMContentLoaded',function(){
 var HINTS=['A product name','A brand name','Your store’s name','UPC or lot code'];  /* short so each fits a phone-width box (user, Oct 20) */
 var calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.querySelectorAll('input#q').forEach(function(inp){
  var cs=getComputedStyle(inp),wrap=document.createElement('span');
  wrap.style.cssText='position:relative;display:flex;min-width:'+cs.minWidth+';flex:'+cs.flex;
  inp.parentNode.insertBefore(wrap,inp);wrap.appendChild(inp);
  inp.style.flex='1 1 auto';inp.style.width='100%';inp.style.minWidth='0';inp.setAttribute('placeholder','');
  var lineH=parseFloat(cs.fontSize)*1.4,box=document.createElement('span');
  box.setAttribute('aria-hidden','true');
  box.style.cssText='position:absolute;top:0;bottom:0;left:'+(parseFloat(cs.paddingLeft)+parseFloat(cs.borderLeftWidth))+'px;right:14px;'+
   'overflow:hidden;pointer-events:none;display:flex;align-items:center;color:#6b7a72;font-size:'+cs.fontSize+';white-space:nowrap';
  var win=document.createElement('span');win.style.cssText='display:block;height:'+lineH+'px;overflow:hidden;width:100%';
  var reel=document.createElement('span');reel.style.cssText='display:block;transition:transform .45s ease';
  function line(t){var s=document.createElement('span');s.textContent=t;s.style.cssText='display:block;height:'+lineH+'px;line-height:'+lineH+'px;overflow:hidden;text-overflow:ellipsis';return s}
  var i=0;reel.appendChild(line(HINTS[0]));win.appendChild(reel);box.appendChild(win);wrap.appendChild(box);
  function show(){box.style.display=(document.activeElement===inp||inp.value)?'none':'flex'}
  inp.addEventListener('focus',function(){box.style.display='none'});inp.addEventListener('blur',show);inp.addEventListener('input',show);show();
  setInterval(function(){if(box.style.display==='none'||document.hidden)return;i=(i+1)%HINTS.length;
   if(calm){reel.firstChild.textContent=HINTS[i];return}
   reel.appendChild(line(HINTS[i]));reel.style.transform='translateY(-'+lineH+'px)';
   setTimeout(function(){reel.style.transition='none';reel.removeChild(reel.firstChild);reel.style.transform='translateY(0)';
    void reel.offsetHeight;reel.style.transition='transform .45s ease'},480)},3200);
 });
});

/* Motion (user, Oct 23): header pills drift (light ones left, dark ones right, each at its own slow speed) and every Pip
   switches to its animated copy (site/brand/anim/, made by brand/make_pip_anim.py) only while it is on screen.
   Off for prefers-reduced-motion; a "Pause animations" button in the footer turns it off and is remembered here. */
document.addEventListener('DOMContentLoaded',function(){
 var KEY='frd-motion',reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce||!('IntersectionObserver' in window))return;
 function paused(){try{return localStorage.getItem(KEY)==='off'}catch(e){return false}}
 var css=document.createElement('style');
 css.textContent='@keyframes frd-drift{from{transform:translateX(var(--a))}to{transform:translateX(var(--b))}}'+
  '@keyframes frd-bob{0%,100%{translate:0 0}50%{translate:0 var(--y)}}'+
  'header.top .deco{will-change:transform;animation:frd-drift var(--t) linear var(--d) infinite,frd-bob var(--bt) ease-in-out infinite}'+
  /* light pills drift left, dark pills drift right; start mid-way (negative delay) so the header is never empty */
  'header.top .d1{--a:28vw;--b:-112vw;--t:132s;--d:-28s;--y:-3px;--bt:9s}'+
  'header.top .d4{--a:30vw;--b:-110vw;--t:176s;--d:-100s;--y:2px;--bt:11s}'+
  'header.top .d5{--a:112vw;--b:-28vw;--t:196s;--d:-140s;--y:-2px;--bt:13s}'+
  'header.top .d2{--a:-104vw;--b:42vw;--t:150s;--d:-60s;--y:2px;--bt:10s}'+
  'header.top .d3{--a:-62vw;--b:66vw;--t:118s;--d:-20s;--y:-2px;--bt:8s}'+
  'html.frd-still header.top .deco{animation-play-state:paused}'+
  /* pills always pass BEHIND the logo, words and buttons; on phones the top pill only peeks in from the edge */
  'header.top .deco{z-index:0}header.top .wrap{position:relative;z-index:1}@media (max-width:640px){header.top .d1{top:-15px}}'+
  '.frd-motion{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}';
 document.head.appendChild(css);
 var pips=[].slice.call(document.querySelectorAll('img[src*="/brand/pip-"]'));
 function swap(img,on){var s=img.getAttribute('src'),want=on?s.replace('/brand/pip-','/brand/anim/pip-'):s.replace('/brand/anim/pip-','/brand/pip-');
  if(want===s)return;if(!on){img.src=want;return}
  var pre=new Image();pre.onload=function(){if(!paused()&&img.dataset.vis==='1')img.src=want};pre.src=want}  /* preload: no flash; skip if missing */
 var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.dataset.vis=e.isIntersecting?'1':'0';
  swap(e.target,e.isIntersecting&&!paused())})},{rootMargin:'60px'});
 pips.forEach(function(p){io.observe(p)});
 function apply(){var off=paused();document.documentElement.classList.toggle('frd-still',off);
  pips.forEach(function(p){swap(p,!off&&p.dataset.vis==='1')});if(btn)btn.textContent=off?'Play animations':'Pause animations'}
 var foot=document.querySelector('footer.foot .wrap>div'),btn=null;
 if(foot){var p=document.createElement('p');p.className='muted';p.style.margin='10px 0 0';
  btn=document.createElement('button');btn.type='button';btn.className='frd-motion';p.appendChild(btn);foot.appendChild(p);
  btn.addEventListener('click',function(){try{localStorage.setItem(KEY,paused()?'on':'off')}catch(e){}apply()})}
 apply();
});
