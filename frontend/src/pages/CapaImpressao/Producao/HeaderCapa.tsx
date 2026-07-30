import logo from "../../../assets/gd-color.png";

export function HeaderCapa() {
  return (
    <div className="cp-row" style={{ height: 48, marginTop: 4 }}>
      <div
        className="cp-cell-no-border cp-no-r cp-center"
        style={{ width: 120 }}
      >
        <img
          src={logo}
          alt="GD"
          style={{ width: "60%", height: "80%", objectFit: "contain" }}
        />
      </div>
      <div className="cp-cell cp-center cp-bg-blue" style={{ flex: 1 }}>
        <label className="cp-label cp-bold" style={{ fontSize: 26 }}>
          CONTROLE DE PRODUÇÃO
        </label>
      </div>
    </div>
  );
}
