document.querySelectorAll(".reason").forEach(reason => {
    reason.addEventListener("click", () => {
        reason.children[reason.children.length-1].click();
    });
});