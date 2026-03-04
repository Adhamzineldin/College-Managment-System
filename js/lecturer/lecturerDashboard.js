document.addEventListener("DOMContentLoaded", () => {
    const lecturerId = "20230002"; // Replace with the logged-in lecturer's ID

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
    const backToSubjectsStudents = document.getElementById("backToSubjectsStudents");
    const backToSubjectsExams = document.getElementById("backToSubjectsExams");

    let currentSubjectId = null;
    let currentExamId = null;
    let questions = [];
    let answers = [];

    // Fetch lecturer data via Veld client
    async function fetchLecturerData() {
        try {
            const lecturer = await veld.Lecturers.getLecturer(lecturerId);
            populateSubjects(lecturer.subjects);
        } catch (error) {
            if (veld.isErrorCode(error, veld.Lecturers.errors.getLecturer.notFound)) {
                console.error("Lecturer not found.");
            } else {
                console.error(error.message);
            }
        }
    }

    // Populate assigned subjects
    function populateSubjects(subjects) {
        subjectsList.innerHTML = "";
        subjects.forEach(subjectId => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";

            veld.Subjects.getSubject(subjectId)
                .then(data => {
                    const subjectName = data.name;
                    li.textContent = subjectName;

                    const buttonContainer = document.createElement("div");
                    buttonContainer.className = "d-flex align-items-center";

                    const viewStudentsBtn = document.createElement("button");
                    viewStudentsBtn.textContent = "View Students";
                    viewStudentsBtn.className = "btn btn-primary btn-sm me-2";
                    viewStudentsBtn.addEventListener("click", () => fetchStudentsBySubject(subjectId));

                    const viewExamsBtn = document.createElement("button");
                    viewExamsBtn.textContent = "View Exams";
                    viewExamsBtn.className = "btn btn-success btn-sm";
                    viewExamsBtn.addEventListener("click", () => fetchExamsBySubject(subjectId));

                    buttonContainer.appendChild(viewStudentsBtn);
                    buttonContainer.appendChild(viewExamsBtn);
                    li.appendChild(buttonContainer);
                    subjectsList.appendChild(li);
                })
                .catch(error => {
                    if (veld.isErrorCode(error, veld.Subjects.errors.getSubject.notFound)) {
                        console.error(`Subject ${subjectId} not found.`);
                    } else {
                        console.error(`Error fetching subject name: ${error.message}`);
                    }
                });
        });
    }

    // Fetch students by subject via Veld client
    async function fetchStudentsBySubject(subjectId) {
        try {
            const subjectData = await veld.Subjects.getSubject(subjectId);
            const subjectName = subjectData.name;

            const data = await veld.Students.listStudents();
            const students = data.students.filter(student => student.subjects.includes(subjectId));

            selectedSubjectNameStudents.textContent = subjectName;
            populateStudents(students, subjectId);
            toggleSections(studentsSection);
        } catch (error) {
            console.error(error.message);
        }
    }

    // Fetch exams by subject via Veld client
    async function fetchExamsBySubject(subjectId) {
        if (subjectId && subjectId.length > 1) {
            currentSubjectId = subjectId;
            localStorage.setItem("currentSubjectId", subjectId);
        } else {
            currentSubjectId = localStorage.getItem("currentSubjectId");
            subjectId = currentSubjectId;
        }

        try {
            const examsData = await veld.Exams.listExamsBySubject(subjectId);
            const subjectData = await veld.Subjects.getSubject(subjectId);
            const subjectName = subjectData.name;

            selectedSubjectNameExams.textContent = subjectName;
            populateExams(examsData.exams);
            toggleSections(examsSection);
        } catch (error) {
            console.error(error.message);
        }
    }

    // Populate students list
    async function populateStudents(students, subjectId) {
        studentsList.innerHTML = "";

        try {
            const examsData = await veld.Exams.listExamsBySubject(subjectId);

            students.forEach(student => {
                const li = document.createElement("li");
                li.className = "list-group-item";

                let totalGrade = 0;
                let gradeCount = 0;

                examsData.exams.forEach(exam => {
                    const gradesString = exam.grades || "";
                    const gradesArray = gradesString.slice(1, -1).split(";");
                    const gradesObject = {};

                    gradesArray.forEach(entry => {
                        const [studentId, grade] = entry.split(":").map(str => str.trim());
                        if (studentId && grade) {
                            gradesObject[studentId] = parseFloat(grade);
                        }
                    });

                    const studentGrade = gradesObject[student.id];
                    if (studentGrade !== undefined) {
                        totalGrade += studentGrade;
                    } else {
                        totalGrade += 0;
                    }
                    gradeCount++;
                });

                const averageGrade = gradeCount > 0 ? (totalGrade / gradeCount).toFixed(0) : "No grades";
                li.textContent = `${student.name} (${student.id}) - Subject Grade: ${averageGrade}`;
                studentsList.appendChild(li);
            });
        } catch (error) {
            console.error(`Error fetching exams or calculating grades: ${error.message}`);
        }
    }

    // Populate exams list
    function populateExams(exams) {
        examsList.innerHTML = "";
        exams.forEach(exam => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.textContent = `${exam.name} - ${exam.examDate || exam.date}`;

            const buttonContainer = document.createElement("div");
            buttonContainer.className = "d-flex align-items-center";

            const editButton = document.createElement("button");
            editButton.className = "btn btn-warning btn-sm me-2";
            editButton.textContent = "Edit";
            editButton.onclick = () => openExamSection(exam.id, exam.subject_id);

            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger btn-sm";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteExam(exam.id);

            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            li.appendChild(buttonContainer);
            examsList.appendChild(li);
        });
    }

    async function openExamSection(examId = null, subjectId = null) {
        currentExamId = examId;

        if (examId) {
            try {
                const examData = await veld.Exams.getExam(examId);
                console.log(examData);

                if (examData && examData.questions) {
                    document.getElementById("questionFields").innerHTML = "";

                    document.getElementById("examTitle").value = examData.name || "";
                    document.getElementById("examDuration").value = examData.duration || "";
                    document.getElementById("examDate").value = examData.examDate || "";
                    document.getElementById("examMarks").value = examData.total_marks || "";

                    examData.questions.forEach((question, index) => {
                        let answersList = [];
                        if (examData.answers[index]) {
                            if (typeof examData.answers[index] === "string") {
                                answersList = examData.answers[index].split(';');
                            } else if (Array.isArray(examData.answers[index])) {
                                answersList = examData.answers[index];
                            }
                        }

                        const questionBlock = document.createElement("div");
                        questionBlock.classList.add("question-block", "mb-3");
                        questionBlock.innerHTML = `
                            <label for="question_${index + 1}" class="form-label">Question ${index + 1}</label>
                            <input type="text" class="form-control" id="question_${index + 1}" name="question_${index + 1}" value="${question.slice(1, -1) || ''}" required>
                            <div class="answers-container mb-3" id="answers_${index + 1}">
                                <h5>Answers</h5>
                                ${answersList.map((answer, ansIndex) => `
                                    <div class="mb-2">
                                        <input type="text" class="form-control" name="answer_${index + 1}_${ansIndex + 1}" value="${answer}" placeholder="Answer ${ansIndex + 1}" required>
                                    </div>
                                `).join('')}
                                <button type="button" class="btn btn-info addAnswerButton" data-question-id="${index + 1}">Add Answer</button>
                            </div>
                        `;

                        document.getElementById("questionFields").appendChild(questionBlock);

                        document.querySelector(`#answers_${index + 1} .addAnswerButton`).addEventListener("click", function () {
                            const questionId = this.getAttribute("data-question-id");
                            const answerCount = document.querySelectorAll(`#answers_${questionId} input[type="text"]`).length + 1;
                            const answerInput = document.createElement("div");
                            answerInput.classList.add("mb-2");
                            answerInput.innerHTML = `<input type="text" class="form-control" name="answer_${questionId}_${answerCount}" placeholder="Answer ${answerCount}" required>`;
                            document.getElementById(`answers_${questionId}`).appendChild(answerInput);
                        });
                    });

                } else {
                    console.error("Invalid exam data: Questions are missing.");
                }
            } catch (error) {
                if (veld.isErrorCode(error, veld.Exams.errors.getExam.notFound)) {
                    alert("Exam not found.");
                } else {
                    console.error("Failed to fetch exam data:", error);
                }
            }
        } else {
            document.getElementById("examTitle").value = "";
            document.getElementById("examDuration").value = "";
            document.getElementById("examDate").value = "";
            document.getElementById("examMarks").value = "";
            document.getElementById("examSectionTitle").textContent = "Add Exam";
            saveExamButton.textContent = "Save Exam";
        }

        if (subjectId) {
            document.getElementById("subjectId").value = subjectId;
        }

        document.getElementById("examsList").classList.add("d-none");
        document.getElementById("examSection").classList.remove("d-none");
    }

    saveExamButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const examData = {
            name: document.getElementById("examTitle").value,
            duration: parseInt(document.getElementById("examDuration").value),
            examDate: document.getElementById("examDate").value,
            total_marks: parseInt(document.getElementById("examMarks").value),
            subject_id: currentSubjectId,
        };

        const questionsArr = [];
        const answersArr = [];
        const questionBlocks = document.querySelectorAll(".question-block");

        questionBlocks.forEach((block, index) => {
            const questionText = block.querySelector(`input[name="question_${index + 1}"]`).value;
            const blockAnswers = [];
            const answerInputs = block.querySelectorAll(`#answers_${index + 1} input[type="text"]`);
            answerInputs.forEach(input => { blockAnswers.push(input.value); });

            answersArr.push(`{${blockAnswers.join(";")}}`);
            questionsArr.push(`{${questionText}}`);
        });

        examData.questions = questionsArr.join(".");
        examData.answers = answersArr.join(".");

        try {
            if (currentExamId) {
                await veld.Exams.updateExam(currentExamId, examData);
                alert("Exam updated successfully!");
            } else {
                await veld.Exams.createExam(examData);
                alert("Exam added successfully!");
            }

            await fetchExamsBySubject(currentSubjectId);
            document.getElementById("examsList").classList.remove("d-none");
            document.getElementById("examSection").classList.add("d-none");

            document.getElementById("examForm").innerHTML = `<div class="mb-3">
                <label for="examTitle" class="form-label">Exam Title</label>
                <input type="text" class="form-control" id="examTitle" required>
            </div>
            <div class="mb-3">
                <label for="examDuration" class="form-label">Duration (mins)</label>
                <input type="number" class="form-control" id="examDuration" required>
            </div>
            <div class="mb-3">
                <label for="examDate" class="form-label">Exam Date</label>
                <input type="date" class="form-control" id="examDate" required>
            </div>
            <div class="mb-3">
                <label for="examMarks" class="form-label">Total Marks</label>
                <input type="number" class="form-control" id="examMarks" required>
            </div>
            <div id="questionsContainer">
                <h4>Questions</h4>
                <div id="questionFields"></div>
                <button type="button" id="addQuestionButton" class="btn btn-secondary">Add Question</button>
            </div>
            <input type="hidden" id="subjectId">
            <button type="submit" id="saveExamButton" class="btn btn-primary mt-3">Save Exam</button>`;

            currentExamId = null;
        } catch (error) {
            if (veld.isErrorCode(error, veld.Exams.errors.updateExam.notFound)) {
                alert("Exam not found for update.");
            } else if (veld.isErrorCode(error, veld.Exams.errors.createExam.missingFields)) {
                alert("Please fill all required exam fields.");
            } else {
                console.error("Error saving exam:", error);
            }
        }
    });

    async function deleteExam(examId) {
        if (confirm("Are you sure you want to delete this exam?")) {
            try {
                await veld.Exams.deleteExam(examId);
                alert("Exam deleted successfully!");
                fetchExamsBySubject(subjectIdInput.value);
            } catch (error) {
                if (veld.isErrorCode(error, veld.Exams.errors.deleteExam.notFound)) {
                    alert("Exam not found.");
                } else {
                    console.error("Error deleting exam:", error);
                }
            }
        }
    }

    document.getElementById("addExamButton").addEventListener("click", function () {
        document.getElementById("examsList").classList.add("d-none");
        document.getElementById("examSection").classList.remove("d-none");
        document.getElementById("examSectionTitle").innerText = "Add New Exam";
    });

    document.getElementById("addQuestionButton").addEventListener("click", function () {
        const questionCount = document.querySelectorAll(".question-block").length + 1;
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

        document.getElementById("questionFields").appendChild(questionBlock);

        document.querySelector(`#answers_${questionCount} .addAnswerButton`).addEventListener("click", function () {
            const questionId = this.getAttribute("data-question-id");
            const answerCount = document.querySelectorAll(`#answers_${questionId} input[type="text"]`).length + 1;
            const answerInput = document.createElement("div");
            answerInput.classList.add("mb-2");
            answerInput.innerHTML = `<input type="text" class="form-control" name="answer_${questionId}_${answerCount}" placeholder="Answer ${answerCount}" required>`;
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

    backToSubjectsStudents.addEventListener("click", () => toggleSections(assignedSubjectsSection));
    backToSubjectsExams.addEventListener("click", () => toggleSections(assignedSubjectsSection));

    signOutButton.addEventListener("click", function () {
        window.location.href = "../custom/login.html";
    });

    // Initialize
    fetchLecturerData();
});
