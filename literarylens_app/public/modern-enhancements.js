// Modern enhancements: animations, particles, theme toggle, etc.
// 1. Particles.js background
// 2. AOS scroll animations
// 3. Framer Motion/GSAP-like microinteractions (using GSAP CDN)
// 4. Dark/Light mode toggle

// --- Particles.js ---
particlesJS.load("particles-js", "particles.json", function () {
  console.log("Particles.js config loaded");
});

// --- AOS ---
AOS.init({
  duration: 1000,
  once: true,
});

// --- GSAP Microinteractions ---
document.querySelectorAll(".btn-animate").forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    gsap.to(btn, { scale: 1.08, duration: 0.2 });
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { scale: 1, duration: 0.2 });
  });
});

// Hide/show navbar on scroll
(function () {
  const navbar = document.getElementById("main-navbar");
  let lastScrollY = window.scrollY;
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScrollY && currentScroll > 80) {
          // Scroll down: hide navbar
          navbar.style.transform = "translateY(-120%)";
        } else {
          // Scroll up: show navbar
          navbar.style.transform = "translateY(0)";
        }
        lastScrollY = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll);
})();

// Fancy Loader Hide Logic (fix: remove from DOM after fade)
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const loader = document.getElementById("fancy-loader");
    if (loader) {
      loader.classList.add("hide");
      setTimeout(() => loader.remove(), 900); // Remove after fade
    }
  }, 1800); // Loader visible for 1.8s for effect
});

// --- Modern Scroll-based Visuals & Animations ---
(function () {
  // Parallax Hero Section
  const hero = document.querySelector(".hero-section");
  const heroBg = document.querySelector(".hero-background");
  if (hero && heroBg) {
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      heroBg.style.transform = `translateY(${scrollY * 0.25}px) scale(${
        1 + scrollY * 0.0005
      })`;
      hero.style.opacity = `${1 - Math.min(scrollY / 600, 0.25)}`;
    });
  }

  // Section Reveal with Scale/Opacity
  const revealSections = document.querySelectorAll("section, .page");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
        }
      });
    },
    { threshold: 0.15 }
  );
  revealSections.forEach((sec) => {
    sec.classList.add("will-animate");
    revealObserver.observe(sec);
  });

  // Fade/Slide-in for elements
  document.querySelectorAll(".fade-slide").forEach((el) => {
    el.classList.add("will-animate");
    revealObserver.observe(el);
  });

  // Skew/Rotate on scroll for cards
  const cards = document.querySelectorAll(".book-card, .testimonial-card");
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    cards.forEach((card, i) => {
      card.style.transform = `rotateZ(${
        Math.sin(scrollY / 200 + i) * 2
      }deg) skewY(${Math.cos(scrollY / 300 + i) * 1.5}deg)`;
    });
  });

  // Sticky/Animated Headings
  document.querySelectorAll("h2, h3").forEach((heading) => {
    heading.classList.add("sticky-heading");
  });
})();

// --- Add CSS for Animations (inject if not present) ---
(function () {
  if (!document.getElementById("modern-anim-css")) {
    const style = document.createElement("style");
    style.id = "modern-anim-css";
    style.innerHTML = `
      .will-animate { opacity: 0; transform: scale(0.96) translateY(40px); transition: all 0.8s cubic-bezier(.77,0,.18,1); }
      .reveal-in { opacity: 1 !important; transform: scale(1) translateY(0) !important; }
      .fade-slide { opacity: 0; transform: translateY(40px); transition: all 0.7s cubic-bezier(.77,0,.18,1); }
      .fade-slide.reveal-in { opacity: 1 !important; transform: translateY(0) !important; }
      .sticky-heading { position: -webkit-sticky; position: sticky; top: 2.5rem; z-index: 10; background: transparent; transition: color 0.4s; }
      .sticky-heading.reveal-in { color: #ec4899; }
    `;
    document.head.appendChild(style);
  }
})();

// --- Enhanced Creative Features Integration ---
(function () {
  // 1. Book Flip Effect: Show real details/reviews
  document.querySelectorAll(".book-card").forEach((card) => {
    if (!card.querySelector(".book-card-back")) {
      const details = card.querySelector(".book-card-details");
      const back = document.createElement("div");
      back.className = "book-card-back";
      back.innerHTML = `<div class='font-bold text-lg mb-2'>Details</div><div class='text-sm text-gray-200'>${
        details ? details.innerHTML : "No details."
      }</div><div class='mt-4 text-xs text-gray-400'>Click to flip back</div>`;
      card.appendChild(back);
      card.addEventListener("click", function (e) {
        if (!card.classList.contains("flip")) {
          card.classList.add("flip");
        } else {
          card.classList.remove("flip");
        }
      });
    }
  });

  // 2. Dynamic Book Shelf: Add subtle floating animation
  const shelf = document.getElementById("top-books-container");
  if (shelf) {
    shelf.classList.add("shelf");
    let t = 0;
    function animateShelf() {
      t += 0.02;
      shelf.querySelectorAll(".book-card").forEach((card, i) => {
        card.style.transform = `translateY(${Math.sin(t + i) * 8}px)`;
      });
      requestAnimationFrame(animateShelf);
    }
    animateShelf();
  }

  // 3. Recommendations Carousel: Scrollable, real suggestions
  const carousel = document.getElementById("recommend-carousel");
  if (carousel) {
    carousel.innerHTML =
      '<div class="font-bold text-xl text-white">Recommended for you:</div>';
    // Demo: recommend books not yet rated by user
    const cards = Array.from(document.querySelectorAll(".book-card"));
    cards
      .slice(3, 6)
      .forEach((card) => carousel.appendChild(card.cloneNode(true)));
    carousel.style.overflowX = "auto";
    carousel.style.scrollSnapType = "x mandatory";
    Array.from(carousel.children).forEach((child) => {
      child.style.scrollSnapAlign = "start";
    });
  }

  // 4. Lottie Animation: Only on successful feedback
  const feedbackForm = document.getElementById("feedback-form");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (e) {
      setTimeout(() => {
        const lottie = document.getElementById("lottie-success");
        if (lottie) {
          lottie.style.display = "flex";
          setTimeout(() => (lottie.style.display = "none"), 2200);
        }
      }, 100);
    });
  }

  // 5. Animated SVG Divider: Animate on scroll
  const svgDivider = document.getElementById("svg-divider-1");
  if (svgDivider) {
    window.addEventListener("scroll", () => {
      const path = svgDivider.querySelector("path");
      if (window.scrollY > 200) {
        path.setAttribute(
          "d",
          "M0,32L60,52C120,72,240,112,360,120C480,128,600,104,720,80C840,56,960,32,1080,40C1200,48,1320,88,1380,104L1440,120L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
        );
      } else {
        path.setAttribute(
          "d",
          "M0,64L48,74.7C96,85,192,107,288,117.3C384,128,480,128,576,112C672,96,768,64,864,53.3C960,43,1056,53,1152,69.3C1248,85,1344,107,1392,117.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        );
      }
    });
  }

  // 6. Live Search: Smooth open/close, keyboard nav
  const fab = document.getElementById("fab");
  const liveSearch = document.getElementById("live-search-container");
  if (fab && liveSearch) {
    fab.onclick = function () {
      liveSearch.style.display =
        liveSearch.style.display === "none" ? "block" : "none";
      document.getElementById("live-search").focus();
    };
    const input = document.getElementById("live-search");
    const suggestions = document.getElementById("search-suggestions");
    input.addEventListener("input", function () {
      const val = this.value.toLowerCase();
      suggestions.innerHTML = "";
      if (!val) return (suggestions.style.display = "none");
      const books = Array.from(document.querySelectorAll(".book-card"));
      books.forEach((card) => {
        const title = card.querySelector("h3").textContent;
        if (title.toLowerCase().includes(val)) {
          const li = document.createElement("li");
          li.textContent = title;
          li.tabIndex = 0;
          li.onclick = () => {
            card.scrollIntoView({ behavior: "smooth" });
            suggestions.style.display = "none";
          };
          li.onkeydown = (e) => {
            if (e.key === "Enter") li.onclick();
          };
          suggestions.appendChild(li);
        }
      });
      suggestions.style.display = suggestions.children.length
        ? "block"
        : "none";
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") liveSearch.style.display = "none";
    });
  }

  // 7. User Avatar: Show only if logged in
  const userAvatar = document.getElementById("user-avatar-status");
  if (userAvatar) {
    // Simulate login state: show if user is logged in
    const isLoggedIn = document.body.classList.contains("user-logged-in");
    userAvatar.style.display = isLoggedIn ? "flex" : "none";
  }

  // 8. Progress Circles: Animate on load
  document.querySelectorAll(".progress-circle .progress-bar").forEach((bar) => {
    bar.classList.add("animated");
  });

  // 9. Easter Egg: Confetti option
  const eggBtn = document.getElementById("easter-egg-trigger");
  if (eggBtn) {
    eggBtn.title = "Click for a surprise!";
    eggBtn.addEventListener("dblclick", () => {
      if (!document.getElementById("egg-confetti")) {
        const confetti = document.createElement("div");
        confetti.id = "egg-confetti";
        confetti.style.position = "fixed";
        confetti.style.top = 0;
        confetti.style.left = 0;
        confetti.style.width = "100vw";
        confetti.style.height = "100vh";
        confetti.style.pointerEvents = "none";
        confetti.style.zIndex = 99999;
        document.body.appendChild(confetti);
        for (let i = 0; i < 120; i++) {
          const dot = document.createElement("div");
          dot.style.position = "absolute";
          dot.style.width = dot.style.height = 6 + Math.random() * 8 + "px";
          dot.style.borderRadius = "50%";
          dot.style.background = `hsl(${Math.random() * 360},90%,60%)`;
          dot.style.left = Math.random() * 100 + "vw";
          dot.style.top = "-20px";
          dot.style.opacity = 0.8;
          dot.style.transition = "top 1.8s cubic-bezier(.77,0,.18,1)";
          confetti.appendChild(dot);
          setTimeout(() => {
            dot.style.top = 80 + Math.random() * 20 + "vh";
          }, 10);
        }
        setTimeout(() => confetti.remove(), 2200);
      }
    });
  }
})();

// --- SPAFAX-INSPIRED & PREMIUM UI/UX ENHANCEMENTS ---
(function () {
  // 1. Animated Section Transitions (fade/slide/scale)
  document.querySelectorAll("section, .page").forEach((el) => {
    el.classList.add("will-animate");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) el.classList.add("reveal-in");
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
  });

  // 2. Scroll-Triggered Text & Image Reveals (staggered)
  document.querySelectorAll(".stagger-reveal").forEach((container) => {
    const children = Array.from(container.children);
    children.forEach((child, i) => {
      child.style.opacity = 0;
      child.style.transform = "translateY(40px)";
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                child.style.transition = "all 0.7s cubic-bezier(.77,0,.18,1)";
                child.style.opacity = 1;
                child.style.transform = "none";
              }, i * 120);
            }
          });
        },
        { threshold: 0.2 }
      );
      obs.observe(child);
    });
  });

  // 3. Interactive Parallax Layers
  document.querySelectorAll(".parallax-bg").forEach((bg) => {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      bg.style.transform = `translateY(${y * 0.18}px)`;
    });
  });

  // 4. Floating/Animated Decorative Elements
  if (!document.getElementById("floating-blobs")) {
    const blob = document.createElement("div");
    blob.id = "floating-blobs";
    blob.style.position = "fixed";
    blob.style.top = "10vh";
    blob.style.left = "10vw";
    blob.style.width = "180px";
    blob.style.height = "180px";
    blob.style.background =
      "radial-gradient(circle,#6366f1 0%,#ec4899 80%,transparent 100%)";
    blob.style.borderRadius = "50%";
    blob.style.opacity = "0.18";
    blob.style.zIndex = "0";
    blob.style.pointerEvents = "none";
    document.body.appendChild(blob);
    let t = 0;
    function animateBlob() {
      t += 0.01;
      blob.style.transform = `translateY(${Math.sin(t) * 24}px) scale(${
        1 + Math.sin(t / 2) * 0.08
      })`;
      requestAnimationFrame(animateBlob);
    }
    animateBlob();
  }

  // 5. Microinteractions on Buttons & Cards
  document
    .querySelectorAll("button, .book-card, .testimonial-card")
    .forEach((el) => {
      el.addEventListener("mouseenter", () => {
        el.style.transition = "box-shadow 0.3s, transform 0.2s";
        el.style.boxShadow = "0 8px 32px 0 #6366f1cc";
        el.style.transform = "scale(1.04)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.boxShadow = "";
        el.style.transform = "";
      });
    });

  // 6. Dynamic Headline Animations (typewriter)
  document.querySelectorAll(".headline-animate").forEach((el) => {
    if (!el.dataset.animated) {
      const text = el.textContent;
      el.textContent = "";
      let i = 0;
      function type() {
        if (i < text.length) {
          el.textContent += text[i];
          i++;
          setTimeout(type, 38);
        }
      }
      type();
      el.dataset.animated = "true";
    }
  });

  // 7. Smooth Anchor Navigation & Active Highlight
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        document
          .querySelectorAll(".main-nav a")
          .forEach((a) => a.classList.remove("active"));
        this.classList.add("active");
      }
    });
  });

  // 8. Content Slider/Carousel (testimonials)
  const testimonials = document.getElementById("testimonials-container");
  if (testimonials && !testimonials.classList.contains("slider-ready")) {
    testimonials.classList.add("slider-ready");
    let idx = 0;
    const slides = Array.from(testimonials.children);
    slides.forEach((slide, i) => {
      slide.style.display = i === 0 ? "block" : "none";
    });
    setInterval(() => {
      slides[idx].style.display = "none";
      idx = (idx + 1) % slides.length;
      slides[idx].style.display = "block";
    }, 4200);
  }

  // 9. Subtle Audio Feedback (with mute)
  if (!document.getElementById("audio-mute-btn")) {
    const btn = document.createElement("button");
    btn.id = "audio-mute-btn";
    btn.innerHTML = '<i class="fa fa-volume-up"></i>';
    btn.style.position = "fixed";
    btn.style.bottom = "2rem";
    btn.style.left = "2rem";
    btn.style.zIndex = 99999;
    btn.style.background = "rgba(36,37,42,0.7)";
    btn.style.border = "none";
    btn.style.borderRadius = "50%";
    btn.style.width = "48px";
    btn.style.height = "48px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.color = "#fff";
    btn.style.boxShadow = "0 2px 8px #23263a";
    document.body.appendChild(btn);
    let muted = false;
    btn.onclick = () => {
      muted = !muted;
      btn.innerHTML = `<i class="fa fa-volume-${muted ? "mute" : "up"}"></i>`;
    };
    window.playUiSound = function (url) {
      if (!muted) {
        const audio = new Audio(url);
        audio.volume = 0.12;
        audio.play();
      }
    };
  }
  // Example: playUiSound('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');

  // 10. Custom Cursor/Pointer Effects
  if (!document.getElementById("custom-cursor")) {
    const cursor = document.createElement("div");
    cursor.id = "custom-cursor";
    cursor.style.position = "fixed";
    cursor.style.width = "28px";
    cursor.style.height = "28px";
    cursor.style.borderRadius = "50%";
    cursor.style.background = "rgba(99,102,241,0.18)";
    cursor.style.border = "2px solid #ec4899";
    cursor.style.pointerEvents = "none";
    cursor.style.zIndex = 99999;
    cursor.style.transition =
      "transform 0.18s cubic-bezier(.77,0,.18,1), background 0.18s";
    document.body.appendChild(cursor);
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX - 14 + "px";
      cursor.style.top = e.clientY - 14 + "px";
    });
    document.querySelectorAll("button, a, .book-card").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.style.transform = "scale(1.5)";
        cursor.style.background = "#ec4899";
      });
      el.addEventListener("mouseleave", () => {
        cursor.style.transform = "";
        cursor.style.background = "rgba(99,102,241,0.18)";
      });
    });
  }

  // 11. Dynamic Color Themes (REMOVED THEME PICKER UI)
  const picker = document.getElementById("theme-picker");
  if (picker) picker.remove();

  // 12. Animated Loading Progress Bar (top)
  if (!document.getElementById("top-progress-bar")) {
    const bar = document.createElement("div");
    bar.id = "top-progress-bar";
    bar.style.position = "fixed";
    bar.style.top = 0;
    bar.style.left = 0;
    bar.style.height = "4px";
    bar.style.width = "0%";
    bar.style.background = "linear-gradient(90deg,#6366f1,#ec4899)";
    bar.style.zIndex = 99999;
    bar.style.transition = "width 0.3s cubic-bezier(.77,0,.18,1)";
    document.body.appendChild(bar);
    window.addEventListener("scroll", () => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      bar.style.width = percent + "%";
    });
  }

  // 13. On-Scroll Number Counters
  document.querySelectorAll(".count-up").forEach((el) => {
    if (!el.dataset.animated) {
      const target = parseInt(el.textContent, 10);
      el.textContent = "0";
      let current = 0;
      function count() {
        if (current < target) {
          current += Math.ceil(target / 40);
          el.textContent = Math.min(current, target);
          setTimeout(count, 32);
        }
      }
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) count();
          });
        },
        { threshold: 0.2 }
      );
      obs.observe(el);
      el.dataset.animated = "true";
    }
  });

  // 14. Video Backgrounds or Hero Animations
  if (!document.getElementById("hero-video-bg")) {
    const hero = document.querySelector(".hero-section");
    if (hero) {
      const video = document.createElement("video");
      video.id = "hero-video-bg";
      video.src = "https://www.w3schools.com/howto/rain.mp4";
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.style.position = "absolute";
      video.style.top = 0;
      video.style.left = 0;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      video.style.zIndex = "-1";
      video.style.opacity = "0.18";
      hero.appendChild(video);
    }
  }

  // 15. Accessibility Enhancements
  if (!document.getElementById("skip-link")) {
    const skip = document.createElement("a");
    skip.id = "skip-link";
    skip.href = "#main-content";
    skip.textContent = "Skip to content";
    skip.style.position = "absolute";
    skip.style.top = "0";
    skip.style.left = "0";
    skip.style.background = "#6366f1";
    skip.style.color = "#fff";
    skip.style.padding = "8px 16px";
    skip.style.zIndex = 99999;
    skip.style.transform = "translateY(-100%)";
    skip.style.transition = "transform 0.3s";
    skip.onfocus = () => {
      skip.style.transform = "translateY(0)";
    };
    skip.onblur = () => {
      skip.style.transform = "translateY(-100%)";
    };
    document.body.prepend(skip);
  }
})();

// Remove ALL duplicate loader logic above this line
// --- Loader Fix: Ensure loader always removed and never stuck ---
(function() {
  let loaderRemoved = false;
  function removeLoader() {
    if (loaderRemoved) return;
    loaderRemoved = true;
    const loader = document.getElementById("fancy-loader");
    if (loader) {
      loader.classList.add("hide");
      setTimeout(() => loader.remove(), 900);
    }
    document.querySelectorAll("#fancy-loader").forEach((el, i) => {
      if (i > 0) el.remove();
    });
  }
  window.addEventListener("load", () => setTimeout(removeLoader, 1800));
})();
playUiSound("audio/acoustic-chill.mp3");

// --- Play audio on every page refresh/load (with mute/resume support) ---
window.addEventListener("DOMContentLoaded", function () {
  if (typeof playUiSound === "function") {
    setTimeout(function () {
      playUiSound("audio/acoustic-chill.mp3"); // Change filename as needed
    }, 100);
  }
});

// --- Audio Mute/Resume Button with Resume Playback ---
(function () {
  let currentAudio = null;
  let isMuted = false;
  let lastAudioSrc = null;
  let lastAudioTime = 0;

  // Create or update audio mute button
  let btn = document.getElementById("audio-mute-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "audio-mute-btn";
    btn.innerHTML = '<i class="fa fa-volume-up"></i>';
    btn.style.position = "fixed";
    btn.style.bottom = "2rem";
    btn.style.left = "2rem";
    btn.style.zIndex = 99999;
    btn.style.background = "rgba(36,37,42,0.7)";
    btn.style.border = "none";
    btn.style.borderRadius = "50%";
    btn.style.width = "48px";
    btn.style.height = "48px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.color = "#fff";
    btn.style.boxShadow = "0 2px 8px #23263a";
    document.body.appendChild(btn);
  }

  // Enhanced playUiSound function
  window.playUiSound = function (url) {
    if (isMuted) return;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    currentAudio = new Audio(url);
    currentAudio.volume = 0.12;
    currentAudio.currentTime = 0;
    currentAudio.play();
    lastAudioSrc = url;
    lastAudioTime = 0;
    currentAudio.addEventListener("timeupdate", function () {
      lastAudioTime = currentAudio.currentTime;
    });
    currentAudio.addEventListener("ended", function () {
      currentAudio = null;
      lastAudioTime = 0;
    });
  };

  btn.onclick = function () {
    isMuted = !isMuted;
    if (isMuted) {
      btn.innerHTML = '<i class="fa fa-volume-mute"></i>';
      if (currentAudio) currentAudio.pause();
    } else {
      btn.innerHTML = '<i class="fa fa-volume-up"></i>';
      if (lastAudioSrc) {
        if (currentAudio) currentAudio.pause();
        currentAudio = new Audio(lastAudioSrc);
        currentAudio.volume = 0.12;
        currentAudio.currentTime = lastAudioTime;
        currentAudio.play();
        currentAudio.addEventListener("timeupdate", function () {
          lastAudioTime = currentAudio.currentTime;
        });
        currentAudio.addEventListener("ended", function () {
          currentAudio = null;
          lastAudioTime = 0;
        });
      }
    }
  };
})();

// --- Play audio on first user interaction if autoplay is blocked ---
(function () {
  let audioPlayed = false;
  function tryPlayAudio() {
    if (!audioPlayed && typeof playUiSound === "function") {
      playUiSound("audio/acoustic-chill.mp3"); // Change filename as needed
      audioPlayed = true;
      window.removeEventListener("click", tryPlayAudio);
      window.removeEventListener("keydown", tryPlayAudio);
      window.removeEventListener("touchstart", tryPlayAudio);
    }
  }
  // Try to play on DOMContentLoaded (may be blocked)
  window.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      if (!audioPlayed && typeof playUiSound === "function") {
        playUiSound("audio/acoustic-chill.mp3");
      }
    }, 100);
  });
  // If blocked, play on first user interaction
  window.addEventListener("click", tryPlayAudio);
  window.addEventListener("keydown", tryPlayAudio);
  window.addEventListener("touchstart", tryPlayAudio);
})();

// --- Lens Search Overlay Logic ---
(function () {
  const lensBtn = document.getElementById("lens-search-btn");
  const overlay = document.getElementById("lens-search-overlay");
  const box = document.getElementById("lens-search-box");
  const input = document.getElementById("lens-search-input");
  const closeBtn = document.getElementById("lens-search-close");
  const results = document.getElementById("lens-search-results");
  if (!lensBtn || !overlay || !box || !input || !closeBtn || !results) return;

  // Show overlay with animation
  function showOverlay() {
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
    setTimeout(() => {
      box.style.opacity = "1";
      box.style.transform = "scale(1)";
      input.focus();
    }, 40);
  }
  // Hide overlay with animation
  function hideOverlay() {
    box.style.opacity = "0";
    box.style.transform = "scale(0.9)";
    setTimeout(() => {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      input.value = "";
      results.innerHTML = "";
    }, 300);
  }
  lensBtn.addEventListener("click", showOverlay);
  closeBtn.addEventListener("click", hideOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideOverlay();
  });
  document.addEventListener("keydown", (e) => {
    if (overlay.style.opacity === "1" && e.key === "Escape") hideOverlay();
  });

  // Live search logic
  input.addEventListener("input", function () {
    const val = this.value.trim().toLowerCase();
    results.innerHTML = "";
    if (!val) return;
    // Gather all book titles (assume .book-card h3 or from JS data)
    let bookTitles = Array.from(document.querySelectorAll(".book-card h3"));
    if (bookTitles.length === 0 && window.books) {
      bookTitles = window.books.map((b) => ({
        textContent: b.title,
        dataset: { bookId: b.id },
      }));
    }
    let found = [];
    bookTitles.forEach((el) => {
      const title = el.textContent || el;
      if (title.toLowerCase().includes(val)) {
        found.push({
          title,
          bookId: el.dataset ? el.dataset.bookId : undefined,
        });
      }
    });
    if (found.length === 0) {
      results.innerHTML =
        '<li class="text-gray-400 text-center">No books found.</li>';
      return;
    }
    found.forEach(({ title, bookId }, idx) => {
      const li = document.createElement("li");
      li.textContent = title;
      li.tabIndex = 0;
      li.className =
        "py-2 px-4 rounded-lg cursor-pointer hover:bg-primary-color hover:text-white transition";
      li.addEventListener("click", () => {
        hideOverlay();
        if (bookId) {
          // Navigate to book detail if available
          if (typeof navigateTo === "function") navigateTo("detail", bookId);
        }
      });
      results.appendChild(li);
    });
  });
  // Keyboard navigation
  input.addEventListener("keydown", function (e) {
    const items = Array.from(results.querySelectorAll("li"));
    if (!items.length) return;
    let idx = items.findIndex((li) => li === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (idx < items.length - 1) items[idx + 1].focus();
      else items[0].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx > 0) items[idx - 1].focus();
      else items[items.length - 1].focus();
    } else if (e.key === "Enter" && idx >= 0) {
      items[idx].click();
    }
  });
})();
