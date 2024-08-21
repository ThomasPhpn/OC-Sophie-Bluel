document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("authToken", data.token);

        window.location.href = "index.html";
      } else {
        displayErrorMessage("Email ou mot de passe incorrect.");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      displayErrorMessage(
        "Une erreur est survenue. Veuillez réessayer plus tard."
      );
    }
  });

  function displayErrorMessage(message) {
    let errorElement = document.getElementById("error-message");
    errorElement.style.display = "flex";
    errorElement.style.color = "red";
    errorElement.textContent = message;
  }
});
