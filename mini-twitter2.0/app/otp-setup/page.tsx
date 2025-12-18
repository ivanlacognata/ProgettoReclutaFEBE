'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { useEffect } from 'react';

const OTPSetupPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const otpSecret = searchParams.get('otpSecret');
  const rawOtpAuthUrl = searchParams.get('otpAuthUrl');
  const otpAuthUrl = rawOtpAuthUrl ? decodeURIComponent(rawOtpAuthUrl) : null;

  // 🔍 Log diagnostici all'avvio della pagina
  useEffect(() => {

    if (!otpSecret || !otpAuthUrl) {
      console.warn("⚠️ Parametri OTP mancanti o invalidi");
    }
  }, [otpSecret, rawOtpAuthUrl, otpAuthUrl]);

  if (!otpSecret || !otpAuthUrl) {
    return (
      <p className="text-red-400 p-5">
        Parametri OTP mancanti. Torna indietro e riprova la registrazione.
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-[#0f172b] rounded-xl text-white space-y-8 mt-10">
      <h1 className="text-3xl font-bold text-center">Registrazione completata</h1>

      <div>
        <h2 className="font-bold text-xl mb-2">Passo 1: Installa Google Authenticator</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>
            iPhone:{' '}
            <a
              href="https://apps.apple.com/app/google-authenticator/id388497605"
              target="_blank"
              className="text-blue-400 underline"
            >
              App Store
            </a>
          </li>
          <li>
            Android:{' '}
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
              className="text-blue-400 underline"
            >
              Google Play
            </a>
          </li>
        </ul>
      </div>

      <div className="text-center">
        <h2 className="font-bold text-xl mb-4">Passo 2: Scansiona il QR Code</h2>

        <div className="inline-block bg-[#0f172b] p-6 rounded-md mb-4">
          <QRCode value={otpAuthUrl} size={250} />
        </div>

        <p className="text-gray-300 mb-2">Oppure inserisci manualmente il secret:</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={otpSecret}
            readOnly
            className="flex-1 bg-[#0f172b] text-white font-mono p-3 rounded-md border border-gray-600"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(otpSecret);
            }}
            className="bg-[#0f172b] border border-gray-600 px-4 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Copia
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          router.push('/login');
        }}
        className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-full font-bold"
      >
        Continua al Login
      </button>
    </div>
  );
};

export default OTPSetupPage;
