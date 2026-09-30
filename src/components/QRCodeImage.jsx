import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// Renders a QR code in the browser with the `qrcode` package, so QR generation
// does not depend on a third-party image API and beneficiary codes never leave the app.
function QRCodeImage({ value, size = 220, alt = 'QR Code', style }) {
  const [dataUrl, setDataUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);

    QRCode.toDataURL(value, { width: size * 2, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed) {
    return (
      <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#C62828',
        fontSize: '0.75rem',
        textAlign: 'center',
        ...style
      }}>
        QR unavailable
      </div>
    );
  }

  if (!dataUrl) {
    return <div style={{ width: size, height: size, ...style }} />;
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      style={{ display: 'block', width: size, height: size, ...style }}
    />
  );
}

export default QRCodeImage;
