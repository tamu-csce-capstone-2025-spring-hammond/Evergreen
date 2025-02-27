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
          <div className="w-[693px] h-[724px] rounded-[70px] bg-gradient-to-b from-[#D4D4D4] to-[#737373]"></div>
        </div>

        {/* Content inside the box */}
        <div className="absolute w-[693px] h-[724px] rounded-[70px] flex flex-col justify-center items-center z-10">

          {/* Decor Image */}
          <div className="flex justify-center mb-4">
            <Image src="/decorWhite.svg" alt="Decorative" width={239} height={36.5} />
          </div>

          {/* Header */}
          <h2 className="text-center text-[52px] font-bold mb-6 font-ntwagner">Create Your Account</h2>

         {/* Sign Up Form */}
         <form className="space-y-6 w-full flex flex-col items-center">


            {/* Name Input */}
            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-3 py-2 ">
                <span className="pr-2">
                  <Image 
                    src={'/loginSignup/nameIcon.svg'}
                    alt="Name Icon"
                    width={30}
                    height={30}
                  />
                </span>
                <input
                  type="text"
                  placeholder="Name"
                  className="bg-transparent w-full focus:outline-none placeholder-white"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-3 py-2 ">
                <span className="pr-2">
                <Image 
                    src={'/loginSignup/emailIcon.svg'}
                    alt="Email Icon"
                    width={30}
                    height={30}
                  />
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-transparent w-full focus:outline-none placeholder-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-3 py-2 ">
                <span className="pr-2">
                <Image 
                    src={'/loginSignup/passwordIcon.svg'}
                    alt="Password Icon"
                    width={30}
                    height={30}
                  />
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  className="bg-transparent w-full focus:outline-none placeholder-white"
                />
              </div>
            </div>

            {/* Confirm Passowrd Input */}
            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-3 py-2 ">
                <span className="pr-2">
                <Image 
                    src={'/loginSignup/confirmPasswordIcon.svg'}
                    alt="Confirm Password Icon"
                    width={30}
                    height={30}
                  />
                </span>
                <input
                  type="password"
                  placeholder="Confirm Passowrd"
                  className="bg-transparent w-full focus:outline-none placeholder-white"
                />
              </div>
            </div>

            {/* Sign Up Button */}
            <button className="w-[70%] max-w-[550px] bg-white py-3 rounded-[75px] transition text-black">
              Sign Up
            </button>

          </form>


          {/* Dont have account */}
          <div className="pt-5">
            Already have an account? <Link href={'/login'} className="underline">Log in</Link>
          </div>


        </div>
      </div>

    </div>
  );
}
