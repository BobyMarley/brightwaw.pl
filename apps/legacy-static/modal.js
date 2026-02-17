const modalContainer = document.getElementById("modal-container");
const showModalButton = document.getElementById("show-modal");
const cancelButton = document.getElementById("cancel");
const successModalContainer = document.getElementById("success-modal-container");
const successModalCloseButton = document.getElementById("success-modal-close");

function openModal() {
  modalContainer.classList.add("active");
}

function closeModal() {
  modalContainer.classList.remove("active");
}

showModalButton.addEventListener("click", function() {
  if (vm.isConditionMet) {
    vm.$el.querySelectorAll(".pokoj-btn").forEach(btn => {
      btn.classList.add("shake");
      setTimeout(() => {
        btn.classList.remove("shake");
      }, 500);
    });    
    return;
  }
  openModal();
});

cancelButton.addEventListener("click", function() { closeModal(); });

window.addEventListener("click", function(event) {
  if (event.target === modalContainer) {
    closeModal();
  }
});

successModalCloseButton.addEventListener("click", function() {
  successModalContainer.style.display = "none";
  closeModal();
});
