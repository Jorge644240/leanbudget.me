const date = new Date();

const year = date.getFullYear();

const month = (() => {
    if (date.getMonth().toString().length === 1) {
        return `0${date.getMonth()+1}`;
    }
    return date.getMonth();
})();

const day = (() => {
    if (date.getDate().toString().length === 1) {
        return `0${date.getDate()}`;
    }
    return date.getDate();
})();

const dateInput = document.querySelector("input[type=date]");

dateInput.value = dateInput.max = `${year}-${month}-${day}`;

dateInput.min = `${year}-${month}-01`;