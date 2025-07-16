document.addEventListener('DOMContentLoaded', async () => {
    if (sessionStorage.getItem('scrollToElementId')) {
        const element = sessionStorage.getItem('scrollToElementId');
        sessionStorage.removeItem('scrollToElementId');
        scrollAction(element);
    }
});