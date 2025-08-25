// js/ulubione.js

import { loadCommonComponents } from './components.js';
import { initializeThemeSwitcher } from './theme.js';
import { getCookie, setCookie, removeFromFavoritesCookie } from './use-cookies.js';

async function fetchFavoriteCryptoDetails() {
    const favoriteCryptosDetails = document.getElementById('favoriteCryptosDetails');
    const favoritesCookie = getCookie('favoriteCryptos');
    if (favoritesCookie) {
        const favoriteIds = favoritesCookie.split(',');
        if (favoriteIds.length > 0 && favoriteIds[0] !== '') {
            favoriteCryptosDetails.innerHTML = '';
            for (const id of favoriteIds) {
                try {
                    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=pln&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    const div = document.createElement('div');
                    div.classList.add('crypto-details');
                    div.innerHTML = `
                        <h2>${data.name} (${data.symbol.toUpperCase()})</h2>
                        <img src="${data.image.large}" alt="${data.name} icon" width="64">
                        <p>Aktualna cena: ${data.market_data.current_price.pln} PLN</p>
                        <p>Zmiana 24h: <span class="${data.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">${data.market_data.price_change_percentage_24h?.toFixed(2)}%</span></p>
                        <p>Kapitalizacja rynkowa: ${data.market_data.market_cap.pln} PLN</p>
                        <p>Najwyższa cena z 24h: ${data.market_data.high_24h.pln} PLN</p>
                        <p>Najniższa cena z 24h: ${data.market_data.low_24h.pln} PLN</p>
                        <button class="button" onclick="removeFromFavorites('${data.id}')">Usuń z Ulubionych</button>
                        <hr>
                    `;
                    favoriteCryptosDetails.appendChild(div);
                } catch (error) {
                    console.error(`Błąd podczas pobierania danych dla ${id}:`, error);
                    favoriteCryptosDetails.innerHTML += `<p>Błąd podczas ładowania danych dla ${id}: ${error.message}.</p>`;
                }
            }
        } else {
            favoriteCryptosDetails.innerHTML = '<p>Nie masz jeszcze żadnych ulubionych kryptowalut.</p>';
        }
    } else {
        favoriteCryptosDetails.innerHTML = '<p>Nie znaleziono ciasteczek z ulubionymi kryptowalutami.</p>';
    }
}

function removeFromFavorites(cryptoId) {
    removeFromFavoritesCookie(cryptoId, fetchFavoriteCryptoDetails);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadCommonComponents('/crypto_summary_app/');
    initializeThemeSwitcher();
    fetchFavoriteCryptoDetails();
});