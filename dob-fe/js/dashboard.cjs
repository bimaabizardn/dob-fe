document.addEventListener('DOMContentLoaded', async () => {
    const patientsTableBody = document.getElementById('patients-table').getElementsByTagName('tbody')[0];
    const addPatientButton = document.getElementById('add-patient-button');
    let patientsList = [];

    // Ambil data pasien dari localStorage atau API jika perlu
    async function fetchPatients() {
        // Asumsikan Anda sudah mendapatkan data pasien yang sesuai
        const token = getAuthToken();
        const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/pasien', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const patients = await handleFetchError(response);
        localStorage.setItem('patientsList', JSON.stringify(patients));
        displayPatients(patients);
    }

    // Fungsi untuk menampilkan pasien di tabel
    function displayPatients(patients) {
        patientsList = patients;
        patientsTableBody.innerHTML = '';

        patients.forEach(patient => {
            const row = patientsTableBody.insertRow();
            row.insertCell().textContent = patient.nama;
            row.insertCell().textContent = patient.usia;
            row.insertCell().textContent = patient.jenis_kelamin;
            row.insertCell().textContent = patient.tanggal_masuk ? patient.tanggal_masuk.split('T')[0] : '';
            row.insertCell().textContent = patient.bb;
            row.insertCell().textContent = patient.gol_darah;
            row.insertCell().textContent = patient.tb;
        });
    }

    // Menghitung jumlah pasien per hari
    function getPatientsPerDay(patients) {
        const patientCount = {};
        patients.forEach(patient => {
            const date = patient.tanggal_masuk.split('T')[0];  // Ambil tanggal (YYYY-MM-DD)
            if (patientCount[date]) {
                patientCount[date]++;
            } else {
                patientCount[date] = 1;
            }
        });
        return patientCount;
    }

    // Menyiapkan data untuk grafik
    function prepareChartData(patientCount) {
        const dates = Object.keys(patientCount);
        const counts = Object.values(patientCount);

        return {
            labels: dates,
            datasets: [{
                label: 'Jumlah Pasien Harian',
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',  // Warna grafik
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };
    }

    // Menampilkan grafik di canvas
    function displayPatientChart(patientCount) {
        const ctx = document.getElementById('patientChart').getContext('2d');
        const chartData = prepareChartData(patientCount);

        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Ambil data pasien dan tampilkan grafik serta tabel
    await fetchPatients();

    // Menghitung dan menampilkan grafik setelah data pasien tersedia
    const patientCount = getPatientsPerDay(patientsList);
    displayPatientChart(patientCount);
});