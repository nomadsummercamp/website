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

        // Keep nav spacer in sync with nav height
        function syncSpacer() {
            navSpacer.style.height = nav.offsetHeight + 'px';
        }
        syncSpacer();
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
})();
