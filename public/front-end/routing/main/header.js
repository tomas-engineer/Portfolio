const header = document.querySelector('header');
const backToTop = document.getElementById('back-to-top');

const mobileMenuOuterElement = document.getElementById('mobile-menu-outer');
const mobileMenuElement = document.getElementById('mobile-menu');

function toggleHeader() {
    const offset = window.pageYOffset;
    const setDisplay = (value) => backToTop.style.display = value;

    if (offset > 0) {
        const height = window.getComputedStyle(header).height;
        header.style.top = '-' + height;
        backToTop.style.opacity = '0';
        backToTop.style.display = 'flex';
        backToTop.offsetHeight;
        
        backToTop.style.opacity = '1';
    } else {
        header.style.top = '0px'
        backToTop.style.opacity = '0';
        backToTop.addEventListener('animationend', () => setDisplay('none'), { once: true });
    };
};

function toggleMobileMenu() {
    mobileMenuOuterElement.classList.toggle('visible');
    const bodyElement = document.body;

    if (mobileMenuOuterElement.classList.contains('visible')) {
        const scrollbarWidth = getScrollbarWidth();

        bodyElement.style.paddingRight = scrollbarWidth + 'px';
        if (backToTop) backToTop.style.marginRight = scrollbarWidth + 'px';
        header.style.width = getComputedStyle(header).width;

        mobileMenuOuterElement.style.display = 'flex';
        mobileMenuOuterElement.style.opacity = '0';
        mobileMenuOuterElement.offsetWidth;
        mobileMenuOuterElement.style.opacity = '1';
        
        mobileMenuElement.style.transform = `translateX(calc(-1 * (100% + (var(--padding) * 2))))`;
        mobileMenuElement.offsetWidth;
        mobileMenuElement.style.transform = `translateX(0)`;

        bodyElement.style.overflowY = 'hidden';
    } else {
        mobileMenuElement.style.transform = `translateX(calc(-1 * (100% + (var(--padding) * 2))))`;
        mobileMenuOuterElement.style.opacity = '0';

        let transformDone = false;
        let opacityDone = false;

        const checkDone = () => {
            if (transformDone && opacityDone) {
                bodyElement.style.paddingRight = '0';
                if (backToTop) backToTop.style.marginRight = '0';
                header.style.width = '100%';

                mobileMenuOuterElement.style.display = 'none';
                bodyElement.style.overflowY = 'auto';

                mobileMenuElement.removeEventListener('transitionend', onTransformEnd);
                mobileMenuOuterElement.removeEventListener('transitionend', onOpacityEnd);
            }
        };

        const onTransformEnd = (event) => {
            if (event.propertyName === 'transform') {
                transformDone = true;
                checkDone();
            }
        };

        const onOpacityEnd = (event) => {
            if (event.propertyName === 'opacity') {
                opacityDone = true;
                checkDone();
            }
        };

        mobileMenuElement.addEventListener('transitionend', onTransformEnd);
        mobileMenuOuterElement.addEventListener('transitionend', onOpacityEnd);
    }
};

document.addEventListener('load', toggleHeader);
document.addEventListener('scroll', toggleHeader);

/* Initialize outer click listener */
mobileMenuOuterElement.addEventListener('click', toggleMobileMenu);

mobileMenuElement.addEventListener('click', (event) => {
    event.stopPropagation();
});