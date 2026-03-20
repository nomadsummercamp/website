(function () {
    function initNav() {
        var nav = document.getElementById('main-nav');
        var navSpacer = document.getElementById('nav-spacer');
        var hamburgerBtn = document.getElementById('hamburger-btn');
        var mobileMenu = document.getElementById('mobile-menu');
        var hamburgerIcon = document.getElementById('hamburger-icon');
        var closeIcon = document.getElementById('close-icon');

        // Hamburger toggle
        hamburgerBtn.addEventListener('click', function () {
            var isOpen = !mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            hamburgerIcon.classList.toggle('hidden', !isOpen);
            closeIcon.classList.toggle('hidden', isOpen);
        });

        // Close mobile menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.add('hidden');
                hamburgerIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            });
        });

        // Keep nav spacer in sync with nav height.
        // We defer the first call with two rAFs so Tailwind CDN has time to
        // apply CSS classes (h-16/h-20 on the logo) before we measure.
        // Without this, offsetHeight reflects the logo's natural image size
        // (often 400px+) and creates a massive gap under the nav.
        function syncSpacer() {
            navSpacer.style.height = nav.offsetHeight + 'px';
        }
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                syncSpacer();
                // Re-sync once the logo image has fully loaded, just in case
                var logoImg = nav.querySelector('img');
                if (logoImg && !logoImg.complete) {
                    logoImg.addEventListener('load', syncSpacer);
                    logoImg.addEventListener('error', syncSpacer);
                }
            });
        });
        window.addEventListener('resize', syncSpacer);

        // Scroll-hide on mobile, always visible on desktop
        var lastScrollY = window.scrollY;
        window.addEventListener('scroll', function () {
            if (window.innerWidth >= 768) { nav.style.transform = ''; return; }
            var y = window.scrollY;
            if (y > lastScrollY && y > nav.offsetHeight) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            lastScrollY = y;
        }, { passive: true });

        // Highlight the active nav link based on current path
        var path = window.location.pathname.replace(/\/$/, '') || '/';
        nav.querySelectorAll('a.nav-link').forEach(function (link) {
            var href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
            if (href === path) {
                link.classList.remove('text-gray-300');
                link.classList.add('text-white', 'font-semibold');
            }
        });

        // Re-init Tally embeds for the dynamically-injected buttons
        if (window.Tally) {
            window.Tally.loadEmbeds();
        }
    }

    var navPlaceholder = document.getElementById('nav-placeholder');
    var footerPlaceholder = document.getElementById('footer-placeholder');

    if (navPlaceholder) {
        fetch('/nav.html')
            .then(function (r) { return r.text(); })
            .then(function (html) {
                var tmp = document.createElement('div');
                tmp.innerHTML = html;
                navPlaceholder.replaceWith.apply(navPlaceholder, Array.from(tmp.childNodes));
                initNav();
            });
    }

    if (footerPlaceholder) {
        fetch('/footer.html')
            .then(function (r) { return r.text(); })
            .then(function (html) {
                var tmp = document.createElement('div');
                tmp.innerHTML = html;
                footerPlaceholder.replaceWith.apply(footerPlaceholder, Array.from(tmp.childNodes));
            });
    }

    // Newsletter bottom bar + overlay
    (function () {
        if (sessionStorage.getItem('nsc-newsletter-dismissed')) return;

        // Load beehiiv embed script
        var beeScript = document.createElement('script');
        beeScript.async = true;
        beeScript.src = 'https://subscribe-forms.beehiiv.com/embed.js';
        document.head.appendChild(beeScript);

        // Bottom bar responsive styles
        var nlStyle = document.createElement('style');
        nlStyle.textContent =
            '#nl-center{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;flex:1;min-width:0}' +
            '@media(min-width:768px){#nl-center{flex-direction:row;gap:16px}}';
        document.head.appendChild(nlStyle);

        // Bottom bar
        var bar = document.createElement('div');
        bar.id = 'newsletter-bar';
        bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:40;transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.16,1,0.3,1)';
        bar.innerHTML =
            '<div style="background:#111827;border-top:1px solid rgba(255,255,255,0.08);padding:14px 20px;display:flex;align-items:center;position:relative;box-shadow:0 -4px 24px rgba(0,0,0,0.4)">' +
                '<div id="nl-center">' +
                    '<p style="color:#fff;font-weight:500;margin:0;font-size:15px;text-align:center">Never miss a Camp update again!</p>' +
                    '<button id="nl-open" style="background:#EAB308;color:#111827;font-weight:600;font-size:14px;padding:8px 20px;border-radius:9999px;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0">Sign up for Camp newsletter</button>' +
                '</div>' +
                '<button id="nl-close" aria-label="Close" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:none;border:none;color:#9CA3AF;font-size:24px;line-height:1;cursor:pointer;padding:4px">&times;</button>' +
            '</div>';
        document.body.appendChild(bar);

        // Slide in after a short delay
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                bar.style.transform = 'translateY(0)';
            });
        });

        // Fix mobile Chrome: position: fixed is relative to the layout viewport,
        // not the visual viewport, so the bar drifts when browser UI shows/hides.
        // Adjust `bottom` to match the visual viewport offset.
        if (window.visualViewport) {
            function syncBarPosition() {
                var vv = window.visualViewport;
                var offset = window.innerHeight - vv.height - vv.offsetTop;
                bar.style.bottom = Math.max(0, offset) + 'px';
            }
            window.visualViewport.addEventListener('resize', syncBarPosition);
            window.visualViewport.addEventListener('scroll', syncBarPosition);
        }

        // Overlay
        var overlay = document.createElement('div');
        overlay.id = 'newsletter-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:50;display:none;align-items:flex-start;justify-content:center;background:rgba(0,0,0,0.8);padding:60px 16px 16px;overflow-y:auto';
        overlay.innerHTML =
            '<div style="position:relative;width:100%;max-width:580px;margin:0 auto">' +
                '<button id="nl-overlay-close" aria-label="Close" style="position:absolute;top:-40px;right:0;background:none;border:none;color:rgba(255,255,255,0.7);font-size:32px;line-height:1;cursor:pointer">&times;</button>' +
                '<iframe src="https://subscribe-forms.beehiiv.com/113948f3-d7ae-48e5-b5d3-c490cb43e535" class="beehiiv-embed" data-test-id="beehiiv-embed" frameborder="0" scrolling="no" style="width:100%;height:480px;border-radius:10px;background-color:transparent;display:block;max-width:100%"></iframe>' +
            '</div>';
        document.body.appendChild(overlay);

        function openOverlay() {
            overlay.style.display = 'flex';
        }
        function closeOverlay() {
            overlay.style.display = 'none';
        }

        document.getElementById('nl-open').addEventListener('click', openOverlay);

        document.getElementById('nl-close').addEventListener('click', function () {
            bar.style.transform = 'translateY(100%)';
            setTimeout(function () { bar.remove(); }, 400);
            sessionStorage.setItem('nsc-newsletter-dismissed', '1');
        });

        document.getElementById('nl-overlay-close').addEventListener('click', closeOverlay);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeOverlay();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeOverlay();
        });
    })();
})();
