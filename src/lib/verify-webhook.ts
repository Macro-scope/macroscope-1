import crypto from 'crypto';

export function verifyWebhookSignature(signature: string | null, payload: any): boolean {
  if (!signature) return false;
  
  const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set');
    return false;
  }

  try {
    // Get the raw payload as a string
    const payloadString = JSON.stringify(payload);
    
    // Create HMAC with the secret
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    
    // Update with raw payload
    hmac.update(payloadString);
    
    // Get the calculated signature
    const calculatedSignature = hmac.digest('hex');
    
    // Simple string comparison (Lemon Squeezy uses hex format)
    return signature === calculatedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}