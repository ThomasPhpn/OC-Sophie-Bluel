document.addEventListener("DOMContentLoaded", () => {
  let works = [];
  let categories = new Set();

  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((data) => {
      works = data;
      console.table(works); // TEST
      displayWorks(works);
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

  function setActiveButton(activeButton) {
    const allButtons = document.querySelectorAll("#buttons .button");
    allButtons.forEach((button) => {
      button.classList.remove("activeButton");
    });
    activeButton.classList.add("activeButton");
  }
});
