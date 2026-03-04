// Go Back to Std-Profile
function goBack() {
    window.location.href = "Std_Profile.html";
}

// Fetch subjects from backend using Veld client
async function fetchSubjects() {
    try {
        const data = await veld.Subjects.listSubjects();

        // Get the current user and their subjectsId from localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const subjectsId = currentUser ? currentUser.subjects : [];
        const studentId = currentUser ? currentUser.id : null;
        console.log('subjectsId', subjectsId);

        // Filter the subjects to match the subjectsId from localStorage
        const filteredSubjects = data.subjects.filter(subject => subjectsId.includes(subject.id));

        for (const subject of filteredSubjects) {
            console.log('subject', subject);
            const examsData = await veld.Exams.listExamsBySubject(subject.id);
            const exams = examsData.exams;
            console.log('exams', exams);

            let totalGrade = 0;
            let gradeCount = 0;

            exams.forEach(exam => {
                const gradesString = exam.grades || "";
                if (!gradesString) return;

                const gradesArray = gradesString.slice(1, -1).split(";").map(entry => entry.trim());
                const gradesObject = {};

                gradesArray.forEach(entry => {
                    const [sid, grade] = entry.split(":").map(str => str.trim());
                    if (sid && grade) {
                        gradesObject[sid] = parseFloat(grade);
                    }
                });

                const studentGrade = gradesObject[studentId];

                if (studentGrade !== undefined) {
                    totalGrade += studentGrade;
                } else {
                    totalGrade += 0;
                }
                gradeCount++;
            });

            const averageGrade = gradeCount > 0 ? (totalGrade / gradeCount).toFixed(0) : "No grades";
            subject.averageGrade = averageGrade;
        }

        if (filteredSubjects.length > 0) {
            renderTable(filteredSubjects);
        } else {
            alert('No matching subjects found for the current user.');
        }
    } catch (error) {
        if (veld.isErrorCode(error, veld.Subjects.errors.getSubject.notFound)) {
            alert('Subject not found.');
        } else {
            console.error(error);
            alert('Failed to load subjects');
        }
    }
}

// Render subjects into the table
function renderTable(subjects) {
    const tbody = document.querySelector("#degrees-table tbody");
    tbody.innerHTML = "";
    subjects.forEach(subject => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${subject.name}</td>
            <td>${subject.averageGrade}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Call fetchSubjects on page load
fetchSubjects();
