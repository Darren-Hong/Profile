/**
 * ====================================================================
 * PORTFOLIO SCRIPT CONTROLLER
 * ====================================================================
 * Handles:
 * 1. AI-themed Canvas Particle System (Neural Network layout)
 * 2. Terminal Typing simulation for Hero taglines
 * 3. Intersection Observers for Scroll-triggered animations & Nav updates
 * 4. Live Sorting Visualizer (Bubble Sort vs Selection Sort)
 * 5. Interactive SVG Neural Network propagation simulation
 * 6. Contact Form feedback transmission simulation
 * ====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- UTILS & CORE SELECTORS ---
  const select = (sel) => document.querySelector(sel);
  const selectAll = (sel) => document.querySelectorAll(sel);

  /* ====================================================================
   * 1. CANVAS PARTICLE SYSTEM (NEURAL NET HERO ANIMATION)
   * ====================================================================
   */
  const canvas = select('#hero-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 130 };
  let animationFrameId;

  // Configuration settings
  const config = {
    particleCount: window.innerWidth < 768 ? 40 : 100, // Reduced on mobile for latency/power optimization
    connectionDistance: 110,
    baseSpeed: 0.4,
    nodeColor: '0, 229, 255', // Cyan HSL component
    lineColor: '189, 0, 255'   // Violet HSL component
  };

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * config.baseSpeed;
      this.vy = (Math.random() - 0.5) * config.baseSpeed;
      this.radius = Math.random() * 2.5 + 1.5;
    }

    update() {
      // Bounds checking & bounce
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      // Update positions
      this.x += this.vx;
      this.y += this.vy;

      // Mouse interactive push/pull logic
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          // Push away slightly from cursor to look responsive
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= (dx / distance) * force * 1.5;
          this.y -= (dy / distance) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${config.nodeColor}, 0.85)`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(${config.nodeColor}, 0.5)`;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow for lines efficiency
    }
  }

  function initParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? config.particleCount : 100;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function handleParticles() {
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Draw connection lines to other particles
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < config.connectionDistance) {
          // Dynamic alpha based on proximity distance
          const alpha = (1 - dist / config.connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          // Blended gradient lines between cyan and violet colors
          ctx.strokeStyle = `rgba(${config.lineColor}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Draw connection lines directly to mouse cursor
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const alpha = (1 - dist / mouse.radius) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${config.nodeColor}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    animationFrameId = requestAnimationFrame(animateCanvas);
  }

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initParticles();
  }

  // Event Listeners for canvas mouse interaction
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationFrameId);
    resizeCanvas();
    animateCanvas();
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Initialization
  resizeCanvas();
  animateCanvas();


  /* ====================================================================
   * 2. TERMINAL TYPING EFFECT
   * ====================================================================
   */
  const typingTarget = select('#typing-text');
  const taglines = [
    'apu_student.get_status(year=2, seeking_internship=True)...',
    'import torch; model = torch.nn.Sequential(...)',
    'std::cout << "Loading Warehouse Router..." << std::endl;',
    'new HealthSwingSystem().setVisible(true);',
    'db.query("SELECT * FROM courses INNER JOIN users");',
    'randomForest(formula = target ~ ., data = train_set)',
    'status: looking_for_internship_starting_july_2026;'
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 70;

  function typeEffect() {
    const currentLine = taglines[lineIndex];
    
    if (isDeleting) {
      // Remove character
      typingTarget.textContent = currentLine.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35; // Backspace is faster than typing
    } else {
      // Type character
      typingTarget.textContent = currentLine.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 70; // Regular typing pace
    }

    // Finished typing line
    if (!isDeleting && charIndex === currentLine.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at full sentence before backspacing
    } 
    // Finished backspacing line
    else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      lineIndex = (lineIndex + 1) % taglines.length; // Loop back
      typingSpeed = 400; // Pause before typing next word
    }

    setTimeout(typeEffect, typingSpeed);
  }

  // Start the typing cycle
  if (typingTarget) setTimeout(typeEffect, 1000);


  /* ====================================================================
   * 3. SCROLL REVEAL OBSERVER & ACTIVE SIDEBAR LINKS
   * ====================================================================
   */
  const revealElements = selectAll('.reveal');
  const sections = selectAll('main > section');
  const navLinks = selectAll('.nav-link');

  // Entrance animations trigger
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Handle skills matrix animation separately to fill bars on intersection
        if (entry.target.id === 'skills') {
          animateSkillsBars();
        }
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Skills filling bars function
  function animateSkillsBars() {
    const fills = selectAll('.skill-fill');
    fills.forEach(fill => {
      const percentage = fill.getAttribute('data-percent');
      fill.style.width = `${percentage}%`;
    });
  }

  // Sidebar navigation active link tracking
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: '-10% 0px -40% 0px'
  });

  sections.forEach(sec => navObserver.observe(sec));




  /* ====================================================================
   * 7. CONTACT FORM SUBMISSION HANDLER
   * ====================================================================
   */
  const contactForm = select('#cyber-contact-form');
  const formSuccess = select('#form-success-alert');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simulate AJAX connection delay
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      
      btn.textContent = "Transmitting Packet...";
      btn.disabled = true;
      btn.style.opacity = '0.5';

      setTimeout(() => {
        // Success callback Simulation
        btn.textContent = "Transmission Complete";
        formSuccess.classList.add('success');
        
        // Reset state after a few seconds
        setTimeout(() => {
          contactForm.reset();
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.opacity = '1';
          formSuccess.classList.remove('success');
          
          // Floating float tags visual refresh
          const formInputs = selectAll('.form-input');
          formInputs.forEach(input => input.blur());
        }, 4000);
        
      }, 1500);
    });
  }

  /* ====================================================================
   * 8. NAVIGATION TOGGLE ACTION (DRAWER TRIGGER)
   * ====================================================================
   */
  const navToggle = select('#nav-toggle');
  const navSidebar = select('.nav-sidebar');

  if (navToggle && navSidebar) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navSidebar.classList.toggle('open');
      navToggle.classList.toggle('open');
    });

    // Close when clicking nav links
    const links = selectAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navSidebar.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });

    // Close when clicking outside sidebar
    document.addEventListener('click', (e) => {
      if (!navSidebar.contains(e.target) && !navToggle.contains(e.target) && navSidebar.classList.contains('open')) {
        navSidebar.classList.remove('open');
        navToggle.classList.remove('open');
      }
    });
  }

});
