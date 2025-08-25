// js/use-cookies.js

export function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

export function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) === 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return "";
}

export function getFavoriteCryptos() {
    const favoritesCookie = getCookie('favoriteCryptos');
    return favoritesCookie ? favoritesCookie.split(',').filter(id => id.trim() !== '') : [];
}

// Funkcja dodająca kryptowalutę do ulubionych
export function addFavoriteCrypto(cryptoId, updateButtonCallback) {
    let favorites = getFavoriteCryptos();
    if (!favorites.includes(cryptoId)) {
        favorites.push(cryptoId);
        setCookie('favoriteCryptos', favorites.join(','), 30); // Ciasteczko na 30 dni
        if (updateButtonCallback) {
            updateButtonCallback(cryptoId); // Przekaż cryptoId do callbacka
        }
    }
}

// Funkcja usuwająca kryptowalutę z ulubionych
export function removeFavoriteCrypto(cryptoId, updateButtonCallback) {
    let favorites = getFavoriteCryptos();
    const index = favorites.indexOf(cryptoId);
    if (index > -1) {
        favorites.splice(index, 1);
        setCookie('favoriteCryptos', favorites.join(','), 30);
        if (updateButtonCallback) {
            updateButtonCallback(cryptoId); // Przekaż cryptoId do callbacka
        }
    }
}

// Ujednolicona funkcja do usuwania z ulubionych (zastępuje poprzednie removeFromFavoritesCookie)
// Ta funkcja jest wywoływana przez ulubione.js i powinna również odświeżać listę
export function removeFromFavoritesCookie(cryptoId, callback) {
    removeFavoriteCrypto(cryptoId, () => {
        if (callback) {
            callback(); // Wywołaj callback (np. odświeżenie listy ulubionych)
        }
    });
}