import Navbar from "../_components/navbar";
import Image from "next/image";
import Link from 'next/link';


export default function Home() {
  return (
    <div className="relative">
      <Navbar />

      <div className="fixed inset-0 -z-1">
        <div className='absolute inset-0 bg-everblue-800/75 [clip-path:url("#bg-clip")] after:content-[""] after:absolute after:inset-0 after:bg-[#0C0E0F] after:opacity-60 pointer-events-none'>
          <Image
            src="/treesMist.jpg"
            alt="Image of a forest with mist"
            width={1920}
            height={1239}
            className="w-full absolute bottom-0 -z-3 opacity-95"
            priority
          />
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-[633px] h-[622px] rounded-[70px] bg-gradient-to-b from-[#D4D4D4] to-[#737373] opacity-30 flex items-center justify-center">
          <div>
            Don't have an account? <Link href={'/signup'}>Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
