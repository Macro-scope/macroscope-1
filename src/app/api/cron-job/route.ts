import { NextResponse } from 'next/server';
import { sendEndingReminders } from '@/lib/subscription-reminders';

export async function GET(req: Request) {
  try {
    // Verify that this is a legitimate cron job request
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await sendEndingReminders();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process subscription reminders:', error);
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}