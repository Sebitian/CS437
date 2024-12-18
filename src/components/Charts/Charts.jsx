'use client';

import { CiBatteryFull } from "react-icons/ci";
import { FaWifi, FaBluetooth } from "react-icons/fa";
import GoogleMapComponent from "../GoogleMaps/GoogleMaps";
import { ref, onValue } from 'firebase/database';
import { useEffect, useState } from "react";
import { database } from "../../../firebase/firebase";
import Image from "next/image";
import VideoStream from "../VideoStream/VideoStream";

// Helper function to get connection color
const getConnectionColor = (seconds) => {
  if (seconds < 30) {
    return "text-green-600";
  } else if (seconds < 120) {
    return "text-yellow-500";
  } else {
    return "text-red-600";
  }
};

// Another helper for battery color
const getBatteryColor = (percentage) => {
  if (percentage > 50) return "bg-green-500";
  if (percentage < 20) return "bg-red-500";
  return "bg-yellow-500";
};

// "Last seen" text generator
const calculateLastSeenText = (timeInMs) => {
  const now = Date.now();
  const diff = now - timeInMs;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (days > 0) {
    return `Last seen ${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
    return `Last seen ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (minutes > 0) {
    return `Last seen ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (seconds >= 0) {
    return `Last seen ${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
  } else {
    return 'Last seen just now';
  }
};

const Charts = () => {
  const batteryPercentage = 85;
  const blmStatus = "Disconnected";
  
  const [lastKnownTimestamp, setLastKnownTimestamp] = useState(null);
  const [lastSeenText, setLastSeenText] = useState("Loading...");
  const [secondsSinceLastSeen, setSecondsSinceLastSeen] = useState(null);
  
  const [latestImageUrl, setLatestImageUrl] = useState(null);



  const title = 1733857007;

  useEffect(() => {
    const dbRef = ref(database, 'test/wifi_timestamp');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = Number(snapshot.val());
        const timeInMs = val.toString().length === 10 ? val * 1000 : val;
        setLastKnownTimestamp(timeInMs);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Firebase read failed: ", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!lastKnownTimestamp) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const seconds = Math.floor((now - lastKnownTimestamp) / 1000);
      setSecondsSinceLastSeen(seconds);
      setLastSeenText(calculateLastSeenText(lastKnownTimestamp));
    }, 1000);

    // Immediate update
    const now = Date.now();
    const seconds = Math.floor((now - lastKnownTimestamp) / 1000);
    setSecondsSinceLastSeen(seconds);
    setLastSeenText(calculateLastSeenText(lastKnownTimestamp));

    return () => clearInterval(interval);
  }, [lastKnownTimestamp]);

  if (!lastKnownTimestamp) {
    return <div>Loading...</div>;
  }

  const batteryColor = getBatteryColor(batteryPercentage);

  // Determine icon color based on elapsed time
  const wifiIconColor = getConnectionColor(secondsSinceLastSeen);

  // Check if last seen is less than 2 minutes ago
  const showLiveContent = secondsSinceLastSeen < 35


  return (
    <>
      <section>
        <div className="flex m-4 gap-2">
          {/* BATTERY */}
          <div className="flex-1 px-2 py-4 bg-gray-100 shadow rounded h-[150px] flex flex-col items-center justify-center">
            <div className={`${batteryColor} p-3 rounded-full`}>
              <CiBatteryFull className="text-6xl text-white" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-700">{batteryPercentage}%</p>
          </div>
          
          {/* WIFI */}
          <div className="flex-1 px-2 py-4 bg-gray-100 shadow rounded h-[150px] flex flex-col items-center justify-center">
            <FaWifi className={`text-6xl ${wifiIconColor}`} />
            <p className="mt-2 text-sm font-bold text-gray-700">{lastSeenText}</p>
          </div>

          {/* BLUETOOTH */}
          <div className="flex-1 px-2 py-4 bg-gray-100 shadow rounded h-[150px] flex flex-col items-center justify-center">
            <FaBluetooth className="text-6xl text-gray-700" />
            <p className="mt-2 text-sm font-bold text-gray-700">{blmStatus}</p>
          </div>
        </div>
      </section>

      <section className="flex my-4 px-4 gap-3">
        <div className="flex-grow relative">
          <GoogleMapComponent className="absolute inset-0" />
        </div>
      </section>

      {showLiveContent && (
        <section className="flex my-4 px-4 gap-2">
          <div className="flex-1 px-2 py-4 bg-gray-100 shadow rounded flex flex-col items-center justify-center">
            <p className="text-2xl text-red-700">Live</p>
            <VideoStream streamUrl="http://127.0.0.1:5000/video_feed" />
          </div>
          {/* <div className="flex-1 px-2 py-4 bg-gray-100 shadow rounded flex flex-col items-center justify-center">
            <p className="text-2xl text-red-700">Suspect</p>
            <Image src={"/images/detected_face_motion/face_motion_${title}.png"} height={640} width={480} alt="Suspect" />
          </div> */}
        </section>
      )}
    </>
  );
};

export default Charts;

