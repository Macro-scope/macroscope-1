import { sendWelcomeEmail, sendZeptoMail } from '@/lib/zeptomail';

export async function GET() {
  try {
    // await sendZeptoMail({
    //   template: 'WELCOME_USER',
    //   email: 'aditya97y@gmail.com',
    //   data: {
    //     name: 'Aditya',
    //     product_name: 'Macroscope Pro',
    //     customer_portal_url: 'https://macroscope.so/account',
    //     // You can add any additional merge fields that your template uses
    //   }
    // });

    // await sendWelcomeEmail('aditya97y@gmail.com', 'Aditya');

    return Response.json({ message: 'Email sent successfully!' });
  } catch (error) {
    return Response.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}