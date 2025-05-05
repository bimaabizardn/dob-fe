document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async(event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('https://agile-scheme-424018-g8.et.r.appspot.com/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await handleFetchError(response);
                localStorage.setItem('authToken', data.token); // Simpan token JWT dari backend
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Login failed:', error);
                loginMessage.textContent = error.message;
            }
        });
    }
});