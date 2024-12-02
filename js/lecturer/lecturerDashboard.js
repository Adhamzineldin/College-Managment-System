document.addEventListener("DOMContentLoaded", () => {
    const lecturerId = "20230002"; // Replace with the logged-in lecturer's ID
    const apiUrl = "http://localhost:5000/api";
    const subjectsList = document.getElementById("subjectsList");
    const studentsList = document.getElementById("studentsList");
    const studentsSection = document.getElementById("studentsSection");
    const assignedSubjectsSection = document.getElementById("assignedSubjectsSection");
    const selectedSubjectName = document.getElementById("selectedSubjectName");
    const backToSubjects = document.getElementById("backToSubjects");

    // Fetch lecturer data
    async function fetchLecturerData() {
        try {
            const response = await fetch(`${apiUrl}/lecturer/${lecturerId}`);
            if (!response.ok) {
                throw new Error(`Error fetching lecturer data: ${response.statusText}`);
            }
            const lecturer = await response.json();
            populateSubjects(lecturer.subjects);
        } catch (error) {
            console.error(error.message);
        }
    }

    // Populate assigned subjects
    function populateSubjects(subjects) {
    subjectsList.innerHTML = "";
    subjects.forEach(subjectId => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        // Fetch the subject name
        fetch(`${apiUrl}/subject/${subjectId}`)
            .then(response => response.json())
            .then(data => {
                const subjectName = data.name;  // Assuming `data.name` contains the subject name
                li.textContent = subjectName;  // Update the list item with the subject name

                // Create and append the 'View Students' button
                const viewStudentsBtn = document.createElement("button");
                viewStudentsBtn.textContent = "View Students";
                viewStudentsBtn.className = "btn btn-primary btn-sm";
                viewStudentsBtn.addEventListener("click", () => fetchStudentsBySubject(subjectId));

                li.appendChild(viewStudentsBtn);  // Append the button after setting the name
                subjectsList.appendChild(li);  // Append the list item to the subjects list
            })
            .catch(error => {
                console.error(`Error fetching subject name: ${error.message}`);
            });
    });
}


    // Fetch students by subject
   async function fetchStudentsBySubject(subjectId) {
    try {
        // Fetch the subject name
        const subjectResponse = await fetch(`${apiUrl}/subject/${subjectId}`);
        if (!subjectResponse.ok) {
            throw new Error(`Error fetching subject data: ${subjectResponse.statusText}`);
        }
        const subjectData = await subjectResponse.json();
        const subjectName = subjectData.name;

        // Fetch the students
        const response = await fetch(`${apiUrl}/students`);
        if (!response.ok) {
            throw new Error(`Error fetching students: ${response.statusText}`);
        }
        const data = await response.json();
        const students = data.students.filter(student => student.subjects.includes(subjectId));

        // Update the selected subject name in the HTML
        selectedSubjectName.textContent = subjectName; // Set the subject name

        // Populate the students list
        populateStudents(students);
        toggleSections();
    } catch (error) {
        console.error(error.message);
    }
}


    // Populate students list
    function populateStudents(students) {
        studentsList.innerHTML = "";
        students.forEach(student => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = `${student.name} (${student.id}) - Final Grade: ${student.finalGrade}`;
            studentsList.appendChild(li);
        });
    }

    // Toggle between sections
    function toggleSections() {
        assignedSubjectsSection.classList.toggle("d-none");
        studentsSection.classList.toggle("d-none");
    }

    // Event listeners
    backToSubjects.addEventListener("click", toggleSections);

    // Initialize
    fetchLecturerData();
});


// Handle Sign-Out Button Click
document.getElementById('signOutButton').addEventListener('click', function() {
    // Clear session data or perform any other sign-out logic
    // For example, redirecting to the login page:
    window.location.href = '/project/html/login.html'; // Update the URL to match your login page
});


document.getElementById("addExamButton").addEventListener("click", () => {
    // Show the modal for adding an exam
    const examModal = new bootstrap.Modal(document.getElementById('examModal'));
    examModal.show();
});

document.getElementById("saveExamButton").addEventListener("click", async () => {
    // Collect the data from the form
    const examTitle = document.getElementById("examTitle").value;
    const examDescription = document.getElementById("examDescription").value;
    const examQuestions = document.getElementById("examQuestions").value.split("\n").map(q => q.trim());

    // Prepare the data to send to the backend
    const examData = {
        title: examTitle,
        description: examDescription,
        questions: examQuestions
    };

    try {
        const response = await fetch(`${apiUrl}/exam`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(examData)
        });

        if (response.ok) {
            // Hide the modal and refresh the exam list
            const examModal = bootstrap.Modal.getInstance(document.getElementById('examModal'));
            examModal.hide();
            fetchExams(); // Call function to update the exam list
        } else {
            console.error('Error saving exam:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
