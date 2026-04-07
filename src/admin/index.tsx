/* eslint-disable camelcase */
// Set the public path for webpack chunk loading (dynamic imports).
// The script tag's src tells us where the build directory is.
declare let __webpack_public_path__: string;
const currentScript = document.currentScript as HTMLScriptElement | null;
if ( currentScript?.src ) {
  __webpack_public_path__ = currentScript.src.replace( /[^/]+$/, '' );
}
/* eslint-enable camelcase */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { PluginLayout } from './PluginLayout';

const container = document.getElementById( 'roi-insights-admin' );
if ( container ) {
  createRoot( container ).render( <PluginLayout /> );
}
