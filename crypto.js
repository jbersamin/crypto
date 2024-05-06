// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert hexadecimal string to ArrayBuffer
function hexStringToArrayBuffer(hexString) {
  const buffer = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    buffer[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return buffer.buffer;
}

// Generate encryption key from secret key
async function generateEncryptionKey(secretKeyHex) {
  // Convert secret key from hexadecimal string to ArrayBuffer
  const secretKey = hexStringToArrayBuffer(secretKeyHex);

  // Generate encryption key
  const encryptionKey = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  return encryptionKey;
}

// Generate decryption key from secret key
async function generateDecryptionKey(secretKeyHex) {
  // Convert secret key from hexadecimal string to ArrayBuffer
  const secretKey = hexStringToArrayBuffer(secretKeyHex);

  // Generate decryption key
  const decryptionKey = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  return decryptionKey;
}

// Encrypt function
async function encryptData(data, key, secretKey) {
  const encodedData = new TextEncoder().encode(data);

  // Generate a random IV
  //const iv = crypto.getRandomValues(new Uint8Array(16));
  const iv = new TextEncoder().encode(secretKey);

  // Encrypt the data
  const algorithm = {
    name: "AES-GCM",
    iv: iv,
  };
  const encryptedData = await crypto.subtle.encrypt(
    algorithm,
    key,
    encodedData
  );

  // Return the IV and encrypted data as base64 strings
  return {
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encryptedData),
  };
}

// Decrypt function
async function decryptData(encryptedData, key) {
  const algorithm = {
    name: "AES-GCM",
    iv: base64ToArrayBuffer(encryptedData.iv),
  };

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    algorithm,
    key,
    base64ToArrayBuffer(encryptedData.data)
  );

  // Convert the ArrayBuffer to string
  return new TextDecoder().decode(decryptedData);
}

// Decrypt function
async function decryptData(encryptedData, decryptionKey) {
  const algorithm = {
    name: "AES-GCM",
    iv: base64ToArrayBuffer(encryptedData.iv),
  };

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    algorithm,
    decryptionKey,
    base64ToArrayBuffer(encryptedData.data)
  );

  // Convert the ArrayBuffer to string
  return new TextDecoder().decode(decryptedData);
}

// Example usage
async function generateKey(data, secretKey, encrpytionKeyHex) {
  // Generate a random encryption key
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const encryptionKey = await generateEncryptionKey(encrpytionKeyHex);
  const encryptedData = await encryptData(data, encryptionKey, secretKey);

  return encryptedData;
}

async function generateDecrypt(data, iv, encrpytionKeyHex) {
  const encryptionKey = await generateDecryptionKey(encrpytionKeyHex);
  let encryptedData = {
    data,
    iv,
  };
  const decryptedData = await decryptData(encryptedData, encryptionKey);

  return decryptedData;
}
