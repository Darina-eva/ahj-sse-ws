![CI](https://github.com/Darina-eva/ahj-sse-ws/actions/workflows/web.yml/badge.svg)

# Чат на WebSocket

Клиентская часть чата к готовому серверу. При входе запрашивается псевдоним (регистрация через `POST /new-user`, если псевдоним занят — выводится сообщение и можно выбрать другой). Дальше открывается окно чата: слева список пользователей онлайн (свой отмечен как `You`), справа сообщения — чужие слева, свои справа. Сообщения и список пользователей приходят через WebSocket, при закрытии вкладки пользователь удаляется из списка.

[GitHub Pages](https://darina-eva.github.io/ahj-sse-ws/)

## Сервер

Сервер развёрнут на Render: https://ahj-sse-ws-uypt.onrender.com (регистрация `POST /new-user`, WebSocket `wss://ahj-sse-ws-uypt.onrender.com`). Адреса задаются в `src/js/config.js`.

Локальный запуск:

```bash
cd backend
npm install
npm start
```
