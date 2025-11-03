
function initNavbarShrink() {
    const navbar = document.getElementById('mainNav');
    if (!navbar) return;

    const shrinkNavbar = () => {
        if (window.scrollY > 100) {
            navbar.classList.add('navbar-shrink');
        } else {
            navbar.classList.remove('navbar-shrink');
        }
    };

    shrinkNavbar();

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                shrinkNavbar();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('#mainNav').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });
}

function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], header[id]'); 
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navHeight = document.querySelector('#mainNav')?.offsetHeight || 80;
    
    const observerOptions = {
        rootMargin: `-${navHeight + 20}px 0px -50%`,
        threshold: [0, 0.25, 0.5, 0.75, 1]
    };
    
    let currentActive = '';
    
    const observerCallback = (entries) => {
        const intersecting = entries.filter(entry => entry.isIntersecting);
        
        if (intersecting.length > 0) {
            intersecting.sort((a, b) => {
                if (b.intersectionRatio !== a.intersectionRatio) {
                    return b.intersectionRatio - a.intersectionRatio;
                }
                return a.boundingClientRect.top - b.boundingClientRect.top;
            });
            
            const mostVisible = intersecting[0];
            const id = mostVisible.target.id;
            
            if (currentActive !== id) {
                currentActive = id;
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                const activeLink = document.querySelector(`.navbar-nav .nav-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        }
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
    
    const updateActiveOnScroll = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        if (scrollY < 100) {
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            const homeLink = document.querySelector('.navbar-nav .nav-link[href="#home"]');
            if (homeLink) {
                homeLink.classList.add('active');
                currentActive = 'home';
            }
            return;
        }
        
        let maxVisibleRatio = 0;
        let mostVisibleSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const sectionHeight = rect.height;
            const sectionBottom = sectionTop + sectionHeight;
            
            const visibleTop = Math.max(rect.top, navHeight + 20);
            const visibleBottom = Math.min(rect.bottom, windowHeight);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibleRatio = visibleHeight / sectionHeight;
            
            const viewportPosition = rect.top;
            const adjustedRatio = visibleRatio * (viewportPosition < windowHeight * 0.5 ? 1.2 : 1);
            
            if (adjustedRatio > maxVisibleRatio && visibleRatio > 0.1) {
                maxVisibleRatio = adjustedRatio;
                mostVisibleSection = section;
            }
        });
        
        if (mostVisibleSection && currentActive !== mostVisibleSection.id) {
            currentActive = mostVisibleSection.id;
            
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            const activeLink = document.querySelector(`.navbar-nav .nav-link[href="#${mostVisibleSection.id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    };
    
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    updateActiveOnScroll();
}

class TypeWriter {
    constructor(element, roles) {
        this.element = element;
        this.roles = roles;
        this.currentRoleIndex = 0;
        this.currentText = '';
        this.isDeleting = false;
        this.typingSpeed = 100;
        this.deletingSpeed = 50;
        this.pauseDuration = 2000;
    }

    updateRoles(newRoles) {
        this.roles = newRoles;
    }

    type() {
        const currentRole = this.roles[this.currentRoleIndex];
        
        if (this.isDeleting) {
            this.currentText = currentRole.substring(0, this.currentText.length - 1);
        } else {
            this.currentText = currentRole.substring(0, this.currentText.length + 1);
        }
        
        this.element.textContent = this.currentText;
        
        let typeSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
        
        if (!this.isDeleting && this.currentText === currentRole) {
            typeSpeed = this.pauseDuration;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentText === '') {
            this.isDeleting = false;
            this.currentRoleIndex = (this.currentRoleIndex + 1) % this.roles.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }

    start() {
        this.type();
    }
}

function initFadeInAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll('.section, .skill-card, .project-card, .contact-card');
    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    let ticking = false;
    const updateParallax = () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    };
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.pageYOffset < window.innerHeight) {
                    updateParallax();
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

function initEmailCopy() {
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = 'luisscristerna@gmail.com';
            
            navigator.clipboard.writeText(email).then(() => {
                const originalContent = emailLink.innerHTML;
                const successHTML = '<i class="bi bi-check-circle-fill"></i> ¡Copiado!';
                emailLink.innerHTML = successHTML;
                emailLink.style.color = 'var(--accent-2)';
                
                setTimeout(() => {
                    emailLink.innerHTML = originalContent;
                    emailLink.style.color = '';
                }, 2000);
            }).catch(() => {
                window.location.href = `mailto:${email}`;
            });
        });
    }
}

function initFooterYear() {
    const yearElements = document.querySelectorAll('[data-year]');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
    
    const footerRights = document.querySelector('[data-i18n="footer.rights"]');
    if (footerRights && !footerRights.textContent.includes('2025')) {
        footerRights.textContent = footerRights.textContent.replace(/©\s*\d{4}/, `© ${currentYear}`);
    }
}

function initPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = '<div class="loading"></div>';
    preloader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: var(--bg);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    
    document.body.appendChild(preloader);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 500);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    initNavbarShrink();
    initSmoothScrolling();
    initScrollSpy();
    initTooltips();
    initFadeInAnimations();
    initParallaxEffect();
    initEmailCopy();
    initFooterYear();
    
    
});

function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

window.addEventListener('resize', debounce(() => {
    const navbar = document.getElementById('mainNav');
    if (navbar) {
        if (window.innerWidth > 991) {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse) {
                navbarCollapse.classList.remove('show');
            }
        }
    }
}, 250));
