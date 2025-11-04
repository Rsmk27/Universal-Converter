document.addEventListener('DOMContentLoaded', () => {
    const inputValue = document.getElementById('input-value');
    const outputValue = document.getElementById('output-value');
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');

    let currencyRates = {};

    async function fetchCurrencyRates() {
        try {
            const response = await fetch('https://api.exchangerate.host/latest');
            const data = await response.json();
            currencyRates = data.rates;
            const currencies = Object.keys(currencyRates);
            currencies.forEach(currency => {
                fromUnit.innerHTML += `<option value="${currency}">${currency}</option>`;
                toUnit.innerHTML += `<option value="${currency}">${currency}</option>`;
            });
            loadLastConversion();
        } catch (error) {
            console.error("Error fetching currency rates:", error);
        }
    }

    function convert() {
        const from = fromUnit.value;
        const to = toUnit.value;
        const value = parseFloat(inputValue.value);

        if (isNaN(value) || !currencyRates[from] || !currencyRates[to]) {
            outputValue.value = '';
            return;
        }

        const result = value * (currencyRates[to] / currencyRates[from]);
        outputValue.value = parseFloat(result.toPrecision(5));
        saveLastConversion();
    }

    function saveLastConversion() {
        const data = { 
            value: inputValue.value, 
            from: fromUnit.value, 
            to: toUnit.value 
        };
        localStorage.setItem('last-currency', JSON.stringify(data));
    }

    function loadLastConversion() {
        const lastData = localStorage.getItem('last-currency');
        if (lastData) {
            const data = JSON.parse(lastData);
            inputValue.value = data.value;
            fromUnit.value = data.from;
            toUnit.value = data.to;
            convert();
        }
    }

    [inputValue, fromUnit, toUnit].forEach(el => el.addEventListener('input', convert));

    fetchCurrencyRates();
    loadLastConversion();
});
