document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const converterTitle = document.getElementById('converter-title');
    const inputValue = document.getElementById('input-value');
    const outputValue = document.getElementById('output-value');
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    const clearBtn = document.getElementById('clear-btn');
    const formulaTooltip = document.getElementById('formula-tooltip');

    const converterId = document.body.dataset.converter;

    const units = ['g', 'kg', 'mg', 'lb', 'oz'];

    units.forEach(unit => {
        fromUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
        toUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
    });

    const converters = {
        currency: { title: 'Currency Converter', units: [], formula: 'Based on latest exchange rates' },
        speed: { title: 'Speed Converter', units: ['m/s', 'km/h', 'mph', 'knot'], formula: 'Based on meters per second' },
        age: { title: 'Age Calculator', units: [], formula: 'Calculates age from date of birth' },
        area: { title: 'Area Converter', units: ['m²', 'km²', 'sq ft', 'acre'], formula: 'Based on square meters' },
        data: { title: 'Data Converter', units: ['B', 'KB', 'MB', 'GB', 'TB'], formula: '1 KB = 1024 Bytes' },
        length: { title: 'Length Converter', units: ['m', 'km', 'cm', 'mm', 'in', 'ft', 'yd', 'mi'], formula: 'Based on meters' },
        mass: { title: 'Mass Converter', units: ['g', 'kg', 'mg', 'lb', 'oz'], formula: 'Based on grams' },
        'number-system': { title: 'Number System Converter', units: ['Decimal', 'Binary', 'Octal', 'Hexadecimal'], formula: 'Converts between number bases' },
        temperature: { title: 'Temperature Converter', units: ['Celsius', 'Fahrenheit', 'Kelvin'], formula: 'C to F: (C * 9/5) + 32' },
        volume: { title: 'Volume Converter', units: ['L', 'mL', 'gal (US)', 'pt (US)'], formula: 'Based on liters' }
    };

    const converter = converters[converterId];

    const conversionFactors = {
        speed: { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knot': 0.514444 },
        area: { 'm²': 1, 'km²': 1e6, 'sq ft': 0.092903, 'acre': 4046.86 },
        data: { 'B': 1, 'KB': 1024, 'MB': 1024**2, 'GB': 1024**3, 'TB': 1024**4 },
        length: { 'm': 1, 'km': 1000, 'cm': 0.01, 'mm': 0.001, 'in': 0.0254, 'ft': 0.3048, 'yd': 0.9144, 'mi': 1609.34 },
        mass: { 'g': 1, 'kg': 1000, 'mg': 0.001, 'lb': 453.592, 'oz': 28.3495 },
        volume: { 'L': 1, 'mL': 0.001, 'gal (US)': 3.78541, 'pt (US)': 0.473176 }
    };

    // --- INITIALIZE PAGE --- 
    converterTitle.textContent = converter.title;
    if (formulaTooltip) {
        formulaTooltip.querySelector('.tooltiptext').textContent = converter.formula;
    }

    if (converter.units.length > 0) {
        converter.units.forEach(unit => {
            fromUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
            toUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
        });
    }

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

    function convert() {
        const from = fromUnit.value;
        const to = toUnit.value;
        const value = parseFloat(inputValue.value);
        const factors = conversionFactors[converterId];

        if (isNaN(value) || !factors || !factors[from] || !factors[to]) {
            outputValue.value = '';
            return;
        }

        const result = value * factors[from] / factors[to];
        outputValue.value = parseFloat(result.toPrecision(5));
        saveLastConversion();
    }

    function saveLastConversion() {
        const data = { 
            value: inputValue.value, 
            from: fromUnit.value, 
            to: toUnit.value 
        };
        localStorage.setItem(`last-${converterId}`, JSON.stringify(data));
    }

    function loadLastConversion() {
        const lastData = localStorage.getItem(`last-${converterId}`);
        if (lastData) {
            const data = JSON.parse(lastData);
            inputValue.value = data.value;
            fromUnit.value = data.from;
            toUnit.value = data.to;
            convert();
        }
    }

    // --- EVENT LISTENERS --- 
    [inputValue, fromUnit, toUnit].forEach(el => {
        if(el) el.addEventListener('input', convert);
    });

    if(clearBtn) {
        clearBtn.addEventListener('click', () => {
            inputValue.value = '';
            outputValue.value = '';
        });
    }

    loadLastConversion();
});