import QRScanner from '@/components/QRScanner';

const SecureAdmin = () => {
  // Render the QRScanner directly for this secret route
  return <QRScanner forceShow />;
};

export default SecureAdmin;
