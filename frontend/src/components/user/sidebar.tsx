"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'
import Link from 'next/link';
import Image from 'next/image';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState("");
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

    useEffect(() => {
        if(localStorage.theme === "dark") {
            setTheme("dark");
            document.documentElement.classList.add("dark");
        }
        else {
            setTheme("light");
            document.documentElement.classList.remove("dark");
        }
    }, []);

  function toggleDarkMode () {
    document.documentElement.classList.toggle("dark");
    if(localStorage.theme === "dark") {
        localStorage.theme = "light";
        setTheme("light");
    }
    else {
        localStorage.theme = "dark";
        setTheme("dark");
    }
  }

  return (
    <div
      className={`sidebar p-6 flex flex-col justify-between h-screen border-r-2 border-evergray-200 dark:border-evergray-500 transition-all duration-300 [interpolate-size:allow-keywords] ${
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
              { href: "/user", icon: "search", text: "Dashboard", cursor: "pointer" },
              { href: "/user/portfolios", icon: "savings", text: "Portfolios", cursor: "pointer" },
              // { href: "/user/backtesting", icon: "bar_chart", text: "Backtesting", cursor: "not-allowed" },
              // { href: "/user/explore", icon: "explore", text: "Explore", cursor: "not-allowed" },
            ].map(({ href, icon, text, cursor }) => (
                <li key={text} className={`rounded-xl ${cursor==="not-allowed" ? "cursor-not-allowed" : "dark:hover:bg-evergreen-600/35 hover:bg-evergreen-200 transition"}`}>
                <Link
                  href={href}
                  className={`flex items-center gap-2 p-2 rounded-xl ${
                    isActive(href)
                      ? "bg-evergreen-500 dark:bg-evergreen-500 text-evergray-100"
                      : "text-evergray-700 dark:text-evergray-100"
                  } ${
                    cursor==="not-allowed" ? "pointer-events-none" : "cursor-pointer"
                  }`}>
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
              // { href: "/user", icon: "account_circle", text: "Profile", cursor: "not-allowed" },
              // { href: "/user", icon: "settings", text: "Settings", cursor: "not-allowed" },
              { href: "/", icon: "logout", text: "Logout", cursor: "pointer" },
            ].map(({ href, icon, text, cursor }) => (
              <li key={text} className={`rounded-xl ${cursor==="not-allowed" ? "cursor-not-allowed" : "dark:hover:bg-evergreen-600/35 hover:bg-evergreen-200 transition"}`}>
                <Link href={href} className={`flex items-center gap-2 p-2 rounded-xl ${cursor==="not-allowed" ? "pointer-events-none" : "cursor-pointer"}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                  <span
                    className={`transition-[opacity,_width] whitespace-nowrap text-lg duration-300 ${
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
          <li className='hover:bg-evergreen-200 dark:hover:bg-evergreen-600/35 transition rounded-xl'>
            <button type="button" className="flex text-lg items-center gap-3 p-2 w-full cursor-pointer" onClick={toggleDarkMode}>
                {theme === "dark" ? (
                    <span className="material-symbols-outlined">light_mode</span>
                ) : (
                    <span className="material-symbols-outlined">dark_mode</span>
                )}
              <span
                className={`transition-all whitespace-nowrap duration-300 ${
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                }`}
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </li>
          <li className='hover:bg-evergreen-200 dark:hover:bg-evergreen-600/35 transition rounded-xl'>
            <button
              type="button"
              className="flex items-center gap-3 p-2 w-full cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
            {isCollapsed ? (
                <span className="material-symbols-outlined">keyboard_tab</span>
            ) : (
                <span className="material-symbols-outlined">keyboard_tab_rtl</span>
            )}
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
