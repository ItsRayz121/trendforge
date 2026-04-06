"use client";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "#1a1a2e",
          color: "#e2e8f0",
          border: "1px solid #2a2a3e",
          borderRadius: "12px",
          fontSize: "13px",
          maxWidth: "380px",
        },
        success: {
          iconTheme: { primary: "#22c55e", secondary: "#1a1a2e" },
          style: {
            border: "1px solid rgba(34,197,94,0.25)",
            background: "rgba(34,197,94,0.08)",
          },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#1a1a2e" },
          style: {
            border: "1px solid rgba(239,68,68,0.25)",
            background: "rgba(239,68,68,0.08)",
          },
        },
        loading: {
          iconTheme: { primary: "#8b5cf6", secondary: "#1a1a2e" },
        },
      }}
    />
  );
}
