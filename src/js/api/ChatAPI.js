import createRequest from "./createRequest";

export default class ChatAPI {
  async register(name) {
    const { ok, body } = await createRequest({
      url: "/new-user",
      method: "POST",
      data: { name },
    });
    if (!ok || body.status !== "ok") {
      throw new Error(body.message || "Не удалось зарегистрироваться");
    }
    return body.user;
  }
}
