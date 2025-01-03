'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import rightArrow from '../../../public/right_arrow.png';
import MarketMap from '../../../public/MarketMap.png';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const Hero = () => {
  const router = useRouter();

  const handleCreateMap = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };
  useEffect(() => {
    handleCreateMap();
  }, [router]);
  return (
    <section className="pt-24 pb-7 ">
      <div className="container px-8 mx-auto text-center max-w-7xl">
        <h2 className="text-4xl font-sans mx-4 md:mx-7 xl:mx-52 2xl:mx-44 max-w-5xl sm:text-5xl lg:text-[64px] !leading-none font-medium text-customGray mb-5">
          Build authority in your niche with{' '}
          <span className="font-['Playfair_Display'] italic text-[#000000] font-bold">
            Interactive Market Map.
          </span>
        </h2>
        <p className="font-sans text-base font-medium text-[#464646] sm:text-base max-w-[600px] justify-self-center">
          Macroscope helps you easily create interactive and insightful market
          maps that get attention, drive traffic, engage audience and boost
          shares.
        </p>
        <button
          onClick={handleCreateMap}
          className="justify-self-center flex gap-3 w-fit px-5 py-2.5 font-normal text-xl text-center bg-black text-white rounded-full mt-10 my-2 hover:bg-gray-800"
        >
          Create A Map For Free{' '}
          <Image src={rightArrow} alt="rightArrowimage" className="w-7 h-7" />
        </button>
        <div className="mb-[27px] mt-[92px]">
          <Image src={MarketMap} alt="MarketMap" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
