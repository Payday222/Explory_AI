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

    popup = document.getElementById('popup');

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
                popup.textContent = "Invalid Login Credentials (Password)";
                popup.style.height = "100px";
        popup.style.width = "400px";
        popup.style.border = "none";
        popup.style.borderRadius = "10px";
        popup.style.lineHeight = "100px";
        popup.style.backgroundColor = "rgb(255, 101, 101)";
        popup.style.position = "absolute";
        popup.style.textAlign = "center";
                console.log("invalid login");
                setTimeout(function() {
                    popup.textContent = "";
                    popup.style.height = "";
                    popup.style.width = "";
                    popup.style.border = "";
                    popup.style.borderRadius = "";
                    popup.style.lineHeight = "";
                    popup.style.backgroundColor = "";
                    popup.style.position = "";
                    popup.style.textAlign = "";
                }, 2000);
                
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    } else {
        popup.textContent = "Invalid Email";
        popup.style.height = "100px";
        popup.style.width = "400px";
        popup.style.border = "none";
        popup.style.borderRadius = "10px";
        popup.style.lineHeight = "100px";
        popup.style.backgroundColor = "rgb(255, 101, 101)";
        popup.style.position = "absolute";
        popup.style.textAlign = "center";
        setTimeout(function() {
            popup.style.height = "";
            popup.style.width = "";
            popup.style.border = "";
            popup.style.borderRadius = "";
            popup.style.lineHeight = "";
            popup.style.backgroundColor = "";
            popup.style.position = "";
            popup.style.textAlign = "";
        }, 2000);
    }
});

passReset = document.getElementById('forgot-password');

passReset.addEventListener('click', () => {

    const email = "";
    if(!validateEmail) {
        popup.textContent = "Please insert your email first";
        popup.style.height = "100px";
        popup.style.width = "400px";
        popup.style.border = "none";
        popup.style.borderRadius = "10px";
        popup.style.lineHeight = "100px";
        popup.style.backgroundColor = "rgb(255, 101, 101)";
        popup.style.position = "absolute";
        popup.style.textAlign = "center";
        setTimeout(function() {
            popup.style.height = "";
            popup.style.width = "";
            popup.style.border = "";
            popup.style.borderRadius = "";
            popup.style.lineHeight = "";
            popup.style.backgroundColor = "";
            popup.style.position = "";
            popup.style.textAlign = "";
        }, 2000);
    } else {
        const email = document.getElementById('email').value;
    }
    
   });
