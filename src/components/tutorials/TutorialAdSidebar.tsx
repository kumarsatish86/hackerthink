'use client';

import React, { useState, useEffect } from 'react';

interface AdZone {
  id: string;
  name: string;
  location: string;
  ad_code: string;
  display_rules: any;
}

interface TutorialAdSidebarProps {
  location: string;
}

const TutorialAdSidebar: React.FC<TutorialAdSidebarProps> = ({ location }) => {
  const [ads, setAds] = useState<AdZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [location]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tutorials/ads/${location}`);
      const data = await response.json();
      
      if (data.success) {
        setAds(data.data);
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="space-y-4">
        {/* Placeholder Ad Spaces */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-500 text-sm mb-2">Advertisement Space</div>
          <div className="text-xs text-gray-400">300x250</div>
        </div>
        
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-500 text-sm mb-2">Advertisement Space</div>
          <div className="text-xs text-gray-400">300x600</div>
        </div>
        
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-500 text-sm mb-2">Advertisement Space</div>
          <div className="text-xs text-gray-400">300x250</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <div key={ad.id} className="ad-container">
          <div 
            className="ad-content"
            dangerouslySetInnerHTML={{ __html: ad.ad_code }}
          />
        </div>
      ))}
      
      {/* Additional placeholder spaces if needed */}
      {ads.length < 3 && (
        <>
          {ads.length < 2 && (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-500 text-sm mb-2">Advertisement Space</div>
              <div className="text-xs text-gray-400">300x600</div>
            </div>
          )}
          
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="text-gray-500 text-sm mb-2">Advertisement Space</div>
            <div className="text-xs text-gray-400">300x250</div>
          </div>
        </>
      )}
    </div>
  );
};

export default TutorialAdSidebar;
