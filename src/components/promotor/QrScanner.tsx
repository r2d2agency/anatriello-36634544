import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

export function QrScanner({ onScanSuccess, onScanFailure }: QrScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (error) => {
        if (onScanFailure) onScanFailure(error);
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full">
      <div id="qr-reader" className="overflow-hidden rounded-xl border-none" />
      <style>{`
        #qr-reader {
          border: none !important;
        }
        #qr-reader__scan_region {
          background: #0f172a !important;
        }
        #qr-reader__dashboard_section_csr button {
          background-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          border: none !important;
          margin-top: 10px !important;
        }
        #qr-reader__status_span {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
