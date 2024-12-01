// Sample data from the backend
const studentData = {
    email: "Adham@gmail.com",
    id: "123456",
    name: "Adham Zineldin",
    role: "Student",
    subjects: "Math, Science, Literature"
};

// Populate table with data
const profileData = document.getElementById("profileData");
profileData.innerHTML = `
    <tr>
        <td>${studentData.email}</td>
        <td>${studentData.id}</td>
        <td>${studentData.name}</td>
        <td>${studentData.role}</td>
        <td>${studentData.subjects}</td>
    </tr>
`;

// Change password function
function changePassword() {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
    }

    alert("Password successfully changed!");
    // Send password change request to the server
}