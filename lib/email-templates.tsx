import * as React from "react"

type EmailLayoutProps = {
  title: string
  preheader: string
  children: React.ReactNode
}

function EmailLayout({ title, preheader, children }: EmailLayoutProps) {
  return (
    <html>
      <body style={styles.body}>
        <div style={styles.preheader}>{preheader}</div>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={styles.wrapperTable}
        >
          <tbody>
            <tr>
              <td align="center" style={styles.wrapperCell}>
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={styles.card}
                >
                  <tbody>
                    <tr>
                      <td style={styles.headerCell}>
                        <p style={styles.brand}>Oxarchive</p>
                        <p style={styles.subject}>{title}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.contentCell}>{children}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

type TransferClaimedAlertEmailProps = {
  orderToken: string
  buyerName: string
  buyerEmail: string
  amount: string
  itemTitles: string[]
  verifyUrl: string
}

export function TransferClaimedAlertEmail({
  orderToken,
  buyerName,
  buyerEmail,
  amount,
  itemTitles,
  verifyUrl,
}: TransferClaimedAlertEmailProps) {
  return (
    <EmailLayout
      title={`Transfer claimed: ${orderToken}`}
      preheader={`Buyer ${buyerName} claimed payment for ${orderToken}.`}
    >
      <h1 style={styles.h1}>Buyer confirmed transfer</h1>
      <p style={styles.p}>
        A buyer says they have completed a bank transfer for order{" "}
        <strong>{orderToken}</strong>.
      </p>

      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={styles.infoTable}
      >
        <tbody>
          <tr>
            <td style={styles.infoLabel}>Buyer</td>
            <td style={styles.infoValue}>{buyerName}</td>
          </tr>
          <tr>
            <td style={styles.infoLabel}>Email</td>
            <td style={styles.infoValue}>{buyerEmail}</td>
          </tr>
          <tr>
            <td style={styles.infoLabel}>Amount</td>
            <td style={styles.infoValue}>{amount}</td>
          </tr>
          <tr>
            <td style={styles.infoLabel}>Order token</td>
            <td style={styles.infoValue}>{orderToken}</td>
          </tr>
        </tbody>
      </table>

      <p style={styles.pStrong}>Items</p>
      <ul style={styles.ul}>
        {itemTitles.map((title) => (
          <li key={title} style={styles.li}>
            {title}
          </li>
        ))}
      </ul>

      <p style={styles.p}>
        Verify the payment and unlock downloads from the admin queue.
      </p>
      <p style={styles.ctaWrap}>
        <a href={verifyUrl} style={styles.cta}>
          Open verification queue
        </a>
      </p>
    </EmailLayout>
  )
}

type PaymentConfirmedEmailProps = {
  buyerName: string
  orderToken: string
  amount: string
  itemTitles: string[]
  checkoutUrl: string
}

export function PaymentConfirmedEmail({
  buyerName,
  orderToken,
  amount,
  itemTitles,
  checkoutUrl,
}: PaymentConfirmedEmailProps) {
  return (
    <EmailLayout
      title={`Payment confirmed: ${orderToken}`}
      preheader={`Your payment for ${orderToken} has been confirmed.`}
    >
      <h1 style={styles.h1}>Payment confirmed</h1>
      <p style={styles.p}>Hi {buyerName},</p>
      <p style={styles.p}>
        Your transfer has been verified and your downloads are now unlocked for
        order <strong>{orderToken}</strong>.
      </p>

      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={styles.infoTable}
      >
        <tbody>
          <tr>
            <td style={styles.infoLabel}>Amount paid</td>
            <td style={styles.infoValue}>{amount}</td>
          </tr>
          <tr>
            <td style={styles.infoLabel}>Order token</td>
            <td style={styles.infoValue}>{orderToken}</td>
          </tr>
        </tbody>
      </table>

      <p style={styles.pStrong}>Purchased items</p>
      <ul style={styles.ul}>
        {itemTitles.map((title) => (
          <li key={title} style={styles.li}>
            {title}
          </li>
        ))}
      </ul>

      <p style={styles.ctaWrap}>
        <a href={checkoutUrl} style={styles.cta}>
          Open my downloads
        </a>
      </p>
      <p style={styles.note}>
        If the button does not work, open this link: {checkoutUrl}
      </p>
    </EmailLayout>
  )
}

type PublisherSubmissionReceivedEmailProps = {
  pseudonym: string
  title: string
}

export function PublisherSubmissionReceivedEmail({
  pseudonym,
  title,
}: PublisherSubmissionReceivedEmailProps) {
  return (
    <EmailLayout
      title="Submission received"
      preheader={`Your draft submission for ${title} has been received.`}
    >
      <h1 style={styles.h1}>Submission received</h1>
      <p style={styles.p}>Hi {pseudonym},</p>
      <p style={styles.p}>
        We received your anonymous publication draft for{" "}
        <strong>{title}</strong>.
      </p>
      <p style={styles.p}>
        Your submission is stored as a draft and queued for editorial market
        review.
      </p>
    </EmailLayout>
  )
}

type PublisherSubmissionApprovedEmailProps = {
  pseudonym: string
  title: string
  listingUrl: string
  suggestedPrice: string
  finalPrice: string
}

export function PublisherSubmissionApprovedEmail({
  pseudonym,
  title,
  listingUrl,
  suggestedPrice,
  finalPrice,
}: PublisherSubmissionApprovedEmailProps) {
  const adjusted = suggestedPrice !== finalPrice

  return (
    <EmailLayout
      title="Publication approved"
      preheader={`Your listing for ${title} is now live on Oxarchive.`}
    >
      <h1 style={styles.h1}>Your listing is live</h1>
      <p style={styles.p}>Hi {pseudonym},</p>
      <p style={styles.p}>
        Your submission <strong>{title}</strong> has been approved and
        published.
      </p>
      <p style={styles.pStrong}>Pricing</p>
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={styles.infoTable}
      >
        <tbody>
          <tr>
            <td style={styles.infoLabel}>Suggested price</td>
            <td style={styles.infoValue}>{suggestedPrice}</td>
          </tr>
          <tr>
            <td style={styles.infoLabel}>Final listing price</td>
            <td style={styles.infoValue}>{finalPrice}</td>
          </tr>
        </tbody>
      </table>

      {adjusted ? (
        <p style={styles.p}>
          The final price was adjusted based on market analysis in line with
          platform policy.
        </p>
      ) : null}

      <p style={styles.ctaWrap}>
        <a href={listingUrl} style={styles.cta}>
          Open publication listing
        </a>
      </p>
      <p style={styles.note}>Listing URL: {listingUrl}</p>
    </EmailLayout>
  )
}

type PublisherSubmissionRejectedEmailProps = {
  pseudonym: string
  title: string
  reason: string
}

export function PublisherSubmissionRejectedEmail({
  pseudonym,
  title,
  reason,
}: PublisherSubmissionRejectedEmailProps) {
  return (
    <EmailLayout
      title="Submission update"
      preheader={`Your submission for ${title} was not approved.`}
    >
      <h1 style={styles.h1}>Submission not approved</h1>
      <p style={styles.p}>Hi {pseudonym},</p>
      <p style={styles.p}>
        We reviewed <strong>{title}</strong> and it was not approved for listing
        at this time.
      </p>
      <p style={styles.pStrong}>Reviewer note</p>
      <p style={styles.p}>{reason}</p>
    </EmailLayout>
  )
}

type PublisherPayoutSummaryEmailProps = {
  pseudonym: string
  payoutMonth: string
  grossSales: string
  platformFee: string
  netPayout: string
  salesCount: number
}

export function PublisherPayoutSummaryEmail({
  pseudonym,
  payoutMonth,
  grossSales,
  platformFee,
  netPayout,
  salesCount,
}: PublisherPayoutSummaryEmailProps) {
  return (
    <EmailLayout
      title={`Month-end payout summary (${payoutMonth})`}
      preheader={`Your ${payoutMonth} payout summary is ready.`}
    >
      <h1 style={styles.h1}>Payout summary</h1>
      <p style={styles.p}>Hi {pseudonym},</p>
      <p style={styles.p}>Here is your month-end summary for {payoutMonth}.</p>
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={styles.infoTable}
      >
        <tbody>
          <tr>
            <td style={styles.infoLabel}>Book sales</td>
            <td style={styles.infoValue}>{salesCount}</td>
          </tr>
          <tr>
            <td style={styles.infoLabel}>Gross sales</td>
            <td style={styles.infoValue}>{grossSales}</td>
          </tr>
          <tr>
            <td style={styles.infoLabel}>Platform fee (15%)</td>
            <td style={styles.infoValue}>{platformFee}</td>
          </tr>
          <tr>
            <td style={styles.infoLabel}>Net payout</td>
            <td style={styles.infoValue}>{netPayout}</td>
          </tr>
        </tbody>
      </table>
    </EmailLayout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: "0",
    backgroundColor: "#17140f",
    fontFamily: "Roboto, Arial, sans-serif",
    color: "#f0ece0",
  },
  preheader: {
    display: "none",
    visibility: "hidden",
    opacity: 0,
    height: 0,
    width: 0,
    overflow: "hidden",
  },
  wrapperTable: {
    backgroundColor: "#17140f",
    padding: "24px 12px",
  },
  wrapperCell: {
    maxWidth: "640px",
  },
  card: {
    backgroundColor: "#1e1b17",
    border: "1px solid rgba(255, 255, 255, 0.12)",
  },
  headerCell: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
  },
  contentCell: {
    padding: "24px",
  },
  brand: {
    margin: 0,
    fontSize: "13px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#a39c8a",
  },
  subject: {
    margin: "6px 0 0 0",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#736c5f",
  },
  h1: {
    margin: "0 0 12px 0",
    fontSize: "26px",
    lineHeight: "32px",
    color: "#f0ece0",
    fontWeight: 600,
  },
  p: {
    margin: "0 0 12px 0",
    fontSize: "15px",
    lineHeight: "24px",
    color: "#d8d2c2",
  },
  pStrong: {
    margin: "18px 0 10px 0",
    fontSize: "14px",
    lineHeight: "22px",
    color: "#f0ece0",
    fontWeight: 600,
  },
  ul: {
    margin: "0 0 18px 18px",
    padding: 0,
  },
  li: {
    margin: "0 0 6px 0",
    fontSize: "14px",
    lineHeight: "22px",
    color: "#d8d2c2",
  },
  infoTable: {
    margin: "8px 0 16px 0",
    borderCollapse: "collapse",
  },
  infoLabel: {
    padding: "6px 12px 6px 0",
    fontSize: "13px",
    color: "#a39c8a",
    verticalAlign: "top",
  },
  infoValue: {
    padding: "6px 0",
    fontSize: "14px",
    color: "#f0ece0",
    verticalAlign: "top",
  },
  ctaWrap: {
    margin: "20px 0 10px 0",
  },
  cta: {
    display: "inline-block",
    backgroundColor: "#f0ece0",
    color: "#17140f",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    padding: "10px 16px",
  },
  note: {
    margin: "8px 0 0 0",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#a39c8a",
    wordBreak: "break-all",
  },
}
