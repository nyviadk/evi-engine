"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{
        backgroundColor: "var(--color-light)",
        color: "var(--text-on-light)",
      }}
    >
      <h1 className="text-4xl font-bold">Noget gik galt</h1>
      <p className="mt-4 max-w-md text-lg opacity-80">
        Der opstod en uventet fejl. Prøv igen om lidt.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-evi px-6 py-3 font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--text-on-primary)",
        }}
      >
        Prøv igen
      </button>
    </div>
  );
}
