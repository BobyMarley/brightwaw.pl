const modalContainer = document.getElementById("modal-container");
const showModalButton = document.getElementById("show-modal");
const cancelButton = document.getElementById("cancel");
const successModalContainer = document.getElementById("success-modal-container");
const successModalCloseButton = document.getElementById("success-modal-close");
const pokojBtns = document.querySelectorAll(".pokoj-btn");

showModalButton.addEventListener("click", function() {
  if (vm && vm.isConditionMet) {
    document.querySelectorAll(".pokoj-btn").forEach(btn => {
      btn.classList.add("shake");
      setTimeout(() => {
        btn.classList.remove("shake");
      }, 500);
    });    
    return;
  }
  modalContainer.style.display = "block";
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
  modalContainer.style.display = "block";
});*/

cancelButton.addEventListener("click", function() {
  modalContainer.style.display = "none";
});

window.addEventListener("click", function(event) {
  if (event.target === modalContainer) {
    modalContainer.style.display = "none";
  }
});

successModalCloseButton.addEventListener("click", function() {
  successModalContainer.style.display = "none";
  modalContainer.style.display = "none";        
});