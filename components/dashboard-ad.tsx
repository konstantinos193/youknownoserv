'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BarChart2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TokenAd {
  id: string;
  name: string;
  tagline: string;
  logoColor: string;
  imageUrl: string;
  pageName: string;
  description: string;
  url: string;
}

// Shuffle function to randomly select an ad
const getRandomAd = (ads: TokenAd[]): TokenAd => {
  const randomIndex = Math.floor(Math.random() * ads.length);
  return ads[randomIndex];
};

export default function DashboardAd() {
  const [adData, setAdData] = useState<TokenAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdData = async () => {
      try {
        const response = await fetch('/tokens.json');
        const tokens = await response.json();
        
        // Get a random token for the ad
        const randomAd = getRandomAd(tokens);
        setAdData(randomAd);
      } catch (error) {
        console.error('Error loading ad data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdData();
  }, []); // Empty dependency array means this runs once on mount

  // Optional: Add auto-rotation of ads every X seconds
  useEffect(() => {
    const rotateAd = async () => {
      try {
        const response = await fetch('/tokens.json');
        const tokens = await response.json();
        const newAd = getRandomAd(tokens);
        setAdData(newAd);
      } catch (error) {
        console.error('Error rotating ad:', error);
      }
    };

    // Rotate ad every 30 seconds (adjust timing as needed)
    const interval = setInterval(rotateAd, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-black/80 backdrop-blur-sm border border-border rounded-sm p-4">
        <div className="flex items-start gap-4 animate-pulse">
          <div className="w-16 h-16 bg-secondary/20 rounded-sm" />
          <div className="flex-1">
            <div className="h-5 w-24 bg-secondary/20 rounded mb-2" />
            <div className="h-4 w-full bg-secondary/20 rounded" />
            <div className="h-4 w-3/4 bg-secondary/20 rounded mt-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!adData) return null;

  return (
    <div className="bg-black/80 backdrop-blur-sm border border-border rounded-sm">
      <Link href={adData.url} className="flex flex-col">
        <div className="flex items-start gap-4 p-4">
          <div className="relative w-16 h-16 rounded-sm overflow-hidden">
            <Image
              src={adData.imageUrl}
              alt={adData.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{adData.name}</h3>
              <span className="text-xs text-muted-foreground">Ad</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {adData.tagline}
            </p>
          </div>
        </div>
        <div className="border-t border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart2 className="h-4 w-4" />
            <span>Chart</span>
          </div>
        </div>
      </Link>
    </div>
  );
} 