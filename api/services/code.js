const crypto = require("crypto");

const generateResetCode = () => {
  return crypto.randomBytes(3).toString("hex");
};
module.exports = { generateResetCode };