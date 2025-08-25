function akceptujCiasteczka() {
        document.getElementById('cookie-banner').style.display = 'none';
        document.cookie = "cookieAccepted=true; expires=" + new Date(new Date().getTime() + (365 * 24 * 60 * 60 * 1000)).toUTCString() + "; path=/";
    }

    window.onload = function() {
        if (!document.cookie.includes('cookieAccepted')) {
            document.getElementById('cookie-banner').style.display = 'block';
        }
    };