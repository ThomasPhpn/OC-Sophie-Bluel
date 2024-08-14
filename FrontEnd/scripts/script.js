document.addEventListener("DOMContentLoaded", () => {
  let works = [];

  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((data) => {
      works = data;
      console.log(works); // TEST
      displayWorks(works);
    })
    .catch((error) => console.error("Error:", error));

  function displayWorks(works) {
    const gallery = document.getElementById("gallery");
    works.forEach((work) => {
      const newFigure = document.createElement("figure");
      newFigure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}"/>
        <figcaption>${work.title}</figcaption>
      `;
      gallery.appendChild(newFigure);
    });
  }
});
