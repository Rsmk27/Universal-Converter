document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const searchBar = document.getElementById('search-bar');
    const converterGrid = document.getElementById('converter-grid');

    const converters = [
        { name: 'Currency', icon: 'fas fa-exchange-alt', subtitle: 'Exchange rates', href: 'currency.html' },
        { name: 'Speed', icon: 'fas fa-tachometer-alt', subtitle: 'Kilometers to miles', href: 'speed.html' },
        { name: 'Age', icon: 'fas fa-birthday-cake', subtitle: 'Calculate your age', href: 'age.html' },
        { name: 'Area', icon: 'fas fa-ruler-combined', subtitle: 'Square meters to acres', href: 'area.html' },
        { name: 'Data', icon: 'fas fa-database', subtitle: 'Megabytes to gigabytes', href: 'data.html' },
        { name: 'Length', icon: 'fas fa-ruler', subtitle: 'Meters to feet', href: 'length.html' },
        { name: 'Mass', icon: 'fas fa-weight-hanging', subtitle: 'Kilograms to pounds', href: 'mass.html' },
        { name: 'Number System', icon: 'fas fa-calculator', subtitle: 'Decimal to binary', href: 'number-system.html' },
        { name: 'Temperature', icon: 'fas fa-thermometer-half', subtitle: 'Celsius to Fahrenheit', href: 'temperature.html' },
        { name: 'Volume', icon: 'fas fa-flask', subtitle: 'Liters to gallons', href: 'volume.html' },
    ];

    // --- THEME --- 
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        theme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    });

    function updateThemeIcon(theme) {
        const icon = theme === 'light' ? 'fa-sun' : 'fa-moon';
        themeToggle.innerHTML = `<i class="fas ${icon}"></i>`;
    }

    // --- RENDER CONVERTERS --- 
    function renderConverters(filter = '') {
        converterGrid.innerHTML = '';
        converters
            .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.subtitle.toLowerCase().includes(filter.toLowerCase()))
            .forEach(converter => {
                const card = document.createElement('a');
                card.href = converter.href;
                card.className = 'converter-card';
                card.innerHTML = `
                    <i class="${converter.icon}"></i>
                    <h3>${converter.name}</h3>
                    <p>${converter.subtitle}</p>
                `;
                converterGrid.appendChild(card);
            });
    }

    // --- SEARCH --- 
    searchBar.addEventListener('input', () => renderConverters(searchBar.value));

    // --- INITIALIZATION --- 
    renderConverters();
});
