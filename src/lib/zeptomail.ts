const ZEPTO_TOKEN = "Zoho-enczapikey wSsVR61/80KjCKd8m2GlJeg+m1lQUlnyFk97ilepv3P5H6yWoMc8nkbHAFWmGflOETZsEzIR8O5/kB5R0Dtc3N95wgsBWSiF9mqRe1U4J3x17qnvhDzNVm5blhKOKIgAwQ9pmmVkG80i+g==";
const ZEPTO_API_URL = 'https://api.zeptomail.com/v1.1/email/template';

interface SendMailProps {
  template: string;
  email: string;
  data: Record<string, any>;
}

const templateIds = {
  WELCOME_USER: '2d6f.4a8a4590f834ce96.k1.c8d58400-b40f-11ef-b669-525400fa05f6.1939da32840',
  SUBSCRIPTION_CREATED: '2d6f.4a8a4590f834ce96.k1.834a2ce0-ad9a-11ef-8f39-52540072c426.193735046ae',
  SUBSCRIPTION_CANCELLED: 'template.id.subscription.cancelled',
  SUBSCRIPTION_EXPIRED: 'template.id.subscription.expired',
  PAYMENT_SUCCESS: '2d6f.4a8a4590f834ce96.k1.8fd0d250-ad79-11ef-b770-525400336d52.193727853f5',
  TRIAL_ENDED: 'template.id.trial.ended',
  SUBSCRIPTION_ENDED: 'template.id.subscription.ended',
  PAYMENT_FAILED: 'template.id.payment.failed',
  SUBSCRIPTION_RESUMED: 'template.id.subscription.resumed',
  SUBSCRIPTION_PAUSED: 'template.id.subscription.paused'
} as const;

export async function sendZeptoMail({ template, email, data }: SendMailProps) {
  try {
    const templateId = templateIds[template as keyof typeof templateIds];
    if (!templateId) {
      throw new Error(`Invalid template: ${template}`);
    }

    const response = await fetch(ZEPTO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ZEPTO_TOKEN,
      },
      body: JSON.stringify({
        template_key: templateId,
        from: {
          address: 'Cebe@macroscope.so',
          name: 'Cebe'
        },
        to: [{
          email_address: {
            address: email,
          }
        }],
        merge_info: data
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to send email: ${response.status} ${response.statusText}` +
        (errorData ? `\nDetails: ${JSON.stringify(errorData)}` : '')
      );
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  console.log('Sending welcome email to:', email, name);
  try {
    const result = await sendZeptoMail({
      template: 'WELCOME_USER',
      email,
      data: {
        name,
      }
    });
    console.log('Welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    throw error;
  }
}