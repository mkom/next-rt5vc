import { Avatar, Dropdown, Button  } from "flowbite-react";
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { HiMenuAlt1 } from "react-icons/hi";


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
          <a href="/" className="flex items-center space-x-2">
            <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white">rt5vc</span>
            <span className="text-xs">v1</span>
          </a>
          </div>
          <div className="flex md:order-2">
            {session ?(
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
            ) : (
              <>
              <Button
                onClick={() => signIn('google')}
                className="justify-start "
                color="gray">
                <svg className="mr-2 h-5 w-5 eUuXwBkW5W4__eatjSfd RRXFBumaW2SHdseZaWm6 _gmxfZ2BpOHxa6nWwqBB" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_13183_10121)"><path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z" fill="#3F83F8"></path><path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z" fill="#34A853"></path><path d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z" fill="#FBBC04"></path><path d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z" fill="#EA4335"></path></g><defs><clipPath id="clip0_13183_10121"><rect width="20" height="20" fill="white" transform="translate(0.5)"></rect></clipPath></defs>
                </svg>
                Masuk
              </Button>
              </>
            )}
            
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