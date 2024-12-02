document.addEventListener("DOMContentLoaded", () => {
    const lecturerId = "20230002"; // Replace with the logged-in lecturer's ID
    const apiUrl = "http://localhost:5000/api";

    // Sections and lists
    const subjectsList = document.getElementById("subjectsList");
    const studentsList = document.getElementById("studentsList");
    const examsList = document.getElementById("examsList");
    const studentsSection = document.getElementById("studentsSection");
    const examsSection = document.getElementById("examsSection");
    const assignedSubjectsSection = document.getElementById("assignedSubjectsSection");
    const selectedSubjectNameStudents = document.getElementById("selectedSubjectNameStudents");
    const selectedSubjectNameExams = document.getElementById("selectedSubjectNameExams");

    // Buttons for navigation
    const backToSubjectsStudents = document.getElementById("backToSubjectsStudents");
    const backToSubjectsExams = document.getElementById("backToSubjectsExams");

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
                    const subjectName = data.name;
                    li.textContent = subjectName;

                    // Create 'View Students' button
                    const viewStudentsBtn = document.createElement("button");
                    viewStudentsBtn.textContent = "View Students";
                    viewStudentsBtn.className = "btn btn-primary btn-sm me-2";
                    viewStudentsBtn.addEventListener("click", () => fetchStudentsBySubject(subjectId));

                    // Create 'View Exams' button
                    const viewExamsBtn = document.createElement("button");
                    viewExamsBtn.textContent = "View Exams";
                    viewExamsBtn.className = "btn btn-success btn-sm";
                    viewExamsBtn.addEventListener("click", () => fetchExamsBySubject(subjectId));

                    // Append buttons to the list item
                    li.appendChild(viewStudentsBtn);
                    li.appendChild(viewExamsBtn);

                    // Append the list item to the subjects list
                    subjectsList.appendChild(li);
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

            selectedSubjectNameStudents.textContent = subjectName;
            populateStudents(students);
            toggleSections(studentsSection);
        } catch (error) {
            console.error(error.message);
        }
    }

    // Fetch exams by subject
    async function fetchExamsBySubject(subjectId) {
    try {
        // Fetch exams for the specific subject
        const response = await fetch(`${apiUrl}/exams/${subjectId}`);

        if (!response.ok) {
            throw new Error(`Error fetching exams: ${response.statusText}`);
        }

        const exams = await response.json(); // Assuming this returns an array of exam objects
        console.log("Exams Response:", exams);

        // Fetch subject name for the header
        const subjectResponse = await fetch(`${apiUrl}/subject/${subjectId}`);
        if (!subjectResponse.ok) {
            throw new Error(`Error fetching subject data: ${subjectResponse.statusText}`);
        }

        const subjectData = await subjectResponse.json();
        const subjectName = subjectData.name;

        // Update the UI
        selectedSubjectNameExams.textContent = subjectName;
        populateExams(exams.exams);
        toggleSections(examsSection);
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
    examsList.innerHTML = ""; // Clear the previous list
    exams.forEach(exam => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `${exam.name} (Exam ID: ${exam.id}) - Date: ${exam.date}, Duration: ${exam.duration} mins, Total Marks: ${exam.total_marks}`;
        examsList.appendChild(li);
    });
}

    // Toggle sections
    function toggleSections(sectionToShow) {
        assignedSubjectsSection.classList.add("d-none");
        studentsSection.classList.add("d-none");
        examsSection.classList.add("d-none");

        sectionToShow.classList.remove("d-none");
    }

    // Event listeners for navigation
    backToSubjectsStudents.addEventListener("click", () => toggleSections(assignedSubjectsSection));
    backToSubjectsExams.addEventListener("click", () => toggleSections(assignedSubjectsSection));

    // Initialize
    fetchLecturerData();
});
