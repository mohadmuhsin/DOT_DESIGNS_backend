const nodemailer = require("nodemailer");

const { verifyEmail } = require("../../templates/emailVerify");
require("dotenv").config();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASS,
    },
});

async function sendVerifyEmailAsLink(to, url) {
    try {
        const mailOptions = {
            from: "Dot Designs",
            to,
            subject: "Email verification",
            html: verifyEmail(url),
            replyTo: "muhsinmfz@gmail.com",
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
        return { status: true, verif_id: mobile };
    } catch (error) {
        console.error("Error sending email:", error);
        return { status: false, verif_id: null };
    }
}



module.exports = {
    sendVerifyEmailAsLink,
};
