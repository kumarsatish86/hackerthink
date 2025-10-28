'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// Extend Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    clarity: (method: string, ...args: any[]) => void;
  }
}

// Define the integration types
interface Integration {
  id: number;
  provider: string;
  type: string;
  name: string;
  status: boolean;
  config: {
    [key: string]: any;
    trackingId?: string;
    anonymizeIp?: boolean;
    sendPageViews?: boolean;
    containerId?: string;
    clientId?: string;
    projectId?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch active integrations
    const fetchIntegrations = async () => {
      try {
        const res = await fetch('/api/integrations');
        if (!res.ok) throw new Error('Failed to fetch integrations');
        
        const data = await res.json();
        // Filter only active integrations
        setIntegrations(data.integrations.filter((i: Integration) => i.status));

        // Directly add Google Tag Manager
        const tagManagerIntegration = data.integrations.find(
          (i: Integration) => i.provider === 'google' && i.type === 'tagmanager' && i.status
        );
        
        if (tagManagerIntegration && tagManagerIntegration.config.containerId) {
          const containerId = tagManagerIntegration.config.containerId;
          
          // Add GTM script directly to head for more reliable loading
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
          
          const gtmScript = document.createElement('script');
          gtmScript.async = true;
          gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
          document.head.appendChild(gtmScript);
          
          // Update noscript iframe
          const noscriptIframes = document.querySelectorAll('noscript iframe[src*="googletagmanager"]');
          if (noscriptIframes.length > 0) {
            for (let i = 0; i < noscriptIframes.length; i++) {
              const iframe = noscriptIframes[i] as HTMLIFrameElement;
              iframe.src = `https://www.googletagmanager.com/ns.html?id=${containerId}`;
            }
          }
        }
      } catch (error) {
        console.error('Error loading integrations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIntegrations();
  }, []);
  
  if (loading) return null;
  
  return (
    <>
      {/* Google Analytics */}
      {integrations
        .filter(i => i.provider === 'google' && i.type === 'analytics')
        .map(integration => (
          <Script 
            key={integration.id}
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${integration.config.trackingId}`}
            onLoad={() => {
              window.dataLayer = window.dataLayer || [];
              function gtag(...args: any[]) {
                window.dataLayer.push(args);
              }
              gtag('js', new Date());
              gtag('config', integration.config.trackingId || '', {
                anonymize_ip: integration.config.anonymizeIp,
                send_page_view: integration.config.sendPageViews
              });
            }}
          />
        ))}
      
      {/* Google AdSense */}
      {integrations
        .filter(i => i.provider === 'google' && i.type === 'adsense')
        .map(integration => (
          <Script 
            key={integration.id}
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${integration.config.clientId || ''}`}
            crossOrigin="anonymous"
          />
        ))}
      
      {/* Microsoft Clarity */}
      {integrations
        .filter(i => i.provider === 'microsoft' && i.type === 'clarity')
        .map(integration => (
          <Script 
            key={integration.id}
            strategy="afterInteractive"
            onLoad={() => {
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode?.insertBefore(t,y);
              })(window, document, "clarity", "script", integration.config.projectId || '');
            }}
          />
        ))}
    </>
  );
} 