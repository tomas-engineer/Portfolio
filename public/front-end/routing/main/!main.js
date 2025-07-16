function formatNumber(num) {
    const formatter = new Intl.NumberFormat("de-DE");
    const number = formatter.format(num);
    return number;
};

function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
};

function scrollAction(element) {
    const target = document.getElementById(element);
    const y = target.getBoundingClientRect().top + window.scrollY + -100;

    window.scroll({ top: y, behavior: 'smooth' });
};

function scrollToElement({ element, page = window.location.pathname }) {
    if (page == window.location.pathname) return scrollAction(element);
    sessionStorage.setItem('scrollToElementId', element);
    swapPage(page);
};


function swapPage(page) {
    window.location.href = page;
};