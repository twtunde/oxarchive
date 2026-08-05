import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Oxarchive ebook marketplace"
export const contentType = "image/png"
export const size = {
  width: 1200,
  height: 630,
}

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        background:
          "linear-gradient(135deg, #132229 0%, #1f3037 45%, #29444f 100%)",
        color: "#f4efe7",
      }}
    >
      <div
        style={{
          fontSize: 30,
          letterSpacing: 8,
          textTransform: "uppercase",
          opacity: 0.75,
        }}
      >
        Oxarchive
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            fontSize: 88,
            lineHeight: 1.05,
            fontWeight: 700,
            maxWidth: "94%",
          }}
        >
          Discover your next technical read
        </div>
        <div style={{ fontSize: 34, opacity: 0.82 }}>
          Professional and research-grade ebooks
        </div>
      </div>

      <div style={{ fontSize: 28, opacity: 0.72 }}>oxarchive.com</div>
    </div>,
    size
  )
}
