/* Reset Button */
let btn_reset = document.querySelector("button.reset");
btn_reset.addEventListener("click", function () {
    localStorage.removeItem("status");
    location.reload();
});

/* Submit and Validation */
let btn_pay = document.querySelector("button.pay");
btn_pay.addEventListener("click", function () {
    let student = JSON.parse(localStorage.getItem("currentUser")); // Parse student object

    /* Helper function for showing error messages */
    function showError(fieldSelector) {
        document.querySelector(`${fieldSelector} + .sms`).style.display = 'block';
    }

    function hideError(fieldSelector) {
        document.querySelector(`${fieldSelector} + .sms`).style.display = 'none';
    }

    /* Validation for Student Name */
    let name_field = document.querySelector("#name");
    let valid_name = name_field.value === student.name;

    if (!valid_name) {
        showError("#name");
    } else {
        hideError("#name");
    }

    /* Validation for Student ID */
    let id_field = document.querySelector("#id");
    let valid_id = id_field.value === student.id;

    if (!valid_id) {
        showError("#id");
    } else {
        hideError("#id");
    }

    /* Validation for Email */
    let email_field = document.querySelector("#email");
    let valid_email = email_field.value === student.email || email_field.value.endsWith("@gmail.com");

    if (!valid_email) {
        showError("#email");
    } else {
        hideError("#email");
    }

    /* Validation for ZIP Code */
    let zip_field = document.querySelector("#zip");
    let valid_zip = zip_field.value.length === 5 && !isNaN(Number(zip_field.value));

    if (!valid_zip) {
        showError("#zip");
    } else {
        hideError("#zip");
    }

    /* Validation for Card Number */
    let card_number_field = document.querySelector("#card");
    let card_number = card_number_field.value;
    let valid_cardNumber = false;

    if (
        (card_number.startsWith("4") && (card_number.length === 16 || card_number.length === 13)) ||
        (
            (Number(card_number.slice(0, 2)) >= 51 && Number(card_number.slice(0, 2)) <= 55) ||
            (Number(card_number.slice(0, 4)) >= 2221 && Number(card_number.slice(0, 4)) <= 2720)
        ) && (card_number.length === 16 || card_number.length === 13)
    ) {
        valid_cardNumber = true;
    }

    if (!valid_cardNumber) {
        showError("#card");
    } else {
        hideError("#card");
    }

    /* Validation for CVV */
    let cvv_field = document.querySelector("#cvv");
    let valid_cvv = cvv_field.value.length === 3 && !isNaN(Number(cvv_field.value));

    if (!valid_cvv) {
        showError("#cvv");
    } else {
        hideError("#cvv");
    }

    /* Check for complete data */
    if (valid_id && valid_cardNumber && valid_cvv && valid_email && valid_name && valid_zip) {
        console.log('Everything is ok');
        /* State success in local storage */
        localStorage.setItem("status", "success");

        /* Show success message */
        document.querySelector(".success-message").classList.add("d-block");
    }
});
