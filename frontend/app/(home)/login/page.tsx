import Navbar from "../_components/navbar";
import Image from "next/image";
import Link from 'next/link';


export default function Home() {
  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Background Image */}
      <div className="absolute top-0 w-full h-[115vh] -z-1">
      <div className="absolute w-full h-[115vh] z-[-1] bg-[rgba(12,14,15,0.6)] [clip-path:url('#bg-clip')]"></div>
        <Image
          src="/treesMist.jpg"
          alt="Forest with mist"
          layout="fill"
          objectFit="cover"
          className='absolute w-full h-[115vh] object-cover object-[50%_15%] -z-2 [clip-path:url("#bg-clip")]'
          priority
        />
      </div>

      {/* Login Box */}
      <div className="flex items-center justify-center min-h-screen">

        {/* Actual Box */}
        <div className="relative opacity-30">
          <div className="w-[633px] h-[622px] rounded-[70px] bg-gradient-to-b from-[#D4D4D4] to-[#737373]"></div>
        </div>

        {/* Content inside the box */}
        <div className="absolute w-[633px] h-[622px] rounded-[70px] flex flex-col justify-center items-center z-10">

          {/* Decor Image */}
          <div className="flex justify-center mb-4">
            <Image src="/decorWhite.svg" alt="Decorative" width={120} height={20} />
          </div>

          {/* Dont have account */}
          <div>
            Don't have an account? <Link href={'/signup'}>Sign up</Link>
          </div>


        </div>
      </div>

    </div>
  );
}
