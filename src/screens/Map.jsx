import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import io from "socket.io-client";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";

/*
=========================
YOU MARKER (animated yellow pulse)
=========================
*/
const youIcon = L.divIcon({
  className: "",
  iconSize: [80, 80],
  iconAnchor: [40, 40],
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:80px;height:80px;">
      <div style="position:absolute;width:70px;height:70px;border-radius:50%;
        background:rgba(255,252,0,0.12);animation:snapPulse 2s ease-out infinite 0.4s;"></div>
      <div style="position:absolute;width:50px;height:50px;border-radius:50%;
        background:rgba(255,252,0,0.22);animation:snapPulse 2s ease-out infinite;"></div>
      <div style="width:20px;height:20px;border-radius:50%;background:#FFFC00;
        border:3px solid #0a0a0a;box-shadow:0 0 12px rgba(255,252,0,0.7);
        position:relative;z-index:2;"></div>
    </div>
  `
});

/*
=========================
FRIEND MARKER (teardrop with initials)
=========================
*/
const FRIEND_COLORS = [
  "#FF6B9D", "#4ECDC4", "#A78BFA",
  "#F59E0B", "#34D399", "#60A5FA"
];

function getFriendIcon(friend, colorIndex = 0) {
  const color = friend.color || FRIEND_COLORS[colorIndex % FRIEND_COLORS.length];
  const initials = friend.displayName
    ? friend.displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return L.divIcon({
    className: "",
    iconSize: [46, 52],
    iconAnchor: [21, 48],
    html: `
      <div style="
        width:42px;height:42px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${color};
        border:3px solid #0a0a0a;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 16px rgba(0,0,0,0.6);
      ">
        <span style="
          transform:rotate(45deg);
          font-weight:800;font-size:0.82rem;
          color:#0a0a0a;
          font-family:'DM Sans',sans-serif;
        ">${initials}</span>
      </div>
    `
  });
}

/*
=========================
MAIN MAP COMPONENT
=========================
*/
const Map = () => {

  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [position, setPosition]               = useState(null);
  const [friendsLocations, setFriendsLocations] = useState([]);
  const [selectedFriend, setSelectedFriend]   = useState(null);
  const [ghostMode, setGhostMode]             = useState(
    user?.locationVisibility === "ghost"
  );
  const [mapRef, setMapRef]                   = useState(null);
  const [toast, setToast]                     = useState(null);
  const [socket, setSocket]                   = useState(null);

  const authData = JSON.parse(localStorage.getItem("authData"));
  const token    = authData?.accessToken;
  const userId   = authData?.user?._id;
  const apiUrl   = import.meta.env.VITE_API_URL || "http://localhost:3000";

  /*
  — TOAST HELPER
  */
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  /*
  — SOCKET INITIALIZATION
  */
  useEffect(() => {
    const newSocket = io(apiUrl, {
      auth: {
        userId: userId
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [apiUrl, userId]);

  /*
  — STEP 1: TRACK CURRENT USER LOCATION
  */
  useEffect(() => {
    if (!socket) return;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        if (socket.connected) {
          socket.emit("location:update", {
            userId,
            latitude: coords[0],
            longitude: coords[1]
          });
        }
      },
      (err) => {
        console.error("Location error:", err);
        // Still set a default position for the map
        if (!position) {
          setPosition([20.5937, 78.9629]); // India center as fallback
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);

  }, [userId, socket]);

  /*
  — STEP 2: FETCH INITIAL FRIENDS LOCATIONS
  */
  useEffect(() => {

    const fetchFriendsLocations = async (retries = 3) => {
      try {
        const res  = await fetch(`${apiUrl}/api/v1/location/friends`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          console.error(`API Error: ${res.status} ${res.statusText}`);
          if (retries > 0) {
            setTimeout(() => fetchFriendsLocations(retries - 1), 2000);
          } else {
            setFriendsLocations([]);
          }
          return;
        }

        const data = await res.json();
        setFriendsLocations(data || []);
      } catch (error) {
        console.error("Friends location fetch error:", error);
        if (retries > 0) {
          setTimeout(() => fetchFriendsLocations(retries - 1), 2000);
        } else {
          setFriendsLocations([]);
        }
      }
    };

    if (token && apiUrl) {
      fetchFriendsLocations();
    }

  }, [token, apiUrl]);

  /*
  — STEP 3: LIVE FRIEND MOVEMENT VIA SOCKET
  */
  useEffect(() => {
    if (!socket) return;

    socket.on("location:updated", (data) => {
      setFriendsLocations(prev => {
        const filtered = prev.filter(f => f.user._id !== data.userId);
        return [
          ...filtered,
          {
            user: { _id: data.userId },
            latitude: data.latitude,
            longitude: data.longitude
          }
        ];
      });
    });

    return () => socket.off("location:updated");

  }, [socket]);

  /*
  — TOGGLE GHOST MODE
  */
  const toggleGhostMode = async () => {
    try {
      const newVisibility = ghostMode ? "friends" : "ghost";
      const res = await fetch(`${apiUrl}/api/v1/location/location-visibility`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ locationVisibility: newVisibility })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      setGhostMode(!ghostMode);
      showToast(ghostMode ? "Location sharing on 📍" : "Ghost Mode enabled 👻");
    } catch (error) {
      console.error("Ghost mode error:", error);
    }
  };

  /*
  — LOCATE ME
  */
  const locateMe = () => {
    if (mapRef && position) {
      mapRef.flyTo(position, 15, { animate: true, duration: 1.2 });
    }
  };

  /*
  — LOADING STATE
  */
  if (!position) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0a0a0a", color: "#fff",
        fontFamily: "'DM Sans', sans-serif", gap: "16px"
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid #333",
          borderTop: "3px solid #FFFC00",
          animation: "spin 0.8s linear infinite"
        }}/>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>
          Getting your location…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>

      {/* PULSE KEYFRAME */}
      <style>{`
        @keyframes snapPulse {
          0%   { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: #1a1a1a !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6) !important;
          color: #fff !important;
          font-family: 'DM Sans', sans-serif !important;
        }
        .leaflet-popup-tip { background: #1a1a1a !important; }
        .leaflet-popup-close-button { color: rgba(255,255,255,0.5) !important; }
        .leaflet-control-zoom a {
          background: rgba(10,10,10,0.85) !important;
          color: #fff !important;
          border-color: rgba(255,255,255,0.15) !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-zoom a:hover { background: rgba(255,255,255,0.15) !important; }
        .leaflet-control-attribution { display: none !important; }
      `}</style>

      {/* MAP */}
      <MapContainer
        center={position}
        zoom={14}
        style={{ height: "100vh", width: "100%" }}
        ref={setMapRef}
        zoomControl
      >
        {/* DARK TILE LAYER — CartoDB Dark Matter */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* YOUR LOCATION */}
        <Marker position={position} icon={youIcon}>
          <Popup>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              You are here 📍
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginTop: 4 }}>
              Last updated: just now
            </div>
          </Popup>
        </Marker>

        {/* FRIENDS */}
        {friendsLocations.map((friend, index) => (
          <Marker
            key={friend.user._id}
            position={[friend.latitude, friend.longitude]}
            icon={getFriendIcon(friend.user, index)}
            eventHandlers={{ click: () => setSelectedFriend(friend) }}
          >
            <Popup>
              <div style={{ fontWeight: 700 }}>
                {friend.user.displayName || "Friend"}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── TOP BAR ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: "52px 18px 16px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
        display: "flex", alignItems: "center", gap: 12
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 40, height: 40,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff", flexShrink: 0
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div style={{
          flex: 1,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 999,
          padding: "10px 18px",
          display: "flex", alignItems: "center", gap: 10
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search Snap Map"
            style={{
              background: "none", border: "none", outline: "none",
              color: "#fff", fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.95rem", width: "100%"
            }}
          />
        </div>

        <button
          onClick={toggleGhostMode}
          style={{
            width: 40, height: 40,
            background: ghostMode ? "rgba(255,252,0,0.18)" : "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            borderRadius: "50%",
            border: `1px solid ${ghostMode ? "#FFFC00" : "rgba(255,255,255,0.15)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 18, flexShrink: 0,
            transition: "background 0.2s, border-color 0.2s"
          }}
        >
          👻
        </button>
      </div>

      {/* ── GHOST MODE BANNER ── */}
      {ghostMode && (
        <div style={{
          position: "absolute", top: 126, left: 18, right: 18,
          zIndex: 1000,
          background: "rgba(255,252,0,0.12)",
          border: "1px solid rgba(255,252,0,0.3)",
          borderRadius: 14,
          padding: "10px 16px",
          fontSize: "0.82rem", fontWeight: 500,
          color: "#FFFC00",
          display: "flex", alignItems: "center", gap: 10,
          backdropFilter: "blur(10px)",
          fontFamily: "'DM Sans', sans-serif"
        }}>
          <span>👻</span>
          <span>Ghost Mode On — your location is hidden</span>
          <span
            onClick={toggleGhostMode}
            style={{ marginLeft: "auto", cursor: "pointer", opacity: 0.6 }}
          >✕</span>
        </div>
      )}

      {/* ── FRIENDS NEARBY PILL ── */}
      <div style={{
        position: "absolute",
        top: ghostMode ? 178 : 126,
        left: "50%", transform: "translateX(-50%)",
        zIndex: 1000,
        background: "rgba(10,10,10,0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 999,
        padding: "8px 18px",
        fontSize: "0.8rem", fontWeight: 600,
        color: "rgba(255,255,255,0.6)",
        display: "flex", alignItems: "center", gap: 8,
        pointerEvents: "none",
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: "nowrap",
        transition: "top 0.3s"
      }}>
        <div style={{
          width: 7, height: 7, background: "#4ade80",
          borderRadius: "50%",
          animation: "snapPulse 2s ease-in-out infinite"
        }}/>
        {ghostMode
          ? "Ghost Mode — location hidden"
          : `${friendsLocations.length} friend${friendsLocations.length !== 1 ? "s" : ""} nearby`
        }
      </div>

      {/* ── LOCATE ME BUTTON ── */}
      <button
        onClick={locateMe}
        style={{
          position: "absolute", right: 18, bottom: 120,
          zIndex: 1000,
          width: 46, height: 46,
          background: "rgba(10,10,10,0.75)",
          backdropFilter: "blur(10px)",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
      </button>

      {/* ── FRIEND POPUP CARD ── */}
      {selectedFriend && (
        <div style={{
          position: "absolute",
          bottom: 100, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: 300,
          background: "#1a1a1a",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.15)",
          padding: 16,
          fontFamily: "'DM Sans', sans-serif",
          animation: "slideUp 0.25s ease forwards"
        }}>
          <style>{`
            @keyframes slideUp {
              from { transform: translateX(-50%) translateY(16px); opacity: 0; }
              to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
            }
          `}</style>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: FRIEND_COLORS[friendsLocations.indexOf(selectedFriend) % FRIEND_COLORS.length],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "1.1rem", color: "#0a0a0a",
              flexShrink: 0
            }}>
              {selectedFriend.user.displayName
                ? selectedFriend.user.displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                : "??"
              }
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                {selectedFriend.user.displayName || "Friend"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginTop: 2 }}>
                Active just now
              </div>
            </div>
            <button
              onClick={() => setSelectedFriend(null)}
              style={{
                marginLeft: "auto", background: "none", border: "none",
                color: "rgba(255,255,255,0.5)", fontSize: "1.4rem",
                cursor: "pointer", lineHeight: 1, padding: "0 0 0 8px"
              }}
            >×</button>
          </div>

          {/* <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              onClick={() => showToast("Snap sent! 📸")}
              style={{
                flex: 1, padding: "11px 0",
                background: "#FFFC00", color: "#0a0a0a",
                border: "none", borderRadius: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700, fontSize: "0.85rem", cursor: "pointer"
              }}
            >
              Send Snap
            </button>
            <button
              onClick={() => showToast("Directions opened 🗺️")}
              style={{
                flex: 1, padding: "11px 0",
                background: "rgba(255,255,255,0.1)", color: "#fff",
                border: "none", borderRadius: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700, fontSize: "0.85rem", cursor: "pointer"
              }}
            >
              Directions
            </button>
          </div> */}
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "absolute",
          top: 70, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          padding: "10px 22px",
          borderRadius: 999,
          fontSize: "0.85rem", fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          animation: "fadeIn 0.25s ease"
        }}>
          <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          {toast}
        </div>
      )}

    </div>
  );
};

export default Map;