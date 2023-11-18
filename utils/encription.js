const CryptoJS = require("crypto-js");
const { SECRET_KEY } = process.env;
// Encrypt
const Encryption = (key_id) => {
    const ciphertext = CryptoJS.AES.encrypt(key_id, SECRET_KEY).toString();
    return ciphertext;
}


// Decrypt
const Decryption = (encryptData) => {
    const bytes = CryptoJS.AES.decrypt(encryptData, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
}

module.exports = {
    Encryption,
    Decryption
}
// Encryption();
// Decryption()


