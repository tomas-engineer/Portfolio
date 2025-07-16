import nodemailer from 'nodemailer';
import 'dotenv/config';

const hostEmail = process.env.HOSTEMAIL;
const emailPassword = process.env.EMAILPASSWORD;

async function sendMail(name, email, message) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: hostEmail,
            pass: emailPassword,
        },
    });

    const options = {
        from: email,
        to: hostEmail,
        subject: "New Contact Form Submission",
        html: `
              <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #ffffff; color: #000;">
                <h2 style="border-bottom: 2px solid #000; padding-bottom: 10px;">New Contact Form Submission</h2>
                <p style="font-size: 16px; line-height: 1.6;">You have received a new message from your website contact form:</p>
          
                <table style="width: 100%; max-width: 600px; margin: 20px 0; border-collapse: collapse;">
                  <tr>
                    <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd;">Name:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd;">Email:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd;">Message:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
                  </tr>
                </table>
              </div>
            `
    }

    try {
        await transporter.sendMail(options);
        return { success: true, message: "Uw e-mail is met success verzonden!" };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: "Er ging iets fout bij verzenden van uw e-mail" };
    }
};

export { sendMail };