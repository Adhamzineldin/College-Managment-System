// Get the data from the local storage that came from the backend 
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

// Change your password using bootstrap modal method
const updateCredentialsButton = document.getElementById('update-credentials-btn');
const modal = new bootstrap.Modal(document.getElementById('updateCredentialsModal'));

updateCredentialsButton.addEventListener('click', ()=> {
    modal.show();
})