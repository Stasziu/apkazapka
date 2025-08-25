// js/script.js
import { setCookie, getCookie, getFavoriteCryptos, addFavoriteCrypto, removeFavoriteCrypto } from './use-cookies.js';
import { loadCommonComponents } from './components.js';
import { initializeThemeSwitcher } from './theme.js';

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const cryptoAnalysisSection = document.getElementById('cryptoAnalysisSection');
const cryptoSummarySection = document.getElementById('cryptoSummarySection');
const cryptoChartCanvas = document.getElementById('cryptoChart'); // Zmieniono nazwę zmiennej
const summaryElement = document.getElementById('summary');
const daysSelect = document.getElementById('daysSelect');
const favoriteButtonContainer = document.getElementById('favoriteButtonContainer');
const addToFavoritesButton = document.getElementById('addToFavoritesButton');

let currentCryptoId = null;
let myChart = null; // Zmienna dla instancji Chart.js

// Funkcja aktualizująca stan przycisku "Dodaj do Ulubionych"
function updateFavoriteButtonState(cryptoId) {
    if (addToFavoritesButton) {
        const favorites = getFavoriteCryptos();
        if (favorites.includes(cryptoId)) {
            addToFavoritesButton.textContent = 'Usuń z Ulubionych';
            addToFavoritesButton.onclick = () => removeFavoriteCrypto(cryptoId, updateFavoriteButtonState);
        } else {
            addToFavoritesButton.textContent = 'Dodaj do Ulubionych';
            addToFavoritesButton.onclick = () => addFavoriteCrypto(cryptoId, updateFavoriteButtonState);
        }
        favoriteButtonContainer.classList.remove('hidden');
    }
}

// Obsługa wyszukiwania kryptowalut
searchInput.addEventListener('input', async () => {
    const query = searchInput.value.toLowerCase();
    searchResults.innerHTML = '';

    if (query.length < 2) {
        searchResults.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
        const data = await response.json();

        if (data.coins && data.coins.length > 0) {
            data.coins.slice(0, 5).forEach(coin => {
                const div = document.createElement('div');
                div.classList.add('search-result-item');
                div.innerHTML = `<img src="${coin.thumb}" alt="${coin.name} icon"> ${coin.name} (${coin.symbol.toUpperCase()})`;
                div.addEventListener('click', () => {
                    searchInput.value = coin.name;
                    searchResults.classList.add('hidden');
                    getData(coin.id); // Pobierz dane po wyborze z wyszukiwarki
                });
                searchResults.appendChild(div);
            });
            searchResults.classList.remove('hidden');
        } else {
            searchResults.innerHTML = '<p>Brak wyników</p>';
            searchResults.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Błąd podczas wyszukiwania:', error);
        searchResults.innerHTML = '<p>Wystąpił błąd podczas wyszukiwania.</p>';
        searchResults.classList.remove('hidden');
    }
});

// Zamykanie wyników wyszukiwania po kliknięciu poza nimi
document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
        searchResults.classList.add('hidden');
    }
});

// Pobieranie i wyświetlanie danych kryptowaluty
async function getData(cryptoId, days = 1) {
    currentCryptoId = cryptoId; // Ustaw aktualnie wybraną kryptowalutę
    favoriteButtonContainer.classList.add('hidden'); // Ukryj przycisk, zanim zostanie zaktualizowany

    try {
        const [marketDataResponse, chartDataResponse] = await Promise.all([
            fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`),
            fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=pln&days=${days}`)
        ]);

        const marketData = await marketDataResponse.json();
        const chartData = await chartDataResponse.json();

        displayChart(chartData);
        displaySummary(marketData);
        cryptoAnalysisSection.classList.remove('hidden');
        cryptoSummarySection.classList.remove('hidden');

        updateFavoriteButtonState(cryptoId); // Zaktualizuj stan przycisku ulubionych
    } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        summaryElement.textContent = 'Wystąpił błąd podczas pobierania danych.';
        cryptoAnalysisSection.classList.add('hidden');
        cryptoSummarySection.classList.remove('hidden'); // Pokaż sekcję podsumowania z błędem
    }
}

// Wykres Chart.js
function displayChart(chartData) {
    if (myChart) {
        myChart.destroy(); // Zniszcz poprzedni wykres, jeśli istnieje
    }

    const prices = chartData.prices;
    const labels = prices.map(price => {
        const date = new Date(price[0]);
        // Formatowanie daty w zależności od zakresu dni
        if (daysSelect.value === '1') {
            return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('pl-PL');
        }
    });
    const dataPoints = prices.map(price => price[1]);

    myChart = new Chart(cryptoChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cena (PLN)',
                data: dataPoints,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0 // Ukryj punkty na linii
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'category', // Używaj 'category' dla etykiet tekstowych dat
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10 // Ogranicz liczbę wyświetlanych etykiet na osi X
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)' // Jasna siatka dla trybu jasnego
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.1)' // Jasna siatka dla trybu jasnego
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Dostosuj kolor siatki w zależności od motywu
    const rootStyles = getComputedStyle(document.documentElement);
    const gridColor = rootStyles.getPropertyValue('--border-color') || 'rgba(0,0,0,0.1)';
    if (myChart.options.scales.x && myChart.options.scales.x.grid) {
        myChart.options.scales.x.grid.color = gridColor;
    }
    if (myChart.options.scales.y && myChart.options.scales.y.grid) {
        myChart.options.scales.y.grid.color = gridColor;
    }
    myChart.update();
}

// Wyświetlanie podsumowania kryptowaluty
function displaySummary(data) {
    const change24hClass = data.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
    summaryElement.innerHTML = `
        <h2>${data.name} (${data.symbol.toUpperCase()})</h2>
        <p>Aktualna cena: <span class="current-price">${data.market_data.current_price.pln} PLN</span></p>
        <p>Zmiana 24h: <span class="${change24hClass}">${data.market_data.price_change_percentage_24h?.toFixed(2)}%</span></p>
        <p>Kapitalizacja rynkowa: ${data.market_data.market_cap.pln} PLN</p>
        <p>Wolumen obrotu (24h): ${data.market_data.total_volume.pln} PLN</p>
        <p>Najwyższa cena z 24h: ${data.market_data.high_24h.pln} PLN</p>
        <p>Najniższa cena z 24h: ${data.market_data.low_24h.pln} PLN</p>
        <p>Strona internetowa: <a href="${data.links.homepage[0]}" target="_blank">${data.links.homepage[0]}</a></p>
        <p>Opis: ${data.description.pl || data.description.en || 'Brak opisu.'}</p>
    `;
}

// Obsługa zmiany zakresu dni dla wykresu
daysSelect.addEventListener('change', () => {
    if (currentCryptoId) {
        getData(currentCryptoId, daysSelect.value);
    }
});

// Pobierz popularne kryptowaluty przy załadowaniu strony
async function fetchPopularCryptos() {
    const popularCryptoList = document.getElementById('popularCryptoList');
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=pln&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        const data = await response.json();
        popularCryptoList.innerHTML = ''; // Wyczyść listę przed dodaniem

        data.forEach(crypto => {
            const div = document.createElement('div');
            div.classList.add('crypto-item');
            div.innerHTML = `
                <strong>${crypto.name} (${crypto.symbol.toUpperCase()})</strong>
                <img src="${crypto.image}" alt="${crypto.name} icon" width="32">
                <p>Cena: ${crypto.current_price} PLN</p>
                <p>Zmiana 24h: <span class="${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">${crypto.price_change_percentage_24h?.toFixed(2)}%</span></p>
                <button class="button small" data-crypto-id="${crypto.id}">Zobacz Dane</button>
            `;
            popularCryptoList.appendChild(div);
        });

        // Event delegation dla przycisków "Zobacz Dane" w popularnych kryptowalutach
        popularCryptoList.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' && event.target.dataset.cryptoId) {
                getData(event.target.dataset.cryptoId);
            }
        });

    } catch (error) {
        console.error('Błąd podczas pobierania popularnych kryptowalut:', error);
        popularCryptoList.innerHTML = '<p>Wystąpił błąd podczas pobierania popularnych kryptowalut.</p>';
    }
}

// Inicjalizacja komponentów i danych po załadowaniu DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Wczytanie wspólnych komponentów HTML
    await loadCommonComponents('/crypto_summary_app/'); // Dla index.html, ścieżka bazowa to '/'

    // Inicjalizacja przełącznika motywu
    initializeThemeSwitcher();

    // Pobranie popularnych kryptowalut
    fetchPopularCryptos();
});