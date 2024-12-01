const form = document.getElementById('form');
const id = document.getElementById('ID');
const password = document.getElementById('password');
const idError = document.getElementById('idError');
const passwordError = document.getElementById('passwordError');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await validateInputs();
});

const validateInputs = async () => {
    const idValue = id.value.trim();
    const passwordValue = password.value.trim();

    // Regex expression for ID checks if they are exactly 8 digits
    const regexID = /^\d{8}$/;

    let valid = true;

    // Clear previous error messages
    idError.textContent = '';
    passwordError.textContent = '';

    // Check if ID is valid
    if (!regexID.test(idValue)) {
        idError.textContent = 'ID must be exactly 8 digits';
        valid = false;
    }

    // Check if Password is entered
    if (passwordValue === '') {
        passwordError.textContent = 'Password is required';
        valid = false;
    }

    if (valid) {
        try {
            const response = await fetch('http://localhost:5000/api/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: idValue, password: passwordValue }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));

                if (data.user.role === 'student') {
                    window.location.href = '../html/studentDashboard.html';
                } else if (data.user.role === 'lecturer') {
                    window.location.href = '../html/lecturerDashboard.html';
                } else if (data.user.role === 'admin') {
                    window.location.href = '../html/adminDashboard.html';
                }
            } else {
                alert(data.message || 'Invalid ID or Password');
            }
        } catch (error) {
            console.error('Error authenticating user:', error);
            alert('An error occurred. Please try again later.');
        }
    }
};
