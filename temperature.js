document.addEventListener('DOMContentLoaded', () => {
    const inputValue = document.getElementById('input-value');
    const outputValue = document.getElementById('output-value');
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');

const converterId = document.body.dataset.converter;

    const units = ['Celsius', 'Fahrenheit', 'Kelvin'];

    units.forEach(unit => {
        fromUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
        toUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
    });

    function convert() {
        const from = fromUnit.value;
        const to = toUnit.value;
        const value = parseFloat(inputValue.value);

        if (isNaN(value)) {
            outputValue.value = '';
            return;
        }

        if (from === to) {
            outputValue.value = value;
            saveLastConversion();
            return;
        }

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

        outputValue.value = parseFloat(result.toPrecision(5));
        saveLastConversion();
    }

    function saveLastConversion() {
        const data = { 
            value: inputValue.value, 
            from: fromUnit.value, 
            to: toUnit.value 
        };
        localStorage.setItem('last-temperature', JSON.stringify(data));
    }

    function loadLastConversion() {
        const lastData = localStorage.getItem('last-temperature');
        if (lastData) {
            const data = JSON.parse(lastData);
            inputValue.value = data.value;
            fromUnit.value = data.from;
            toUnit.value = data.to;
            convert();
        }
    }

    [inputValue, fromUnit, toUnit].forEach(el => el.addEventListener('input', convert));

    loadLastConversion();
});
