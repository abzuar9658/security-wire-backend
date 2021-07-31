const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  }));

  // 2) Define the email options
  // sendEmail({email:"gusama21@gmail.com",subject:"test",message:"test",})
  const mailOptions = {
      from: 'secwire101@gmail.com',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: "<p1>xam</p1>"
    };

  // 3) Send the email
  await transporter.sendMail(mailOptions,(err,info)=>{err ? console.log(err):console.log(info)});
  // await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
