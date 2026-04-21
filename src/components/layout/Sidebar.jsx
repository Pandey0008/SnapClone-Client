import { NavLink } from "react-router-dom";

const Sidebar = () => {

  return (

    <aside className="hidden md:flex flex-col w-64 bg-white/5 border-r border-white/10">

      {/* Logo */}
      <div className="text-2xl font-semibold px-6 py-5">
        SnapClone
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-3">

        <NavLink
          to="/stories"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl transition-all ${
              isActive
                ? "bg-yellow-400 text-black"
                : "hover:bg-white/5"
            }`
          }
        >
          Stories
        </NavLink>


        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl transition-all ${
              isActive
                ? "bg-yellow-400 text-black"
                : "hover:bg-white/5"
            }`
          }
        >
          Chat
        </NavLink>


        <NavLink
          to="/friends"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl transition-all ${
              isActive
                ? "bg-yellow-400 text-black"
                : "hover:bg-white/5"
            }`
          }
        >
          Friends
        </NavLink>


        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl transition-all ${
              isActive
                ? "bg-yellow-400 text-black"
                : "hover:bg-white/5"
            }`
          }
        >
          Profile
        </NavLink>

      </nav>

    </aside>

  );

};

export default Sidebar;