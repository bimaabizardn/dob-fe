document.addEventListener('DOMContentLoaded', async () => {
    const medicalRecordsTableBody = document.getElementById('medical-records-table').getElementsByTagName('tbody')[0];
    const addRecordButton = document.getElementById('add-record-button');
    const editModal = document.getElementById('edit-record-modal');
    const editForm = document.getElementById('edit-record-form');
    const deleteModal = document.getElementById('delete-record-modal');
    const confirmDeleteButton = document.getElementById('confirm-delete-button');
    let currentRecordId = null;

    // Fungsi untuk mengambil data rekam medis
    async function fetchMedicalRecords() {
        try {
            const token = getAuthToken();
            const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis/bulk', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const records = await handleFetchError(response);
            displayMedicalRecords(records);
        } catch (error) {
            console.error('Failed to fetch medical records:', error);
        }
    }

    // Fungsi untuk menampilkan data rekam medis
    function displayMedicalRecords(records) {
        medicalRecordsTableBody.innerHTML = '';

        if (Array.isArray(records) && records.length > 0) {
            records.forEach(record => {
                const row = medicalRecordsTableBody.insertRow();
                row.insertCell().textContent = record.id_pasien;
                row.insertCell().textContent = record.tanggal ? record.tanggal.split('T')[0] : '';
                row.insertCell().textContent = record.diagnosa;

                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button class="edit-button" data-id="${record.id_rekam_medis}">Edit</button>
                    <button class="delete-button" data-id="${record.id_rekam_medis}">Delete</button>
                `;
            });
        } else {
            const row = medicalRecordsTableBody.insertRow();
            row.insertCell().colSpan = 4;
            row.textContent = 'No medical records found.';
        }
    }

    // Event listener untuk tombol edit dan delete
    document.getElementById('medical-records-table').addEventListener('click', async (event) => {
        if (event.target.classList.contains('edit-button')) {
            const recordId = event.target.dataset.id;
            currentRecordId = recordId;
            await populateEditModal(recordId);
            editModal.style.display = 'block';
        } else if (event.target.classList.contains('delete-button')) {
            const recordId = event.target.dataset.id;
            currentRecordId = recordId;
            deleteModal.style.display = 'block';
        }
    });

    // Fungsi untuk mengisi modal edit
    async function populateEditModal(recordId) {
        try {
            const token = getAuthToken();
            const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis/${recordId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const record = await handleFetchError(response);
            document.getElementById('edit-pasien-id').value = record.id_pasien;
            document.getElementById('edit-tanggal').value = record.tanggal ? record.tanggal.split('T')[0] : '';
            document.getElementById('edit-diagnosa').value = record.diagnosa;
        } catch (error) {
            console.error('Failed to fetch record details:', error);
        }
    }

    // Event listener untuk form edit
    if (editForm) {
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (currentRecordId) {
                const id_pasien = document.getElementById('edit-pasien-id').value;
                const tanggal = document.getElementById('edit-tanggal').value;
                const diagnosa = document.getElementById('edit-diagnosa').value;

                try {
                    const token = getAuthToken();
                    const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis/${currentRecordId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ id_pasien, tanggal, diagnosa }),
                    });
                    await handleFetchError(response);
                    fetchMedicalRecords();
                    editModal.style.display = 'none';
                    currentRecordId = null;
                } catch (error) {
                    console.error('Failed to update record:', error);
                }
            }
        });
    }

    // Event listener untuk menambah rekam medis
    if (addRecordButton) {
        const addRecordModal = document.getElementById('add-record-modal');
        const addRecordForm = document.getElementById('add-record-form');

        addRecordButton.addEventListener('click', () => {
            addRecordModal.style.display = 'block';
        });

        if (addRecordForm) {
            addRecordForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const id_pasien = document.getElementById('add-pasien-id').value;
                const tanggal = document.getElementById('add-tanggal').value;
                const diagnosa = document.getElementById('add-diagnosa').value;

                try {
                    const token = getAuthToken();
                    const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ id_pasien, tanggal, diagnosa }),
                    });
                    await handleFetchError(response);
                    fetchMedicalRecords();
                    addRecordModal.style.display = 'none';
                    addRecordForm.reset();
                } catch (error) {
                    console.error('Failed to add record:', error);
                }
            });
        }
    }

    // Event listener untuk menghapus rekam medis
    if (deleteModal && confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', async () => {
            if (currentRecordId) {
                try {
                    const token = getAuthToken();
                    const response = await fetch(`https://agile-scheme-424018-g8.et.r.appspot.com/rekammedis/${currentRecordId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    await handleFetchError(response);
                    fetchMedicalRecords();
                    deleteModal.style.display = 'none';
                    currentRecordId = null;
                } catch (error) {
                    console.error('Failed to delete record:', error);
                }
            }
        });
    }

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            editModal.style.display = 'none';
            deleteModal.style.display = 'none';
            const addModal = document.getElementById('add-record-modal');
            if (addModal) addModal.style.display = 'none';
            currentRecordId = null;
        });
    });

    // Memuat data awal saat halaman dimuat
    fetchMedicalRecords();
});

async function handleFetchError(response) {
    if (!response.ok) {
        const message = await response.text() || 'An error occurred';
        throw new Error(`HTTP error! status: ${response.status}, message: ${message}`);
    }
    return await response.json();
}

function getAuthToken() {
    // Implementasi fungsi ini sesuai dengan cara Anda menyimpan dan mengambil token otentikasi
    // Contoh:
    return localStorage.getItem('authToken');
}