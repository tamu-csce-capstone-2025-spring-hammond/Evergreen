import Image from 'next/image'
import Navbar from './_components/navbar'
import Footer from './_components/footer'

export default function Home() {
  return (
    <div>
      <Navbar></Navbar>
      <main>
        <section>
            <div className='flex flex-col items-center justify-center h-svh -translate-y-[1.5%] gap-y-2'>
                <h1 className="text-evergreen-200 font-ntwagner text-8xl font-bold">
                    Evergreen
                </h1>
                <p className='text-evergreen-200 text-xl'>
                    Money really does grow on trees.
                </p>
                <button id="hero-cta" type="button" className='cursor-pointer gap-1 flex items-center bg-evergreen-200 py-2 px-4 rounded-lg mt-4 transition hover:-translate-y-0.5 hover:scale-102 hover:brightness-105 will-change-contents active:brightness-95 active:translate-y-0 active:scale-100'>
                    <span className='font-medium text-xl whitespace-nowrap'>
                        Try Now
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className='size-5'>
                        <path d="M 15 50 L 95 50 M 65 20 L 95 50 L 65 80" fill="transparent" stroke="black" strokeWidth="8"/>
                    </svg>
                </button>
            </div>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className='w-0 h-0'>
                    <defs>
                        <clipPath id="bg-clip" clipPathUnits="objectBoundingBox">
                            <path d="M 0 0 L 0 1 Q 0.05 0.87, 0.5 0.87 T 1 1 L 1 0 Z"/>
                        </clipPath>
                    </defs>
                </svg>
                <div className='absolute top-0 w-full h-[115vh] -z-1 bg-everblue-800/75 [clip-path:url("#bg-clip")]'></div>
                <Image
                    src="/treesAerial.jpg"
                    alt="Aerial view of pine trees"
                    width={2250}
                    height={4000}
                    className='absolute w-full h-[115vh] object-cover object-[50%_15%] top-0 -z-2 [clip-path:url("#bg-clip")]'
                />
            </div>
        </section>
      </main>
      <Footer></Footer>
    </div>
  );
}
