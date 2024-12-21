document.getElementById('create-acc').addEventListener('click', () => {
    window.open('signup.html', '_blank');
});

const inputElement = document.getElementById('email');
const emailResult = document.getElementById('email-result');

function validateEmail() {
    const inputValue = inputElement.value;
    if (inputValue.includes('@')) {
        emailResult.textContent = "Email Valid";
        emailResult.style.color = "green";
        return true;
    } else {
        emailResult.textContent = "Email Invalid";
        emailResult.style.color = "red";
        return false;
    }
}

inputElement.addEventListener('input', validateEmail);
const loginButton = document.getElementById('login-button');
const tester = document.getElementById('tester');


