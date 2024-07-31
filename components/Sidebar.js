import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Sidebar } from "flowbite-react";
import { BiBuoy } from "react-icons/bi";
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";
import { useSession } from 'next-auth/react';
import { IoIosHome } from "react-icons/io";

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

            {hasRole(['admin', 'editor', 'superadmin','user']) && (
                <Sidebar.ItemGroup>
                <Sidebar.Item href="/home" icon={IoIosHome}>
                    Beranda
                </Sidebar.Item>
                </Sidebar.ItemGroup>
            )}

            <Sidebar.ItemGroup>
            {/* <Sidebar.Item href="#" icon={HiChartPie}>
                Upgrade to Pro
            </Sidebar.Item> */}
            <Sidebar.Item href="/data-ipl" 
            icon={HiChartPie}
            className={pathname === '/data-ipl' ? 'text-gray-900 bg-gray-100' : ''}>
                Data IPL
            </Sidebar.Item>
            {/* <Sidebar.Item href="#" icon={HiViewBoards}>
                Dokumen
            </Sidebar.Item> */}
{/*             
            <Sidebar.Item href="#" icon={BiBuoy}>
                Help
            </Sidebar.Item> */}
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