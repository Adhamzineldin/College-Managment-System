if (!localStorage.exam){
  localStorage.setItem("exam",JSON.stringify([]));
}

/* Helper Function to Show Sections */
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.add("d-none");
  });
  document.getElementById(sectionId).classList.remove("d-none");
}

// Load students from Local Storage
function loadStudentsFromLocalStorage() {
  const storedStudents = JSON.parse(localStorage.getItem("students"));
  if (storedStudents) {
    students = storedStudents;
    console.log("Students loaded from Local Storage:", students);
  } else {
    console.log("No student data found in Local Storage.");
  }
}

// Add a Question
document.getElementById("add-question").addEventListener("click", function () {
  const questionText = document.getElementById("question-text").value;
  const questionanswer1 = document.getElementById("question-answer1").value;
  const questionanswer2 = document.getElementById("question-answer2").value;
  const questionanswer3 = document.getElementById("question-answer3").value;
  const questionanswer4 = document.getElementById("question-answer4").value;
  const correctAnswer = document.getElementById("correct-answer").value;

  if (questionText && questionanswer1 && questionanswer2 && questionanswer3 && questionanswer4 && correctAnswer) {
    /* load exam from local storage */
    let exams = JSON.parse(localStorage.exam);
    const questionId = exams.length; // Assign a unique ID
    exams.push({ questionId, questionText, questionanswer1, questionanswer2, questionanswer3, questionanswer4, correctAnswer });
    localStorage.exam = JSON.stringify(exams);

    renderQuestions();

    // Clear inputs
    document.getElementById("question-text").value = "";
    document.getElementById("question-answer1").value = '';
    document.getElementById("question-answer2").value = '';
    document.getElementById("question-answer3").value = '';
    document.getElementById("question-answer4").value = '';
    document.getElementById("correct-answer").value = "";
  }
});

// Render Questions
function renderQuestions() {
  const questionsList = document.getElementById("questions-list");
  questionsList.innerHTML = ""; // Clear current list

  let exams = JSON.parse(localStorage.exam);
  exams.forEach((q) => {
    const questionDiv = document.createElement("div");
    questionDiv.className =
      "alert alert-secondary";
    questionDiv.innerHTML = `
      <div>
        <p>Question: ${q.questionText}</p>
        <p>A: ${q.questionanswer1}</p>
        <p>B: ${q.questionanswer2}</p>
        <p>C: ${q.questionanswer3}</p>
        <p>D: ${q.questionanswer4}</p>
        <p>Correct Answer: ${q.correctAnswer}</p>
      </div>
      <div>
        <button class="btn btn-sm btn-warning me-2" onclick="editQuestion(${q.questionId})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${q.questionId})">Delete</button>
      </div>
    `;
    questionsList.appendChild(questionDiv);
  });
}

// Edit Question
function editQuestion(id) {
  let exams = JSON.parse(localStorage.exam);
  const question = exams.find((q) => q.questionId === id);
  if (question) {
    document.getElementById("question-text").value = question.questionText;
    document.getElementById("question-answer1").value = question.questionanswer1;
    document.getElementById("question-answer2").value = question.questionanswer2;
    document.getElementById("question-answer3").value = question.questionanswer3;
    document.getElementById("question-answer4").value = question.questionanswer4;
    document.getElementById("correct-answer").value = question.correctAnswer;

    deleteQuestion(id); // Remove the question so it can be re-added
  }
  localStorage.exam = JSON.stringify(exams);
}

// Delete Question
function deleteQuestion(id) {
  let exams = JSON.parse(localStorage.exam);
  exams = exams.filter((q) => q.questionId !== id);
  localStorage.exam = JSON.stringify(exams);
  localStorage.exam = JSON.stringify(exams);
  renderQuestions();
}

// Calculate Grades

document.getElementById("calculate-grade").addEventListener("click", function () {
    const gradeResults = document.getElementById("grade-results");
    gradeResults.innerHTML = ""; // Clear previous results

    /* get student from local storage */
    let studentDegree = JSON.parse(localStorage.studentDegree);
    let exam = JSON.parse(localStorage.exam);
    let grade = 0;

    studentDegree.forEach((quesetion,index) => {
        if (quesetion.questionsIndex && quesetion.answer == exam[quesetion.questionsIndex].correctAnswer){
          grade++;
        }
    });

      const resultDiv = document.createElement("div");
      resultDiv.innerText = `${studentDegree[0]}: ${grade}/${exam.length}`;
      gradeResults.appendChild(resultDiv);

      studentDegree[studentDegree.length - 1] = grade; // Save grade for reporting

      /* retrieve studentDegree to localStorage */
      localStorage.studentDegree = JSON.stringify(studentDegree);
});

// Generate Report
let studentDegree = JSON.parse(localStorage.studentDegree);
let exam = JSON.parse(localStorage.exam);
document
  .getElementById("generate-report")
  .addEventListener("click", function () {
    const reportOutput = document.getElementById("report-output");
    reportOutput.innerHTML = ""; // Clear previous content

    const totalStudents = 1;
    const grade = studentDegree[studentDegree.length - 1];
    const highestGrade = Math.max(grade,grade);
    const lowestGrade = Math.min(grade,grade);

    const reportSummary = `
    <strong>Class Report Summary:</strong>
    <ul>
      <li><strong>Total Students:</strong> ${totalStudents}</li>
      <li><strong>Highest Grade:</strong> ${highestGrade}/${exam.length}</li>
      <li><strong>Lowest Grade:</strong> ${lowestGrade}/${exam.length}</li>
    </ul>
  `;
    reportOutput.innerHTML = reportSummary;
  });

// Export Report
document.getElementById("export-report").addEventListener("click", function () {
  const grade = `${studentDegree[0]}: ${studentDegree[studentDegree.length - 1]}/${exam.length}`;
  const reportContent = `Class Report:\n\n${grade}`;

  const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "exam_report.txt";
  link.click();
});

// Initialize
loadStudentsFromLocalStorage();

// show question after reload page
if (localStorage.exam){
  renderQuestions();
}
