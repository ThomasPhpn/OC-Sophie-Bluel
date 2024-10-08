document.addEventListener("DOMContentLoaded", function () {
  const works = [];
  const categories = new Set();

  // Fonction de récupération des données
  function fetchData(url) {
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
        return [];
      });
  }

  // Initialisation
  function init() {
    // Récupérer les WORKS
    fetchData("http://localhost:5678/api/works").then((worksData) => {
      works.push(...worksData);

      // Récupérer les CATEGORIES
      fetchData("http://localhost:5678/api/categories").then(
        (categoriesData) => {
          categoriesData.forEach((category) => {
            categories.add(category);
          });

          // TEST
          console.log([worksData, categoriesData]);

          // Appeler mes fonctions
          displayWorks(works);
          displayWorksModal(works);
          displayCategories(categories);
          setupEditMode();
          setupModalNavigation();
          newWork();
        }
      );
    });
  }

  // Afficher travaux dans "Mes projets"
  function displayWorks(works) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = works
      .map((work) => {
        return `
        <figure>
          <img src="${work.imageUrl}" alt="${work.title}" />
          <figcaption>${work.title}</figcaption>
        </figure>`;
      })
      .join("");
  }

  // ** Ajouter un nouveau WORK dans la galerie sans tout recharger
  function addNewWorkToGallery(newWork) {
    // ** Ajouter dans la galerie principale
    const gallery = document.getElementById("gallery");
    const figure = document.createElement("figure");
    figure.innerHTML = `
      <img src="${newWork.imageUrl}" alt="${newWork.title}" />
      <figcaption>${newWork.title}</figcaption>
    `;
    gallery.appendChild(figure);

    // ** Ajouter dans la galerie modale
    const modalGallery = document.getElementById("modalGallery");
    const modalFigure = document.createElement("figure");
    modalFigure.classList.add("modalFigure");
    modalFigure.innerHTML = `
      <img src="${newWork.imageUrl}" alt="${newWork.title}" />
      <div class="trash" id="trash-${newWork.id}">
        <i class="fa-solid fa-trash-can"></i>
      </div>
    `;
    modalGallery.appendChild(modalFigure);

    // ** Ajouter l'événement de suppression pour le WORK dans ma modale
    modalFigure
      .querySelector(`#trash-${newWork.id}`)
      .addEventListener("click", () => {
        deleteWork(newWork.id);
      });
  }

  // Afficher travaux dans ma modale
  function displayWorksModal(works) {
    const modalGallery = document.getElementById("modalGallery");
    modalGallery.innerHTML = works
      .map((work) => {
        return `
        <figure class="modalFigure">
          <img src="${work.imageUrl}" alt="${work.title}" />
          <div class="trash" id="trash-${work.id}">
            <i class="fa-solid fa-trash-can"></i>
          </div>
        </figure>`;
      })
      .join("");

    works.forEach((work) => {
      document
        .querySelector("#trash-" + work.id)
        .addEventListener("click", (event) => {
          event.stopPropagation(); // Résoudre bug suppression
          deleteWork(work.id);
        });
    });
  }

  // Supprimer un WORK
  function deleteWork(workNumber) {
    const authToken = localStorage.getItem("authToken");

    fetch("http://localhost:5678/api/works/" + workNumber, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + authToken,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          const indexToRemove = works.findIndex(
            (work) => work.id === workNumber
          );
          if (indexToRemove !== -1) {
            works.splice(indexToRemove, 1);
          }
          document.querySelector(`#trash-${workNumber}`).parentElement.remove(); // résoudre bug suppression
          displayWorks(works);
        } else {
          console.error("Failed to delete work " + workNumber);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Afficher les filtres (Mes projets + modale)
  function displayCategories(categories) {
    const buttons = document.getElementById("buttons");
    const addPhotoCategory = document.getElementById("category");

    buttons.innerHTML = "";
    // Créer bouton TOUS
    const generalButton = document.createElement("button");
    generalButton.className = "button activeButton";
    generalButton.id = "tous";
    generalButton.textContent = "Tous";
    buttons.appendChild(generalButton);

    generalButton.addEventListener("click", () => {
      displayWorks(works);
      setActiveButton(generalButton);
    });
    // Filtres portfolio
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = "button";
      button.id = category.id;
      button.textContent = category.name;
      button.addEventListener("click", () => {
        const filteredWorks = works.filter((work) => {
          return work.category.id === category.id;
        });
        displayWorks(filteredWorks);
        setActiveButton(button);
      });
      buttons.appendChild(button);
      // Filtres modale
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      addPhotoCategory.appendChild(option);
    });
  }

  function setActiveButton(activeButton) {
    const buttons = document.querySelectorAll("#buttons .button");
    buttons.forEach((button) => {
      button.classList.remove("activeButton");
    });
    activeButton.classList.add("activeButton");
  }

  // Mode ADMIN
  function setupEditMode() {
    const authToken = localStorage.getItem("authToken");
    const editBar = document.getElementById("edit");
    const editButton = document.getElementById("editButton");
    const loginLink = document.querySelector('a[href="login.html"]');

    if (authToken) {
      editBar.style.display = "flex";
      editButton.style.display = "flex";
      buttons.style.display = "none";

      loginLink.textContent = "Logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", () => {
        localStorage.removeItem("authToken");
        window.location.href = "index.html";
      });
    } else {
      editBar.style.display = "none";
      editButton.style.display = "none";

      loginLink.textContent = "Login";
      loginLink.href = "login.html";
    }

    editButton.addEventListener("click", () => {
      document.getElementById("modal").style.display = "flex";
    });

    document.getElementById("close").addEventListener("click", () => {
      document.getElementById("modal").style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target == document.getElementById("modal")) {
        document.getElementById("modal").style.display = "none";
      }
    });
  }

  // MODALE
  function setupModalNavigation() {
    const addPhotoButton = document.querySelector(".addPhoto");
    const modalGallery = document.getElementById("modal");
    const modalAddPhoto = document.getElementById("modalAddPhoto");

    addPhotoButton.addEventListener("click", () => {
      modalGallery.style.display = "none";
      modalAddPhoto.style.display = "flex";
    });

    document.getElementById("closeAddPhoto").addEventListener("click", () => {
      modalAddPhoto.style.display = "none";
    });

    document.getElementById("backToGallery").addEventListener("click", () => {
      modalAddPhoto.style.display = "none";
      modalGallery.style.display = "flex";
    });

    window.addEventListener("click", (event) => {
      if (event.target == modalAddPhoto) {
        modalAddPhoto.style.display = "none";
      }
    });
  }

  // ** Réinitialiser le formulaire après l'ajout d'un WORK
  function resetForm() {
    document.getElementById("newWorkTitle").value = "";
    document.getElementById("category").selectedIndex = 0;

    const newWorkImage = document.getElementById("fileInput");
    newWorkImage.value = null;
    document.getElementById("previewImage").src =
      "/assets/images/input-img.png";

    document.getElementById("uploadButton").style.display = "block";
    document.getElementById("photoInfo").style.display = "block";
  }

  // Ajouter un WORK
  function newWork() {
    const form = document.getElementById("addPhotoForm");
    const submitButton = form.querySelector("button[type='submit']");
    const newWorkTitle = document.getElementById("newWorkTitle");
    const categoryValue = document.getElementById("category");
    const newWorkImage = document.getElementById("fileInput");
    const previewImage = document.getElementById("previewImage");

    document
      .getElementById("uploadButton")
      .addEventListener("click", function () {
        document.getElementById("fileInput").click();
      });

    newWorkImage.addEventListener("change", function () {
      const file = newWorkImage.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          previewImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
        document.getElementById("uploadButton").style.display = "none";
        document.getElementById("photoInfo").style.display = "none";
      } else {
        previewImage.src = "/FrontEnd/assets/images/input-img.png";
      }
    });

    function updateButtonClass() {
      if (
        newWorkTitle.value.trim() === "" ||
        categoryValue.value === "" ||
        !newWorkImage.files[0]
      ) {
        submitButton.classList.remove("submitButton");
        submitButton.classList.add("submitButtonNotReady");
        submitButton.disabled = true;
      } else {
        submitButton.classList.remove("submitButtonNotReady");
        submitButton.classList.add("submitButton");
        submitButton.disabled = false;
      }
    }

    newWorkTitle.addEventListener("input", updateButtonClass);
    categoryValue.addEventListener("change", updateButtonClass);
    newWorkImage.addEventListener("change", updateButtonClass);

    updateButtonClass();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const workToPost = new FormData();
      workToPost.append("title", newWorkTitle.value);
      workToPost.append("category", categoryValue.value);
      workToPost.append("image", newWorkImage.files[0]);

      try {
        const response = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: workToPost,
        });

        if (response.ok) {
          const newWork = await response.json();
          addNewWorkToGallery(newWork);
          document.getElementById("modalAddPhoto").style.display = "none";
          resetForm();
        } else {
          console.error("Erreur:", response.status);
        }
      } catch (error) {
        console.error("ça n'a pas fonctionné", error);
      }
    });
  }

  init();
});
