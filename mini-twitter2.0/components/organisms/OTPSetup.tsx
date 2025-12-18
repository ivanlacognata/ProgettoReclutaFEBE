"use client";

import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";

const OTPSetup: React.FC = () => {
  const searchParams = useSearchParams();

  const otpSecret = searchParams.get("otpSecret");
  const rawUrl = searchParams.get("otpAuthUrl");

  const otpAuthUrl = rawUrl ? decodeURIComponent(rawUrl) : null;

  if (!otpSecret || !otpAuthUrl) {
    return (
      <p className="text-red-400 p-5">
        Parametri OTP mancanti. Torna indietro e riprova la registrazione.
      </p>
    );
  }

  return (
    <div className="p-5 border rounded-xl bg-[#0f172b] text-white space-y-4 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold">Configura OTP</h2>
      <p>Scansiona questo QR code con Google Authenticator</p>

      <div className="bg-white p-4 rounded-md inline-block">
        <QRCode value={otpAuthUrl} size={180} />
      </div>

      <p className="text-gray-300 mt-2">
        Oppure inserisci manualmente il secret:<br />
        <span className="text-blue-300 font-mono text-lg">{otpSecret}</span>
      </p>
    </div>
  );
};

export default OTPSetup;
