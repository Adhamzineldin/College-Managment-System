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
    const subjectIdInput = document.getElementById("subjectId");
    const saveExamButton = document.getElementById("saveExamButton");
    // Buttons for navigation
    const backToSubjectsStudents = document.getElementById("backToSubjectsStudents");
    const backToSubjectsExams = document.getElementById("backToSubjectsExams");


    let currentSubjectId = null;
    let currentExamId = null;
    let questions = [];
    let answers = [];


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
        console.log(subjectId.length);
        if (subjectId.length > 1) {
            currentSubjectId = subjectId;
            localStorage.setItem("currentSubjectId", subjectId);
        }else{
            currentSubjectId = localStorage.getItem("currentSubjectId");
            subjectId = currentSubjectId;
        }




        if (subjectId.length > 1) {
            currentSubjectId = subjectId;
            localStorage.setItem("currentSubjectId", subjectId);
        }else{
            currentSubjectId = localStorage.getItem("currentSubjectId");
        }
        try {
            // Fetch exams for the specific subject
            const response = await fetch(`${apiUrl}/exams/${subjectId}`);

            if (!response.ok) {
                throw new Error(`Error fetching exams: ${response.statusText}`);
            }

            const exams = await response.json(); // Assuming this returns an array of exam objects

            // Fetch subject name for the header
            const subjectResponse = await fetch(`${apiUrl}/subject/${subjectId}`);
            if (!subjectResponse.ok) {
                throw new Error(`Error fetching subject data: ${subjectResponse.statusText}`);
            }

            const subjectData = await subjectResponse.json();
            const subjectName = subjectData.name;

            // Update the UI
            selectedSubjectNameExams.textContent = subjectName;
            console.log(exams);
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
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.textContent = `${exam.name} - ${exam.date}`;

            const editButton = document.createElement("button");
            editButton.className = "btn btn-warning btn-sm";
            editButton.textContent = "Edit";
            editButton.onclick = () => openExamSection(exam.id, exam.subject_id);

            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger btn-sm";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteExam(exam.id);

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            examsList.appendChild(li);
        });
    }

    async function openExamSection(examId = null, subjectId = null) {
    currentExamId = examId;

    // Check if an examId is provided
    if (examId) {
        try {
            // Fetch exam data from backend
            const response = await fetch(`${apiUrl}/exam/${examId}`);
            const examData = await response.json();
            console.log(examData); // Log to inspect data structure

            // Check if examData and questions exist
            if (examData && examData.questions) {
                // Clear existing questions before populating new ones
                document.getElementById("questionFields").innerHTML = "";

                // Render exam details dynamically
                document.getElementById("examTitle").value = examData.name || ""; // Set Exam Title
                document.getElementById("examDuration").value = examData.duration || ""; // Set Exam Duration
                document.getElementById("examDate").value = examData.date || ""; // Set Exam Date
                document.getElementById("examMarks").value = examData.total_marks || ""; // Set Exam Marks



               // Loop through each question in examData.questions
examData.questions.forEach((question, index) => {
    // Safely parse answers, handling possible data types
    let answers = [];
    if (examData.answers[index]) {
        if (typeof examData.answers[index] === "string") {
            answers = examData.answers[index].split(';'); // Parse string
        } else if (Array.isArray(examData.answers[index])) {
            answers = examData.answers[index]; // Use directly if it's an array
        } else {
            console.warn(`Unexpected data type for answers at index ${index}:`, examData.answers[index]);
        }
    }

    // Create the question block
    const questionBlock = document.createElement("div");
    questionBlock.classList.add("question-block", "mb-3");
    questionBlock.innerHTML = `
        <label for="question_${index + 1}" class="form-label">Question ${index + 1}</label>
        <input type="text" class="form-control" id="question_${index + 1}" name="question_${index + 1}" value="${question.slice(1, -1) || ''}" required>
        
        <div class="answers-container mb-3" id="answers_${index + 1}">
            <h5>Answers</h5>
            ${answers.map((answer, ansIndex) => `
                <div class="mb-2">
                    <input type="text" class="form-control" name="answer_${index + 1}_${ansIndex + 1}" value="${answer}" placeholder="Answer ${ansIndex + 1}" required>
                </div>
            `).join('')}
            <button type="button" class="btn btn-info addAnswerButton" data-question-id="${index + 1}">Add Answer</button>
        </div>
    `;

    // Append the question block to the question fields container
    document.getElementById("questionFields").appendChild(questionBlock);

    // Add event listener to the 'Add Answer' button for this question
    document.querySelector(`#answers_${index + 1} .addAnswerButton`).addEventListener("click", function () {
        const questionId = this.getAttribute("data-question-id");
        const answerCount = document.querySelectorAll(`#answers_${questionId} input[type="text"]`).length + 1;

        // Create a new input field for the answer
        const answerInput = document.createElement("div");
        answerInput.classList.add("mb-2");
        answerInput.innerHTML = `
            <input type="text" class="form-control" name="answer_${questionId}_${answerCount}" placeholder="Answer ${answerCount}" required>
        `;

        // Append the new answer input to the answers container
        document.getElementById(`answers_${questionId}`).appendChild(answerInput);
    });
});

            } else {
                console.error("Invalid exam data: Questions are missing.");
            }
        } catch (error) {
            console.error("Failed to fetch exam data:", error);
        }
    } else {
        // If no examId is provided, reset the form and set the title and button
        examForm.reset();
        document.getElementById("examTitle").value = ""; // Clear Exam Title
        document.getElementById("examDuration").value = ""; // Clear Exam Duration
        document.getElementById("examDate").value = ""; // Clear Exam Date
        document.getElementById("examMarks").value = ""; // Clear Exam Marks
        document.getElementById("examSectionTitle").textContent = "Add Exam";
        saveExamButton.textContent = "Save Exam";
    }

    // Pre-fill subject ID if provided
    if (subjectId) {
        document.getElementById("subjectId").value = subjectId;
    }

    // Show the exam section and hide the exam list
    document.getElementById("examsList").classList.add("d-none");
    document.getElementById("examSection").classList.remove("d-none");
}


    async function fetchExamById(examId) {
        try {
            const response = await fetch(`${apiUrl}/exam/${examId}`);
            const exam = await response.json();
            document.getElementById("examTitle").value = exam.name;
            document.getElementById("examDuration").value = exam.duration;
            document.getElementById("examDate").value = exam.date;
            document.getElementById("examMarks").value = exam.total_marks;
            subjectIdInput.value = exam.subject_id;

            document.getElementById("examSectionTitle").textContent = "Edit Exam";
            saveExamButton.textContent = "Update Exam";
        } catch (error) {
            console.error("Error fetching exam:", error);
        }
    }

    saveExamButton.addEventListener("click", async (e) => {
    e.preventDefault();

    // Collect the exam data
    const examData = {
        name: document.getElementById("examTitle").value,
        duration: document.getElementById("examDuration").value,
        date: document.getElementById("examDate").value,
        total_marks: document.getElementById("examMarks").value,
        subject_id: currentSubjectId,
    };

    // Collect the questions and answers
    const questionsArr = [];
    const answersArr = [];
    const questionBlocks = document.querySelectorAll(".question-block");

    questionBlocks.forEach((block, index) => {
        const questionText = block.querySelector(`input[name="question_${index + 1}"]`).value;
        const answers = [];
        const answerInputs = block.querySelectorAll(`#answers_${index + 1} input[type="text"]`);

        answerInputs.forEach(input => {
            answers.push(input.value);
        });

        // Join answers with ";" and wrap them in "{}"
        answersArr.push(`{${answers.join(";")}}`);
        // Wrap the question in "{}" and add it to questionsArr
        questionsArr.push(`{${questionText}}`);
    });

    // Join questions and answers with ";" and store them as single strings
    const questionsString = questionsArr.join(";");
    const answersString = answersArr.join(";");

    examData.questions = questionsString;
    examData.answers = answersString;

    try {
        if (currentExamId) {
            // If editing an existing exam
            await fetch(`${apiUrl}/exam/${currentExamId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(examData),
            });
            alert("Exam updated successfully!");
        } else {
            // If adding a new exam
            await fetch(`${apiUrl}/exam`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(examData),
            });
            alert("Exam added successfully!");
        }

        // Fetch and display the exams list
        await fetchExamsBySubject(currentSubjectId);
        document.getElementById("examsList").classList.remove("d-none");
        document.getElementById("examSection").classList.add("d-none");
        currentExamId = null;
    } catch (error) {
        console.error("Error saving exam:", error);
    }
});


    async function deleteExam(examId) {
        if (confirm("Are you sure you want to delete this exam?")) {
            try {
                await fetch(`${apiUrl}/exam/${examId}`, {method: "DELETE"});
                alert("Exam deleted successfully!");
                fetchExamsBySubject(subjectIdInput.value);
            } catch (error) {
                console.error("Error deleting exam:", error);
            }
        }
    }

    document.getElementById("addExamButton").addEventListener("click", function () {
        // Hide the exam list and show the exam form
        document.getElementById("examsList").classList.add("d-none");
        document.getElementById("examSection").classList.remove("d-none");
        document.getElementById("examSectionTitle").innerText = "Add New Exam"; // Change the title if needed
    });

    document.getElementById("addQuestionButton").addEventListener("click", function () {
        // Create a new question block with a field for the question and its answers
        const questionCount = document.querySelectorAll(".question-block").length + 1; // To keep track of question count

        // Create a div to wrap the question and answers
        const questionBlock = document.createElement("div");
        questionBlock.classList.add("question-block", "mb-3");
        questionBlock.innerHTML = `
        <label for="question_${questionCount}" class="form-label">Question ${questionCount}</label>
        <input type="text" class="form-control" id="question_${questionCount}" name="question_${questionCount}" required>
        
        <div class="answers-container mb-3" id="answers_${questionCount}">
            <h5>Answers</h5>
            <div class="mb-2">
                <input type="text" class="form-control" name="answer_${questionCount}_1" placeholder="Answer 1" required>
            </div>
            <button type="button" class="btn btn-info addAnswerButton" data-question-id="${questionCount}">Add Answer</button>
        </div>
    `;

        // Append the new question block to the question fields container
        document.getElementById("questionFields").appendChild(questionBlock);

        // Add event listener to the 'Add Answer' button inside this new question block
        document.querySelector(`#answers_${questionCount} .addAnswerButton`).addEventListener("click", function () {
            const questionId = this.getAttribute("data-question-id");
            const answerCount = document.querySelectorAll(`#answers_${questionId} input[type="text"]`).length + 1;

            // Create a new input field for the answer
            const answerInput = document.createElement("div");
            answerInput.classList.add("mb-2");
            answerInput.innerHTML = `
            <input type="text" class="form-control" name="answer_${questionId}_${answerCount}" placeholder="Answer ${answerCount}" required>
        `;

            // Append the new answer input to the answers container
            document.getElementById(`answers_${questionId}`).appendChild(answerInput);
        });
    });


    // Toggle sections
    function toggleSections(sectionToShow) {
        assignedSubjectsSection.classList.add("d-none");
        studentsSection.classList.add("d-none");
        examsSection.classList.add("d-none");

        document.getElementById("examsList").classList.remove("d-none");
        document.getElementById("examSection").classList.add("d-none");

        sectionToShow.classList.remove("d-none");
    }

    // Event listeners for navigation
    backToSubjectsStudents.addEventListener("click", () => toggleSections(assignedSubjectsSection));
    backToSubjectsExams.addEventListener("click", () => toggleSections(assignedSubjectsSection));

    // Initialize
    fetchLecturerData();
});
