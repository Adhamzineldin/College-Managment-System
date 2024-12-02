document.addEventListener("DOMContentLoaded", () => {
    const studentList = document.getElementById("student-list");
    const searchInput = document.getElementById("search-student");
    const addButton = document.getElementById("add-student");
    const modal = new bootstrap.Modal(document.getElementById("studentModal"));
    const saveButton = document.getElementById("save-student");
    const nameInput = document.getElementById("student-name");
    const emailInput = document.getElementById("student-email");
    const subjectsSelect = document.getElementById("student-subjects");
    const idInput = document.getElementById("student-id");
    const passwordInput = document.getElementById("student-password");

    let currentStudentIndex = -1;
    let subjects = [];


    const apiUrl = window.location.hostname === "localhost"
  ? "http://localhost:5000"  // Local development
  : "https://app5000.maayn.me";

    // Fetch subjects from backend
    const fetchSubjects = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/subjects`);
            const data = await response.json();
            if (data.subjects) {
                subjects = data.subjects;
                renderSubjects();
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    // Render subjects dynamically
    const renderSubjects = () => {
        subjectsSelect.innerHTML = "";
        subjects.forEach(subject => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = subject.id;  // Use subject.id here
            checkbox.id = `subject-${subject.id}`;  // ID is based on subject.id
            checkbox.classList.add("form-check-input");

            const label = document.createElement("label");
            label.setAttribute("for", checkbox.id);
            label.classList.add("form-check-label");
            label.textContent = subject.name;  // Display subject.name

            const div = document.createElement("div");
            div.classList.add("form-check");
            div.appendChild(checkbox);
            div.appendChild(label);

            subjectsSelect.appendChild(div);
        });
    };

    // Fetch and render all students from the backend
    const fetchStudents = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/students`);
            const data = await response.json();
            if (data.students) {
                renderStudents(data.students);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    // Render student list
    const renderStudents = (students) => {
        studentList.innerHTML = students.length
            ? students
                .map(
                    (student) => `
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm p-3">
                                <h5 class="card-title">${student.name}</h5>
                                <p class="card-text">Email: ${student.email}</p>
                                <p class="card-text">ID: ${student.id}</p>
                                <p class="card-text">Subjects: ${student.subjects.join(", ")}</p>
                                <button class="btn btn-warning edit-btn" data-id="${student.id}">Edit</button>
                                <button class="btn btn-danger delete-btn" data-id="${student.id}">Delete</button>
                            </div>
                        </div>`
                )
                .join("")
            : `<p>No students found.</p>`;
    };

    // Open the modal for editing or adding a student
    const openModal = async (studentId = null) => {
        if (studentId) {
            try {
                const response = await fetch(`${apiUrl}/api/student/${studentId}`);
                const student = await response.json();

                if (student) {
                    nameInput.value = student.name;
                    emailInput.value = student.email;
                    idInput.value = student.id; // ID is fetched from the backend
                    idInput.disabled = true; // Disable the ID field

                    passwordInput.value = student.password;

                    Array.from(subjectsSelect.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
                        checkbox.checked = student.subjects.includes(checkbox.value);
                    });

                    currentStudentIndex = student.id;
                }
            } catch (error) {
                console.error("Error fetching student data:", error);
            }
        } else {
            nameInput.value = "";
            emailInput.value = "";
            idInput.value = "";
            passwordInput.value = "";
            Array.from(subjectsSelect.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => checkbox.checked = false);
            currentStudentIndex = -1;
        }

        modal.show();
    };

    // Save student to the backend (add or update)
    const saveStudent = async () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const selectedSubjects = Array.from(subjectsSelect.querySelectorAll('input[type="checkbox"]:checked')).map(
            checkbox => checkbox.value  // Save subject id, not name
        );

        if (!name || !email || !password || selectedSubjects.length === 0 ) {
            alert("Please fill all fields");
            return;
        }

        const studentData = {
            email,
            name,
            password,
            role: 'student',  // Set role to 'student' as per your backend
            subjects: selectedSubjects, // Use subject ids here
            finalGrade: 100
        };

        try {
            const method = currentStudentIndex === -1 ? "POST" : "PUT";
            const url = currentStudentIndex === -1
                ? `${apiUrl}/api/add-user`
                : `${apiUrl}/api/student/${currentStudentIndex}`;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(studentData)
            });

            const result = await response.json();

            if (response.status === 200) {
                fetchStudents();  // Refresh the student list
                modal.hide();     // Close the modal
            } else {
                alert("Error saving student data: " + result.message);
            }
        } catch (error) {
            console.error("Error saving student:", error);
        }
    };

    // Event listeners
    addButton.addEventListener("click", () => openModal());
    saveButton.addEventListener("click", saveStudent);

    studentList.addEventListener("click", (event) => {
        const button = event.target;

        if (button.classList.contains("edit-btn")) {
            const studentId = button.getAttribute("data-id");
            openModal(studentId);
        } else if (button.classList.contains("delete-btn")) {
            const studentId = button.getAttribute("data-id");
            deleteStudent(studentId);
        }
    });

    searchInput.addEventListener("input", () => {
        const searchQuery = searchInput.value.toLowerCase();
        const studentCards = studentList.querySelectorAll(".card");

        studentCards.forEach(card => {
            const studentName = card.querySelector(".card-title").textContent.toLowerCase();
            card.style.display = studentName.includes(searchQuery) ? "" : "none";
        });
    });

    // Delete student function
    const deleteStudent = async (studentId) => {
        const confirmed = confirm("Are you sure you want to delete this student?");
        if (confirmed) {
            try {
                const response = await fetch(`${apiUrl}/api/student/${studentId}`, {
                    method: "DELETE"
                });
                const result = await response.json();
                if (response.status === 200) {
                    fetchStudents();
                } else {
                    alert("Error deleting student");
                }
            } catch (error) {
                console.error("Error deleting student:", error);
            }
        }
    };

    // Initial data fetch
    fetchSubjects();  // Fetch subjects
    fetchStudents();  // Fetch students
});
