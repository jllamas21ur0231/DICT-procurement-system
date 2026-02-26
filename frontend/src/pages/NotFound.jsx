import { Link } from 'react-router-dom';
import pinasLogo from "../components/images/pinas.png";
import notFound from "../components/images/404.png"
import { Button } from '@/components/ui/button';

export default function NotFound() {
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
        <div className="mb-8">
          <img src={notFound} alt="" className='h-80 w-80'/>
        </div>

        <h1 className="text-[#1C7293] text-6xl font-bold mb-4">NO RESULTS FOUND</h1>
        <h2 className="text-[#134C62] text-2xl font-semibold mb-2">Sorry there's nothing here</h2>
        <p className="text-gray-600 text-center mb-2 mt-3">
          <button
            onClick={() => window.history.back()} 
            className="px-6 py-3 bg-[#1C7293] hover:bg-[#155a7a] text-white font-medium rounded-lg transition-colors shadow-sm w-50 text-xl"
          >
            GO BACK
          </button>
        </p>
      </main> 
    </div>
  );
}