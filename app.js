(()=>{
'use strict';
const menu=document.querySelector('.menu-toggle');
const nav=document.getElementById('primary-nav');
if(menu&&nav){
 menu.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')!=='true';
  menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);
 });
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');
 }));
}
const deadline=Date.parse('2026-12-19T18:00:00-08:00');
function countdown(){
 const remain=Math.max(0,Math.floor((deadline-Date.now())/1000));
 const data={days:Math.floor(remain/86400),hours:Math.floor(remain%86400/3600),minutes:Math.floor(remain%3600/60),seconds:remain%60};
 for(const [key,value] of Object.entries(data)){const el=document.getElementById('count-'+key);if(el)el.textContent=key==='days'?String(value):String(value).padStart(2,'0')}
}
countdown();setInterval(countdown,1000);
const banner=document.querySelector('.concept-strip');if(banner)banner.remove();
const storyOldLink=document.querySelector('.story-copy a.dark-link');if(storyOldLink)storyOldLink.remove();
const christmasButton=document.querySelector('.holiday-copy .btn');
if(christmasButton){christmasButton.href='/registration.html';christmasButton.textContent='Register Your Child →';christmasButton.removeAttribute('target');christmasButton.removeAttribute('rel');}
const navCta=document.querySelector('.nav-cta');
if(navCta){navCta.href='/registration.html';navCta.textContent='Family Registration ↗';navCta.removeAttribute('target');navCta.removeAttribute('rel')}
if(nav){const signup=document.createElement('a');signup.href='/registration.html';signup.textContent='Register Your Child';nav.appendChild(signup)}
const footerExplore=document.querySelector('.footer-links');if(footerExplore){
 const signup=document.createElement('a');signup.href='/registration.html';signup.textContent='Family Registration';footerExplore.appendChild(signup);
}
const copyright=document.querySelector('.footer-base > span');
if(copyright)copyright.textContent='© 2026 Absolute Kids. All rights reserved.';
})();

(function(){
 const nav=document.getElementById('primary-nav');
 if(nav){
 const navItems=[['/about.html','Our Story'],['/programs.html','Programs'],['/events.html','Events'],['/donate.html','Donate'],['/gallery.html','Gallery'],['#sponsors','Supporters'],['/contact.html','Contact'],['/registration.html','Family Sign-Up']];
 nav.innerHTML=navItems.map(([path,title])=>'<a href="'+path+'">'+title+'</a>').join('');
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{const m=document.querySelector('.menu-toggle');m?.setAttribute('aria-expanded','false');nav.classList.remove('is-open')}));
 }
 function replaceLink(selector,target,label){
 const item=document.querySelector(selector);if(item){item.href=target;if(label)item.textContent=label;item.removeAttribute('target');item.removeAttribute('rel')}
 }
 replaceLink('.hero-copy a[href="#about"]','/about.html','Explore Our Mission →');
 replaceLink('.impact-layout a[href="#connect"]','/donate.html','Explore Ways to Help →');
 replaceLink('.way-card.way-peach a','/donate.html','Explore Giving ↗');
 replaceLink('.way-card.way-purple a','/contact.html#volunteer','Ask About Volunteering ↗');
 replaceLink('.way-card.way-green a','/contact.html#partner','Become a Partner ↗');
 replaceLink('.contact-layout .contact-website','/contact.html','Contact Absolute Kids ↗');
 const footerNav=document.querySelector('.footer-main .footer-links');
 if(footerNav){footerNav.innerHTML='<strong>Explore</strong><a href="/about.html">Our Story</a><a href="/programs.html">Programs</a><a href="/events.html">Events</a><a href="/donate.html">Donate</a><a href="/gallery.html">Gallery</a><a href="#sponsors">Supporters</a><a href="/registration.html">Family Sign-Up</a>'}
 const footers=document.querySelectorAll('.footer-main .footer-links');
 if(footers.length>1){const old=footers[1].querySelector('a[href="https://www.absolutekids.org/"]');if(old){old.href='/contact.html';old.textContent='Contact Us ↗'}}
 const programCards=document.querySelectorAll('.program-card');
 const destinations=['/programs.html#mentorship','/programs.html#sports','/programs.html#community'];
 programCards.forEach((card,i)=>{if(card.querySelector('.program-more'))return;const a=document.createElement('a');a.href=destinations[i];a.className='program-more';a.style.cssText='font-size:13px;font-weight:900;color:#aa625a;display:inline-block;margin-top:18px;text-underline-offset:5px';a.textContent='Learn More ↗';card.appendChild(a)});
})();
