import "server-only";
import QRCode from "qrcode";

/** QR code (SVG) pointing to a credential's verification page. */
export function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff00" },
  });
}
