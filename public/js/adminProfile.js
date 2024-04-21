const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
let originalUsername = '';
let originalPassword = '';

const editUserProfile = async (userid) => {
    if (SUSPEND_NORMAL_OPERATION) return;
        const response = await fetch(url + `/users/profile/${userid}` , {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });
    const data = await response.json();
    originalUsername = data.username;
    originalPassword = '';
    const editModal = new bootstrap.Modal(document.getElementById("editProfileModal"), {});
    document.getElementById("edit-username").value = data.username;
    document.getElementById("edit-password").value = "";
    document.getElementById("edit-confirm-password").value = "";

    const administrators = getAdministratorsFromLocalStorage();
    if (administrators.includes(localStorage.getItem("username").toLowerCase())) {
        const statusSelect = document.getElementById("edit-status");
        statusSelect.value = data.useraccountstatus;
        const userTypeSelect = document.getElementById("edit-user-type");
        userTypeSelect.value = capitalizeFirstLetter(data.usertype);

        
    }else{
        const statusSelect = document.getElementById("edit-status");
        statusSelect.value = data.useraccountstatus;
        const userTypeSelect = document.getElementById("edit-user-type");
        userTypeSelect.value = capitalizeFirstLetter(data.usertype);

        document.getElementById("edit-status").disabled = true;
        document.getElementById("edit-user-type").disabled = true;
    }

    editModal.show();


}
// PUT /users/:id/profile
const submitEditForm = async () => {
    const privilege = await checkPrivilege(localStorage.getItem("userid"));
    console.log(privilege);
 
    if (SUSPEND_NORMAL_OPERATION) return;
    const isUsernameValid = usernameChanged ? await validateUsername() : true;
    const isPasswordValid = passwordChanged ? await validatePassword() && await validateConfirmPassword() : true;

    if (!isUsernameValid || !isPasswordValid) {
        alert("Please correct the errors in the form.");
        return;
    }
    const username = document.getElementById("edit-username").value;
    const password = document.getElementById("edit-password").value;
    const confirmPassword = document.getElementById("edit-confirm-password").value;
    const status = document.getElementById("edit-status").value;
    const usertype = document.getElementById("edit-user-type").value;
    const userId = localStorage.getItem("userId");
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    try {
        const response = await fetch(`/users/profile/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId, username, password, status, usertype
            })
        });
        if (response.ok) {
            const result = await response.json();
            localStorage.setItem("username", result.data.username);

            alert('Profile updated successfully');
            window.location.reload();
        } else {
            const error = await response.text();
            alert('Failed to update profile: ' + error);
        }
    } catch (error) {
        alert('Failed to update profile: ' + error);
    }
}


const usernameInput = document.getElementById("edit-username");
const passwordInput = document.getElementById("edit-password");
const confirmPasswordInput = document.getElementById("edit-confirm-password");
const minLengthUsername = 3;
const minLengthPassword = 4;
let usernameChanged = false;
let passwordChanged = false;
// Example list of prohibited usernames from user-config.js


const validateUsername = async () => {
    const username = usernameInput.value;
    if (username.length < minLengthUsername) {
        displayValidationError(usernameInput, "Username must be at least " + minLengthUsername + " characters long.");
        return false;
    }
    if (prohibitedUsernames.includes(username.toLowerCase())) {
        displayValidationError(usernameInput, "This username is not allowed.");
        return false;
    }
    clearValidationError(usernameInput);
    return true;
}

const validatePassword = async () => {
    const password = passwordInput.value;
    if (password.length < minLengthPassword) {
        displayValidationError(passwordInput, "Password must be at least " + minLengthPassword + " characters long.");
        return false;
    }
    clearValidationError(passwordInput);
    return true;
}

const validateConfirmPassword = async () => {
    if (passwordInput.value !== confirmPasswordInput.value) {
        displayValidationError(confirmPasswordInput, "Passwords do not match.");
        return false;
    }
    clearValidationError(confirmPasswordInput);
    return true;
}

const displayValidationError = async (inputElement, message) => {
    const errorDiv = inputElement.nextElementSibling || document.createElement("div");
    errorDiv.textContent = message;
    errorDiv.className = 'error-message';
    inputElement.classList.add('is-invalid');
    if (!inputElement.nextElementSibling) {
        inputElement.parentNode.appendChild(errorDiv);
    }
}

const clearValidationError = async (inputElement) => {
    const errorDiv = inputElement.nextElementSibling;
    if (errorDiv) {
        errorDiv.textContent = '';
    }
    inputElement.classList.remove('is-invalid');
}

usernameInput.addEventListener('input', () => {
    usernameChanged = document.getElementById("edit-username").value !== originalUsername;
    if (usernameChanged) {
        validateUsername();
    }
});
passwordInput.addEventListener('input', () => {
    passwordChanged = document.getElementById("edit-password").value !== originalPassword;
    if (passwordChanged) {
        validatePassword();
    }
});
confirmPasswordInput.addEventListener('input', ()=>{
    if(passwordChanged){
        validateConfirmPassword()
    }
});


const checkPrivilege = async(userid)=>{
    //router.post("/users/:id/privilege", UserActionValidation)
    const response = await fetch(`/users/${userid}/privilege`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();
        return result.data;
    } else {
        const error = await response.text();
        alert('Failed to check privilege: ' + error);
    }


}

