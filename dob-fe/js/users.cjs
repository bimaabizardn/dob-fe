document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('users-table').getElementsByTagName('tbody')[0];
    const addUserModal = document.getElementById('add-user-modal');
    const addUserButton = document.getElementById('add-user-button');
    const closeButton = addUserModal.querySelector('.close-button');
    const addUserForm = document.getElementById('add-user-form');
    const addUserMessage = document.getElementById('add-user-message');

    // Modal functionality
    if (addUserButton) {
        addUserButton.addEventListener('click', () => {
            addUserModal.style.display = 'block';
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            addUserModal.style.display = 'none';
            addUserForm.reset();
            addUserMessage.textContent = '';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === addUserModal) {
            addUserModal.style.display = 'none';
            addUserForm.reset();
            addUserMessage.textContent = '';
        }
    });

    // Fungsi untuk mengambil dan menampilkan data users (ASUMSI ADA ENDPOINT GET /users DI BACKEND)
    async function fetchUsers() {
        try {
            const token = getAuthToken();
            const response = await fetch('http://localhost:8000/users', { // Sesuaikan jika endpoint berbeda
                headers: {
                    'Authorization': `Bearer ${token}`, // Kirim token jika diperlukan
                },
            });
            const users = await handleFetchError(response);
            displayUsers(users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            // Tampilkan pesan error kepada pengguna
        }
    }

    function displayUsers(users) {
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const row = usersTableBody.insertRow();
            row.insertCell().textContent = user.nama;
            row.insertCell().textContent = user.email;
            row.insertCell().textContent = user.nomor_telepon;
            row.insertCell().textContent = user.role;
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = '<button class="edit-button" data-id="' + user.id + '">Edit</button> <button class="delete-button" data-id="' + user.id + '">Delete</button>'; // Sesuaikan dengan struktur data Anda
        });

        // Tambahkan event listener untuk tombol edit dan delete (implementasikan fungsinya)
    }

    if (addUserForm) {
        addUserForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            const nama = document.getElementById('nama').value;
            const email = document.getElementById('email').value;
            const nomor_telepon = document.getElementById('nomor_telepon').value;
            const role = document.getElementById('role').value;
            const password = document.getElementById('password').value;
            const konfirmasi_password = document.getElementById('konfirmasi_password').value;

            if (password !== konfirmasi_password) {
                addUserMessage.textContent = 'Konfirmasi password tidak cocok.';
                return;
            }

            try {
                const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/register', { // Endpoint register
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nama, email, nomor_telepon, role, password, konfirmasi_password }),
                });

                const data = await handleFetchError(response);
                addUserMessage.textContent = data.message;
                addUserForm.reset();
                fetchUsers(); // Refresh data setelah berhasil menambah
                addUserModal.style.display = 'none';
            } catch (error) {
                console.error('Error adding user:', error);
                addUserMessage.textContent = error.message;
            }
        });
    }

    // Panggil fetchUsers saat halaman dimuat (jika ada endpoint GET /users)
    // fetchUsers();
});