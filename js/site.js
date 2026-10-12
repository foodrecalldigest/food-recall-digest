/* Food Recall Digest: shared page script (cards, counters, reveal, Open all / Close all).
   Loaded from every page; no inline scripts or onclick handlers, so the CSP allows scripts only from this site. */
document.addEventListener('DOMContentLoaded',function(){
 var calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 var els=document.querySelectorAll('.reveal');
 if(calm||!('IntersectionObserver' in window)){els.forEach(function(x){x.classList.add('in')});}
 else{var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(x){io.observe(x)});}
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
 var d=h.tagName==='DETAILS'?h:h.closest('details');while(d){d.open=true;d=d.parentElement&&d.parentElement.closest('details')}
 h.scrollIntoView({block:'start'})}
function setCards(o,el){var root=(el&&el.closest('section'))||document;root.querySelectorAll('.rc').forEach(function(c){setCard(c,o,false)})}
function setStores(o){document.querySelectorAll('details.stores').forEach(function(d){d.open=o})}
document.addEventListener('click',function(ev){var b=ev.target.closest('[data-act]');if(!b)return;
 var a=b.getAttribute('data-act');
 if(a==='cards-open')setCards(true,b);else if(a==='cards-close')setCards(false,b);
 else if(a==='stores-open')setStores(true);else if(a==='stores-close')setStores(false);});
