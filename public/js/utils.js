import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

export function getFilename(metaUrl) {
  const __filename = fileURLToPath(metaUrl);

  return __filename;
}

export function getDirname(metaUrl) {
  const __dirname = path.dirname(getFilename(metaUrl));

  return __dirname;
}
export function generateFileName(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}
