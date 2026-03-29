"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        left: 12,
        top: 12,
        padding: "0.5rem 0.75rem",
        background: "#111827",
        color: "white",
        borderRadius: "0.5rem",
        transform: "translateY(-200%)",
        zIndex: 1000,
      }}
      onFocus={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.transform = "translateY(-200%)";
      }}
    >
      Skip to main content
    </a>
  );
}
