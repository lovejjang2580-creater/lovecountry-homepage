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

let revealObserver;
const observeReveals=(root=document)=>{
  const items=root.querySelectorAll('.reveal:not(.is-visible)');
  if(reducedMotion){items.forEach(el=>el.classList.add('is-visible'));return}
  items.forEach(el=>revealObserver.observe(el));
};

const setFinalState=()=>{
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
  document.querySelectorAll('.counter').forEach(el=>el.textContent=el.dataset.target);
};

if(reducedMotion){
  setFinalState();
}else{
  revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}
  }),{threshold:.14});
  observeReveals();

  const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target;const target=Number(el.dataset.target);const duration=900;const started=performance.now();
    const tick=now=>{const progress=Math.min((now-started)/duration,1);el.textContent=Math.round(target*(1-Math.pow(1-progress,3)));if(progress<1)requestAnimationFrame(tick)};
    requestAnimationFrame(tick);counterObserver.unobserve(el);
  }),{threshold:.7});
  document.querySelectorAll('.counter').forEach(el=>counterObserver.observe(el));
}

const formatPrice=value=>new Intl.NumberFormat('ko-KR').format(value)+'원';
const createProductCard=product=>{
  const card=document.createElement('article');card.className='catalog-card reveal';
  const imageLink=document.createElement('a');imageLink.className='catalog-image';imageLink.href=product.url;imageLink.target='_blank';imageLink.rel='noopener noreferrer';imageLink.setAttribute('aria-label',product.name+' 구매 페이지 열기');
  const image=document.createElement('img');image.src=product.image;image.alt=product.name;image.loading='lazy';image.decoding='async';imageLink.append(image);
  const body=document.createElement('div');body.className='catalog-body';
  const kicker=document.createElement('p');kicker.className='catalog-kicker';kicker.textContent='LOVE COUNTRY';
  const name=document.createElement('h2');name.textContent=product.name;
  const price=document.createElement('p');price.className='catalog-price';price.textContent=formatPrice(product.price);
  const buy=document.createElement('a');buy.className='buy-button';buy.href=product.url;buy.target='_blank';buy.rel='noopener noreferrer';buy.innerHTML='<span>구매하기</span><span aria-hidden="true">↗</span>';
  body.append(kicker,name,price,buy);card.append(imageLink,body);return card;
};

const loadProducts=async()=>{
  const lists=document.querySelectorAll('[data-product-list]');if(!lists.length)return;
  const statuses=document.querySelectorAll('[data-product-status]');
  try{
    const response=await fetch('products.json');if(!response.ok)throw new Error('product data');
    const data=await response.json();const products=data.products;
    lists.forEach(list=>{const limit=Number(list.dataset.limit)||products.length;products.slice(0,limit).forEach(product=>list.append(createProductCard(product)));observeReveals(list)});
    document.querySelectorAll('[data-product-count]').forEach(el=>el.textContent=products.length+' ITEMS');
    statuses.forEach(el=>el.textContent='');
  }catch(error){statuses.forEach(el=>el.textContent='제품을 불러오지 못했어요. 잠시 후 다시 시도해주세요.')}
};
loadProducts();
