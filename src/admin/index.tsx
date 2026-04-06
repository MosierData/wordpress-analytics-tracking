import React from 'react';
import { createRoot } from 'react-dom/client';
import { PluginLayout } from './PluginLayout';

const container = document.getElementById( 'roi-insights-admin' );
if ( container ) {
  createRoot( container ).render( <PluginLayout /> );
}
