import { type CSSProperties } from "react";
import { B } from "./constants";

type InfoBoxProps = {
  header: string;
  value: string;
  style?: CSSProperties;
  valueStyle?: CSSProperties;
  _class?: string;
};

export function HeaderBox({ header, value, style, valueStyle, _class }: InfoBoxProps) {
  return (
    <div style={{ borderLeft: B }}>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ width: "100%", ...style }}
      >
        <label className="form-label fw-bold text-center">{header}</label>
      </div>
      <div
        className={_class}
        style={{
          height: 35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: B,
          ...valueStyle,
        }}
      >
        <label className="form-label">{value}</label>
      </div>
    </div>
  );
}
