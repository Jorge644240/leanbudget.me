window.onbeforeunload = () => {
    return '';
}

document.querySelector("input[type='submit']").addEventListener("click", (event) => {
    const pass = document.querySelector("input[name='pass']").value, verify = document.querySelector("input[name='verify']").value;
    if (pass !== verify) {
        event.preventDefault();
        document.querySelector("p#error").innerHTML = "New passwords don't match";
    } else {
        window.onbeforeunload = () => {};
    }
});