"use client";
import Image from 'next/image';
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import { useState, useEffect } from 'react';

export default function Home() {
    const [scrollY, setScrollY] = useState(0);
    const [smoothScrollY, setSmoothScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const smoothScroll = () => {
            setSmoothScrollY(prev => prev + (scrollY - prev) * 0.15); // Smooth interpolation
            animationFrameId = requestAnimationFrame(smoothScroll);
        };

        animationFrameId = requestAnimationFrame(smoothScroll);

        return () => cancelAnimationFrame(animationFrameId);
    }, [scrollY]);
    
  return (
    <div>
      <Navbar/>
      <main>
      <section>
            <div className='flex flex-col items-center justify-center h-svh gap-y-2 relative z-1 -translate-y-1/15'>
                <h1 className="text-evergreen-200 font-ntwagner text-8xl font-bold">
                    Evergreen
                </h1>
                <p className='text-evergreen-200 text-xl'>
                    Money really does grow on trees.
                </p>
                <button id="hero-cta" type="button" className='text-evergray-700 cursor-pointer gap-1 flex items-center bg-evergreen-200 py-2 px-4 rounded-lg mt-4 transition hover:-translate-y-0.5 hover:scale-102 hover:brightness-105 will-change-contents active:brightness-95 active:translate-y-0 active:scale-100'>
                    <span className='font-medium text-xl whitespace-nowrap'>
                        Try Now
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className='size-5'>
                        <path d="M 15 50 L 95 50 M 65 20 L 95 50 L 65 80" fill="transparent" stroke="black" strokeWidth="8"/>
                    </svg>
                </button>
            </div>
            <div className='absolute top-0 w-full h-[115vh] -z-1'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className='w-0 h-0'>
                    <defs>
                        <clipPath id="bg-clip" clipPathUnits="objectBoundingBox">
                            <path d="M 0 0 L 0 1 Q 0.05 0.87, 0.5 0.87 T 1 1 L 1 0 Z"/>
                        </clipPath>
                    </defs>
                </svg>
                <div className='absolute w-full h-[115vh] -z-1 bg-everblue-800/75 [clip-path:url("#bg-clip")]'></div>
                <Image
                    src="/treesAerial.jpg"
                    alt="Aerial view of pine trees"
                    width={2250}
                    height={4000}
                    className='absolute w-full h-[115vh] object-cover object-[50%_15%] -z-2 [clip-path:url("#bg-clip")]'
                    style={{ objectPosition: `50% ${15 + smoothScrollY * 0.0125}%` }}
                />
                <Image
                    src="/decorBlue.svg"
                    alt="decor"
                    width={239}
                    height={37}
                    className='rotate-x-180 absolute top-[89%] left-1/2 -translate-x-1/2 scale-90'
                />
            </div>
      </section>
      <section className='overflow-hidden relative'>
          <article className="flex justify-between pt-[5vh] px-[min(5rem,_7vw)] relative">
            <div className='p-8 -rotate-5'>
                <h2 className='text-everblue-400 font-ntwagner text-5xl max-xl:text-4xl whitespace-nowrap leading-[110%]'>Lifecycle Investing <br /> Automated by You</h2>
                <p className="text-evergray-700 text-2xl max-xl:text-xl mt-6 leading-[175%]">Your wealth, your rules. Set up your investments and automation settings and spend the rest of your life worry-free knowing your investments will profit.</p>
            </div>
            <Image
                src="chartAnimation.svg"
                alt="A snapshot of a chart on the user dashboard."
                width={1512}
                height={935}
                className='w-67/100'
            />
            <Image
                src="stonksAnimation.svg"
                alt=""
                width={813}
                height={551}
                className='w-1/3 absolute -bottom-16 left-0 translate-y-1/3 opacity-75'
            />
          </article>
          <article className="flex mt-[9%] px-[min(5rem,_7vw)] gap-[min(5rem,_7vw)]">
            <Image
                src="portfoliosAnimation.svg"
                alt=""
                width={881}
                height={589}
                className='w-11/20'
            />
            <div className='p-8 rotate-4'>
                <h2 className='text-everblue-400 font-ntwagner text-5xl max-xl:text-4xl whitespace-nowrap leading-[110%]'>Manage All of Your <br /> Assets in One Place</h2>
                <p className="text-evergray-700 text-2xl max-xl:text-xl mt-6 leading-[175%]">Track, invest, and grow your assets anytime, anywhere. Take control of your financial future with an all-in-one platform. </p>
                <button id="footer-cta" type="button" className='text-evergray-700 text-xl cursor-pointer gap-1 flex items-center bg-everblue-100 py-3 px-5 rounded-lg mt-6 transition hover:-translate-y-0.5 hover:scale-102 hover:brightness-105 will-change-contents active:brightness-95 active:translate-y-0 active:scale-100 shadow-sm'>
                    Get Started
                </button>
            </div>
          </article>
      </section>
      </main>
      <div className='relative'>
      	<Footer/>
	      <Image
	            src="/treesFooter.png"
	            alt=""
	            width={1920}
	            height={1239}
	            className='w-full absolute bottom-0 -z-3 opacity-95'
	        />
      </div>
    </div>
  );
}
