(function () {
  'use strict';
  var inserted = new Set();

  function normalize(url) {
    try {
      var parsed = new URL(url, location.href);
      parsed.hash = '';
      parsed.search = '';
      return parsed.href.replace(/\/$/, '');
    } catch (error) {
      return String(url || '').replace(/\/$/, '');
    }
  }

  function card(product) {
    var link = document.createElement('a');
    link.className = 'story-product-card';
    link.href = product.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', product.name + ' 제품 페이지 열기');

    var image = document.createElement('img');
    image.src = product.image;
    image.alt = product.name;
    image.loading = 'lazy';
    image.decoding = 'async';

    var copy = document.createElement('span');
    copy.className = 'story-product-card-copy';

    var label = document.createElement('span');
    label.className = 'story-product-card-label';
    label.textContent = '추천 제품';

    var name = document.createElement('span');
    name.className = 'story-product-card-name';
    name.textContent = product.name;

    var cta = document.createElement('span');
    cta.className = 'story-product-card-cta';
    cta.textContent = '제품 보러 가기';

    copy.append(label, name, cta);
    link.append(image, copy);
    return link;
  }

  function enhance(products) {
    var byUrl = new Map();
    products.forEach(function (product) {
      if (product && product.url && product.image) byUrl.set(normalize(product.url), product);
    });

    document.querySelectorAll('.story-post-body a[href]').forEach(function (link) {
      var key = normalize(link.href);
      var product = byUrl.get(key);
      if (!product || inserted.has(key)) return;

      var block = link.closest('p, li');
      if (!block || !block.parentNode) return;
      block.insertAdjacentElement('afterend', card(product));
      inserted.add(key);
    });
  }

  function start() {
    fetch('../products.json', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then(function (data) {
        var products = Array.isArray(data.products) ? data.products : [];
        var attempts = 0;
        function applyWhenReady() {
          enhance(products);
          attempts += 1;
          if (!document.querySelector('.story-post-body') && attempts < 20) {
            window.setTimeout(applyWhenReady, 250);
          }
        }
        applyWhenReady();
      })
      .catch(function () {
        // 제품 정보가 없거나 네트워크가 끊겨도 본문 링크는 그대로 사용할 수 있습니다.
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

