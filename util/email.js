const nodemailer = require("nodemailer");
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
});
module.exports.sendMail = (recipient, subject, content) => {
  var mailOptions = {
    from: "pandore.online@gmail.com",
    to: recipient,
    subject: subject,
    html: content,
  };
  emailTransporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
