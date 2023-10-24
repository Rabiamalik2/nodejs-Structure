const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  console.log("Received token:", token);
  const cleanedToken = token.replace(/^Bearer\s+/, "");
  console.log("Cleaned token:", cleanedToken);
  return new Promise((resolve, reject) => {
    jwt.verify(cleanedToken, "secretkey",  (err, decoded) => {
      if (err) {
        console.error("JWT Verify Error:", err);
        reject(err);
      } else {
        console.log("Decoded Token:", decoded);
        resolve(decoded);
      }
    });
  });
};

module.exports = { verifyToken };
