document.addEventListener('DOMContentLoaded', () => {

    // Set max date for incident date to today (no future dates)
    const incidentDate = document.getElementById('incidentDate');
    if (incidentDate) {
        const today = new Date().toISOString().split('T')[0];
        incidentDate.max = today;
        incidentDate.value = today; // Default to today
    }

    // WhatsApp Complaint Submission
    const complaintForm = document.querySelector('form[action="#"]');
    if (complaintForm && document.getElementById('submitComplaintBtn')) {
        complaintForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name     = document.getElementById('raiserName')?.value.trim() || 'N/A';
            const mobile   = document.getElementById('raiserMobile')?.value.trim() || '';
            const category = document.getElementById('category')?.value || 'N/A';
            const desc     = document.getElementById('complaintText')?.value.trim() || 'N/A';
            const location = document.getElementById('location')?.value.trim() || 'N/A';
            const date     = document.getElementById('incidentDate')?.value || 'N/A';
            const anon     = document.getElementById('anonymous')?.checked ? 'Yes' : 'No';

            if (!mobile || mobile.length !== 10) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }

            const message =
`🏡 *GRAM SEVA — COMPLAINT REPORT*
━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name}
📱 *Mobile:* ${mobile}
📋 *Category:* ${category}
📅 *Date of Incident:* ${date}
📍 *Location:* ${location}

📝 *Description:*
${desc}

🔒 *Anonymous:* ${anon}
━━━━━━━━━━━━━━━━━━━━
_Submitted via Gram Seva Portal_`;

            const waUrl = `https://wa.me/917991893455?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        });
    }

    // ─── LANGUAGE TOGGLE — Full Page (Google Translate silent) ───────
    // Hidden GT element (no visible widget shown)
    const gtDiv = document.createElement('div');
    gtDiv.id = 'google_translate_element';
    gtDiv.style.display = 'none';
    document.body.appendChild(gtDiv);

    window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi',
            autoDisplay: false
        }, 'google_translate_element');
    };
    const gtScript = document.createElement('script');
    gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(gtScript);

    // Aggressively suppress ALL Google Translate UI popups & banners
    const gtStyle = document.createElement('style');
    gtStyle.textContent = `
        .goog-te-banner-frame,
        .goog-te-balloon-frame,
        .goog-te-balloon-frame *,
        #goog-gt-tt,
        .goog-te-bubble,
        .goog-tooltip,
        .goog-tooltip-content,
        .goog-te-menu-frame,
        .skiptranslate > iframe,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-aZ2wEe-OiiCO,
        div.skiptranslate {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        body { top: 0 !important; position: static !important; }
        .goog-te-gadget { display:none !important; }
    `;
    document.head.appendChild(gtStyle);

    // Also remove any GT popup that appears in DOM after translate
    const gtObserver = new MutationObserver(() => {
        const popup = document.getElementById('goog-gt-tt');
        if (popup) popup.remove();
        const balloon = document.querySelector('.goog-te-balloon-frame');
        if (balloon) balloon.style.display = 'none';
        const banner = document.querySelector('.goog-te-banner-frame');
        if (banner) banner.style.display = 'none';
        document.body.style.top = '0';
    });
    gtObserver.observe(document.body, { childList: true, subtree: true });

    // Inject custom styled toggle button
    const navbarContainer = document.querySelector('.navbar .container');
    if (navbarContainer) {
        const langBtn = document.createElement('button');
        langBtn.id = 'langToggleBtn';
        langBtn.style.cssText = `
            background: linear-gradient(135deg,#1B7A4A,#0D9488);
            color: white; border: none; border-radius: 50px;
            padding: 7px 18px; font-weight: 700; font-size: 0.88rem;
            cursor: pointer; display: flex; align-items: center; gap: 6px;
            box-shadow: 0 4px 12px rgba(27,122,74,0.3);
            transition: all 0.3s ease; white-space: nowrap; margin-left: 8px;
        `;

        const currentLang = localStorage.getItem('gramSevaLang') || 'en';
        langBtn.innerHTML = currentLang === 'hi' ? '&#127468;&#127463; English' : '&#127470;&#127475; हिन्दी';

        const menuToggle = document.getElementById('menuToggle');
        navbarContainer.insertBefore(langBtn, menuToggle);

        // Apply saved language on page load
        if (currentLang === 'hi') {
            waitForGT(() => triggerTranslate('hi'));
        }

        langBtn.addEventListener('click', () => {
            const current = localStorage.getItem('gramSevaLang') || 'en';
            const next = current === 'en' ? 'hi' : 'en';
            localStorage.setItem('gramSevaLang', next);
            langBtn.innerHTML = next === 'hi' ? '&#127468;&#127463; English' : '&#127470;&#127475; हिन्दी';
            waitForGT(() => triggerTranslate(next === 'hi' ? 'hi' : 'en'));
        });
    }

    function waitForGT(cb, tries = 0) {
        const select = document.querySelector('.goog-te-combo');
        if (select) { cb(); }
        else if (tries < 30) { setTimeout(() => waitForGT(cb, tries + 1), 300); }
    }

    function triggerTranslate(lang) {
        const select = document.querySelector('.goog-te-combo');
        if (!select) return;
        select.value = lang;
        select.dispatchEvent(new Event('change'));
    }
    // ─────────────────────────────────────────────────────────────────

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // AI Chat Widget Logic
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    if (chatToggle && chatWindow && closeChat) {
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.add('active');
        });

        closeChat.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }

    if (chatForm && chatInput && chatBody) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message === '') return;

            // Add User Message
            addMessage(message, 'user');
            chatInput.value = '';

            // Simulate Bot Response
            setTimeout(() => {
                const response = getBotResponse(message);
                addMessage(response, 'bot');
            }, 1000);
        });
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.textContent = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function getBotResponse(input) {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('hello') || lowerInput.includes('namaste')) {
            return 'Namaste! How can I help you today?';
        } else if (lowerInput.includes('scheme') || lowerInput.includes('yojana')) {
            return 'You can view all government schemes in the "Schemes" section. PM Kisan and Awas Yojana are currently active.';
        } else if (lowerInput.includes('complaint')) {
            return 'To raise a complaint, please click the "Raise Complaint" button on the homepage.';
        } else if (lowerInput.includes('emergency')) {
            return 'For emergencies, call the Ambulance (108) or Police (100). You can also use the SOS button in the Emergency section.';
        } else {
            return 'I am a basic assistant. For detailed information, please contact the Panchayat office.';
        }
    }

    // Simulate Voice Recording (for Complaint Page)
    const voiceBtn = document.getElementById('voiceBtn');
    const complaintText = document.getElementById('complaintText');
    
    if (voiceBtn && complaintText) {
        let isRecording = false;
        voiceBtn.addEventListener('click', () => {
            if (!isRecording) {
                isRecording = true;
                voiceBtn.innerHTML = '<i class="lucide-square"></i> Stop Recording';
                voiceBtn.style.backgroundColor = 'var(--danger-red)';
                
                // Simulate recording ending after 3 seconds
                setTimeout(() => {
                    isRecording = false;
                    voiceBtn.innerHTML = '<i class="lucide-mic"></i> Start Voice Input';
                    voiceBtn.style.backgroundColor = ''; // Reset
                    complaintText.value = "Voice input translated: 'There is a water leakage near the main village square since yesterday.'";
                }, 3000);
            } else {
                isRecording = false;
                voiceBtn.innerHTML = '<i class="lucide-mic"></i> Start Voice Input';
                voiceBtn.style.backgroundColor = ''; // Reset
            }
        });
    }

    // Scroll Animations using Intersection Observer
    const animatedElements = document.querySelectorAll('.card, .section-title, .hero-buttons, .info-section, .contact-card, .scheme-card, .eligibility-checker');
    
    // Add base animation class
    animatedElements.forEach((el, index) => {
        el.classList.add('animate-on-scroll');
        // Add staggering delay to cards in a grid
        if(el.classList.contains('card') || el.classList.contains('contact-card')) {
             const delay = (index % 3) * 100;
             if(delay > 0) el.classList.add(`delay-${delay}`);
        }
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated
                // scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // Add floating animation to chat widget toggle
    if(chatToggle) {
        chatToggle.classList.add('floating');
    }
});

// Particle Canvas for Hero
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 55; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 0.6,
            dy: (Math.random() - 0.5) * 0.6,
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        });
        requestAnimationFrame(draw);
    }
    draw();
})();
