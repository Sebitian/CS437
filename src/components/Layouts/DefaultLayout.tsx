"use client";
import React, { useState, ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from '@/components/Sidebar/Sidebar'
import Navbar from '@/components/Navbar/Navbar'
import Charts from '@/components/Charts/Charts'

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    
    <>
    <div className="flex">
    <Sidebar/>
    <main className="flex-grow ml-64 relative">
      <Navbar />
      <Charts/>
    </main>
    </div>
    </>
  
  );
}
