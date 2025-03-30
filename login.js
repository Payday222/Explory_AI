document.getElementById('create-acc').addEventListener('click', () => {
    window.open('signup.html', '_blank');
});

const inputElement = document.getElementById('email');
const password = document.getElementById('password');
const emailResult = document.getElementById('email-result');

function validateEmail() {
    console.log('example log');
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

loginButton.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (validateEmail()) {
        fetch('http://188.127.1.110:3004/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Login successful!");
                window.open('http://188.127.1.110:3005');
                window.open('http://188.127.1.110:3005');
                window.open('http://188.127.1.110:3005');

            } else {
                console.log("Invalid credentials.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }
});


