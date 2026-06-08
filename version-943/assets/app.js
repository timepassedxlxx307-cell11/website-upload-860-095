(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function run() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        run();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        run();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        run();
      });
    }

    show(0);
    run();
  });

  function applyFilters(scope) {
    var input = scope.querySelector('[data-card-filter]');
    var select = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var query = input ? input.value.trim().toLowerCase() : '';
    var type = select ? select.value.trim() : '';

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
      var cardType = card.getAttribute('data-type') || '';
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedType = !type || cardType === type;
      if (matchedQuery && matchedType) {
        card.removeAttribute('hidden-by-filter');
      } else {
        card.setAttribute('hidden-by-filter', '');
      }
    });
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-card-filter]');
    var select = scope.querySelector('[data-type-filter]');
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input.hasAttribute('data-query-input')) {
        input.value = q;
      }
      input.addEventListener('input', function () {
        applyFilters(scope);
      });
    }
    if (select) {
      select.addEventListener('change', function () {
        applyFilters(scope);
      });
    }
    applyFilters(scope);
  });

  var activeHls = null;
  var hlsLoading = null;

  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (hlsLoading) return hlsLoading;
    hlsLoading = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = function () { resolve(window.Hls); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsLoading;
  }

  function playVideo(video, url, autoplay) {
    if (!video || !url) return;
    if (activeHls) {
      activeHls.destroy();
      activeHls = null;
    }

    function start() {
      if (autoplay) {
        video.play().catch(function () {});
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', start, { once: true });
      video.load();
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        activeHls = new Hls({ enableWorker: true, lowLatencyMode: true });
        activeHls.loadSource(url);
        activeHls.attachMedia(video);
        activeHls.on(Hls.Events.MANIFEST_PARSED, start);
      } else {
        video.src = url;
        video.load();
        start();
      }
    }).catch(function () {
      video.src = url;
      video.load();
      start();
    });
  }

  document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var currentUrl = shell.getAttribute('data-video-url');
    var sourceList = shell.parentElement ? shell.parentElement.querySelector('[data-source-list]') : null;

    if (button) {
      button.addEventListener('click', function () {
        shell.classList.add('playing');
        playVideo(video, currentUrl, true);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
    }

    if (sourceList) {
      sourceList.querySelectorAll('[data-source]').forEach(function (chip) {
        chip.addEventListener('click', function () {
          sourceList.querySelectorAll('[data-source]').forEach(function (item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          currentUrl = chip.getAttribute('data-source');
          shell.setAttribute('data-video-url', currentUrl);
          shell.classList.add('playing');
          playVideo(video, currentUrl, true);
        });
      });
    }
  });
})();
