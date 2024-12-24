import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { sendWelcomeEmail } from '@/lib/zeptomail';

// Get this from your Supabase dashboard
const WEBHOOK_SECRET =
  'v1,whsec_xWumkRuifO9/dr9B7dA81oNSnzalnyp2Nduzy13wiNFtQfoeYmRae2t3cLumqtOtL2JP/gUhBMlpla4c';

function verifySignature(body: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;

  const hmac = createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(body).digest('hex');
  const signatureHash = signature.split(',')[1]; // Format is "t=timestamp,v1=hash"

  return signatureHash === digest;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const authToken = request.headers.get('authorization');

    console.log('Headers:', {
      authToken,
      signature,
      contentType: request.headers.get('content-type'),
    });

    const payload = JSON.parse(body);
    console.log('Parsed payload:', payload);

    // Handle direct client request
    if (payload.user && payload.email_data) {
      const { user, email_data } = payload;
      if (email_data.email_action_type === 'signup') {
        const result = await sendWelcomeEmail(
          user.email,
          user.email.split('@')[0]
        );
        return NextResponse.json({ success: true });
      }
    }

    // Handle webhook request
    if (payload.event_message) {
      const authEvent = JSON.parse(payload.event_message).auth_event;
      if (authEvent && authEvent.action === 'user_confirmation_requested') {
        const email = authEvent.actor_username;
        const result = await sendWelcomeEmail(email, email.split('@')[0]);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json(
      { error: 'Unsupported event type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Hook error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process hook',
      },
      { status: 500 }
    );
  }
}
