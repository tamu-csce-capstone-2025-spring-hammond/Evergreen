import Image from 'next/image';
import Navbar from './_components/navbar'
import Footer from './_components/footer'
import Hero from './hero';
import Body from './body';

export default function Home() {
  return (
    <div>
      <Navbar/>
      <main>
          <Hero/>
          <Body/>
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
