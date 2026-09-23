const USERS_KEY = "sultan-city-users";
const SESSION_KEY = "sultan-city-session";

const defaultAdmin = {
  id: "default-admin",
  name: "مدير المدينة",
  email: "admin@city.om",
  password: "Admin@123",
  role: "admin",
};

function readUsers() {
  try {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY));
    return Array.isArray(storedUsers) && storedUsers.length ? storedUsers : [defaultAdmin];
  } catch {
    return [defaultAdmin];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function login(email, password) {
  const user = readUsers().find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase()
      && candidate.password === password,
  );

  if (!user) {
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

export function register({ name, email, password }) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { error: "هذا البريد الإلكتروني مسجل بالفعل" };
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "user",
  };
  users.push(newUser);
  saveUsers(users);
  return login(newUser.email, newUser.password);
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}