// ============================================
// Google Sheets Tracker
// ============================================
const TRACKER_URL = 'https://script.google.com/macros/s/AKfycbzuKTyoMP5dQzgB1T9NsbpcKMYn_zvoXLUcbNTH7e0jaJwGV9XQJ0weBoUzQMhI3M42/exec';

function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        source: params.get('utm_source') || '',
        medium: params.get('utm_medium') || '',
        campaign: params.get('utm_campaign') || ''
    };
}

function getReferrer() {
    const ref = document.referrer;
    if (!ref) return '직접 방문';
    if (ref.includes('instagram')) return 'Instagram';
    if (ref.includes('facebook')) return 'Facebook';
    if (ref.includes('naver')) return 'Naver';
    if (ref.includes('google')) return 'Google';
    if (ref.includes('kakao')) return 'Kakao';
    return ref;
}

function getDevice() {
    return /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

function getKSTTimestamp() {
    const now = new Date();
    const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return kst.toISOString().replace('T', ' ').substring(0, 19);
}

function trackEvent(action) {
    const utm = getUTMParams();
    const data = {
        timestamp: getKSTTimestamp(),
        referrer: getReferrer(),
        utm_source: utm.source,
        utm_medium: utm.medium,
        utm_campaign: utm.campaign,
        page: window.location.pathname,
        action: action,
        device: getDevice()
    };

    fetch(TRACKER_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(() => {});
}

// 페이지 방문 추적
document.addEventListener('DOMContentLoaded', function() {
    trackEvent('페이지 방문');
});

// ============================================
// Consultation Form Submission
// ============================================
const CONSULTATION_FORM_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consultation-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameEl = document.getElementById('form-name');
        const phoneEl = document.getElementById('form-phone');
        const serviceEl = document.getElementById('form-service');
        const messageEl = document.getElementById('form-message');

        // Clear previous errors
        [nameEl, phoneEl, serviceEl].forEach(el => el.classList.remove('error'));

        // Validate
        let hasError = false;
        if (!nameEl.value.trim()) { nameEl.classList.add('error'); hasError = true; }
        if (!phoneEl.value.trim()) { phoneEl.classList.add('error'); hasError = true; }
        if (!serviceEl.value) { serviceEl.classList.add('error'); hasError = true; }
        if (hasError) return;

        // Immediately show done screen (don't wait for response)
        document.getElementById('consultation-form-wrap').style.display = 'none';
        document.getElementById('consultation-done').style.display = 'block';

        // Fire Meta Pixel Lead event
        if (typeof fbq === 'function') {
            fbq('track', 'Lead');
        }

        // Track event
        trackEvent('상담 신청 완료');

        // Send data to Google Sheets (fire-and-forget)
        const payload = {
            timestamp: getKSTTimestamp(),
            name: nameEl.value.trim(),
            phone: phoneEl.value.trim(),
            service: serviceEl.value,
            message: messageEl.value.trim(),
            referrer: getReferrer(),
            device: getDevice()
        };

        fetch(CONSULTATION_FORM_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(() => {});
    });
});

// ============================================
// Portfolio Tab Switching
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const femaleGrid = document.getElementById('female-grid');
    const maleGrid = document.getElementById('male-grid');
    const lashGrid = document.getElementById('lash-grid');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            // Hide all grids
            femaleGrid.classList.add('hidden');
            maleGrid.classList.add('hidden');
            lashGrid.classList.add('hidden');

            // Show selected grid
            if (btn.dataset.tab === 'female') {
                femaleGrid.classList.remove('hidden');
                trackEvent('탭 전환: 여성');
            } else if (btn.dataset.tab === 'male') {
                maleGrid.classList.remove('hidden');
                trackEvent('탭 전환: 남성');
            } else if (btn.dataset.tab === 'lash') {
                lashGrid.classList.remove('hidden');
                trackEvent('탭 전환: 속눈썹펌');
            }
        });
    });

    // CTA 버튼 클릭 추적
    document.querySelectorAll('.btn-kakao').forEach(btn => {
        btn.addEventListener('click', () => trackEvent('클릭: 카카오톡 상담'));
    });
    document.querySelectorAll('.btn-naver-place').forEach(btn => {
        btn.addEventListener('click', () => trackEvent('클릭: 네이버 플레이스'));
    });
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', () => trackEvent('클릭: 1:1 상담 예약'));
    });
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', () => trackEvent('클릭: 시뮬레이션 상담'));
    });
});

// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMobile = document.querySelector('.nav-mobile');
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const mobileSubmenu = document.querySelector('.nav-mobile-submenu');

    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMobile.classList.toggle('active');
        });
    }

    // Mobile submenu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileSubmenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    const mobileLinks = document.querySelectorAll('.nav-mobile a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMobile.classList.remove('active');
        });
    });
});

// FAQ Accordion
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.problem-list li, .solution-list li, .highlight-card, .faq-item');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const revealPoint = 100;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('visible');
            }
        });
    };

    // Add reveal class to elements
    revealElements.forEach(element => {
        element.classList.add('reveal');
    });

    // Initial check
    revealOnScroll();

    // Listen for scroll
    window.addEventListener('scroll', revealOnScroll, { passive: true });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header background on scroll
    const header = document.querySelector('.header');

    const updateHeader = () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 20px rgba(107, 31, 43, 0.08)';
        } else {
            header.style.boxShadow = 'none';
        }
    };

    window.addEventListener('scroll', updateHeader, { passive: true });
});
