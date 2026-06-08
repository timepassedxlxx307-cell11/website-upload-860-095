(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  window.initMoviePlayer = function (videoUrl) {
    ready(function () {
      var video = document.getElementById("movie-video");
      var toggle = document.getElementById("movie-player-toggle");
      var started = false;

      if (!video || !videoUrl) {
        return;
      }

      function hideToggle() {
        if (toggle) {
          toggle.classList.add("is-hidden");
        }
      }

      function attachVideo() {
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = videoUrl;
        }
      }

      function playVideo() {
        attachVideo();
        hideToggle();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (toggle) {
        toggle.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener("play", hideToggle);
    });
  };
})();
