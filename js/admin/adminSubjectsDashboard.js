document.addEventListener('DOMContentLoaded', () => {
    const searchSubjectInput = document.getElementById('search-subject');
    const subjectListContainer = document.getElementById('subject-list');
    const addSubjectButton = document.getElementById('add-subject');
    const subjectNameInput = document.getElementById('subject-name');
    const saveSubjectButton = document.getElementById('save-subject');
    let currentSubjectId = null;
    const baseUrl   = window.location.hostname === "localhost"
  ? "http://localhost:5000"  // Local development
  : "https://app5000.maayn.me";

    // Initialize Bootstrap modal
    const subjectModal = new bootstrap.Modal(document.getElementById('subjectModal'));

    // Function to fetch and display all subjects
    function loadSubjects() {
        fetch(`${baseUrl}/api/subjects`)
            .then(response => response.json())
            .then(data => {
                const subjects = data.subjects;
                subjectListContainer.innerHTML = '';
                subjects.forEach(subject => {
                    const subjectCard = document.createElement('div');
                    subjectCard.classList.add('col-md-4', 'mb-3');
                    subjectCard.innerHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${subject.name}</h5>
                                <button class="btn btn-warning btn-sm edit-subject" data-id="${subject.id}">Edit</button>
                                <button class="btn btn-danger btn-sm delete-subject" data-id="${subject.id}">Delete</button>
                            </div>
                        </div>
                    `;
                    subjectListContainer.appendChild(subjectCard);
                });

                // Add event listeners for edit and delete buttons
                document.querySelectorAll('.edit-subject').forEach(button => {
                    button.addEventListener('click', handleEditSubject);
                });

                document.querySelectorAll('.delete-subject').forEach(button => {
                    button.addEventListener('click', handleDeleteSubject);
                });
            })
            .catch(error => console.error('Error fetching subjects:', error));
    }

    // Handle adding a new subject
    addSubjectButton.addEventListener('click', () => {
        currentSubjectId = null;
        subjectNameInput.value = '';
        subjectModal.show();  // Use Bootstrap's native modal show method
    });

    // Handle saving a new or edited subject
    saveSubjectButton.addEventListener('click', () => {
        const subjectName = subjectNameInput.value.trim();
        if (!subjectName) {
            alert('Subject name is required');
            return;
        }

        const subjectData = { name: subjectName };

        const method = currentSubjectId ? 'PUT' : 'POST';
        const url = currentSubjectId ? `${baseUrl}/api/subject/${currentSubjectId}` : `${baseUrl}/api/subject`;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subjectData)
        })
            .then(response => response.json())
            .then(data => {
                subjectModal.hide();  // Use Bootstrap's native modal hide method
                loadSubjects();
            })
            .catch(error => console.error('Error saving subject:', error));
    });

    // Handle editing a subject
    function handleEditSubject(event) {
        const subjectId = event.target.dataset.id;
        fetch(`${baseUrl}/api/subject/${subjectId}`)
            .then(response => response.json())
            .then(subject => {
                currentSubjectId = subject.id;
                subjectNameInput.value = subject.name;
                subjectModal.show();
            })
            .catch(error => console.error('Error fetching subject:', error));
    }

    // Handle deleting a subject
    function handleDeleteSubject(event) {
        const subjectId = event.target.dataset.id;
        if (confirm('Are you sure you want to delete this subject?')) {
            fetch(`${baseUrl}/api/subject/${subjectId}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    loadSubjects();
                })
                .catch(error => console.error('Error deleting subject:', error));
        }
    }

    // Search functionality
    searchSubjectInput.addEventListener('input', () => {
        const query = searchSubjectInput.value.toLowerCase();
        const subjectCards = subjectListContainer.querySelectorAll('.card');
        subjectCards.forEach(card => {
            const subjectName = card.querySelector('.card-title').textContent.toLowerCase();
            if (subjectName.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Initial subjects load
    loadSubjects();
});
