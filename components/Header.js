import { Avatar, Dropdown, Button  } from "flowbite-react";
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { HiMenuAlt1 } from "react-icons/hi";
import { Drawer } from "flowbite-react";

import { SideMenu } from "./Sidebar";

const Header = ({ toggleSidebar }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    if (session) {
      setUserImage(session.user.image);
      setUserName(session.user.name);
      setUserEmail(session.user.email);
    }
   
  }, [session, status, router]);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 border-b border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent" >
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-2">
          <div className="flex justify-center flex-wrap items-center">
          <HiMenuAlt1 onClick={toggleSidebar} className="h-9 w-9 cursor-pointer mr-3 sm:hidden" />
          {/* <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" /> */}
          
          <a href="/home" className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white">rt5vc</span>
          </a>
          </div>
          <div className="flex md:order-2">
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar alt="User settings" img={userImage} rounded />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">{userName}</span>
                <span className="block truncate text-sm font-medium">{userEmail}</span>
              </Dropdown.Header>
              
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => signOut({ callbackUrl: '/' })}>Sign out</Dropdown.Item>
            </Dropdown>
          </div>

        </div>
      </nav >
      
      {/* <SideMenu/> */}
      {/* <Drawer open={isOpen} onClose={handleClose}>
        <SideMenu/>
      </Drawer> */}
    </>
   
    
  );
}
export default Header;