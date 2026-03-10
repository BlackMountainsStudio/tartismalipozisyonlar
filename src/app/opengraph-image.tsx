import { ImageResponse } from "next/og";

export const alt = "Var Odası - Hakem Kararları Analiz Platformu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              fill="#ef4444"
            />
          </svg>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
            }}
          >
            Var{" "}
            <span style={{ color: "#ef4444" }}>Odası</span>
          </span>
        </div>
        <span
          style={{
            fontSize: 28,
            color: "#a1a1aa",
          }}
        >
          Hakem Kararları Analiz Platformu
        </span>
        <span
          style={{
            fontSize: 20,
            color: "#71717a",
            marginTop: 12,
          }}
        >
          varodasi.com
        </span>
      </div>
    ),
    { ...size }
  );
}
