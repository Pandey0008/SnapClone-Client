import { useAppSelector } from "../../redux/hooks";

const Topbar = () => {

  const { user } = useAppSelector(state => state.auth);

  return (

    <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between px-6">

      <div className="text-lg font-semibold">
        Welcome back 👋
      </div>

      <div className="text-sm text-white/70">

        {user?.displayName}

      </div>

    </header>

  );

};

export default Topbar;