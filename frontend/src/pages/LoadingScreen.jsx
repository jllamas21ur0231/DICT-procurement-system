import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/images/Loading.gif';

export default function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 15000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50"> 

      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="border-3 border-[#1C7293] p-5 rounded-xl">
          <img src={Loading} alt="" className='h-45'/>
        </div>

        <h1 className="text-[#1C7293] text-2xl font-bold mt-3 mb-4">Loading, please wait...</h1>
        <p>We're getting things ready for you.</p>
      </main> 
    </div>
  );
}