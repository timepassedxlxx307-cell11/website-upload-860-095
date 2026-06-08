(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function createCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.setAttribute("data-filter", [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(" "));

    var link = document.createElement("a");
    link.className = "movie-thumb";
    link.href = movie.url;
    link.setAttribute("aria-label", "观看" + movie.title);

    var image = document.createElement("img");
    image.src = movie.cover;
    image.alt = movie.title;
    image.loading = "lazy";

    var play = document.createElement("span");
    play.className = "movie-play";
    play.innerHTML = '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.6v16.8L19 12 5 3.6z"></path></svg>';

    var region = document.createElement("span");
    region.className = "movie-region";
    region.textContent = movie.region;

    link.appendChild(image);
    link.appendChild(play);
    link.appendChild(region);

    var title = document.createElement("h3");
    var titleLink = document.createElement("a");
    titleLink.href = movie.url;
    titleLink.textContent = movie.title;
    title.appendChild(titleLink);

    var meta = document.createElement("p");
    meta.textContent = movie.year + " · " + movie.type;

    article.appendChild(link);
    article.appendChild(title);
    article.appendChild(meta);
    return article;
  }

  function setupMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(next) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = next;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector(".js-filter-input");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-token]"));
      var chipToken = "";
      function apply() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-filter"));
          var matchedQuery = !query || haystack.indexOf(query) !== -1;
          var matchedChip = !chipToken || haystack.indexOf(normalize(chipToken)) !== -1;
          card.style.display = matchedQuery && matchedChip ? "" : "none";
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (button) {
        button.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          chipToken = button.getAttribute("data-filter-token") || "";
          apply();
        });
      });
    });
  }

  function setupSearchPage() {
    var container = document.getElementById("search-results");
    if (!container || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var input = document.getElementById("search-page-input");
    var title = document.getElementById("search-title");
    var summary = document.getElementById("search-summary");
    if (input && query) {
      input.value = params.get("q");
    }
    if (!query) {
      return;
    }
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(" "));
      return haystack.indexOf(query) !== -1;
    });
    container.innerHTML = "";
    if (title) {
      title.textContent = "搜索结果";
    }
    if (summary) {
      summary.textContent = "关键词“" + params.get("q") + "”找到 " + results.length + " 部相关影视内容。";
    }
    if (!results.length) {
      var empty = document.createElement("p");
      empty.className = "empty-result";
      empty.textContent = "未找到相关影片，请尝试其他片名、地区、年份或题材。";
      container.appendChild(empty);
      return;
    }
    results.slice(0, 240).forEach(function (movie) {
      container.appendChild(createCard(movie));
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
