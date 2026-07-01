/**
 * Zenith AI - Interactive Landing Page Logic
 * Contains Theme Toggle, Mobile Menu, Interactive AI Simulator,
 * Pricing Switcher, Accordions, Form validation and Scroll animations.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Theme Management (Light/Dark Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlElement = document.documentElement;

  // Retrieve theme from localStorage or system preferences
  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('zenith-theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const setTheme = (theme) => {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('zenith-theme', theme);
  };

  // Initialize Theme
  setTheme(getPreferredTheme());

  // Toggle Theme on Button Click
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });


  /* ==========================================================================
     2. Mobile Menu Toggle
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const body = document.body;

  const toggleMobileMenu = () => {
    const isOpen = navMenu.classList.toggle('active');
    body.classList.toggle('mobile-menu-open', isOpen);
  };

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

  // Close mobile menu when clicking a nav link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });


  /* ==========================================================================
     3. Header Scroll Effect
     ========================================================================== */
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.padding = '5px 0';
      header.style.boxShadow = 'var(--card-shadow)';
    } else {
      header.style.padding = '0';
      header.style.boxShadow = 'none';
    }
  });


  /* ==========================================================================
     4. Intersection Observer (Scroll entrance animations)
     ========================================================================== */
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.15 // trigger when 15% of element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once animated, we don't need to observe it anymore
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(element => {
    observer.observe(element);
  });


  /* ==========================================================================
     5. FAQ Accordion Toggle
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-open');
      
      // Close all open FAQs
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('faq-open');
        otherItem.querySelector('.faq-answer').style.maxHeight = '0px';
      });

      // Toggle current FAQ
      if (!isOpen) {
        item.classList.add('faq-open');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });


  /* ==========================================================================
     6. Pricing Billing Toggle
     ========================================================================== */
  const billingSwitch = document.getElementById('billing-switch');
  const monthlyLabel = document.getElementById('billing-monthly');
  const yearlyLabel = document.getElementById('billing-yearly');
  
  const starterPrice = document.getElementById('price-starter');
  const proPrice = document.getElementById('price-pro');
  const enterprisePrice = document.getElementById('price-enterprise');

  const prices = {
    monthly: { starter: '0', pro: '19', enterprise: '49' },
    yearly: { starter: '0', pro: '15', enterprise: '39' } // 20% discount
  };

  const toggleBilling = () => {
    const isYearly = billingSwitch.classList.toggle('active');
    
    monthlyLabel.classList.toggle('active', !isYearly);
    yearlyLabel.classList.toggle('active', isYearly);

    const priceSet = isYearly ? prices.yearly : prices.monthly;
    
    // Animate price updates
    animatePriceChange(starterPrice, priceSet.starter);
    animatePriceChange(proPrice, priceSet.pro);
    animatePriceChange(enterprisePrice, priceSet.enterprise);
  };

  const animatePriceChange = (element, targetValue) => {
    element.style.opacity = 0;
    element.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      element.textContent = targetValue;
      element.style.opacity = 1;
      element.style.transform = 'translateY(0)';
    }, 200);
  };

  billingSwitch.addEventListener('click', toggleBilling);
  monthlyLabel.addEventListener('click', () => {
    if (billingSwitch.classList.contains('active')) toggleBilling();
  });
  yearlyLabel.addEventListener('click', () => {
    if (!billingSwitch.classList.contains('active')) toggleBilling();
  });


  /* ==========================================================================
     7. Interactive AI Simulator
     ========================================================================== */
  const promptButtons = document.querySelectorAll('.prompt-btn');
  const agentNameEl = document.getElementById('agent-name');
  const terminalChat = document.getElementById('terminal-chat-content');
  const simulatedUserInput = document.getElementById('simulated-user-input');

  const simulatorData = {
    marketing: {
      agentName: 'Copywriter-Agent',
      userInput: 'Viết bài quảng cáo sản phẩm Zenith AI bản v2.0 cho bài đăng Facebook',
      logs: [
        { type: 'system', text: 'Initializing Agent: Copywriter-Agent v2.0...' },
        { type: 'system', text: 'Reading product documentation (index.html, style.css)...' },
        { type: 'info', text: 'Brainstorming key Selling Points: AI-collaborative canvas, Auto-knowledge graphs, Background agents.' },
        { type: 'info', text: 'Generating advertising copy tailored for Tech Professionals & Founders...' },
        { type: 'code', text: `✨ GIỚI THIỆU ZENITH AI v2.0 - KHÔNG GIAN LÀM VIỆC TỰ ĐỘNG ✨

Bạn đã sẵn sàng nhân 10 hiệu suất làm việc của mình chưa? 🚀
Zenith AI không chỉ là nơi ghi chép, đó là không gian tích hợp các AI Agent tự vận hành:
- 💡 Tự động liên kết ý tưởng thành Bản đồ kiến thức trực quan.
- 🤖 Giao việc cho các Agent nghiên cứu độc lập trong lúc ngủ.
- 💻 Code, viết lách, dịch thuật mượt mà với Markdown & Code Editor chuyên sâu.

👉 Đăng ký thử nghiệm Pro miễn phí ngay hôm nay!` },
        { type: 'success', text: 'Task completed successfully! Ad copy written and saved to files/fb-ad-v2.txt.' }
      ]
    },
    refactor: {
      agentName: 'CodeRefactor-Agent',
      userInput: 'Kiểm tra lỗi rò rỉ bộ nhớ (memory leak) trong hàm xử lý sự kiện cuộn trang',
      logs: [
        { type: 'system', text: 'Initializing Agent: CodeRefactor-Agent v1.8...' },
        { type: 'system', text: 'Scanning workspace directory for event listeners...' },
        { type: 'warning', text: 'Found window.addEventListener("scroll") without matching removeEventListener in active widgets.' },
        { type: 'info', text: 'Analyzing file app.js line 24. Applying debouncing design pattern...' },
        { type: 'code', text: `// BEFORE:
window.addEventListener('scroll', () => {
  doHeavyScrollCalculation(); // Triggers on every pixel scroll
});

// AFTER (Optimized with debounce):
function debounce(func, wait = 15) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
window.addEventListener('scroll', debounce(doHeavyScrollCalculation));` },
        { type: 'success', text: 'Optimization applied! Performance improved by 35% under scrolls.' }
      ]
    },
    research: {
      agentName: 'MarketResearch-Agent',
      userInput: 'Phân tích xu hướng thị trường SaaS AI trong năm 2026',
      logs: [
        { type: 'system', text: 'Initializing Agent: MarketResearch-Agent v2.5...' },
        { type: 'system', text: 'Connecting to search engine tools and indexing latest documents...' },
        { type: 'info', text: 'Searching keywords: "SaaS AI trends 2026", "AI Productivity tools growth"...' },
        { type: 'info', text: 'Summarizing key findings from McKinsey & Gartner reports...' },
        { type: 'code', text: `XU HƯỚNG THỊ TRƯỜNG SAAS AI 2026:
1. Thị phần công cụ AI Agent tự chủ (Autonomous Agents) tăng trưởng 42% y-o-y.
2. 78% lập trình viên chuyển sang dùng Canvas Workspace thay cho Text-editor truyền thống.
3. Chú trọng bảo mật dữ liệu: On-premise AI hosting trở thành tiêu chuẩn bắt buộc cho doanh nghiệp.` },
        { type: 'success', text: 'Research report finished. Exported to reports/saas-trends-2026.pdf.' }
      ]
    }
  };

  let activeTypingTimeout = null;
  let activeLogTimeouts = [];

  const clearAllSimulations = () => {
    if (activeTypingTimeout) {
      clearTimeout(activeTypingTimeout);
      activeTypingTimeout = null;
    }
    activeLogTimeouts.forEach(t => clearTimeout(t));
    activeLogTimeouts = [];
  };

  const runSimulation = (key) => {
    clearAllSimulations();
    
    const data = simulatorData[key];
    if (!data) return;

    agentNameEl.textContent = data.agentName;
    simulatedUserInput.textContent = '';
    terminalChat.innerHTML = '';

    // Step 1: Type the prompt character by character
    const userText = data.userInput;
    let charIndex = 0;
    
    // Create cursor in text container
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    simulatedUserInput.appendChild(cursor);

    const typeChar = () => {
      if (charIndex < userText.length) {
        cursor.insertAdjacentText('beforebegin', userText.charAt(charIndex));
        charIndex++;
        activeTypingTimeout = setTimeout(typeChar, 30);
      } else {
        // Typing finished, remove blinking cursor from input, start showing logs
        cursor.remove();
        playTerminalLogs(data.logs);
      }
    };

    activeTypingTimeout = setTimeout(typeChar, 300);
  };

  const playTerminalLogs = (logs) => {
    let delay = 300;

    logs.forEach((log, index) => {
      const timeoutId = setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        let prefixText = '[info]';
        let prefixClass = 'terminal-prefix';
        
        if (log.type === 'system') {
          prefixText = '[sys]';
          line.style.color = '#a1a1aa';
        } else if (log.type === 'warning') {
          prefixText = '[warn]';
          line.style.color = '#f59e0b';
        } else if (log.type === 'success') {
          prefixText = '[ok]';
          line.style.color = '#10b981';
        } else if (log.type === 'code') {
          prefixText = '[out]';
          line.style.color = '#38bdf8';
        }

        const prefix = document.createElement('span');
        prefix.className = prefixClass;
        prefix.textContent = prefixText;
        line.appendChild(prefix);

        if (log.type === 'code') {
          const pre = document.createElement('pre');
          pre.className = 'terminal-code';
          pre.textContent = log.text;
          line.appendChild(pre);
        } else {
          const content = document.createElement('span');
          content.className = 'terminal-output';
          content.textContent = log.text;
          line.appendChild(content);
        }

        terminalChat.appendChild(line);
        
        // Auto scroll terminal to bottom
        terminalChat.scrollTop = terminalChat.scrollHeight;
      }, delay);

      activeLogTimeouts.push(timeoutId);
      // Determine typing/showing duration for the next log item
      delay += log.type === 'code' ? 1200 : 700;
    });
  };

  // Add click events to prompt buttons
  promptButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Set active state
      promptButtons.forEach(b => b.classList.remove('active'));
      const activeBtn = e.currentTarget;
      activeBtn.classList.add('active');

      const promptKey = activeBtn.getAttribute('data-prompt');
      runSimulation(promptKey);
    });
  });

  // Start with default marketing simulation
  runSimulation('marketing');


  /* ==========================================================================
     8. Contact Form Handler (Validation & Simulation)
     ========================================================================== */
  const contactForm = document.getElementById('zenith-contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const submitBtnText = submitBtn.querySelector('span');
  const submitBtnSpinner = submitBtn.querySelector('.loading-spinner');
  const statusMsg = document.getElementById('form-status');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset status message
    statusMsg.className = 'form-status-msg hidden';
    statusMsg.textContent = '';

    // Simple validation checks
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      statusMsg.className = 'form-status-msg error';
      statusMsg.textContent = 'Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)';
      return;
    }

    // Toggle button state to loading
    submitBtn.disabled = true;
    submitBtnText.textContent = 'Đang gửi đăng ký...';
    submitBtnSpinner.classList.remove('hidden');

    // Simulate Server Post request (API delay)
    setTimeout(() => {
      // Revert button status
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Đăng ký thông tin';
      submitBtnSpinner.classList.add('hidden');

      // Success
      statusMsg.className = 'form-status-msg success';
      statusMsg.textContent = `Cảm ơn ${name}! Chúng tôi đã tiếp nhận thông tin đăng ký của bạn. Mã kích hoạt dùng thử 14 ngày đã được gửi vào hòm thư ${email}.`;
      
      // Reset form fields
      contactForm.reset();
    }, 2000);
  });

});
