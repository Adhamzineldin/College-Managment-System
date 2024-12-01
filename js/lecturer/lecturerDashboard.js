document.addEventListener("DOMContentLoaded", () => {
    const lecturerId = JSON.parse(localStorage.getItem("currentUser")).id;
    const apiUrl = "http://localhost:5000/api";
    const subjectsList = document.getElementById("subjectsList");
    const studentsList = document.getElementById("studentsList");
    const studentsSection = document.getElementById("studentsSection");
    const assignedSubjectsSection = document.getElementById("assignedSubjectsSection");
    const selectedSubjectName = document.getElementById("selectedSubjectName");
    const backToSubjects = document.getElementById("backToSubjects");
    const examModalElement = document.getElementById('examModal');
    const examModal = examModalElement ? new bootstrap.Modal(examModalElement) : null;

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

                    // Create and append the 'Manage Exams' button
                    const manageExamsBtn = document.createElement("button");
                    manageExamsBtn.textContent = "Manage Exams";
                    manageExamsBtn.className = "btn btn-secondary btn-sm ms-2";
                    manageExamsBtn.addEventListener("click", () => fetchExamsBySubject(subjectId));

                    li.appendChild(viewStudentsBtn);  // Append the button after setting the name
                    li.appendChild(manageExamsBtn);   // Append the manage exams button
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
            const subjectResponse = await fetch(`${apiUrl}/subject/${subjectId}`);
            if (!subjectResponse.ok) {
                throw new Error(`Error fetching subject data: ${subjectResponse.statusText}`);
            }
            const subjectData = await subjectResponse.json();
            const subjectName = subjectData.name;

            const response = await fetch(`${apiUrl}/students`);
            if (!response.ok) {
                throw new Error(`Error fetching students: ${response.statusText}`);
            }
            const data = await response.json();
            const students = data.students.filter(student => student.subjects.includes(subjectId));

            selectedSubjectName.textContent = subjectName; // Set the subject name
            populateStudents(students);
            toggleSections();
        } catch (error) {
            console.error(error.message);
        }
    }

    // Fetch exams for a subject
    async function fetchExamsBySubject(subjectId) {
        try {
            const subjectResponse = await fetch(`${apiUrl}/subject/${subjectId}`);
            if (!subjectResponse.ok) {
                throw new Error(`Error fetching subject data: ${subjectResponse.statusText}`);
            }
            const subjectData = await subjectResponse.json();
            const subjectName = subjectData.name;

            const response = await fetch(`${apiUrl}/exams?subjectId=${subjectId}`);
            if (!response.ok) {
                throw new Error(`Error fetching exams: ${response.statusText}`);
            }
            const exams = await response.json();
            populateExams(exams);
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

    // Populate exams list
    function populateExams(exams) {
        const examSection = document.getElementById("examSection");
        examSection.innerHTML = "";
        exams.forEach(exam => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = `${exam.title} - ${exam.description}`;
            examSection.appendChild(li);
        });
    }

    // Toggle between sections
    function toggleSections() {
        assignedSubjectsSection.classList.toggle("d-none");
        studentsSection.classList.toggle("d-none");
    }

    // Handle Sign-Out Button Click
    const signOutButton = document.getElementById('signOutButton');
    if (signOutButton) {
        signOutButton.addEventListener('click', function() {
            window.location.href = '../../html/custom/login.html';
        });
    }

    // Handle Add Exam Button Click
    const addExamButton = document.getElementById("addExamButton");
    if (addExamButton) {
        addExamButton.addEventListener("click", () => {
            if (examModal) examModal.show();
        });
    }

    // Handle Save Exam Button Click
    const saveExamButton = document.getElementById("saveExamButton");
    if (saveExamButton) {
        saveExamButton.addEventListener("click", async () => {
            const examTitle = document.getElementById("examTitle").value;
            const examDescription = document.getElementById("examDescription").value;
            const examQuestions = document.getElementById("examQuestions").value.split("\n").map(q => q.trim());

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
                    examModal.hide();
                    await fetchExamsBySubject(selectedSubjectName.textContent); // Refresh the exam list
                } else {
                    console.error('Error saving exam:', response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    // Initialize
    fetchLecturerData();
});
