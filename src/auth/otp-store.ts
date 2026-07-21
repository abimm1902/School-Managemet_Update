
export interface PendingAdmin {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  otp: number;
  expiresAt: number; // epoch ms
}

const pendingSignups = new Map<string, PendingAdmin>();

export function savePendingAdmin(key: string, data: PendingAdmin): void {
  pendingSignups.set(key, data);
}

export function getPendingAdmin(key: string): PendingAdmin | undefined {
  return pendingSignups.get(key);
}

export function deletePendingAdmin(key: string): void {
  pendingSignups.delete(key);
}

export function generateRandomPassword(length = 10): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";

  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

