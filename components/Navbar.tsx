"use client";

import Link from "next/link";
import Image from "next/image";
import Navitems from "./Navitems";
import { SignInButton, UserButton, Show } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <Image src="/images/logo.svg" alt="logo" width={46} height={44} />
        </div>
      </Link>
      <div className="flex items-center gap-8">
        <Navitems />
        <Show when="signed-out">
          <SignInButton>
            <button className="btn-signin cursor-pointer">Sign In</button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </nav>
  );
};

export default Navbar;
