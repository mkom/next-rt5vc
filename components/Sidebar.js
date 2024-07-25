import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Sidebar } from "flowbite-react";
import { BiBuoy } from "react-icons/bi";
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";
import { useSession } from 'next-auth/react';

const SideMenu = ({ isOpen }) => {
    const { data: session } = useSession();
    const hasRole = (roles) => {
        if (session && session.user && session.user.role) {
            return roles.includes(session.user.role);
        }
        return false;
    };

    return (
        <Sidebar  className={`fixed top-0  z-40 w-64 h-screen pt-14 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 sm:translate-x-0 duration-300 ease-in-out dark:bg-gray-800 dark:border-gray-700`}>
        <Sidebar.Items >
            
            {hasRole(['admin', 'editor']) && (
                <Sidebar.ItemGroup>
                <Sidebar.Item href="/dashboard" icon={HiChartPie}>
                    Admin Dashboard
                </Sidebar.Item>
                </Sidebar.ItemGroup>
            )}
            
            {/* <Sidebar.Item href="#" icon={HiViewBoards}>
                Kanban
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiInbox}>
                Inbox
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiUser}>
                Users
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiShoppingBag}>
                Products
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiArrowSmRight}>
                Sign In
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiTable}>
                Sign Up
            </Sidebar.Item> */}
           

            <Sidebar.ItemGroup>
            <Sidebar.Item href="#" icon={HiChartPie}>
                Upgrade to Pro
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiViewBoards}>
                Documentation
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