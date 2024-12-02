document.addEventListener("DOMContentLoaded", () => {
    const lecturerList = document.getElementById("lecturer-list");
    const searchInput = document.getElementById("search-lecturer");
    const addButton = document.getElementById("add-lecturer");
    const modal = new bootstrap.Modal(document.getElementById("lecturerModal"));
    const saveButton = document.getElementById("save-lecturer");
    const nameInput = document.getElementById("lecturer-name");
    const emailInput = document.getElementById("lecturer-email");
    const subjectsSelect = document.getElementById("lecturer-subjects");
    const idInput = document.getElementById("lecturer-id");
    const passwordInput = document.getElementById("lecturer-password");

    let currentLecturerIndex = -1;
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

    // Fetch and render all lecturers from the backend
    const fetchLecturers = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/lecturers`);
            const data = await response.json();
            if (data.lecturers) {
                renderLecturers(data.lecturers);
            }
        } catch (error) {
            console.error("Error fetching lecturers:", error);
        }
        
    };

    // Render lecturer list
    const renderLecturers = (lecturers) => {
        lecturerList.innerHTML = lecturers.length
            ? lecturers
                .map(
                    (lecturer) => `
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm p-3">
                                <h5 class="card-title">${lecturer.name}</h5>
                                <p class="card-text">Email: ${lecturer.email}</p>
                                <p class="card-text">ID: ${lecturer.id}</p>
                                <p class="card-text">Subjects: ${lecturer.subjects.join(", ")}</p>
                                <button class="btn btn-warning edit-btn" data-id="${lecturer.id}">Edit</button>
                                <button class="btn btn-danger delete-btn" data-id="${lecturer.id}">Delete</button>
                            </div>
                        </div>`
                )
                .join("")
            : `<p>No lecturers found.</p>`;
    };

    // Open the modal for editing or adding a lecturer
    const openModal = async (lecturerId = null) => {
        if (lecturerId) {
            try {
                const response = await fetch(`${apiUrl}/api/lecturer/${lecturerId}`);
                const lecturer = await response.json();

                if (lecturer) {
                    nameInput.value = lecturer.name;
                    emailInput.value = lecturer.email;
                    idInput.value = lecturer.id; // ID is fetched from the backend
                    idInput.disabled = true; // Disable the ID field

                    passwordInput.value = lecturer.password;

                    Array.from(subjectsSelect.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
                        checkbox.checked = lecturer.subjects.includes(checkbox.value);
                    });

                    currentLecturerIndex = lecturer.id;
                }
            } catch (error) {
                console.error("Error fetching lecturer data:", error);
            }
        } else {
            nameInput.value = "";
            emailInput.value = "";
            idInput.value = "";
            passwordInput.value = "";
            Array.from(subjectsSelect.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => checkbox.checked = false);
            currentLecturerIndex = -1;
        }

        modal.show();
    };

    // Save lecturer to the backend (add or update)
    const saveLecturer = async () => {
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

        const lecturerData = {
            email,
            name,
            password,
            role: 'lecturer',  // Set role to 'lecturer' as per your backend
            subjects: selectedSubjects, // Use subject ids here
        };

        try {
            const method = currentLecturerIndex === -1 ? "POST" : "PUT";
            const url = currentLecturerIndex === -1
                ? `${apiUrl}/api/add-user`
                : `${apiUrl}/api/lecturer/${currentLecturerIndex}`;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lecturerData)
            });

            const result = await response.json();

            if (response.status === 200) {
                fetchLecturers();  // Refresh the lecturer list
                modal.hide();     // Close the modal
            } else {
                alert("Error saving lecturer data: " + result.message);
            }
        } catch (error) {
            console.error("Error saving lecturer:", error);
        }
    };

    // Event listeners
    addButton.addEventListener("click", () => openModal());
    saveButton.addEventListener("click", saveLecturer);

    lecturerList.addEventListener("click", (event) => {
        const button = event.target;

        if (button.classList.contains("edit-btn")) {
            const lecturerId = button.getAttribute("data-id");
            openModal(lecturerId);
        } else if (button.classList.contains("delete-btn")) {
            const lecturerId = button.getAttribute("data-id");
            deleteLecturer(lecturerId);
        }
    });

    searchInput.addEventListener("input", () => {
        const searchQuery = searchInput.value.toLowerCase();
        const lecturerCards = lecturerList.querySelectorAll(".card");

        lecturerCards.forEach(card => {
            const lecturerName = card.querySelector(".card-title").textContent.toLowerCase();
            card.style.display = lecturerName.includes(searchQuery) ? "" : "none";
        });
    });

    // Delete lecturer function
    const deleteLecturer = async (lecturerId) => {
        const confirmed = confirm("Are you sure you want to delete this lecturer?");
        if (confirmed) {
            try {
                const response = await fetch(`${apiUrl}/api/lecturer/${lecturerId}`, {
                    method: "DELETE"
                });
                const result = await response.json();
                if (result.success) {
                    fetchLecturers();
                } else {
                    alert("Error deleting lecturer");
                }
            } catch (error) {
                console.error("Error deleting lecturer:", error);
            }
        }
    };

    // Initial data fetch
    fetchSubjects();  // Fetch subjects
    fetchLecturers();  // Fetch lecturers

});
