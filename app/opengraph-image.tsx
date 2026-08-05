import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Oxarchive ebook marketplace"
export const contentType = "image/png"
export const size = {
  width: 1200,
  height: 630,
}

export default function OpenGraphImage() {
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
          "radial-gradient(circle at top left, #f4f0e8 0%, #f0e9dd 42%, #e7d9c6 100%)",
        color: "#1f1304",
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
            maxWidth: "92%",
          }}
        >
          Curated ebooks for professionals
        </div>
        <div style={{ fontSize: 34, opacity: 0.8 }}>
          Research, references, and technical reading
        </div>
      </div>

      <div style={{ fontSize: 28, opacity: 0.7 }}>oxarchive.com</div>
    </div>,
    size
  )
}
