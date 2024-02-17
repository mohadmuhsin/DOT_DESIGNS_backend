const nodemailer = require("nodemailer");
require("dotenv").config();
const { verifyEmail } = require("../templates/emailVerify");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.PASS,
  },
});
const sendEmail = async (to, url) => {
  try {
    // const transporter = nodemailer.createTransport({
    //   host: process.env.HOST,
    //   service: process.env.SERVICE,
    //   port: Number(process.env.EMAIL_PORT),
    //   secure: true,
    //   requireTLS: true,
    //   auth: {
    //     user: process.env.EMAIL_SENDER,
    //     pass: process.env.PASS,
    //   },
    //   tls: {
    //     rejectUnauthorized: false,
    //     secureProtocol: "TLSv1_2_method",
    //   },
    // });

    const mailOptions = {
      from: "Dot Designs",
      to,
      subject: "Email verification",
      html: verifyEmail(url),
      replyTo: "muhsinmfz@gmail.com",
    };
    const info = await transporter.sendMail(mailOptions);

    // await transporter.sendMail({
    //   from: process.env.EMAIL_SENDER,
    //   to: email,
    //   subject: subject,
    //   text: text,
    // });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Failed to send email");
    console.log(error);
  }
}

module.exports = {
  sendEmail
}