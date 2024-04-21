
const url = ""
let SUSPEND_NORMAL_OPERATION = false;
let specialistCategories = [];

function cancelUser() {
    usernameInput.value = '';
    passwordInput.value = '';
    document.getElementById("acknowlegementmodal").style.display = "none"

}

function saveUser() {
    if (SUSPEND_NORMAL_OPERATION) return
    fetch(url + "/users", {
        method: "POST",
        body: JSON.stringify({
            "username": usernameInput.value,
            "password": passwordInput.value,
            "specialists": specialistCategories,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
        .then(async (response) => {
            const { data } = await response.json();
            localStorage.setItem("username", data.username);
            localStorage.setItem("userid", data.userid)
            document.getElementById("acknowlegementmodal").style.display = "none";
            document.getElementById("acknowlegementmodal1").style.display = "block";
        })
        .catch((error) => {
            console.log(error)
        })
}

const login = async (username, password) => {
    await checkIfTestOngoing();
    if (SUSPEND_NORMAL_OPERATION) return;
    try {
        const response = await fetch(url + "/auth/users", {
            method: "PATCH",
            body: JSON.stringify({
                username,
                password,
                isOnline: true
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        //    return res.status(401).send({message: "User is inactive"});

        const data = await response.json();
        if (response.status == 401) {
            $('#logoutModal').modal('show');
            return;
        }
        if (response.status == 200) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);
            localStorage.setItem("userid", data.userid)
            // await connectToSocket();
            window.location.replace("/chatroom");
        }
    } catch (e) {
        console.log("login error", e);
    }
}
$('#logoutConfirm').click(function () {
    sessionStorage.clear();
    localStorage.clear();
    //reload
    window.location.replace("/community");
});

const verifyUser = async (username, password, specialistCategories) => {
    await checkIfTestOngoing();
    if (SUSPEND_NORMAL_OPERATION) return;
    return await fetch(url + "/users/verification", {
        method: "POST",
        body: JSON.stringify({
            "username": username,
            "password": password,
            "specialists": specialistCategories
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
}

const alertUser = (statusCode) => {
    if (statusCode == 400) {
        alert(`Username exist. \nPlease re-enter a different username or input correct password.`);
    } else if (statusCode == 401) {
        alert(`Username must be at least 3 characters long.`);
    } else if (statusCode == 402) {
        alert(`Your password must be at least 4 characters long. \nPasswords are case sensitive!`);
    } else if (statusCode == 403) {
        alert(`Your username is prohibited. Try again.`);
    } else {
        alert(`Server experienced a problem`);
    }
}

const getSpecialistCategories = async () => {
    const categories = [];
    document.querySelectorAll('.form-check-input').forEach(input => {
        if (input.checked) categories.push(input.value);
    });
    return categories;
};


const submitJoinForm = async () => {
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    specialistCategories = await getSpecialistCategories();

    if (usernameInput && passwordInput) {
        const response = await verifyUser(usernameInput.value, passwordInput.value, specialistCategories);
        if (response.status == 201) {
            document.getElementById("acknowlegementmodal").style.display = "block";
        } else if (response.status == 206) {
            login(usernameInput.value, passwordInput.value)
        } else {
            alertUser(response.statusCode);
        }
    }
}


async function userAcknowledged() {
    await checkIfTestOngoing();
    if (SUSPEND_NORMAL_OPERATION) return
    try {
        const response = await fetch(url + "/users/acknowledgement", {
            method: "POST",
            body: JSON.stringify({
                "username": localStorage.getItem("username"),
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        if (response.status == 200) {
            window.location.replace('/chatroom');
            document.getElementById("acknowlegementmodal1").style.display = "none"
            usernameInput.value = '';
            passwordInput.value = '';
        }
    } catch (error) {
        console.log(error);
    }
}

window.onload = async () => {
    try {
        await checkIfTestOngoing();
    } catch (error) {

    }
}

const checkIfTestOngoing = async () => {
    const response = await fetch(url + "/speedTest", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });
    const responseData = await response.json();
    if (responseData) {
        SUSPEND_NORMAL_OPERATION = true;
    }
}