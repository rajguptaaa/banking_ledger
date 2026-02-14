
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Error connecting to email server:', error);
    } else {
        console.log("Email server is ready to send messages");
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log("Email sent: ", info.messageId);
        console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

async function sendRegisterEmail(userEmail, name) {
    const subject = "Welcome to Backend Ledger!";
    const text = `Hi ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering at Backend Ledger. We're excited to have you on board!</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, subject, message) {
    const emailSubject = `Transaction Alert: ${subject}`;
    const html = `<p>${message}</p>`;
    await sendEmail(userEmail, emailSubject, message, html);
}

module.exports = {
    sendRegisterEmail,
    sendTransactionEmail
}