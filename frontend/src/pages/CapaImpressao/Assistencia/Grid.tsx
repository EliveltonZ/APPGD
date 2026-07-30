import { type ReactNode, type CSSProperties } from "react";

export function CreateGrid({ children, style }: { children: ReactNode; style: CSSProperties }) {
  return <div style={style}>{children}</div>;
}
