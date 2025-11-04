document.addEventListener('DOMContentLoaded', () => {
    const inputValue = document.getElementById('input-value');
    const outputValue = document.getElementById('output-value');
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    const converterId = document.body.dataset.converter;

    const units = ['m/s', 'km/h', 'mph', 'knot'];

    units.forEach(unit => {
        fromUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
        toUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
    });

    const conversionFactors = {
        speed: { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'knot': 0.514444 },
        area: { 'm²': 1, 'km²': 1e6, 'sq ft': 0.092903, 'acre': 4046.86 },
        data: { 'B': 1, 'KB': 1024, 'MB': 1024**2, 'GB': 1024**3, 'TB': 1024**4 },
        length: { 'm': 1, 'km': 1000, 'cm': 0.01, 'mm': 0.001, 'in': 0.0254, 'ft': 0.3048, 'yd': 0.9144, 'mi': 1609.34 },
        mass: { 'g': 1, 'kg': 1000, 'mg': 0.001, 'lb': 453.592, 'oz': 28.3495 },
        volume: { 'L': 1, 'mL': 0.001, 'gal (US)': 3.78541, 'pt (US)': 0.473176 }
    };

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

    [inputValue, fromUnit, toUnit].forEach(el => el.addEventListener('input', convert));

    loadLastConversion();
});
