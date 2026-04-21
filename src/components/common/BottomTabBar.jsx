import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Camera, Compass, User } from 'lucide-react';

const tabs = [
  { name: 'chat', label: 'Chat', icon: MessageCircle, path: '/chat' },
  { name: 'discover', label: 'Discover', icon: Compass, path: '/discover' },
  { name: 'camera', label: '', icon: Camera, path: '/camera' }, // Big center button
  { name: 'stories', label: 'Stories', icon: Home, path: '/stories' },
  { name: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-snap-darkMid border-t border-white/10 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
                          (tab.name === 'camera' && location.pathname === '/camera');

          if (tab.name === 'camera') {
            return (
              <div
                key={tab.name}
                onClick={() => navigate(tab.path)}
                className="relative -top-8 flex flex-col items-center cursor-pointer active:scale-95 transition"
              >
                <div className="w-16 h-16 bg-snap-yellow rounded-3xl flex items-center justify-center shadow-2xl shadow-snap-yellow/50">
                  <tab.icon size={32} className="text-white" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center py-3 px-4 cursor-pointer transition ${isActive ? 'text-snap-yellow' : 'text-snap-white50'}`}
            >
              <tab.icon size={26} />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;