function navigate(location) {
    if (!document.referrer) location = '/';
    
    if (location !== '/' && document.referrer) {
        const host = new URL(document.referrer).hostname;
        location = host == window.location.hostname ? document.referrer : '/';
    }

    document.location.href = location;
}