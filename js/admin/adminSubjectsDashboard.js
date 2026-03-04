document.addEventListener('DOMContentLoaded', () => {
    const searchSubjectInput = document.getElementById('search-subject');
    const subjectListContainer = document.getElementById('subject-list');
    const addSubjectButton = document.getElementById('add-subject');
    const subjectNameInput = document.getElementById('subject-name');
    const saveSubjectButton = document.getElementById('save-subject');
    let currentSubjectId = null;

    // Initialize Bootstrap modal
    const subjectModal = new bootstrap.Modal(document.getElementById('subjectModal'));

    // Function to fetch and display all subjects using Veld client
    async function loadSubjects() {
        try {
            const data = await veld.Subjects.listSubjects();
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
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    }

    // Handle adding a new subject
    addSubjectButton.addEventListener('click', () => {
        currentSubjectId = null;
        subjectNameInput.value = '';
        subjectModal.show();
    });

    // Handle saving a new or edited subject using Veld client
    saveSubjectButton.addEventListener('click', async () => {
        const subjectName = subjectNameInput.value.trim();
        if (!subjectName) {
            alert('Subject name is required');
            return;
        }

        try {
            const input = currentSubjectId
                ? { id: currentSubjectId, name: subjectName }
                : { name: subjectName };

            await veld.Subjects.saveSubject(input);
            subjectModal.hide();
            loadSubjects();
        } catch (error) {
            console.error('Error saving subject:', error);
        }
    });

    // Handle editing a subject using Veld client
    async function handleEditSubject(event) {
        const subjectId = event.target.dataset.id;
        try {
            const subject = await veld.Subjects.getSubject(subjectId);
            currentSubjectId = subject.id;
            subjectNameInput.value = subject.name;
            subjectModal.show();
        } catch (error) {
            console.error('Error fetching subject:', error);
        }
    }

    // Handle deleting a subject using Veld client
    async function handleDeleteSubject(event) {
        const subjectId = event.target.dataset.id;
        if (confirm('Are you sure you want to delete this subject?')) {
            try {
                await veld.Subjects.deleteSubject(subjectId);
                loadSubjects();
            } catch (error) {
                console.error('Error deleting subject:', error);
            }
        }
    }

    // Search functionality
    searchSubjectInput.addEventListener('input', () => {
        const query = searchSubjectInput.value.toLowerCase();
        const subjectCards = subjectListContainer.querySelectorAll('.card');
        subjectCards.forEach(card => {
            const subjectName = card.querySelector('.card-title').textContent.toLowerCase();
            card.style.display = subjectName.includes(query) ? '' : 'none';
        });
    });

    // Initial subjects load
    loadSubjects();
});
