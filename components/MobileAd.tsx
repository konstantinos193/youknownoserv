import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface MobileAdProps {
  id: string;
  name: string;
  tagline: string;
  imageUrl: string;
  link: string;
}

// Remove the static ads array
// const ads = [
//   {
//     id: "27u6",
//     name: "Wizord",
//     tagline: "By Wizord for friends. 1% is plenty. Please try to stay below 1% so many friends can share :)",
//     imageUrl: "https://images.odin.fun/token/27u6",
//     link: "https://odin.fun/token/27u6"
//   },
//   // Add more ads here
// ];

const getRandomAd = (ads: MobileAdProps[]) => {
  return ads[Math.floor(Math.random() * ads.length)];
};

const MobileAd: React.FC = () => {
  const [ad, setAd] = useState<MobileAdProps | null>(null);
  const [ads, setAds] = useState<MobileAdProps[]>([]); // New state for ads

  useEffect(() => {
    const fetchAds = async () => {
      const response = await fetch('/tokens.json'); // Fetch the token data
      const data = await response.json();
      setAds(data); // Set the ads state with fetched data
      setAd(getRandomAd(data)); // Set a random ad from the fetched data
    };

    fetchAds();
  }, []);

  if (!ad) return null;

  return (
    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block w-full relative">
      <div className="flex items-center p-4 bg-gray-800 rounded-lg shadow-md relative">
        {/* Ad Label */}
        <span className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">Ad</span>
        
        {/* Image */}
        <div className="relative w-16 h-16 mr-4">
          <Image
            src={ad.imageUrl}
            alt={ad.name}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        
        {/* Text Content */}
        <div className="flex-1">
          <h3 className="font-bold text-white">{ad.name}</h3>
          <p className="text-gray-400 text-sm">{ad.tagline}</p>
        </div>
        
        {/* Chart Button */}
        <a href={`https://odin.fun/token/${ad.id}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
          📊
        </a>
      </div>
    </a>
  );
};

export default MobileAd;
