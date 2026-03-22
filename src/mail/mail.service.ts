import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendContactMessage(
    name: string,
    fromEmail: string,
    message: string,
  ): Promise<void> {
    const to = process.env.CONTACT_EMAIL;
    if (!to) throw new Error('CONTACT_EMAIL environment variable is not set');

    await this.mailerService.sendMail({
      to,
      subject: `[WealthWise] Mensaje de ${name}`,
      text: `De: ${name} <${fromEmail}>\n\n${message}`,
      replyTo: fromEmail,
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Restablecer contraseña — WealthWise',
      template: 'password-reset',
      context: {
        resetUrl,
        expiresInMinutes: 60,
      },
    });
  }
}
