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
     4. Intersection Observer (Scroll entrance animations + Lazy Loading)
     ========================================================================== */
  
  // A. Lazy-load sections with skeleton placeholders
  const lazySections = [
    { skeletonId: 'features-skeleton', contentId: 'features-content' }
  ];

  // Khởi tạo ẩn nội dung và hiện skeleton bằng JS để đảm bảo nếu JS lỗi/cache, trang vẫn hiển thị nội dung gốc
  lazySections.forEach(config => {
    const skeleton = document.getElementById(config.skeletonId);
    const content = document.getElementById(config.contentId);
    if (skeleton && content) {
      skeleton.style.display = 'flex';
      content.style.display = 'none';
      content.style.opacity = '0';
    }
  });

  const sectionLazyOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.05
  };

  const sectionLazyObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionEl = entry.target;
        const sectionId = sectionEl.getAttribute('id');

        // Find matching lazy config
        const config = lazySections.find(c => {
          const skeleton = document.getElementById(c.skeletonId);
          return skeleton && skeleton.closest('section') === sectionEl;
        });

        if (config) {
          const skeleton = document.getElementById(config.skeletonId);
          const content = document.getElementById(config.contentId);

          if (skeleton && content) {
            // Show skeleton shimmer for 800ms, then reveal real content
            setTimeout(() => {
              skeleton.style.display = 'none';
              content.style.display = 'grid';
              
              // Force reflow and transition opacity
              setTimeout(() => {
                content.style.opacity = '1';
                // Trigger inner entrance animations
                const innerAnims = content.querySelectorAll('.animate-on-scroll');
                innerAnims.forEach(el => el.classList.add('active'));
              }, 20);
            }, 800);
          }
        }

        obs.unobserve(sectionEl);
      }
    });
  }, sectionLazyOptions);

  // Observe parent sections that contain skeletons
  lazySections.forEach(config => {
    const skeleton = document.getElementById(config.skeletonId);
    if (skeleton) {
      const parentSection = skeleton.closest('section');
      if (parentSection) sectionLazyObserver.observe(parentSection);
    }
  });

  // B. Scroll entrance animations for .animate-on-scroll elements
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
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
    simulatedUserInput.textContent = 'Khởi chạy Agent...';
    terminalChat.innerHTML = ''; // Dọn sạch nội dung terminal cũ
    
    const skeletonEl = document.getElementById('simulator-skeleton');
    const chatEl = document.getElementById('terminal-chat-content');
    
    // Hiển thị Skeleton Loading, ẩn khung chat
    skeletonEl.classList.remove('hidden');
    chatEl.classList.add('hidden');
    simulatedUserInput.classList.add('text-muted');

    // Giả lập độ trễ hệ thống 1 giây
    setTimeout(() => {
      skeletonEl.classList.add('hidden');
      chatEl.classList.remove('hidden');
      simulatedUserInput.textContent = '';
      simulatedUserInput.classList.remove('text-muted');

      // Bắt đầu giả lập gõ chữ
      const userText = data.userInput;
      let charIndex = 0;
      
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      simulatedUserInput.appendChild(cursor);

      const typeChar = () => {
        if (charIndex < userText.length) {
          cursor.insertAdjacentText('beforebegin', userText.charAt(charIndex));
          charIndex++;
          activeTypingTimeout = setTimeout(typeChar, 30);
        } else {
          cursor.remove();
          playTerminalLogs(data.logs);
        }
      };

      typeChar();
    }, 1000);
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

  // Chỉ tự động chạy simulator khi cuộn tới phần này
  const simulatorSection = document.getElementById('simulator');
  if (simulatorSection) {
    const simulatorObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runSimulation('marketing');
          obs.unobserve(simulatorSection); // Chỉ tự động chạy lần đầu tiên
        }
      });
    }, { threshold: 0.15 });
    
    simulatorObserver.observe(simulatorSection);
  }


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
    const interest = document.getElementById('contact-interest').value;
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      statusMsg.className = 'form-status-msg error';
      statusMsg.textContent = 'Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)';
      return;
    }

    // Toggle button state to loading for a tiny visual feedback (300ms)
    submitBtn.disabled = true;
    submitBtnText.textContent = 'Đang xử lý...';
    submitBtnSpinner.classList.remove('hidden');

    const payload = {
      name: name,
      email: email,
      interest: interest,
      message: message,
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // 1. Lưu cục bộ ngay lập tức (giả lập database)
    let submissions = JSON.parse(localStorage.getItem('zenith-submissions') || '[]');
    submissions.push(payload);
    localStorage.setItem('zenith-submissions', JSON.stringify(submissions));

    // 2. Hiển thị thông báo thành công sau 300ms để tạo cảm giác phản hồi nhanh gọn
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Đăng ký thông tin';
      submitBtnSpinner.classList.add('hidden');

      statusMsg.className = 'form-status-msg success';
      statusMsg.textContent = `Cảm ơn ${name}! Đăng ký của bạn đã được ghi nhận thành công. Mã kích hoạt 14 ngày dùng thử Pro đã được gửi về email ${email}.`;
      
      showTrackerToast(`[Đăng ký] Đã lưu thông tin đăng ký của ${name} thành công!`);

      // Reset form fields
      contactForm.reset();
    }, 300);

    // 3. Gửi webhook chạy ngầm dưới background (không làm xoay vòng giao diện)
    fetch('https://httpbin.org/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (response.ok) {
        showTrackerToast(`[Webhook] Dữ liệu đã được đồng bộ qua Webhook thực tế (200 OK).`);
      }
    })
    .catch(error => {
      console.warn('Webhook background sync failed:', error);
    });
  });


  /* ==========================================================================
     9. User Behavior Tracker (Developer Debug Console Panel)
     ========================================================================== */
  const debugPanel = document.getElementById('debug-panel');
  const debugToggleBtn = document.getElementById('debug-toggle-btn');
  const consoleLogs = document.getElementById('console-logs');
  const consoleClearBtn = document.getElementById('console-clear-btn');

  // Toggle bật/tắt bảng điều khiển Debug
  if (debugToggleBtn && debugPanel) {
    debugToggleBtn.addEventListener('click', () => {
      debugPanel.classList.toggle('active');
    });
  }

  // Nút xóa sạch logs trong console
  if (consoleClearBtn && consoleLogs) {
    consoleClearBtn.addEventListener('click', () => {
      consoleLogs.innerHTML = '<div class="log-line system">[sys] Console cleared. Logs reset.</div>';
    });
  }

  // Hàm ghi nhận log hành vi người dùng
  const showTrackerToast = (message) => {
    if (!consoleLogs) return;

    // Lấy thời gian hiện tại định dạng HH:MM:SS
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Tạo phần tử log mới
    const logLine = document.createElement('div');
    logLine.className = 'log-line';

    // Xác định màu sắc/loại log
    if (message.includes('[Hành vi] Đang cuộn')) {
      logLine.classList.add('scroll');
    } else if (message.includes('[Hành vi] Đã click') || message.includes('[Yêu thích]') || message.includes('[Xem]') || message.includes('[Giỏ hàng]')) {
      logLine.classList.add('click');
    } else if (message.includes('[Đăng ký]') || message.includes('[Webhook]')) {
      logLine.classList.add('form');
    } else {
      logLine.classList.add('system');
    }

    logLine.textContent = `[${timeStr}] ${message}`;
    consoleLogs.appendChild(logLine);

    // Tự động cuộn xuống dưới cùng
    consoleLogs.scrollTop = consoleLogs.scrollHeight;

    // Ghi nhận thêm ở F12 Developer Tool
    console.log(`%c[ZENITH AI DEBUG] %c[${timeStr}] ${message}`, 'color: #8b5cf6; font-weight: bold;', 'color: inherit;');
  };

  // Theo dõi hành vi cuộn chuột (Scroll) qua các Section
  const sectionTrackerOptions = {
    root: null,
    threshold: 0.4
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        let sectionName = '';
        if (id === 'hero') sectionName = 'Màn hình chính (Hero)';
        else if (id === 'features') sectionName = 'Tính năng nổi bật';
        else if (id === 'specs') sectionName = 'Thông số kỹ thuật';
        else if (id === 'simulator') sectionName = 'AI Simulator Demo';
        else if (id === 'pricing') sectionName = 'Bảng giá dịch vụ';
        else if (id === 'faq') sectionName = 'Hỏi đáp (FAQ)';
        else if (id === 'contact') sectionName = 'Form đăng ký & Liên hệ';
        
        if (sectionName) {
          showTrackerToast(`[Hành vi] Đang cuộn xem: ${sectionName}`);
        }
      }
    });
  }, sectionTrackerOptions);

  const sectionsToTrack = document.querySelectorAll('section[id]');
  sectionsToTrack.forEach(sec => sectionObserver.observe(sec));

  // Theo dõi hành vi nhấn chuột (Click)
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, .prompt-btn, .quick-opt-btn, .addon-option');
    if (!target) return;
    if (target.closest('#debug-toggle-btn') || target.closest('#console-clear-btn')) return; // Bỏ qua log tương tác console
    
    let label = target.textContent.trim().substring(0, 30);
    if (target.getAttribute('id') === 'theme-toggle-btn') {
      label = 'Thay đổi giao diện (Light/Dark Mode)';
    } else if (target.closest('#chatbot-toggle-btn')) {
      label = 'Mở/đóng Trợ lý Chatbot';
    } else if (target.closest('#cart-close-btn') || target.closest('#cart-overlay')) {
      label = 'Đóng giỏ hàng gói dịch vụ';
    }
    
    if (label) {
      showTrackerToast(`[Hành vi] Đã click: "${label}"`);
    }
  });


  /* ==========================================================================
     10. Plan Cart Drawer (Mini E-commerce)
     ========================================================================== */
  const cartDrawer = document.getElementById('cart-drawer');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartOverlay = document.getElementById('cart-overlay');
  
  const cartPlanNameEl = document.getElementById('cart-plan-name');
  const cartPlanPriceValEl = document.getElementById('cart-plan-price-val');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTotalEl = document.getElementById('cart-total');
  
  const addonCheckboxes = document.querySelectorAll('.addon-checkbox');
  const btnFavoritePlan = document.getElementById('btn-favorite-plan');
  const btnCheckoutPlan = document.getElementById('btn-checkout-plan');
  const cartHistoryList = document.getElementById('cart-history-list');
  const cartFavoritesList = document.getElementById('cart-favorites-list');

  let currentBasePrice = 0;
  let currentPlanName = '';
  let currentBillingPeriod = '/tháng';

  const updateCartTotals = () => {
    let subtotal = currentBasePrice;
    let addonsTotal = 0;
    
    addonCheckboxes.forEach(chk => {
      if (chk.checked) {
        addonsTotal += parseFloat(chk.getAttribute('data-price'));
      }
    });
    
    const total = subtotal + addonsTotal;
    
    cartSubtotalEl.textContent = `$${subtotal}`;
    cartTotalEl.textContent = `$${total}${currentBillingPeriod}`;
  };

  const openCartDrawer = (planName, basePrice, isYearly) => {
    currentPlanName = planName;
    currentBasePrice = basePrice;
    currentBillingPeriod = isYearly ? '/năm' : '/tháng';
    
    cartPlanNameEl.textContent = `Gói: ${planName} (${isYearly ? 'Thanh toán năm' : 'Thanh toán tháng'})`;
    cartPlanPriceValEl.textContent = `$${basePrice}`;
    
    addonCheckboxes.forEach(chk => chk.checked = false);
    
    updateCartTotals();
    trackPlanViewed(planName);
    
    cartDrawer.classList.add('active');
    updateFavoriteBtnState();
  };

  const closeCartDrawer = () => {
    cartDrawer.classList.remove('active');
  };

  cartCloseBtn.addEventListener('click', closeCartDrawer);
  cartOverlay.addEventListener('click', closeCartDrawer);
  
  addonCheckboxes.forEach(chk => {
    chk.addEventListener('change', updateCartTotals);
  });

  const trackPlanViewed = (planName) => {
    let viewed = JSON.parse(localStorage.getItem('zenith-viewed-plans') || '[]');
    viewed = viewed.filter(p => p !== planName);
    viewed.unshift(planName);
    if (viewed.length > 5) viewed.pop();
    localStorage.setItem('zenith-viewed-plans', JSON.stringify(viewed));
    renderHistory();
  };

  const renderHistory = () => {
    const viewed = JSON.parse(localStorage.getItem('zenith-viewed-plans') || '[]');
    cartHistoryList.innerHTML = '';
    
    if (viewed.length === 0) {
      cartHistoryList.innerHTML = '<li class="text-xs text-muted" style="padding: 8px;">Chưa xem gói nào</li>';
      return;
    }
    
    viewed.forEach(plan => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <span class="cart-item-title">${plan}</span>
        <span class="cart-item-action" data-plan="${plan}">Xem lại</span>
      `;
      cartHistoryList.appendChild(li);
    });
  };

  const toggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem('zenith-favorite-plans') || '[]');
    const isFav = favorites.includes(currentPlanName);
    
    if (isFav) {
      favorites = favorites.filter(p => p !== currentPlanName);
      showTrackerToast(`[Yêu thích] Đã xóa: Gói ${currentPlanName}`);
    } else {
      favorites.push(currentPlanName);
      showTrackerToast(`[Yêu thích] Đã thêm: Gói ${currentPlanName}`);
    }
    
    localStorage.setItem('zenith-favorite-plans', JSON.stringify(favorites));
    updateFavoriteBtnState();
    renderFavorites();
  };

  const updateFavoriteBtnState = () => {
    const favorites = JSON.parse(localStorage.getItem('zenith-favorite-plans') || '[]');
    const isFav = favorites.includes(currentPlanName);
    const heart = btnFavoritePlan.querySelector('.heart-icon');
    
    if (isFav) {
      heart.textContent = '❤️';
      btnFavoritePlan.classList.add('active');
    } else {
      heart.textContent = '🤍';
      btnFavoritePlan.classList.remove('active');
    }
  };

  const renderFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('zenith-favorite-plans') || '[]');
    cartFavoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
      cartFavoritesList.innerHTML = '<li class="text-xs text-muted" style="padding: 8px;">Chưa có gói yêu thích</li>';
      return;
    }
    
    favorites.forEach(plan => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <span class="cart-item-title">${plan}</span>
        <span class="cart-item-action" data-plan="${plan}">Xem</span>
      `;
      cartFavoritesList.appendChild(li);
    });
  };

  btnFavoritePlan.addEventListener('click', toggleFavorite);

  const handleItemClick = (e) => {
    if (!e.target.classList.contains('cart-item-action')) return;
    const plan = e.target.getAttribute('data-plan');
    
    let price = 19;
    if (plan === 'Cá nhân') price = 0;
    else if (plan === 'Doanh nghiệp') price = 49;
    
    const isYearly = document.getElementById('billing-switch').classList.contains('active');
    if (isYearly) {
      if (plan === 'Chuyên nghiệp') price = 15;
      else if (plan === 'Doanh nghiệp') price = 39;
    }
    
    openCartDrawer(plan, price, isYearly);
  };

  cartHistoryList.addEventListener('click', handleItemClick);
  cartFavoritesList.addEventListener('click', handleItemClick);

  // Gắn sự kiện chặn nút CTA bảng giá và thay thế bằng mở Giỏ Hàng
  const pricingCards = document.querySelectorAll('.pricing-card');
  pricingCards.forEach(card => {
    const planName = card.querySelector('.plan-name').textContent.trim();
    const btn = card.querySelector('.btn');
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const isYearly = document.getElementById('billing-switch').classList.contains('active');
      let price = 19;
      if (planName === 'Cá nhân') price = 0;
      else if (planName === 'Doanh nghiệp') price = 49;
      
      if (isYearly) {
        if (planName === 'Chuyên nghiệp') price = 15;
        else if (planName === 'Doanh nghiệp') price = 39;
      }
      
      openCartDrawer(planName, price, isYearly);
    });
    
    // Di chuột xem gói (Micro-interaction & Behavior tracking)
    card.addEventListener('mouseenter', () => {
      showTrackerToast(`[Xem] Tìm hiểu gói: Gói ${planName}`);
    });
  });

  // Tiến hành checkout gói (đẩy dữ liệu vào Form Đăng Ký)
  btnCheckoutPlan.addEventListener('click', () => {
    const contactInterestSelect = document.getElementById('contact-interest');
    const contactMessageTextarea = document.getElementById('contact-message');
    
    if (currentPlanName === 'Cá nhân') {
      contactInterestSelect.value = 'pro';
    } else if (currentPlanName === 'Doanh nghiệp') {
      contactInterestSelect.value = 'enterprise';
    } else {
      contactInterestSelect.value = 'pro';
    }
    
    let addonsList = [];
    addonCheckboxes.forEach(chk => {
      if (chk.checked) {
        addonsList.push(chk.nextElementSibling.querySelector('.addon-name').textContent);
      }
    });
    
    const totalText = cartTotalEl.textContent;
    contactMessageTextarea.value = `Tôi muốn đăng ký Gói: ${currentPlanName} (${totalText}).\nCác tiện ích đi kèm: ${addonsList.length > 0 ? addonsList.join(', ') : 'Không có'}.\nVui lòng liên hệ lại tư vấn!`;
    
    closeCartDrawer();
    
    // Cuộn mượt đến phần liên hệ
    const contactSection = document.getElementById('contact');
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    showTrackerToast(`[Giỏ hàng] Đã nhập thông tin giỏ hàng vào Form Đăng Ký!`);
  });


  /* ==========================================================================
     11. Chatbot Widget Logic
     ========================================================================== */
  const chatbotContainer = document.getElementById('chatbot-container');
  const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSendBtn = document.getElementById('chatbot-send-btn');
  const chatbotUnread = document.getElementById('chatbot-unread');
  
  // Hiển thị chấm đỏ tin nhắn sau 4 giây (Micro-interaction)
  setTimeout(() => {
    if (!chatbotContainer.classList.contains('active')) {
      chatbotUnread.style.display = 'block';
      showTrackerToast(`[Trợ lý ảo] Bạn có 1 tin nhắn mới từ Zenith AI Assistant!`);
    }
  }, 4000);

  chatbotToggleBtn.addEventListener('click', () => {
    const isActive = chatbotContainer.classList.toggle('active');
    const chatIcon = chatbotToggleBtn.querySelector('.chat-icon');
    const closeIcon = chatbotToggleBtn.querySelector('.close-icon');
    
    if (isActive) {
      chatIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      chatbotUnread.style.display = 'none';
      chatbotInput.focus();
    } else {
      chatIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    }
  });

  const appendChatMessage = (text, sender) => {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = `<div class="msg-bubble">${text}</div>`;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  };

  const showBotTypingIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'chat-msg bot typing-msg';
    indicator.innerHTML = `
      <div class="msg-bubble">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    chatbotMessages.appendChild(indicator);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return indicator;
  };

  const handleBotResponse = (userText) => {
    const typingIndicator = showBotTypingIndicator();
    
    let answer = "Tôi chưa hiểu câu hỏi của bạn. Bạn vui lòng chọn một trong các câu hỏi gợi ý bên dưới hoặc liên hệ contact@zenithai.io để nhận hỗ trợ tốt nhất nhé!";
    const textLower = userText.toLowerCase();
    
    if (textLower.includes('là gì') || textLower.includes('zenith')) {
      answer = "Zenith AI là một không gian làm việc thông minh tích hợp AI Agent tự vận hành, hỗ trợ tổng hợp thông tin, viết code, nghiên cứu và quản lý dự án hiệu quả gấp 10 lần.";
    } else if (textLower.includes('giá') || textLower.includes('bảng giá') || textLower.includes('pricing') || textLower.includes('gói')) {
      answer = "Chúng tôi cung cấp gói Cá nhân ($0), gói Chuyên nghiệp ($19/tháng hoặc $15/tháng khi thanh toán theo năm) và gói Doanh nghiệp ($49/tháng). Bạn có thể đăng ký dùng thử gói Pro miễn phí 14 ngày!";
    } else if (textLower.includes('bảo mật') || textLower.includes('an toàn') || textLower.includes('security')) {
      answer = "Zenith AI bảo mật dữ liệu tuyệt đối với tiêu chuẩn mã hóa AES-256 ở trạng thái nghỉ và đường truyền bảo mật SSL. Gói Doanh nghiệp hỗ trợ cài đặt On-Premise riêng biệt.";
    } else if (textLower.includes('xin chào') || textLower.includes('hello') || textLower.includes('chào')) {
      answer = "Xin chào! Rất vui được hỗ trợ bạn. Bạn muốn tìm hiểu thông tin nào về sản phẩm Zenith AI?";
    }
    
    setTimeout(() => {
      typingIndicator.remove();
      appendChatMessage(answer, 'bot');
    }, 1200);
  };

  const sendMessage = () => {
    const text = chatbotInput.value.trim();
    if (!text) return;
    
    appendChatMessage(text, 'user');
    chatbotInput.value = '';
    
    handleBotResponse(text);
  };

  chatbotSendBtn.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Xử lý click câu hỏi nhanh
  chatbotMessages.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-opt-btn');
    if (!btn) return;
    
    const question = btn.getAttribute('data-question');
    appendChatMessage(question, 'user');
    btn.parentElement.remove();
    
    handleBotResponse(question);
  });

  /* ==========================================================================
     Bonus 1: Mouse Spotlight Glow Effect
     ========================================================================== */
  const glowCards = document.querySelectorAll('.feature-card, .spec-card, .pricing-card');
  glowCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });

  // Khởi tạo hiển thị dữ liệu lịch sử giỏ hàng
  renderHistory();
  renderFavorites();

});
