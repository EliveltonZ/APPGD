import logo from "../../../assets/gd-color.png";
import { B } from "./constants";

export function HeaderImg() {
  return (
    <div
      className="d-flex justify-content-between"
      style={{ width: "100%", marginTop: 4, height: 48 }}
    >
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ width: "120px" }}
      >
        <img
          src={logo}
          alt="GD"
          style={{ width: "60%", height: "80%", objectFit: "contain" }}
        />
      </div>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ flex: 1, background: "#f78585", border: B }}
      >
        <label
          className="form-label margin-0 font-26"
          style={{ color: "#f8f9fa" }}
        >
          CONTROLE DE ASSISTÊNCIAS TÉCNICAS
        </label>
      </div>
    </div>
  );
}
