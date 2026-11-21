/**
 * Lightweight reversible obfuscation utility to avoid casual plaintext display in browser storage.
 * @security NOT cryptographically secure. Never use this for passwords, secret keys, JWTs, or PII.
 */
export const obfuscate = (data: string): string => {
  try {
    const encoded = encodeURIComponent(data);
    let result = "";
    for (let i = 0; i < encoded.length; i++) {
      result += String.fromCharCode(encoded.charCodeAt(i) + 13); // Simple shift
    }
    return btoa(result);
  } catch {
    return "";
  }
};

/**
 * Deobfuscates data previously obfuscated with `obfuscate`.
 */
export const deobfuscate = (obfuscated: string): string => {
  try {
    const decoded = atob(obfuscated);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) - 13);
    }
    return decodeURIComponent(result);
  } catch {
    return "";
  }
};
