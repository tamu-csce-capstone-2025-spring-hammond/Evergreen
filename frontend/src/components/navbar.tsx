import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-1 px-2 bg-evergray-100 rounded-full m-4 relative z-2 box-content"> 
        <Link href="/" className='flex items-center'>
            <Image
                src="/logo.png"
                alt="Evergreen Logo"
                width={314}
                height={318}
                className='size-8 inline'
            />
            <span className='text-evergreen-500 font-ntwagner text-2xl pl-1 mt-0.5'>Evergreen</span>
        </Link>
        <Link href="/login" className='cursor-pointer font-medium text-lg pr-2'>Login</Link>
    </nav>
  );
}