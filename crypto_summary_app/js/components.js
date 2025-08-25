// js/components.js

/**
 * Loads common HTML components (header, footer, cookie banner) into the page.
 * @param {string} baseUrl - The base URL path to the project root (e.g., '/', '/crypto_summary_app/').
 */
export async function loadCommonComponents(baseUrl = '/') {
    const body = document.body;

    // Load Header
    try {
        const headerResponse = await fetch(`${baseUrl}html/common_header.html`);
        if (headerResponse.ok) {
            const headerHtml = await headerResponse.text();
            const headerElement = document.createElement('div');
            headerElement.innerHTML = headerHtml;
            body.insertBefore(headerElement.firstElementChild, body.firstChild);
            // USUNIĘTO: Logikę dynamicznego zmieniania href w nagłówku
        } else {
            console.error('Failed to load header:', headerResponse.statusText);
        }
    } catch (error) {
        console.error('Error fetching header:', error);
    }

    // Load Cookie Banner
    try {
        const cookieBannerResponse = await fetch(`${baseUrl}html/common_cookie_banner.html`);
        if (cookieBannerResponse.ok) {
            const cookieBannerHtml = await cookieBannerResponse.text();
            const cookieBannerElement = document.createElement('div');
            cookieBannerElement.innerHTML = cookieBannerHtml;
            body.appendChild(cookieBannerElement.firstElementChild);

            // Initialize cookie banner logic after it's added to DOM
            const cookieBanner = document.getElementById('cookie-banner');
            const acceptButton = document.getElementById('acceptCookies');

            if (!document.cookie.includes('cookieAccepted')) {
                if (cookieBanner) {
                    cookieBanner.style.display = 'block';
                }
            }

            if (acceptButton) {
                acceptButton.addEventListener('click', () => {
                    if (cookieBanner) {
                        cookieBanner.style.display = 'none';
                    }
                    // Ustaw ciasteczko zgody - ścieżka do ciasteczka powinna być rootem aplikacji
                    document.cookie = `cookieAccepted=true; expires=${new Date(new Date().getTime() + (365 * 24 * 60 * 60 * 1000)).toUTCString()}; path=${baseUrl}`;
                });
            }
            // USUNIĘTO: Logikę dynamicznego zmieniania href w banerze ciasteczek
        } else {
            console.error('Failed to load cookie banner:', cookieBannerResponse.statusText);
        }
    } catch (error) {
        console.error('Error fetching cookie banner:', error);
    }

    // Load Footer
    try {
        const footerResponse = await fetch(`${baseUrl}html/common_footer.html`);
        if (footerResponse.ok) {
            const footerHtml = await footerResponse.text();
            const footerElement = document.createElement('div');
            footerElement.innerHTML = footerHtml;
            body.appendChild(footerElement.firstElementChild);
        } else {
            console.error('Failed to load footer:', footerResponse.statusText);
        }
    } catch (error) {
        console.error('Error fetching footer:', error);
    }
}