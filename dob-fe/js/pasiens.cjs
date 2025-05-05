document.addEventListener('DOMContentLoaded', () => {
    const patientsTableBody = document.getElementById('patients-table').getElementsByTagName('tbody')[0];
    const addPatientButton = document.getElementById('add-patient-button');
    const editModal = document.getElementById('edit-patient-modal');
    const editForm = document.getElementById('edit-patient-form');
    const deleteModal = document.getElementById('delete-patient-modal');
    const confirmDeleteButton = document.getElementById('confirm-delete-button');
    let currentPatientId = null;

    async function fetchPatients() {
        try {
            const token = getAuthToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/pasien/bulk', {
                headers: headers,
            });

            const patients = await handleFetchError(response);
            displayPatients(patients, patientsTableBody);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            // Tampilkan pesan error ke pengguna jika perlu
        }
    }

    function displayPatients(patients, tableBody) {
        tableBody.innerHTML = '';

        if (Array.isArray(patients)) {
            patients.forEach(patient => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = patient.nama;
                row.insertCell().textContent = patient.usia;
                row.insertCell().textContent = patient.jenis_kelamin;
                row.insertCell().textContent = patient.tanggal_masuk ? patient.tanggal_masuk.split('T')[0] : '';
                row.insertCell().textContent = patient.bb;
                row.insertCell().textContent = patient.gol_darah;
                row.insertCell().textContent = patient.tb;

                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button class="edit-button" data-id="${patient.id_pasien}">Edit</button>
                    <button class="delete-button" data-id="${patient.id_pasien}">Delete</button>
                `;
            });
        } else if (patients) {
            const row = tableBody.insertRow();
            row.insertCell().textContent = patients.nama;
            row.insertCell().textContent = patients.usia;
            row.insertCell().textContent = patients.jenis_kelamin;
            row.insertCell().textContent = patients.tanggal_masuk ? patients.tanggal_masuk.split('T')[0] : '';
            row.insertCell().textContent = patients.bb;
            row.insertCell().textContent = patients.gol_darah;
            row.insertCell().textContent = patients.tb;

            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <button class="edit-button" data-id="${patients.id_pasien}">Edit</button>
                <button class="delete-button" data-id="${patients.id_pasien}">Delete</button>
            `;
        }

        // Event listeners ditambahkan setelah tabel diisi (menggunakan event delegation)
    }

    document.getElementById('patients-table').addEventListener('click', async(event) => {
        if (event.target.classList.contains('edit-button')) {
            const patientId = event.target.dataset.id;
            currentPatientId = patientId;
            await populateEditModal(patientId);
            editModal.style.display = 'block';
        } else if (event.target.classList.contains('delete-button')) {
            const patientId = event.target.dataset.id;
            currentPatientId = patientId;
            deleteModal.style.display = 'block';
        }
    });

    async function populateEditModal(patientId) {
        try {
            const token = getAuthToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/pasien/${patientId}`, {
                headers: headers,
            });
            const patient = await handleFetchError(response);
            document.getElementById('edit-nama').value = patient.nama;
            document.getElementById('edit-usia').value = patient.usia;
            document.getElementById('edit-jenis-kelamin').value = patient.jenis_kelamin;
            document.getElementById('edit-tanggal-masuk').value = patient.tanggal_masuk ? patient.tanggal_masuk.split('T')[0] : '';
            document.getElementById('edit-bb').value = patient.bb;
            document.getElementById('edit-gol-darah').value = patient.gol_darah;
            document.getElementById('edit-tb').value = patient.tb;
        } catch (error) {
            console.error('Failed to fetch patient details for edit:', error);
            // Tampilkan pesan error
        }
    }

    if (editForm) {
        editForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            if (currentPatientId) {
                const nama = document.getElementById('edit-nama').value;
                const usia = document.getElementById('edit-usia').value;
                const jenis_kelamin = document.getElementById('edit-jenis-kelamin').value;
                const tanggal_masuk = document.getElementById('edit-tanggal-masuk').value;
                const bb = document.getElementById('edit-bb').value;
                const gol_darah = document.getElementById('edit-gol-darah').value;
                const tb = document.getElementById('edit-tb').value;

                try {
                    const token = getAuthToken();
                    const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/pasien/${currentPatientId}`, { // Perbaiki endpoint edit
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ nama, usia, jenis_kelamin, tanggal_masuk, bb, gol_darah, tb }),
                    });
                    await handleFetchError(response);
                    fetchPatients();
                    editModal.style.display = 'none';
                    currentPatientId = null;
                    // Tampilkan pesan sukses
                } catch (error) {
                    console.error('Failed to update patient:', error);
                    // Tampilkan pesan error
                }
            }
        });

        const closeEditModalButton = document.getElementById('close-edit-modal');
        if (closeEditModalButton) {
            closeEditModalButton.addEventListener('click', () => {
                editModal.style.display = 'none';
                currentPatientId = null;
            });
        }
    }

    if (addPatientButton) {
        const addPatientModal = document.getElementById('add-patient-modal');
        const addPatientForm = document.getElementById('add-patient-form');
        const closeAddModalButton = document.getElementById('close-add-modal');

        addPatientButton.addEventListener('click', () => {
            addPatientModal.style.display = 'block';
        });

        if (closeAddModalButton) {
            closeAddModalButton.addEventListener('click', () => {
                addPatientModal.style.display = 'none';
                addPatientForm.reset();
            });
        }

        if (addPatientForm) {
            addPatientForm.addEventListener('submit', async(event) => {
                event.preventDefault();
                const nama = document.getElementById('add-nama').value;
                const usia = document.getElementById('add-usia').value;
                const jenis_kelamin = document.getElementById('add-jenis-kelamin').value;
                const tanggal_masuk = document.getElementById('add-tanggal-masuk').value;
                const bb = document.getElementById('add-bb').value;
                const gol_darah = document.getElementById('add-gol-darah').value;
                const tb = document.getElementById('add-tb').value;

                try {
                    const token = getAuthToken();
                    const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/pasien', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ nama, usia, jenis_kelamin, tanggal_masuk, bb, gol_darah, tb }),
                    });
                    await handleFetchError(response);
                    fetchPatients();
                    addPatientModal.style.display = 'none';
                    addPatientForm.reset();
                    // Tampilkan pesan sukses
                } catch (error) {
                    console.error('Failed to add patient:', error);
                    // Tampilkan pesan error
                }
            });
        }
    }

    if (deleteModal) {
        const closeDeleteModalButton = document.getElementById('close-delete-modal');
        if (closeDeleteModalButton) {
            closeDeleteModalButton.addEventListener('click', () => {
                deleteModal.style.display = 'none';
                currentPatientId = null;
            });
        }

        confirmDeleteButton.addEventListener('click', async() => {
            if (currentPatientId) {
                try {
                    const token = getAuthToken();
                    const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/pasien/${currentPatientId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    await handleFetchError(response);
                    fetchPatients();
                    deleteModal.style.display = 'none';
                    currentPatientId = null;
                    // Tampilkan pesan sukses
                } catch (error) {
                    console.error('Failed to delete patient:', error);
                    // Tampilkan pesan error
                }
            }
        });
    }

    fetchPatients();
});

function getAuthToken() {
    // Implementasi sebenarnya untuk mengambil token otentikasi
    // Contoh:
    return localStorage.getItem('authToken');
    // Atau dari cookie, state manajemen, dll.
}

async function handleFetchError(response) {
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorBody = await response.json();
            if (errorBody && errorBody.message) {
                errorMessage = errorBody.message;
            }
        } catch (e) {
            console.error("Failed to parse error JSON:", e);
        }
        throw new Error(errorMessage);
    }
    return response.json();
}