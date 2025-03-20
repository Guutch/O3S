import { Link } from "react-router-dom";
import { HomeIcon, FolderIcon, UsersIcon, ChatBubbleLeftIcon, CogIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

function Sidebar() {
  return (
    <div className="w-16 bg-white shadow-md h-screen flex flex-col items-center p-3 space-y-6">
      {/* Logo Placeholder */}
      <div className="h-12 w-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
        O3S
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-6">
        <Link to="/" className="group flex flex-col items-center text-gray-500 hover:text-blue-500">
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Home</span>
        </Link>

        <Link to="/campaigns" className="group flex flex-col items-center text-gray-500 hover:text-blue-500">
          <FolderIcon className="h-6 w-6" />
          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Campaigns</span>
        </Link>

        {/* <Link to="/leads" className="group flex flex-col items-center text-gray-500 hover:text-blue-500">
          <UsersIcon className="h-6 w-6" />
          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Leads</span>
        </Link> */}

        <Link to="/social-media" className="group flex flex-col items-center text-gray-500 hover:text-blue-500">
          <GlobeAltIcon className="h-6 w-6" />
          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Socials</span>
        </Link>

        <Link to="/unibox" className="group flex flex-col items-center text-gray-500 hover:text-blue-500">
          <ChatBubbleLeftIcon className="h-6 w-6" />
          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Unibox</span>
        </Link>

        <Link to="/crm" className="group flex flex-col items-center text-gray-500 hover:text-blue-500">
          <UsersIcon className="h-6 w-6" />
          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">CRM</span>
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
