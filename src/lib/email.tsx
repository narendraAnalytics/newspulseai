import {
  Html,
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Resend } from 'resend'

export interface DigestItem {
  channelName: string
  title: string
  summary: string
  url: string
}

interface DigestEmailProps {
  name: string
  items: DigestItem[]
  date: string
}

export function DigestEmail({ name, items, date }: DigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Your NewsPulseAI digest for ${date} — ${items.length} new video${items.length !== 1 ? 's' : ''}`}</Preview>
      <Body style={{ backgroundColor: '#080c14', fontFamily: 'Arial, sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          {/* Header */}
          <Heading style={{ color: '#34d399', fontSize: '28px', fontWeight: '700', marginBottom: '4px', letterSpacing: '2px' }}>
            NEWSPULSEAI
          </Heading>
          <Text style={{ color: '#6b7280', fontSize: '13px', marginTop: '0', marginBottom: '32px', letterSpacing: '1px' }}>
            MORNING DIGEST · {date.toUpperCase()}
          </Text>

          <Text style={{ color: '#e5e7eb', fontSize: '15px', marginBottom: '32px' }}>
            Good morning, {name}. Here&apos;s what&apos;s new from your channels:
          </Text>

          <Hr style={{ borderColor: '#1f2937', marginBottom: '32px' }} />

          {/* Video items */}
          {items.map((item, i) => (
            <Section key={`item-${i}`} style={{ marginBottom: '32px' }}>
              <Text style={{ color: '#34d399', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                {item.channelName}
              </Text>
              <Heading as="h2" style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                {item.title}
              </Heading>
              <Text style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.7', margin: '0 0 14px 0' }}>
                {item.summary}
              </Text>
              <Link
                href={item.url}
                style={{ color: '#22d3ee', fontSize: '13px', fontWeight: '600', textDecoration: 'none', letterSpacing: '1px' }}
              >
                WATCH ON YOUTUBE →
              </Link>
              {i < items.length - 1 && (
                <Hr style={{ borderColor: '#1f2937', marginTop: '32px' }} />
              )}
            </Section>
          ))}

          <Hr style={{ borderColor: '#1f2937', margin: '32px 0' }} />

          <Text style={{ color: '#4b5563', fontSize: '12px', textAlign: 'center' }}>
            You&apos;re receiving this because you added channels to NewsPulseAI.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDigest(to: string, name: string, items: DigestItem[]): Promise<void> {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Your Morning News Digest – ${date}`,
    react: <DigestEmail name={name} items={items} date={date} />,
  })
}
