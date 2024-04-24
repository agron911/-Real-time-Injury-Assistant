const sendGroupMessage = async (group, message) => {
    if (SUSPEND_NORMAL_OPERATION) return
    await fetch(url + "/chatrooms/" + group, {
      method: "POST",
      body: JSON.stringify({ userid: localStorage.getItem("userid"), username: localStorage.getItem("username"), content: message, timestamp: new Date().toString(), status: "undefined", receiver: group, group: group }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
  };
  
  const getGroupMessages = async (group) => {
    if (SUSPEND_NORMAL_OPERATION) return;
    const response = await fetch(url + "/chatrooms/" + group, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    return response;
  }
  
  const ConfirmGroupChat = async (group) => {
    MESSAGE_RECEIVER = group;
  
    await checkIfTestOngoing();
    if (SUSPEND_NORMAL_OPERATION) return;
    try {
      const response = await fetch(url + "/chatrooms/" + group + "/" + localStorage.getItem("username"), {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      const data = await response.json();
  
      if (data.message == "No consent") {
        let confirmationModal = new bootstrap.Modal(document.getElementById('confirmJoinGroup'), {});
        document.getElementById('confirmJoinGroupLabel').innerText = `Confirm Joining ${group} Group`;
        document.getElementById('selectedGroup').innerText = `${group} group`;
        if (group == "Anxiety") {
          document.getElementById('groupRules').innerText = Anxiety_rule;
        } else if (group == "Depression") {
          document.getElementById('groupRules').innerText = Depression_rule;
        } else if (group == "Stress") {
          document.getElementById('groupRules').innerText = Stress_rule;
        } else if (group == "Grief") {
          document.getElementById('groupRules').innerText = Grief_rule;
        }
        confirmationModal.show();
        document.getElementById('JoinGroupConfirm').addEventListener('click', async function () {
  
          await fetch(url + "/chatrooms/" + group + "/" + localStorage.getItem("username"), {
            method: "POST",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          });
          let confirmationModal = new bootstrap.Modal(document.getElementById('confirmJoinGroup'), {});
          confirmationModal.hide();
          hideUsersUI();
          showChatroomUI();
          await GroupChat(group);
        });
      } else {
        hideUsersUI();
        showChatroomUI();
        await GroupChat(group);
        return;
      }
    } catch (e) {
  
    }
  }
  
  const GroupChat = async (group) => {
    GROUPCHAT = true;
    CHATROOM_USER = "";
    ANNOUNCEMENT = false;
    PRIVATE_CHAT_OPEN = false;
    setSearchGroup(group);
    document.getElementById("elect-form").style.display = "none";
    document.getElementById("wall").style.display = "flex";
  
    const chatroomTypeTitleElement = document.getElementById("chatroom-title");
    chatroomTypeTitleElement.innerHTML = group + " Group Counsel";
  
    const response = await getGroupMessages(group);
    const messageContainer = document.getElementById("messages");
  
    messageContainer.innerHTML = "";
    const specialists = await getSpecialists(group);
  
    const data = await response.json();
    if (!data.empty) {
      for (let msg of data.archive) {
        // if the msg.username is in the specialists list, then add the message
        if (specialists.indexOf(msg.username) !== -1) {
          IS_SPECIALIST = true;
        } else {
          IS_SPECIALIST = false;
        }
        addMessages(msg);
      }
    };
    messages.scrollTo(0, messages.scrollHeight);
    window.scrollTo(0, document.body.scrollHeight);
  }
  
  
  const createEditableMessage = (cardBody, msg) => {
    let modifyButton = document.createElement("button");
    modifyButton.textContent = "Modify";
    modifyButton.className = "btn btn-outline-primary btn-sm";
    modifyButton.setAttribute("data-bs-toggle", "modal");
    modifyButton.setAttribute("data-bs-target", "#editMessageModal");
    modifyButton.addEventListener("click", async () => {
      // Logic to modify message
      document.getElementById("messageEditInput").value = document.querySelector(`[data-message-id="${msg._id}"]`).querySelector(".card-text").textContent;
      document.getElementById("saveMessageChanges").onclick = async () => {
  
  
        let editMessageModal = new bootstrap.Modal(document.getElementById('editMessageModal'), {});
  
        editMessageModal.hide();
  
        try {
          await fetch(url + "/chatrooms/" + MESSAGE_RECEIVER + "/" + msg._id, {
            method: "PUT",
            body: JSON.stringify(
              {
                content: document.getElementById("messageEditInput").value,
                group: MESSAGE_RECEIVER
              }),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          });
  
        } catch (e) {
  
        };
  
      };
  
    });
  
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "btn btn-outline-danger btn-sm";
    deleteButton.setAttribute("data-bs-toggle", "modal");
    deleteButton.setAttribute("data-bs-target", "#deleteMessageModal");
    deleteButton.addEventListener("click", async () => {
      // Logic to delete message
      document.getElementById("deleteMessageChanges").onclick = async () => {
  
  
        try {
          await fetch(url + "/chatrooms/" + MESSAGE_RECEIVER + "/" + msg._id, {
            method: "DELETE",
            body: JSON.stringify({ group: MESSAGE_RECEIVER, messageId: msg._id }),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          });
        } catch (e) {
  
        };
        let deleteMessageModal = new bootstrap.Modal(document.getElementById('deleteMessageModal'), {});
        deleteMessageModal.hide();
  
      };
    })
  
    cardBody.appendChild(modifyButton);
    cardBody.appendChild(deleteButton);
  };
  
  // edit here
  const editMessages = (msg) => {
    //data-message-id
    const messageElement = document.querySelector(`[data-message-id="${msg._id}"]`);
    // edit card-text text
    const cardText = messageElement.querySelector(".card-text");
    cardText.textContent = msg.content;
    return;
  }
  
  const deleteMessages = (msgId) => {
    try {
      const messageElement = document.querySelector(`[data-message-id="${msgId}"]`);
      if (messageElement) {
        messageElement.remove();
      }
    } catch (error) {
      console.log("error when delete msg card",error);
    }
  }
  