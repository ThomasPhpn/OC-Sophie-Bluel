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
        .addEventListener("click", () => {
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
          document.querySelector("#trash-" + workNumber).parentElement.remove();
          const updatedWorks = works.filter((work) => {
            return work.id !== workNumber;
          });
          displayWorks(updatedWorks);
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

      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      addPhotoCategory.appendChild(option);
    });
  }

  // Mode ADMIN
  function setupEditMode() {
    const authToken = localStorage.getItem("authToken");
    const editBar = document.getElementById("edit");
    const editButton = document.getElementById("editButton");

    if (authToken) {
      editBar.style.display = "flex";
      editButton.style.display = "flex";
    } else {
      editBar.style.display = "none";
      editButton.style.display = "none";
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
    // LOGOUT, pour faire des tests - à supprimer
    document.getElementById("logout").addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.href = "index.html";
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

  // Ajouter un WORK
  function newWork() {}

  init();
});
