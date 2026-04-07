import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrackingValues {
  gtmEnabled: boolean;
  gtmId: string;
  ga4Enabled: boolean;
  ga4Id: string;
  metaEnabled: boolean;
  metaId: string;
  linkedinEnabled: boolean;
  linkedinId: string;
  tiktokEnabled: boolean;
  tiktokId: string;
  bingEnabled: boolean;
  bingId: string;
  pinterestEnabled: boolean;
  pinterestId: string;
  nextdoorEnabled: boolean;
  nextdoorId: string;
}

type PlatformId =
  | 'gtm'
  | 'ga4'
  | 'meta'
  | 'linkedin'
  | 'tiktok'
  | 'bing'
  | 'pinterest'
  | 'nextdoor';

interface HelpSection {
  title: string;
  content: React.ReactNode;
}

// ─── Help Content ─────────────────────────────────────────────────────────────

const HELP_CONTENT: Record<PlatformId, HelpSection[]> = {
  ga4: [
    {
      title: 'What is this?',
      content: (
        <p style={ { margin: 0 } }>
          Google's tool for understanding your website traffic. It tracks who visits your site, how they found you, what pages they look at, and whether they take actions that matter to your business — like submitting a form or clicking your phone number.
        </p>
      ),
    },
    {
      title: 'When should I use it?',
      content: (
        <p style={ { margin: 0 } }>
          If you want to see where your website visitors are coming from and what they're doing on your site. GA4 automatically tracks page views, how long people stay, which marketing channels are sending traffic, what devices they're using, and where they're located.
        </p>
      ),
    },
    {
      title: 'When should I skip it?',
      content: (
        <p style={ { margin: 0 } }>
          If your agency already set up GA4 through Google Tag Manager. Turning it on here and in GTM will count every visitor twice. If you're not sure, ask your agency whether GA4 is already running through GTM — if it is, leave this toggle off.
        </p>
      ),
    },
    {
      title: 'How to find your ID',
      content: (
        <ol style={ { margin: 0, paddingLeft: '20px' } }>
          <li>Go to analytics.google.com and sign in</li>
          <li>Select your property (or create one)</li>
          <li>Go to <strong>Admin → Data Streams</strong> and click your web stream</li>
          <li>Your Measurement ID looks like <strong>G-XXXXXXXXXX</strong></li>
          <li>Paste it below and flip the toggle</li>
        </ol>
      ),
    },
  ],
  gtm: [
    {
      title: 'What is this?',
      content: (
        <p style={ { margin: 0 } }>
          A free tool from Google that acts as a central control panel for all your tracking codes. Instead of adding each one individually, you manage them all from one place.
        </p>
      ),
    },
    {
      title: 'When should I use it?',
      content: (
        <p style={ { margin: 0 } }>
          If your agency or web developer set up GTM for you, or if you already have a GTM account, use this option. It lets you add, change, or remove tracking codes later without touching your website directly.
        </p>
      ),
    },
    {
      title: 'When should I skip it?',
      content: (
        <p style={ { margin: 0 } }>
          If you've never heard of GTM or don't have an account, skip it. You can connect Google Analytics, Facebook, LinkedIn, and the rest individually using their own toggles below — no GTM required.
        </p>
      ),
    },
    {
      title: 'How to find your ID',
      content: (
        <>
          <p style={ { margin: '0 0 12px' } }>
            <strong>Important:</strong> If you turn on GTM here and also turn on Google Analytics or Facebook individually, those tracking codes will load twice — which means your data will be counted double. Pick one approach: manage everything through GTM, or enable each platform on its own. Not both.
          </p>
          <ol style={ { margin: 0, paddingLeft: '20px' } }>
            <li>Go to tagmanager.google.com and sign in</li>
            <li>Select your account and container</li>
            <li>Your GTM ID is in the top-right corner — it looks like <strong>GTM-XXXXXXX</strong></li>
            <li>Paste that ID into the field below and flip the toggle to enable</li>
          </ol>
        </>
      ),
    },
  ],
  meta: [
    {
      title: 'What is this?',
      content: (
        <p style={ { margin: 0 } }>
          A small piece of tracking code from Meta that connects your website to your Facebook and Instagram advertising accounts.
        </p>
      ),
    },
    {
      title: 'When should I use it?',
      content: (
        <p style={ { margin: 0 } }>
          Without the Pixel, Facebook and Instagram have no way to see what happens after someone clicks your ad. They can't tell you which ads are producing leads, they can't show your ads to people who already visited your website, and they can't get smarter about who to show your ads to. Even if you're not running ads yet, installing it now starts building an audience you can advertise to later.
        </p>
      ),
    },
    {
      title: 'When should I skip it?',
      content: (
        <p style={ { margin: 0 } }>
          If your agency already has the Meta Pixel running through Google Tag Manager. Ask them if you're not sure.
        </p>
      ),
    },
    {
      title: 'How to find your ID',
      content: (
        <ol style={ { margin: 0, paddingLeft: '20px' } }>
          <li>Go to business.facebook.com and open <strong>Events Manager</strong></li>
          <li>Select your Pixel (or create one under <strong>Connect Data Sources → Web</strong>)</li>
          <li>Your Pixel ID looks like <strong>123456789012345</strong></li>
          <li>Paste it below and flip the toggle</li>
        </ol>
      ),
    },
  ],
  linkedin: [
    {
      title: 'What is this?',
      content: (
        <p style={ { margin: 0 } }>
          LinkedIn's tracking code. It connects your website to your LinkedIn advertising account.
        </p>
      ),
    },
    {
      title: 'When should I use it?',
      content: (
        <p style={ { margin: 0 } }>
          If you sell to other businesses, this is especially valuable. It powers LinkedIn ad retargeting (showing your ads to people who already visited your site) and conversion tracking (knowing which LinkedIn ads are producing results). It also unlocks LinkedIn's Website Demographics report, which shows you the job titles, industries, and company sizes of the people visiting your website — even if they never fill out a form.
        </p>
      ),
    },
    {
      title: 'When should I skip it?',
      content: (
        <p style={ { margin: 0 } }>
          If your agency already has the LinkedIn Insight Tag running through Google Tag Manager.
        </p>
      ),
    },
    {
      title: 'How to find your ID',
      content: (
        <ol style={ { margin: 0, paddingLeft: '20px' } }>
          <li>Go to linkedin.com/campaignmanager and sign in</li>
          <li>Select your ad account</li>
          <li>Go to <strong>Analyze → Insight Tag</strong></li>
          <li>Your Partner ID looks like <strong>1234567</strong></li>
          <li>Paste it below and flip the toggle</li>
        </ol>
      ),
    },
  ],
  bing: [
    {
      title: 'What is this?',
      content: (
        <p style={ { margin: 0 } }>
          Microsoft Advertising's tracking code. It connects your website to Microsoft Ads, which places your ads on Bing, Yahoo, DuckDuckGo, and Microsoft's partner network.
        </p>
      ),
    },
    {
      title: 'When should I use it?',
      content: (
        <p style={ { margin: 0 } }>
          There's less competition on Bing than on Google, which often means a lower cost per click. The audience tends to skew older and higher income. For home services, legal, medical, and professional services, Microsoft Ads often delivers strong results for the money.
        </p>
      ),
    },
    {
      title: 'When should I skip it?',
      content: (
        <p style={ { margin: 0 } }>
          If your agency already has the UET tag running through Google Tag Manager.
        </p>
      ),
    },
    {
      title: 'How to find your ID',
      content: (
        <ol style={ { margin: 0, paddingLeft: '20px' } }>
          <li>Go to ads.microsoft.com and sign in</li>
          <li>Go to <strong>Tools → UET tag</strong></li>
          <li>Select your tag (or create one)</li>
          <li>Your UET Tag ID looks like <strong>12345678</strong></li>
          <li>Paste it below and flip the toggle</li>
        </ol>
      ),
    },
  ],
  tiktok: [
    {
      title: 'What is this?',
      content: (
        <p style={ { margin: 0 } }>
          Connects your website to your TikTok advertising account. It tracks what people do on your site after they see or click one of your TikTok ads.
        </p>
      ),
    },
    {
      title: 'When should I use it?',
      content: (
        <p style={ { margin: 0 } }>
          If you run TikTok ads, this is how TikTok knows whether they're working. Without it, TikTok can't track results or build audiences of people who've already visited your site. Even if you're not running TikTok ads today, installing it now means the platform is already collecting data when you're ready to launch.
        </p>
      ),
    },
    {
      title: 'When should I skip it?',
      content: (
        <p style={ { margin: 0 } }>
          If your agency already has the TikTok Pixel running through Google Tag Manager.
        </p>
      ),
    },
    {
      title: 'How to find your ID',
      content: (
        <ol style={ { margin: 0, paddingLeft: '20px' } }>
          <li>Go to ads.tiktok.com and sign in</li>
          <li>Navigate to <strong>Assets → Events → Web Events</strong></li>
          <li>Select your Pixel (or create one)</li>
          <li>Your Pixel ID looks like <strong>CXXXXXXXXXXXXXXXXX</strong></li>
          <li>Paste it below and flip the toggle</li>
        </ol>
      ),
    },
  ],
  pinterest: [
    {
      title: 'What is this?',
      content: (
        <p style={ { margin: 0 } }>
          Connects your website to your Pinterest advertising account. It tracks what visitors do on your site after interacting with your Pins or ads.
        </p>
      ),
    },
    {
      title: 'When should I use it?',
      content: (
        <p style={ { margin: 0 } }>
          People use Pinterest to plan purchases — they're actively researching and saving ideas before they hire or buy. That makes Pinterest traffic high-intent. It's especially valuable for visual businesses: home renovation, landscaping, interior design, real estate. If your customers browse Pinterest for ideas before they call you, this platform is worth connecting.
        </p>
      ),
    },
    {
      title: 'When should I skip it?',
      content: (
        <p style={ { margin: 0 } }>
          If your agency already has the Pinterest Tag running through Google Tag Manager.
        </p>
      ),
    },
    {
      title: 'How to find your ID',
      content: (
        <ol style={ { margin: 0, paddingLeft: '20px' } }>
          <li>Go to ads.pinterest.com and sign in</li>
          <li>Click <strong>Ads → Conversions</strong></li>
          <li>Select your tag (or create one)</li>
          <li>Your Tag ID looks like <strong>1234567890123</strong></li>
          <li>Paste it below and flip the toggle</li>
        </ol>
      ),
    },
  ],
  nextdoor: [
    {
      title: 'What is this?',
      content: (
        <p style={ { margin: 0 } }>
          Connects your website to your Nextdoor advertising account.
        </p>
      ),
    },
    {
      title: 'When should I use it?',
      content: (
        <p style={ { margin: 0 } }>
          Nextdoor is the neighborhood-level social network. The people on Nextdoor are homeowners in specific neighborhoods, actively talking about and recommending local businesses. For local service companies, it's one of the most targeted advertising platforms available.
        </p>
      ),
    },
    {
      title: 'When should I skip it?',
      content: (
        <p style={ { margin: 0 } }>
          If your agency already has the Nextdoor Pixel running through Google Tag Manager.
        </p>
      ),
    },
    {
      title: 'How to find your ID',
      content: (
        <ol style={ { margin: 0, paddingLeft: '20px' } }>
          <li>Go to ads.nextdoor.com and sign in</li>
          <li>Navigate to <strong>Measurement → Nextdoor Pixel</strong></li>
          <li>Your Pixel ID is displayed on the setup page</li>
          <li>Paste it below and flip the toggle</li>
        </ol>
      ),
    },
  ],
};

// ─── SVG Logos ────────────────────────────────────────────────────────────────

const GtmLogo = ( { size = 24 }: { size?: number } ) => (
  <svg width={ size } height={ size } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L22 7.77V16.22L12 22L2 16.22V7.77L12 2Z" fill="#4285F4" />
    <circle cx="12" cy="12" r="4" fill="white" />
  </svg>
);

const Ga4Logo = ( { size = 24 }: { size?: number } ) => (
  <svg width={ size } height={ size } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="14" width="4" height="6" rx="1" fill="#F4B400" />
    <rect x="10" y="10" width="4" height="10" rx="1" fill="#E37400" />
    <rect x="17" y="4" width="4" height="16" rx="1" fill="#D93025" />
  </svg>
);

const MetaLogo = ( { size = 24 }: { size?: number } ) => (
  <svg width={ size } height={ size } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 8C5.79086 8 4 9.79086 4 12C4 14.2091 5.79086 16 8 16C9.5 16 10.5 15 12 13.5C13.5 12 14.5 8 16 8C18.2091 8 20 9.79086 20 12C20 14.2091 18.2091 16 16 16"
      stroke="#1877F2"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LinkedinLogo = ( { size = 24 }: { size?: number } ) => (
  <svg width={ size } height={ size } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <path d="M7 9H5V18H7V9Z" fill="white" />
    <circle cx="6" cy="6.5" r="1.5" fill="white" />
    <path d="M10 9H12V10.5C12.5 9.5 13.5 9 15 9C17.5 9 19 10.5 19 13.5V18H17V13.5C17 12 16.5 11 15 11C13.5 11 12 12 12 13.5V18H10V9Z" fill="white" />
  </svg>
);

const TiktokLogo = ( { size = 24 }: { size?: number } ) => (
  <svg width={ size } height={ size } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2H15C15 4 16 5 18 5V8C16 8 14 7 13 6V15C13 17.7614 10.7614 20 8 20C5.23858 20 3 17.7614 3 15C3 12.2386 5.23858 10 8 10V13C6.89543 13 6 13.8954 6 15C6 16.1046 6.89543 17 8 17C9.10457 17 10 16.1046 10 15V2H12Z"
      fill="#000000"
    />
  </svg>
);

const BingLogo = ( { size = 24 }: { size?: number } ) => (
  <svg width={ size } height={ size } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="8" height="8" fill="#F25022" />
    <rect x="13" y="3" width="8" height="8" fill="#7FBA00" />
    <rect x="3" y="13" width="8" height="8" fill="#00A4EF" />
    <rect x="13" y="13" width="8" height="8" fill="#FFB900" />
  </svg>
);

const PinterestLogo = ( { size = 24 }: { size?: number } ) => (
  <svg width={ size } height={ size } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#E60023" />
    <path
      d="M12 6C9.5 6 8 7.5 8 9.5C8 10.5 8.5 11.5 9.5 11.5C9.8 11.5 10 11.2 10 11C10 10.8 9.8 10.2 9.8 10C9.8 8.5 11 7.5 12.5 7.5C14 7.5 15 8.5 15 10C15 12 14 13.5 12.5 13.5C11.5 13.5 11 12.8 11 12C11 11 11.5 9.5 11.5 8.5C11.5 7.8 11 7 10 7C8.8 7 8 8 8 9.5C8 10.5 8.2 11.2 8.5 12C8.2 13.5 7.5 16 7.5 17.5C7.5 18 7.8 18.5 8 18.5C8.2 18.5 9.5 15 10 13.5C10.5 14.5 11.5 15 12.5 15C15 15 17 12.5 17 10C17 7.5 15 6 12 6Z"
      fill="white"
    />
  </svg>
);

const NextdoorLogo = ( { size = 24 }: { size?: number } ) => (
  <svg width={ size } height={ size } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L2 11H5V21H19V11H22L12 3Z" fill="#8ED500" />
    <path d="M12 8L16 11V18H8V11L12 8Z" fill="white" />
  </svg>
);

const PLATFORM_LOGOS: Record<PlatformId, React.FC<{ size?: number }>> = {
  gtm: GtmLogo,
  ga4: Ga4Logo,
  meta: MetaLogo,
  linkedin: LinkedinLogo,
  tiktok: TiktokLogo,
  bing: BingLogo,
  pinterest: PinterestLogo,
  nextdoor: NextdoorLogo,
};

// ─── Platform Definitions ─────────────────────────────────────────────────────

type PlatformDef = {
  id: PlatformId;
  title: string;
  color: string;
  placeholder: string;
  toggleKey: keyof TrackingValues;
  idKey: keyof TrackingValues;
  idLabel: string;
  tagline: string;
  quickAnswer: string;
};

const PLATFORMS: PlatformDef[] = [
  {
    id: 'ga4',
    title: 'Google Analytics 4 (GA4)',
    color: '#E37400',
    placeholder: 'G-XXXXXXXXXX',
    toggleKey: 'ga4Enabled',
    idKey: 'ga4Id',
    idLabel: 'Measurement ID',
    tagline: 'See who visits your website, where they come from, and what they do.',
    quickAnswer:
      "If you want to understand your website traffic, turn this on. Skip it only if your agency already manages it through Google Tag Manager.",
  },
  {
    id: 'gtm',
    title: 'Google Tag Manager (GTM)',
    color: '#4285F4',
    placeholder: 'GTM-XXXXXXX',
    toggleKey: 'gtmEnabled',
    idKey: 'gtmId',
    idLabel: 'Container ID',
    tagline: 'One container to manage all your tracking scripts — for agencies and power users.',
    quickAnswer:
      "If your agency or web developer set up GTM for you, use this. If you've never heard of GTM, skip it and enable each platform individually using the options below.",
  },
  {
    id: 'meta',
    title: 'Meta (Facebook & Instagram) Pixel',
    color: '#1877F2',
    placeholder: '123456789012345',
    toggleKey: 'metaEnabled',
    idKey: 'metaId',
    idLabel: 'Pixel ID',
    tagline: 'Connect your website to Facebook & Instagram ads so Meta can track what works.',
    quickAnswer:
      "Turn this on if you run Facebook or Instagram ads, or plan to. Even if you're not running ads yet, installing it now starts building an audience. Skip it if it's already in your Google Tag Manager.",
  },
  {
    id: 'linkedin',
    title: 'LinkedIn Insight Tag',
    color: '#0A66C2',
    placeholder: '1234567',
    toggleKey: 'linkedinEnabled',
    idKey: 'linkedinId',
    idLabel: 'Partner ID',
    tagline: 'Track LinkedIn ad performance and see which professionals visit your site.',
    quickAnswer:
      "Worth enabling if you sell to other businesses — even without ads, you get free data about which professionals visit your site. Skip it if it's already in your Google Tag Manager.",
  },
  {
    id: 'bing',
    title: 'Microsoft (Bing) UET Tag',
    color: '#00A4EF',
    placeholder: '12345678',
    toggleKey: 'bingEnabled',
    idKey: 'bingId',
    idLabel: 'UET Tag ID',
    tagline: "Reach buyers on Bing, Yahoo, and DuckDuckGo — often at a lower cost than Google.",
    quickAnswer:
      "Enable this if you run Microsoft/Bing ads. The audience tends to skew older and higher income. Skip if it's already in GTM.",
  },
  {
    id: 'tiktok',
    title: 'TikTok Pixel',
    color: '#000000',
    placeholder: 'CXXXXXXXXXXXXXXXXX',
    toggleKey: 'tiktokEnabled',
    idKey: 'tiktokId',
    idLabel: 'Pixel ID',
    tagline: 'Let TikTok know which ads are driving real results on your website.',
    quickAnswer:
      "Enable this if you run TikTok ads or plan to. Even if you're not running TikTok ads today, installing it now means the platform is already collecting data when you're ready. Skip it if it's already in your Google Tag Manager.",
  },
  {
    id: 'pinterest',
    title: 'Pinterest Tag',
    color: '#E60023',
    placeholder: '1234567890123',
    toggleKey: 'pinterestEnabled',
    idKey: 'pinterestId',
    idLabel: 'Tag ID',
    tagline: 'Reach high-intent buyers who are actively planning their next purchase.',
    quickAnswer:
      "Especially valuable for visual businesses — home renovation, landscaping, interior design, real estate. If your customers browse Pinterest for ideas before they call you, this is worth connecting. Skip if it's already in GTM.",
  },
  {
    id: 'nextdoor',
    title: 'Nextdoor Pixel',
    color: '#8ED500',
    placeholder: '12345',
    toggleKey: 'nextdoorEnabled',
    idKey: 'nextdoorId',
    idLabel: 'Pixel ID',
    tagline: 'Connect with homeowners in your service area on the neighborhood network.',
    quickAnswer:
      "Great for local service businesses. Nextdoor reaches homeowners in specific neighborhoods who are actively looking for and recommending local businesses. Skip if you don't run Nextdoor ads or it's already in your Google Tag Manager.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccordionItem( { title, content, isLast }: { title: string; content: React.ReactNode; isLast: boolean } ) {
  const [ isOpen, setIsOpen ] = useState( false );
  return (
    <div style={ { borderBottom: isLast ? 'none' : '1px solid #e2e8f0' } }>
      <button
        onClick={ () => setIsOpen( ! isOpen ) }
        style={ {
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: isOpen ? '#f8fafc' : '#fff',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '15px',
          fontWeight: '600',
          color: '#1e293b',
        } }
      >
        { title }
        <span style={ { transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: '#64748b' } }>
          ▼
        </span>
      </button>
      { isOpen && (
        <div style={ { padding: '16px', backgroundColor: '#fff', fontSize: '14px', color: '#475569', lineHeight: '1.6' } }>
          { content }
        </div>
      ) }
    </div>
  );
}

function RecommendationCallout( { platform, values }: { platform: PlatformDef; values: TrackingValues } ) {
  const isEnabled = values[ platform.toggleKey ] as boolean;
  const idValue = values[ platform.idKey ] as string;
  const isGtmEnabled = values.gtmEnabled;
  const isDoubleFiringRisk = isGtmEnabled && isEnabled && platform.id !== 'gtm';
  const isOtherEnabledWhileGtm =
    platform.id === 'gtm' &&
    isEnabled &&
    ( values.ga4Enabled || values.metaEnabled || values.linkedinEnabled ||
      values.tiktokEnabled || values.bingEnabled || values.pinterestEnabled || values.nextdoorEnabled );

  return (
    <div style={ { display: 'flex', flexDirection: 'column', gap: '8px' } }>
      { isOtherEnabledWhileGtm && (
        <div style={ { backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px' } }>
          <p style={ { margin: 0, fontSize: '14px', color: '#92400e', lineHeight: '1.5' } }>
            <strong>Heads up:</strong> You also have individual tracking pixels enabled below. If those
            same pixels are already configured inside this GTM container, they'll fire twice. Pick one
            approach — GTM or individual pixels, not both.
          </p>
        </div>
      ) }

      { isDoubleFiringRisk && (
        <div style={ { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '8px' } }>
          <p style={ { margin: 0, fontSize: '14px', color: '#991b1b', lineHeight: '1.5' } }>
            <strong>Double-firing risk:</strong> Google Tag Manager is also enabled. If{ ' ' }
            { platform.title } is already configured in your GTM container, you're double-counting.
          </p>
        </div>
      ) }

      { isEnabled && (
        idValue ? (
          <div style={ { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px' } }>
            <p style={ { margin: 0, fontSize: '14px', color: '#166534', lineHeight: '1.5' } }>
              <strong>You're all set.</strong> { platform.title } is active. Your { platform.idLabel } is configured.
            </p>
          </div>
        ) : (
          <div style={ { backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px' } }>
            <p style={ { margin: 0, fontSize: '14px', color: '#92400e', lineHeight: '1.5' } }>
              <strong>Action required:</strong> You've enabled { platform.title } but haven't entered your{ ' ' }
              { platform.idLabel } yet. Paste it below to start tracking.
            </p>
          </div>
        )
      ) }
    </div>
  );
}

// ─── Technical Help Modal ─────────────────────────────────────────────────────

function TechnicalHelpModal( { onClose }: { onClose: () => void } ) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How Your Tracking Pixels Work"
      style={ {
        position: 'fixed', inset: 0, zIndex: 100000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      } }
    >
      { /* Backdrop */ }
      <div
        onClick={ onClose }
        style={ { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' } }
      />

      { /* Panel */ }
      <div style={ {
        position: 'relative', background: '#fff', borderRadius: 8,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: 680, width: '100%', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
      } }>
        { /* Header */ }
        <div style={ {
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
        } }>
          <h2 style={ { margin: 0, fontSize: '1.0625rem', fontWeight: 600, color: '#0f172a' } }>How Your Tracking Pixels Work</h2>
          <button
            onClick={ onClose }
            aria-label="Close"
            style={ { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748b', lineHeight: 1, padding: '0.25rem' } }
          >✕</button>
        </div>

        { /* Body */ }
        <div style={ { padding: '1.5rem', overflowY: 'auto', fontSize: '0.875rem', lineHeight: 1.7, color: '#334155' } }>

          <h3 style={ { margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' } }>Where your tracking IDs are stored</h3>
          <p style={ { margin: '0 0 1.25rem' } }>
            Your tracking IDs (the codes you paste into each platform field) are saved securely in your WordPress database — the same place WordPress stores all of your site's settings. They never leave your server and are never sent to any third party. If you deactivate or uninstall the plugin, your tracking IDs are removed along with it.
          </p>

          <h3 style={ { margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' } }>How tracking codes are added to your pages</h3>
          <p style={ { margin: '0 0 0.75rem' } }>
            Every time someone visits a page on your website, WordPress builds that page before sending it to the visitor's browser. During that process, the plugin checks which platforms you've enabled and injects the appropriate tracking code into the page — the same way your theme adds stylesheets or other plugins add their own scripts.
          </p>
          <p style={ { margin: '0 0 0.75rem' } }>
            Platform tracking codes (like the Meta Pixel, LinkedIn Insight Tag, or Google Analytics snippet) are added to the <code>&lt;head&gt;</code> section of every page. This is the standard location recommended by each platform and ensures the code loads as early as possible, before the visitor sees any content.
          </p>
          <p style={ { margin: '0 0 1.25rem' } }>
            Any custom code you add in the Custom Head Code field (under Activation → Custom Code) is injected in the same location. Code in the Custom Footer Code field is added just before the closing <code>&lt;/body&gt;</code> tag at the bottom of every page.
          </p>

          <h3 style={ { margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' } }>Where the tracking code comes from</h3>
          <p style={ { margin: '0 0 1.25rem' } }>
            The plugin does not host or serve tracking code from its own servers. When you enable a platform — say, Google Analytics — the plugin adds a small snippet to your pages that tells the visitor's browser to load Google's official tracking script directly from Google's servers. The same applies to every other platform: Meta's code loads from Meta, LinkedIn's from LinkedIn, TikTok's from TikTok, and so on. This means the tracking code is always up to date with each platform's latest version, and your website is never dependent on ROI Insights to serve it.
          </p>

          <h3 style={ { margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' } }>What happens when a visitor lands on your page</h3>
          <ol style={ { margin: '0 0 1.25rem', paddingLeft: '1.25rem', lineHeight: 1.8 } }>
            <li style={ { marginBottom: '0.4rem' } }>A visitor arrives on your website. WordPress builds the page and the plugin injects your enabled tracking codes into the page's HTML.</li>
            <li style={ { marginBottom: '0.4rem' } }>The visitor's browser loads the page. As it reads the HTML, it encounters the tracking snippets in the <code>&lt;head&gt;</code> section and loads each platform's official script from that platform's servers.</li>
            <li style={ { marginBottom: '0.4rem' } }>Each platform's script runs. It records the page visit and sends the data back to that platform.</li>
            <li style={ { marginBottom: '0.4rem' } }>The plugin's own tracking script also runs. It listens for specific actions the visitor takes — submitting a form, clicking a phone number, requesting directions, or arriving on a thank-you or booking confirmation page.</li>
            <li style={ { marginBottom: '0.4rem' } }>Attribution data is attached. The plugin automatically captures how the visitor found you (which ad they clicked, which search term they used, UTM parameters from your tracking links) and attaches that information to every event.</li>
            <li>Events are pushed to the data layer. All tracked events and their attribution data are made available in a standard format (<code>window.dataLayer</code>) that Google Tag Manager and other tools can read.</li>
          </ol>

          <h3 style={ { margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' } }>Google account credentials</h3>
          <p style={ { margin: '0 0 1.25rem' } }>
            When you connect your Google account under Activation → Connect Google Services, your Google login credentials (OAuth tokens) are stored securely on the ROI Insights backend server — not in your WordPress database. The plugin only requests read-only access, meaning it can view your Analytics and Search Console data but cannot make any changes to your Google accounts.
          </p>

          <h3 style={ { margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' } }>What the plugin does NOT do</h3>
          <ul style={ { margin: '0 0 1.25rem', paddingLeft: '1.25rem', lineHeight: 1.8 } }>
            <li style={ { marginBottom: '0.4rem' } }>It does not slow down your website. Tracking scripts are loaded asynchronously, meaning they don't block your page content from appearing.</li>
            <li style={ { marginBottom: '0.4rem' } }>It does not store visitor data on your server. Visitor data is sent directly to each platform (Google, Meta, LinkedIn, etc.) by their own scripts.</li>
            <li>It does not send your data to ROI Insights. Your tracking pixel IDs and the data those pixels collect stay between your website and the platforms you've connected.</li>
          </ul>

          <h3 style={ { margin: '0 0 0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' } }>Quick reference</h3>
          <div style={ { overflowX: 'auto', marginBottom: '1.25rem' } }>
            <table style={ { width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' } }>
              <thead>
                <tr style={ { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' } }>
                  <th style={ { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' } }>What</th>
                  <th style={ { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' } }>Where it's stored</th>
                  <th style={ { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' } }>Where it's served from</th>
                </tr>
              </thead>
              <tbody>
                { [
                  [ 'Your tracking IDs', 'Your WordPress database', 'Not served externally' ],
                  [ 'Platform tracking scripts (GA4, Meta, LinkedIn, etc.)', 'Not stored on your server', "Loaded from each platform's official servers" ],
                  [ 'Tracked events', 'Sent to each platform in real time', 'Not stored in your WordPress database' ],
                  [ 'Attribution data (UTMs, click IDs)', "Attached to events in the browser's data layer", 'Available to GTM and connected platforms in real time' ],
                  [ 'Google account credentials (OAuth tokens)', 'ROI Insights backend server', 'Never stored in your WordPress database' ],
                  [ 'Custom code snippets', 'Your WordPress database', 'Injected directly into your page HTML' ],
                ].map( ( [ what, stored, served ], i ) => (
                  <tr key={ i } style={ { borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#f8fafc' } }>
                    <td style={ { padding: '9px 12px', color: '#1e293b', fontWeight: 500 } }>{ what }</td>
                    <td style={ { padding: '9px 12px', color: '#475569' } }>{ stored }</td>
                    <td style={ { padding: '9px 12px', color: '#475569' } }>{ served }</td>
                  </tr>
                ) ) }
              </tbody>
            </table>
          </div>

          <p style={ { margin: 0, fontSize: '0.8125rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' } }>
            If you have questions about how the plugin handles your data, contact <a href="mailto:jim@mosierdata.com" style={ { color: '#16a34a' } }>jim@mosierdata.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Core Settings Page ───────────────────────────────────────────────────────

function TrackingSettingsPage( { values, onChange }: { values: TrackingValues; onChange: ( v: TrackingValues ) => void } ) {
  const [ activePlatform, setActivePlatform ] = useState<PlatformId | null>( null );
  const [ showHelp, setShowHelp ] = useState( false );

  const handleToggle = ( key: keyof TrackingValues, checked: boolean ) => {
    onChange( { ...values, [ key ]: checked } );
  };

  const handleTextChange = ( key: keyof TrackingValues, text: string ) => {
    onChange( { ...values, [ key ]: text } );
  };

  const isGtmEnabled = values.gtmEnabled;
  const isOtherEnabled = values.ga4Enabled || values.metaEnabled || values.linkedinEnabled ||
    values.tiktokEnabled || values.bingEnabled || values.pinterestEnabled || values.nextdoorEnabled;
  const showDoubleFiringWarning = isGtmEnabled && isOtherEnabled;

  return (
    <div style={ { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif', color: '#0f172a', maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', boxSizing: 'border-box' } }>
      { showHelp && <TechnicalHelpModal onClose={ () => setShowHelp( false ) } /> }

      { activePlatform === null ? (
        <div>
          { /* Header */ }
          <div style={ { marginBottom: '24px' } }>
            <div style={ { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } }>
              <h1 style={ { margin: 0, fontSize: '22px', fontWeight: 600, color: '#0f172a' } }>Tracking Pixels</h1>
              <button
                onClick={ () => setShowHelp( true ) }
                aria-label="How Your Tracking Pixels Work"
                title="How Your Tracking Pixels Work"
                style={ {
                  width: 26, height: 26,
                  borderRadius: '50%',
                  border: '1.5px solid #94a3b8',
                  background: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                } }
              >?</button>
            </div>
            <p style={ { margin: 0, color: '#475569', fontSize: '14px', lineHeight: 1.6 } }>
              Connect your advertising platforms so they can see what happens after someone clicks your ad.
            </p>
          </div>

          { /* Info callout */ }
          <div style={ {
            marginBottom: '24px',
            padding: '14px 16px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderLeft: '3px solid #d97706',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#78350f',
            lineHeight: 1.6,
          } }>
            You only need to set up the platforms you actually advertise on. If you don't run ads on a platform, skip it. If your agency uses Google Tag Manager, ask them before enabling anything here — some of these may already be connected through GTM.
          </div>

          { showDoubleFiringWarning && (
            <div style={ { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderLeft: '3px solid #dc2626', padding: '14px 16px', borderRadius: '6px', marginBottom: '24px', fontSize: '13px', color: '#991b1b', lineHeight: 1.6 } }>
              <strong>Double-firing risk:</strong> You have Google Tag Manager enabled along with other individual tracking pixels. If those pixels are also configured inside your GTM container, they will load twice. Pick one approach: manage everything through GTM, or enable each platform individually here.
            </div>
          ) }

          <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' } }>
            { PLATFORMS.map( platform => {
              const isEnabled = values[ platform.toggleKey ] as boolean;
              const idValue = values[ platform.idKey ] as string;
              const Logo = PLATFORM_LOGOS[ platform.id ];
              const showGtmNote = isGtmEnabled && platform.id !== 'gtm';

              return (
                <div
                  key={ platform.id }
                  onClick={ () => setActivePlatform( platform.id ) }
                  style={ { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'box-shadow 0.15s, transform 0.15s' } }
                  onMouseEnter={ e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }
                  onMouseLeave={ e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; } }
                >
                  <div style={ { display: 'flex', alignItems: 'center', gap: '10px' } }>
                    <Logo size={ 24 } />
                    <span style={ { fontSize: '14px', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 } }>{ platform.title }</span>
                  </div>

                  <div style={ { display: 'flex', alignItems: 'center', gap: '6px' } }>
                    <div style={ { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isEnabled ? '#16a34a' : '#cbd5e1', flexShrink: 0 } } />
                    <span style={ { fontSize: '13px', fontWeight: 500, color: isEnabled ? '#15803d' : '#64748b' } }>
                      { isEnabled ? ( idValue ? 'Active' : 'Enabled — ID missing' ) : 'Not configured' }
                    </span>
                  </div>

                  { isEnabled && idValue && (
                    <div style={ { padding: '5px 8px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', fontFamily: 'monospace', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }>
                      { idValue }
                    </div>
                  ) }

                  { showGtmNote && (
                    <div style={ { padding: '6px 8px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px', fontSize: '11px', color: '#0369a1', lineHeight: 1.4 } }>
                      GTM active — check before enabling
                    </div>
                  ) }
                </div>
              );
            } ) }
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={ () => setActivePlatform( null ) }
            style={ { background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, marginBottom: '24px', fontSize: '14px', fontWeight: 500, fontFamily: 'inherit' } }
          >
            ← Back to all platforms
          </button>

          { ( () => {
            const platform = PLATFORMS.find( p => p.id === activePlatform )!;
            const isEnabled = values[ platform.toggleKey ] as boolean;
            const idValue = values[ platform.idKey ] as string;
            const Logo = PLATFORM_LOGOS[ platform.id ];
            const findIdSection = HELP_CONTENT[ platform.id ].find( s => s.title === 'How to find your ID' );

            return (
              <div style={ { maxWidth: '800px' } }>
                <div style={ { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '16px' } }>
                  { /* Platform header */ }
                  <div style={ { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' } }>
                    <Logo size={ 36 } />
                    <h2 style={ { margin: 0, fontSize: '20px', fontWeight: 600, color: '#0f172a' } }>{ platform.title }</h2>
                  </div>
                  <p style={ { margin: '0 0 20px', fontSize: '14px', color: '#475569', lineHeight: 1.6 } }>
                    { platform.tagline }
                  </p>

                  { /* Quick answer callout */ }
                  <div style={ {
                    marginBottom: '24px',
                    padding: '14px 16px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderLeft: '3px solid #0369a1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#0c4a6e',
                    lineHeight: 1.6,
                  } }>
                    <strong>Should I enable this?</strong> { platform.quickAnswer }
                  </div>

                  <RecommendationCallout platform={ platform } values={ values } />

                  { /* Toggle + ID field side by side */ }
                  <div style={ { marginTop: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' } }>
                    { /* Toggle */ }
                    <div style={ { flexShrink: 0, width: '180px' } }>
                      <label style={ { display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '10px' } }>
                        Status
                      </label>
                      <label style={ { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' } }>
                        <div style={ { position: 'relative', flexShrink: 0 } }>
                          <input
                            type="checkbox"
                            checked={ isEnabled }
                            onChange={ e => handleToggle( platform.toggleKey, e.target.checked ) }
                            style={ { opacity: 0, width: 0, height: 0, position: 'absolute' } }
                          />
                          <div style={ { width: '42px', height: '23px', backgroundColor: isEnabled ? '#16a34a' : '#cbd5e1', borderRadius: '9999px', position: 'relative', transition: 'background 0.2s' } }>
                            <div style={ { position: 'absolute', top: '2px', left: isEnabled ? '21px' : '2px', width: '19px', height: '19px', backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' } } />
                          </div>
                        </div>
                        <span style={ { fontSize: '14px', fontWeight: 500, color: isEnabled ? '#15803d' : '#64748b' } }>
                          { isEnabled ? 'Enabled' : 'Disabled' }
                        </span>
                      </label>
                    </div>

                    { /* ID field */ }
                    <div style={ { flex: 1, minWidth: '200px' } }>
                      <label style={ { display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' } }>
                        { platform.idLabel }
                      </label>
                      <input
                        type="text"
                        value={ idValue }
                        onChange={ e => handleTextChange( platform.idKey, e.target.value ) }
                        disabled={ ! isEnabled }
                        placeholder={ isEnabled ? platform.placeholder : 'Turn on the toggle to enter your ID.' }
                        style={ { width: '100%', padding: '9px 12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: isEnabled ? '#fff' : '#f8fafc', color: isEnabled ? '#0f172a' : '#94a3b8', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' } }
                      />
                      { findIdSection && (
                        <details style={ { marginTop: '8px' } }>
                          <summary style={ { fontSize: '12px', color: '#16a34a', cursor: 'pointer', userSelect: 'none', listStyle: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' } }>
                            Where do I find this?
                          </summary>
                          <div style={ { marginTop: '8px', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#475569', lineHeight: 1.6 } }>
                            { findIdSection.content }
                          </div>
                        </details>
                      ) }
                    </div>
                  </div>
                </div>

                { /* Setup Guide accordion */ }
                <div style={ { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } }>
                  <div style={ { padding: '16px 20px', borderBottom: '1px solid #e2e8f0' } }>
                    <h3 style={ { margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a' } }>Setup Guide</h3>
                  </div>
                  { HELP_CONTENT[ platform.id ].map( ( section, idx ) => (
                    <AccordionItem
                      key={ idx }
                      title={ section.title }
                      content={ section.content }
                      isLast={ idx === HELP_CONTENT[ platform.id ].length - 1 }
                    />
                  ) ) }
                </div>
              </div>
            );
          } )() }
        </div>
      ) }
    </div>
  );
}

// ─── Admin Wrapper — loads/saves via REST API ─────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AdvancedSettings {
  dniSwapNumber: string;
  dniScriptUrl: string;
  customHeadCode: string;
  customFooterCode: string;
  debug: boolean;
}

export function TrackingSettingsAdmin() {
  const [ values, setValues ] = useState<TrackingValues | null>( null );
  const [ saveStatus, setSaveStatus ] = useState<SaveStatus>( 'idle' );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>( null );

  const [ advanced, setAdvanced ] = useState<AdvancedSettings>( {
    dniSwapNumber: '', dniScriptUrl: '', customHeadCode: '', customFooterCode: '', debug: false,
  } );
  const [ advancedLoaded, setAdvancedLoaded ] = useState( false );
  const [ savingAdvanced, setSavingAdvanced ] = useState( false );
  const [ advancedMessage, setAdvancedMessage ] = useState( '' );
  const [ showAdvanced, setShowAdvanced ] = useState( false );

  useEffect( () => {
    void api.get<TrackingValues>( 'tracking/settings' ).then( setValues );
    void api.get<AdvancedSettings>( 'settings/load' ).then( d => { setAdvanced( d ); setAdvancedLoaded( true ); } ).catch( () => {} );
  }, [] );

  const handleChange = useCallback( ( next: TrackingValues ) => {
    setValues( next );
    setSaveStatus( 'saving' );

    if ( saveTimer.current ) clearTimeout( saveTimer.current );
    saveTimer.current = setTimeout( () => {
      void api.post( 'tracking/save', next )
        .then( () => {
          setSaveStatus( 'saved' );
          setTimeout( () => setSaveStatus( 'idle' ), 2000 );
        } )
        .catch( () => setSaveStatus( 'error' ) );
    }, 600 );
  }, [] );

  const handleSaveAdvanced = useCallback( async () => {
    setSavingAdvanced( true );
    setAdvancedMessage( '' );
    try {
      await api.post( 'settings/save', advanced );
      setAdvancedMessage( 'Settings saved.' );
    } catch {
      setAdvancedMessage( 'Error saving settings.' );
    } finally {
      setSavingAdvanced( false );
    }
  }, [ advanced ] );

  if ( ! values ) {
    return <div style={ { padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' } }>Loading tracking settings…</div>;
  }

  const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

  return (
    <div>
      { saveStatus !== 'idle' && (
        <div
          style={ {
            position: 'sticky',
            top: 0,
            zIndex: 50,
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: '500',
            textAlign: 'center',
            backgroundColor: saveStatus === 'error' ? '#fef2f2' : saveStatus === 'saved' ? '#f0fdf4' : '#f8fafc',
            color: saveStatus === 'error' ? '#991b1b' : saveStatus === 'saved' ? '#166534' : '#64748b',
            borderBottom: '1px solid',
            borderColor: saveStatus === 'error' ? '#fca5a5' : saveStatus === 'saved' ? '#bbf7d0' : '#e2e8f0',
          } }
        >
          { saveStatus === 'saving' && 'Saving…' }
          { saveStatus === 'saved' && 'Changes saved' }
          { saveStatus === 'error' && 'Error saving — please try again' }
        </div>
      ) }

      <TrackingSettingsPage values={ values } onChange={ handleChange } />

      {/* ── Custom Code (Advanced) ── */}
      <div style={ { maxWidth: 1200, margin: '0 auto', padding: '0 24px 32px', boxSizing: 'border-box' } }>
        <div style={ {
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        } }>
          <button
            onClick={ () => setShowAdvanced( v => ! v ) }
            style={ {
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: font,
            } }
          >
            <span style={ { fontSize: 16, fontWeight: 600, color: '#0f172a' } }>
              Custom Code (Advanced) { showAdvanced ? '▲' : '▼' }
            </span>
          </button>

          { ! showAdvanced && (
            <p style={ { margin: '8px 0 0', fontSize: 13, color: '#94a3b8' } }>
              For agencies and developers who need to add additional tracking scripts.
            </p>
          ) }

          { showAdvanced && (
            <div style={ { marginTop: 20, paddingTop: 20, borderTop: '1px solid #e2e8f0' } }>
              <p style={ { margin: '0 0 12px', fontSize: 14, color: '#475569', lineHeight: 1.6 } }>
                If you use a tracking tool that doesn't have its own toggle above — like Hotjar, Microsoft Clarity, or CallRail's standalone code — you can paste it here and the plugin will add it to your website for you.
              </p>
              <p style={ { margin: '0 0 24px', fontSize: 13, color: '#94a3b8', lineHeight: 1.5 } }>
                <em>Tip: If you're not sure whether you need this section, you probably don't. This is mainly for agencies or developers who have additional tracking tools to install.</em>
              </p>

              <div style={ { marginBottom: 16 } }>
                <label style={ { display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, fontFamily: font } }>
                  Custom &lt;head&gt; Code
                </label>
                <textarea
                  value={ advanced.customHeadCode }
                  onChange={ e => setAdvanced( a => ( { ...a, customHeadCode: e.target.value } ) ) }
                  rows={ 5 }
                  style={ {
                    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 6,
                    fontSize: 13, fontFamily: 'monospace', color: '#0f172a', boxSizing: 'border-box',
                    resize: 'vertical', outline: 'none',
                  } }
                />
                <p style={ { margin: '4px 0 0', fontSize: 12, color: '#94a3b8', fontFamily: font } }>
                  Code added here will appear in the head section of every page.
                </p>
              </div>

              <div style={ { marginBottom: 24 } }>
                <label style={ { display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, fontFamily: font } }>
                  Custom Footer Code
                </label>
                <textarea
                  value={ advanced.customFooterCode }
                  onChange={ e => setAdvanced( a => ( { ...a, customFooterCode: e.target.value } ) ) }
                  rows={ 5 }
                  style={ {
                    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 6,
                    fontSize: 13, fontFamily: 'monospace', color: '#0f172a', boxSizing: 'border-box',
                    resize: 'vertical', outline: 'none',
                  } }
                />
                <p style={ { margin: '4px 0 0', fontSize: 12, color: '#94a3b8', fontFamily: font } }>
                  Code added here will appear at the bottom of every page.
                </p>
              </div>

              {/* Debug toggle */}
              <div style={ {
                padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 24,
              } }>
                <label style={ { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' } }>
                  <div style={ { position: 'relative' } }>
                    <input
                      type="checkbox"
                      checked={ advanced.debug }
                      onChange={ e => setAdvanced( a => ( { ...a, debug: e.target.checked } ) ) }
                      style={ { opacity: 0, width: 0, height: 0, position: 'absolute' } }
                    />
                    <div style={ {
                      width: 36, height: 20,
                      backgroundColor: advanced.debug ? '#16a34a' : '#cbd5e1',
                      borderRadius: 9999, position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                    } }>
                      <div style={ {
                        position: 'absolute', top: 2, left: advanced.debug ? 18 : 2,
                        width: 16, height: 16, background: '#fff', borderRadius: '50%',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      } } />
                    </div>
                  </div>
                  <div>
                    <span style={ { fontSize: 14, fontWeight: 500, color: '#0f172a', fontFamily: font } }>
                      Debug Mode
                    </span>
                    <p style={ { margin: '2px 0 0', fontSize: 12, color: '#94a3b8', fontFamily: font } }>
                      Logs attribution and tracking activity to the browser console on every page load.
                    </p>
                  </div>
                </label>
              </div>

              <button
                onClick={ () => void handleSaveAdvanced() }
                disabled={ savingAdvanced || ! advancedLoaded }
                style={ {
                  padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff',
                  backgroundColor: ( savingAdvanced || ! advancedLoaded ) ? '#94a3b8' : '#16a34a',
                  border: 'none', borderRadius: 6, cursor: ( savingAdvanced || ! advancedLoaded ) ? 'not-allowed' : 'pointer',
                  fontFamily: font, transition: 'background 0.15s',
                } }
              >
                { savingAdvanced ? 'Saving…' : 'Save Settings' }
              </button>

              { advancedMessage && (
                <p style={ {
                  margin: '12px 0 0', fontSize: 13, fontFamily: font,
                  color: advancedMessage.startsWith( 'Error' ) ? '#dc2626' : '#16a34a',
                } }>
                  { advancedMessage }
                </p>
              ) }
            </div>
          ) }
        </div>
      </div>
    </div>
  );
}
