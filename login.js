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

function login() {
    if (validateEmail()) {
        const email = document.getElementById("email").value;
        const password = document.getElementById('password').value;

        tester.textContent = "aaaa"; // Passed validation

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Query success') {
                tester.textContent = "Query success";
                window.location.replace('user_panel.html');
                // window.close('login.html');
            } else {
                tester.textContent = "error inserting data";
            }
        })
        .catch(error => {
            tester.textContent = "Error executing query";
            console.error('Error:', error);
        });
    }
}

loginButton.addEventListener('click', login);
