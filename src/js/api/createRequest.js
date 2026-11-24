import { API_URL } from "../config";

const createRequest = async ({ url, method = "GET", data } = {}) => {
  const options = { method };
  if (data !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }
  const response = await fetch(`${API_URL}${url}`, options);
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
};

export default createRequest;
