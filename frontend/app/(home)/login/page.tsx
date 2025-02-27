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
      <div className="flex items-center justify-center min-h-screen text-white">

        {/* Actual Box */}
        <div className="relative opacity-30">
          <div className="w-[633px] h-[622px] rounded-[70px] bg-gradient-to-b from-[#D4D4D4] to-[#737373]"></div>
        </div>

        {/* Content inside the box */}
        <div className="absolute w-[633px] h-[622px] rounded-[70px] flex flex-col justify-center items-center z-10">

          {/* Decor Image */}
          <div className="flex justify-center mb-4">
            <Image src="/decorWhite.svg" alt="Decorative" width={239} height={36.5} />
          </div>

          {/* Header */}
          <h2 className="text-center text-[52px] font-bold mb-6 font-ntwagner">Welcome Back!</h2>

          {/* Login Form */}
          <form className="space-y-6 w-full flex flex-col items-center">

            {/* Email Input */}
            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-5 py-3">
                <span className="pr-2"></span>
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-transparent w-full focus:outline-none placeholder-white text-white "
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-5 py-3 ">
                <span className="pr-2"></span>
                <input
                  type="password"
                  placeholder="Password"
                  className="bg-transparent w-full focus:outline-none placeholder-white text-white"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between text-sm w-[70%]">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox"     
                  className="accent-transparent border-2 border-white rounded-4 w-3 h-3 " 
                />
                <span>Remember me</span>
              </label>

              {/* Links to nowhere */}
              <Link href="/login" className="text-white">
                Forgot Password?
              </Link>
            </div>



            {/* Login Button */}
            <button className="w-[70%] max-w-[550px] bg-white py-3 rounded-[75px] transition text-black">
              Login
            </button>
          </form>



          {/* Dont have account */}
          <div className="pt-5">
            Don't have an account? <Link href={'/signup'} className="font-bold">Sign up</Link>
          </div>


        </div>
      </div>

    </div>
  );
}
