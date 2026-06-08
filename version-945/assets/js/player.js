import { H as Hls } from "./hls-vendor-dru42stk.js";

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function setText(node, message) {
    if (node) {
        node.textContent = message;
    }
}

function initPlayer() {
    var video = document.querySelector("[data-hls-src]");
    if (!video) {
        return;
    }

    var source = video.getAttribute("data-hls-src");
    var shell = document.querySelector("[data-player-shell]");
    var overlay = document.querySelector("[data-player-overlay]");
    var status = document.querySelector("[data-player-status]");
    var toggleButton = document.querySelector("[data-player-toggle]");
    var muteButton = document.querySelector("[data-player-mute]");
    var fullscreenButton = document.querySelector("[data-player-fullscreen]");
    var hlsInstance = null;

    function markReady() {
        setText(status, "播放源已就绪");
    }

    function markError(message) {
        setText(status, message || "播放源加载失败");
    }

    function attachHls() {
        if (!source) {
            markError("未找到播放源");
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, markReady);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    markError("播放源发生错误，浏览器将尝试恢复");
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", markReady, { once: true });
        } else {
            markError("当前浏览器不支持 HLS 播放");
        }
    }

    function playOrPause() {
        if (video.paused) {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    markError("请再次点击播放按钮开始播放");
                });
            }
        } else {
            video.pause();
        }
    }

    attachHls();

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        setText(status, "正在播放");
    });

    video.addEventListener("pause", function () {
        setText(status, "已暂停");
    });

    video.addEventListener("waiting", function () {
        setText(status, "缓冲中...");
    });

    video.addEventListener("playing", function () {
        setText(status, "正在播放");
    });

    if (overlay) {
        overlay.addEventListener("click", playOrPause);
    }

    if (toggleButton) {
        toggleButton.addEventListener("click", playOrPause);
    }

    if (muteButton) {
        muteButton.addEventListener("click", function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
    }

    if (fullscreenButton && shell) {
        fullscreenButton.addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (shell.requestFullscreen) {
                shell.requestFullscreen();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

ready(initPlayer);
