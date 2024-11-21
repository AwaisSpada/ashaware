const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  // "SG.rJsMQe_uSiy3qpIRzJAFuw.lz8Blw3tTIoHrqdoYKdlltgDOUVZ6LRy4EQS-SSE"
  // process.env.SENDGRID_API_KEY
  "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" //shahzad bhai
);

function emailSender(to, from, subject, html) {
  const msg = {
    to: to,
    from: from,
    subject: subject,
    html: html,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
      return;
    })
    .catch((error) => {
      console.log(
        "🚀 ~ file: emailSender.js ~ line 48 ~ emailSender ~ error",
        error
      );
      return error;
    });
  return;
}
module.exports = {
  emailSender,
};
