/**
 * Uttaranchal University - Core Frontend Logic
 * Vanilla JavaScript (No heavy frameworks)
 */

(function () {
  'use strict';

  // DOM Loaded Event
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initSmoothScroll();
    initFormValidation();
    initCountryCodePicker();
    initRecruiterControls();
    initCountUpAnimation();
    initCardTouchFeedback();
    initProgramsExplorer();
    init3DCurvedArcCarousel();
    initTestimonialsCarousel();
    initStoryNumbersCountUp();
    initScholarshipSlider();
  });

  /**
   * Header Scroll State (adds background shadow and compact state when scrolled)
   */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /**
   * Smooth Scroll for in-page anchors
   */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href^="#"]:not([href="#"])');
      if (!link) return;
      const targetId = link.getAttribute('href');
      let targetElement = document.querySelector(targetId);

      // Fallback if target is hero lead form variants
      if (!targetElement && (targetId === '#heroLeadForm' || targetId === '#admissionsHeroForm')) {
        targetElement = document.getElementById('heroLeadForm') || document.getElementById('admissionsHeroForm') || document.querySelector('.hero-form-card');
      }

      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Subtly focus first input if scrolling to hero form
        if (targetId === '#heroLeadForm' || targetId === '#admissionsHeroForm') {
          const firstInput = targetElement.querySelector('input');
          if (firstInput) {
            setTimeout(() => firstInput.focus({ preventScroll: true }), 450);
          }
        }
      }
    });
  }

  /**
   * Lightweight accessible form validation helper
   */
  function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }

  /**
   * Country dial code selector for admission forms
   */
  function initCountryCodePicker() {
    const dropdownItems = document.querySelectorAll('.input-group-uu .dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const text = this.textContent.trim();
        const parts = text.split(' ');
        const flag = parts[0];
        const dialCode = parts[parts.length - 1].replace('(', '').replace(')', '');
        
        const btn = this.closest('.input-group-uu').querySelector('.btn-country-code');
        if (btn) {
          const spans = btn.querySelectorAll('span');
          if (spans.length >= 2) {
            spans[0].textContent = flag;
            spans[1].textContent = dialCode;
          }
        }

        // Active state
        this.closest('ul').querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  /**
   * Recruiter Marquee manual scroll arrows (< and >)
   */
  function initRecruiterControls() {
    const prevBtn = document.getElementById('recruiterPrevBtn');
    const nextBtn = document.getElementById('recruiterNextBtn');
    const marquee = document.getElementById('recruitersMarquee');
    const track = document.getElementById('recruitersTrack');
    if (!prevBtn || !nextBtn || !marquee || !track) return;

    let resumeTimer;
    const pauseAndScroll = (direction) => {
      track.style.animationPlayState = 'paused';
      const scrollStep = 352;
      marquee.scrollBy({ left: direction * scrollStep, behavior: 'smooth' });

      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        track.style.animationPlayState = 'running';
      }, 3500);
    };

    nextBtn.addEventListener('click', () => pauseAndScroll(1));
    prevBtn.addEventListener('click', () => pauseAndScroll(-1));
  }

  /**
   * Countable number animation effect (IntersectionObserver)
   * Applies to both USP metric and Programs statistics
   */
  function initCountUpAnimation() {
    const counters = document.querySelectorAll('.usp-counter-number[data-target], .counter-number[data-target]');
    if (!counters.length) return;

    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }

      const duration = 1800; // 1.8 seconds duration
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic curve for natural feel
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeOut * target);

        el.textContent = currentCount;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(updateCounter);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    counters.forEach(counter => observer.observe(counter));
  }

  /**
   * Card Touch / Pop-up interaction for Mobile & Touch screens
   */
  function initCardTouchFeedback() {
    const cards = document.querySelectorAll('.usp-card');
    cards.forEach(card => {
      // Touch start: immediate pop-up
      card.addEventListener('touchstart', () => {
        card.classList.add('touch-active');
      }, { passive: true });

      // Touch end / cancel: smooth reset after slight delay
      card.addEventListener('touchend', () => {
        setTimeout(() => card.classList.remove('touch-active'), 350);
      }, { passive: true });

      card.addEventListener('touchcancel', () => {
        card.classList.remove('touch-active');
      }, { passive: true });
    });
  }

  /**
   * Programs Section: Interactive School Switcher, Level Filters & Live Search
   */
  function initProgramsExplorer() {
    const schoolsData = {
      'law': {
        name: 'Law College Dehradun',
        programs: [
          { name: 'B.A. LL.B. (Hons.) – Five Years Integrated Degree Program', duration: '5 Years', level: 'ug' },
          { name: 'BBA LL.B. (Hons.) – Five Years Integrated Degree Program', duration: '5 Years', level: 'ug' },
          { name: 'LL.B. (Hons.) – Three Years Degree Program', duration: '3 Years', level: 'ug' },
          { name: 'LL.M. – One Year Post Graduate Degree Program', duration: '1 Year', level: 'pg' }
        ]
      },
      'sals': {
        name: 'School of Applied & Life Sciences',
        programs: [
          { name: 'B.Sc. (Hons.) Biotechnology', duration: '3 Years', level: 'ug' },
          { name: 'B.Sc. (Hons.) Microbiology', duration: '3 Years', level: 'ug' },
          { name: 'B.Sc. (Hons.) Food Technology', duration: '3 Years', level: 'ug' },
          { name: 'M.Sc. Biotechnology / Chemistry / Physics', duration: '2 Years', level: 'pg' }
        ]
      },
      'uit': {
        name: 'Uttaranchal Institute of Technology',
        programs: [
          { name: 'B.Tech. Computer Science & Engineering (CSE)', duration: '4 Years', level: 'ug' },
          { name: 'B.Tech. CSE (AI & Machine Learning)', duration: '4 Years', level: 'ug' },
          { name: 'B.Tech. CSE (Data Science & Cyber Security)', duration: '4 Years', level: 'ug' },
          { name: 'B.Tech. Civil / Mechanical Engineering', duration: '4 Years', level: 'ug' },
          { name: 'M.Tech. Computer Science & Engineering', duration: '2 Years', level: 'pg' }
        ]
      },
      'uim': {
        name: 'Uttaranchal Institute of Management',
        programs: [
          { name: 'MBA (Dual Specialization – Marketing, Finance, HR)', duration: '2 Years', level: 'pg' },
          { name: 'BBA (Bachelor of Business Administration)', duration: '3 Years', level: 'ug' },
          { name: 'B.Com. (Hons.) Professional Accounting', duration: '3 Years', level: 'ug' },
          { name: 'Executive MBA for Working Professionals', duration: '2 Years', level: 'pg' }
        ]
      },
      'uips': {
        name: 'Uttaranchal Institute of Pharmaceutical Sciences',
        programs: [
          { name: 'B.Pharm. (Bachelor of Pharmacy)', duration: '4 Years', level: 'ug' },
          { name: 'D.Pharm. (Diploma in Pharmacy)', duration: '2 Years', level: 'diploma' },
          { name: 'M.Pharm. (Pharmaceutics / Pharmacology)', duration: '2 Years', level: 'pg' }
        ]
      },
      'agriculture': {
        name: 'School of Agriculture',
        programs: [
          { name: 'B.Sc. (Hons.) Agriculture (ICAR Aligned)', duration: '4 Years', level: 'ug' },
          { name: 'M.Sc. Agronomy / Horticulture', duration: '2 Years', level: 'pg' },
          { name: 'M.Sc. Plant Pathology', duration: '2 Years', level: 'pg' }
        ]
      },
      'liberal-arts': {
        name: 'School of Liberal Arts',
        programs: [
          { name: 'B.A. (Hons.) Psychology / Economics', duration: '3 Years', level: 'ug' },
          { name: 'B.A. (Hons.) Journalism & Mass Communication', duration: '3 Years', level: 'ug' },
          { name: 'M.A. English / Clinical Psychology', duration: '2 Years', level: 'pg' }
        ]
      },
      'nursing': {
        name: 'Uttaranchal College of Nursing',
        programs: [
          { name: 'B.Sc. Nursing (Approved by INC & State Council)', duration: '4 Years', level: 'ug' },
          { name: 'Post Basic B.Sc. Nursing', duration: '2 Years', level: 'ug' },
          { name: 'General Nursing and Midwifery (GNM)', duration: '3 Years', level: 'diploma' }
        ]
      },
      'health-sciences': {
        name: 'Uttaranchal College of Health Sciences',
        programs: [
          { name: 'Bachelor of Physiotherapy (BPT)', duration: '4.5 Years', level: 'ug' },
          { name: 'B.Sc. Medical Laboratory Technology (BMLT)', duration: '3 Years', level: 'ug' },
          { name: 'B.Sc. Medical Radio Imaging Technology (BMRIT)', duration: '3 Years', level: 'ug' }
        ]
      },
      'computing': {
        name: 'Uttaranchal School of Computing Sciences',
        programs: [
          { name: 'BCA (Bachelor of Computer Applications)', duration: '3 Years', level: 'ug' },
          { name: 'BCA (Cyber Security & Cloud Computing)', duration: '3 Years', level: 'ug' },
          { name: 'MCA (Master of Computer Applications)', duration: '2 Years', level: 'pg' },
          { name: 'B.Sc. Information Technology (IT)', duration: '3 Years', level: 'ug' }
        ]
      },
      'hotel-management': {
        name: 'Uttaranchal School of Hotel & Hospitality Management',
        programs: [
          { name: 'BHM (Bachelor of Hotel Management)', duration: '4 Years', level: 'ug' },
          { name: 'B.Sc. Hotel Administration & Culinary Arts', duration: '3 Years', level: 'ug' },
          { name: 'Diploma in Food Production & Bakery', duration: '1 Year', level: 'diploma' },
          { name: 'Certificate in Front Office & Housekeeping', duration: '6 Months', level: 'certificate' }
        ]
      }
    };

    let activeSchoolKey = 'law';
    let activeLevel = 'all';

    const schoolBtns = document.querySelectorAll('.school-nav-btn');
    const headerTitleEl = document.getElementById('activeSchoolTitle');
    const listBodyEl = document.getElementById('programsListBody');
    const filterBtns = document.querySelectorAll('.program-filter-btn');

    if (!headerTitleEl || !listBodyEl) return;

    function renderPrograms() {
      const school = schoolsData[activeSchoolKey] || schoolsData['law'];
      headerTitleEl.textContent = school.name;

      let filtered = school.programs.filter(p => {
        return (activeLevel === 'all') || (p.level === activeLevel);
      });

      if (filtered.length === 0) {
        listBodyEl.innerHTML = `
          <div class="p-4 text-center text-muted">
            <i class="bi bi-info-circle fs-3 d-block mb-2 text-muted"></i>
            <p class="mb-0 fw-semibold text-uu-navy">No programs found for the selected category.</p>
            <small class="text-muted">Please select another degree level tab.</small>
          </div>
        `;
        return;
      }

      listBodyEl.innerHTML = filtered.map(prog => `
        <a href="#heroLeadForm" class="program-item-row" title="Apply for ${prog.name}">
          <h4 class="program-name">${prog.name}</h4>
          <div class="program-meta">
            <span class="program-duration-badge">${prog.duration}</span>
            <i class="bi bi-chevron-right program-arrow-icon" aria-hidden="true"></i>
          </div>
        </a>
      `).join('');
    }

    // School selection click
    schoolBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        schoolBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeSchoolKey = this.getAttribute('data-school');
        renderPrograms();
      });
    });

    // Level Filter selection
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeLevel = this.getAttribute('data-level');
        renderPrograms();
      });
    });

    // Initial render
    renderPrograms();
  }


  /**
   * 3D Coverflow Carousel (Campus Life Gallery)
   * Physics-based 3D perspective rotation, circular wrapping, drag/swipe & keyboard control
   */
  function init3DCurvedArcCarousel() {
    const stage = document.getElementById('curvedArcStage');
    const viewport = document.getElementById('curvedArcViewport');
    const track = document.getElementById('curvedArcTrack');
    const prevBtn = document.getElementById('curvedArcPrevBtn');
    const nextBtn = document.getElementById('curvedArcNextBtn');
    const paginationEl = document.getElementById('curvedArcPagination');
    const section = document.getElementById('gallerySection');

    if (!stage || !viewport || !track) return;

    const cards = Array.from(track.querySelectorAll('.curved-arc-card'));
    const totalCards = cards.length;
    if (totalCards === 0) return;

    let currentProgress = 0;   // Continuous float progress for seamless interpolation
    let targetProgress = 0;    // Target step integer
    let isAnimating = false;
    let animId = null;

    let autoplayTimer = null;
    let isPaused = false;
    let isInView = true;
    let isWindowScrolling = false;
    let scrollTimeout = null;

    // Responsive configuration with uniform non-overlapping arc geometry
    function getConfig() {
      const w = window.innerWidth;
      if (w >= 1200) {
        return {
          xMap: [0, 235, 450, 630, 760, 870],
          zMap: [0, 18, 50, 95, 150, 210],
          rotMap: [0, 16, 30, 44, 58, 70],
          maxVisible: 3.2,
          dragScale: 210
        };
      } else if (w >= 992) {
        return {
          xMap: [0, 210, 405, 570, 690, 790],
          zMap: [0, 16, 45, 85, 135, 190],
          rotMap: [0, 16, 30, 44, 58, 70],
          maxVisible: 3.1,
          dragScale: 190
        };
      } else if (w >= 768) {
        return {
          xMap: [0, 185, 355, 500, 610, 700],
          zMap: [0, 14, 40, 75, 120, 170],
          rotMap: [0, 16, 30, 44, 58, 70],
          maxVisible: 2.8,
          dragScale: 170
        };
      } else {
        return {
          xMap: [0, 160, 305, 430, 520, 600],
          zMap: [0, 12, 35, 65, 100, 140],
          rotMap: [0, 18, 32, 46, 60, 72],
          maxVisible: 2.3,
          dragScale: 150
        };
      }
    }

    let config = getConfig();

    // Create pagination dots
    let dots = [];
    if (paginationEl) {
      paginationEl.innerHTML = '';
      for (let i = 0; i < totalCards; i++) {
        const dot = document.createElement('button');
        dot.className = 'curved-arc-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', () => {
          goToIndex(i);
          resetAutoplay();
        });
        paginationEl.appendChild(dot);
        dots.push(dot);
      }
    }

    function updateDots(idx) {
      const normalizedIdx = ((Math.round(idx) % totalCards) + totalCards) % totalCards;
      dots.forEach((dot, i) => {
        if (i === normalizedIdx) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Mathematical 3D Curved Arc Projection with Uniform Spacing
    function renderArc(progress) {
      const { xMap, zMap, rotMap, maxVisible } = config;

      cards.forEach((card, i) => {
        // Continuous shortest-distance offset on the circle
        let offset = (i - progress) % totalCards;
        if (offset > totalCards / 2) offset -= totalCards;
        if (offset < -totalCards / 2) offset += totalCards;

        const absOff = Math.abs(offset);

        // Cull cards outside the visible panoramic arc
        if (absOff > maxVisible) {
          card.style.display = 'none';
          card.style.opacity = '0';
          card.style.pointerEvents = 'none';
          return;
        }

        card.style.display = 'block';

        const sign = offset < 0 ? -1 : 1;
        const base = Math.floor(absOff);
        const frac = absOff - base;
        const next = Math.min(base + 1, xMap.length - 1);

        // Fractional interpolation between precomputed uniform arc positions
        const x = (xMap[base] + (xMap[next] - xMap[base]) * frac) * sign;
        const z = zMap[base] + (zMap[next] - zMap[base]) * frac;
        const rotY = (rotMap[base] + (rotMap[next] - rotMap[base]) * frac) * -sign;

        // Smooth atmospheric opacity vignette at the periphery (reproducing reference image)
        let opacity = 1;
        if (absOff > 2.0) {
          opacity = Math.max(0, 1 - (absOff - 2.0) / 1.15);
        }

        const zIndex = Math.round(100 - absOff * 10);

        card.style.zIndex = zIndex;
        card.style.opacity = opacity.toFixed(2);
        card.style.pointerEvents = absOff > 2.4 ? 'none' : 'auto';
        card.style.transform = `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg)`;
      });
    }

    // Smooth Spring Loop using requestAnimationFrame
    function animateLoop() {
      if (!isAnimating) return;

      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) < 0.001) {
        currentProgress = targetProgress;
        renderArc(currentProgress);
        isAnimating = false;
        animId = null;
        updateDots(currentProgress);
        return;
      }

      // Smooth ease-out cubic spring interpolation
      currentProgress += diff * 0.14;
      renderArc(currentProgress);
      updateDots(currentProgress);
      animId = requestAnimationFrame(animateLoop);
    }

    function setTarget(newTarget) {
      targetProgress = newTarget;
      if (!isAnimating) {
        isAnimating = true;
        animId = requestAnimationFrame(animateLoop);
      }
    }

    function advanceStep(delta) {
      setTarget(Math.round(currentProgress) + delta);
    }

    function goToIndex(idx) {
      const currentActive = ((Math.round(currentProgress) % totalCards) + totalCards) % totalCards;
      let diff = ((idx - currentActive) % totalCards + totalCards + totalCards / 2) % totalCards - totalCards / 2;
      setTarget(Math.round(currentProgress) + diff);
    }

    // Prev / Next button listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        advanceStep(-1);
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        advanceStep(1);
        resetAutoplay();
      });
    }

    // Clicking any card rotates it directly to center via shortest path
    cards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        goToIndex(idx);
        resetAutoplay();
      });
    });

    // Pointer Dragging / Touch Swiping Interaction with 1:1 feel
    let isDragging = false;
    let startX = 0;
    let dragStartProgress = 0;
    let lastX = 0;
    let velocity = 0;

    viewport.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;

      isDragging = true;
      startX = e.clientX;
      lastX = e.clientX;
      dragStartProgress = currentProgress;
      velocity = 0;
      isPaused = true;

      if (isAnimating) {
        isAnimating = false;
        if (animId) cancelAnimationFrame(animId);
      }

      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastX;
      velocity = deltaX;
      lastX = e.clientX;

      const totalDelta = e.clientX - startX;
      currentProgress = dragStartProgress - totalDelta / config.dragScale;
      renderArc(currentProgress);
      updateDots(currentProgress);
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      isPaused = false;

      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (err) {}

      // Add gentle inertial fling
      const inertialProgress = currentProgress - (velocity / config.dragScale) * 3;
      setTarget(Math.round(inertialProgress));
      resetAutoplay();
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // Keyboard navigation (Left / Right arrow keys)
    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        advanceStep(-1);
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        advanceStep(1);
        resetAutoplay();
      }
    });

    // Interactive 3D Cursor Parallax
    let parallaxRAF = null;
    stage.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 992 || isDragging) return;

      const rect = stage.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      if (parallaxRAF) cancelAnimationFrame(parallaxRAF);
      parallaxRAF = requestAnimationFrame(() => {
        const tiltY = (normX * 7).toFixed(2);
        const tiltX = (-normY * 3.5).toFixed(2);
        track.style.transform = `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`;
      });
    });

    stage.addEventListener('mouseleave', () => {
      if (parallaxRAF) cancelAnimationFrame(parallaxRAF);
      track.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });

    // Pause on hover
    stage.addEventListener('mouseenter', () => { isPaused = true; });
    stage.addEventListener('mouseleave', () => { isPaused = false; });

    // Autoplay in Infinite Loop
    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        if (!isPaused && isInView && !isWindowScrolling && !isDragging) {
          advanceStep(1); // Endless forward loop
        }
      }, 4200);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function resetAutoplay() {
      startAutoplay();
    }

    // Scroll-aware performance
    window.addEventListener('scroll', () => {
      isWindowScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isWindowScrolling = false;
      }, 150);
    }, { passive: true });

    // IntersectionObserver: sleep when off-screen
    if ('IntersectionObserver' in window && section) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting;
          if (isInView) {
            startAutoplay();
          } else {
            stopAutoplay();
          }
        });
      }, { threshold: 0.15 });

      observer.observe(section);
    } else {
      startAutoplay();
    }

    // Responsive resize handler (debounced)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        config = getConfig();
        renderArc(currentProgress);
      }, 100);
    }, { passive: true });

    // Initial render
    renderArc(0);
  }

  function initTestimonialsCarousel() {
    const section = document.getElementById('testimonialsSection');
    const shell = document.getElementById('testimonialsShell');
    const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
    const dots = Array.from(document.querySelectorAll('.testimonial-indicator-dot'));
    if (!section || !shell || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoTimer = null;
    let isHovered = false;
    let isInView = false;
    let isTransitioning = false;

    function goToSlide(targetIndex, direction = 1) {
      if (isTransitioning || targetIndex === currentIndex) return;
      isTransitioning = true;

      const nextIndex = (targetIndex + totalSlides) % totalSlides;
      const prevSlide = slides[currentIndex];
      const nextSlide = slides[nextIndex];

      prevSlide.classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

      nextSlide.classList.add('active');
      if (dots[nextIndex]) dots[nextIndex].classList.add('active');

      reset3DTransforms(prevSlide);
      currentIndex = nextIndex;

      setTimeout(() => {
        isTransitioning = false;
      }, 500);
    }

    function startAutoChange() {
      stopAutoChange();
      autoTimer = setInterval(() => {
        if (!isHovered && isInView && !isTransitioning) {
          goToSlide(currentIndex + 1, 1);
        }
      }, 5000);
    }

    function stopAutoChange() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    // Prev / Next button handlers on every slide
    slides.forEach((slide) => {
      const prevBtn = slide.querySelector('.testimonial-arrow-btn.prev-btn');
      const nextBtn = slide.querySelector('.testimonial-arrow-btn.next-btn');

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          goToSlide(currentIndex - 1, -1);
          startAutoChange();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          goToSlide(currentIndex + 1, 1);
          startAutoChange();
        });
      }
    });

    // Indicator Dot buttons
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startAutoChange();
      });
    });

    // Pause on Hover over carousel shell
    shell.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    shell.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoChange();
    });

    // Mobile Touch Swipe Handling
    let touchStartX = 0;
    let touchEndX = 0;
    shell.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isHovered = true;
    }, { passive: true });

    shell.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      isHovered = false;
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 45) {
        if (swipeDistance < 0) {
          goToSlide(currentIndex + 1, 1);
        } else {
          goToSlide(currentIndex - 1, -1);
        }
      }
      startAutoChange();
    }, { passive: true });

    // =======================================================================
    // 3D HOVER ANIMATION – FLOATING PEN IN SPACE WITH SUBTLE DEPTH EFFECT
    // =======================================================================
    function reset3DTransforms(slideElement) {
      if (!slideElement) return;
      const card = slideElement.querySelector('.testimonial-card-main');
      const visualBox = slideElement.querySelector('.testimonial-visual-box');
      const pen = slideElement.querySelector('.floating-pen-wrapper');
      const studentImgWrap = slideElement.querySelector('.testimonial-student-photo-wrap');

      if (card) card.style.transform = '';
      if (visualBox) visualBox.style.transform = '';
      if (pen) {
        pen.style.transform = '';
        pen.style.filter = '';
      }
      if (studentImgWrap) studentImgWrap.style.transform = '';
    }

    slides.forEach((slide) => {
      const card = slide.querySelector('.testimonial-card-main');
      const visualBox = slide.querySelector('.testimonial-visual-box');
      const pen = slide.querySelector('.floating-pen-wrapper');
      const studentImgWrap = slide.querySelector('.testimonial-student-photo-wrap');

      if (!card || !pen) return;

      let rAF = null;

      card.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 992) return;

        const rect = card.getBoundingClientRect();
        const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
        const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

        if (rAF) cancelAnimationFrame(rAF);

        rAF = requestAnimationFrame(() => {
          const tiltX = -yNorm * 7;
          const tiltY = xNorm * 8;
          card.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;

          if (visualBox) {
            visualBox.style.transform = `perspective(1000px) rotateX(${(tiltX * 1.2).toFixed(2)}deg) rotateY(${(tiltY * 1.2).toFixed(2)}deg)`;
          }

          if (studentImgWrap) {
            studentImgWrap.style.transform = `translate3d(${(-xNorm * 10).toFixed(1)}px, ${(-yNorm * 10).toFixed(1)}px, 15px)`;
          }

          const penX = (xNorm * 32).toFixed(1);
          const penY = (yNorm * 32).toFixed(1);
          const penZ = (75 + Math.abs(xNorm) * 20).toFixed(1);
          const penRot = (-10 + xNorm * 16).toFixed(1);
          pen.style.transform = `translate3d(${penX}px, ${penY}px, ${penZ}px) rotate(${penRot}deg)`;
          pen.style.filter = `drop-shadow(${(12 + xNorm * 16).toFixed(1)}px ${(22 + yNorm * 16).toFixed(1)}px 22px rgba(14, 36, 74, 0.42))`;
        });
      });

      card.addEventListener('mouseleave', () => {
        if (rAF) cancelAnimationFrame(rAF);
        reset3DTransforms(slide);
      });
    });

    if ('IntersectionObserver' in window && section) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting;
          if (isInView) {
            startAutoChange();
          } else {
            stopAutoChange();
          }
        });
      }, { threshold: 0.15 });

      observer.observe(section);
    } else {
      isInView = true;
      startAutoChange();
    }
  }


  // =========================================================================
  // 11. THE UU STORY IN NUMBERS: WORKING CHARTS & ANIMATED METRICS
  // =========================================================================
  function initStoryNumbersCountUp() {
    const section = document.getElementById('storyNumbersSection');
    if (!section) return;

    let hasAnimated = false;

    // Helper: smooth animated counter with ease-out cubic
    function animateValue(el, start, end, duration, prefix = '', suffix = '', decimals = 0, formatComma = false) {
      if (!el) return;
      const startTime = performance.now();
      const isNegative = end < 0;
      const absEnd = Math.abs(end);
      const absStart = Math.abs(start);

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = absStart + (absEnd - absStart) * ease;
        const currentFormatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current);
        const commaFormatted = formatComma ? Number(currentFormatted).toLocaleString('en-IN') : currentFormatted;

        el.textContent = `${isNegative ? '-' : prefix}${commaFormatted}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          const finalFormatted = decimals > 0 ? absEnd.toFixed(decimals) : absEnd;
          const finalComma = formatComma ? Number(finalFormatted).toLocaleString('en-IN') : finalFormatted;
          el.textContent = `${isNegative ? '-' : prefix}${finalComma}${suffix}`;
        }
      }
      requestAnimationFrame(step);
    }

    function triggerAllAnimations() {
      if (hasAnimated) return;
      hasAnimated = true;

      // 1. Line Path 1 (Cyan Line) & Area Fill
      const line1 = document.getElementById('graphLine1');
      const area1 = document.getElementById('graphArea1');
      if (line1) line1.classList.add('animated');
      if (area1) area1.classList.add('animated');

      // 2. Line Path 2 (Purple Line) & Area Fill
      const line2 = document.getElementById('graphLine2');
      const area2 = document.getElementById('graphArea2');
      if (line2) line2.classList.add('animated');
      if (area2) area2.classList.add('animated');

      // 3. Ring 3 (77% Donut Progress Arc)
      const ring3 = document.getElementById('ringCircle3');
      if (ring3) {
        // Circumference = 364.42, 77% filled -> offset = 364.42 * (1 - 0.77) = 83.82
        ring3.style.strokeDashoffset = '83.82';
      }
      const ringNum3 = document.getElementById('ringNumber3');
      animateValue(ringNum3, 0, 77, 1800, '', '%');

      // 4. Card 1 Side Metrics (+63, +520%)
      const card1Big = document.getElementById('card1BigMetric');
      const card1Sub = document.getElementById('card1SubMetric');
      animateValue(card1Big, 0, 63, 1600, '+', '');
      animateValue(card1Sub, 0, 520, 1700, '+', '%');

      // 5. Card 2 Side Metrics (-50, -62.50%)
      const card2Big = document.getElementById('card2BigMetric');
      const card2Sub = document.getElementById('card2SubMetric');
      animateValue(card2Big, 0, +90, 1600, '', '');
      animateValue(card2Sub, 0, +90.5, 1700, '', '%', 2);

      // 6. Top 9 Story Metrics across all 3 Cards
      const counterEls = section.querySelectorAll('.story-counter-num[data-count]');
      counterEls.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-count')) || 0;
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const formatComma = el.getAttribute('data-format') === 'comma' || target >= 1000;
        animateValue(el, 0, target, 1800, prefix, suffix, 0, formatComma);
      });
    }

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const line1 = document.getElementById('graphLine1');
      const area1 = document.getElementById('graphArea1');
      const line2 = document.getElementById('graphLine2');
      const area2 = document.getElementById('graphArea2');
      const ring3 = document.getElementById('ringCircle3');
      if (line1) line1.classList.add('animated');
      if (area1) area1.classList.add('animated');
      if (line2) line2.classList.add('animated');
      if (area2) area2.classList.add('animated');
      if (ring3) ring3.style.strokeDashoffset = '83.82';
      return;
    }

    // IntersectionObserver triggers animation when section scrolls into viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerAllAnimations();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      observer.observe(section);
    } else {
      triggerAllAnimations();
    }

    // Interactive Hover & Touch Tracking Crosshair for Line Charts
    function setupChartInteractivity(containerId, crosshairLineId, crosshairDotId, tooltipId, points, trendText) {
      const container = document.getElementById(containerId);
      const crosshairLine = document.getElementById(crosshairLineId);
      const crosshairDot = document.getElementById(crosshairDotId);
      const tooltip = document.getElementById(tooltipId);
      if (!container || !crosshairLine || !crosshairDot || !tooltip) return;

      function updateCrosshair(clientX) {
        const rect = container.getBoundingClientRect();
        const relX = clientX - rect.left;
        const normalizedX = Math.max(0, Math.min(rect.width, relX));
        const svgX = (normalizedX / rect.width) * 280;

        // Clamp inside line points range (36 to 268)
        const clampedSvgX = Math.max(points[0].x, Math.min(points[points.length - 1].x, svgX));

        // Interpolate along the curve segments
        let interpolatedY = points[0].y;
        let activePoint = points[0];

        for (let i = 0; i < points.length - 1; i++) {
          if (clampedSvgX >= points[i].x && clampedSvgX <= points[i + 1].x) {
            const span = points[i + 1].x - points[i].x;
            const ratio = span > 0 ? (clampedSvgX - points[i].x) / span : 0;
            interpolatedY = points[i].y + ratio * (points[i + 1].y - points[i].y);
            activePoint = ratio < 0.5 ? points[i] : points[i + 1];
            break;
          }
        }

        crosshairLine.style.display = 'block';
        crosshairLine.setAttribute('x1', clampedSvgX);
        crosshairLine.setAttribute('x2', clampedSvgX);

        crosshairDot.style.display = 'block';
        crosshairDot.setAttribute('cx', clampedSvgX);
        crosshairDot.setAttribute('cy', interpolatedY);

        tooltip.textContent = `${activePoint.month}: ${activePoint.val} (${trendText})`;
        tooltip.style.left = `${normalizedX}px`;
        tooltip.style.opacity = '1';
      }

      container.addEventListener('mousemove', (e) => updateCrosshair(e.clientX));
      container.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) updateCrosshair(e.touches[0].clientX);
      }, { passive: true });

      const hideCrosshair = () => {
        crosshairLine.style.display = 'none';
        crosshairDot.style.display = 'none';
        tooltip.style.opacity = '0';
      };

      container.addEventListener('mouseleave', hideCrosshair);
      container.addEventListener('touchend', hideCrosshair);
    }

    // Chart 1 (Cyan Line) points
    const points1 = [
      { x: 36, y: 112, month: 'Jan', val: 15 },
      { x: 70, y: 78, month: 'Feb', val: 45 },
      { x: 104, y: 90, month: 'Mar', val: 36 },
      { x: 138, y: 68, month: 'Apr', val: 52 },
      { x: 172, y: 82, month: 'May', val: 42 },
      { x: 206, y: 54, month: 'Jun', val: 64 },
      { x: 240, y: 74, month: 'Jul', val: 48 },
      { x: 268, y: 26, month: 'Aug', val: 88 }
    ];
    setupChartInteractivity('chartContainer1', 'crosshairLine1', 'crosshairDot1', 'graphTooltip1', points1, '+520%');

    // Chart 2 (Purple Line) points
    const points2 = [
      { x: 36, y: 25, month: 'Jan', val: 92 },
      { x: 70, y: 45, month: 'Feb', val: 74 },
      { x: 104, y: 74, month: 'Mar', val: 50 },
      { x: 138, y: 58, month: 'Apr', val: 64 },
      { x: 172, y: 78, month: 'May', val: 45 },
      { x: 206, y: 62, month: 'Jun', val: 60 },
      { x: 240, y: 48, month: 'Jul', val: 75 },
      { x: 268, y: 96, month: 'Aug', val: 34 }
    ];
    setupChartInteractivity('chartContainer2', 'crosshairLine2', 'crosshairDot2', 'graphTooltip2', points2, '-62.50%');
  }


  // =========================================================================
  // 12. SCHOLARSHIP CINEMATIC EXPANDING CARD SLIDER
  // =========================================================================
  function initScholarshipSlider() {
    const section = document.getElementById('scholarshipSection');
    const slider = document.getElementById('uuScholarshipSlider');
    const list = document.getElementById('uuScholarshipList');
    const prevBtn = document.getElementById('uuScholarshipPrev');
    const nextBtn = document.getElementById('uuScholarshipNext');
    const counterEl = document.getElementById('uuScholarshipCounter');
    const progressEl = document.getElementById('uuScholarshipProgress');

    if (!section || !slider || !list) return;

    let autoplayTimer = null;
    let isHovered = false;
    let isInView = false;
    let isTransitioning = false;
    const totalSlides = 3;

    function updateCounterAndProgress() {
      const activeItem = list.children[1];
      if (!activeItem) return;

      const slideIdx = parseInt(activeItem.getAttribute('data-index') || '0', 10);
      const displayNum = String(slideIdx + 1).padStart(2, '0');
      const totalNum = String(totalSlides).padStart(2, '0');

      if (counterEl) {
        counterEl.textContent = `${displayNum} / ${totalNum}`;
      }
      if (progressEl) {
        const pct = ((slideIdx + 1) / totalSlides) * 100;
        progressEl.style.width = `${pct}%`;
      }
    }

    function nextSlide() {
      if (isTransitioning) return;
      isTransitioning = true;

      const items = list.querySelectorAll('.uu-scholarship-item');
      if (items.length > 0) {
        list.appendChild(items[0]);
      }
      updateCounterAndProgress();

      setTimeout(() => {
        isTransitioning = false;
      }, 700);
    }

    function prevSlide() {
      if (isTransitioning) return;
      isTransitioning = true;

      const items = list.querySelectorAll('.uu-scholarship-item');
      if (items.length > 0) {
        list.prepend(items[items.length - 1]);
      }
      updateCounterAndProgress();

      setTimeout(() => {
        isTransitioning = false;
      }, 700);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
        resetAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
        resetAutoplay();
      });
    }

    list.addEventListener('click', (e) => {
      // If user clicks on the small showcase card on the right, advance to next slide
      const clickedCard = e.target.closest('.uu-scholarship-preview-card');
      if (clickedCard) {
        e.stopPropagation();
        nextSlide();
        resetAutoplay();
        return;
      }

      const clickedItem = e.target.closest('.uu-scholarship-item');
      if (!clickedItem) return;

      const items = Array.from(list.children);
      const clickedIdx = items.indexOf(clickedItem);

      if (clickedIdx === 2) {
        nextSlide();
        resetAutoplay();
      } else if (clickedIdx > 2) {
        nextSlide();
        setTimeout(nextSlide, 200);
        resetAutoplay();
      }
    });

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        if (!isHovered && isInView && !isTransitioning) {
          nextSlide();
        }
      }, 6500);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function resetAutoplay() {
      startAutoplay();
    }

    slider.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    slider.addEventListener('mouseleave', () => {
      isHovered = false;
      resetAutoplay();
    });

    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isHovered = true;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      isHovered = false;
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 45) {
        if (swipeDistance < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      resetAutoplay();
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (!isInView) return;
      if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoplay();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoplay();
      }
    });

    if ('IntersectionObserver' in window && section) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting;
          if (isInView) {
            startAutoplay();
          } else {
            stopAutoplay();
          }
        });
      }, { threshold: 0.15 });

      observer.observe(section);
    } else {
      isInView = true;
      startAutoplay();
    }

    // 3D Perspective Depth Tilt on Active Showcase Card (Desktop)
    if (window.matchMedia('(hover: hover) and (min-width: 992px)').matches) {
      list.addEventListener('mousemove', (e) => {
        const activeCard = list.querySelector('.uu-scholarship-item:nth-child(2) .uu-scholarship-preview-card');
        if (!activeCard) return;

        const rect = activeCard.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -8;
          const rotateY = ((x - centerX) / centerX) * 8;
          activeCard.style.transform = `translateY(calc(-50% - 10px)) perspective(750px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.025)`;
        } else if (activeCard.style.transform) {
          activeCard.style.transform = '';
        }
      });

      list.addEventListener('mouseleave', () => {
        const activeCard = list.querySelector('.uu-scholarship-item:nth-child(2) .uu-scholarship-preview-card');
        if (activeCard) {
          activeCard.style.transform = '';
        }
      });
    }

    updateCounterAndProgress();
  }

})();
