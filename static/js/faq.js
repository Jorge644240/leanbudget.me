document.querySelectorAll(".question").forEach(question => {
    question.addEventListener("click", () => {
        if (question.parentElement.classList.contains("active")) {
            question.parentElement.classList.remove("active");
            question.children[0].classList.replace("bi-caret-up-fill", "bi-caret-down-fill");
        } else {
            if (document.querySelector(".faq.active")) {
                document.querySelector(".faq.active i").classList.replace("bi-caret-up-fill", "bi-caret-down-fill");
                document.querySelector(".faq.active").classList.remove("active");
            }
            question.parentElement.classList.add("active");
            question.children[0].classList.replace("bi-caret-down-fill", "bi-caret-up-fill");
        }
    });
});