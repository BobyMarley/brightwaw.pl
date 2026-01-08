const modalContainer = document.getElementById("modal-container");
const showModalButton = document.getElementById("show-modal");
const cancelButton = document.getElementById("cancel");
const successModalContainer = document.getElementById("success-modal-container");
const successModalCloseButton = document.getElementById("success-modal-close");
const pokojBtns = document.querySelectorAll(".pokoj-btn");

showModalButton.addEventListener("click", function () {
  if (vm.isConditionMet) {
    vm.$el.querySelectorAll(".pokoj-btn").forEach(btn => {
      btn.classList.add("shake");
      setTimeout(() => {
        btn.classList.remove("shake");
      }, 500);
    });
    return;
  }
  modalContainer.classList.add("is-visible");
});
/*
showModalButton.addEventListener("click", function() {
  if (vm.selectedItems.length < 1) {
    pokojBtns.forEach(btn => {
      btn.classList.add("shake");
      setTimeout(() => {
        btn.classList.remove("shake");
      }, 500);
    });    
    return;
  }
  modalContainer.classList.add("is-visible");
});*/

cancelButton.addEventListener("click", function () {
  modalContainer.classList.remove("is-visible");
});

window.addEventListener("click", function (event) {
  if (event.target === modalContainer) {
    modalContainer.classList.remove("is-visible");
  }
});

successModalCloseButton.addEventListener("click", function () {
  successModalContainer.classList.remove("is-visible");
  modalContainer.classList.remove("is-visible");
});