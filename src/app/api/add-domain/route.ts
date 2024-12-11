import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { domain, projectId } = await request.json()

    const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to add domain yoo')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error adding domain:', error)
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 })
  }
}