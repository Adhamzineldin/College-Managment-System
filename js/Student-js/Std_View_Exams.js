const apiUrl = "http://localhost:5000/api"; // Your API URL
const studentId = JSON.parse(localStorage.getItem("currentUser")).id; // Get student ID from localStorage

// Fetch and render subjects and exams
async function fetchSubjects() {
    try {
        const response = await fetch(`${apiUrl}/exams`);
        let exams = await response.json();
        exams = exams.exams;


        // Clear the container
        const subjectsContainer = document.getElementById("subjects-container");
        subjectsContainer.innerHTML = "";

        // Loop through each exam
        exams.forEach(async exam => {
            const subjectBlock = document.createElement("div");
            subjectBlock.className = "subject-container";
            subjectBlock.innerHTML = `
                <h4>Subject: ${exam.subject_id}</h4>
                <div id="exams-${exam.id}">
                    <p><strong>Exam Name:</strong> ${exam.name}</p>
                    <p><strong>Date:</strong> ${exam.date}</p>
                    <p><strong>Duration:</strong> ${exam.duration} minutes</p>
                    <p><strong>Total Marks:</strong> ${exam.total_marks}</p>
                    <div id="exam-action-${exam.id}"></div>
                </div>
            `;

            // Check eligibility to enter the exam or show grade
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


        // Fix grades and entered IDs to be valid JSON

        const response = await fetch(`${apiUrl}/exam/${exam.id}`);
        exam = await response.json();



        const grades = exam.grades ? parseCustomData(exam.grades) : {};
        const enteredIds = exam.entredID ? parseCustomData(exam.entredID) : [];



        // Check if the student has entered the exam
        if (enteredIds.includes(studentId)) {
            if (grades[studentId] !== undefined) {
                // Show grade if the student has already taken the exam
                actionBlock.innerHTML = `
                    <p>Your Grade: ${grades[studentId]}</p>
                    <button class="btn btn-info btn-grade" disabled>Grade View</button>
                `;
            } else {
                // The student has entered but hasn't been graded yet
                actionBlock.innerHTML = `
                    <p>You have entered this exam, but grades are not available yet.</p>
                `;
            }
        } else {
            // Allow student to enter the exam if they haven't entered it yet

            actionBlock.innerHTML = ` 
                <button class="btn btn-primary btn-enter" onclick="enterExam('${exam.id}')">Enter Exam</button>
            `;
        }
    } catch (error) {
        console.error("Error checking exam eligibility:", error);
        alert("Error checking exam eligibility.");
    }
}

// Utility function to parse custom formatted data
// Utility function to parse custom formatted data
function parseCustomData(data) {
    if (!data) return null;

    // Ensure the input is clean and valid
    data = data.trim();

    // Handle objects (e.g., grades: "{20230003: 100}")
    if (data.startsWith("{") && data.includes(":")) {
        // Remove braces and split by commas or semicolons
        const cleanedData = data.replace(/[{}]/g, "").split(/[,;]/).filter(item => item.trim() !== "");
        return cleanedData.reduce((acc, item) => {
            const [key, value] = item.split(":").map(str => str.trim());
            if (key && value) {
                acc[key] = Number(value); // Convert value to a number
            }
            return acc;
        }, {});
    }

    // Handle arrays (e.g., entered IDs: "{20230003;20230004;}")
    if (data.startsWith("{") && !data.includes(":")) {
        return data.replace(/[{}]/g, "").split(";").filter(item => item.trim() !== "");
    }

    // Return null if the format doesn't match
    return null;
}

// Redirect to the exam page
function enterExam(examId) {

    localStorage.setItem("examId", examId); // Store examId in localStorage
    window.location.href = "Std_Exam.html"; // Redirect to the exam page
}

const goBack = () => {
    window.location.href='./Std_Profile.html';
}


// Initialize the page by fetching exams
fetchSubjects();
