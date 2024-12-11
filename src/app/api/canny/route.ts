import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const CANNY_PRIVATE_KEY = process.env.CANNY_PRIVATE_KEY!; 

export async function POST(req: Request) {
  try {
    const { user } = await req.json();
    
    const userData = {
    //   avatarURL: user.avatarURL,
      email: user.email,
      id: user.id,
      name: user.name,
    };

    const ssoToken = jwt.sign(userData, CANNY_PRIVATE_KEY, { algorithm: 'HS256' });
    
    return NextResponse.json({ ssoToken });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate SSO token' }, { status: 500 });
  }
}