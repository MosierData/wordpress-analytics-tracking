/**
 * WordPress admin-ajax transport via jQuery.
 *
 * Uses jQuery.ajax() (not fetch) because WordPress admin always loads jQuery,
 * and jQuery sends X-Requested-With: XMLHttpRequest via XMLHttpRequest —
 * the exact pattern that Cloudflare and every other WAF/CDN allowlists for
 * admin-ajax.php. The fetch() API sends Sec-Fetch-Mode: cors which triggers
 * bot protection rules on many hosting setups.
 *
 * Path → action:  'license/notify' → 'roi_insights_license_notify'
 * Query params (api.get) become extra POST fields.
 * Body data (api.post) is JSON-encoded into the 'data' POST field.
 *
 * PHP handlers use wp_send_json_success / wp_send_json_error, which wrap
 * responses in { success: bool, data: ... }. This layer unwraps automatically.
 */

declare const roiInsights: {
  nonce: string;
  ajaxUrl: string;
  tier: string;
  capabilities: string[];
  isValid: boolean;
  hasKey: boolean;
};

declare const jQuery: {
  ajax( options: {
    url: string;
    type: string;
    data: Record<string, string>;
    dataType: string;
    success: ( response: unknown ) => void;
    error: ( xhr: { status: number; statusText: string; responseText: string } ) => void;
  } ): void;
};

/** Convert 'license/pending?poll_token=abc' → { action: 'roi_insights_license_pending', extras: { poll_token: 'abc' } } */
function pathToAction( path: string ): { action: string; extras: Record<string, string> } {
  const [ pathPart, queryPart ] = path.split( '?' );
  const action = 'roi_insights_' + pathPart.replace( /[/-]/g, '_' );
  const extras: Record<string, string> = {};
  if ( queryPart ) {
    new URLSearchParams( queryPart ).forEach( ( v, k ) => { extras[ k ] = v; } );
  }
  return { action, extras };
}

function ajax<T>( path: string, data?: unknown ): Promise<T> {
  const { action, extras } = pathToAction( path );

  const postData: Record<string, string> = {
    action,
    _wpnonce: roiInsights.nonce,
    ...extras,
  };

  if ( data !== undefined ) {
    postData.data = JSON.stringify( data );
  }

  return new Promise<T>( ( resolve, reject ) => {
    jQuery.ajax( {
      url:      roiInsights.ajaxUrl,
      type:     'GET',
      data:     postData,
      dataType: 'json',
      success( response: unknown ) {
        // wp_send_json_success → { success: true, data: <payload> }
        // wp_send_json_error  → { success: false, data: <payload> }
        if ( response && typeof response === 'object' && 'success' in ( response as Record<string, unknown> ) ) {
          const envelope = response as { success: boolean; data: unknown };
          if ( ! envelope.success ) {
            reject( envelope.data ?? envelope );
          } else {
            resolve( envelope.data as T );
          }
          return;
        }
        // Fallback: raw JSON (shouldn't happen with our handlers).
        resolve( response as T );
      },
      error( xhr ) {
        reject( new Error( `AJAX ${ xhr.status } ${ xhr.statusText } for ${ action } — ${ xhr.responseText.slice( 0, 200 ) }` ) );
      },
    } );
  } );
}

export const api = {
  get<T>( path: string ): Promise<T> {
    return ajax<T>( path );
  },
  post<T>( path: string, data: unknown ): Promise<T> {
    return ajax<T>( path, data );
  },
};
