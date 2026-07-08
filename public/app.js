document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide vector outline icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ==========================================
  // 0. Loading Screen Animation Sequence
  // ==========================================
  const loadingScreen = document.getElementById('loading-screen');
  const isVisited = sessionStorage.getItem('visited') === 'true';

  function typeTagline(element, text, speed, callback) {
    let index = 0;
    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      } else if (callback) {
        callback();
      }
    }
    type();
  }

  if (isVisited) {
    if (loadingScreen) {
      loadingScreen.remove();
    }
    document.body.classList.remove('loading-active');
    document.documentElement.classList.remove('loading-active');
  } else {
    // Force scroll lock in case inline script missed it
    document.body.classList.add('loading-active');
    document.documentElement.classList.add('loading-active');

    const rects = document.querySelectorAll('.loading-logo rect');
    const progressBar = document.querySelector('.loading-progress-bar');
    const percentageText = document.querySelector('.loading-percentage');
    const loadingTitle = document.querySelector('.loading-title');
    const loadingUnderline = document.querySelector('.loading-underline');
    const taglineText = document.querySelector('.tagline-txt');
    const totalRects = rects.length;

    if (totalRects > 0) {
      // Sort rects row-by-row (top-to-bottom) for structured drawing effect
      const rectArray = Array.from(rects);
      rectArray.sort((a, b) => {
        const yA = parseInt(a.getAttribute('y') || '0', 10);
        const yB = parseInt(b.getAttribute('y') || '0', 10);
        if (yA !== yB) return yA - yB;
        const xA = parseInt(a.getAttribute('x') || '0', 10);
        const xB = parseInt(b.getAttribute('x') || '0', 10);
        return xA - xB;
      });

      // Animate rects and update progress
      rectArray.forEach((rect, index) => {
        const isGlitch = rect.classList.contains('glitch-pixel');
        // Base delay is index * 18ms (overall ~1.5s for 82 rects)
        let delay = index * 18;
        if (isGlitch) {
          // Off-sync glitch effect
          delay += (Math.random() - 0.5) * 350;
          if (delay < 0) delay = 0;
        }
        rect.style.animationDelay = `${delay}ms`;

        setTimeout(() => {
          const percent = Math.floor(((index + 1) / totalRects) * 100);
          if (percentageText) percentageText.textContent = `${percent}%`;
          if (progressBar) progressBar.style.width = `${percent}%`;
        }, delay);
      });
    }

    // Step 2: Show "CODE & CO" Title (at 1.6s)
    setTimeout(() => {
      if (loadingTitle) loadingTitle.classList.add('show');
    }, 1600);

    // Step 3: Draw Green Underline left-to-right (at 2.0s)
    setTimeout(() => {
      if (loadingUnderline) loadingUnderline.classList.add('show');
    }, 2000);

    // Step 4: Type Tagline with Cursor Typing Effect (at 2.4s)
    setTimeout(() => {
      if (taglineText) {
        typeTagline(taglineText, 'Turning Ideas Into Code.', 45, () => {
          // Let cursor blink for 600ms, then fade out the screen
          setTimeout(() => {
            if (loadingScreen) {
              loadingScreen.classList.add('fade-out');
            }
            // Unlock scroll
            document.body.classList.remove('loading-active');
            document.documentElement.classList.remove('loading-active');
            sessionStorage.setItem('visited', 'true');
            
            // Remove screen from DOM after transition completes
            setTimeout(() => {
              if (loadingScreen) {
                loadingScreen.remove();
              }
            }, 400);
          }, 600);
        });
      } else {
        // Fallback if tagline element is missing
        setTimeout(() => {
          if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
          }
          document.body.classList.remove('loading-active');
          document.documentElement.classList.remove('loading-active');
          sessionStorage.setItem('visited', 'true');
          setTimeout(() => {
            if (loadingScreen) {
              loadingScreen.remove();
            }
          }, 400);
        }, 1000);
      }
    }, 2400);
  }

  // ==========================================
  // 2. Mobile Responsive Menu Toggle
  // ==========================================
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMenu = () => {
    mobileMenuBtn.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
    // Prevent background scrolling when mobile menu is open
    document.body.style.overflow = navLinksContainer.classList.contains('active') ? 'hidden' : '';
  };

  mobileMenuBtn.addEventListener('click', toggleMenu);

  // Close menu when a navigation link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinksContainer.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // ==========================================
  // 3. Active Navigation Section Highlighting
  // ==========================================
  const sections = document.querySelectorAll('section');
  
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section occupies the middle of screen
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  sections.forEach(section => observer.observe(section));

  // ==========================================
  // 4. Toast Notification Manager
  // ==========================================
  const toastContainer = document.getElementById('toast-container');

  const showToast = (title, message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '⚡' : '⚠️';
    
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-body">
        <span class="toast-title">${title}</span>
        <span class="toast-msg">${message}</span>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate In
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto Animate Out and Remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400); // Wait for transition fade to complete
    }, 4500);
  };

  // ==========================================
  // 5. Enrollment Form Submission Handler
  // ==========================================
  const form = document.getElementById('enrollment-form');
  const submitBtn = form.querySelector('.btn-submit');
  const inputs = form.querySelectorAll('input[required]');

  // Remove visual error states on input keypress
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim() !== '') {
        input.parentElement.classList.remove('invalid');
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let isFormValid = true;
    const formData = {};

    // Validate inputs
    inputs.forEach(input => {
      let isInputValid = true;
      if (input.value.trim() === '') {
        isInputValid = false;
      } else if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          isInputValid = false;
        }
      }

      if (!isInputValid) {
        input.parentElement.classList.add('invalid');
        isFormValid = false;
      } else {
        input.parentElement.classList.remove('invalid');
        formData[input.name] = input.value.trim();
      }
    });

    // Add optional skills parameter
    formData.skills = document.getElementById('skills').value.trim();

    if (!isFormValid) {
      showToast('Validation Error', 'Please check the form for errors and try again.', 'error');
      return;
    }

    // Set submitting loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      // Send data to backend endpoint
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Success!', result.message, 'success');
        form.reset();
      } else {
        throw new Error(result.error || result.message || 'Server error occurred.');
      }

    } catch (error) {
      console.error('Submission failed:', error);
      showToast('Registration Failed', error.message || 'Unable to connect to the server.', 'error');
    } finally {
      // Clear loading state
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
});
