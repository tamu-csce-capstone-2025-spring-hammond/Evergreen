"use client";

import Navbar from "../../components/navbar";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useJwtStore from "@/store/jwtStore";

export default function Login() {
  const router = useRouter();
  const { setToken } = useJwtStore();
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);


  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // here is the token
      setToken(data["access_token"]);

      router.push("/user");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Background Image */}
      <div className="absolute top-0 w-full h-full -z-1">
        <div className="absolute w-full h-full z-[-1] bg-[rgba(12,14,15,0.6)] [clip-path:url('#bg-clip')]"></div>
        <Image
          src="/treesMist.jpg"
          alt="Forest with mist"
          layout="fill"
          objectFit="cover"
          className="absolute w-full h-full object-cover object-[50%_15%] -z-2 [clip-path:url('#bg-clip')]"
          priority
        />
      </div>

      {/* Login Box */}
      <div className="absolute flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-44/100 text-white">
        {/* Actual Box */}
        <div className="relative opacity-30">
          <div className="w-[560px] h-[600px] rounded-[70px] bg-gradient-to-b from-[#D4D4D4] to-[#737373]"></div>
        </div>

        {/* Content inside the box */}
        <div className="absolute w-[633px] h-[622px] rounded-[70px] flex flex-col justify-center items-center z-10">
          {/* Decor Image */}
          <div className="flex justify-center mb-4">
            <Image
              src="/decorWhite.svg"
              alt="Decorative"
              width={239}
              height={36.5}
            />
          </div>

          {/* Header */}
          <h2 className="text-center text-[52px] font-bold mb-6 font-ntwagner">
            Welcome Back!
          </h2>

          {/* Login Form */}
          <form
            className="space-y-6 w-full flex flex-col items-center"
            onSubmit={handleSubmit}
          >
            {/* Email Input */}
            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-5 py-3">
                <span className="pr-2">
                  <Image
                    src={"/loginSignup/emailIcon.svg"}
                    alt="Email Icon"
                    width={30}
                    height={30}
                  />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="bg-transparent w-full focus:outline-none placeholder-white text-white"
                  value={loginData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="w-[70%] max-w-[550px] relative">
                {error && <span className={`absolute top-1/1 translate-y-1 left-[2px] text-red-400`}>Invalid password</span>}
              <div className={`flex items-center border-2 border-white rounded-[75px] px-5 py-3 ${error ? "!border-red-400" : ""}`}>
                <span className="pr-2">
                  <Image
                    src={"/loginSignup/passwordIcon.svg"}
                    alt="Password Icon"
                    width={30}
                    height={30}
                  />
                </span>
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="bg-transparent w-full focus:outline-none placeholder-white text-white"
                  value={loginData.password}
                  onChange={handleChange}
                  required
                />
                {passwordVisible ? (
                    <span className="material-symbols-outlined cursor-pointer" onClick={() => setPasswordVisible(false)}>visibility_off</span>
                ) : (
                    <span className="material-symbols-outlined cursor-pointer" onClick={() => setPasswordVisible(true)}>visibility</span>
                )}
              </div>
            </div>


            {/* Login Button */}
            <button
              type="submit"
              className="w-[70%] max-w-[550px] bg-evergray-100 py-3 mt-8 rounded-[75px] transition text-black hover:bg-evergray-300 cursor-pointer"
            >
              Login
            </button>
          </form>

          {/* Dont have account */}
          <div className="pt-5">
            Don't have an account?{" "}
            <Link href={"/signup"} className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
