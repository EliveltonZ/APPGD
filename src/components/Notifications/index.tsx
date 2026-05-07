// NotificationToast.tsx
import { useEffect, useState } from "react";
import "./index.css";

interface NotificationToastProps {
  show: boolean;
  message: string;
  backgroundColor: string;
}

export function NotificationToast({
  show,
  message,
  backgroundColor,
}: NotificationToastProps) {
  const [render, setRender] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setRender(true);

      const timer = setTimeout(() => {
        setVisible(true);
      }, 15);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);

      const timer = setTimeout(() => {
        setRender(false);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!render) return null;

  const borderColor = hexToRgba(backgroundColor, 0.35);

  return (
    <div
      className="notification-container"
      style={{
        backgroundColor,
        border: `2px solid ${borderColor}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(80px)",
        transition: "opacity 0.50s ease, transform 0.50s ease",
      }}
    >
      {message}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
