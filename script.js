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
const FEATURED_PRODUCT_NAME='러브컨츄리 뜨개가방 코바늘 가방뜨기 뜨개질 diy 데일리 빅백';
const getCuratedProducts=products=>{
  const featured=products.find(product=>product.name===FEATURED_PRODUCT_NAME);
  const rest=products.filter(product=>product!==featured).slice(0,6);
  return featured?[featured,...rest]:products.slice(0,7);
};
const addProductStructuredData=products=>{
  if(!products.length)return;
  const curatedPage=document.querySelector('[data-product-feature]');
  const list=document.querySelector('[data-product-list]');
  if(!curatedPage&&!list)return;
  const visibleProducts=curatedPage?getCuratedProducts(products):products.slice(0,Number(list.dataset.limit)||products.length);
  const data={
    '@context':'https://schema.org',
    '@type':'ItemList',
    name:document.body.classList.contains('products-page')?'러브컨츄리 전체 제품':'러브컨츄리 대표 제품',
    numberOfItems:visibleProducts.length,
    itemListElement:visibleProducts.map((product,index)=>({
      '@type':'ListItem',
      position:index+1,
      item:{
        '@type':'Product',
        name:String(product.name),
        image:String(product.image),
        brand:{'@type':'Brand',name:'러브컨츄리'},
        offers:{
          '@type':'Offer',
          url:String(product.url),
          priceCurrency:'KRW',
          price:String(product.price)
        }
      }
    }))
  };
  const script=document.createElement('script');script.type='application/ld+json';script.id='product-structured-data';script.textContent=JSON.stringify(data);document.head.append(script);
};
const createProductCard=product=>{
  const card=document.createElement('article');card.className='catalog-card reveal';
  const imageLink=document.createElement('a');imageLink.className='catalog-image';imageLink.href=product.url;imageLink.target='_blank';imageLink.rel='noopener noreferrer';imageLink.setAttribute('aria-label',product.name+' 구매 페이지 열기');
  const image=document.createElement('img');image.src=product.image;image.alt=product.name;image.loading='lazy';image.decoding='async';imageLink.append(image);
  const body=document.createElement('div');body.className='catalog-body';
  const kicker=document.createElement('p');kicker.className='catalog-kicker';kicker.textContent=product.tagline||'오늘의 뜨개거리';
  const name=document.createElement('h2');name.textContent=product.name;
  const price=document.createElement('p');price.className='catalog-price';price.textContent=formatPrice(product.price);
  const buy=document.createElement('button');buy.type='button';buy.className='buy-button';buy.setAttribute('data-cart-add','');buy.dataset.name=product.name;buy.dataset.price=String(product.price);buy.dataset.url=product.url;buy.innerHTML='<span>장바구니 담기</span><span aria-hidden="true">+</span>';
  body.append(kicker,name,price,buy);card.append(imageLink,body);return card;
};

const createFeaturedProduct=product=>{
  const article=document.createElement('article');article.className='curated-feature-card reveal';
  const imageLink=document.createElement('a');imageLink.className='curated-feature-image';imageLink.href=product.url;imageLink.target='_blank';imageLink.rel='noopener noreferrer';imageLink.setAttribute('aria-label',product.name+' 구매 페이지 열기');
  const image=document.createElement('img');image.src=product.image;image.alt=product.name;image.decoding='async';imageLink.append(image);
  const body=document.createElement('div');body.className='curated-feature-body';
  const label=document.createElement('p');label.className='catalog-kicker';label.textContent='EDITOR\u2019S PICK';
  const tagline=document.createElement('p');tagline.className='curated-tagline';tagline.textContent=product.tagline||'초보자도 할 수 있는 뜨개 패키지';
  const name=document.createElement('h2');name.textContent=product.name;
  const price=document.createElement('p');price.className='curated-feature-price';price.textContent=formatPrice(product.price);
  const buy=document.createElement('button');buy.type='button';buy.className='curated-buy-button';buy.setAttribute('data-cart-add','');buy.dataset.name=product.name;buy.dataset.price=String(product.price);buy.dataset.url=product.url;buy.innerHTML='<span>이 키트 장바구니 담기</span><span aria-hidden="true">+</span>';
  body.append(label,tagline,name,price,buy);article.append(imageLink,body);return article;
};

const loadProducts=async()=>{
  const lists=document.querySelectorAll('[data-product-list]');
  const featureSlots=document.querySelectorAll('[data-product-feature]');
  const curatedLists=document.querySelectorAll('[data-curated-product-list]');
  if(!lists.length&&!featureSlots.length&&!curatedLists.length)return;
  const statuses=document.querySelectorAll('[data-product-status]');
  try{
    const response=await fetch('products.json');if(!response.ok)throw new Error('product data');
    const data=await response.json();const products=data.products;addProductStructuredData(products);
    lists.forEach(list=>{const limit=Number(list.dataset.limit)||products.length;products.slice(0,limit).forEach(product=>list.append(createProductCard(product)));observeReveals(list)});
    const curated=getCuratedProducts(products);const featured=curated[0];const rest=curated.slice(1);
    featureSlots.forEach(slot=>{if(featured)slot.append(createFeaturedProduct(featured));observeReveals(slot)});
    curatedLists.forEach(list=>{const limit=Number(list.dataset.limit)||6;rest.slice(0,limit).forEach(product=>list.append(createProductCard(product)));observeReveals(list)});
    statuses.forEach(el=>el.textContent='');
  }catch(error){statuses.forEach(el=>el.textContent='제품을 불러오지 못했어요. 잠시 후 다시 시도해주세요.')}
};
loadProducts();

const formatStoryDate=value=>String(value||'').replaceAll('-','.');
const createStoryCard=post=>{
  const link=document.createElement('a');link.className='story reveal';
  const customUrl=String(post.url||'');link.href=customUrl?(/^https?:\/\//.test(customUrl)||customUrl.startsWith('/')?customUrl:'story/'+customUrl):'story/post.html?id='+encodeURIComponent(post.id||'');
  const date=document.createElement('time');date.dateTime=String(post.date||'');date.textContent=formatStoryDate(post.date);
  const copy=document.createElement('div');copy.className='story-card-copy';
  const title=document.createElement('h3');title.textContent=String(post.title||'(제목 없음)');copy.append(title);
  if(post.summary){const summary=document.createElement('p');summary.textContent=String(post.summary);copy.append(summary)}
  const arrow=document.createElement('span');arrow.textContent='읽기 ↗';link.append(date,copy,arrow);return link;
};

const loadStories=async()=>{
  const lists=document.querySelectorAll('[data-story-list]');if(!lists.length)return;
  const statuses=document.querySelectorAll('[data-story-status]');
  try{
    const response=await fetch('story/posts.json',{cache:'no-store'});if(!response.ok)throw new Error('story data');
    const posts=await response.json();const sorted=posts.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    lists.forEach(list=>{const limit=Number(list.dataset.limit)||sorted.length;sorted.slice(0,limit).forEach(post=>list.append(createStoryCard(post)));observeReveals(list)});
    statuses.forEach(el=>el.textContent='');
  }catch(error){statuses.forEach(el=>el.textContent='이야기를 불러오지 못했어요. 잠시 후 다시 시도해주세요.')}
};
loadStories();
