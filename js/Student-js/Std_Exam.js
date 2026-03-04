// Return back to Std_View_Exams.html
const goBack = () => {
    window.location.href='./Std_View_Exams.html';
}

let timerInterval;

// Fetch and render the exam with the student ID
async function fetchExam(examId, studentId) {
    try {
        let examData = await veld.Exams.getExam(examId);
        console.log(examData);

        // Check if the student has already entered the exam
        const enteredIds = examData.entredID ? examData.entredID.split(";").map(id => id.replace(/{|}/g, '').trim()).filter(Boolean) : [];
        if (enteredIds.includes(studentId)) {
            alert("You have already entered this exam.");
            window.location.href = "STD_Profile.html";
            return;
        }

        // Set exam title
        document.getElementById("exam-title").textContent = examData.name;

        // Render questions
        const questionsContainer = document.getElementById("questions-container");
        questionsContainer.innerHTML = "";

        examData.questions.forEach((question, index) => {
            const questionBlock = document.createElement("div");
            questionBlock.className = "mb-3";

            questionBlock.innerHTML = `
                <p><strong>Question ${index + 1}:</strong> ${question.slice(1, -1)}</p>
                <textarea class="form-control" id="answer_${index}" placeholder="Your answer" rows="3"></textarea>
            `;

            questionsContainer.appendChild(questionBlock);
        });

        // Add student to the list of participants via Veld client
        await addStudentToExam(examId, studentId);

        // Start the timer
        startTimer(examData.duration);

        // Submit event
        document.getElementById("submit-exam").onclick = () => submitExam(examId, examData.questions, studentId);
    } catch (error) {
        if (veld.isErrorCode(error, veld.Exams.errors.getExam.notFound)) {
            alert("Exam not found.");
        } else {
            console.error("Error fetching exam:", error.message);
        }
    }
}

// Timer function
function startTimer(duration) {
    const timerElement = document.getElementById("timer");
    let remainingTime = duration * 60;

    timerInterval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            alert("Time is up! Submitting your exam.");
            document.getElementById("submit-exam").click();
        }

        remainingTime--;
    }, 1000);
}

// Add student to exam participants via Veld client
async function addStudentToExam(examId, studentId) {
    try {
        await veld.Exams.addStudentToExam(examId, { studentId });
    } catch (error) {
        if (veld.isErrorCode(error, veld.Exams.errors.addStudentToExam.alreadyEntered)) {
            console.warn("Student already entered this exam.");
        } else if (veld.isErrorCode(error, veld.Exams.errors.addStudentToExam.notFound)) {
            alert("Exam not found. Cannot add participant.");
        } else {
            console.error("Error adding student to exam:", error.message);
            alert("Error adding you to the exam. Please try again.");
        }
    }
}

// Submit exam answers via Veld client
async function submitExam(examId, questions, studentId) {
    clearInterval(timerInterval);

    const answers = questions.map((_, index) => ({
        question: questions[index],
        answer: document.getElementById(`answer_${index}`).value.trim(),
    }));

    try {
        // Fetch exam data to get model answers
        const examData = await veld.Exams.getExam(examId);
        const modelAnswers = examData.answers;

        if (!modelAnswers || modelAnswers.length !== questions.length) {
            alert("Error: Model answers are missing or mismatched.");
            return;
        }

        // Calculate grade
        let grade = 0;
        answers.forEach((ans, index) => {
            if (ans.answer.toLowerCase() === modelAnswers[index][0].toLowerCase()) {
                grade += 100 / questions.length;
            }
        });

        // Submit via Veld client
        await veld.Exams.submitExam(examId, {
            studentId,
            answers: JSON.stringify(answers),
            grade: Math.round(grade),
        });

        alert("Exam submitted successfully! Your grade: " + Math.round(grade));
        window.location.href = "STD_Profile.html";
    } catch (error) {
        if (veld.isErrorCode(error, veld.Exams.errors.submitExam.notFound)) {
            alert("Exam not found. Cannot submit.");
        } else {
            console.error("Error submitting exam:", error.message);
            alert("Network error. Please try again later.");
        }
    }
}

// Initialize exam
const examId = localStorage.getItem("examId");
const studentId = JSON.parse(localStorage.getItem("currentUser")).id;

fetchExam(examId, studentId);
