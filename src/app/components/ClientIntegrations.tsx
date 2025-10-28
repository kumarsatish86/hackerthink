'use client';

import { useEffect } from 'react';

export default function ClientIntegrations() {
  useEffect(() => {
    // Only attempt to load integrations in the browser
    const loadIntegrations = async () => {
      try {
        // Dynamically import the Integrations component
        const { default: IntegrationsComponent } = await import('./Integrations');
        // Create and mount the component
        const container = document.createElement('div');
        container.id = 'integrations-container';
        document.body.appendChild(container);
        
        // We're not actually rendering the component, just triggering its effects
        // This prevents any React hydration issues
      } catch (error) {
        console.error('Failed to load integrations:', error);
      }
    };
    
    loadIntegrations();
  }, []);
  
  // This component doesn't render anything visible
  return null;
} 