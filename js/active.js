/* Search: numbers (UPC, lot) match ignoring spaces and hyphens; words match at the start of a word, plural-tolerant.
   Direct matches show first: the word is in the title, a product name or description, where it was sold or shipped,
   the recalling firm or a store list (user, Oct 20: a store search must find "sold at Publix"). Items that only mention it
   in the reason or an ingredient list are hidden behind "Show N more". Several words must appear together as a phrase
   ("food lion"); items with the words apart only count as mentions. Numbers match anywhere. Matches are highlighted. */
var ITEMS=null,SHOWWEAK=false,TIMER=null,LASTQ='';
function setAll(open){document.querySelectorAll('details').forEach(function(d){d.open=open})}
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function joinDigits(s){return s.replace(/(\d)[\s\-‑.\/]+(?=\d)/g,'$1')}
function stem(w){if(w.length>4&&/ies$/.test(w))return w.slice(0,-3);if(w.length>4&&/(ches|shes|xes|ses|zes|oes)$/.test(w))return w.slice(0,-2);
 if(w.length>3&&/[^s]s$/.test(w))return w.slice(0,-1);return w}
function init(){ITEMS=[].slice.call(document.querySelectorAll('details[data-item]')).map(function(d,i){
 var s=d.querySelector('summary');d.dataset.ord=i;
 /* the "title" is the product name only: FDA titles often run on into ingredient lists, which would make passing mentions look like direct matches */
 var title=s.textContent.toLowerCase().split(/ingredient|contains[:\s]|net wt|net weight/)[0];
 /* direct text: title + every fact line except the reason and ingredient/allergen lines + product and store names */
 var parts=[title];
 [].slice.call(d.querySelectorAll('li')).forEach(function(li){if(li.querySelector('li'))return;var t=li.textContent.toLowerCase().trim();
  if(/^(reason:|ingredients?\b|contains\b|allergen)/.test(t))return;parts.push(t.split(/ingredients?:/)[0])});
 /* product and store names, and USDA's description paragraphs ("shipped to Publix locations in Florida") */
 [].slice.call(d.querySelectorAll('ol.prods>li>b,ul.stores b,div.inner>p')).forEach(function(b){parts.push(b.textContent.toLowerCase())});
 /* text with a space between elements: textContent glues "1" + "Brazil For You" + "529 Washington" into one word */
 var raw=spaced(d),text=raw.toLowerCase();
 return {el:d,title:title,direct:parts.join(' \n '),text:text,compact:text.replace(/[^a-z0-9]/g,''),digits:joinDigits(raw)}})}
function spaced(el){var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),out=[],n;while((n=w.nextNode()))out.push(n.nodeValue);return out.join(' ')}
function unmark(){document.querySelectorAll('mark.hl').forEach(function(m){var p=m.parentNode;p.replaceChild(document.createTextNode(m.textContent),m);p.normalize()})}
function mark(root,re){var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),nodes=[],n;while((n=w.nextNode()))nodes.push(n);
 nodes.forEach(function(t){var v=t.nodeValue;re.lastIndex=0;if(!re.test(v))return;re.lastIndex=0;var f=document.createDocumentFragment(),last=0,m;
  while((m=re.exec(v))){if(!m[0].length){re.lastIndex++;continue}f.appendChild(document.createTextNode(v.slice(last,m.index)));
   var k=document.createElement('mark');k.className='hl';k.textContent=m[0];f.appendChild(k);last=m.index+m[0].length}
  f.appendChild(document.createTextNode(v.slice(last)));t.parentNode.replaceChild(f,t)})}
function filtSoon(q){clearTimeout(TIMER);TIMER=setTimeout(function(){SHOWWEAK=false;filt(q)},150)}
function showWeak(){SHOWWEAK=true;filt(LASTQ)}
function filt(q){if(!ITEMS)init();LASTQ=q;q=q.trim().replace(/^est\.?\s+/i,'');unmark();/* "EST. P-48176" -> "P-48176" */
 var digitQ=q.replace(/[\s\-‑.\/]/g,''),isNum=/^\d{4,}$/.test(digitQ),words=[],hre=null;
 if(isNum){hre=new RegExp(digitQ.split('').map(esc).join('[\\s\\-\\u2011.\\/]?'),'g')}
 else if(q){/* words are letters and numbers only: symbols like & , " ( ) never block a match; drop the stray "s" from "Zapp's" */
  words=(q.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(function(w){return w.length>1||/\d/.test(w)}).map(stem);
  if(!words.length)q='';
  else if(words.length>1)hre=new RegExp('\\b'+words.map(esc).join('[a-z]*[^\\p{L}\\p{N}]+')+'[a-z]*','giu');
  else hre=new RegExp('\\b(?:'+words.map(esc).join('|')+')[a-z]*','gi')}
 /* lot codes with letters ("D080-148", "d080148", "SAL2-24JB"): match ignoring spaces, hyphens and dots, like UPCs */
 var codeQ=q.toLowerCase().replace(/[^a-z0-9]/g,''),isCode=!isNum&&codeQ.length>=4&&/\d/.test(codeQ)&&/[a-z]/.test(codeQ);
 if(isCode)hre=new RegExp(codeQ.split('').map(esc).join('[^a-z0-9]{0,2}'),'gi');
 var strong=0,weak=0;
 ITEMS.forEach(function(it){var hit=true,str=false;
  if(isNum){hit=it.digits.indexOf(digitQ)>=0;str=hit}
  else if(isCode&&it.compact.indexOf(codeQ)>=0){hit=true;str=true}
  else if(words.length){hit=words.every(function(w){return new RegExp('\\b'+esc(w)).test(it.text)});
   var phrase=words.length>1?new RegExp('\\b'+words.map(esc).join('[a-z]*[^\\p{L}\\p{N}]+'),'u'):new RegExp('\\b'+esc(words[0]));
   str=hit&&phrase.test(it.direct)}
  it.score=!q?0:(str?2:hit?1:0);var show=!q||str||(hit&&SHOWWEAK);
  it.el.classList.toggle('hidden',!show);it.el.classList.toggle('weak',!!q&&hit&&!str);if(q&&show)it.el.open=false;
  if(q&&str)strong++;else if(q&&hit)weak++});
 document.querySelectorAll('details.group>.inner').forEach(function(box){var kids=[].slice.call(box.children).filter(function(c){return c.hasAttribute('data-item')});
  kids.sort(function(a,b){var A=ITEMS[+a.dataset.ord],B=ITEMS[+b.dataset.ord];return (B.score-A.score)||(+a.dataset.ord-+b.dataset.ord)});
  kids.forEach(function(k){box.appendChild(k)})});
 var shown=ITEMS.filter(function(it){return !it.el.classList.contains('hidden')});
 if(q&&shown.length<=5)shown.forEach(function(it){it.el.open=true});
 document.querySelectorAll('details.group').forEach(function(g){var any=[].slice.call(g.querySelectorAll('details[data-item]')).some(function(d){return !d.classList.contains('hidden')});
  g.classList.toggle('hidden',!!q&&!any);if(q)g.open=any});
 if(hre)shown.slice(0,60).forEach(function(it){mark(it.el,hre)});
 var out=document.getElementById('nres');
 if(!q){out.textContent='';return}
 if(!strong&&!weak){out.innerHTML='<span class="nomatch"><img src="brand/pip-thinking.svg" alt="" width="64" height="64">'+
  '<span><b>No matches.</b> Try a brand, a product name or the UPC on the package.</span></span>';return}
 out.innerHTML=(strong?strong+(strong==1?' match':' matches'):'No direct matches')+
  (weak&&!SHOWWEAK?' &middot; <button type="button" class="linkbtn" data-act="show-weak">Show '+weak+' more that only mention it</button>':'')+
  (weak&&SHOWWEAK?' &middot; plus '+weak+' that only mention it (shown last, dimmed)':'')}
document.addEventListener('DOMContentLoaded',function(){var q=new URLSearchParams(location.search).get('q');
 if(q){var i=document.getElementById('q');i.value=q;filt(q);i.scrollIntoView({block:'center'})}});
document.addEventListener('DOMContentLoaded',function(){var i=document.getElementById('q');
 if(i)i.addEventListener('input',function(){filtSoon(i.value)});});
document.addEventListener('click',function(ev){var b=ev.target.closest('[data-act]');if(!b)return;
 var a=b.getAttribute('data-act');
 if(a==='all-open')setAll(true);else if(a==='all-close')setAll(false);else if(a==='show-weak')showWeak();});
