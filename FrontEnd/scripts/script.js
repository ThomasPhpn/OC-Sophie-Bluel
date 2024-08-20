document.addEventListener("DOMContentLoaded", () => {
  const works = [];
  const categories = new Set();

  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      return response.json();
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  const init = async () => {
    const [worksData, categoriesData] = await Promise.all([
      fetchData("http://localhost:5678/api/works"),
      fetchData("http://localhost:5678/api/categories"),
    ]);

    works.push(...worksData);
    categoriesData.forEach((category) => categories.add(category));

    console.log([worksData, categoriesData]);
    displayWorks(works);
    displayWorksModal(works);
    displayCategories(categories);
    setupEditMode();
    setupModalNavigation();
    setupFileUpload();
  };

  const displayWorks = (works) => {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = works
      .map(
        (work) => `
      <figure>
        <img src="${work.imageUrl}" alt="${work.title}" />
        <figcaption>${work.title}</figcaption>
      </figure>
    `
      )
      .join("");
  };

  const displayWorksModal = (works) => {
    const modalGallery = document.getElementById("modalGallery");
    modalGallery.innerHTML = works
      .map(
        (work) => `
      <figure class="modalFigure">
        <img src="${work.imageUrl}" alt="${work.title}" />
        <div class="trash" id="trash-${work.id}">
          <i class="fa-solid fa-trash-can"></i>
        </div>
      </figure>
    `
      )
      .join("");

    works.forEach((work) => {
      document
        .querySelector(`#trash-${work.id}`)
        .addEventListener("click", () => deleteWork(work.id));
    });
  };

  const deleteWork = async (workId) => {
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
        document.querySelector(`#trash-${workId}`).parentElement.remove();
        const updatedWorks = works.filter((work) => work.id !== workId);
        displayWorks(updatedWorks);
      } else {
        console.error(`Failed to delete work ${workId}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const setActiveButton = (activeButton) => {
    const buttons = document.querySelectorAll(".button");
    buttons.forEach((button) => {
      button.classList.remove("activeButton");
    });
    activeButton.classList.add("activeButton");
  };

  const displayCategories = (categories) => {
    const buttons = document.getElementById("buttons");
    const addPhotoCategory = document.getElementById("category");

    buttons.innerHTML = "";

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
        const filteredWorks = works.filter(
          (work) => work.category.id === category.id
        );
        displayWorks(filteredWorks);
        setActiveButton(button);
      });
      buttons.appendChild(button);

      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      addPhotoCategory.appendChild(option);
    });
  };

  const setupEditMode = () => {
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

    document.getElementById("logout").addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.href = "index.html";
    });
  };

  const setupModalNavigation = () => {
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
  };

  const setupFileUpload = () => {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const previewImage = document.getElementById("previewImage");

    uploadButton.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  };

  init();
});
