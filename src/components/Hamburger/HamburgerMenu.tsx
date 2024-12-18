"use client";

import React, { useState } from "react";

interface HamburgerMenuProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
    sidebarOpen,
    setSidebarOpen,
}) => {
    
    return (
        <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex flex-col items-center justify-center"
            >
            <span
                className={`bg-black block h-0.5 w-6 rounded-sm transition-all duration-300 ease-out ${
                sidebarOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
                }`}
            ></span>
            <span
                className={`bg-black block h-0.5 w-6 rounded-sm my-0.5 transition-all duration-300 ease-out ${
                sidebarOpen ? "opacity-0" : "opacity-100"
                }`}
            ></span>
            <span
                className={`bg-black block h-0.5 w-6 rounded-sm transition-all duration-300 ease-out ${
                sidebarOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
                }`}
            ></span>
        </button>
    )
}

export default HamburgerMenu;