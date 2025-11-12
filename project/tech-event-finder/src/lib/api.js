// src/lib/api.js

export const AuthAPI = {
  async register({ name, email, password }) {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find((u) => u.email === email)) {
      throw new Error("User already exists");
    }

    const user = {
      id: Date.now().toString(),
      name,
      email,
      password, // ❌ never store plain password in real apps, ok for mock
      bio: "",
      interests: [],
    };

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("me", JSON.stringify(user));
    localStorage.setItem("token", "mock-token-" + user.id);

    return user;
  },

  async login({ email, password }) {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) throw new Error("Invalid credentials");

    localStorage.setItem("me", JSON.stringify(user));
    localStorage.setItem("token", "mock-token-" + user.id);

    return user;
  },

  async me() {
    return JSON.parse(localStorage.getItem("me") || "null");
  },

  async updateProfile(patch) {
    let user = JSON.parse(localStorage.getItem("me") || "null");
    if (!user) throw new Error("Not authenticated");

    user = { ...user, ...patch };

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const idx = users.findIndex((u) => u.email === user.email);
    users[idx] = user;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("me", JSON.stringify(user));

    return user;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
  },
};
