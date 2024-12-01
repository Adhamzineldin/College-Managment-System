document.getElementById("updateForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get current user details from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // Get the form input values
    const password = document.getElementById("password").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmNewPassword = document.getElementById("confirmPassword").value.trim();

    // Validate password and username input
    if (!password || !newPassword || !confirmNewPassword) {
        setStatusMessage("All fields are required!", "error");
        return;
    }

    // Check if the current password matches (or send just the new values to update)
    if (currentUser.password !== password) {
        setStatusMessage("Incorrect password!", "error");
        return;
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmNewPassword) {
        setStatusMessage("Passwords do not match!", "error");
        return;
    }

    try {
        // Make PUT request to update user data on the backend
        const response = await fetch(`http://localhost:5000/api/updateUser/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: currentUser.id,
                password: newPassword,
                role: currentUser.role,
                name: currentUser.name,
                email: currentUser.email,
                subjects: currentUser.subjects,
            })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser.password = newPassword;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            setStatusMessage("User details updated successfully!", "success");
        } else {
            setStatusMessage(data.message || "Failed to update user details", "error");
        }
    } catch (error) {
        console.error("Error updating user:", error);
        setStatusMessage("An error occurred. Please try again later.", "error");
    }
});

function setStatusMessage(message, type) {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    statusMessage.style.color = type === "success" ? "green" : "red";
}
