(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const toast = document.querySelector('.toast');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky navigation becomes a quiet glass surface once the campaign starts moving.
  const updateHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Mobile navigation
  const closeMenu = () => {
    menuToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    body.classList.remove('menu-open');
  };
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
  });
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  // Scroll reveals
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Gentle parallax for the campaign imagery.
  const parallaxItems = [...document.querySelectorAll('.parallax')].filter((item) => !item.classList.contains('hero-image-wrap'));
  let ticking = false;
  const moveParallax = () => {
    if (reduceMotion) return;
    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom > -100 && rect.top < window.innerHeight + 100) {
        const speed = Number(item.dataset.speed || 0.08);
        const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed;
        item.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(moveParallax);
      ticking = true;
    }
  }, { passive: true });
  moveParallax();

  // Product color and angle changes.
  const productImage = document.querySelector('#product-image');
  const productHolder = document.querySelector('.product-image-holder');
  const colorName = document.querySelector('#color-name');
  const swatches = [...document.querySelectorAll('.swatch')];
  const stageImages = [
    { src: 'assets/nova-hero.png', alt: 'Black Air Nova sneaker product view' },
    { src: 'assets/nova-detail.png', alt: 'Close-up detail of the Air Nova sneaker' },
    { src: 'assets/nova-red.png', alt: 'Red Air Nova sneaker product view' }
  ];
  let stageIndex = 0;

  const swapProductImage = (src, alt) => {
    productHolder.classList.add('changing');
    window.setTimeout(() => {
      productImage.src = src;
      productImage.alt = alt;
      productHolder.classList.remove('changing');
    }, reduceMotion ? 0 : 260);
  };
  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      swatches.forEach((item) => item.classList.remove('active'));
      swatch.classList.add('active');
      colorName.textContent = swatch.dataset.name;
      swapProductImage(swatch.dataset.image, `${swatch.dataset.name} Air Nova sneaker product view`);
    });
  });
  document.querySelectorAll('[data-stage]').forEach((button) => {
    button.addEventListener('click', () => {
      stageIndex = button.dataset.stage === 'next'
        ? (stageIndex + 1) % stageImages.length
        : (stageIndex - 1 + stageImages.length) % stageImages.length;
      swapProductImage(stageImages[stageIndex].src, stageImages[stageIndex].alt);
      document.querySelector('.stage-controls span').innerHTML = `0${stageIndex + 1} <i>/</i> 03`;
    });
  });

  // Size selector
  document.querySelectorAll('.sizes button').forEach((size) => {
    size.addEventListener('click', () => {
      document.querySelectorAll('.sizes button').forEach((item) => item.classList.remove('selected'));
      size.classList.add('selected');
      showToast(`Size ${size.textContent} selected`);
    });
  });

  // Performance counters
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (element) => {
    const target = Number(element.dataset.count);
    const duration = 1250;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .6 });
    counters.forEach((counter) => countObserver.observe(counter));
  } else {
    counters.forEach((counter) => { counter.textContent = counter.dataset.count; });
  }

  // Small feedback moments for icon, guide and commerce actions.
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  }
  document.querySelectorAll('[data-toast]').forEach((button) => {
    button.addEventListener('click', () => showToast(button.dataset.toast));
  });
  const bagCount = document.querySelector('.bag-count');
  document.querySelector('.add-to-bag').addEventListener('click', () => {
    bagCount.textContent = '1';
    bagCount.classList.add('has-items');
    showToast('Air Nova added to your bag');
  });

  // Keep the active nav interaction feeling intentional without leaving the concept page.
  document.querySelectorAll('a[href="#top"]').forEach((link) => link.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })));
})();
