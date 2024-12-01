// Predefined users
const users = [
    { username: "admin", password: "admin123" },
    { username: "student", password: "student123" },
    { username: "lecturer", password: "lecturer123" },
  ];

  
  document.getElementById("updateForm").addEventListener("submit", function (event) {
    event.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const newUsername = document.getElementById("newUsername").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    const user = users.find(u => u.username === username && u.password === password);
  
    if (!user) {
      setStatusMessage("Invalid username or password!", "error");
      return;
    }

    user.username = newUsername;
    user.password = newPassword;
  
    setStatusMessage("User details updated successfully!", "success");
    console.log("Updated Users:", users);
  });
  function setStatusMessage(message, type) {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    statusMessage.style.color = type === "success" ? "green" : "red";
  }
  