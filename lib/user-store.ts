// Server-side User Store for managing registered accounts & passwords

export interface RegisteredUser {
  email: string;
  password: string; // Stored password for verification
  name: string;
  role: string;
  phone?: string;
  city?: string;
  createdAt: string;
}

// Global in-memory user registry across API requests
const globalForUsers = globalThis as unknown as {
  userStore?: Map<string, RegisteredUser>;
};

export const userStore = globalForUsers.userStore || new Map<string, RegisteredUser>();
if (process.env.NODE_ENV !== 'production') {
  globalForUsers.userStore = userStore;
}

/**
 * Check if a user account already exists by email
 */
export function isUserRegistered(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return userStore.has(normalizedEmail);
}

/**
 * Register a new user with password
 */
export function registerUser(user: RegisteredUser): RegisteredUser {
  const normalizedEmail = user.email.trim().toLowerCase();
  const newUser: RegisteredUser = {
    ...user,
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
  };
  userStore.set(normalizedEmail, newUser);
  return newUser;
}

/**
 * Get user details by email
 */
export function getUserByEmail(email: string): RegisteredUser | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  return userStore.get(normalizedEmail);
}

/**
 * Verify user password credentials
 */
export function verifyPasswordCredentials(email: string, password: string): { valid: boolean; user?: RegisteredUser; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const user = userStore.get(normalizedEmail);

  if (!user) {
    return { valid: false, error: 'No account found with this email address. Please create an account first.' };
  }

  if (user.password !== password) {
    return { valid: false, error: 'Incorrect password. Please try again.' };
  }

  return { valid: true, user };
}
