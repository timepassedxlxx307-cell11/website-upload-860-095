(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-nav]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(
      root.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      root.querySelectorAll("[data-hero-dot]"),
    );
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-scope]"),
    );
    scopes.forEach(function (scope) {
      var search = scope.querySelector("[data-filter-search]");
      var selects = Array.prototype.slice.call(
        scope.querySelectorAll("[data-filter-select]"),
      );
      var reset = scope.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(
        scope.querySelectorAll("[data-card]"),
      );
      var empty = scope.querySelector("[data-empty-result]");
      if (!cards.length) {
        return;
      }

      if (scope.hasAttribute("data-query-from-url") && search) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          search.value = query;
        }
      }

      function update() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var activeFilters = {};
        selects.forEach(function (select) {
          var field = select.getAttribute("data-filter-field");
          if (field && select.value) {
            activeFilters[field] = select.value;
          }
        });
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var match = !q || haystack.indexOf(q) !== -1;
          Object.keys(activeFilters).forEach(function (field) {
            if (
              (card.getAttribute("data-" + field) || "") !==
              activeFilters[field]
            ) {
              match = false;
            }
          });
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (search) {
        search.addEventListener("input", update);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", update);
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          selects.forEach(function (select) {
            select.value = "";
          });
          update();
        });
      }
      update();
    });
  }

  window.setupMoviePlayer = function (streamUrl) {
    function attach() {
      var shell = document.querySelector("[data-player]");
      var video = document.querySelector("[data-video]");
      var button = document.querySelector("[data-player-start]");
      var status = document.querySelector("[data-player-status]");
      if (!shell || !video || !streamUrl) {
        return;
      }
      var initialized = false;
      var hls = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }

      function load() {
        if (initialized) {
          return;
        }
        initialized = true;
        setStatus("");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus("视频加载失败，请稍后重试");
            }
          });
        } else {
          setStatus("当前设备暂不支持播放");
        }
      }

      function play() {
        load();
        if (button) {
          button.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      shell.addEventListener("click", function (event) {
        if (event.target === video && video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
    ready(attach);
  };

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
  });
})();
