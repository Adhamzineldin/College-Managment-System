// Go Back to Std-Profile
function goBack() {
    window.location.href = "Std_Profile.html";
}

// Sample Data
const sampleData = [
    { subject: "Mathematics", degree: 95 },
    { subject: "Physics", degree: 89 },
    { subject: "Chemistry", degree: 92 },
    { subject: "Biology", degree: 88 }
];

// Render Data
function renderTable(data) {
    const tbody = document.querySelector("#degrees-table tbody");
    tbody.innerHTML = ""; // Clear existing rows
    data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${row.subject}</td>
        <td>${row.degree}</td>
    `;
    tbody.appendChild(tr);
    });
}

renderTable(sampleData);

// // Fetch Data from Backend

// async function fetchDegrees() {
//     try {
//       // Replace with your backend URL
//     const response = await fetch("http://your-backend-api-url/student-degrees");
//     const data = await response.json();
//     renderTable(data);
//     } catch (error) {
//     console.error("Error fetching degrees:", error);
//     }
// }

// // Initialize Page
// fetchDegrees();