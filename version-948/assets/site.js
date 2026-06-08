(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-hero-thumb]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function setActive(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setActive(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                setActive(i);
                start();
            });
        });

        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener("mouseenter", function () {
                setActive(i);
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                setActive(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setActive(current + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        setActive(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var list = document.querySelector("[data-filter-list]");
            var empty = document.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var typeValue = typeSelect ? typeSelect.value : "";
                var yearValue = yearSelect ? yearSelect.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-category")
                    ].join(" ").toLowerCase();
                    var typeOk = !typeValue || text.indexOf(typeValue.toLowerCase()) !== -1;
                    var yearOk = !yearValue || card.getAttribute("data-year") === yearValue;
                    var queryOk = !query || text.indexOf(query) !== -1;
                    var show = typeOk && yearOk && queryOk;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener("change", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-button]");
            var stream = player.getAttribute("data-stream");
            var attached = false;
            var hls = null;

            if (!video || !stream) {
                return;
            }

            function attachStream() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function playVideo() {
                attachStream();
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            function updateButton() {
                if (!button) {
                    return;
                }
                button.classList.toggle("is-hidden", !video.paused);
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    playVideo();
                });
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });

            video.addEventListener("play", updateButton);
            video.addEventListener("pause", updateButton);
            video.addEventListener("ended", updateButton);
            player.addEventListener("mouseenter", attachStream, { once: true });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }
})();
