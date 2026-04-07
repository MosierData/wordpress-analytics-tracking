import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './Dashboard';
import { TrackingSettingsAdmin } from './TrackingSettings';
import { SettingsPage } from './Settings';

type Tab = 'dashboard' | 'tracking' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'tracking', label: 'Tracking Pixels' },
  { id: 'dashboard', label: 'Marketing ROI' },
  { id: 'settings', label: 'Activation' },
];

function getTabFromHash(): Tab {
  const hash = window.location.hash.slice( 1 ) as Tab;
  return hash === 'tracking' || hash === 'settings' ? hash : 'dashboard';
}

export function PluginLayout() {
  const [ activeTab, setActiveTab ] = useState<Tab>( getTabFromHash );
  const [ dashboardRefreshKey, setDashboardRefreshKey ] = useState( 0 );

  const handleTabChange = ( tab: Tab ) => {
    setActiveTab( tab );
    window.location.hash = tab === 'dashboard' ? '' : tab;
  };

  const handleNavigateToDashboard = () => {
    setDashboardRefreshKey( k => k + 1 );
    handleTabChange( 'dashboard' );
  };

  useEffect( () => {
    const onHashChange = () => setActiveTab( getTabFromHash() );
    window.addEventListener( 'hashchange', onHashChange );
    return () => window.removeEventListener( 'hashchange', onHashChange );
  }, [] );

  return (
    <div style={ { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif', background: '#f1f5f9', minHeight: 0, paddingBottom: 80 } }>
      <div
        role="tablist"
        style={ {
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '0 1.25rem',
          gap: '0.25rem',
          flexShrink: 0,
        } }
      >
        { TABS.map( tab => (
          <button
            key={ tab.id }
            role="tab"
            aria-selected={ activeTab === tab.id }
            onClick={ () => handleTabChange( tab.id ) }
            style={ {
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              marginBottom: '-1px',
            } }
          >
            { tab.label }
          </button>
        ) ) }
      </div>

      <div>
        <div style={ { display: activeTab === 'dashboard' ? 'block' : 'none' } }>
          <AdminDashboard onNavigateToSettings={ () => handleTabChange( 'settings' ) } refreshKey={ dashboardRefreshKey } isActive={ activeTab === 'dashboard' } />
        </div>
        <div style={ { display: activeTab === 'tracking' ? 'block' : 'none' } }>
          <TrackingSettingsAdmin />
        </div>
        <div style={ { display: activeTab === 'settings' ? 'block' : 'none' } }>
          <SettingsPage onNavigateToDashboard={ handleNavigateToDashboard } isActive={ activeTab === 'settings' } />
        </div>
      </div>
    </div>
  );
}
