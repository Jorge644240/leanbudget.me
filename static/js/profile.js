setTimeout(() => {
    document.querySelector(".error").innerHTML = '';
    document.querySelector(".message").innerHTML = '';
}, 5000);

document.querySelector("#picture").addEventListener("click", () => {
    document.querySelector("input[type=file]").click();
});

document.querySelector("input[type=file]").addEventListener("input", (event) => {
    const [ file ] = event.target.files;
    if (file) {
        document.querySelector("#preview").classList.add("show");
        document.querySelector("#preview").src = URL.createObjectURL(file);
        document.querySelector("#picture").classList.remove("show");
        document.querySelector("input[type=submit]").classList.add("show");
    } else {
        document.querySelector("input[type=submit]").classList.remove("show");
    }
});

document.querySelector("h2.name i").addEventListener("click", () => {
    document.querySelector("input#name").classList.toggle("show");
    document.querySelector("input#name").focus();
});

document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", (event) => {
        if (event.target.value.trim() !== '') document.querySelector(".submit").classList.add("show");
        else document.querySelector(".submit").classList.remove("show");
    });
});

document.querySelector("input[type=reset]").addEventListener("click", (event) => {
    document.querySelectorAll("p.data").forEach(p => p.classList.add("show"));
    document.querySelectorAll("input").forEach(input => input.classList.remove("show"));
    document.querySelector("#picture").classList.add("show");
    document.querySelector("#preview").classList.remove("show");
    document.querySelector(".submit").classList.remove("show");
    event.target.blur();
});

document.querySelector("#delete").addEventListener("click", () => {
    const pass = prompt("Enter password to confirm.");
    if (pass.trim !== "")
        window.location.href = `/me/delete?p=${pass}`;
});