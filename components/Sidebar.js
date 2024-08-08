
import { useRouter } from 'next/router';
import { Sidebar } from "flowbite-react";
import { useSession } from 'next-auth/react';
import { IoIosHome } from "react-icons/io";
import { HiChartPie,HiDocumentReport,HiUser, HiViewBoards } from "react-icons/hi";

const SideMenu = ({ isOpen }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const { pathname } = router;

    const hasRole = (roles) => {
        if (session && session.user && session.user.role) {
            return roles.includes(session.user.role);
        }
        return false;
    };

    return (
        <Sidebar  className={`fixed top-0  z-40 w-64 h-screen pt-14 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 sm:translate-x-0 duration-300 ease-in-out dark:bg-gray-800 dark:border-gray-700`}>
        <Sidebar.Items >

            <Sidebar.ItemGroup>
            <Sidebar.Item href="/home" icon={IoIosHome}>
                Beranda
            </Sidebar.Item>
            <Sidebar.Item href="/cashflow" icon={HiViewBoards}>
                Arus Kas
            </Sidebar.Item>
            </Sidebar.ItemGroup>
            <Sidebar.ItemGroup>
            <Sidebar.Collapse 
                className={pathname === '/data-ipl' || pathname === '/outstanding' ? 'text-gray-900 bg-gray-100' : ''}
                icon={HiDocumentReport} 
                label="IPL">
                    <Sidebar.Item 
                    className={pathname === '/data-ipl' ? 'text-gray-900 bg-gray-100' : ''}
                    href="/data-ipl">Data IPL</Sidebar.Item>
                    <Sidebar.Item
                    className={pathname === '/outstanding' ? 'text-gray-900 bg-gray-100' : ''}
                    href="/outstanding">IPL Outstanding</Sidebar.Item>
                    <Sidebar.Item
                    className={pathname === '/tbd-ipl' ? 'text-gray-900 bg-gray-100' : ''}
                    href="/tbd-ipl">IPL TBD</Sidebar.Item>
            </Sidebar.Collapse>
              
            </Sidebar.ItemGroup>

            
            {hasRole(['admin', 'editor', 'superadmin']) && (
                <Sidebar.ItemGroup>
                <Sidebar.Item href="/dashboard/transactions" icon={HiChartPie}>
                    Admin Dashboard
                </Sidebar.Item>
                </Sidebar.ItemGroup>
            )}
            
        </Sidebar.Items>
        </Sidebar>
    );
}

export default SideMenu;