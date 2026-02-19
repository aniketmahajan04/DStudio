import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = "aes-256-gcm";

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes");
}

export interface EncryptedData {
  encryptedUrl: string;
  iv: string;
}

function encryptConnectionUrl(url: string): EncryptedData {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, "hex");

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(url, "utf-8", "hex");

  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();
  const encryptedUrl = encrypted + ":" + authTag.toString("hex");
  return {
    encryptedUrl,
    iv: iv.toString("hex"),
  };
}

function decryptConnectionUrl(encryptedUrl: string, iv: string): string {
  const [encrypted, authTagHex] = encryptedUrl.split(":");
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

export { encryptConnectionUrl, decryptConnectionUrl };
