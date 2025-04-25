"use client";

import Navbar from "../../components/navbar";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useJwtStore from "@/store/jwtStore";

export default function Signup() {
  const router = useRouter();
  const { setToken } = useJwtStore();

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          user_name: signupData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // here is the token
      setToken(data["access_token"]);

      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="absolute top-0 w-full h-full -z-1">
        <div className="absolute w-full h-full z-[-1] bg-[rgba(12,14,15,0.6)] [clip-path:url('#bg-clip')]" />
        <Image
          src="/treesMist.jpg"
          alt="Forest with mist"
          layout="fill"
          objectFit="cover"
          className="absolute w-full h-full object-cover object-[50%_15%] -z-2 [clip-path:url('#bg-clip')]"
          priority
        />
      </div>

      <div className="absolute flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-46/100 text-white">
        <div className="relative opacity-30">
          <div className="w-[560px] h-[640px] rounded-[70px] bg-gradient-to-b from-[#D4D4D4] to-[#737373]" />
        </div>

        <div className="absolute w-[633px] h-[622px] rounded-[70px] flex flex-col justify-center items-center z-10">
          <div className="flex justify-center mb-4">
            <Image
              src="/decorWhite.svg"
              alt="Decorative"
              width={239}
              height={36.5}
              priority
            />
          </div>

          <h2 className="text-center text-[52px] font-bold mb-4 font-ntwagner">
            Create Account
          </h2>

          <form
            className="space-y-5 w-full flex flex-col items-center"
            onSubmit={handleSubmit}
          >
            {error && <p className="text-red-500">{error}</p>}

            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-5 py-3">
                <span className="pr-2">
                  <Image
                    src="/loginSignup/nameIcon.svg"
                    alt="Name Icon"
                    width={30}
                    height={30}
                    priority
                  />
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="bg-transparent w-full focus:outline-none placeholder-white"
                  value={signupData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-5 py-3">
                <span className="pr-2">
                  <Image
                    src="/loginSignup/emailIcon.svg"
                    alt="Email Icon"
                    width={30}
                    height={30}
                    priority
                  />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="bg-transparent w-full focus:outline-none placeholder-white"
                  value={signupData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-5 py-3">
                <span className="pr-2">
                  <Image
                    src="/loginSignup/passwordIcon.svg"
                    alt="Password Icon"
                    width={30}
                    height={30}
                    priority
                  />
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="bg-transparent w-full focus:outline-none placeholder-white"
                  value={signupData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="w-[70%] max-w-[550px]">
              <div className="flex items-center border-2 border-white rounded-[75px] px-5 py-3">
                <span className="pr-2">
                  <Image
                    src="/loginSignup/confirmPasswordIcon.svg"
                    alt="Confirm Password Icon"
                    width={30}
                    height={30}
                    priority
                  />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="bg-transparent w-full focus:outline-none placeholder-white"
                  value={signupData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-[70%] max-w-[550px] bg-evergray-100 py-3 rounded-[75px] transition text-black hover:bg-evergray-300 cursor-pointer"
            >
              Sign Up
            </button>
          </form>

          <div className="pt-5">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
