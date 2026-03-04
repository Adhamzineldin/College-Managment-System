let timerInterval;
const studentId = JSON.parse(localStorage.getItem("currentUser")).id;

// Fetch and render subjects and exams via Veld client
async function fetchSubjects() {
    try {
        const data = await veld.Exams.listExams();
        const exams = data.exams;

        const subjectsContainer = document.getElementById("subjects-container");
        subjectsContainer.innerHTML = "";

        exams.forEach(async exam => {
            const subjectBlock = document.createElement("div");
            subjectBlock.className = "subject-container";
            subjectBlock.innerHTML = `
                <h4>Subject: ${exam.subject_id}</h4>
                <div id="exams-${exam.id}">
                    <p><strong>Exam Name:</strong> ${exam.name}</p>
                    <p><strong>Date:</strong> ${exam.examDate}</p>
                    <p><strong>Duration:</strong> ${exam.duration} minutes</p>
                    <p><strong>Total Marks:</strong> ${exam.total_marks}</p>
                    <div id="exam-action-${exam.id}"></div>
                </div>
            `;

            const actionBlock = subjectBlock.querySelector(`#exam-action-${exam.id}`);
            await checkStudentEligibility(exam, actionBlock);

            subjectsContainer.appendChild(subjectBlock);
        });
    } catch (error) {
        console.error("Error fetching exams:", error);
        alert("Error loading exams.");
    }
}

// Check if the student can enter the exam or show their grade
async function checkStudentEligibility(exam, actionBlock) {
    try {
        const fullExam = await veld.Exams.getExam(exam.id);

        const grades = fullExam.grades ? parseCustomData(fullExam.grades) : {};
        const enteredIds = fullExam.entredID ? parseCustomData(fullExam.entredID) : [];

        if (enteredIds.includes(studentId)) {
            if (grades[studentId] !== undefined) {
                actionBlock.innerHTML = `
                    <p>Your Grade: ${grades[studentId]}</p>
                    <button class="btn btn-info btn-grade" disabled>Grade View</button>
                `;
            } else {
                actionBlock.innerHTML = `
                    <p>You have entered this exam, but grades are not available yet.</p>
                `;
            }
        } else {
            actionBlock.innerHTML = `
                <button class="btn btn-primary btn-enter" onclick="enterExam('${exam.id}')">Enter Exam</button>
            `;
        }
    } catch (error) {
        if (veld.isErrorCode(error, veld.Exams.errors.getExam.notFound)) {
            actionBlock.innerHTML = `<p class="text-danger">Exam not found.</p>`;
        } else {
            console.error("Error checking exam eligibility:", error);
            alert("Error checking exam eligibility.");
        }
    }
}

// Utility function to parse custom formatted data
function parseCustomData(data) {
    if (!data) return null;

    data = data.trim();

    // Handle objects (e.g., grades: "{20230003: 100}")
    if (data.startsWith("{") && data.includes(":")) {
        const cleanedData = data.replace(/[{}]/g, "").split(/[,;]/).filter(item => item.trim() !== "");
        return cleanedData.reduce((acc, item) => {
            const [key, value] = item.split(":").map(str => str.trim());
            if (key && value) {
                acc[key] = Number(value);
            }
            return acc;
        }, {});
    }

    // Handle arrays (e.g., entered IDs: "{20230003}{20230004}")
    if (data.startsWith("{") && !data.includes(":")) {
        return data.replace(/[{}]/g, "").split(/[;]/).filter(item => item.trim() !== "");
    }

    return null;
}

// Redirect to the exam page
function enterExam(examId) {
    localStorage.setItem("examId", examId);
    window.location.href = "Std_Exam.html";
}

const goBack = () => {
    window.location.href='./Std_Profile.html';
}

// Initialize the page
fetchSubjects();
