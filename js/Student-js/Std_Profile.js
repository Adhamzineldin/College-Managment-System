// Sample data from the backend
const studentData = JSON.parse(localStorage.getItem("currentUser"));

// Populate table with data
const profileData = document.getElementById("profileData");
profileData.innerHTML = `
    <tr>
        <td>${studentData.email}</td>
        <td>${studentData.id}</td>
        <td>${studentData.name}</td> 
        <td>${studentData.subjects}</td>
    </tr>
`;

const updateCredentialsButton = document.getElementById('update-credentials');
const modal = new bootstrap.Modal(document.getElementById('updateCredentialsModal'));

updateCredentialsButton.addEventListener('click', ()=> {
    modal.show();
})

// Change password function
// function changePassword() {
//     const currentPassword = document.getElementById("currentPassword").value;
//     const newPassword = document.getElementById("newPassword").value;
//     const confirmPassword = document.getElementById("confirmPassword").value;

//     if (newPassword !== confirmPassword) {
//         alert("New passwords do not match!");
//         return;
//     }

//     alert("Password successfully changed!");
//     // Send password change request to the server
// }
