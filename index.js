const socket = io();

const form = document.querySelector("form"),
  message = document.querySelector("#messageInput"),
  submitButton = document.querySelector("#submitButton"),
  messages = document.querySelector("#messages");

const scrollToBottom = () => {
  const chatContainer = $("#chat-container");
  chatContainer.scrollTop(chatContainer[0].scrollHeight);
};

const username = prompt("Please enter your username");
if (username === "" || username === null) {
  alert("Username can't be null");
  window.location.reload();
}
socket.emit("join", username);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (message.value.trim() === "" || !message.value) {
    $("#submitButton")
      .popover({
        content: "You have to write something to send the message",
        html: true,
        placement: "top",
      })
      .popover("show");
    setTimeout(() => {
      $("#submitButton").popover("hide");
      $("#submitButton").popover("dispose");
    }, 3000);
  } else {
    $("#submitButton").popover("dispose");
    socket.emit("chat message", message.value);
    message.value = "";
  }
});

function createMessage(user, message, hour, minute) {
  const isAuthor = socket.id === user.socketId;
  const random = Math.floor(Math.random() * (7 - 1) + 1);
  let usernameColor;
  minute = +minute < 10 ? "0" + minute : minute;

  switch (random) {
    case 1:
      usernameColor = "#FF0000";
      break;
    case 2:
      usernameColor = "#0000FF";
      break;
    case 3:
      usernameColor = "#800080";
      break;
    case 4:
      usernameColor = "#FFA500";
      break;
    case 5:
      usernameColor = "#FFC0CB";
      break;
    case 6:
      usernameColor = "#FFFF00";
      break;
    case 7:
      usernameColor = "#00FFFF";
      break;
    default:
      usernameColor = "#000000";
  }
  return !isAuthor
    ? /*html*/ `
        <li class="d-flex justify-content-start w-100">
          <div class="flex-column received" id="message">
          <div class="d-flex w-100 align-items-center justify-content-between">
            <h5 style="color: ${usernameColor}">
              ${user.username}
            </h5>
            <small>${hour}:${minute}</small>
            </div>
            <div class="text-message">
              ${message}
            </div>
          </div>
        </li>
        `
    : /*html*/ `<li class="d-flex justify-content-end w-100">
    <div class="flex-column sent" id="message">
    <div class="d-flex w-100 justify-content-between">
    <div class="text-message">
        ${message}
      </div>
      <small>${hour}:${minute}</small>
      </div>
      
    </div>
  </li>`;
}
socket.on("chat message", function (data) {
  const { user, message, hour, minute } = data;
  $("#messages").append(createMessage(user, message, hour, minute));
  scrollToBottom();
});

function createCard(username, time) {
  return /*html*/ `
  <a href="#" class="list-group-item list-group-item-action py-3 lh-sm">
      <div class="d-flex w-100 align-items-center justify-content-between">
        <strong class="mb-1">${username}</strong>
        <small class="text-body-secondary">${time}</small>
      </div>
    </a>
  `;
}
socket.on("update users", function (users) {
  $("#user-list").empty();
  users.forEach((u) => {
    $("#user-list").append($(createCard(u.username, u.time)));
  });
});

socket.on("user joined", function (user) {
  $(
    "#messages"
  ).append(/*html*/ `<li class="d-flex justify-content-center w-100 system-message">
 ${user.username} joined the chat
</li>`);
  scrollToBottom();
});

socket.on("user left", function (user) {
  $(
    "#messages"
  ).append(/*html*/ `<li class="d-flex justify-content-center w-100 system-message">
 ${user.username} left the chat
</li>`);
  scrollToBottom();
});

$("#input").focus();

scrollToBottom();
