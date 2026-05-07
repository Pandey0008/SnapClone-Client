import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { clearCredentials } from "../redux/slices/authSlice";

import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";

import {
  Settings,
  LogOut,
  Edit3,
  Users,
  Award,
  Camera,
  MapPin,
  Ghost
} from "lucide-react";

const Profile = () => {

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);

  const [showEditSheet, setShowEditSheet] = useState(false);


  const token =
    JSON.parse(localStorage.getItem("authData"))?.accessToken;


  const handleLogout = () => {

    dispatch(clearCredentials());
    navigate("/login", { replace: true });

  };


  /*
  =========================
  TOGGLE GHOST MODE
  =========================
  */

  const toggleGhostMode = async () => {

    try {

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${apiUrl}/api/v1/location/location-visibility`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            locationVisibility:
              user?.locationVisibility === "ghost"
                ? "friends"
                : "ghost"
          })
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const updatedUser = await res.json();

      alert(
        updatedUser.locationVisibility === "ghost"
          ? "Ghost Mode Enabled 👻"
          : "Location sharing enabled 📍"
      );

    }

    catch (error) {

      console.error("Ghost mode error:", error);

    }

  };


  /*
  =========================
  PROFILE STATS
  =========================
  */

  const stats = [

    {
      label: "Friends",
      value: "248",
      icon: <Users size={22} />
    },

    {
      label: "Snap Score",
      value: user?.snapScore || "12,450",
      icon: <Award size={22} />
    },

    {
      label: "Stories",
      value: "47",
      icon: <Camera size={22} />
    }

  ];


  return (

    <div className="min-h-screen bg-snap-dark pb-20">


      {/* HEADER */}

      <div className="bg-snap-darkMid px-6 pt-12 pb-8">


        <div className="flex justify-between items-center mb-8">

          <h1 className="text-4xl font-bold">

            Profile

          </h1>

          <button onClick={() => setShowEditSheet(true)}>

            <Edit3
              size={28}
              className="text-snap-yellow"
            />

          </button>

        </div>


        {/* AVATAR */}

        <div className="flex flex-col items-center">

          <div className="relative mb-4">

            <Avatar
              uri={user?.avatarUrl}
              name={user?.displayName || "You"}
              size={120}
            />

            <div className="absolute bottom-2 right-2 w-8 h-8 bg-snap-yellow rounded-full flex items-center justify-center border-4 border-snap-dark">

              👻

            </div>

          </div>


          <h2 className="text-3xl font-bold">

            {user?.displayName}

          </h2>


          <p className="text-snap-white50 mt-1">

            @{user?.username || "username"}

          </p>


          {/* SNAP SCORE */}

          <div className="mt-6 bg-snap-darkMid px-8 py-3 rounded-3xl flex items-center gap-3">

            <Award
              className="text-snap-yellow"
              size={28}
            />

            <div>

              <p className="text-xs text-snap-white50">

                SNAP SCORE

              </p>

              <p className="text-4xl font-bold text-snap-yellow">

                {user?.snapScore || "12450"}

              </p>

            </div>

          </div>


          {/* SNAP MAP CARD */}

          <div

            onClick={() => navigate("/map")}

            className="mt-6 bg-snap-darkMid px-6 py-4 rounded-3xl flex items-center justify-between cursor-pointer active:scale-95 transition"

          >

            <div>

              <p className="text-xs text-snap-white50">

                SNAP MAP

              </p>

              <p className="text-lg font-semibold">

                View Friends Location

              </p>

            </div>

            <MapPin
              className="text-snap-yellow"
              size={28}
            />

          </div>

        </div>

      </div>


      {/* STATS */}

      <div className="grid grid-cols-3 gap-4 px-6 -mt-6 relative z-10">

        {stats.map((stat, index) => (

          <div

            key={index}

            className="bg-snap-darkMid rounded-3xl p-5 text-center"

          >

            <div className="text-snap-yellow mx-auto mb-2 w-fit">

              {stat.icon}

            </div>

            <p className="text-3xl font-bold">

              {stat.value}

            </p>

            <p className="text-xs text-snap-white50 mt-1">

              {stat.label}

            </p>

          </div>

        ))}

      </div>


      {/* MENU */}

      <div className="px-6 mt-10 space-y-2">


        <MenuItem

          icon={<Users />}

          label="Best Friends"

          onClick={() => alert("Coming soon")}

        />


        <MenuItem

          icon={<MapPin />}

          label="Open Snap Map"

          onClick={() => navigate("/map")}

        />


        <MenuItem

          icon={<Ghost />}

          label={
            user?.locationVisibility === "ghost"
              ? "Disable Ghost Mode"
              : "Enable Ghost Mode"
          }

          onClick={toggleGhostMode}

        />


        <MenuItem

          icon={<Camera />}

          label="My AR Filters"

          onClick={() => alert("Coming soon")}

        />


        <MenuItem

          icon={<Settings />}

          label="Settings & Privacy"

          onClick={() => alert("Coming soon")}

        />


        <div className="h-px bg-white/10 my-6" />


        <MenuItem

          icon={<LogOut />}

          label="Log Out"

          onClick={handleLogout}

          danger

        />

      </div>


      {/* EDIT PROFILE SHEET */}

      {showEditSheet && (

        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">

          <div className="bg-snap-darkMid w-full rounded-t-3xl p-6 max-h-[85vh] overflow-auto">


            <div className="flex justify-between items-center mb-6">

              <h3 className="text-2xl font-semibold">

                Edit Profile

              </h3>

              <button

                onClick={() => setShowEditSheet(false)}

                className="text-3xl"

              >

                ×

              </button>

            </div>


            <div className="flex flex-col items-center mb-8">

              <Avatar

                uri={user?.avatarUrl}

                name={user?.displayName}

                size={100}

              />

              <button className="text-snap-yellow mt-3 font-semibold">

                Change Avatar

              </button>

            </div>


            <input

              type="text"

              defaultValue={user?.displayName}

              className="w-full bg-snap-dark border border-white/10 rounded-2xl px-5 py-4 mb-4"

              placeholder="Display Name"

            />


            <Button

              label="Save Changes"

              onPress={() => {

                alert("Profile updated!");

                setShowEditSheet(false);

              }}

              variant="primary"

            />


            <Button

              label="Cancel"

              onPress={() => setShowEditSheet(false)}

              variant="ghost"

              className="mt-3"

            />

          </div>

        </div>

      )}

    </div>

  );

};

export default Profile;


/*
=========================
REUSABLE MENU ITEM
=========================
*/

const MenuItem = ({
  icon,
  label,
  onClick,
  danger = false
}) => (

  <div

    onClick={onClick}

    className={`flex items-center gap-4 px-5 py-5 rounded-2xl active:bg-white/10 transition-colors cursor-pointer ${
      danger ? "text-call-red" : ""
    }`}

  >

    <div className="text-2xl">

      {icon}

    </div>

    <p className="text-lg font-medium">

      {label}

    </p>

  </div>

);