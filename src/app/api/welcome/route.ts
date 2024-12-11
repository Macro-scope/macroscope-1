import { sendWelcomeEmail, sendZeptoMail } from '@/lib/zeptomail';
import { NextResponse } from 'next/server';

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-webhook-signature',
    },
  });
}


export async function POST(request: Request) {

 try {
  const {email, name} = await request.json();
  if(!email || !name) {
    return NextResponse.json({error: 'Email and name are required'}, {status: 400});
  }
  const result = await sendWelcomeEmail(email, name);
  return NextResponse.json({message: 'Email sent successfully!', result});
 } catch (error) {
  console.error('Failed to send welcome email:', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Failed to send email' },
    { status: 500 }
  );
 }

 
 
}
//   try {
//     // Get the raw request body and webhook signature
//     const body = await request.text();
//     const signature = request.headers.get('x-webhook-signature');

//     // Verify webhook signature here if needed
//     // ... signature verification code ...
// console.log(body)
// console.log(signature)
//     // Parse the webhook payload
//     const payload = JSON.parse(body);
//     const { record } = payload;
    
//     // Extract email and name from the record
//     const email = record.email;
//     const name = record.name;
    
//     console.log('Attempting to send welcome email to:', email, name);
    
//     if (!email || !name) {
//       return NextResponse.json(
//         { error: 'Email and name are required' },
//         { status: 400 }
//       );
//     }

//     const result = await sendWelcomeEmail(email, name);
//     console.log('Welcome email sent successfully:', result);

//     return NextResponse.json({ message: 'Email sent successfully!', result });
//   } catch (error) {
//     console.error('Failed to send welcome email:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Failed to send email' },
//       { status: 500 }
//     );
//   }
// }



// export async function POST(request: Request) {
//   try {
//     const body = await request.text();
//     console.log('Received webhook payload:', body);
    
//     const payload = JSON.parse(body);
//     console.log('Parsed payload:', payload);

//     // The payload structure for email hooks is different
//     // It will contain information about the email to be sent
//     const { email, template, data } = payload;
    
//     if (template === 'signup') {
//       const result = await sendWelcomeEmail(email, data.user.name);
//       return NextResponse.json({ success: true });
//     }

//     return NextResponse.json({ error: 'Unsupported template' }, { status: 400 });
//   } catch (error) {
//     console.error('Hook error:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Failed to process hook' },
//       { status: 500 }
//     );
//   }
// }