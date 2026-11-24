import ChatAPI from "./api/ChatAPI";
import { WS_URL } from "./config";
import { escapeHtml, formatDate } from "./utils";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
    this.user = null;
  }

  init() {
    this.bindToDOM();
    this.registerEvents();
  }

  bindToDOM() {
    this.container.innerHTML = `
      <div class="modal-overlay">
        <form class="modal" novalidate>
          <h2 class="modal-title">Выберите псевдоним</h2>
          <input class="modal-input" name="nickname" autocomplete="off" />
          <div class="modal-error hidden"></div>
          <button type="submit" class="modal-button">Продолжить</button>
        </form>
      </div>
      <div class="chat hidden">
        <ul class="chat-users"></ul>
        <div class="chat-main">
          <div class="chat-messages"></div>
          <form class="chat-form">
            <input class="chat-input" name="message" placeholder="Type your message here" autocomplete="off" />
          </form>
        </div>
      </div>
    `;
    this.modal = this.container.querySelector(".modal-overlay");
    this.modalForm = this.container.querySelector(".modal");
    this.modalError = this.container.querySelector(".modal-error");
    this.chat = this.container.querySelector(".chat");
    this.usersList = this.container.querySelector(".chat-users");
    this.messages = this.container.querySelector(".chat-messages");
    this.messageForm = this.container.querySelector(".chat-form");
    this.modalForm.elements.nickname.focus();
  }

  registerEvents() {
    this.modalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.onEnterChatHandler();
    });
    this.messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.sendMessage();
    });
    window.addEventListener("beforeunload", () => this.exit());
  }

  showError(text) {
    this.modalError.textContent = text;
    this.modalError.classList.remove("hidden");
  }

  async onEnterChatHandler() {
    const name = this.modalForm.elements.nickname.value.trim();
    if (!name) {
      this.showError("Введите псевдоним");
      return;
    }
    try {
      this.user = await this.api.register(name);
    } catch (e) {
      this.showError(
        e.message === "This name is already taken!"
          ? "Этот псевдоним уже занят, выберите другой"
          : `Ошибка: ${e.message}`,
      );
      return;
    }
    this.modal.remove();
    this.chat.classList.remove("hidden");
    this.subscribeOnEvents();
    this.messageForm.elements.message.focus();
  }

  subscribeOnEvents() {
    this.websocket = new WebSocket(WS_URL);
    this.websocket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (Array.isArray(data)) {
        this.renderUsers(data);
      } else if (data.type === "send") {
        this.renderMessage(data);
      }
    });
  }

  sendMessage() {
    const input = this.messageForm.elements.message;
    const message = input.value.trim();
    if (!message || !this.websocket) {
      return;
    }
    this.websocket.send(
      JSON.stringify({
        type: "send",
        message,
        user: this.user,
        created: Date.now(),
      }),
    );
    input.value = "";
  }

  exit() {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type: "exit", user: this.user }));
    }
  }

  renderUsers(users) {
    this.usersList.innerHTML = users
      .map((user) => {
        const isMe = user.id === this.user.id;
        return `
          <li class="chat-user${isMe ? " me" : ""}">
            <span class="chat-avatar"></span>
            <span class="chat-user-name">${isMe ? "You" : escapeHtml(user.name)}</span>
          </li>
        `;
      })
      .join("");
  }

  renderMessage({ message, user, created }) {
    const isMe = user.id === this.user.id;
    const element = document.createElement("div");
    element.className = `message${isMe ? " me" : ""}`;
    element.innerHTML = `
      <div class="message-header">${isMe ? "You" : escapeHtml(user.name)}, ${formatDate(created || Date.now())}</div>
      <div class="message-text">${escapeHtml(message)}</div>
    `;
    this.messages.append(element);
    this.messages.scrollTop = this.messages.scrollHeight;
  }
}
