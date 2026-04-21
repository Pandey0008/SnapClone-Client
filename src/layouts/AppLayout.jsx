import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const AppLayout = ({ children }) => {

  return (

    <div className="flex h-screen bg-[#0F0F0F] text-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top Header */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8">

          {children}

        </main>

      </div>

    </div>

  );

};

export default AppLayout;