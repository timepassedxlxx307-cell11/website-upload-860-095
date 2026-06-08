(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === activeSlide);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var genreSelect = document.querySelector('[data-filter-genre]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var query = normalize(filterInput ? filterInput.value : '');
    var genre = normalize(genreSelect ? genreSelect.value : '');
    var region = normalize(regionSelect ? regionSelect.value : '');

    cards.forEach(function (card) {
      var title = normalize(card.getAttribute('data-title'));
      var tagText = normalize(card.getAttribute('data-tags'));
      var genreText = normalize(card.getAttribute('data-genre'));
      var regionText = normalize(card.getAttribute('data-region'));
      var yearText = normalize(card.getAttribute('data-year'));
      var typeText = normalize(card.getAttribute('data-type'));
      var haystack = title + ' ' + tagText + ' ' + genreText + ' ' + regionText + ' ' + yearText + ' ' + typeText;
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchGenre = !genre || genreText.indexOf(genre) !== -1 || tagText.indexOf(genre) !== -1;
      var matchRegion = !region || regionText.indexOf(region) !== -1;

      card.classList.toggle('is-hidden-card', !(matchQuery && matchGenre && matchRegion));
    });
  }

  [filterInput, genreSelect, regionSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });

  var player = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play-button]');
  var playMask = document.querySelector('[data-play-mask]');
  var hlsInstance = null;

  function requestPlay() {
    if (!player) {
      return;
    }

    var playTask = player.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  function startPlayback() {
    if (!player) {
      return;
    }

    var stream = player.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      if (!player.getAttribute('src')) {
        player.setAttribute('src', stream);
      }
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(player);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
      }
    } else if (!player.getAttribute('src')) {
      player.setAttribute('src', stream);
    }

    if (playMask) {
      playMask.classList.add('is-hidden');
    }

    requestPlay();
  }

  if (playButton) {
    playButton.addEventListener('click', startPlayback);
  }

  if (playMask) {
    playMask.addEventListener('click', startPlayback);
  }

  if (player) {
    player.addEventListener('click', function () {
      if (player.paused) {
        startPlayback();
      }
    });
  }

  var backTop = document.createElement('button');
  backTop.className = 'back-top';
  backTop.type = 'button';
  backTop.textContent = '↑';
  backTop.setAttribute('aria-label', '返回顶部');
  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(backTop);
})();
