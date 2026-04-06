import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QrScanner({ onScan, active = true, fps = 3 }) {
  const containerId = useRef(`qr-${Math.random().toString(36).slice(2)}`).current; // ID cố định cho container, không thay đổi qua các render
  const onScanRef   = useRef(onScan); // Ref để giữ callback onScan mới nhất mà không cần restart camera
  const activeRef   = useRef(active); // Ref để kiểm tra trạng thái active mới nhất trong callback mà không cần restart camera
  const lockedRef   = useRef(false);  // Ref để khóa tạm thời sau khi quét thành công, tránh spam cùng 1 mã
  const lockTimer   = useRef(null);  // Ref để lưu timer unlock, đảm bảo clear đúng khi component unmount

  const [error, setError] = useState(null);
   // Cập nhật ref onScan mỗi khi prop onScan thay đổi
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
  
    const scanner = new Html5Qrcode(containerId); 
    let started = false; //

    scanner
      .start(
        { facingMode: "environment" }, 
        { fps, qrbox: { width: 240, height: 240 } }, 
        (decodedText) => {

          if (!activeRef.current) return; // Nếu không active, bỏ qua kết quả quét mới
        
          if (lockedRef.current) return; // Nếu đang khóa, bỏ qua kết quả quét mới

          lockedRef.current = true; 
          onScanRef.current(decodedText.trim()); 

          // Unlock sau 1.5s để tránh spam cùng 1 mã liên tiếp
          lockTimer.current = setTimeout(() => {
            lockedRef.current = false;
          }, 1500);
        },
        () => {} // Optional: callback mỗi khi quét thất bại, có thể dùng để hiển thị hiệu ứng hoặc log
         
      )
      .then(() => {
        started = true;
      })
      .catch(() => setError("Không thể truy cập camera."));

    return () => {
      clearTimeout(lockTimer.current);
      if (started) scanner.stop().then(() => scanner.clear()).catch(() => {}); 
    };
  }, []); 

  return (
    <div className="qr-scanner-wrap">
      <div id={containerId} className="qr-scanner-viewport" />
      {error && <div className="qr-scanner-error">{error}</div>}
    </div>
  );
}