import {
  Html,
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
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
  plan: 'free' | 'plus' | 'pro'
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://newspulseai.vercel.app'

export function DigestEmail({ name, items, date, plan }: DigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`☀️ Your morning digest is ready — ${items.length} new video${items.length !== 1 ? 's' : ''} from your channels`}</Preview>
      <Body style={body}>
        {/* ── Header ── */}
        <Section style={header}>
          <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 32px' }}>
            <Row>
              <Column>
                <Img
                  src={`${APP_URL}/logo.png`}
                  alt="NewsPulseAI"
                  height="36"
                  style={{ display: 'block' }}
                />
              </Column>
              <Column align="right">
                <Text style={headerDate}>{date}</Text>
              </Column>
            </Row>
          </Container>
        </Section>

        {/* ── Hero banner ── */}
        <Section style={heroBanner}>
          <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '36px 32px 28px' }}>
            <Text style={heroEyebrow}>MORNING DIGEST</Text>
            <Heading style={heroHeading}>Good morning, {name}! ☀️</Heading>
            <Text style={heroSub}>
              Here&apos;s your personalised roundup of what&apos;s new from the YouTube channels you follow.
            </Text>
          </Container>
        </Section>

        {/* ── Content ── */}
        <Container style={content}>
          <Text style={sectionLabel}>
            {items.length} NEW VIDEO{items.length !== 1 ? 'S' : ''} TODAY
          </Text>

          {items.map((item, i) => (
            <Section key={`item-${i}`} style={card}>
              {/* Channel badge */}
              <Text style={channelBadge}>{item.channelName}</Text>

              {/* Title */}
              <Heading as="h2" style={videoTitle}>
                {item.title}
              </Heading>

              {/* Summary */}
              <Text style={summary}>{item.summary}</Text>

              {/* CTA */}
              <Link href={item.url} style={watchButton}>
                ▶&nbsp; Watch on YouTube
              </Link>
            </Section>
          ))}

          <Hr style={divider} />

          {/* ── Upgrade CTA (free plan only) ── */}
          {plan === 'free' && (
            <Section style={upgradeCta}>
              <Text style={upgradeHeading}>✦ Want daily digests for more channels?</Text>
              <Text style={upgradeBody}>
                You&apos;re on the <strong>Free plan</strong> — 2 channels, 1 daily email.
                Upgrade to <strong>Plus</strong> for 10 channels or <strong>Pro</strong> for
                unlimited channels and deeper AI summaries.
              </Text>
              <Link href={`${APP_URL}/pricing`} style={upgradeButton}>
                View Plans &amp; Upgrade →
              </Link>
            </Section>
          )}

          {/* ── Footer ── */}
          <Section style={{ padding: '8px 0 24px' }}>
            <Img
              src={`${APP_URL}/logo.png`}
              alt="NewsPulseAI"
              height="24"
              style={{ display: 'block', margin: '0 auto 12px' }}
            />
            <Text style={footerText}>
              You&apos;re receiving this because you added channels to{' '}
              <Link href={APP_URL} style={{ color: '#10b981', textDecoration: 'none' }}>
                NewsPulseAI
              </Link>
              .
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} NewsPulseAI · All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#f4f6f9',
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: 0,
}

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
}

const headerDate: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  margin: 0,
  letterSpacing: '0.5px',
}

const heroBanner: React.CSSProperties = {
  background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
}

const heroEyebrow: React.CSSProperties = {
  color: '#6ee7b7',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '3px',
  margin: '0 0 8px 0',
}

const heroHeading: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '30px',
  fontWeight: '800',
  margin: '0 0 12px 0',
  lineHeight: '1.2',
}

const heroSub: React.CSSProperties = {
  color: '#a7f3d0',
  fontSize: '15px',
  margin: 0,
  lineHeight: '1.6',
}

const content: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '32px 24px',
}

const sectionLabel: React.CSSProperties = {
  color: '#10b981',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0 0 20px 0',
}

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  padding: '24px',
  marginBottom: '16px',
}

const channelBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#ecfdf5',
  color: '#059669',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  padding: '3px 10px',
  borderRadius: '20px',
  margin: '0 0 12px 0',
  border: '1px solid #a7f3d0',
}

const videoTitle: React.CSSProperties = {
  color: '#111827',
  fontSize: '17px',
  fontWeight: '700',
  margin: '0 0 10px 0',
  lineHeight: '1.4',
}

const summary: React.CSSProperties = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '1.75',
  margin: '0 0 20px 0',
}

const watchButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '700',
  textDecoration: 'none',
  padding: '10px 22px',
  borderRadius: '8px',
  letterSpacing: '0.3px',
}

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
}

const upgradeCta: React.CSSProperties = {
  backgroundColor: '#fffbeb',
  borderRadius: '12px',
  border: '1px solid #fde68a',
  padding: '24px',
  marginBottom: '16px',
  textAlign: 'center',
}

const upgradeHeading: React.CSSProperties = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '800',
  margin: '0 0 10px 0',
  letterSpacing: '0.3px',
}

const upgradeBody: React.CSSProperties = {
  color: '#78350f',
  fontSize: '13px',
  lineHeight: '1.7',
  margin: '0 0 16px 0',
}

const upgradeButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#f59e0b',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '700',
  textDecoration: 'none',
  padding: '10px 22px',
  borderRadius: '8px',
}

const footerText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center',
  margin: '0 0 4px 0',
  lineHeight: '1.6',
}

// ── Sender ────────────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDigest(
  to: string,
  name: string,
  items: DigestItem[],
  plan: 'free' | 'plus' | 'pro' = 'free',
): Promise<void> {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `☀️ Your Morning Digest – ${date}`,
    react: <DigestEmail name={name} items={items} date={date} plan={plan} />,
  })
}
