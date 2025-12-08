
document.addEventListener("DOMContentLoaded", function () {
  const categoryButtons = document.querySelectorAll(".drink-category-btn");
  const categorySections = document.querySelectorAll(".drink-category-section");

  function switchCategory(categoryId) {
    
    categorySections.forEach((section) => {
      section.classList.remove("active");
    });

    categoryButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    const targetSection = document.getElementById(`drinks-${categoryId}`);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    const activeBtn = document.querySelector(
      `.drink-category-btn[data-category="${categoryId}"]`
    );
    if (activeBtn) {
      activeBtn.classList.add("active");
    }

    const menuSection = document.querySelector(".drink-menu-section");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const categoryId = this.getAttribute("data-category");
      switchCategory(categoryId);
    });
  });

  if (categorySections.length > 0) {
    switchCategory("most-liked");
  }
});

