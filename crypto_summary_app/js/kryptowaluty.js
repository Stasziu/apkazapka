// js/kryptowaluty.js

import { loadCommonComponents } from './components.js';
import { initializeThemeSwitcher } from './theme.js';

const cryptoListSection = document.getElementById('cryptoList');
const cryptoDetailsSection = document.getElementById('cryptoDetails');
const detailsContent = document.getElementById('detailsContent');

async function fetchCryptoList() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=pln&order=market_cap_desc&per_page=50&page=1&sparkline=false');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayCryptoList(data);
    } catch (error) {
        console.error('Błąd podczas pobierania listy kryptowalut:', error);
        cryptoListSection.innerHTML = `<p>Wystąpił błąd podczas ładowania listy kryptowalut: ${error.message}</p>`;
    }
}

function displayCryptoList(cryptos) {
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>Nazwa</th>
                    <th>Symbol</th>
                    <th>Cena (PLN)</th>
                    <th>Zmiana 24h</th>
                    <th>Kapitalizacja Rynkowa (PLN)</th>
                    <th>Szczegóły</th>
                </tr>
            </thead>
            <tbody>
    `;
    cryptos.forEach(crypto => {
        const priceChangeClass = crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
        tableHTML += `
            <tr onclick="fetchCryptoDetails('${crypto.id}')">
                <td><img src="${crypto.image}" alt="${crypto.name} icon" width="32"></td>
                <td>${crypto.name}</td>
                <td>${crypto.symbol.toUpperCase()}</td>
                <td>${crypto.current_price?.toFixed(2)}</td>
                <td class="${priceChangeClass}">${crypto.price_change_percentage_24h?.toFixed(2)}%</td>
                <td><button onclick="fetchCryptoDetails('${crypto.id}')">Szczegóły</button></td>
            </tr>
        `;
    });
    tableHTML += `
            </tbody>
        </table>
    `;
    cryptoListSection.innerHTML = tableHTML;
}

async function fetchCryptoDetails(cryptoId) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=pln&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayCryptoDetails(data);
        cryptoDetailsSection.classList.remove('hidden');
    } catch (error) {
        console.error(`Błąd podczas pobierania szczegółów dla ${cryptoId}:`, error);
        detailsContent.innerHTML = `<p>Wystąpił błąd podczas ładowania szczegółów: ${error.message}</p>`;
        cryptoDetailsSection.classList.remove('hidden');
    }
}

function displayCryptoDetails(data) {
    detailsContent.innerHTML = `
        <h2>${data.name} (${data.symbol.toUpperCase()})</h2>
        <img src="${data.image.large}" alt="${data.name} icon" width="64">
        <p>Aktualna cena: ${data.market_data.current_price.pln} PLN</p>
        <p>Zmiana 24h: <span class="${data.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">${data.market_data.price_change_percentage_24h?.toFixed(2)}%</span></p>
        <p>Kapitalizacja rynkowa: ${data.market_data.market_cap.pln} PLN</p>
        <p>Wolumen obrotu (24h): ${data.market_data.total_volume.pln} PLN</p>
        <p>Strona internetowa: ${data.links.homepage[0] ? `<a href="${data.links.homepage[0]}" target="_blank">${data.links.homepage[0]}</a>` : 'N/A'}</p>
        ${data.description.pl ? `<p>Opis: ${data.description.pl}</p>` : (data.description.en ? `<p>Description: ${data.description.en}</p>` : '')}
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadCommonComponents('/crypto_summary_app/');
    initializeThemeSwitcher();
    fetchCryptoList();
});