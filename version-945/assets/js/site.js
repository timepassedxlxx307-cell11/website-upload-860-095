(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initImageFallbacks() {
        var images = document.querySelectorAll("img");
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
                image.removeAttribute("src");
            });
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = Number(dot.getAttribute("data-hero-dot"));
                showSlide(nextIndex);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function initLocalFilters() {
        var panels = document.querySelectorAll("[data-filter-panel]");
        panels.forEach(function (panel) {
            var textInput = panel.querySelector("[data-text-filter]");
            var yearSelect = panel.querySelector("[data-year-filter]");
            var clearButton = panel.querySelector("[data-clear-filter]");
            var section = panel.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
            var countNode = section.querySelector("[data-visible-count]");

            function applyFilter() {
                var query = normalize(textInput ? textInput.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesYear = !year || cardYear.indexOf(year) !== -1;
                    var shouldShow = matchesQuery && matchesYear;
                    card.classList.toggle("is-filtered-out", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (countNode) {
                    countNode.textContent = String(visible);
                }
            }

            if (textInput) {
                textInput.addEventListener("input", applyFilter);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", applyFilter);
            }
            if (clearButton) {
                clearButton.addEventListener("click", function () {
                    if (textInput) {
                        textInput.value = "";
                    }
                    if (yearSelect) {
                        yearSelect.value = "";
                    }
                    applyFilter();
                });
            }
            applyFilter();
        });
    }

    function movieCardTemplate(movie) {
        return [
            '<article class="movie-card" data-movie-card>',
            '    <a href="' + movie.url + '" class="movie-card-link group" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <div class="poster-frame" data-fallback-title="' + escapeHtml(movie.title) + '">',
            '            <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 海报" class="poster-image" loading="lazy">',
            '            <div class="poster-shade"><span class="play-chip">立即观看</span></div>',
            '            <span class="region-badge">' + escapeHtml(movie.region) + '</span>',
            '        </div>',
            '        <div class="movie-card-body">',
            '            <h3>' + escapeHtml(movie.title) + '</h3>',
            '            <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</p>',
            '            <p class="movie-genre">' + escapeHtml(movie.genre) + '</p>',
            '            <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>',
            '        </div>',
            '    </a>',
            '</article>'
        ].join("\n");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var results = document.getElementById("searchResults");
        if (!results || !window.MOVIES_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = normalize(params.get("q"));
        var input = document.querySelector("[data-main-search-input]");
        var title = document.querySelector("[data-search-title]");
        var summary = document.querySelector("[data-search-summary]");

        if (input && query) {
            input.value = params.get("q");
        }

        if (!query) {
            initImageFallbacks();
            return;
        }

        var matches = window.MOVIES_INDEX.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(" "));
            return haystack.indexOf(query) !== -1;
        });

        if (title) {
            title.textContent = "搜索结果：" + params.get("q");
        }
        if (summary) {
            summary.textContent = "找到 " + matches.length + " 部匹配影片。";
        }

        if (matches.length === 0) {
            results.innerHTML = '<div class="empty-state">没有找到匹配影片，可以尝试输入年份、地区、类型或更短关键词。</div>';
        } else {
            results.innerHTML = matches.slice(0, 240).map(movieCardTemplate).join("\n");
            if (matches.length > 240) {
                results.insertAdjacentHTML("beforeend", '<div class="empty-state">已展示前 240 条结果，请使用更精确关键词继续筛选。</div>');
            }
        }
        initImageFallbacks();
    }

    ready(function () {
        initMobileMenu();
        initImageFallbacks();
        initHeroSlider();
        initLocalFilters();
        initSearchPage();
    });
}());
