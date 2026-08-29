const header=document.querySelector('[data-header]');
const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.site-nav');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeader=()=>header.classList.toggle('is-scrolled',window.scrollY>40);
updateHeader();
window.addEventListener('scroll',updateHeader,{passive:true});

menuButton.addEventListener('click',()=>{
  const open=menuButton.getAttribute('aria-expanded')==='true';
  menuButton.setAttribute('aria-expanded',String(!open));
  menuButton.querySelector('.sr-only').textContent=open?'메뉴 열기':'메뉴 닫기';
  nav.classList.toggle('is-open',!open);
});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  menuButton.setAttribute('aria-expanded','false');
  nav.classList.remove('is-open');
}));

const setFinalState=()=>{
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
  document.querySelectorAll('.counter').forEach(el=>el.textContent=el.dataset.target);
};

if(reducedMotion){
  setFinalState();
}else{
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}
  }),{threshold:.14});
  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

  const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target;const target=Number(el.dataset.target);const duration=900;const started=performance.now();
    const tick=now=>{const progress=Math.min((now-started)/duration,1);el.textContent=Math.round(target*(1-Math.pow(1-progress,3)));if(progress<1)requestAnimationFrame(tick)};
    requestAnimationFrame(tick);counterObserver.unobserve(el);
  }),{threshold:.7});
  document.querySelectorAll('.counter').forEach(el=>counterObserver.observe(el));
}
