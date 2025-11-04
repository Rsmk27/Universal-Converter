document.addEventListener('DOMContentLoaded', () => {
    const inputValue = document.getElementById('input-value');
    const outputValue = document.getElementById('output-value');
    const fromUnit = document.getElementById('from-unit');
const converterId = document.body.dataset.converter;

    const units = ['Decimal', 'Binary', 'Octal', 'Hexadecimal'];

    units.forEach(unit => {
        fromUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
        toUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
    });

    function convert() {
        const from = fromUnit.value;
        const to = toUnit.value;
        const value = inputValue.value;

        try {
            const fromBase = { 'Binary': 2, 'Octal': 8, 'Decimal': 10, 'Hexadecimal': 16 }[from];
            const toBase = { 'Binary': 2, 'Octal': 8, 'Decimal': 10, 'Hexadecimal': 16 }[to];
            const decimalValue = parseInt(value, fromBase);
            if(isNaN(decimalValue)) {
                outputValue.value = 'Invalid input';
                return;
            }
            outputValue.value = decimalValue.toString(toBase).toUpperCase();
            saveLastConversion();
        } catch (e) {
            outputValue.value = 'Error';
        }
    }

    function saveLastConversion() {
        const data = { 
            value: inputValue.value, 
            from: fromUnit.value, 
            to: toUnit.value 
        };
        localStorage.setItem('last-number-system', JSON.stringify(data));
    }

    function loadLastConversion() {
        const lastData = localStorage.getItem('last-number-system');
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
