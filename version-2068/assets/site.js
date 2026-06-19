document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
    showSlide(0);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";

  function applyFilter() {
    if (!filterInput || !cards.length) {
      return;
    }
    var term = filterInput.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var text = (card.getAttribute("data-filter-text") || card.textContent || "").toLowerCase();
      card.classList.toggle("hidden-by-filter", term && text.indexOf(term) === -1);
    });
  }

  if (filterInput) {
    if (initial) {
      filterInput.value = initial;
    }
    filterInput.addEventListener("input", applyFilter);
    applyFilter();
  }
});

function startMoviePlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var prepared = false;
  var hlsInstance = null;

  if (!video || !button || !streamUrl) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    prepare();
    button.classList.add("is-hidden");
    var result = video.play();
    if (result && result.catch) {
      result.catch(function () {});
    }
  }

  button.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
