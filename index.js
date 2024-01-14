const socket = io();

const form = document.querySelector("form"),
  message = document.querySelector("#messageInput"),
  submitButton = document.querySelector("#submitButton");

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

function createMessage(user, message) {
  const isAuthor = socket.id === user.socketId;
  const flex = isAuthor ? "justify-content-end" : "justify-content-start";
  const color = isAuthor ? "sent" : "received";
  return /*html*/ `
        <li class="d-flex ${flex} w-100">
          <div class="flex-column ${color}" id="message">
            <h5>
              ${user.username}
            </h5>
              ${message}
          </div>
        </li>
        `;
}
socket.on("chat message", function (data) {
  const { user, msg } = data;
  $("#messages").append(createMessage(user, msg));
  scrollToBottom();
});

function createCard(username, userid, time) {
  return `
  <a href="#" class="list-group-item list-group-item-action py-3 lh-sm">
      <div class="d-flex w-100 align-items-center justify-content-between">
        <strong class="mb-1">${username}</strong>
        <small class="text-body-secondary">${time}</small>
      </div>
      <div class="col-10 mb-1 small">${userid}</div>
    </a>
  `;
}
socket.on("update users", function (users) {
  $("#user-list").empty();
  users.forEach((u) => {
    $("#user-list").append($(createCard(u.username, u.socketId, u.time)));
  });
});

socket.on("user joined", function (user) {
  $("#messages").append(
    $('<li class="system-message">').text(`${user.username} joined the chat`)
  );
  scrollToBottom();
});

socket.on("user left", function (user) {
  $("#messages").append(
    $('<li class="system-message">').text(`${user.username} left the chat`)
  );
  scrollToBottom();
});

$("#input").focus();

scrollToBottom();
