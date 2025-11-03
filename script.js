document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    const searchBar = document.getElementById('search-bar');
    const themeToggle = document.getElementById('theme-toggle');

    const converters = [
        { id: 'currency', name: 'Currency', units: [] },
        { id: 'speed', name: 'Speed', units: ['m/s', 'km/h', 'mph', 'knot'] },
        { id: 'age', name: 'Age', units: [] }, // Special case
        { id: 'area', name: 'Area', units: ['m²', 'km²', 'sq ft', 'acre'] },
        { id: 'data', name: 'Data', units: ['B', 'KB', 'MB', 'GB', 'TB'] },
        { id: 'length', name: 'Length', units: ['m', 'km', 'cm', 'mm', 'in', 'ft', 'yd', 'mi'] },
        { id: 'mass', name: 'Mass', units: ['g', 'kg', 'mg', 'lb', 'oz'] },
        { id: 'number-system', name: 'Number System', units: ['Decimal', 'Binary', 'Octal', 'Hexadecimal'] },
        { id: 'temperature', name: 'Temperature', units: ['Celsius', 'Fahrenheit', 'Kelvin'] },
        { id: 'volume', name: 'Volume', units: ['L', 'mL', 'gal (US)', 'pt (US)'] }
    ];

    const formulas = {
        speed: "Based on meters per second",
        area: "Based on square meters",
        data: "1 KB = 1024 Bytes",
        length: "Based on meters",
        mass: "Based on grams",
        temperature: "C to F: (C * 9/5) + 32",
        volume: "Based on liters"
    };

    let currencyRates = {};

    // --- THEME ---
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        theme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    // --- RENDER CONVERTERS ---
    function renderConverters(filter = '') {
        mainContent.innerHTML = '';
        converters
            .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
            .forEach(converter => {
                const card = document.createElement('div');
                card.className = 'converter-card';
                card.id = converter.id;

                let specialFields = '';
                if (converter.id === 'age') {
                    specialFields = `
                        <div class="input-group">
                            <label for="input-${converter.id}">Date of Birth</label>
                            <input type="date" id="input-${converter.id}">
                        </div>
                    `;
                } else {
                    specialFields = `
                        <div class="input-group">
                            <label for="input-${converter.id}">Value</label>
                            <input type="text" id="input-${converter.id}" placeholder="Enter value">
                        </div>
                        <div class="input-group">
                            <label for="from-${converter.id}">From</label>
                            <select id="from-${converter.id}"></select>
                        </div>
                        <div class="input-group">
                            <label for="to-${converter.id}">To</label>
                            <select id="to-${converter.id}"></select>
                        </div>
                    `;
                }

                const formula = formulas[converter.id] ? `<div class="tooltip">&#9432;<span class="tooltiptext">${formulas[converter.id]}</span></div>` : '';

                card.innerHTML = `
                    <h2 style="display: flex; justify-content: space-between; align-items: center;">${converter.name} ${formula}</h2>
                    ${specialFields}
                    <div class="output-group">
                        Result: <span id="output-${converter.id}"></span>
                    </div>
                    <button id="clear-${converter.id}">Clear</button>
                `;
                mainContent.appendChild(card);

                if (converter.id !== 'age') {
                    const fromSelect = document.getElementById(`from-${converter.id}`);
                    const toSelect = document.getElementById(`to-${converter.id}`);
                    if (converter.units.length > 0) {
                        converter.units.forEach(unit => {
                            fromSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
                            toSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
                        });
                    }
                }
                
                // Add event listeners
                const input = document.getElementById(`input-${converter.id}`);
                const output = document.getElementById(`output-${converter.id}`);
                const clearBtn = document.getElementById(`clear-${converter.id}`);

                [input, document.getElementById(`from-${converter.id}`), document.getElementById(`to-${converter.id}`)].forEach(el => {
                    if(el) el.addEventListener('input', () => convert(converter.id));
                });

                clearBtn.addEventListener('click', () => {
                    input.value = '';
                    output.textContent = '';
                    localStorage.removeItem(`last-${converter.id}`);
                });

                loadLastConversion(converter.id);
            });
        
        fetchCurrencyRates();
    }

    // --- SEARCH ---
    searchBar.addEventListener('input', () => renderConverters(searchBar.value));

    // --- NAVIGATION ---
    sidebar.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            document.querySelectorAll('#sidebar a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            const targetId = e.target.getAttribute('href').substring(1);
            const targetCard = document.getElementById(targetId);
            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    // --- CONVERSION LOGIC ---
    function convert(id) {
        const input = document.getElementById(`input-${id}`);
        const fromEl = document.getElementById(`from-${id}`);
        const toEl = document.getElementById(`to-${id}`);
        const output = document.getElementById(`output-${id}`);

        const fromUnit = fromEl ? fromEl.value : null;
        const toUnit = toEl ? toEl.value : null;
        
        let result;
        let value;

        if (id === 'age') {
            value = input.value; // Date string
            if (!value) {
                output.textContent = '';
                return;
            }
        } else {
            value = parseFloat(input.value);
            if (isNaN(value)) {
                output.textContent = '';
                return;
            }
        }

        switch (id) {
            case 'currency': result = convertCurrency(value, fromUnit, toUnit); break;
            case 'speed': result = convertUnits(value, fromUnit, toUnit, { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knot': 0.514444 }); break;
            case 'age': result = calculateAge(value); break;
            case 'area': result = convertUnits(value, fromUnit, toUnit, { 'm²': 1, 'km²': 1e6, 'sq ft': 0.092903, 'acre': 4046.86 }); break;
            case 'data': result = convertUnits(value, fromUnit, toUnit, { 'B': 1, 'KB': 1024, 'MB': 1024**2, 'GB': 1024**3, 'TB': 1024**4 }); break;
            case 'length': result = convertUnits(value, fromUnit, toUnit, { 'm': 1, 'km': 1000, 'cm': 0.01, 'mm': 0.001, 'in': 0.0254, 'ft': 0.3048, 'yd': 0.9144, 'mi': 1609.34 }); break;
            case 'mass': result = convertUnits(value, fromUnit, toUnit, { 'g': 1, 'kg': 1000, 'mg': 0.001, 'lb': 453.592, 'oz': 28.3495 }); break;
            case 'number-system': result = convertNumberSystem(input.value, fromUnit, toUnit); break;
            case 'temperature': result = convertTemperature(value, fromUnit, toUnit); break;
            case 'volume': result = convertUnits(value, fromUnit, toUnit, { 'L': 1, 'mL': 0.001, 'gal (US)': 3.78541, 'pt (US)': 0.473176 }); break;
            default: result = "N/A";
        }

        output.textContent = result;
        saveLastConversion(id, { value, fromUnit, toUnit });
    }

    function convertUnits(value, from, to, conversions) {
        const fromValue = conversions[from];
        const toValue = conversions[to];
        if (fromValue === undefined || toValue === undefined) return "Invalid unit";
        const result = value * fromValue / toValue;
        return parseFloat(result.toPrecision(5));
    }

    function convertTemperature(value, from, to) {
        if (from === to) return value;
        let celsius;
        switch (from) {
            case 'Celsius': celsius = value; break;
            case 'Fahrenheit': celsius = (value - 32) * 5 / 9; break;
            case 'Kelvin': celsius = value - 273.15; break;
        }
        let result;
        switch (to) {
            case 'Celsius': result = celsius; break;
            case 'Fahrenheit': result = (celsius * 9 / 5) + 32; break;
            case 'Kelvin': result = celsius + 273.15; break;
        }
        return parseFloat(result.toPrecision(5));
    }

    function convertNumberSystem(value, from, to) {
        try {
            const fromBase = { 'Binary': 2, 'Octal': 8, 'Decimal': 10, 'Hexadecimal': 16 }[from];
            const toBase = { 'Binary': 2, 'Octal': 8, 'Decimal': 10, 'Hexadecimal': 16 }[to];
            const decimalValue = parseInt(value, fromBase);
            if(isNaN(decimalValue)) return "Invalid input";
            return decimalValue.toString(toBase).toUpperCase();
        } catch (e) {
            return "Error";
        }
    }
    
    function calculateAge(dobString) {
        const dob = new Date(dobString);
        const now = new Date();
        if (isNaN(dob.getTime()) || dob > now) return "Invalid date";
        
        let ageYears = now.getFullYear() - dob.getFullYear();
        let ageMonths = now.getMonth() - dob.getMonth();
        let ageDays = now.getDate() - dob.getDate();

        if (ageDays < 0) {
            ageMonths--;
            ageDays += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        if (ageMonths < 0) {
            ageYears--;
            ageMonths += 12;
        }
        return `${ageYears} years, ${ageMonths} months, ${ageDays} days`;
    }

    async function fetchCurrencyRates() {
        try {
            const response = await fetch('https://api.exchangerate.host/latest');
            const data = await response.json();
            currencyRates = data.rates;
            const currencySelects = document.querySelectorAll('#from-currency, #to-currency');
            const currencies = Object.keys(currencyRates);
            currencySelects.forEach(select => {
                if (select) {
                    currencies.forEach(currency => {
                        select.innerHTML += `<option value="${currency}">${currency}</option>`;
                    });
                    loadLastConversion('currency');
                }
            });
        } catch (error) {
            console.error("Error fetching currency rates:", error);
            const currencyCard = document.getElementById('currency');
            if(currencyCard) currencyCard.innerHTML += "<p>Could not load currency rates.</p>";
        }
    }

    function convertCurrency(value, from, to) {
        if (!currencyRates[from] || !currencyRates[to]) return "Loading rates...";
        const result = value * (currencyRates[to] / currencyRates[from]);
        return parseFloat(result.toPrecision(5));
    }

    // --- LOCALSTORAGE ---
    function saveLastConversion(id, data) {
        localStorage.setItem(`last-${id}`, JSON.stringify(data));
    }

    function loadLastConversion(id) {
        const lastData = localStorage.getItem(`last-${id}`);
        if (lastData) {
            const data = JSON.parse(lastData);
            const input = document.getElementById(`input-${id}`);
            const from = document.getElementById(`from-${id}`);
            const to = document.getElementById(`to-${id}`);

            if (input) input.value = data.value;
            if (from) from.value = data.fromUnit;
            if (to) to.value = data.toUnit;
            
            convert(id);
        }
    }

    // --- INITIALIZATION ---
    renderConverters();
});
