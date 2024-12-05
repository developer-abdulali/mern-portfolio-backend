import nodemailer from "nodemailer";

export const sendEmail = async (opt) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: opt.email,
    subject: opt.subject,
    text: opt.message,
  };
  await transporter.sendMail(mailOptions);
};
