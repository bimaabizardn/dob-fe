// Fungsi umum untuk menangani error fetch
async function handleFetchError(response) {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Contoh fungsi untuk mendapatkan token dari localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}