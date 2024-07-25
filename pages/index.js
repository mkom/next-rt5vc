import Image from "next/image";
import { Button } from "flowbite-react";
import { Inter } from "next/font/google";
import { HiOutlineArrowRight } from "react-icons/hi";
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

 // console.log(session)
  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  return (
    <main
      className={`flex min-h-screen m-auto max-w-xl flex-col justify-center gap-10  p-6 ${inter.className}`}
    >
      <div>
        <h1 className="max-w-md text-4xl font-extrabold leading-none text-gray-900 lg:text-5xl xl:text-6xl dark:text-white">
        <span className="block">Test</span>
        <span className="block text-cyan-700">05</span>
        <span className="block">TEst</span>
        </h1>
        
      </div>
      <p className="max-w-md text-lg leading-normal text-gray-500 lg:text-xl dark:text-gray-400">Flowbite React is an open-source UI component library built on top of Tailwind CSS with React components and based on the Flowbite Design System.</p>
      <Button
        onClick={() => signIn('google')}
       className="w-56 justify-start "
       color="gray">
        <svg className="mr-2 h-5 w-5 eUuXwBkW5W4__eatjSfd RRXFBumaW2SHdseZaWm6 _gmxfZ2BpOHxa6nWwqBB" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_13183_10121)"><path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z" fill="#3F83F8"></path><path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z" fill="#34A853"></path><path d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z" fill="#FBBC04"></path><path d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z" fill="#EA4335"></path></g><defs><clipPath id="clip0_13183_10121"><rect width="20" height="20" fill="white" transform="translate(0.5)"></rect></clipPath></defs>
        </svg>
        Masuk dengan Google
      </Button>
    </main>
  );
}
