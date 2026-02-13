import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = "aes-256-gcm";

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes");
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

function encrypt(text: string): EncryptedData {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, "hex");

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf-8", "hex");

  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

function decrypt(encrypted: string, iv: string, authTag: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypt = decipher.update(encrypted, "hex", "utf-8");
  decrypt += decipher.final("utf-8");

  return decrypt;
}

function encryptConnectionData(data: any): EncryptedData {
  const jsonString = JSON.stringify(data);
  return encrypt(jsonString);
}

function decryptConnectionData(
  encrypted: string,
  iv: string,
  authTag: string,
): any {
  const jsonString = decrypt(encrypted, iv, authTag);
  return JSON.parse(jsonString);
}

export { encrypt, decrypt, encryptConnectionData, decryptConnectionData };
