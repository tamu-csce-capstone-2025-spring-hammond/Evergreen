import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
      <footer className='flex items-center justify-between mx-[4%] mt-[15%] p-8 -translate-y-[50%] bg-evergray-100 rounded-[3rem] relative z-2'>
            {/* <Image
                src="/decorWhite.svg"
                alt=""
                width={1042}
                height={495}
            /> */}
            <div>
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
                <p>&copy; Copyright 2025 | Evergreen</p>
            </div>
            <p>
                desc
            </p>
            <div>
                <Link href="/login" className='cursor-pointer font-medium text-lg pr-2'>Login</Link>
                <Link href="/signup" className='cursor-pointer font-medium text-lg pr-2'>Sign Up</Link>
                <Link href="/" className='cursor-pointer font-medium text-lg pr-2'>Contact</Link>
            </div>
            {/* <Image
                src="/decorWhite.svg"
                alt=""
                width={1042}
                height={495}
            /> */}
      </footer>
    );
  }