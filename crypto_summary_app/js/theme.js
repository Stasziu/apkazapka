// js/theme.js
import { getCookie, setCookie } from './use-cookies.js';

export function initializeThemeSwitcher() {
    const themeSwitcher = document.getElementById('themeSwitcher');
    const darkThemeLink = document.getElementById('darkTheme'); // Pobieranie elementu linku do ciemnego motywu

    // Ustawienie początkowego motywu na podstawie ciasteczka
    const currentTheme = getCookie('theme') || 'light-mode';
    document.documentElement.className = currentTheme;
    if (darkThemeLink) {
        darkThemeLink.disabled = (currentTheme === 'light-mode');
    }

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const newTheme = document.documentElement.className === 'dark-mode' ? 'light-mode' : 'dark-mode';
            setCookie('theme', newTheme, 365); // Ustaw ciasteczko na 365 dni
            document.documentElement.className = newTheme;
            if (darkThemeLink) {
                darkThemeLink.disabled = (newTheme === 'light-mode');
            }
        });
    }
}