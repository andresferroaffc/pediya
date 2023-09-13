import * as nodemailer from 'nodemailer';
require('dotenv').config();
// credenciales para el envio de correos
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SEND_CORREOS, // generated ethereal user
    pass: process.env.PASS_CORREOS, // generated ethereal password
  },
});
