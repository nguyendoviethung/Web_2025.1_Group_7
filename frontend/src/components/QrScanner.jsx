import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QrScanner({ onScan, active = true, fps = 3 }) {
  const idRef      = useRef(`qr-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef(null);
  const onScanRef  = useRef(onScan);
  const [error, setError] = useState(null);

  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  useEffect(() => {
    if (!active) return;

    const scanner = new Html5Qrcode(idRef.current);
    scannerRef.current = scanner;
    setError(null);

    scanner
      .start(
        { facingMode: "environment" },
        { fps, qrbox: { width: 240, height: 180 } },
        (decodedText) => {
          onScanRef.current(decodedText.trim());
        },
        () => {}
      )
      .catch((err) => {
        setError("Không thể truy cập camera. Kiểm tra lại quyền truy cập.");
        console.warn("QR Scanner error:", err);
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [active, fps]);

  return (
    <div className="qr-scanner-wrap">
      <div id={idRef.current} className="qr-scanner-viewport" />
      {error && <div className="qr-scanner-error">{error}</div>}
    </div>
  );
}