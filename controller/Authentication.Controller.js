const db = require("../db");
const { sendMail } = require("../util/email");
const {
  sendResponse,
  sendPinTemplate,
  emailVerificationSuccessfulTemplate,
} = require("../util/helper");
module.exports.generatePinCode = (req, res) => {
  const { user_email } = req.body;
  var randomPin = Math.floor(Math.random() * (999999 - 0 + 1)) + 0;
  var sql = `
    UPDATE user
    SET pin = ${randomPin}
    WHERE user_email = "${user_email}"
  `;
  db.query(sql, function (err, result) {
    sendResponse(res, err, result);
    var htmlBody = sendPinTemplate(randomPin);
    sendMail(user_email, "[SKA Buy] Email verification", htmlBody);
  });
};

module.exports.verifyEmail = (req, res) => {
  const { user_email, pin } = req.body;
  var sql = `
    UPDATE user
    SET status = 0
    WHERE user_email = "${user_email}" AND pin = "${pin}"
  `;
  db.query(sql, function (err, result) {
    sendResponse(res, err, result);
    if (result.affectedRows != 0) {
      var htmlBody = emailVerificationSuccessfulTemplate();
      sendMail(
        user_email,
        "[SKA Buy] Email verification successful",
        htmlBody
      );
    }
  });
};
