
const app = (() => {
    // --- Data & Configuration ---
    const converters = {
        length: {
            title: 'Length Converter',
            icon: 'fa-ruler-combined',
            desc: 'Convert meters, feet, miles, and more.',
            type: 'standard',
            base: 'm', // Base unit for conversion factors
            units: {
                'm': 1,
                'km': 1000,
                'cm': 0.01,
                'mm': 0.001,
                'in': 0.0254,
                'ft': 0.3048,
                'yd': 0.9144,
                'mi': 1609.34
            }
        },
        mass: {
            title: 'Mass Converter',
            icon: 'fa-weight-hanging',
            desc: 'Convert grams, pounds, ounces, and more.',
            type: 'standard',
            base: 'g',
            units: {
                'g': 1,
                'kg': 1000,
                'mg': 0.001,
                'lb': 453.592,
                'oz': 28.3495
            }
        },
        temperature: {
            title: 'Temperature Converter',
            icon: 'fa-thermometer-half',
            desc: 'Convert Celsius, Fahrenheit, and Kelvin.',
            type: 'temperature',
            units: ['Celsius', 'Fahrenheit', 'Kelvin']
        },
        area: {
            title: 'Area Converter',
            icon: 'fa-chart-area',
            desc: 'Convert square meters, acres, and hectares.',
            type: 'standard',
            base: 'm²',
            units: {
                'm²': 1,
                'km²': 1e6,
                'sq ft': 0.092903,
                'acre': 4046.86,
                'hectare': 10000
            }
        },
        volume: {
            title: 'Volume Converter',
            icon: 'fa-cube',
            desc: 'Convert liters, gallons, pints, and more.',
            type: 'standard',
            base: 'L',
            units: {
                'L': 1,
                'mL': 0.001,
                'gal (US)': 3.78541,
                'pt (US)': 0.473176,
                'fl oz (US)': 0.0295735
            }
        },
        speed: {
            title: 'Speed Converter',
            icon: 'fa-tachometer-alt',
            desc: 'Convert m/s, km/h, mph, and knots.',
            type: 'standard',
            base: 'm/s',
            units: {
                'm/s': 1,
                'km/h': 0.277778,
                'mph': 0.44704,
                'knot': 0.514444
            }
        },
        data: {
            title: 'Data Converter',
            icon: 'fa-hdd',
            desc: 'Convert Bytes, KB, MB, GB, TB.',
            type: 'standard',
            base: 'B',
            units: {
                'B': 1,
                'KB': 1024,
                'MB': 1048576, // 1024^2
                'GB': 1073741824, // 1024^3
                'TB': 1099511627776 // 1024^4
            }
        },
        currency: {
            title: 'Currency Converter',
            icon: 'fa-coins',
            desc: 'Real-time exchange rates.',
            type: 'currency',
            loaded: false,
            rates: {}
        },
        age: {
            title: 'Age Calculator',
            icon: 'fa-birthday-cake',
            desc: 'Calculate exact age from DOB.',
            type: 'age'
        },
        'number-system': {
            title: 'Number System',
            icon: 'fa-hashtag',
            desc: 'Convert Binary, Decimal, Hex, Octal.',
            type: 'number-system',
            units: ['Decimal', 'Binary', 'Octal', 'Hexadecimal']
        }
    };

    // --- State ---
    let activeConverter = null;
    let currencyRates = {};

    // --- DOM Elements ---
    const dom = {
        homeView: document.getElementById('home-view'),
        converterView: document.getElementById('converter-app'),
        grid: document.getElementById('converter-grid'),
        search: document.getElementById('search-bar'),
        themeToggle: document.getElementById('theme-toggle'),

        // Converter App Elements
        appTitle: document.getElementById('app-title'),
        stdInput: document.getElementById('standard-converter'),
        customInput: document.getElementById('custom-converter-input'),
        amount: document.getElementById('amount'),
        fromUnit: document.getElementById('from-unit'),
        toUnit: document.getElementById('to-unit'),
        result: document.getElementById('result'),
        swapBtn: document.getElementById('swap-btn')
    };

    // --- Initialization ---
    function init() {
        renderGrid(Object.entries(converters));
        setupEventListeners();
        setupTheme();
    }

    // --- View Logic ---
    function renderGrid(list) {
        dom.grid.innerHTML = list.map(([key, data]) => `
            <div class="converter-card" onclick="app.loadConverter('${key}')">
                <div class="icon-wrapper">
                    <i class="fas ${data.icon}"></i>
                </div>
                <h3>${data.title}</h3>
                <p>${data.desc}</p>
            </div>
        `).join('');
    }

    function showHome() {
        dom.converterView.style.display = 'none';
        dom.homeView.style.display = 'block';
        activeConverter = null;
        updateTitle('Universal Converter Hub');
    }

    function loadConverter(key) {
        activeConverter = converters[key];
        if (!activeConverter) return;

        dom.homeView.style.display = 'none';
        dom.converterView.style.display = 'block';
        dom.appTitle.textContent = activeConverter.title;
        updateTitle(activeConverter.title);

        // Reset UI
        dom.amount.value = '';
        dom.result.textContent = '---';
        dom.fromUnit.innerHTML = '';
        dom.toUnit.innerHTML = '';

        // Setup UI based on type
        if (activeConverter.type === 'age') {
            setupAgeUI();
        } else {
            setupStandardUI();
        }
    }

    function updateTitle(text) {
        document.title = text + ' | UCH';
    }

    // --- UI Setup & Logic ---
    function setupStandardUI() {
        dom.stdInput.style.display = 'block';
        dom.customInput.style.display = 'none';

        // Set input type
        if (activeConverter.type === 'number-system') {
            dom.amount.type = 'text';
        } else {
            dom.amount.type = 'number';
        }

        // Populate Selects
        let keys = [];
        if (activeConverter.type === 'currency') {
            handleCurrencySetup();
            return; // Async handling
        } else if (Array.isArray(activeConverter.units)) {
            keys = activeConverter.units;
        } else {
            keys = Object.keys(activeConverter.units);
        }

        populateSelects(keys);
        calculate(); // Initial trigger
    }

    function populateSelects(keys) {
        const options = keys.map(k => `<option value="${k}">${k}</option>`).join('');
        dom.fromUnit.innerHTML = options;
        dom.toUnit.innerHTML = options;

        // Set defaults if possible (e.g. 2nd option for 'to')
        if (keys.length > 1) {
            dom.toUnit.selectedIndex = 1;
        }
    }

    function setupAgeUI() {
        dom.stdInput.style.display = 'none';
        dom.customInput.style.display = 'block';
        dom.customInput.innerHTML = `
            <div class="input-row">
                <div class="input-group">
                    <label>Date of Birth</label>
                    <input type="date" id="age-input">
                </div>
            </div>
        `;
        document.getElementById('age-input').addEventListener('change', calculateAge);
    }

    async function handleCurrencySetup() {
        // Show loading state
        dom.fromUnit.innerHTML = '<option>Loading...</option>';
        dom.toUnit.innerHTML = '<option>Loading...</option>';

        if (Object.keys(currencyRates).length === 0) {
            try {
                // Fetch rates (using a free API)
                // Note: API keys might be needed for production. using exchangerate-api for demo or existing logic
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await res.json();
                currencyRates = data.rates;
            } catch (e) {
                console.error('Currency Fetch Error', e);
                dom.result.textContent = "Error loading rates";
                return;
            }
        }

        populateSelects(Object.keys(currencyRates));
        dom.fromUnit.value = 'USD';
        dom.toUnit.value = 'EUR';
    }

    // --- Calculation Engine ---
    function calculate() {
        if (!activeConverter) return;

        if (activeConverter.type === 'age') {
            calculateAge();
            return;
        }

        const val = parseFloat(dom.amount.value);
        const from = dom.fromUnit.value;
        const to = dom.toUnit.value;

        if (isNaN(val)) {
            dom.result.textContent = '---';
            return;
        }

        let result = 0;

        try {
            if (activeConverter.type === 'standard') {
                // Base unit conversion
                const fromFactor = activeConverter.units[from];
                const toFactor = activeConverter.units[to];
                // Convert to base, then to target
                // value * fromFactor = base value
                // base value / toFactor = target value
                result = (val * fromFactor) / toFactor;

            } else if (activeConverter.type === 'temperature') {
                result = convertTemperature(val, from, to);

            } else if (activeConverter.type === 'currency') {
                // Base is USD in our fetched data
                const fromRate = currencyRates[from];
                const toRate = currencyRates[to];
                // Convert to USD (val / fromRate), then to target (* toRate)
                result = (val / fromRate) * toRate;

            } else if (activeConverter.type === 'number-system') {
                result = convertNumberSystem(dom.amount.value, from, to);
                // Note: Dom.amount.value is string here because hex can have letters
            }

            // Format result
            if (activeConverter.type === 'number-system') {
                dom.result.textContent = result; // String result
            } else {
                dom.result.textContent = formatNumber(result);
            }

        } catch (e) {
            console.error(e);
            dom.result.textContent = "Error";
        }
    }

    function calculateAge() {
        const input = document.getElementById('age-input').value;
        if (!input) return;

        const dob = new Date(input);
        const now = new Date();

        if (dob > now) {
            dom.result.textContent = "Invalid Date";
            return;
        }

        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        let days = now.getDate() - dob.getDate();

        if (days < 0) {
            months--;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        dom.result.textContent = `${years}y ${months}m ${days}d`;
    }

    function convertTemperature(val, from, to) {
        if (from === to) return val;

        let celsius;
        // To Celsius
        if (from === 'Celsius') celsius = val;
        else if (from === 'Fahrenheit') celsius = (val - 32) * 5 / 9;
        else if (from === 'Kelvin') celsius = val - 273.15;

        // From Celsius
        if (to === 'Celsius') return celsius;
        else if (to === 'Fahrenheit') return (celsius * 9 / 5) + 32;
        else if (to === 'Kelvin') return celsius + 273.15;
    }

    function convertNumberSystem(val, from, to) {
        let decimal;
        // Parse to Decimal
        try {
            if (from === 'Decimal') decimal = parseInt(val, 10);
            else if (from === 'Binary') decimal = parseInt(val, 2);
            else if (from === 'Octal') decimal = parseInt(val, 8);
            else if (from === 'Hexadecimal') decimal = parseInt(val, 16);
        } catch { return "Invalid Input"; }

        if (isNaN(decimal)) return "Invalid Input";

        // Convert to Target
        if (to === 'Decimal') return decimal.toString(10);
        else if (to === 'Binary') return decimal.toString(2);
        else if (to === 'Octal') return decimal.toString(8);
        else if (to === 'Hexadecimal') return decimal.toString(16).toUpperCase();
    }

    function formatNumber(num) {
        if (Math.abs(num) < 0.000001 || Math.abs(num) > 1e9) {
            return num.toExponential(4);
        }
        return parseFloat(num.toPrecision(6)).toString(); // Clean trailing zeros
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Input Changes
        dom.amount.addEventListener('input', calculate);
        dom.fromUnit.addEventListener('change', calculate);
        dom.toUnit.addEventListener('change', calculate);

        // Swap Button
        dom.swapBtn.addEventListener('click', () => {
            const temp = dom.fromUnit.value;
            dom.fromUnit.value = dom.toUnit.value;
            dom.toUnit.value = temp;
            calculate();
        });

        // Search
        dom.search.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = Object.entries(converters).filter(([key, data]) =>
                data.title.toLowerCase().includes(query) ||
                key.toLowerCase().includes(query)
            );
            renderGrid(filtered);
        });

        // Number System Special Input Handling
        dom.amount.addEventListener('keydown', (e) => {
            // Allow letters if Hex is selected, or handle validation
            // For simplicity, we stick to type="number" or change it dynamically.
            // Actually, type="number" prevents Hex letters (A-F).
            // We should change input type if number system.

            if (activeConverter && activeConverter.type === 'number-system') {
                dom.amount.type = 'text';
            } else {
                dom.amount.type = 'number';
            }
        });
    }

    // --- Theme Logic ---
    function setupTheme() {
        // Force dark mode as default if not already set
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);

        dom.themeToggle.addEventListener('click', () => {
            const current = document.body.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const icon = dom.themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    return {
        init,
        loadConverter,
        showHome
    };
})();

document.addEventListener('DOMContentLoaded', app.init);
