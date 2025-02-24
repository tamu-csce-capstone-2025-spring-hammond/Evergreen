import Image from 'next/image';

export default function Body() {
    return (
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
                className='w-1/3 absolute -bottom-16 left-0 translate-y-1/3 opacity-70'
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
                <h2 className='text-everblue-400 font-ntwagner text-5xl max-xl:text-4xl whitespace-nowrap leading-[110%]'>Manage all of your <br /> Assets in One Place</h2>
                <p className="text-evergray-700 text-2xl max-xl:text-xl mt-6 leading-[175%]">Track, invest, and grow your assets anytime, anywhere. Take control of your financial future with an all-in-one platform. </p>
                <button id="footer-cta" type="button" className='text-xl cursor-pointer gap-1 flex items-center bg-everblue-200 py-3 px-5 rounded-lg mt-4 transition hover:-translate-y-0.5 hover:scale-102 hover:brightness-105 will-change-contents active:brightness-95 active:translate-y-0 active:scale-100 shadow-sm'>
                    Get Started
                </button>
            </div>
          </article>
      </section>
    );
  }