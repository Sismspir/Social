import React from "react";
import { AiOutlineMenu as Menu } from 'react-icons/Ai';
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const navigate = useNavigate();

  const goPosts = () => {
    navigate("/posts");
  }
  return (
    <>
      <nav className="relative flex flex-wrap items-center justify-between px-2 py-3 bg-[#30727a] mb-3">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <a
              className="text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-white"
              href="/home"
            >
              This is twitter but better
            </a>
            <button
              className="text-white cursor-pointer text-xl leading-none px-3 py-1 border border-solid rounded block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <Menu />
            </button>
          </div>
          <div
            className={`lg:flex flex-grow items-center ${navbarOpen ? 'flex' : 'hidden'}`}
          >
            <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
              <li >
                <a
                  className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:border-b-2 hover:border-yellow-500"
                  href="/myprofile"
                >
                <span className="ml-2">My Profile</span>
                </a>
              </li>
              <li>
                <a
                  className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:border-b-2 hover:border-yellow-500"
                  href="/home"
                >
                <span onClick={goPosts}className="ml-2">Posts</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:border-b-2 hover:border-yellow-500"
                  href="/followers"
                >
                <span className="ml-2">Followers</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}