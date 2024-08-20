document.addEventListener("DOMContentLoaded", () => {
  let works = [];
  let categories = new Set();

  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((data) => {
      works = data;
      console.table(works); // TEST
      displayWorks(works);
      displayWorksModal(works);
    })
    .catch((error) => console.error("Error:", error));

  fetch("http://localhost:5678/api/categories")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((category) => categories.add(category));
      console.table(Array.from(categories)); // TEST
      displayCategories(categories);
    })
    .catch((error) => console.error("Error:", error));

  function displayWorks(works) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    works.forEach((work) => {
      const newFigure = document.createElement("figure");
      newFigure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}"/>
        <figcaption>${work.title}</figcaption>
      `;
      gallery.appendChild(newFigure);
    });
  }

  function displayWorksModal(works) {
    const modalGallery = document.getElementById("modalGallery");
    modalGallery.innerHTML = "";
    works.forEach((work) => {
      const newFigure = document.createElement("figure");
      newFigure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}"/>
        <div class="trash" id="trash-${work.id}">
          <i class="fa-solid fa-trash-can"></i>
        </div>
      `;
      newFigure.classList.add("modalFigure");
      modalGallery.appendChild(newFigure);

      const trashIcon = newFigure.querySelector(`#trash-${work.id}`);
      trashIcon.addEventListener("click", () => {
        deleteWork(work.id);
      });
    });
  }

  async function deleteWork(workId) {
    const authToken = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `http://localhost:5678/api/works/${workId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log(`Work ${workId} deleted successfully.`);

        document.querySelector(`#trash-${workId}`).parentElement.remove();

        works = works.filter((work) => work.id !== workId);
        displayWorks(works);
      } else {
        console.error(`Failed to delete work ${workId}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function displayCategories(categories) {
    const buttons = document.getElementById("buttons");
    const generalButton = document.createElement("button");
    generalButton.textContent = "Tous";
    generalButton.classList.add("button");
    generalButton.id = "tous";
    buttons.appendChild(generalButton);
    generalButton.addEventListener("click", () => {
      displayWorks(works);
      setActiveButton(generalButton);
    });

    categories.forEach((category) => {
      const newButton = document.createElement("button");
      newButton.textContent = category.name;
      newButton.classList.add("button");
      newButton.id = category.id;
      buttons.appendChild(newButton);

      newButton.addEventListener("click", () => {
        const filteredWorks = works.filter(
          (work) => work.category.id === category.id
        );
        displayWorks(filteredWorks);
        setActiveButton(newButton);
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const authToken = localStorage.getItem("authToken");
  const editBar = document.getElementById("edit");
  const editButton = document.getElementById("editButton");
  const closeModal = document.getElementById("close");
  const modal = document.getElementById("modal");
  // MONTRER ADMIN BAR + BOUTON MODIFIER
  if (authToken) {
    editBar.style.display = "flex";
    editButton.style.display = "flex";
    console.log("token dispo");
  } else {
    editBar.style.display = "none";
    editButton.style.display = "none";
  }

  // OUVERTURE ET FERMETURE MODAL
  editButton.addEventListener("click", () => {
    modal.style.display = "flex";
  });
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
});

// GESTION LOGOUT
document.addEventListener("DOMContentLoaded", () => {
  const logOutButton = document.getElementById("logout");
  logOutButton.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    window.location.href = "login.html";
  });
});

// MODAL - AJOUT PHOTO

document.addEventListener("DOMContentLoaded", () => {
  const addPhotoButton = document.querySelector(".addPhoto");
  const modalGallery = document.getElementById("modal");
  const modalAddPhoto = document.getElementById("modalAddPhoto");
  const closeAddPhoto = document.getElementById("closeAddPhoto");
  const backToGallery = document.getElementById("backToGallery");

  addPhotoButton.addEventListener("click", () => {
    modalGallery.style.display = "none";
    modalAddPhoto.style.display = "flex";
  });

  closeAddPhoto.addEventListener("click", () => {
    modalAddPhoto.style.display = "none";
  });

  backToGallery.addEventListener("click", () => {
    modalAddPhoto.style.display = "none";
    modalGallery.style.display = "flex";
  });

  window.addEventListener("click", (event) => {
    if (event.target == modalAddPhoto) {
      modalAddPhoto.style.display = "none";
    }
  });
});
