document.addEventListener('DOMContentLoaded', () => {
    const dobInput = document.getElementById('input-value');
    const outputValue = document.getElementById('output-value');

    function calculateAge() {
        const dobString = dobInput.value;
        if (!dobString) {
            outputValue.value = '';
            return;
        }

        const dob = new Date(dobString);
        const now = new Date();

        if (isNaN(dob.getTime()) || dob > now) {
            outputValue.value = 'Invalid date';
            return;
        }

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

        outputValue.value = `${ageYears} years, ${ageMonths} months, ${ageDays} days`;
        saveLastConversion();
    }

    function saveLastConversion() {
        localStorage.setItem('last-age', dobInput.value);
    }

    function loadLastConversion() {
        const lastData = localStorage.getItem('last-age');
        if (lastData) {
            dobInput.value = lastData;
            calculateAge();
        }
    }

    dobInput.addEventListener('input', calculateAge);

    loadLastConversion();
});
