const KEY = "mythMapperUser";

export function getStoredUser() {
  return localStorage.getItem(KEY);
}

export function storeUser(username) {
  localStorage.setItem(KEY, username);
}

export function clearStoredUser() {
  localStorage.removeItem(KEY);
}
