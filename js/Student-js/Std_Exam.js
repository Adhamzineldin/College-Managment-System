// Return back to Std_View_Exams.html
const goBack = () => {
    window.location.href='./Std_View_Exams.html';
}


const apiUrl = window.location.hostname === "localhost"
  ? "http://localhost:5000"  // Local development
  : "https://app5000.maayn.me";
let timerInterval;

// Fetch and render the exam with the student ID
async function fetchExam(examId, studentId) {
    try {
        const response = await fetch(`${apiUrl}/api/exam/${examId}`);
        let examData = await response.json();
        console.log(examData);

        // Check if the student has already entered the exam
        const enteredIds = examData.entredID ? examData.entredID.split(";").map(id => id.slice(1, -1)) : [];
        if (enteredIds.includes(studentId)) {
            alert("You have already entered this exam.");
            window.location.href = "STD_Profile.html"; // Redirect to profile if already entered
            return;
        }

        // Set exam title
        document.getElementById("exam-title").textContent = examData.name;

        // Render questions
        const questionsContainer = document.getElementById("questions-container");
        questionsContainer.innerHTML = ""; // Clear existing questions

        examData.questions.forEach((question, index) => {
            const questionBlock = document.createElement("div");
            questionBlock.className = "mb-3";

            questionBlock.innerHTML = `
                <p><strong>Question ${index + 1}:</strong> ${question.slice(1, -1)}</p>
                <textarea class="form-control" id="answer_${index}" placeholder="Your answer" rows="3"></textarea>
            `;

            questionsContainer.appendChild(questionBlock);
        });

        // Add student to the list of participants
        await addStudentToExam(examId, studentId);

        // Start the timer
        startTimer(examData.duration);

        // Submit event
        document.getElementById("submit-exam").onclick = () => submitExam(examId, examData.questions, studentId);
    } catch (error) {
        console.error("Error fetching exam:", error.message);
    }
}

// Timer function
function startTimer(duration) {
    const timerElement = document.getElementById("timer");
    let remainingTime = duration * 60; // Convert minutes to seconds

    timerInterval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            alert("Time is up! Submitting your exam.");
            document.getElementById("submit-exam").click(); // Auto-submit when time expires
        }

        remainingTime--;
    }, 1000);
}

// Add student to exam participants
async function addStudentToExam(examId, studentId) {
    try {
        const response = await fetch(`${apiUrl}/api/exam/${examId}/add-student`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to add student:", errorData.message);
            alert("Error adding you to the exam. Please try again.");
        }
    } catch (error) {
        console.error("Error adding student to exam:", error.message);
        alert("Network error. Please try again later.");
    }
}

// Submit exam answers
async function submitExam(examId, questions, studentId) {
    clearInterval(timerInterval); // Stop the timer

    const answers = questions.map((_, index) => ({
        question: questions[index],
        answer: document.getElementById(`answer_${index}`).value.trim(),
    }));

    try {
        // Fetch the exam data to get the model answers
        const examResponse = await fetch(`${apiUrl}/api/exam/${examId}`);
        const examData = await examResponse.json();
        const modelAnswers = examData.answers; // Assuming `answers` contains the correct answers

        if (!modelAnswers || modelAnswers.length !== questions.length) {
            alert("Error: Model answers are missing or mismatched.");
            return;
        }

        // Calculate grade
        let grade = 0;
        answers.forEach((ans, index) => {
            if (ans.answer.toLowerCase() === modelAnswers[index][0].toLowerCase()) {
                grade += 100 / questions.length; // Divide total score by the number of questions
            }
        });

        // Send the submission with the calculated grade
        const response = await fetch(`${apiUrl}/api/exam/${examId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, answers, grade: Math.round(grade) }),
        });

        if (response.ok) {
            alert("Exam submitted successfully! Your grade: " + Math.round(grade));
            window.location.href = "STD_Profile.html"; // Redirect back to the profile page
        } else {
            const errorData = await response.json();
            console.error("Submission failed:", errorData.message);
            alert("There was an error submitting your exam. Please try again.");
        }
    } catch (error) {
        console.error("Error submitting exam:", error.message);
        alert("Network error. Please try again later.");
    }
}

// Initialize exam with example values
const examId =  localStorage.getItem("examId");
const studentId =  JSON.parse(localStorage.getItem("currentUser")).id;


fetchExam(examId, studentId);
