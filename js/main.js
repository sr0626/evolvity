/**
 * Evolvity Solutions – Main JavaScript
 * Handles: navigation, mobile menu, scroll reveal, typed text (no-jank),
 *          counter animation, form submission, active nav, terminal animation
 */

(function () {
  'use strict';

  /* -------------------------------------------------------
     1. Navigation scroll state
  ------------------------------------------------------- */
  const nav = document.getElementById('main-nav');

  function handleNavScroll() {
    if (!nav) return;
    if (window.scrollY > 24) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();


  /* -------------------------------------------------------
     Back to top button
  ------------------------------------------------------- */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* -------------------------------------------------------
     2. Mobile Menu Toggle
  ------------------------------------------------------- */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  function openMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const bars = hamburger.querySelectorAll('span');
    bars[0].style.transform = 'translateY(7px) rotate(45deg)';
    bars[1].style.opacity   = '0';
    bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }

  function closeMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    const bars = hamburger.querySelectorAll('span');
    bars[0].style.transform = '';
    bars[1].style.opacity   = '1';
    bars[2].style.transform = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
  }

  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });


  /* -------------------------------------------------------
     3. Scroll Reveal – IntersectionObserver (no layout shifts)
  ------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      // Removed negative rootMargin that was causing jumpiness
      { threshold: 0.10 }
    );
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }


  /* -------------------------------------------------------
     4. Animated Counters
  ------------------------------------------------------- */
  function animateCounter(el, target, duration, suffix) {
    const start = performance.now();
    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statEls = document.querySelectorAll('[data-counter]');
  if (statEls.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseInt(el.dataset.counter, 10);
            const suffix = el.dataset.suffix || '';
            animateCounter(el, target, 1600, suffix);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach(el => counterObserver.observe(el));
  }


  /* -------------------------------------------------------
     5. Typed Headline – no layout shift version
     Pre-measures the widest phrase and locks the container
     width so changing text NEVER causes scroll jumps.
  ------------------------------------------------------- */
  const typedTarget = document.getElementById('typed-text');
  if (typedTarget) {
    const phrases = [
      'AI-Powered Strategy',
      'Generative AI Solutions',
      'Intelligent Automation',
      'Cloud Modernization',
      'Digital Transformation',
    ];

    // ── Lock width to the longest phrase so layout never reflows ──
    const ruler = document.createElement('span');
    ruler.style.cssText = 'visibility:hidden; white-space:nowrap; position:absolute; pointer-events:none;';
    ruler.style.font = window.getComputedStyle(typedTarget).font;
    document.body.appendChild(ruler);

    let maxWidth = 0;
    phrases.forEach(p => {
      ruler.textContent = p;
      maxWidth = Math.max(maxWidth, ruler.offsetWidth);
    });
    document.body.removeChild(ruler);

    typedTarget.style.display     = 'inline-block';
    typedTarget.style.minWidth    = maxWidth + 'px';
    typedTarget.style.textAlign   = 'left';

    let phraseIndex = 0;
    let charIndex   = 0;
    let isDeleting  = false;
    let isPaused    = false;

    function typeLoop() {
      if (isPaused) return;
      const current = phrases[phraseIndex];
      if (isDeleting) {
        charIndex--;
        typedTarget.textContent = current.substring(0, charIndex);
        if (charIndex === 0) {
          isDeleting  = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeLoop, 380);
          return;
        }
        setTimeout(typeLoop, 40);
      } else {
        charIndex++;
        typedTarget.textContent = current.substring(0, charIndex);
        if (charIndex === current.length) {
          isPaused = true;
          setTimeout(() => { isPaused = false; isDeleting = true; typeLoop(); }, 2400);
          return;
        }
        setTimeout(typeLoop, 60);
      }
    }

    setTimeout(typeLoop, 800);
  }


  /* -------------------------------------------------------
     6. Smooth Scroll for anchor links
  ------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href   = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10
      ) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* -------------------------------------------------------
     7. Contact Form (static – simulated)
  ------------------------------------------------------- */
  const contactForm   = document.getElementById('contact-form');
  const formMessage   = document.getElementById('form-message');
  const formSubmitBtn = document.getElementById('form-submit');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name  = contactForm.querySelector('[name="name"]').value.trim();
      const email = contactForm.querySelector('[name="email"]').value.trim();
      const msg   = contactForm.querySelector('[name="message"]').value.trim();
      if (!name || !email || !msg) {
        alert('Please fill in all required fields.');
        return;
      }
      if (formSubmitBtn) {
        formSubmitBtn.disabled     = true;
        formSubmitBtn.textContent  = 'Sending…';
      }
      setTimeout(() => {
        contactForm.reset();
        if (formSubmitBtn) {
          formSubmitBtn.disabled    = false;
          formSubmitBtn.textContent = 'Send Message';
        }
        if (formMessage) {
          formMessage.style.display = 'block';
          formMessage.classList.add('form-message--success');
          formMessage.textContent   = '✓ Thank you! We\'ll be in touch within one business day.';
          setTimeout(() => { formMessage.style.display = 'none'; }, 6000);
        }
      }, 1200);
    });
  }


  /* -------------------------------------------------------
     8. Active nav link highlight on scroll
  ------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  const sectionIds = Array.from(navLinks).map(l => l.getAttribute('href').slice(1));
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  function onScrollSections() {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 130) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('nav__link--active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('nav__link--active');
      }
    });
  }

  window.addEventListener('scroll', onScrollSections, { passive: true });


  /* -------------------------------------------------------
     9. Terminal Typewriter (AI section)
  ------------------------------------------------------- */
  const terminalLines = document.querySelectorAll('.ai-terminal__line[data-type]');
  if (terminalLines.length && 'IntersectionObserver' in window) {
    const terminalObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateTerminal();
            terminalObserver.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    const terminal = document.querySelector('.ai-terminal');
    if (terminal) terminalObserver.observe(terminal);
  }

  function animateTerminal() {
    terminalLines.forEach((line, i) => {
      line.style.opacity = '0';
      setTimeout(() => {
        line.style.transition = 'opacity 0.3s ease';
        line.style.opacity    = '1';
      }, i * 320);
    });
  }


  /* -------------------------------------------------------
     10. Parallax tilt on hero card (desktop only)
  ------------------------------------------------------- */
  const heroCard = document.querySelector('.hero__visual-card');
  if (heroCard && window.matchMedia('(min-width: 900px)').matches) {
    heroCard.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      this.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    });
    heroCard.addEventListener('mouseleave', function () {
      this.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      this.style.transform  = '';
      setTimeout(() => { this.style.transition = ''; }, 600);
    });
  }


  /* -------------------------------------------------------
     11. Dynamic copyright year (auto-updates)
  ------------------------------------------------------- */
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* -------------------------------------------------------
     12. Active nav link CSS class — handled in styles.css
  ------------------------------------------------------- */

})();
