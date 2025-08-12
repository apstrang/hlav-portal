import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import Button from "./Button";

const Navbar = () => {
  return (
    <>
      <div className="w-full h-20 bg-foreground text-foreground shadow-md border-b border-border px-6 py-3 sticky top-0">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <Logo />
            <ul className="hidden md:flex gap-x-6 text-white">
              <li>
                <Link href="/calendar">
                  <p>Calendar</p>
                </Link>
              </li>
              <li>
                <Link href="/rms">
                  <p>RMS</p>
                </Link>
              </li>
              <li>
                <Link href="/tasks">
                  <p>Tasks</p>
                </Link>
              </li>
            </ul>
            <Button />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar