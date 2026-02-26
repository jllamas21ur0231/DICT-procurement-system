import '../css/CheckEmail.css'
import sendingEmails from '../components/images/sending_emails.png'

export default function CheckEmail() {
    return (
        <div className="flex flex-col min-h-screen">
            
            <header>
                <div className="bg-[#134C62] p-3 text-center">
                    <h1 className="text-white font-bold">Department of Information and Communications Technology Regional Office 1</h1>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center">
                <img src={sendingEmails} alt="email confirmation" className="mb-4" />
                <h1 className='text-[#134C62] text-2xl font-bold'>Email Confirmation</h1>
                <p>We sent an email confirmation to <span className='text-[#1C7293]'>hello@gmail.com</span>.</p>
                <p>Check your email and click on the confirmation link to</p>
                <p>continue. The link will expire after an hour.</p>
            </main>
        
            <footer>
                <div className="bg-[#134C62] p-3 text-center">
                    <h1 className="text-white font-bold">© DICT RO1 2023. All Rights Reserved</h1>
                </div>
            </footer>
            
        </div>
    )
}
