/* ============================================
   Studio Horizon Arquitetura — main.js
   ============================================ */

(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Loader ---------- */
  const loader = $("#pageLoader");
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader?.classList.add("is-done");
      document.body.classList.add("is-ready");
    }, 900);
  });

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header ---------- */
  const header = $("#siteHeader");
  const navToggle = $("#navToggle");
  const navMobile = $("#navMobile");

  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 48);
  };

  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  const closeMobileNav = () => {
    header?.classList.remove("menu-open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
  };

  navToggle?.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-locked", open);
  });

  $$("a", navMobile).forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  /* ---------- Smooth anchor focus ---------- */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMobileNav();
    });
  });

  /* ---------- Custom cursor ---------- */
  const cursor = $(".cursor");
  const follower = $(".cursor-follower");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (canHover && cursor && follower) {
    document.body.classList.add("has-cursor");
    let mx = 0;
    let my = 0;
    let fx = 0;
    let fy = 0;

    window.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.left = `${mx}px`;
        cursor.style.top = `${my}px`;
      },
      { passive: true }
    );

    const tickCursor = () => {
      fx += (mx - fx) * 0.18;
      fy += (my - fy) * 0.18;
      follower.style.left = `${fx}px`;
      follower.style.top = `${fy}px`;
      requestAnimationFrame(tickCursor);
    };
    tickCursor();

    const hoverables = "a, button, .folio-item, .filter-btn, .project-card, .blog-card, .diff-card, input, select, textarea, .ba-range";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverables)) follower.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverables)) follower.classList.remove("is-hover");
    });
  }

  /* ---------- AOS ---------- */
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }

  /* ---------- GSAP ---------- */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion) {
      /* Hero parallax / zoom */
      gsap.to(".hero-img", {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-content", {
        y: 80,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      /* Manifesto line grow */
      gsap.to(".manifesto-line", {
        scaleX: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".manifesto",
          start: "center 70%",
          toggleActions: "play none none reverse",
        },
      });

      /* Process progress line */
      const fill = $(".process-progress-fill");
      if (fill) {
        gsap.to(fill, {
          width: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: ".process-track",
            start: "top 70%",
            end: "bottom 50%",
            scrub: true,
          },
        });
      }

      /* CTA image subtle parallax */
      gsap.to(".cta-bg img", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: ".cta",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      /* Floating about badge */
      gsap.to(".about-float", {
        y: -12,
        duration: 2.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }
  }

  /* ---------- Animated counters ---------- */
  const animateCount = (el) => {
    if (el.dataset.counted === "true") return;
    el.dataset.counted = "true";
    const target = Number(el.dataset.count || 0);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = `${prefix}${value}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  $$(".stat-number[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- Portfolio filters + modal ---------- */
  const filterBtns = $$(".filter-btn");
  const folioItems = $$(".folio-item");
  const modal = $("#folioModal");
  const modalImg = $("#modalImg");
  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;

      folioItems.forEach((item) => {
        const cat = item.dataset.category;
        const show = filter === "all" || cat === filter;
        item.classList.toggle("is-hidden", !show);
      });

      if (typeof AOS !== "undefined") AOS.refresh();
    });
  });

  const openModal = (item) => {
    if (!modal) return;
    modalImg.src = item.dataset.full || item.querySelector("img")?.src || "";
    modalImg.alt = item.dataset.title || "";
    modalTitle.textContent = item.dataset.title || "";
    modalDesc.textContent = item.dataset.desc || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  };

  folioItems.forEach((item) => {
    item.addEventListener("click", () => openModal(item));
  });

  $$("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeMobileNav();
    }
  });

  /* ---------- Swiper testimonials ---------- */
  if (typeof Swiper !== "undefined") {
    new Swiper(".testimonials-swiper", {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      speed: 650,
      autoplay: {
        delay: 5200,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-btn-next",
        prevEl: ".swiper-btn-prev",
      },
      breakpoints: {
        720: { slidesPerView: 2 },
        1080: { slidesPerView: 3 },
      },
    });
  }

  /* ---------- Before / After slider ---------- */
  const baSlider = $("#baSlider");
  const baAfter = $("#baAfter");
  const baRange = $("#baRange");
  const baHandle = $("#baHandle");

  const setBaPosition = (value) => {
    const v = Number(value);
    if (baAfter) baAfter.style.clipPath = `inset(0 0 0 ${v}%)`;
    if (baHandle) baHandle.style.left = `${v}%`;
  };

  if (baRange) {
    setBaPosition(baRange.value);
    baRange.addEventListener("input", (e) => setBaPosition(e.target.value));
  }

  /* Pointer drag fallback on container */
  if (baSlider && baRange) {
    let dragging = false;

    const updateFromPointer = (clientX) => {
      const rect = baSlider.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const value = Math.round(ratio * 100);
      baRange.value = String(value);
      setBaPosition(value);
    };

    baSlider.addEventListener("pointerdown", (e) => {
      if (e.target === baRange) return;
      dragging = true;
      baSlider.setPointerCapture(e.pointerId);
      updateFromPointer(e.clientX);
    });

    baSlider.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      updateFromPointer(e.clientX);
    });

    baSlider.addEventListener("pointerup", () => {
      dragging = false;
    });
  }

  /* ---------- Ripple buttons ---------- */
  $$(".btn-ripple").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const circle = document.createElement("span");
      circle.className = "ripple";
      const diameter = Math.max(btn.clientWidth, btn.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const formNote = $("#formNote");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Enviando…";
    }

    setTimeout(() => {
      form.reset();
      if (formNote) {
        formNote.textContent = "Recebemos sua mensagem. Retornaremos em até dois dias úteis.";
        formNote.classList.add("is-success");
      }
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Enviar solicitação";
      }
    }, 900);
  });

  /* ---------- Mouse tracking glow on featured project ---------- */
  const featured = $(".project-featured-info");
  if (featured && canHover) {
    featured.addEventListener("mousemove", (e) => {
      const rect = featured.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      featured.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(250,249,247,0.92), rgba(250,249,247,0.7))`;
    });

    featured.addEventListener("mouseleave", () => {
      featured.style.background = "";
    });
  }
})();
