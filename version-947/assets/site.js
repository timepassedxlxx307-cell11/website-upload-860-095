(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(itemIndex);
        start();
      });
    });

    start();
  }

  function bindFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll(".js-movie-grid"));
    if (!grids.length) {
      return;
    }
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var sortSelect = document.querySelector("[data-sort-select]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var empty = document.querySelector("[data-empty-state]");
    var activeGenre = "all";

    function getCards() {
      return grids.reduce(function (items, grid) {
        return items.concat(Array.prototype.slice.call(grid.children));
      }, []);
    }

    function queryValue() {
      var input = searchInputs.find(function (item) {
        return item.value.trim();
      });
      return input ? input.value.trim().toLowerCase() : "";
    }

    function applySort() {
      if (!sortSelect) {
        return;
      }
      var value = sortSelect.value;
      grids.forEach(function (grid) {
        var items = Array.prototype.slice.call(grid.children);
        if (value === "year-desc") {
          items.sort(function (a, b) {
            return String(b.getAttribute("data-year") || "").localeCompare(String(a.getAttribute("data-year") || ""), "zh-Hans-CN");
          });
        }
        if (value === "title-asc") {
          items.sort(function (a, b) {
            return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
          });
        }
        items.forEach(function (item) {
          grid.appendChild(item);
        });
      });
    }

    function applyFilter() {
      var value = queryValue();
      var visible = 0;
      getCards().forEach(function (card) {
        var text = String(card.getAttribute("data-text") || "");
        var genre = String(card.getAttribute("data-genre") || "");
        var keywordMatch = !value || text.indexOf(value) !== -1;
        var genreMatch = activeGenre === "all" || genre === activeGenre;
        var shouldShow = keywordMatch && genreMatch;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        searchInputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        applyFilter();
      });
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeGenre = chip.getAttribute("data-filter-value") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        applyFilter();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        applySort();
        applyFilter();
      });
    }
  }

  window.initMoviePlayer = function (source) {
    var shell = document.querySelector(".js-player");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    if (!video || !cover || !source) {
      return;
    }
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      shell.classList.add("is-playing");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.currentTime) {
        shell.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    bindNavigation();
    bindHero();
    bindFilters();
  });
})();
