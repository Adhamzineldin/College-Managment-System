localStorage.setItem("students", JSON.stringify([
    { name: "Ayman Elfeky", id: "123", email: "Ay@gmail.com" },
    { name: "Adham Zineldin", id: "456", email: "Ad@gmail.com" }
]));


/* Reset Button */
let btn_reset = document.querySelector("button.reset");
btn_reset.addEventListener("click", function () {
    localStorage.removeItem("status");
    location.reload();
});

/* Submit and Validation */
let btn_pay = document.querySelector("button.pay");
btn_pay.addEventListener("click", function () {
    let students = JSON.parse(localStorage.getItem('students'));

    /* Validation for Student name */
    let name_field = document.querySelector("#name");
    let valid_name = false;
    for (let i = 0; i < students.length; i++) {
        if (name_field.value === students[i].name) {
            valid_name = true;
        }
    }
    if (!valid_name) {
        document.querySelector("#name + .sms").style.display = 'block';
    }

    /* Validation for Student ID */
    let id_field = document.querySelector("#id");
    let valid_id = false;
    for (let i = 0; i < students.length; i++) {
        if (id_field.value == students[i].id) {
            valid_id = true;
        }
    }
    if (!valid_id) {
        document.querySelector("#id + .sms").style.display = 'block';
    }

    /* Validation for Email */
    let email_field = document.querySelector("#email");
    let valid_email = false;
    for (let i = 0; i < students.length; i++) {
        if (email_field.value === students[i].email) {
            valid_email = true;
        }
    }
    if (email_field.value.includes("@gmail.com")) {
        valid_email = true;
    } else {
        valid_email = false;
    }
    if (!valid_email) {
        document.querySelector("#email + .sms").style.display = 'block';
    }

    /* Validation for ZIP Code */
    let zip_field = document.querySelector("#zip");
    let valid_zip = zip_field.value.toString().length === 5;
    if (!valid_zip) {
        document.querySelector("#zip + .sms").style.display = 'block';
    }

    /* Validation for Card Number */
    let card_number_field = document.querySelector("#card");
    let valid_cardNumber = false;
    if (+card_number_field.value.slice(0, 1) === 4 && (card_number_field.value.length === 16 || card_number_field.value.length === 13)) {
        valid_cardNumber = true;
    }
    else if (((+(card_number_field.value.slice(0, 2)) >= 51 && +(card_number_field.value.slice(0, 2)) <= 55) ||
        (+(card_number_field.value.slice(0, 4)) >= 2221 && +(card_number_field.value.slice(0, 4)) <= 2720)) &&
        (card_number_field.value.length === 16 || card_number_field.value.length === 13)) {
        valid_cardNumber = true;
    }
    if (!valid_cardNumber) {
        document.querySelector("#card + .sms").style.display = "block";
    }

    /* Validation for CVV */
    let cvv_field = document.querySelector("#cvv");
    let valid_cvv = cvv_field.value.toString().length === 3;
    if (!valid_cvv) {
        document.querySelector("#cvv + .sms").style.display = 'block';
    }

    /* Check for complete data */
    if (valid_id && valid_cardNumber && valid_cvv && valid_email && valid_name && valid_zip) {
        console.log('Everything is ok');
        /* remove error messages */
        document.querySelector("#name + .sms").style.display = 'none';
        document.querySelector("#email + .sms").style.display = 'none';
        document.querySelector("#id + .sms").style.display = 'none';
        document.querySelector("#zip + .sms").style.display = 'none';
        document.querySelector("#card + .sms").style.display = 'none';
        document.querySelector("#cvv + .sms").style.display = 'none';

        /* state success in local storage */
        localStorage.setItem("status", "success");

        /* show success message */
        document.querySelector(".success-message").classList.add("d-block");
    }
});
