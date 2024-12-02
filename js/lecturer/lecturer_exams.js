document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:5000/api";
    const examsList = document.getElementById("examsList");
    const addExamButton = document.getElementById("addExamButton");
    const examSection = document.getElementById("examSection");
    const saveExamButton = document.getElementById("saveExamButton");
    const examForm = document.getElementById("examForm");
    const generateReportButton = document.getElementById("generateReport");
    const reportSection = document.getElementById("reportSection");

    let currentExamId = null;  // Tracks the exam being edited

    // Add Question Button
    const addQuestionButton = document.getElementById("addQuestionButton");
    const questionsList = document.getElementById("questionsList");

    // Add Answer Button
    const addAnswerButton = document.getElementById("addAnswerButton");
    const answersList = document.getElementById("answersList");

    addExamButton.addEventListener("click", () => openExamSection());

    // Fetch exams
    async function fetchExams() {
        try {
            const response = await fetch(`${apiUrl}/exams`);
            const data = await response.json();
            examsList.innerHTML = "";
            data.exams.forEach(exam => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.textContent = `${exam.name} - ${exam.date}`;

                // Edit and Delete buttons
                const editButton = document.createElement("button");
                editButton.className = "btn btn-warning btn-sm";
                editButton.textContent = "Edit";
                editButton.onclick = () => openExamSection(exam.id);

                const deleteButton = document.createElement("button");
                deleteButton.className = "btn btn-danger btn-sm";
                deleteButton.textContent = "Delete";
                deleteButton.onclick = () => deleteExam(exam.id);

                li.appendChild(editButton);
                li.appendChild(deleteButton);
                examsList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching exams:", error);
        }
    }

    // Open exam section to add or edit exam
    function openExamSection(examId = null) {
        if (examId) {
            currentExamId = examId;
            fetchExamById(examId);
        } else {
            currentExamId = null;
            examForm.reset();
            questionsList.innerHTML = "";  // Reset questions list
            answersList.innerHTML = "";    // Reset answers list
            document.getElementById("examSectionTitle").textContent = "Add Exam";
            saveExamButton.textContent = "Save Exam";
        }
        examSection.style.display = 'block'; // Show exam section
    }

    // Fetch exam by ID
    async function fetchExamById(examId) {
        try {
            const response = await fetch(`${apiUrl}/exam/${examId}`);
            const exam = await response.json();
            document.getElementById("examTitle").value = exam.name;
            document.getElementById("examDuration").value = exam.duration;
            document.getElementById("examDate").value = exam.date;
            document.getElementById("examMarks").value = exam.total_marks;

            // Populate questions and answers
            questionsList.innerHTML = "";
            answersList.innerHTML = "";
            exam.questions.forEach((question, index) => {
                addQuestionToList(question, index);
                addAnswerToList(exam.answers[index] || "", index);
            });

            document.getElementById("examSectionTitle").textContent = "Edit Exam";
            saveExamButton.textContent = "Update Exam";
        } catch (error) {
            console.error("Error fetching exam:", error);
        }
    }

    // Add a new question to the list
    function addQuestionToList(question = "", index) {
        const div = document.createElement("div");
        div.classList.add("mb-3", "question-item");

        const input = document.createElement("input");
        input.classList.add("form-control");
        input.placeholder = `Question ${index + 1}`;
        input.value = question;
        input.id = `question_${index}`;

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "btn-sm", "ms-2");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteQuestion(index);

        div.appendChild(input);
        div.appendChild(deleteButton);
        questionsList.appendChild(div);
    }

    // Add a new answer to the list
    function addAnswerToList(answer = "", index) {
        const div = document.createElement("div");
        div.classList.add("mb-3", "answer-item");

        const input = document.createElement("input");
        input.classList.add("form-control");
        input.placeholder = `Answer ${index + 1}`;
        input.value = answer;
        input.id = `answer_${index}`;

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "btn-sm", "ms-2");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteAnswer(index);

        div.appendChild(input);
        div.appendChild(deleteButton);
        answersList.appendChild(div);
    }

    // Delete a question
    function deleteQuestion(index) {
        const questionDiv = document.getElementById(`question_${index}`);
        questionDiv.remove();
    }

    // Delete an answer
    function deleteAnswer(index) {
        const answerDiv = document.getElementById(`answer_${index}`);
        answerDiv.remove();
    }

    // Add Question event listener
    addQuestionButton.addEventListener("click", () => {
        const questionCount = questionsList.getElementsByClassName("question-item").length;
        addQuestionToList("", questionCount);
    });

    // Add Answer event listener
    addAnswerButton.addEventListener("click", () => {
        const answerCount = answersList.getElementsByClassName("answer-item").length;
        addAnswerToList("", answerCount);
    });

    // Save or Update exam
    saveExamButton.addEventListener("click", async (e) => {
        e.preventDefault();

        // Gather questions and answers
        const questions = [];
        const questionInputs = questionsList.getElementsByClassName("question-item");
        for (let input of questionInputs) {
            questions.push(input.querySelector("input").value);
        }

        const answers = [];
        const answerInputs = answersList.getElementsByClassName("answer-item");
        for (let input of answerInputs) {
            answers.push(input.querySelector("input").value);
        }

        const examData = {
            name: document.getElementById("examTitle").value,
            duration: document.getElementById("examDuration").value,
            date: document.getElementById("examDate").value,
            total_marks: document.getElementById("examMarks").value,
            questions: questions,
            answers: answers
        };

        try {
            if (currentExamId) {
                // Update exam
                await fetch(`${apiUrl}/exam/${currentExamId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(examData)
                });
                alert("Exam updated successfully!");
            } else {
                // Add new exam
                await fetch(`${apiUrl}/exam`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(examData)
                });
                alert("Exam added successfully!");
            }
            fetchExams();
            examSection.style.display = 'none'; // Hide exam section after saving
        } catch (error) {
            console.error("Error saving exam:", error);
        }
    });

    // Delete exam
    async function deleteExam(examId) {
        if (confirm("Are you sure you want to delete this exam?")) {
            try {
                await fetch(`${apiUrl}/exam/${examId}`, { method: "DELETE" });
                alert("Exam deleted successfully!");
                fetchExams();
            } catch (error) {
                console.error("Error deleting exam:", error);
            }
        }
    }

    // Fetch exams when the page loads
    fetchExams();
});
