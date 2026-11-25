import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface Props {
  /** Texto a codificar — vira os dados reais lidos de volta pelo leitor. */
  value: string;
  height?: number;
  /** Largura de cada barra mínima, em px (SVG escala por CSS depois). */
  width?: number;
  className?: string;
}

// CODE128 de verdade (checksum + start/stop calculados pela lib) — ao
// contrário de uma fonte "barcode", que só desenha barras sem validar os
// dados, isso é o que um leitor físico realmente consegue decodificar.
export function Barcode({ value, height = 50, width = 1.4, className }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        displayValue: false,
        height,
        width,
        margin: 0,
      });
    } catch {
      // valor incompatível com CODE128 — não deve acontecer com código numérico
    }
  }, [value, height, width]);

  return <svg ref={ref} className={className} />;
}
