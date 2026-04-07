import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { LicenseData, DashboardStatusDetail } from '../lib/types';

const DASHBOARD_BASE_URL = 'https://my.roiknowledge.com/embed';

const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

const colors = {
  primary: '#16a34a',
  primaryHover: '#15803d',
  success: '#16a34a',
  successBg: '#f0fdf4',
  successBorder: '#bbf7d0',
  warning: '#d97706',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  border: '#e2e8f0',
  cardBg: '#ffffff',
  pageBg: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
};

interface AdminDashboardProps {
  onNavigateToSettings?: () => void;
  refreshKey?: number;
  isActive?: boolean;
}

function CheckIcon( { color = colors.success }: { color?: string } ) {
  return (
    <span style={ { flexShrink: 0, width: 18, height: 18, borderRadius: '50%', background: colors.successBg, border: `1px solid ${ colors.successBorder }`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } }>
      <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
        <path d="M2 6l3 3 5-5" stroke={ color } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// ─── Not activated state ────────────────────────────────────────────────────────

function NotActivatedState( { onActivate }: { onActivate?: () => void } ) {
  return (
    <div style={ { maxWidth: 600, margin: '0 auto', padding: '48px 24px', fontFamily: font } }>
      <div style={ {
        background: colors.cardBg,
        border: `1px solid ${ colors.border }`,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      } }>

        {/* Header band */}
        <div style={ { position: 'relative', background: '#0f172a', padding: '28px 32px 24px', color: '#fff', overflow: 'hidden' } }>
          <div style={ { position: 'absolute', right: -60, top: -60, width: 220, height: 220, borderRadius: '50%', background: '#162038', opacity: 0.6, pointerEvents: 'none' } } />
          <div style={ { position: 'absolute', right: 20, top: -20, width: 120, height: 120, borderRadius: '50%', background: '#1a2848', opacity: 0.4, pointerEvents: 'none' } } />
          <svg viewBox="0 0 100 80" width="80" height="64" style={ { position: 'absolute', right: 24, bottom: 12, opacity: 0.07, pointerEvents: 'none' } }>
            <rect x="0" y="50" width="14" height="30" rx="2" fill="#60b444"/>
            <rect x="18" y="30" width="14" height="50" rx="2" fill="#60b444"/>
            <rect x="36" y="20" width="14" height="60" rx="2" fill="#60b444"/>
            <rect x="54" y="35" width="14" height="45" rx="2" fill="#60b444"/>
            <rect x="72" y="10" width="14" height="70" rx="2" fill="#60b444"/>
            <polyline points="7,52 25,32 43,22 61,37 79,12" fill="none" stroke="#f47c3c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p style={ { position: 'relative', margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b8a82' } }>
            Marketing ROI Dashboard
          </p>
          <h2 style={ { position: 'relative', margin: 0, fontSize: 21, fontWeight: 500, lineHeight: 1.35, letterSpacing: '-0.3px', color: '#ffffff' } }>
            See exactly which ads are driving leads —<br />not just clicks.
          </h2>
          <div style={ { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#f47c3c' } } />
        </div>

        <div style={ { padding: '28px 32px' } }>
          <p style={ { margin: '0 0 24px', fontSize: 14, color: colors.textSecondary, lineHeight: 1.7 } }>
            Activate your free account and connect Google Ads and GA4. Your dashboard will show cost per lead, conversion rate by traffic source, and which campaigns are actually worth the spend.
          </p>
          <ul style={ { margin: '0 0 28px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 } }>
            { [
              'Google Ads cost, clicks, and conversions — side by side with your actual leads',
              'Traffic source breakdown: paid, organic, social, direct',
              'Cost per lead by campaign, so you know where to put the budget',
              '90 days of history on the free plan — enough to spot what\'s working',
            ].map( ( item, i ) => (
              <li key={ i } style={ { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 } }>
                <CheckIcon />
                { item }
              </li>
            ) ) }
          </ul>
          <button
            onClick={ onActivate }
            style={ {
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 24px', background: colors.primary, color: '#fff',
              border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600,
              fontFamily: font, cursor: 'pointer',
            } }
          >
            Activate free account →
          </button>
          <p style={ { margin: '10px 0 0', fontSize: 12, color: colors.textMuted } }>
            Free. No credit card. Takes about 30 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline step ──────────────────────────────────────────────────────────────

function TimelineStep( { icon, iconBg, iconColor, spinning, title, titleColor, description, badge }: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  spinning?: boolean;
  title: string;
  titleColor?: string;
  description: string;
  badge?: { label: string; bg: string; color: string };
} ) {
  return (
    <div style={ { display: 'flex', gap: 16, position: 'relative', zIndex: 1 } }>
      <div style={ {
        width: 36, height: 36, borderRadius: '50%', background: iconBg,
        border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        position: 'relative',
      } }>
        { spinning && (
          <div style={ {
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: iconColor,
            animation: 'roi-spin 1s linear infinite',
          } } />
        ) }
        { icon }
      </div>
      <div style={ { paddingTop: 6 } }>
        <div style={ { display: 'flex', alignItems: 'center', gap: 8 } }>
          <h3 style={ { margin: 0, fontSize: 14, fontWeight: 600, color: titleColor ?? colors.textPrimary, fontFamily: font } }>
            { title }
          </h3>
          { badge && (
            <span style={ {
              display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
              borderRadius: 4, fontSize: 11, fontWeight: 600, background: badge.bg, color: badge.color,
            } }>
              { badge.label }
            </span>
          ) }
        </div>
        <p style={ { margin: '4px 0 0', fontSize: 13, color: colors.textMuted, lineHeight: 1.5, fontFamily: font } }>
          { description }
        </p>
      </div>
    </div>
  );
}

// ─── CSS keyframes (injected once) ──────────────────────────────────────────────

const spinKeyframes = `
@keyframes roi-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes roi-fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes roi-scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
@keyframes roi-progress { from { width: 0%; } to { width: var(--roi-progress-target, 100%); } }
`;

function InjectKeyframes() {
  return <style dangerouslySetInnerHTML={ { __html: spinKeyframes } } />;
}

// ─── Email pending state ────────────────────────────────────────────────────────

function EmailPendingState() {
  return (
    <div style={ { maxWidth: 600, margin: '0 auto', padding: '48px 24px', fontFamily: font } }>
      <InjectKeyframes />
      <div style={ {
        background: colors.cardBg,
        border: `1px solid ${ colors.border }`,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      } }>
        <div style={ { padding: '32px 32px 28px', textAlign: 'center' } }>
          {/* Animated checkmark */}
          <div style={ {
            width: 72, height: 72, borderRadius: '50%', background: colors.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(22,163,74,0.2)',
            animation: 'roi-scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          } }>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
              <path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={ { margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: colors.textPrimary } }>
            Account connected!
          </h1>
          <p style={ { margin: '0 0 0', fontSize: 15, color: colors.textSecondary, lineHeight: 1.6, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' } }>
            One last step — check your email to confirm your account and start your dashboard build.
          </p>
        </div>

        {/* Timeline */}
        <div style={ { padding: '0 32px 28px', position: 'relative' } }>
          {/* Connecting line */}
          <div style={ { position: 'absolute', left: 49, top: 28, bottom: 48, width: 2, background: '#f1f5f9' } } />

          <div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
            <TimelineStep
              icon={ <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M5 12l5 5L19 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> }
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              title="Google account connected"
              description="Your Google Ads, GA4, and Search Console access is set up."
            />

            <TimelineStep
              icon={ <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 6l-10 7L2 6" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> }
              iconBg="#fffbeb"
              iconColor="#d97706"
              spinning
              title="Confirm your email"
              badge={ { label: 'Action needed', bg: '#fef3c7', color: '#92400e' } }
              description="Click the link in the email we just sent you. This starts the data import for your dashboard."
            />

            <TimelineStep
              icon={ <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#94a3b8" strokeWidth="2" /><path d="M3 9h18M9 21V9" stroke="#94a3b8" strokeWidth="2" /></svg> }
              iconBg="#f1f5f9"
              iconColor="#94a3b8"
              title="Dashboard ready"
              titleColor="#94a3b8"
              description="We'll email you again when your dashboard is loaded and ready to explore."
            />
          </div>
        </div>

        {/* Footer callout */}
        <div style={ {
          padding: '16px 32px',
          borderTop: `1px solid ${ colors.border }`,
          background: '#f8fafc',
          display: 'flex', gap: 12, alignItems: 'flex-start',
          borderRadius: '0 0 12px 12px',
        } }>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" style={ { flexShrink: 0, marginTop: 2 } }>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p style={ { margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: colors.textPrimary, fontFamily: font } }>
              Don't see the email?
            </p>
            <p style={ { margin: 0, fontSize: 13, color: colors.textSecondary, lineHeight: 1.5, fontFamily: font } }>
              Check your spam or promotions folder. The email comes from noreply@roiknowledge.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Backfilling state ──────────────────────────────────────────────────────────

function BackfillingState( { detail }: { detail?: DashboardStatusDetail } ) {
  const progressPct = detail?.progress_pct ?? null;
  const estimatedReady = detail?.estimated_ready_at
    ? new Date( detail.estimated_ready_at ).toLocaleTimeString( [], { hour: 'numeric', minute: '2-digit' } )
    : null;

  return (
    <div style={ { maxWidth: 600, margin: '0 auto', padding: '48px 24px', fontFamily: font } }>
      <InjectKeyframes />
      <div style={ {
        background: colors.cardBg,
        border: `1px solid ${ colors.border }`,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      } }>
        <div style={ { padding: '32px 32px 28px', textAlign: 'center' } }>
          {/* Animated checkmark */}
          <div style={ {
            width: 72, height: 72, borderRadius: '50%', background: colors.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(22,163,74,0.2)',
            animation: 'roi-scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          } }>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
              <path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={ { margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: colors.textPrimary } }>
            You're all set!
          </h1>
          <p style={ { margin: '0 0 0', fontSize: 15, color: colors.textSecondary, lineHeight: 1.6, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' } }>
            Your personalized ROI dashboard is being built right now.
          </p>
        </div>

        {/* Progress bar (if backend provides percentage) */}
        { progressPct !== null && (
          <div style={ { padding: '0 32px 20px' } }>
            <div style={ { width: '100%', height: 6, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' } }>
              <div style={ {
                height: '100%', background: colors.primary, borderRadius: 9999,
                width: `${ progressPct }%`, transition: 'width 0.6s ease',
              } } />
            </div>
            <p style={ { margin: '6px 0 0', fontSize: 12, color: colors.textMuted, textAlign: 'right' } }>
              { progressPct }% complete
            </p>
          </div>
        ) }

        {/* Timeline */}
        <div style={ { padding: '0 32px 28px', position: 'relative' } }>
          <div style={ { position: 'absolute', left: 49, top: 28, bottom: 48, width: 2, background: '#f1f5f9' } } />

          <div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
            <TimelineStep
              icon={ <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M5 12l5 5L19 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> }
              iconBg="#f0fdf4"
              iconColor="#16a34a"
              title="Account activated"
              description="Your Google Ads, GA4, and Search Console data is connected."
            />

            <TimelineStep
              icon={ <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="#d97706" strokeWidth="2" strokeLinecap="round" /></svg> }
              iconBg="#fffbeb"
              iconColor="#d97706"
              spinning
              title="Dashboard building..."
              badge={ { label: estimatedReady ? `Ready by ${ estimatedReady }` : '~1 hour', bg: '#fef3c7', color: '#92400e' } }
              description="We're importing your historical data and setting up your reports. This usually takes about an hour."
            />

            <TimelineStep
              icon={ <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 6l-10 7L2 6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> }
              iconBg="#f1f5f9"
              iconColor="#94a3b8"
              title="We'll email you when it's ready"
              titleColor="#94a3b8"
              description="You'll get an email as soon as your dashboard is loaded with data and ready to explore."
            />
          </div>
        </div>

        {/* What's next callout */}
        <div style={ {
          padding: '16px 32px',
          borderTop: `1px solid ${ colors.border }`,
          background: '#f8fafc',
          display: 'flex', gap: 12, alignItems: 'flex-start',
          borderRadius: '0 0 12px 12px',
        } }>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" style={ { flexShrink: 0, marginTop: 2 } }>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p style={ { margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: colors.textPrimary, fontFamily: font } }>
              What will be in your dashboard?
            </p>
            <p style={ { margin: 0, fontSize: 13, color: colors.textSecondary, lineHeight: 1.5, fontFamily: font } }>
              Cost per lead by campaign, conversion rates by traffic source, Google Ads spend vs. actual leads, and 90 days of historical trends — all in one view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Error / fallback state ─────────────────────────────────────────────────────

function ErrorState( { message, onActivate }: { message: string; onActivate?: () => void } ) {
  return (
    <div style={ { maxWidth: 560, margin: '0 auto', padding: '48px 24px', fontFamily: font } }>
      <div style={ {
        background: colors.cardBg,
        border: `1px solid ${ colors.border }`,
        borderRadius: 10,
        padding: '28px 32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      } }>
        <p style={ { margin: '0 0 8px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.textMuted } }>
          Marketing ROI Dashboard
        </p>
        <p style={ { margin: '0 0 20px', fontSize: 15, color: colors.textPrimary, lineHeight: 1.6 } }>
          { message }
        </p>
        { onActivate && (
          <button
            onClick={ onActivate }
            style={ {
              background: 'none',
              border: `1px solid ${ colors.border }`,
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: font,
              color: colors.primary,
              cursor: 'pointer',
            } }
          >
            Go to Activation →
          </button>
        ) }
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function AdminDashboard( { onNavigateToSettings, refreshKey, isActive }: AdminDashboardProps ) {
  const [ dashboardUrl, setDashboardUrl ] = useState<string | null>( null );
  const [ error, setError ] = useState<string | null>( null );
  const [ notActivated, setNotActivated ] = useState( false );
  const [ dashboardStatus, setDashboardStatus ] = useState<string | null>( null );
  const [ statusDetail, setStatusDetail ] = useState<DashboardStatusDetail | undefined>();

  const fetchStatus = useCallback( async () => {
    try {
      const license = await api.get<LicenseData>( 'license/status' );

      if ( ! license.isValid ) {
        setNotActivated( true );
        setDashboardUrl( null );
        setDashboardStatus( null );
        setError( null );
        return;
      }

      setNotActivated( false );

      // Check dashboard readiness status.
      const status = license.dashboardStatus;

      if ( status === 'email_pending' || status === 'backfilling' ) {
        setDashboardStatus( status );
        setStatusDetail( license.dashboardStatusDetail );
        setDashboardUrl( null );
        setError( null );
        return;
      }

      if ( status === 'error' ) {
        setError( 'Something went wrong while building your dashboard. We\'ve been notified and are looking into it. Try refreshing in a few minutes.' );
        setDashboardStatus( null );
        setDashboardUrl( null );
        return;
      }

      if ( license.isFallback ) {
        setError( 'The dashboard can\'t load right now — we couldn\'t reach the ROI Insights service. Your tracking pixels are still firing normally. Try refreshing in a few minutes.' );
        setDashboardStatus( null );
        setDashboardUrl( null );
        return;
      }

      if ( ! license.sessionToken ) {
        // Account is valid but dashboard embed token isn't available yet.
        // Show the backfilling state rather than a confusing "re-activate" message.
        setDashboardStatus( 'backfilling' );
        setDashboardUrl( null );
        setError( null );
        return;
      }

      const url = new URL( DASHBOARD_BASE_URL );
      url.searchParams.set( 'token', license.sessionToken );
      url.searchParams.set( 'tier', license.tier ?? 'free' );
      setDashboardUrl( url.toString() );
      setDashboardStatus( null );
      setError( null );
    } catch {
      setError( 'Something went wrong loading the dashboard. Refresh the page to try again.' );
    }
  }, [] );

  // Re-fetch whenever the tab becomes active or refreshKey changes.
  useEffect( () => {
    if ( isActive === false ) return;
    setDashboardUrl( null );
    setError( null );
    setNotActivated( false );
    setDashboardStatus( null );
    setStatusDetail( undefined );
    void fetchStatus();
  }, [ isActive, refreshKey, fetchStatus ] );

  // Poll every 30s while in a transient state and the tab is active.
  useEffect( () => {
    if ( isActive === false ) return;
    if ( dashboardStatus !== 'email_pending' && dashboardStatus !== 'backfilling' ) return;

    const interval = setInterval( () => void fetchStatus(), 30_000 );
    return () => clearInterval( interval );
  }, [ isActive, dashboardStatus, fetchStatus ] );

  if ( notActivated ) {
    return <NotActivatedState onActivate={ onNavigateToSettings } />;
  }

  if ( dashboardStatus === 'email_pending' ) {
    return <EmailPendingState />;
  }

  if ( dashboardStatus === 'backfilling' ) {
    return <BackfillingState detail={ statusDetail } />;
  }

  if ( error ) {
    return <ErrorState message={ error } onActivate={ onNavigateToSettings } />;
  }

  if ( ! dashboardUrl ) {
    return (
      <div style={ { padding: '48px 24px', color: colors.textMuted, fontFamily: font, fontSize: 14 } }>
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div style={ { width: '100%' } }>
      <iframe
        src={ dashboardUrl }
        style={ { width: '100%', minHeight: 'calc(100vh - 96px)', border: 'none', display: 'block' } }
        title="Marketing ROI Dashboard"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
