import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.APP_EMAIL_ADDRES,
    pass: process.env.APP_EMAIL_PASSWORD,
  },
});
/*
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_USERNAME, //Sender
    pass: process.env.MAIL_PASSWORD,
  },
});
*/
export default transporter;
