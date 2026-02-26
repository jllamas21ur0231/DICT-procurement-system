import { Link } from 'react-router-dom';
import pinasLogo from "../components/images/pinas.png";
import oops from "../components/images/oops.svg"
import { Button } from '@/components/ui/button';

export default function VerificationFailed() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50"> 
      <header className="">
        <div className="m-4 p-4 flex">
          <h1 className="text-[#1C7293] font-bold text-3xl">
            DICT RO1
          </h1>

        <div className="flex-1"></div>

          <img src={pinasLogo} alt="" className='w-14 h-14 object-contain'/>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="-mt-20">
          <img src={oops} alt="" className=''/>
        </div>

        <h1 className="text-[#1C7293] text-2xl font-bold mt-3 mb-4">Verification Failed</h1>
        <p>The verification code you entered is incorrect. Please check </p>
        <p>the code sent to your registered email address and try again</p>
        <p className="text-gray-600 text-center mb-2 mt-3">
          <button
            onClick={() => window.history.back()} 
            className="px-6 py-3 mt-5 bg-[#1C7293] hover:bg-[#155a7a] text-white font-medium rounded-lg transition-colors shadow-sm w-70 text-xl"
          >
            Enter code again
          </button>
        </p>
      </main> 
    </div>
  );
}