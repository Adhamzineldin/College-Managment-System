document.addEventListener("DOMContentLoaded", () => {
    const updateCredentialsButton = document.getElementById("update-credentials");
    const modal = new bootstrap.Modal(document.getElementById("updateCredentialsModal"));
    const saveCredentialsButton = document.getElementById("save-credentials");
    const newUsernameInput = document.getElementById("new-username");
    const newPasswordInput = document.getElementById("new-password");


    const initializeData = () => {

        if (!localStorage.getItem("subjects")) {
    const subjects = [
        { name: "Programming 101" },
        { name: "Advanced Mathematics" },
        { name: "Quantum Physics" }
    ];
    localStorage.setItem("subjects", JSON.stringify(subjects));
}

if (!localStorage.getItem("students")) {
    const subjects = JSON.parse(localStorage.getItem("subjects"));
    const students = [
        { name: "John Doe", email: "john.doe@example.com", subjects: [subjects[0].name, subjects[1].name] },
        { name: "Jane Smith", email: "jane.smith@example.com", subjects: [subjects[1].name, subjects[2].name] },
        { name: "Sara Lee", email: "sara.lee@example.com", subjects: [subjects[2].name, subjects[0].name] }
    ];
    localStorage.setItem("students", JSON.stringify(students));
}

if (!localStorage.getItem("lecturers")) {
    const subjects = JSON.parse(localStorage.getItem("subjects"));
    const lecturers = [
        { name: "Dr. Alice", email: "alice@example.com", subjects: [subjects[0].name], experience: 5 },
        { name: "Prof. Bob", email: "bob@example.com", subjects: [subjects[1].name], experience: 10 },
        { name: "Dr. Charlie", email: "charlie@example.com", subjects: [subjects[2].name], experience: 7 }
    ];
    localStorage.setItem("lecturers", JSON.stringify(lecturers));
}
    };


    initializeData();


    updateCredentialsButton.addEventListener("click", () => {
        modal.show();
    });

});
