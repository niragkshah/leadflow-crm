import { NextResponse } from 'next/server'

// Fallback template when no API key is set
function templateEmail({ name, company, status, notes }) {
  const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Hi there,'
  const companyLine = company ? ` at ${company}` : ''

  return `${greeting}

I wanted to reach out personally — I've been following what you're building${companyLine} and think there might be a great fit with what we offer.

We work with companies like yours to [VALUE PROP HERE]. Based on what I know about your business, I believe we could help you [SPECIFIC OUTCOME].

I'd love to set up a quick 15-minute call this week to explore if this makes sense. Are you available [DAY] or [DAY]?

Looking forward to connecting.

Best,
[YOUR NAME]
[YOUR TITLE]
[YOUR COMPANY]`
}

export async function POST(request) {
  const body = await request.json()
  const { name, company, status, notes, score } = body

  // If no API key, return the template
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ email: templateEmail({ name, company, status, notes }) })
  }

  try {
    const prompt = `You are a skilled B2B sales professional writing a short, personalised outreach email.

Lead details:
- Name: ${name || 'Unknown'}
- Company: ${company || 'Unknown'}
- Current status: ${status}
- Lead score: ${score}/100
- Notes: ${notes || 'None'}

Write a concise, personalized cold/warm outreach email (3-4 short paragraphs). 
- Friendly but professional tone
- Clear value proposition placeholder like [YOUR VALUE PROP]
- Soft call to action (15-min call)
- Do not use exclamation marks excessively
- Keep it under 150 words
- Use placeholders like [YOUR NAME] and [YOUR COMPANY] where needed

Return only the email text, no subject line, no preamble.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const email = data.content?.[0]?.text || templateEmail({ name, company, status, notes })

    return NextResponse.json({ email })
  } catch {
    // Fall back to template on any error
    return NextResponse.json({ email: templateEmail({ name, company, status, notes }) })
  }
}
