import type { LoginRequest, RegisterRequest, User } from "../types/auth";

const USER_STORAGE_KEY = "voting-system-user";
const USERS_STORAGE_KEY = "voting-system-users";

const normalizeUser = (user: Partial<User> & { username: string; email?: string; role?: string; password?: string }): User => ({
  id: user.id ?? Date.now(),
  username: user.username,
  email: user.email ?? `${user.username}@example.com`,
  role: user.role === "ADMIN" ? "ADMIN" : "USER",
  password: user.password,
});

const readUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      return [
        normalizeUser({
          id: 1,
          username: "admin",
          email: "admin@example.com",
          role: "ADMIN",
          password: "admin123",
        }),
      ];
    }

    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
};

const writeUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const writeStoredUser = (user: User | null) => {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const authService = {
  async login(credentials: LoginRequest): Promise<User> {
    const users = readUsers();
    const matchedUser = users.find(
      (user) =>
        user.username.toLowerCase() === credentials.username.toLowerCase() &&
        user.password === credentials.password,
    );

    if (!matchedUser) {
      throw new Error("Invalid credentials. Try admin / admin123 or register a new account.");
    }

    const authenticatedUser = normalizeUser(matchedUser);
    writeStoredUser(authenticatedUser);
    return authenticatedUser;
  },

  async register(payload: RegisterRequest): Promise<User> {
    const users = readUsers();

    if (users.some((user) => user.username.toLowerCase() === payload.username.toLowerCase())) {
      throw new Error("That username is already taken.");
    }

    const user = normalizeUser({
      id: Date.now(),
      username: payload.username,
      email: payload.email,
      role: payload.username.toLowerCase() === "admin" ? "ADMIN" : "USER",
      password: payload.password,
    });

    users.push(user);
    writeUsers(users);
    writeStoredUser(user);
    return user;
  },

  getStoredUser: readStoredUser,
  setStoredUser: writeStoredUser,
  clearStoredUser: () => writeStoredUser(null),
};
