(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  onReady(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === activeIndex);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var channelSelect = document.querySelector("[data-channel-select]");
    var yearSelect = document.querySelector("[data-year-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var emptyState = document.querySelector("[data-empty-state]");

    function applyFilters() {
      var query = normalize(searchInput && searchInput.value);
      var channel = normalize(channelSelect && channelSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardChannel = normalize(card.getAttribute("data-channel"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (channel && cardChannel !== channel) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? "none" : "block";
      }
    }

    [searchInput, channelSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var source = player.querySelector("source");
      var button = player.querySelector(".play-cover");

      if (!video || !source) {
        return;
      }

      var src = source.getAttribute("src");

      if (window.Hls && window.Hls.isSupported() && src) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl") && src) {
        video.src = src;
      }

      function syncButton() {
        if (button) {
          button.classList.toggle("is-hidden", !video.paused);
        }
      }

      function playVideo() {
        var action = video.paused ? video.play() : video.pause();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      video.addEventListener("click", playVideo);
      video.addEventListener("play", syncButton);
      video.addEventListener("pause", syncButton);
      video.addEventListener("ended", syncButton);
      syncButton();
    });
  });
})();
