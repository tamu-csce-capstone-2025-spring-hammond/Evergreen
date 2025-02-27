import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
      <footer className='flex items-center justify-between mx-[4%] mt-[15%] px-8 py-4 -translate-y-[27.5%] bg-evergray-100 rounded-[3rem] relative z-2 gap-[4%]'>
            <Image
                src="/decorWhite.svg"
                alt=""
                width={239}
                height={37}
                className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-7/5 scale-90'
            />
            <div className='flex flex-col justify-between h-full gap-4'>
                <Link href="/" className='flex items-center'>
                    <Image
                        src="/logo.png"
                        alt="Evergreen Logo"
                        width={314}
                        height={318}
                        className='size-10 inline'
                    />
                    <span className='text-evergreen-500 font-ntwagner text-3xl pl-1 mt-0.5'>Evergreen</span>
                </Link>
                <p className='whitespace-nowrap'>&copy; Copyright 2025 | Evergreen</p>
            </div>
            <p className='text-sm'>
            Evergreen was created to make long-term investing easier and more effective. With so many new investors entering the market, we wanted to build a tool that takes the complexity out of managing a portfolio. It helps keep investments on track while adapting to financial goals with minimal effort.
            </p>
            <div className='flex flex-col justify-between h-full gap-1'>
                <Link href="/login" className='cursor-pointer text-lg pr-2 whitespace-nowrap'>Login</Link>
                <Link href="/signup" className='cursor-pointer text-lg pr-2 whitespace-nowrap'>Sign Up</Link>
                <Link href="/" className='cursor-pointer text-lg pr-2 whitespace-nowrap'>Contact</Link>
            </div>
            <Image
                src="/footerDecor.svg"
                alt="Sun decor"
                width={307}
                height={143}
                className='scale-85'
            />
      </footer>
    );
  }