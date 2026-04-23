"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="da">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          textAlign: "center",
          backgroundColor: "#FAFAFA",
          color: "#302031",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "2.25rem", fontWeight: 700, margin: 0 }}>
          Noget gik galt
        </h1>
        <p style={{ marginTop: "1rem", maxWidth: "28rem", opacity: 0.8 }}>
          Der opstod en kritisk fejl. Prøv at genindlæse siden.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: "#0C6170",
            color: "#FAFAFA",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Prøv igen
        </button>
      </body>
    </html>
  );
}
