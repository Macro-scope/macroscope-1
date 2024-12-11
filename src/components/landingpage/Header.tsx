"use client";
import React, { useState } from "react";
import Image from "next/image";
import headerImage from "../../../public/header.png";
import rightArrow from "../../../public/right_arrow.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="container mx-auto w-full my-5 md:my-6 lg:mt-6 xl:mt-7 flex items-center justify-between px-4">
      {/* Logo Section */}
      <Image
        src={headerImage}
        alt="macroscope header image"
        className=" w-40 h-8 md:w-48 md:h-10 xl:w-64 xl:h-14"
      />

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        <a
          href="#"
          className="text-customGray text-base xl:text-xl font-medium hover:text-black font-sans"
        >
          Pricing
        </a>
        <a
          href="#"
          className="text-customGray text-base xl:text-xl font-medium hover:text-black font-sans"
        >
          Log in
        </a>
        <a
          href="#"
          className="flex gap-3 px-5 py-2.5 font-normal text-base xl:text-xl bg-black text-white rounded-full hover:bg-gray-800 font-serif"
        >
          Create A Map For Free{" "}
          <Image
            src={rightArrow}
            alt="rightArrow image"
            className="h-[22px] w-[22px] self-center"
          />
        </a>
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="focus:outline-none"
        >
          <span className="block w-6 h-1 bg-black mb-1"></span>
          <span className="block w-6 h-1 bg-black mb-1"></span>
          <span className="block w-6 h-1 bg-black"></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="absolute top-16 left-0 w-full bg-white shadow-md z-10">
          <a
            href="#"
            className="block px-6 py-2 text-customGray text-base font-medium  hover:bg-gray-100"
          >
            Pricing
          </a>
          <a
            href="#"
            className="block px-6 py-2 text-customGray text-base font-medium hover:bg-gray-100"
          >
            Log in
          </a>
          <a
            href="#"
            className="flex gap-3 w-fit px-6 py-2 font-normal text-base text-center bg-black text-white rounded-full mx-6 my-2 hover:bg-gray-800"
          >
            Create A Map For Free{" "}
            <Image src={rightArrow} alt=" rightArrowimage" />
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
