document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Theme Switcher (Light / Dark Mode)
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Retrieve theme preference from localStorage or check system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  // Apply initial theme
  htmlElement.setAttribute('data-theme', initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    showToast(
      'Theme Updated',
      `Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} Mode`,
      'success'
    );
  });

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
      if (input.value.trim() === '') {
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
      showToast('Validation Error', 'Please fill in all required fields.', 'error');
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
