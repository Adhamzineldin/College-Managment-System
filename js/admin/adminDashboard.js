document.addEventListener("DOMContentLoaded", () => {
    const updateCredentialsButton = document.getElementById("update-credentials");
    const modal = new bootstrap.Modal(document.getElementById("updateCredentialsModal"));

    updateCredentialsButton.addEventListener("click", () => {
        modal.show();
    });

});
