(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  var globalSearchForms = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));

  globalSearchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';

      if (!value) {
        return;
      }

      event.preventDefault();
      window.location.href = './ranking.html?q=' + encodeURIComponent(value);
    });
  });

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var section = panel.closest('.section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
    var input = panel.querySelector('[data-filter-input]');
    var typeSelect = panel.querySelector('[data-filter-select="type"]');
    var yearSelect = panel.querySelector('[data-filter-select="year"]');
    var emptyState = section.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      var query = normalize(input ? input.value : '');
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesType = !type || cardType === type;
        var matchesYear = !year || cardYear === year;
        var visible = matchesQuery && matchesType && matchesYear;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', filterCards);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', filterCards);
    }

    filterCards();
  });

  function initPlayer(shell) {
    var video = shell.querySelector('[data-video-src]');
    var startButton = shell.querySelector('[data-player-start]');
    var hasStarted = false;

    if (!video) {
      return;
    }

    function startPlayback() {
      var source = video.getAttribute('data-video-src');

      if (!source) {
        return;
      }

      if (hasStarted) {
        video.play().catch(function () {});
        return;
      }

      hasStarted = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }

      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    }

    if (startButton) {
      startButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (!hasStarted) {
        startPlayback();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(initPlayer);
})();
