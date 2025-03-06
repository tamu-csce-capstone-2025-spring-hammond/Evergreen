"use client";
import { useState } from 'react';
import { usePathname } from 'next/navigation'
import Link from 'next/link';
import Image from 'next/image';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={`p-6 flex flex-col justify-between h-screen border-r-2 border-evergray-200 dark:border-evergray-500 transition-all duration-300 [interpolate-size:allow-keywords] ${
        isCollapsed ? "w-23" : "w-fit"}`}
    >
      <div>
        {/* Logo Section */}
        <div className={`flex items-center gap-2 transition-all duration-300 ${isCollapsed ? "translate-x-1" : ""}`}>
          <Image
            src="/logo-solid.png"
            alt="Evergreen Logo"
            width={314}
            height={318}
            className="size-8 inline dark:brightness-175"
          />
          <h1
            className={`dark:brightness-175 text-2xl font-bold text-evergreen-600 font-ntwagner translate-y-1 transition-all duration-300 ${
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Evergreen
          </h1>
        </div>

        <hr className="my-6 border-evergray-400" />

        {/* Menu Section */}
        <div className={`relative transition-all duration-300  ${ isCollapsed ? "" : "pt-6"}`}>
          <h3
            className={`absolute -top-2 text-evergray-400 transition-all duration-300 ${
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Menu
          </h3>
          <ul className="space-y-2">
            {[
              { href: "/user", icon: "search", text: "Dashboard" },
              { href: "/user/portfolios", icon: "savings", text: "Portfolios" },
              { href: "/user/backtesting", icon: "bar_chart", text: "Backtesting" },
              { href: "/user/explore", icon: "explore", text: "Explore" },
            ].map(({ href, icon, text }) => (
              <li key={text}>
                <Link
                  href={href}
                  className={`flex items-center gap-2 p-2 rounded-xl ${
                    isActive(href)
                      ? "bg-evergreen-500 text-evergray-100" // Active link styles
                      : "text-evergray-700 dark:text-evergray-100"
                  }`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  <span
                    className={`transition-all whitespace-nowrap text-lg duration-300 ${
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    }`}
                  >
                    {text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <hr className="my-6 border-evergray-400" />

        {/* Account Section */}
        <div className={`relative transition-all duration-300  ${ isCollapsed ? "" : "pt-6"}`}>
          <h3
            className={`absolute -top-2 text-evergray-400 transition-all duration-300 ${
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Account
          </h3>
          <ul className="space-y-2">
            {[
              { href: "/user", icon: "account_circle", text: "Profile" },
              { href: "/user", icon: "settings", text: "Settings" },
              { href: "/", icon: "logout", text: "Logout" },
            ].map(({ href, icon, text }) => (
              <li key={text}>
                <Link href={href} className="flex items-center gap-2 p-2 rounded-xl">
                  <span className="material-symbols-outlined">{icon}</span>
                  <span
                    className={`transition-all whitespace-nowrap text-lg duration-300 ${
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    }`}
                  >
                    {text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Buttons */}
      <div>
        <ul className="space-y-2">
          <li>
            <button type="button" className="flex text-lg items-center gap-3 p-2 w-full cursor-pointer">
              <span className="material-symbols-outlined">dark_mode</span>
              <span
                className={`transition-all whitespace-nowrap duration-300 ${
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                }`}
              >
                Dark Mode
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex items-center gap-3 p-2 w-full cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <span className="material-symbols-outlined">
                keyboard_tab{isCollapsed ? '' : '_rtl'}
              </span>
              <span
                className={`transition-all whitespace-nowrap text-lg duration-300 ${
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                }`}
              >
                Collapse
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
