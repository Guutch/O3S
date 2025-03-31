import { Link } from "react-router-dom";
import {
  HomeIcon,
  FolderIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  GlobeAltIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

function Sidebar({ onLogout }) {
  return (
    <div className="w-16 bg-white shadow-md h-screen flex flex-col justify-between items-center p-3">
      {/* Group logo and nav in one container */}
      <div className="flex flex-col items-center space-y-6">
        {/* Logo */}
        <div className="h-12 w-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
          O3S
        </div>
        {/* Navigation */}
        <nav className="flex flex-col items-center space-y-6">
          <Link
            to="/"
            className="group flex flex-col items-center text-gray-500 hover:text-blue-500"
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Home
            </span>
          </Link>
          <Link
            to="/campaigns"
            className="group flex flex-col items-center text-gray-500 hover:text-blue-500"
          >
            <FolderIcon className="h-6 w-6" />
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Campaigns
            </span>
          </Link>
          <Link
            to="/social-media"
            className="group flex flex-col items-center text-gray-500 hover:text-blue-500"
          >
            <GlobeAltIcon className="h-6 w-6" />
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Socials
            </span>
          </Link>
          <Link
            to="/unibox"
            className="group flex flex-col items-center text-gray-500 hover:text-blue-500"
          >
            <ChatBubbleLeftIcon className="h-6 w-6" />
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Unibox
            </span>
          </Link>
          <Link
            to="/crm"
            className="group flex flex-col items-center text-gray-500 hover:text-blue-500"
          >
            <UsersIcon className="h-6 w-6" />
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              CRM
            </span>
          </Link>
        </nav>
      </div>
      {/* Logout Icon */}
      <div
        onClick={onLogout}
        className="group flex flex-col items-center text-gray-500 hover:text-red-500 cursor-pointer"
      >
        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Logout
        </span>
      </div>
    </div>
  );
}

export default Sidebar;
