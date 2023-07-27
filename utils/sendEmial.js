const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASS,
      },
      tls: {
        rejectUnauthorized: false,
        secureProtocol: "TLSv1_2_method",
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: subject,
      text: text,
    });
    console.log(text,"ivde url nd");
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Failed to send email");
    console.log(error);
  }
};