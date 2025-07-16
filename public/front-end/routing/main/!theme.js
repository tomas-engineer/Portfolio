const main = document.querySelector('main');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const cookies = document.cookie.split('; ');
const theme = cookies.find(cookie => cookie.startsWith('theme='))?.split('=')[1];
var currentTheme = theme || 'light';

function setThemeCookie(theme) {
    document.cookie = `theme=${theme}; max-age=${1 * 365 * 24 * 60 * 60}; path=/`;
};

function applyTheme(theme = currentTheme) {
    body.classList.add(theme);
    body.classList.remove(theme == 'dark' ? 'light' : 'dark');
    setThemeCookie(theme);
};

// Initialize theme
applyTheme();

// Theme toggle listener
themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme == 'dark' ? 'light' : 'dark';
    applyTheme();
});