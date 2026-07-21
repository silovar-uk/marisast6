(() => {
  document.addEventListener("click", event => {
    const moveButton = event.target.closest("[data-open-move]");
    if (!moveButton) return;
    event.preventDefault();
    location.href = `moves.html?move=${encodeURIComponent(moveButton.dataset.openMove)}`;
  });
})();
