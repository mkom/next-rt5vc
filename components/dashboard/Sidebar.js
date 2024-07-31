import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Sidebar } from "flowbite-react";
import { BiBuoy } from "react-icons/bi";
import { HiArrowSmRight, HiChartPie, HiInbox,HiDocumentReport , HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";
import { GrTransaction } from "react-icons/gr";
import { TbReport } from "react-icons/tb";
import { IoIosHome } from "react-icons/io";
import { useSession } from 'next-auth/react';

const SideMenu = ({ isOpen }) => {
    const router = useRouter();
    const { pathname } = router;

    const { data: session } = useSession();
    const hasRole = (roles) => {
        if (session && session.user && session.user.role) {
            return roles.includes(session.user.role);
        }
        return false;
    };

    return (
        <Sidebar  className={`fixed top-0  z-30 w-64 h-screen pt-14 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 sm:translate-x-0 duration-300 ease-in-out dark:bg-gray-800 dark:border-gray-700`}>
        <Sidebar.Items >
            <Sidebar.ItemGroup>
            <Sidebar.Item href="/" 
            icon={HiChartPie}
            className={pathname === '/' ? 'text-gray-900 bg-gray-100' : ''}>
                Beranda
            </Sidebar.Item>
            <Sidebar.Item
             href="/dashboard/transactions" 
             icon={GrTransaction}
             className={pathname === '/dashboard/transactions' ? 'text-gray-900 bg-gray-100' : ''}
             >
                Transaksi
            </Sidebar.Item>
            <Sidebar.Collapse icon={HiDocumentReport} label="Laporan">
                <Sidebar.Item href="#">Rekap</Sidebar.Item>
                <Sidebar.Item href="#">Data IPL</Sidebar.Item>
                <Sidebar.Item href="#">Outstanding</Sidebar.Item>
            </Sidebar.Collapse>
            <Sidebar.Item 
            href="/dashboard/houses" 
            icon={IoIosHome}
            className={pathname === '/dashboard/houses' ? 'text-gray-900 bg-gray-100' : ''}>
                Rumah
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiViewBoards}>
                Dokumen
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiUser}>
                Users
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={BiBuoy}>
                Help
            </Sidebar.Item>
            </Sidebar.ItemGroup>
        </Sidebar.Items>
        </Sidebar>
    );
}

export default SideMenu;