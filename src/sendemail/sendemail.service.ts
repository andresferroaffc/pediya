/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { transporter } from '../config/mailer';

@Injectable()
export class SendemailService {
  // metodo enviar correos
  async sendemail(asunto: string, email, html, files?) {
    return transporter.sendMail({
      from: '"Pedi Ya" <pruebacorreosactivacion@gmail.com>', // sender address
      to: email, // list of receivers
      subject: asunto, // Subject line
      text: '', // plain text body
      html: html,
      attachments: files,
    });
  }
}
