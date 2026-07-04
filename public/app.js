/**
 * Zenith AI - Interactive Landing Page Logic
 * Contains Theme Toggle, Mobile Menu, Interactive AI Simulator,
 * Pricing Switcher, Accordions, Form validation and Scroll animations.
 */

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
  // Bỏ class preload khỏi body để kích hoạt transition cho hover và click ngay lập tức
  document.body.classList.remove('preload', 'css-loading');

  // Gỡ bỏ css-loading và preload khỏi html khi mọi tài nguyên đã tải xong hoàn toàn (để tránh lỗi trượt scroll của Chrome)
  window.addEventListener('load', () => {
    document.documentElement.classList.remove('preload');
    document.body.classList.remove('preload', 'css-loading');
  });

  const getNavigationType = () => {
    const [navigationEntry] = performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
    if (navigationEntry && navigationEntry.type) return navigationEntry.type;
    if (performance.navigation && performance.navigation.type === 1) return 'reload';
    if (performance.navigation && performance.navigation.type === 2) return 'back_forward';
    return 'navigate';
  };

  const scrollStorageKey = `zenith-scroll:${window.location.pathname}${window.location.search}`;
  const shouldRestoreScroll = !window.location.hash && ['reload', 'back_forward'].includes(getNavigationType());

  const readStoredScroll = () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(scrollStorageKey) || 'null');
      if (!stored || typeof stored.y !== 'number') return null;
      if (Date.now() - (stored.t || 0) > 30 * 60 * 1000) return null;
      return stored;
    } catch {
      return null;
    }
  };

  const writeCurrentScroll = () => {
    try {
      sessionStorage.setItem(scrollStorageKey, JSON.stringify({
        y: window.scrollY || document.documentElement.scrollTop || 0,
        t: Date.now()
      }));
    } catch {
      // Ignore storage failures in private or restricted browser modes.
    }
  };

  let scrollSaveRaf = null;
  const scheduleScrollSave = () => {
    if (scrollSaveRaf !== null) return;
    scrollSaveRaf = requestAnimationFrame(() => {
      scrollSaveRaf = null;
      writeCurrentScroll();
    });
  };

  let userHasScrolled = false;
  window.addEventListener('wheel', () => userHasScrolled = true, { passive: true });
  window.addEventListener('touchmove', () => userHasScrolled = true, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
      userHasScrolled = true;
    }
  }, { passive: true });

  const restoreStoredScroll = () => {
    if (!shouldRestoreScroll || restoreStoredScroll.done) return;

    const stored = readStoredScroll();
    if (!stored) return;

    restoreStoredScroll.done = true;

    const performScroll = () => {
      if (userHasScrolled) return;
      const currentHeight = document.documentElement.scrollHeight;
      const maxY = Math.max(0, currentHeight - window.innerHeight);
      window.scrollTo({ left: 0, top: Math.min(stored.y, maxY), behavior: 'auto' });
    };

    performScroll();

    // Use ResizeObserver to restore scroll on body size changes (extremely efficient, no layout thrashing)
    const resizeObserver = new ResizeObserver(() => {
      performScroll();
    });
    resizeObserver.observe(document.body);

    // Disconnect after window is fully loaded
    window.addEventListener('load', () => {
      performScroll();
      setTimeout(() => resizeObserver.disconnect(), 150);
    }, { once: true });

    // Fallback protection to disconnect after 2 seconds
    setTimeout(() => {
      resizeObserver.disconnect();
    }, 2000);
  };

  window.addEventListener('scroll', scheduleScrollSave, { passive: true });
  window.addEventListener('pagehide', writeCurrentScroll);
  window.addEventListener('beforeunload', writeCurrentScroll);
  window.addEventListener('load', restoreStoredScroll, { once: true });
  setTimeout(restoreStoredScroll, 120);

  /* ==========================================================================
     1. Theme Management (Light/Dark Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlElement = document.documentElement;

  const setTheme = (theme) => {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('zenith-theme', theme);
  };

  // Toggle Theme on Button Click
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  /* ==========================================================================
     Language Translation Dictionary & Logic (Client-side i18n)
     ========================================================================== */
  const viToEn = {
    // Nav menu
    "Tính năng": "Features",
    "Thông số": "Specs",
    "Trải nghiệm": "Simulator",
    "Bảng giá": "Pricing",
    "Hỏi đáp": "FAQ",
    "Liên hệ": "Contact",
    "Đăng ký thử nghiệm": "Request Access",

    // Hero Section
    "Giới thiệu Zenith AI v2.0 - Hiện đã hỗ trợ đa Agent": "Introducing Zenith AI v2.0 - Now supporting Multi-Agent",
    "Không gian làm việc": "Your Own",
    "Tích hợp AI Agent": "AI Agent Integrated",
    "của riêng bạn": "Workspace",
    "Zenith AI tích hợp các tài liệu, ghi chú và luồng công việc của bạn với các trợ lý AI độc lập. Hãy để các Agent nghiên cứu, viết code và tự động hóa quy trình trong khi bạn tập trung vào sáng tạo.": "Zenith AI integrates your documents, notes, and workflows with autonomous AI assistants. Let Agents research, code, and automate tasks while you focus on creativity.",
    "Trải nghiệm miễn phí": "Get Started Free",
    "Xem Demo tương tác": "Watch Interactive Demo",
    "Hài lòng từ lập trình viên": "Developer satisfaction",
    "Tăng tốc độ quy trình làm việc": "Workflow acceleration",

    // Mockup
    "Trung tâm": "Center",
    "Tài liệu": "Docs",
    "Quy trình": "Workflows",
    "Tự động hóa dự án": "Project Automation",
    "Đang cộng tác trực tiếp": "Live collaborating",
    "Agent \"Research-01\" đang thu thập dữ liệu thị trường và chuẩn bị báo cáo phân tích cạnh tranh...": "Agent \"Research-01\" is gathering market data and preparing competitive analysis report...",
    "Đang xử lý tài liệu 45/60": "Processing documents 45/60",
    "Ý tưởng tiếp thị": "Marketing Ideas",
    "Đã tạo 5 chiến dịch mẫu": "Generated 5 sample campaigns",
    "Refactor mã nguồn": "Code Refactoring",
    "Tối ưu hóa thành công 3 hàm": "Successfully optimized 3 functions",
    "Doanh số tăng trưởng": "Revenue Growth",
    "+32.8% trong tháng này": "+32.8% this month",

    // Social proof
    "Được tin dùng bởi các doanh nghiệp công nghệ hàng đầu thế giới": "Trusted by leading technology teams worldwide",

    // Features Section
    "Giải phóng sức mạnh của bạn": "Unleash Your Productivity",
    "Mọi công cụ bạn cần đều được tích hợp liền mạch trong một Canvas siêu tốc.": "Every tool you need, seamlessly integrated into a high-speed workspace canvas.",
    "AI Agents Tự Chủ": "Autonomous AI Agents",
    "Thiết lập các trợ lý AI để chúng tự nghiên cứu, tổng hợp tài liệu hoặc thực thi các nhiệm vụ dài hạn trong nền một cách tự động.": "Set up AI assistants to research, synthesize documents, or execute long-running tasks in the background autonomously.",
    "Không Gian Tích Hợp": "Integrated Workspace",
    "Kết nối ghi chú, tài liệu và mã nguồn tại một nơi duy nhất được bảo mật.": "Connect notes, documents, and codebases in a single secure environment.",
    "Tự Động Hóa Quy Trình": "Workflow Automation",
    "Xây dựng các trigger và action để tự động hóa mọi thao tác lặp đi lặp lại.": "Create triggers and actions to automate repetitive tasks instantly.",
    "Bảo Mật Tuyệt Đối": "Enterprise Security",
    "Dữ liệu được mã hóa đầu cuối và lưu trữ riêng tư theo chuẩn doanh nghiệp.": "End-to-end encrypted data with strict enterprise-grade privacy standards.",
    "Bản đồ kiến thức": "Interactive Knowledge Map",
    "Tự động liên kết các ghi chú, công việc và ý tưởng của bạn thành một sơ đồ trực quan, giúp bạn phát hiện những điểm kết nối ẩn sâu.": "Automatically links your notes, tasks, and ideas into a visual map, helping you uncover deep hidden connections.",
    "Bộ soạn thảo đa chế độ": "Multi-mode Editor",
    "Chuyển đổi liền mạch giữa soạn thảo văn bản, viết code và ghi chú nhanh bằng giọng nói. AI sẽ tự định dạng theo ý bạn.": "Seamlessly switch between text writing, coding, and voice notes. AI auto-formats to match your intent.",
    "Tự động hóa luồng việc": "Workflow Automation",
    "Kết nối hàng ngàn ứng dụng với Zenith AI bằng các câu lệnh ngôn ngữ tự nhiên, không cần cấu hình API phức tạp.": "Connect thousands of apps to Zenith AI using natural language commands, no complex API setups required.",

    // Specs Section
    "Thông Số Ấn Tượng": "Impressive Metrics",
    "Những con số minh chứng cho sức mạnh và hiệu quả của hệ thống": "Numbers that demonstrate the power and efficiency of our platform",
    "Thời gian hoạt động liên tục": "Uptime Guarantee",
    "Độ trễ phản hồi của Agent": "Agent Response Latency",
    "Nhiệm vụ đã hoàn thành": "Tasks Completed",
    "Mã hóa dữ liệu đầu cuối": "End-to-End Encryption",
    "Thông số kỹ thuật & Hiệu năng": "Technical Specs & Performance",
    "Kiến trúc hạ tầng vượt trội, tối ưu hóa cho tốc độ xử lý và tính bảo mật thông tin.": "Superior infrastructure architecture, optimized for execution speed and absolute data security.",
    "Độ trễ trung bình": "Average Latency",
    "Phản hồi và hoàn thành các tác vụ phức tạp với tốc độ cực nhanh nhờ hạ tầng mạng Edge toàn cầu.": "Respond and complete complex tasks at blistering speeds powered by our global Edge network.",
    "Độ tin cậy SLA": "SLA Reliability",
    "Hệ thống phân tán đa vùng bảo đảm dịch vụ luôn sẵn sàng phục vụ mọi lúc.": "Multi-region distributed system ensures services are always available around the clock.",
    "Mã hóa dữ liệu": "Data Encryption",
    "Bảo mật dữ liệu tuyệt đối với tiêu chuẩn AES-256 ở trạng thái nghỉ và đường truyền bảo mật SSL.": "Absolute security with AES-256 standard at rest and secure SSL transit.",
    "Tích hợp sẵn có": "Out-of-the-box Integrations",
    "Kết nối mượt mà với Slack, Notion, GitHub, Google Drive thông qua hệ thống khóa API an toàn.": "Seamlessly connect with Slack, Notion, GitHub, and Google Drive via secure API keys.",

    // Simulator Section
    "Trải Nghiệm Trực Quan": "Interactive Simulator",
    "Tương tác trực tiếp với các Agent để cảm nhận sức mạnh tự động hóa": "Interact directly with Agents to experience the power of automation",
    "Nghiên cứu thị trường": "Market Research",
    "Yêu cầu Agent thu thập thông tin...": "Ask Agent to gather insights...",
    "Viết và tối ưu code": "Code Optimization",
    "Yêu cầu Agent tối ưu hóa...": "Ask Agent to refactor code...",
    "Tự động hóa luồng việc": "Workflow Sync",
    "Thiết lập quy trình đồng bộ...": "Set up synchronization...",
    "Chờ lệnh...": "Waiting for command...",
    "Nhập lệnh của bạn ở đây (ví dụ: 'Nghiên cứu đối thủ')...": "Enter your command here (e.g., 'Analyze competitors')...",
    "Xem cách nó vận hành": "See How It Works",
    "Chọn một câu lệnh bên dưới để xem cách Zenith AI tự động xử lý công việc.": "Select a command below to see how Zenith AI automates tasks.",
    "Viết bài quảng cáo": "Write Ad Copy",
    "Cho sản phẩm mới": "For new product",
    "Tối ưu hóa Code": "Code Optimization",
    "Sửa lỗi rò rỉ bộ nhớ": "Fix memory leak",
    "Phân tích xu hướng SaaS": "Analyze SaaS trends",
    "Tự viết Prompt": "Write Your Own Prompt",
    "Gõ câu lệnh tùy ý bạn": "Type custom commands",
    "Đang chuẩn bị câu lệnh...": "Preparing command...",
    "Nhập lệnh của bạn (Ví dụ: 'viết bài cafe', 'tối ưu hàm') rồi ấn Enter...": "Enter your command (e.g. 'write ad', 'optimize function') and press Enter...",

    // Testimonials
    "Ý Kiến Khách Hàng": "Customer Testimonials",
    "Hàng ngàn lập trình viên và doanh nghiệp đã thay đổi cách làm việc": "Thousands of developers and businesses have changed how they work",
    "“Zenith AI đã thay đổi hoàn toàn cách chúng tôi phát triển dự án. Các Agent tự động viết code kiểm thử giúp tiết kiệm hàng chục giờ làm việc mỗi tuần.”": "“Zenith AI completely transformed our development lifecycle. The autonomous agents write test suites saving us dozen hours every week.”",
    "Trưởng nhóm Công nghệ tại Octane": "Tech Lead at Octane",
    "“Khả năng nghiên cứu thông tin của Agent rất đáng kinh ngạc. Chỉ trong vài phút, chúng tôi có được báo cáo phân tích đối thủ chi tiết và chuẩn xác.”": "“The research capabilities of the agents are unbelievable. In just a few minutes, we get a highly detailed and accurate competitor analysis report.”",
    "Nhà sáng lập Vortex Studio": "Founder of Vortex Studio",
    "“Giao diện kéo thả dễ dùng, tích hợp mượt mà. Đội ngũ của tôi giờ đây có thể tập trung vào các ý tưởng đột phá thay vì các tác vụ lặp lại.”": "“Easy drag-and-drop interface, smooth integrations. My team can now focus on breakthrough ideas instead of repeating manual tasks.”",
    "Quản lý Dự án tại Prism": "Project Manager at Prism",
    "Nhận xét từ khách hàng": "Customer Reviews",
    "Xem cách người dùng trên toàn thế giới đột phá năng suất với Zenith AI.": "See how users worldwide are skyrocketing their productivity with Zenith AI.",
    "\"Zenith AI thực sự đã thay đổi cách tôi lập trình và nghiên cứu. Tính năng Bản đồ Kiến thức tự động giúp tôi liên kết hàng trăm tài liệu mà không tốn công sức nào.\"": "\"Zenith AI has completely transformed the way I code and research. The automated Knowledge Map feature lets me link hundreds of documents effortlessly.\"",
    "\"Các AI Agent tự vận hành thực sự đáng kinh ngạc. Tôi có thể giao cho Agent nghiên cứu đối thủ cạnh tranh trong đêm và nhận lại báo cáo chi tiết vào sáng hôm sau.\"": "\"The autonomous AI Agents are absolutely mind-blowing. I can delegate competitor research to an Agent overnight and receive a detailed report the next morning.\"",
    "\"Thiết kế giao diện Dark Mode cực kỳ sang trọng, trải nghiệm người dùng mượt mà chưa từng thấy ở các công cụ AI khác. Đáng giá đến từng đồng!\"": "\"The Dark Mode interface design is extremely premium, and the user experience is smoother than any other AI tools I have used. Worth every single penny!\"",

    // Pricing Section
    "Bảng Giá Linh Hoạt": "Flexible Pricing",
    "Lựa chọn gói dịch vụ phù hợp với nhu cầu phát triển của bạn": "Choose the plan that fits your growth needs",
    "Tháng": "Monthly",
    "Năm": "Yearly",
    "Tiết kiệm 20%": "Save 20%",
    "Cá Nhân": "Personal",
    "Dành cho nhà phát triển cá nhân muốn trải nghiệm sức mạnh AI.": "For individual developers to experience the power of AI.",
    "Miễn Phí": "Free",
    "Bắt đầu ngay": "Get Started",
    "1 AI Agent hoạt động": "1 Active AI Agent",
    "Không gian làm việc cơ bản": "Basic Workspace",
    "100 lệnh mỗi tháng": "100 commands / month",
    "Bảo mật tiêu chuẩn": "Standard Security",
    "Chuyên Nghiệp": "Pro",
    "Hoàn hảo cho các chuyên gia và đội ngũ nhỏ tối ưu hóa hiệu suất.": "Perfect for professionals and small teams optimizing efficiency.",
    "Chọn gói Pro": "Choose Pro",
    "Không giới hạn AI Agent": "Unlimited AI Agents",
    "Không gian làm việc nâng cao": "Advanced Workspace",
    "Không giới hạn lệnh": "Unlimited commands",
    "Hỗ trợ ưu tiên 24/7": "Priority 24/7 Support",
    "Doanh Nghiệp": "Enterprise",
    "Giải pháp tùy chỉnh toàn diện cho các tổ chức yêu cầu bảo mật cao.": "Comprehensive tailored solutions for companies requiring high security.",
    "Liên hệ chúng tôi": "Contact Us",
    "Agent tùy chỉnh riêng": "Custom Dedicated Agents",
    "Tích hợp hệ thống nội bộ": "Internal Systems Integration",
    "Bảo mật & Cam kết SLA riêng": "Dedicated Security & SLA",
    "Quản lý tài khoản riêng biệt": "Dedicated Account Manager",
    "Gói dịch vụ linh hoạt": "Flexible Plans",
    "Bắt đầu miễn phí và nâng cấp khi bạn cần tự động hóa nâng cao.": "Start for free and upgrade when you need advanced automation.",
    "🔑 Nhận Mã Kích Hoạt 14 Ngày Dùng Thử Pro": "🔑 Get a 14-Day Pro Trial Activation Key",
    "Hệ thống tự động cấp mã ngẫu nhiên cho bản dùng thử Pro. Giới hạn 1 key/lần click.": "The system automatically issues a random code for the Pro trial. Limit 1 key per click.",
    "Cá nhân": "Personal",
    "Hoàn hảo cho người mới bắt đầu tối ưu hóa năng suất.": "Perfect for beginners looking to optimize their productivity.",
    "Không gian làm việc Canvas cơ bản": "Basic Canvas Workspace",
    "Tích hợp 1 AI Agent cơ bản": "1 Integrated Basic AI Agent",
    "100 lượt truy vấn AI mỗi tháng": "100 AI queries per month",
    "Khuyên dùng": "Recommended",
    "Chuyên nghiệp": "Pro",
    "Dành cho cá nhân và nhóm nhỏ muốn tự động hóa toàn diện.": "For individuals and small teams looking for full automation.",
    "Không giới hạn Canvas và Tài liệu": "Unlimited Canvas and Documents",
    "Hỗ trợ 5 AI Agents chạy song song": "Supports 5 AI Agents running in parallel",
    "Không giới hạn lượt truy vấn AI": "Unlimited AI queries",
    "Tích hợp hơn 1,000+ ứng dụng bên thứ ba": "Integrations with 1,000+ third-party apps",
    "Nâng cấp Pro": "Upgrade to Pro",
    "Doanh nghiệp": "Enterprise",
    "Các giải pháp tùy biến cho tổ chức cần tính bảo mật tối đa.": "Customized solutions for organizations requiring maximum security.",
    "Mọi tính năng của gói Pro": "All features of the Pro plan",
    "Không giới hạn số lượng AI Agents": "Unlimited number of AI Agents",
    "Hỗ trợ lưu trữ dữ liệu Private Cloud / On-Premise": "Supports Private Cloud / On-Premise data storage",
    "Hỗ trợ kỹ thuật 24/7 chuyên biệt": "Dedicated 24/7 technical support",
    "Liên hệ kinh doanh": "Contact Sales",

    // FAQ Section
    "Câu Hỏi Thường Gặp": "Frequently Asked Questions",
    "Giải đáp các thắc mắc phổ biến về Zenith AI": "Common questions and answers about Zenith AI",
    "Zenith AI hoạt động như thế nào?": "How does Zenith AI work?",
    "Zenith AI sử dụng các mô hình ngôn ngữ lớn tiên tiến nhất kết hợp với hệ thống Vector Database nội bộ để hiểu ngữ cảnh tài liệu của bạn, từ đó lập kế hoạch và thực thi công việc một cách độc lập.": "Zenith AI uses advanced LLMs combined with internal Vector Databases to understand document context, allowing agents to plan and execute tasks autonomously.",
    "Dữ liệu của tôi có được bảo mật không?": "Is my data secure?",
    "Có, dữ liệu của bạn được mã hóa 256-bit khi truyền tải và lưu trữ. Chúng tôi cam kết không sử dụng dữ liệu của bạn để huấn luyện mô hình AI công cộng.": "Yes, your data is protected with 256-bit encryption during transit and storage. We guarantee that your data is never used to train public AI models.",
    "Tôi có thể tích hợp với các công cụ khác không?": "Can I integrate with other tools?",
    "Hoàn toàn được. Zenith AI hỗ trợ tích hợp với Slack, GitHub, Notion, Jira và các API tùy chỉnh khác để tự động hóa hoàn toàn quy trình làm việc của bạn.": "Absolutely. Zenith AI supports integrations with Slack, GitHub, Notion, Jira, and custom APIs to completely automate your workflow.",
    "Câu hỏi thường gặp": "Frequently Asked Questions",
    "Giải đáp các thắc mắc phổ biến nhất về Zenith AI.": "Answers to the most common questions about Zenith AI.",
    "Zenith AI hoạt động dựa trên cấu trúc các Agent thông minh. Bạn tạo các file tài liệu hoặc ghi chú, sau đó chỉ định Agent (ví dụ: Agent nghiên cứu, Agent lập trình). Agent này có khả năng đọc hiểu ngữ cảnh của không gian làm việc và tự động thực hiện các câu lệnh phức tạp do bạn đưa ra.": "Zenith AI runs on intelligent Agents. You create document files or notes, then assign an Agent (e.g. Research Agent, Coder Agent). This Agent is capable of understanding workspace context and executing complex commands on your behalf.",
    "An toàn dữ liệu là ưu tiên hàng đầu của chúng tôi. Tất cả tài liệu đều được mã hóa hoàn toàn ở trạng thái nghỉ và trong quá trình truyền tải. Với gói Doanh nghiệp, chúng tôi hỗ trợ triển khai trên đám mây riêng tư của bạn hoặc máy chủ nội bộ (on-premise) để kiểm soát dữ liệu tuyệt đối.": "Data security is our absolute priority. All documents are fully encrypted at rest and in transit. For the Enterprise plan, we support deployment on your private cloud or on-premise servers for complete data control.",
    "Tôi có thể hủy gói dịch vụ bất kỳ lúc nào không?": "Can I cancel my plan at any time?",
    "Có, hoàn toàn được. Bạn có thể thay đổi hoặc hủy đăng ký bất kỳ lúc nào ngay trong mục quản lý tài khoản của mình. Khi bạn hủy, bạn vẫn giữ quyền truy cập vào các tính năng Pro cho đến hết chu kỳ thanh toán hiện tại.": "Yes, absolutely. You can modify or cancel your subscription at any time within your account settings. Upon cancellation, you will retain access to Pro features until the end of your billing cycle.",
    "Zenith AI có hỗ trợ ngôn ngữ tiếng Việt tốt không?": "Does Zenith AI support Vietnamese well?",
    "Chắc chắn rồi. Các mô hình ngôn ngữ lớn làm nền tảng cho Zenith AI đều được tối ưu hóa xuất sắc cho tiếng Việt, giúp bạn viết tài liệu, tạo kịch bản, viết code hoặc ra lệnh cho Agent bằng tiếng Việt một cách tự nhiên và chính xác nhất.": "Certainly. The LLMs powering Zenith AI are highly optimized for Vietnamese, enabling you to write documents, draft scripts, code, or command Agents in Vietnamese naturally and accurately.",

    // Contact Section
    "Bạn có câu hỏi? Hãy gửi tin nhắn cho đội ngũ hỗ trợ của chúng tôi": "Have questions? Drop a message for our support team",
    "Điện thoại": "Phone",
    "Email": "Email",
    "Địa chỉ": "Address",
    "Gửi Tin Nhắn": "Send Message",
    "Họ và Tên": "Full Name",
    "Địa chỉ Email": "Email Address",
    "Chủ đề quan tâm": "Topic of Interest",
    "Tư vấn gói dịch vụ": "Sales Consulting",
    "Hỗ trợ kỹ thuật": "Technical Support",
    "Hợp tác kinh doanh": "Business Partnership",
    "Nội dung tin nhắn": "Message Content",
    "Nhập nội dung cần hỗ trợ...": "Type your message...",
    "Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.": "Message sent successfully! We will get back to you as soon as possible.",
    "Vui lòng điền đầy đủ các thông tin bắt buộc.": "Please fill in all required fields.",
    "Bắt đầu hành trình của bạn ngay hôm nay": "Start Your Journey Today",
    "Hãy liên hệ với chúng tôi để nhận bản dùng thử miễn phí 14 ngày của gói Pro hoặc đặt lịch demo tùy chỉnh cho doanh nghiệp của bạn.": "Get in touch with us to receive a 14-day free trial of the Pro plan, or schedule a customized demo for your business.",
    "Gửi email trực tiếp": "Email Us Directly",
    "Văn phòng đại diện": "Headquarters",
    "Tầng 25, Keangnam Landmark, Hà Nội, Việt Nam": "25th Floor, Keangnam Landmark, Hanoi, Vietnam",
    "Họ và tên": "Full Name",
    "Bạn đang quan tâm đến gói nào?": "Which plan are you interested in?",
    "Gói Chuyên nghiệp (Pro) - Bản dùng thử": "Professional (Pro) Plan - Trial Version",
    "Gói Doanh nghiệp (Enterprise)": "Enterprise Plan",
    "Tư vấn khác / Ý kiến đóng góp": "Other Inquiries / Feedback",
    "Tin nhắn của bạn": "Your Message",
    "Hãy viết yêu cầu cụ thể hoặc câu hỏi của bạn tại đây...": "Please write your specific request or question here...",
    "Đăng ký thông tin": "Submit Registration",

    // Footer
    "Không gian làm việc thông minh tích hợp AI Agent độc lập, cách mạng hóa hiệu suất làm việc của bạn.": "Smart workspace integrated with autonomous AI Agents, revolutionizing your productivity.",
    "Sản phẩm": "Product",
    "Công ty": "Company",
    "Pháp lý": "Legal",
    "Blog công nghệ": "Tech Blog",
    "Tuyển dụng": "Careers",
    "Chính sách bảo mật": "Privacy Policy",
    "Điều khoản dịch vụ": "Terms of Service",
    "© 2026 Zenith AI. Tất cả các quyền được bảo lưu.": "© 2026 Zenith AI. All rights reserved.",
    "/tháng": "/mo",
    "/năm": "/yr",
    "Thêm 1 AI Agent (+ $5/tháng)": "Add 1 AI Agent (+ $5/mo)",
    "Thêm 10GB lưu trữ đám mây (+ $10/tháng)": "Add 10GB Cloud Storage (+ $10/mo)",
    "Hỗ trợ kỹ thuật ưu tiên 24/7 (+ $15/tháng)": "Priority 24/7 Tech Support (+ $15/mo)",
    "Không gian làm việc thông minh tích hợp trí tuệ nhân tạo, thúc đẩy năng suất và giải phóng tiềm năng sáng tạo của bạn.": "Smart workspace integrated with artificial intelligence, boosting productivity and unleashing your creative potential.",
    "Trình mô phỏng": "Simulator",
    "Về chúng tôi": "About Us",
    "Điều khoản sử dụng": "Terms of Use",
    "Chính sách Cookie": "Cookie Policy",
    "© 2026 Zenith AI. Bảo lưu mọi quyền.": "© 2026 Zenith AI. All rights reserved.",
    "Thiết kế bởi Đội ngũ Zenith AI": "Designed by Zenith AI Team",

    // Cart Drawer
    "Giỏ Hàng Của Bạn": "Your Shopping Cart",
    "Tiện ích mở rộng đề xuất": "Recommended Addons",
    "Thêm 100,000 từ khóa phân tích / tháng (+$9/tháng)": "Extra 100k analytics keywords / mo (+$9/mo)",
    "Bảo mật vân tay / khóa cứng vật lý (+$15/tháng)": "Biometric security / physical key (+$15/mo)",
    "Tạm tính": "Subtotal",
    "Tiện ích thêm": "Addons subtotal",
    "Tổng thanh toán": "Grand Total",
    "Thanh Toán Ngay": "Checkout Now",
    "Tiếp tục xem sản phẩm": "Continue Shopping",
    "Gói dịch vụ yêu thích": "Favorite Plans",
    "Lịch sử xem gói": "Viewing History",
    "Chưa có gói nào trong lịch sử xem.": "No plans in viewing history.",
    "Chưa có gói nào được yêu thích.": "No favorite plans added.",
    "Đã thêm vào giỏ hàng!": "Added to cart!",
    "Đã xóa khỏi giỏ hàng!": "Removed from cart!",
    "Đã thêm vào mục yêu thích!": "Added to favorites!",
    "Đã xóa khỏi mục yêu thích!": "Removed from favorites!",
    "Đang xử lý thanh toán...": "Processing checkout...",
    "Thanh toán thành công! Cảm ơn bạn.": "Checkout successful! Thank you.",
    "🛒 Giỏ Hàng Gói Dịch Vụ": "🛒 Service Plan Cart",
    "Gói dịch vụ": "Service Plan",
    "Chọn thêm tiện ích (Add-ons):": "Select Add-ons:",
    "Tạm tính:": "Subtotal:",
    "Tổng cộng:": "Grand Total:",
    "Lưu gói yêu thích": "Save Favorite Plan",
    "Tiến hành đăng ký 🚀": "Proceed to Register 🚀",
    "Gói đã xem gần đây:": "Recently Viewed Plans:",
    "Gói yêu thích của bạn:": "Your Favorite Plans:",

    // Chatbot
    "Trợ lý Zenith AI": "Zenith AI Assistant",
    "Trực tuyến": "Online",
    "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?": "Hello! How can I help you today?",
    "Bảng giá các gói dịch vụ thế nào?": "What are the pricing plans?",
    "Tôi có thể dùng thử miễn phí không?": "Can I try for free?",
    "Liên hệ hỗ trợ kỹ thuật ở đâu?": "Where is tech support?",
    "Nhập tin nhắn...": "Type a message...",
    "Đang trả lời...": "Replying...",
    "Đang trực tuyến": "Online",
    "Xin chào! Tôi là trợ lý ảo Zenith AI. Bạn cần tư vấn thông tin gì về sản phẩm?": "Hello! I am Zenith AI Assistant. What information do you need about our products?",
    "🤖 Zenith AI là gì?": "🤖 What is Zenith AI?",
    "💰 Giá các gói thế nào?": "💰 Pricing plans?",
    "🔒 Có bảo mật không?": "🔒 Is it secure?",
    "Nhập câu hỏi của bạn...": "Type your question...",

    // Debug tooltips
    "Bật Debug hành vi": "Enable behavior debug",
    "Xóa nhật ký": "Clear log"
  };

  const enToVi = {};
  for (const key in viToEn) {
    enToVi[viToEn[key]] = key;
  }

  let currentLang = localStorage.getItem('zenith-lang') || 'vi';

  const translateDOM = (node, dictionary) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const trimmed = node.nodeValue.trim();
      if (dictionary[trimmed]) {
        const leading = node.nodeValue.match(/^\s*/)[0];
        const trailing = node.nodeValue.match(/\s*$/)[0];
        node.nodeValue = leading + dictionary[trimmed] + trailing;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (tag !== 'script' && tag !== 'style' && tag !== 'svg') {
        // Translate placeholders
        if (node.placeholder) {
          const trimmed = node.placeholder.trim();
          if (dictionary[trimmed]) {
            node.placeholder = dictionary[trimmed];
          }
        }
        // Translate title attributes (tooltips)
        if (node.title) {
          const trimmed = node.title.trim();
          if (dictionary[trimmed]) {
            node.title = dictionary[trimmed];
          }
        }
        // Translate custom data attributes
        if (node.getAttribute('data-question')) {
          const dq = node.getAttribute('data-question').trim();
          if (dictionary[dq]) {
            node.setAttribute('data-question', dictionary[dq]);
          }
        }
        node.childNodes.forEach(child => translateDOM(child, dictionary));
      }
    }
  };

  const switchLanguage = (lang) => {
    const dictionary = lang === 'en' ? viToEn : enToVi;
    translateDOM(document.body, dictionary);
    currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('zenith-lang', lang);
    
    // Update button text to display the current active language
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.textContent = lang.toUpperCase();
    }
  };

  // Toggle Language on Button Click
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const nextLang = currentLang === 'vi' ? 'en' : 'vi';
      switchLanguage(nextLang);
    });
  }

  // Khởi tạo ngôn ngữ ban đầu
  const langBtnInit = document.getElementById('lang-toggle-btn');
  if (langBtnInit) {
    langBtnInit.textContent = currentLang.toUpperCase();
  }
  if (currentLang === 'en') {
    setTimeout(() => switchLanguage('en'), 50);
  }


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
      skeleton.style.display = 'none';
      skeleton.setAttribute('aria-hidden', 'true');
      content.style.display = 'grid';
      content.style.opacity = '1';
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
      
      // Update cached height after FAQ transition completes
      setTimeout(updateCachedDocHeight, 350);
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

  const getSimulatorData = () => {
    return {
      marketing: {
        agentName: 'Copywriter-Agent',
        userInput: currentLang === 'vi' 
          ? 'Viết bài quảng cáo sản phẩm Zenith AI bản v2.0 cho bài đăng Facebook' 
          : 'Write FB ad copy for Zenith AI v2.0 product launch',
        logs: [
          { type: 'system', text: 'Initializing Agent: Copywriter-Agent v2.0...' },
          { type: 'system', text: 'Reading product documentation (index.html, style.css)...' },
          { type: 'info', text: currentLang === 'vi' 
            ? 'Phân tích điểm nổi bật: Không gian cộng tác AI, Bản đồ kiến thức tự động, Agent chạy ngầm.' 
            : 'Brainstorming key Selling Points: AI-collaborative canvas, Auto-knowledge graphs, Background agents.' },
          { type: 'info', text: currentLang === 'vi' 
            ? 'Đang tạo nội dung quảng cáo tối ưu cho Nhà phát triển & Người sáng lập...' 
            : 'Generating advertising copy tailored for Tech Professionals & Founders...' },
          { type: 'code', text: currentLang === 'vi' ? `✨ GIỚI THIỆU ZENITH AI v2.0 - KHÔNG GIAN LÀM VIỆC TỰ ĐỘNG ✨

Bạn đã sẵn sàng nhân 10 hiệu suất làm việc của mình chưa? 🚀
Zenith AI không chỉ là nơi ghi chép, đó là không gian tích hợp các AI Agent tự vận hành:
- 💡 Tự động liên kết ý tưởng thành Bản đồ kiến thức trực quan.
- 🤖 Giao việc cho các Agent nghiên cứu độc lập trong lúc ngủ.
- 💻 Code, viết lách, dịch thuật mượt mượt với Markdown & Code Editor chuyên sâu.

👉 Đăng ký thử nghiệm Pro miễn phí ngay hôm nay!` : `✨ INTRODUCING ZENITH AI v2.0 - AUTONOMOUS WORKSPACE ✨

Ready to boost your productivity by 10x? 🚀
Zenith AI is more than notes, it is a workspace with self-running AI Agents:
- 💡 Automatically link ideas into visual Knowledge Maps.
- 🤖 Offload tasks to Agents that work independently while you sleep.
- 💻 Code, write, and translate smoothly with Markdown & Code Editor.

👉 Register for free Pro trial today!` },
          { type: 'success', text: currentLang === 'vi' 
            ? 'Nhiệm vụ hoàn thành xuất sắc! Bài viết quảng cáo đã được lưu vào files/fb-ad-v2.txt.' 
            : 'Task completed successfully! Ad copy written and saved to files/fb-ad-v2.txt.' }
        ]
      },
      refactor: {
        agentName: 'CodeRefactor-Agent',
        userInput: currentLang === 'vi' 
          ? 'Kiểm tra lỗi rò rỉ bộ nhớ (memory leak) trong hàm xử lý sự kiện cuộn trang' 
          : 'Check memory leak in scroll event listener handler',
        logs: [
          { type: 'system', text: 'Initializing Agent: CodeRefactor-Agent v1.8...' },
          { type: 'system', text: 'Scanning workspace directory for event listeners...' },
          { type: 'warning', text: currentLang === 'vi' 
            ? 'Phát hiện window.addEventListener("scroll") không có removeEventListener tương ứng trong widgets.' 
            : 'Found window.addEventListener("scroll") without matching removeEventListener in active widgets.' },
          { type: 'info', text: currentLang === 'vi' 
            ? 'Phân tích file app.js dòng 24. Đang áp dụng thiết kế debouncing...' 
            : 'Analyzing file app.js line 24. Applying debouncing design pattern...' },
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
          { type: 'success', text: currentLang === 'vi' 
            ? 'Đã áp dụng tối ưu hóa! Hiệu năng cuộn trang tăng thêm 35%.' 
            : 'Optimization applied! Performance improved by 35% under scrolls.' }
        ]
      },
      research: {
        agentName: 'MarketResearch-Agent',
        userInput: currentLang === 'vi' 
          ? 'Phân tích xu hướng thị trường SaaS AI trong năm 2026' 
          : 'Analyze SaaS AI market trends in 2026',
        logs: [
          { type: 'system', text: 'Initializing Agent: MarketResearch-Agent v2.5...' },
          { type: 'system', text: 'Connecting to search engine tools and indexing latest documents...' },
          { type: 'info', text: 'Searching keywords: "SaaS AI trends 2026", "AI Productivity tools growth"...' },
          { type: 'info', text: currentLang === 'vi' 
            ? 'Tổng hợp kết quả nghiên cứu từ các báo cáo McKinsey & Gartner...' 
            : 'Summarizing key findings from McKinsey & Gartner reports...' },
          { type: 'code', text: currentLang === 'vi' ? `XU HƯỚNG THỊ TRƯỜNG SAAS AI 2026:
1. Thị phần công cụ AI Agent tự chủ (Autonomous Agents) tăng trưởng 42% y-o-y.
2. 78% lập trình viên chuyển sang dùng Canvas Workspace thay cho Text-editor truyền thống.
3. Chú trọng bảo mật dữ liệu: On-premise AI hosting trở thành tiêu chuẩn bắt buộc cho doanh nghiệp.` : `SAAS AI MARKET TRENDS 2026:
1. Market share of autonomous AI Agents grew by 42% y-o-y.
2. 78% of developers switched to Canvas Workspaces over traditional Text-editors.
3. Privacy focus: On-premise AI hosting becomes an absolute standard for enterprises.` },
          { type: 'success', text: currentLang === 'vi' 
            ? 'Báo cáo nghiên cứu hoàn thành. Đã xuất ra file reports/saas-trends-2026.pdf.' 
            : 'Research report finished. Exported to reports/saas-trends-2026.pdf.' }
        ]
      }
    };
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
    
    const data = getSimulatorData()[key];
    if (!data) return;

    agentNameEl.textContent = data.agentName;
    simulatedUserInput.textContent = currentLang === 'vi' ? 'Khởi chạy Agent...' : 'Initializing Agent...';
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
  const simulatorCustomInput = document.getElementById('simulator-custom-input');

  promptButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Set active state
      promptButtons.forEach(b => b.classList.remove('active'));
      const activeBtn = e.currentTarget;
      activeBtn.classList.add('active');

      const promptKey = activeBtn.getAttribute('data-prompt');
      
      if (promptKey === 'custom') {
        clearAllSimulations();
        agentNameEl.textContent = 'Custom-Agent';
        simulatedUserInput.style.display = 'none';
        
        if (simulatorCustomInput) {
          simulatorCustomInput.style.display = 'inline-block';
          simulatorCustomInput.value = '';
          setTimeout(() => simulatorCustomInput.focus(), 50);
        }
        
        terminalChat.innerHTML = '';
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.style.color = '#8b5cf6';
        line.innerHTML = currentLang === 'vi'
          ? `<span class="terminal-prefix">[sys]</span> Chế độ Tự viết Prompt đã sẵn sàng. Hãy gõ bất kỳ yêu cầu nào ở dòng lệnh bên dưới (ví dụ: 'viết bài cafe', 'tối ưu code') rồi bấm Enter!`
          : `<span class="terminal-prefix">[sys]</span> Custom Prompt Mode is ready. Type any request at the command line below (e.g. 'write blog post', 'optimize code') and press Enter!`;
        terminalChat.appendChild(line);
      } else {
        if (simulatorCustomInput) {
          simulatorCustomInput.style.display = 'none';
        }
        simulatedUserInput.style.display = 'inline-block';
        runSimulation(promptKey);
      }
    });
  });

  // Xử lý khi nhấn Enter để chạy câu lệnh Custom
  if (simulatorCustomInput) {
    simulatorCustomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const userPrompt = simulatorCustomInput.value.trim();
        if (!userPrompt) return;

        simulatorCustomInput.value = '';
        terminalChat.innerHTML = ''; // Clear terminal

        // Hiển thị câu lệnh của người dùng
        const userLine = document.createElement('div');
        userLine.className = 'terminal-line';
        userLine.innerHTML = `<span class="terminal-prefix" style="color: #a855f7;">&gt;</span> <span class="terminal-output" style="color: #e2e8f0; font-weight: bold;">${userPrompt}</span>`;
        terminalChat.appendChild(userLine);

        // Hiển thị thông báo hệ thống bắt đầu chạy
        const sysLine = document.createElement('div');
        sysLine.className = 'terminal-line';
        sysLine.style.color = '#a1a1aa';
        sysLine.innerHTML = currentLang === 'vi'
          ? `<span class="terminal-prefix">[sys]</span> Đang biên dịch câu lệnh và phân tích ngữ cảnh không gian làm việc...`
          : `<span class="terminal-prefix">[sys]</span> Compiling command and analyzing workspace context...`;
        terminalChat.appendChild(sysLine);

        // Phân tích từ khóa để trả về kết quả tương ứng
        let agentName = 'ZenithAI-Agent';
        let logs = [];
        const textLower = userPrompt.toLowerCase();

        if (textLower.includes('code') || textLower.includes('tối ưu') || textLower.includes('refactor') || textLower.includes('lập trình') || textLower.includes('hàm') || textLower.includes('sửa') || textLower.includes('program') || textLower.includes('optimize') || textLower.includes('fix')) {
          agentName = 'Coder-Agent';
          logs = currentLang === 'vi' ? [
            { type: 'system', text: 'Initializing Agent: Coder-Agent v2.1...' },
            { type: 'info', text: 'Đang quét phân tích cấu trúc cú pháp AST...' },
            { type: 'code', text: `// KẾT QUẢ TỐI ƯU HÀM CHO CÂU LỆNH: "${userPrompt}"
function findDuplicate(arr) {
  const seen = new Set();
  for (let num of arr) {
    if (seen.has(num)) return num;
    seen.add(num);
  }
  return null;
}` },
            { type: 'success', text: 'Đã hoàn tất! Hàm code được tối ưu hóa thành công sang độ phức tạp O(N).' }
          ] : [
            { type: 'system', text: 'Initializing Agent: Coder-Agent v2.1...' },
            { type: 'info', text: 'Scanning and analyzing AST syntax structure...' },
            { type: 'code', text: `// OPTIMIZED CODE RESULT FOR COMMAND: "${userPrompt}"
function findDuplicate(arr) {
  const seen = new Set();
  for (let num of arr) {
    if (seen.has(num)) return num;
    seen.add(num);
  }
  return null;
}` },
            { type: 'success', text: 'Completed! Code optimized successfully to O(N) complexity.' }
          ];
        } else if (textLower.includes('viết') || textLower.includes('bài') || textLower.includes('quảng cáo') || textLower.includes('fb') || textLower.includes('facebook') || textLower.includes('marketing') || textLower.includes('sales') || textLower.includes('write') || textLower.includes('ad')) {
          agentName = 'Copywriter-Agent';
          logs = currentLang === 'vi' ? [
            { type: 'system', text: 'Initializing Agent: Copywriter-Agent v2.0...' },
            { type: 'info', text: 'Đang lên dàn bài và định hình văn phong quảng cáo thu hút...' },
            { type: 'code', text: `✨ BÀI VIẾT QUẢNG CÁO TẠO THEO YÊU CẦU: "${userPrompt}" ✨

🚀 Không gian làm việc thông minh thế hệ mới - Zenith AI!
Giải phóng 90% thời gian xử lý các tác vụ lặp đi lặp lại nhờ trợ lý AI tự vận hành:
- Tự viết code, tối ưu hàm hiệu suất cao.
- Tự viết content quảng cáo & nghiên cứu đối thủ cạnh tranh.
👉 Click nút dùng thử 14 ngày Pro miễn phí ngay!` },
            { type: 'success', text: 'Tạo bài quảng cáo thành công và lưu vào thư mục output/custom-ad.txt.' }
          ] : [
            { type: 'system', text: 'Initializing Agent: Copywriter-Agent v2.0...' },
            { type: 'info', text: 'Outlining and drafting highly converting ad copy...' },
            { type: 'code', text: `✨ GENERATED AD COPY FOR REQUEST: "${userPrompt}" ✨

🚀 Next-generation smart workspace - Zenith AI!
Free 90% of your time spent on repetitive tasks using autonomous AI assistants:
- Auto-write code, optimize functions with high performance.
- Auto-write marketing copy & research competitors.
👉 Click button to try 14 days of Pro for free today!` },
            { type: 'success', text: 'Ad copy written successfully and saved to output/custom-ad.txt.' }
          ];
        } else {
          agentName = 'ZenithAI-Agent';
          logs = currentLang === 'vi' ? [
            { type: 'system', text: 'Initializing Agent: ZenithAI-Agent...' },
            { type: 'info', text: `Đang khởi chạy luồng tự động hóa cho yêu cầu: "${userPrompt}"...` },
            { type: 'info', text: 'Đang kết xuất và tổng hợp kết quả...' },
            { type: 'code', text: `[ZenithAI-Agent] ĐÃ NHẬN LỆNH: "${userPrompt}"
- Tác vụ: Đã nhận diện và lưu vết lịch sử hệ thống.
- Tiến độ: 100% hoàn thành.
- Kết quả: Đã tự động hóa thành công.` },
            { type: 'success', text: 'Tác vụ chạy thử nghiệm kết thúc tốt đẹp!' }
          ] : [
            { type: 'system', text: 'Initializing Agent: ZenithAI-Agent...' },
            { type: 'info', text: `Initializing automated workflow for request: "${userPrompt}"...` },
            { type: 'info', text: 'Aggregating and compiling results...' },
            { type: 'code', text: `[ZenithAI-Agent] RECEIVED COMMAND: "${userPrompt}"
- Task: Identified and logged in system history.
- Progress: 100% completed.
- Result: Automated successfully.` },
            { type: 'success', text: 'Trial execution completed successfully!' }
          ];
        }

        agentNameEl.textContent = agentName;

        // Chạy logs giả lập
        setTimeout(() => {
          playTerminalLogs(logs);
        }, 1000);
      }
    });
  }

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
      statusMsg.textContent = currentLang === 'vi' 
        ? 'Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)' 
        : 'Please fill in all required fields (*)';
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
      submitBtnText.textContent = currentLang === 'vi' ? 'Đăng ký thông tin' : 'Submit Information';
      submitBtnSpinner.classList.add('hidden');
 
      statusMsg.className = 'form-status-msg success';
      statusMsg.textContent = currentLang === 'vi' 
        ? `Cảm ơn ${name}! Đăng ký của bạn đã được ghi nhận thành công. Mã kích hoạt 14 ngày dùng thử Pro đã được gửi về email ${email}.` 
        : `Thank you ${name}! Your registration was successfully recorded. A 14-day Pro trial activation key has been sent to ${email}.`;
      
      showTrackerToast(currentLang === 'vi' 
        ? `[Đăng ký] Đã lưu thông tin đăng ký của ${name} thành công!` 
        : `[Registration] Saved registration info for ${name} successfully!`);
 
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
    const periodTrans = currentLang === 'vi' 
      ? currentBillingPeriod 
      : (currentBillingPeriod === '/tháng' ? '/mo' : '/yr');
    cartTotalEl.textContent = `$${total}${periodTrans}`;
  };

  const openCartDrawer = (planName, basePrice, isYearly) => {
    currentPlanName = planName;
    currentBasePrice = basePrice;
    currentBillingPeriod = isYearly ? '/năm' : '/tháng';
    
    const planNameTrans = currentLang === 'vi' ? planName : (viToEn[planName] || planName);
    const payPeriodTrans = currentLang === 'vi' 
      ? (isYearly ? 'Thanh toán năm' : 'Thanh toán tháng') 
      : (isYearly ? 'Billed yearly' : 'Billed monthly');
    const labelTrans = currentLang === 'vi' ? 'Gói' : 'Plan';
    cartPlanNameEl.textContent = `${labelTrans}: ${planNameTrans} (${payPeriodTrans})`;
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
      cartHistoryList.innerHTML = `<li class="text-xs text-muted" style="padding: 8px;">${currentLang === 'vi' ? 'Chưa xem gói nào' : 'No plans viewed yet'}</li>`;
      return;
    }
    
    viewed.forEach(plan => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <span class="cart-item-title">${currentLang === 'vi' ? plan : (viToEn[plan] || plan)}</span>
        <span class="cart-item-action" data-plan="${plan}">${currentLang === 'vi' ? 'Xem lại' : 'View again'}</span>
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
      cartFavoritesList.innerHTML = `<li class="text-xs text-muted" style="padding: 8px;">${currentLang === 'vi' ? 'Chưa có gói yêu thích' : 'No favorite plans yet'}</li>`;
      return;
    }
    
    favorites.forEach(plan => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <span class="cart-item-title">${currentLang === 'vi' ? plan : (viToEn[plan] || plan)}</span>
        <span class="cart-item-action" data-plan="${plan}">${currentLang === 'vi' ? 'Xem' : 'View'}</span>
      `;
      cartFavoritesList.appendChild(li);
    });
  };

  btnFavoritePlan.addEventListener('click', toggleFavorite);

  const handleItemClick = (e) => {
    if (!e.target.classList.contains('cart-item-action')) return;
    const plan = e.target.getAttribute('data-plan');
    
    let price = 19;
    if (plan === 'Cá nhân' || plan === 'Personal') price = 0;
    else if (plan === 'Doanh nghiệp' || plan === 'Enterprise') price = 49;
    
    const isYearly = document.getElementById('billing-switch').classList.contains('active');
    if (isYearly) {
      if (plan === 'Chuyên nghiệp' || plan === 'Pro') price = 15;
      else if (plan === 'Doanh nghiệp' || plan === 'Enterprise') price = 39;
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
      if (planName === 'Cá nhân' || planName === 'Personal') price = 0;
      else if (planName === 'Doanh nghiệp' || planName === 'Enterprise') price = 49;
      
      if (isYearly) {
        if (planName === 'Chuyên nghiệp' || planName === 'Pro') price = 15;
        else if (planName === 'Doanh nghiệp' || planName === 'Enterprise') price = 39;
      }
      
      openCartDrawer(planName, price, isYearly);
    });
    
    // Di chuột xem gói (Micro-interaction & Behavior tracking)
    card.addEventListener('mouseenter', () => {
      showTrackerToast(currentLang === 'vi' 
        ? `[Xem] Tìm hiểu gói: Gói ${planName}` 
        : `[View] Researching plan: ${planName} Plan`);
    });
  });

  // Tiến hành checkout gói (đẩy dữ liệu vào Form Đăng Ký)
  btnCheckoutPlan.addEventListener('click', () => {
    const contactInterestSelect = document.getElementById('contact-interest');
    const contactMessageTextarea = document.getElementById('contact-message');
    
    if (currentPlanName === 'Cá nhân' || currentPlanName === 'Personal') {
      contactInterestSelect.value = 'pro';
    } else if (currentPlanName === 'Doanh nghiệp' || currentPlanName === 'Enterprise') {
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
    contactMessageTextarea.value = currentLang === 'vi' 
      ? `Tôi muốn đăng ký Gói: ${currentPlanName} (${totalText}).\nCác tiện ích đi kèm: ${addonsList.length > 0 ? addonsList.join(', ') : 'Không có'}.\nVui lòng liên hệ lại tư vấn!`
      : `I want to register for Plan: ${currentPlanName} (${totalText}).\nIncluded addons: ${addonsList.length > 0 ? addonsList.join(', ') : 'None'}.\nPlease contact me for consulting!`;
    
    closeCartDrawer();
    
    // Cuộn mượt đến phần liên hệ
    const contactSection = document.getElementById('contact');
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    showTrackerToast(currentLang === 'vi'
      ? `[Giỏ hàng] Đã nhập thông tin giỏ hàng vào Form Đăng Ký!`
      : `[Cart] Entered cart information into the Registration Form!`);
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
    const textLower = userText.toLowerCase().trim();
    let answer = "";

    if (currentLang === 'en') {
      // English responses
      if (textLower.match(/^(hello|hi|hey|ola|alo|halo|helo|greet)/)) {
        answer = "Hello! Nice to chat with you. I am Zenith AI Assistant. How can I help you optimize your productivity today?";
      }
      else if (textLower.match(/(thank|tks|ok|good|nice|awesome|great|cool)/)) {
        const positiveReplies = [
          "Glad I could help! If you have any other questions about Zenith AI, feel free to ask. 😊",
          "You're very welcome! Would you like to try generating a free Pro trial key using the widget above the pricing section?",
          "Thank you! Wishing you a 10x productive day with Zenith AI! 🚀"
        ];
        answer = positiveReplies[Math.floor(Math.random() * positiveReplies.length)];
      }
      else if (textLower.includes('what is') || textLower.includes('zenith') || textLower.includes('who are you') || textLower.includes('introduce')) {
        answer = "Zenith AI is a **next-generation smart workspace** combining an intuitive Canvas editor with **autonomous AI Agents**. It helps you automate research, documentation, code optimization, and planning in a single unified interface.";
      }
      else if (textLower.includes('price') || textLower.includes('pricing') || textLower.includes('cost') || textLower.includes('buy') || textLower.includes('plan')) {
        answer = "Zenith AI offers 3 flexible plans:\n- **Personal ($0):** Basic features for individuals.\n- **Pro ($15-$19/mo):** Unlimited Agents and executions.\n- **Enterprise ($49/mo):** On-premise hosting and custom dedicated Agents.\n\n*Tip: You can generate a free 14-day Pro trial key in the widget right above the Pricing section!*";
      }
      else if (textLower.includes('secure') || textLower.includes('security') || textLower.includes('privacy') || textLower.includes('data') || textLower.includes('safe')) {
        answer = "Data security is our top priority. All data is protected with **AES-256** end-to-end encryption. We also guarantee that your private documents are never used to train public AI models.";
      }
      else if (textLower.includes('feature') || textLower.includes('function') || textLower.includes('what can it do')) {
        answer = "Zenith AI features:\n1. **AI Workspaces (Canvas):** Brainstorm & link ideas visually.\n2. **Autonomous Agents:** Delegate research tasks to run in the background.\n3. **Flexible Cart options:** Manage and subscribe to options directly on the page.\n4. **Debug Console:** Track user behavior in real-time.";
      }
      else if (textLower.includes('email') || textLower.includes('contact') || textLower.includes('support') || textLower.includes('phone') || textLower.includes('facebook')) {
        answer = "You can contact the Zenith AI team directly at **support@zenithai.io** or fill out the contact form at the bottom of the page. We will reply within 24 hours.";
      }
      else if (textLower.includes('key') || textLower.includes('activation') || textLower.includes('code') || textLower.includes('license')) {
        answer = "To receive a free 14-day Pro trial key, scroll down to the **Pricing** section and click **'Generate Key'** on the widget. The system will decode and issue a key instantly!";
      }
      else {
        const fallbacks = [
          `I have recorded your question: "${userText}". While this is a simulated product assistant, I suggest asking about: **"What is Zenith AI?"**, **"Pricing plans"**, or **"Data security"** for the best support!`,
          `Interesting! "${userText}" is slightly outside my current training data. Would you like to know how Zenith's **autonomous AI Agents** can save you up to 90% of your manual work time?`,
          `Zenith AI received your command! To experience the actual platform, feel free to fill out the contact form below or generate a Pro trial key in the Pricing widget.`
        ];
        answer = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
    } else {
      // Vietnamese responses
      if (textLower.match(/^(chào|xin chào|hello|hi|hey|ola|alo|halo|helo)/)) {
        answer = "Xin chào! Rất vui được trò chuyện với bạn. Tôi là Zenith AI Assistant. Hôm nay tôi có thể giúp gì cho bạn trong việc tối ưu hóa hiệu suất làm việc?";
      }
      else if (textLower.match(/(cảm ơn|cám ơn|thank|tks|ok|tốt|hay|tuyệt|awesome|great)/)) {
        const positiveReplies = [
          "Rất vui vì đã giúp ích được cho bạn! Nếu bạn có bất kỳ câu hỏi nào khác về Zenith AI, cứ tự nhiên hỏi nhé. 😊",
          "Dạ không có gì ạ! Bạn có muốn thử nghiệm tính năng tạo mã kích hoạt dùng thử bản Pro ngay phía trên bảng giá không?",
          "Cảm ơn bạn! Chúc bạn có một ngày làm việc hiệu suất gấp 10 lần cùng Zenith AI! 🚀"
        ];
        answer = positiveReplies[Math.floor(Math.random() * positiveReplies.length)];
      }
      else if (textLower.includes('là gì') || textLower.includes('zenith') || textLower.includes('ai là ai') || textLower.includes('giới thiệu')) {
        answer = "Zenith AI là một **không gian làm việc thông minh thế hệ mới**, kết hợp công cụ soạn thảo Canvas trực quan và các **AI Agent tự vận hành**. Hệ thống giúp bạn tự động hóa nghiên cứu, viết tài liệu, tối ưu mã nguồn và lập kế hoạch mà không cần chuyển đổi tab liên tục.";
      }
      else if (textLower.includes('giá') || textLower.includes('bảng giá') || textLower.includes('pricing') || textLower.includes('tiền') || textLower.includes('mua') || textLower.includes('gói') || textLower.includes('cost')) {
        answer = "Zenith AI có 3 gói cước linh hoạt:\n- **Cá nhân ($0):** Tính năng cơ bản cho cá nhân.\n- **Chuyên nghiệp ($15-$19/tháng):** Không giới hạn số lượng Agent và lượt chạy.\n- **Doanh nghiệp ($49/tháng):** Bảo mật On-Premise và tùy biến Agent.\n\n*Mách nhỏ: Bạn có thể tự sinh mã kích hoạt dùng thử 14 ngày Pro miễn phí tại widget ngay trên mục Bảng giá đấy!*";
      }
      else if (textLower.includes('bảo mật') || textLower.includes('an toàn') || textLower.includes('dữ liệu') || textLower.includes('security') || textLower.includes('khóa')) {
        answer = "An toàn dữ liệu là ưu tiên số 1 của Zenith AI. Dữ liệu được mã hóa hai đầu bằng chuẩn **AES-256** và truyền qua đường kết nối SSL an toàn. Ngoài ra, chúng tôi cam kết không sử dụng dữ liệu của bạn để huấn luyện mô hình công cộng khi chưa được cấp phép.";
      }
      else if (textLower.includes('tính năng') || textLower.includes('làm được gì') || textLower.includes('chức năng') || textLower.includes('làm gì') || textLower.includes('feature')) {
        answer = "Zenith AI có các tính năng cốt lõi vượt trội:\n1. **AI Workspaces (Canvas):** Ghi chép và liên kết ý tưởng dạng sơ đồ.\n2. **Autonomous Agents:** Giao việc cho Agent nghiên cứu tự động chạy ngầm.\n3. **Giỏ hàng cước linh hoạt:** Đăng ký và quản lý tùy chọn ngay tại trang.\n4. **Công cụ Debug:** Theo dõi vết hành vi người dùng thời gian thực.";
      }
      else if (textLower.includes('email') || textLower.includes('liên hệ') || textLower.includes('hỗ trợ') || textLower.includes('support') || textLower.includes('sđt') || textLower.includes('facebook')) {
        answer = "Bạn có thể liên hệ trực tiếp với đội ngũ sáng lập Zenith AI qua email **support@zenithai.io** hoặc điền thông tin vào form liên hệ ở cuối trang web để được phản hồi trong vòng 24 giờ nhé.";
      }
      else if (textLower.includes('mã') || textLower.includes('key') || textLower.includes('kích hoạt') || textLower.includes('activation') || textLower.includes('code')) {
        answer = "Để nhận mã dùng thử 14 ngày Pro, bạn hãy cuộn xuống mục **Bảng giá dịch vụ** và nhấn nút **'Tạo Mã'** ở widget. Hệ thống sẽ tự động giải mã và cấp cho bạn 1 key ngẫu nhiên ngay lập tức!";
      }
      else {
        const fallbacks = [
          `Tôi đã ghi nhận câu hỏi: "${userText}". Tuy đây là chatbot giả lập thông tin sản phẩm, tôi khuyên bạn nên thử hỏi tôi về các chủ đề như: **"Zenith AI là gì?"**, **"Bảng giá dịch vụ"**, hoặc **"Chính sách bảo mật"** để tôi hỗ trợ tốt nhất!`,
          `Thật thú vị! Câu hỏi "${userText}" nằm ngoài dữ liệu huấn luyện của tôi một chút. Bạn có muốn biết thêm về cách các **AI Agent tự vận hành** của Zenith giúp bạn tiết kiệm 90% thời gian làm việc không?`,
          `Hệ thống Zenith AI ghi nhận lệnh của bạn! Để kiểm tra sản phẩm thực tế, bạn có thể gửi form đăng ký dùng thử ở cuối trang, hoặc tự tạo mã kích hoạt Pro dùng thử tại mục Bảng Giá nhé.`
        ];
        answer = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
    }

    setTimeout(() => {
      typingIndicator.remove();
      appendChatMessage(answer, 'bot');
    }, 1000);
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
    let rect = null;
    
    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    });
    
    card.addEventListener('mousemove', (e) => {
      if (!rect) {
        rect = card.getBoundingClientRect();
      }
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
    
    card.addEventListener('mouseleave', () => {
      rect = null;
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });

  /* ==========================================================================
     Bonus 3: Scroll Progress Indicator & Scroll-to-Top Button
     ========================================================================== */
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  let cachedDocHeight = 0;
  let cachedScrollHeight = 0;
  
  const updateCachedDocHeight = () => {
    cachedScrollHeight = document.documentElement.scrollHeight;
    cachedDocHeight = cachedScrollHeight - document.documentElement.clientHeight;
  };
  
  window.addEventListener('resize', updateCachedDocHeight);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    if (cachedDocHeight <= 0) {
      updateCachedDocHeight();
    }
    
    // 1. Cập nhật chiều rộng thanh tiến trình
    if (cachedDocHeight > 0 && scrollProgressBar) {
      const scrollPercent = (scrollTop / cachedDocHeight) * 100;
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }
    
    // 2. Ẩn/hiển thị nút cuộn lên đầu trang
    if (scrollToTopBtn) {
      if (scrollTop > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    }
    
    // 3. Scrollspy fallback cho khi cuộn xuống dưới cùng trang
    if (scrollTop + window.innerHeight >= cachedScrollHeight - 30) {
      const navLinksList = document.querySelectorAll('.nav-link');
      navLinksList.forEach(link => {
        if (link.getAttribute('href') === '#contact') {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });

  // Xử lý click cuộn mượt lên đỉnh trang
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  const contactSectionForFloatingControls = document.getElementById('contact');
  const contactMobileQuery = window.matchMedia('(max-width: 768px)');
  let isContactVisible = false;

  const updateContactFloatingControls = () => {
    body.classList.toggle('contact-section-visible', contactMobileQuery.matches && isContactVisible);
  };

  if (contactSectionForFloatingControls) {
    const contactFloatingObserver = new IntersectionObserver((entries) => {
      isContactVisible = entries.some(entry => entry.isIntersecting);
      updateContactFloatingControls();
    }, {
      root: null,
      threshold: 0.12
    });

    contactFloatingObserver.observe(contactSectionForFloatingControls);

    if (contactMobileQuery.addEventListener) {
      contactMobileQuery.addEventListener('change', updateContactFloatingControls);
    } else if (contactMobileQuery.addListener) {
      contactMobileQuery.addListener(updateContactFloatingControls);
    }
  }

  /* ==========================================================================
     Bonus 4: License Key Generator (Matrix Effect)
     ========================================================================== */
  const generateKeyBtn = document.getElementById('generate-key-btn');
  const keyDisplayBox = document.getElementById('key-display-box');
  const keyTextEl = document.getElementById('key-text');
  
  if (generateKeyBtn && keyDisplayBox && keyTextEl) {
    let isGenerating = false;
    
    generateKeyBtn.addEventListener('click', () => {
      if (isGenerating) return;
      isGenerating = true;
      
      generateKeyBtn.disabled = true;
      generateKeyBtn.textContent = 'Đang tạo...';
      keyDisplayBox.classList.add('generating');
      showTrackerToast('[Bonus] Khởi chạy bộ giải mã Licence Key...');
      
      // Chạy hiệu ứng Matrix nhiễu chữ ngẫu nhiên
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let scrambleInterval = setInterval(() => {
        let randPart1 = '';
        let randPart2 = '';
        for (let i = 0; i < 4; i++) {
          randPart1 += chars.charAt(Math.floor(Math.random() * chars.length));
          randPart2 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        keyTextEl.textContent = `ZPRO-${randPart1}-${randPart2}`;
      }, 50);
      
      // Dừng lại sau 1.2 giây và hiển thị key thực sự
      setTimeout(() => {
        clearInterval(scrambleInterval);
        
        // Tạo key ngẫu nhiên dạng ZPRO-XXXX-XXXX
        let finalPart1 = '';
        let finalPart2 = '';
        for (let i = 0; i < 4; i++) {
          finalPart1 += chars.charAt(Math.floor(Math.random() * chars.length));
          finalPart2 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const finalKey = `ZPRO-${finalPart1}-${finalPart2}`;
        keyTextEl.textContent = finalKey;
        keyDisplayBox.classList.remove('generating');
        
        // Hiệu ứng nháy xanh lục báo thành công
        keyTextEl.style.color = 'var(--accent-green)';
        setTimeout(() => {
          keyTextEl.style.color = '';
        }, 800);
        
        generateKeyBtn.disabled = false;
        generateKeyBtn.textContent = 'Tạo Mã';
        isGenerating = false;
        
        showTrackerToast(`[Bonus] Tạo thành công Licence Key Pro dùng thử: ${finalKey}`);
      }, 1200);
    });
  }

  // Khởi tạo hiển thị dữ liệu lịch sử giỏ hàng
  renderHistory();
  renderFavorites();

  /* ==========================================================================
     Bonus 5: Navigation Scrollspy (Highlight active link on scroll)
     ========================================================================== */
  const scrollspySections = document.querySelectorAll('section[id]');
  const navLinksList = document.querySelectorAll('.nav-link');

  const scrollspyOptions = {
    root: null,
    rootMargin: '-20% 0px -45% 0px',
    threshold: 0
  };

  const scrollspyObserver = new IntersectionObserver((entries) => {
    // Nếu chạm đáy thì để scroll listener xử lý
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop + window.innerHeight >= cachedScrollHeight - 30) {
      return;
    }

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksList.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, scrollspyOptions);

  scrollspySections.forEach(section => {
    scrollspyObserver.observe(section);
  });

});
