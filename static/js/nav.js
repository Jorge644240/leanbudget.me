document.querySelector("nav > i.bi-list").addEventListener("click", () => {
    if (window.innerWidth < 550) document.querySelector("nav > div").classList.toggle("show");
});