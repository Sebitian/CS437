import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HamburgerMenu from '../Hamburger/HamburgerMenu';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}



const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header
      className='sticky top-0 z-50 flex items-center justify-between bg-white p-4 shadow-md'
    >
       <div className='flex items-center gap-2 sm:gap-4'>
        
      </div>
    </header>
  );
};

export default Header;