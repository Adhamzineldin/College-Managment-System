// Go Back to Std-Profile
function goBack() {
    window.location.href = "Std_Profile.html";
}

const apiUrl = 'http://localhost:5000/api';

// Fetch subjects from backend API (running on localhost:5000)
async function fetchSubjects() {
    try {
        const response = await fetch('http://localhost:5000/api/subjects'); // URL to fetch subjects from backend
        if (!response.ok) {
            throw new Error('Error fetching subjects');
        }
        const data = await response.json();

        // Get the current user and their subjectsId from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser')); // Assuming currentUser is stored as an object in localStorage
        const subjectsId = currentUser ? currentUser.subjects : []; // Default to empty array if no subjects
        const studentId = currentUser ? currentUser.id : null; // Get the student ID for comparison
        console.log('subjectsId', subjectsId);

        // Filter the subjects to match the subjectsId from localStorage
        const filteredSubjects = data.subjects.filter(subject => subjectsId.includes(subject.id));

        for (const subject of filteredSubjects) {
            console.log('subject', subject);
            const subjectExamsResponse = await fetch(`http://localhost:5000/api/exams/${subject.id}`);
            const exams = await subjectExamsResponse.json();
            console.log('exams', exams);

            let totalGrade = 0;
            let gradeCount = 0;


            exams.exams.forEach(exam => {


                const gradesString = exam.grades || ""; // Ensure it's a valid string
                if (!gradesString) return; // Skip if no grades string

                // Trim the braces and split the string into grade entries
                const gradesArray = gradesString.slice(1, -1).split(";").map(entry => entry.trim());
                const gradesObject = {};

                gradesArray.forEach(entry => {
                    const [sid, grade] = entry.split(":").map(str => str.trim());
                    if (sid && grade) {
                        gradesObject[sid] = parseFloat(grade); // Convert grade to a number
                    }
                });

                // Check if the student has a grade for this exam
                const studentGrade = gradesObject[studentId];

                if (studentGrade !== undefined) {
                    totalGrade += studentGrade;
                } else {
                    totalGrade += 0; // Default to 0 if no grade is found
                }
                gradeCount++;
            });

            // Calculate the average grade
            const averageGrade = gradeCount > 0 ? (totalGrade / gradeCount).toFixed(0) : "No grades";
            subject.averageGrade = averageGrade;
        }


        // Render the subjects in the table if there are any filtered subjects
        if (filteredSubjects.length > 0) {
            renderTable(filteredSubjects); // Render matching subjects
        } else {
            alert('No matching subjects found for the current user.');
        }
    } catch (error) {
        console.error(error);
        alert('Failed to load subjects');
    }
}

// Render subjects into the table
function renderTable(subjects) {
    const tbody = document.querySelector("#degrees-table tbody");
    tbody.innerHTML = ""; // Clear existing rows
    subjects.forEach(subject => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${subject.name}</td>
            <td>${subject.averageGrade}</td> <!-- Assuming degree is part of subject, otherwise you'll need a separate API call to get it -->
        `;
        tbody.appendChild(tr);
    });
}

// Call fetchSubjects on page load
fetchSubjects();
