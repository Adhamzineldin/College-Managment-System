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

    // Fetch subjects using Veld client
    const fetchSubjects = async () => {
        try {
            const data = await veld.Subjects.listSubjects();
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
            checkbox.value = subject.id;
            checkbox.id = `subject-${subject.id}`;
            checkbox.classList.add("form-check-input");

            const label = document.createElement("label");
            label.setAttribute("for", checkbox.id);
            label.classList.add("form-check-label");
            label.textContent = subject.name;

            const div = document.createElement("div");
            div.classList.add("form-check");
            div.appendChild(checkbox);
            div.appendChild(label);

            subjectsSelect.appendChild(div);
        });
    };

    // Fetch and render all lecturers using Veld client
    const fetchLecturers = async () => {
        try {
            const data = await veld.Lecturers.listLecturers();
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

    // Open the modal for editing or adding a lecturer using Veld client
    const openModal = async (lecturerId = null) => {
        if (lecturerId) {
            try {
                const lecturer = await veld.Lecturers.getLecturer(lecturerId);

                if (lecturer) {
                    nameInput.value = lecturer.name;
                    emailInput.value = lecturer.email;
                    idInput.value = lecturer.id;
                    idInput.disabled = true;
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

    // Save lecturer using Veld client (add or update)
    const saveLecturer = async () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const selectedSubjects = Array.from(subjectsSelect.querySelectorAll('input[type="checkbox"]:checked')).map(
            checkbox => checkbox.value
        );

        if (!name || !email || !password || selectedSubjects.length === 0) {
            alert("Please fill all fields");
            return;
        }

        const lecturerData = {
            email,
            name,
            password,
            role: 'lecturer',
            subjects: selectedSubjects,
        };

        try {
            if (currentLecturerIndex === -1) {
                // Create new lecturer via Veld Users.addUser
                await veld.Users.addUser(lecturerData);
            } else {
                // Update existing lecturer via Veld Lecturers.updateLecturer
                await veld.Lecturers.updateLecturer(currentLecturerIndex, lecturerData);
            }

            fetchLecturers();
            modal.hide();
        } catch (error) {
            console.error("Error saving lecturer:", error);
            if (veld.isErrorCode(error, veld.Users.errors.addUser.missingFields)) {
                alert("Missing required fields when creating lecturer.");
            } else if (veld.isErrorCode(error, veld.Lecturers.errors.updateLecturer.notFound)) {
                alert("Lecturer not found.");
            } else if (veld.isErrorCode(error, veld.Lecturers.errors.updateLecturer.missingFields)) {
                alert("Missing required fields when updating lecturer.");
            } else if (veld.isApiError(error)) {
                alert("Error saving lecturer data: " + error.body);
            }
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

    // Delete lecturer using Veld client
    const deleteLecturer = async (lecturerId) => {
        const confirmed = confirm("Are you sure you want to delete this lecturer?");
        if (confirmed) {
            try {
                await veld.Lecturers.deleteLecturer(lecturerId);
                fetchLecturers();
            } catch (error) {
                console.error("Error deleting lecturer:", error);
                alert("Error deleting lecturer");
            }
        }
    };

    // Initial data fetch
    fetchSubjects();
    fetchLecturers();
});
