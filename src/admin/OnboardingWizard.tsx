import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../lib/api';
import type { OnboardingData } from '../lib/types';

// ─── Design tokens ─────────────────────────────────────────────────────────────

const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

const c = {
  primary: '#16a34a',
  primaryHover: '#15803d',
  primaryLight: '#f0fdf4',
  primaryBorder: '#bbf7d0',
  primaryFg: '#fff',
  accent: '#f47c3c',
  cardBg: '#ffffff',
  pageBg: '#f1f5f9',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  mutedBg: '#f8fafc',
  error: '#dc2626',
  errorBg: '#fef2f2',
  errorBorder: '#fca5a5',
};

// ─── Constants (matching roi-insights-frontend/src/pages/onboarding/constants.ts) ──

type BusinessTypeSizeCategory = 'home_service' | 'specialty_retail' | 'other';

const LEGACY_BUSINESS_TYPES: { id: string; label: string; category: BusinessTypeSizeCategory }[] = [
  { id: 'hvac', label: 'HVAC', category: 'home_service' },
  { id: 'plumbing', label: 'Plumbing', category: 'home_service' },
  { id: 'electrical', label: 'Electrical', category: 'home_service' },
  { id: 'roofing', label: 'Roofing', category: 'home_service' },
  { id: 'landscaping_lawn', label: 'Landscaping & Lawn Care', category: 'home_service' },
  { id: 'pest_control', label: 'Pest Control', category: 'home_service' },
  { id: 'cleaning_maid', label: 'Cleaning & Maid Services', category: 'home_service' },
  { id: 'painting', label: 'Painting', category: 'home_service' },
  { id: 'general_contractor', label: 'General Contracting & Remodeling', category: 'home_service' },
  { id: 'sheds_portable_buildings', label: 'Sheds & Portable Buildings', category: 'specialty_retail' },
  { id: 'power_sports', label: 'Power Sports & ATVs', category: 'specialty_retail' },
  { id: 'outdoor_living', label: 'Outdoor Living & Pools', category: 'specialty_retail' },
  { id: 'professional_services', label: 'Professional Services (B2B)', category: 'other' },
  { id: 'retail_ecommerce', label: 'Retail / E-commerce', category: 'other' },
  { id: 'healthcare_medical', label: 'Healthcare & Medical', category: 'other' },
  { id: 'other', label: 'Other', category: 'other' },
];

const COMPANY_SIZE_OPTIONS: Record<BusinessTypeSizeCategory, { id: string; label: string }[]> = {
  home_service: [
    { id: '1_truck', label: '1 Truck / Owner-Operator' },
    { id: '2_5_trucks', label: '2-5 Trucks' },
    { id: '6_15_trucks', label: '6-15 Trucks' },
    { id: '16_plus_trucks', label: '16+ Trucks' },
  ],
  specialty_retail: [
    { id: '1_location', label: '1 Location' },
    { id: '2_3_locations', label: '2-3 Locations' },
    { id: '4_plus_locations', label: '4+ Locations' },
  ],
  other: [
    { id: '1_5_employees', label: '1-5 Employees' },
    { id: '6_20_employees', label: '6-20 Employees' },
    { id: '21_50_employees', label: '21-50 Employees' },
    { id: '51_plus_employees', label: '51+ Employees' },
  ],
};

function getSizeCategory( businessTypeId: string ): BusinessTypeSizeCategory {
  const legacy = LEGACY_BUSINESS_TYPES.find( b => b.id === businessTypeId );
  return legacy?.category ?? 'other';
}

function getSizeOptionsForBusiness( businessTypeId: string ) {
  return COMPANY_SIZE_OPTIONS[ getSizeCategory( businessTypeId ) ];
}

const PRIORITIES = [
  { id: 'increase_lead_volume', label: 'Increase total lead volume' },
  { id: 'lower_cpl', label: 'Lower cost per lead (CPL)' },
  { id: 'improve_local_seo', label: 'Improve local search rankings' },
  { id: 'maximize_roas', label: 'Maximize return on ad spend (ROAS)' },
  { id: 'increase_average_ticket', label: 'Increase average revenue per job' },
  { id: 'grow_brand_awareness', label: 'Grow brand awareness' },
];

const MAX_PRIORITIES = 3;

const CHANNELS = [
  { id: 'gbp_local', label: 'Google Business Profile (Maps/Local)', group: 'digital' as const },
  { id: 'google_ads', label: 'Google Ads (PPC/LSA)', group: 'digital' as const },
  { id: 'organic_seo', label: 'Organic Website Traffic (SEO)', group: 'digital' as const },
  { id: 'social_media', label: 'Social Media (Facebook/Instagram)', group: 'digital' as const },
  { id: 'email_marketing', label: 'Email Marketing', group: 'digital' as const },
  { id: 'vehicle_wraps', label: 'Vehicle Wraps & Fleet Graphics', group: 'offline' as const },
  { id: 'direct_mail', label: 'Direct Mail & Door Hangers', group: 'offline' as const },
  { id: 'yard_signs', label: 'Yard Signs', group: 'offline' as const },
  { id: 'billboards_ooh', label: 'Billboards & Outdoor (OOH)', group: 'offline' as const },
  { id: 'radio_tv', label: 'Radio/Television', group: 'offline' as const },
  { id: 'home_shows', label: 'Home Shows & Events', group: 'offline' as const },
  { id: 'referrals', label: 'Referrals / Word of Mouth', group: 'offline' as const },
];

const DEFAULT_LEAD_SOURCES: Record<string, string[]> = {
  hvac: [ 'gbp_local', 'google_ads', 'organic_seo', 'social_media', 'email_marketing', 'vehicle_wraps', 'direct_mail', 'yard_signs', 'home_shows' ],
  plumbing: [ 'gbp_local', 'google_ads', 'organic_seo', 'social_media', 'vehicle_wraps', 'direct_mail', 'yard_signs', 'referrals' ],
  electrical: [ 'gbp_local', 'google_ads', 'organic_seo', 'vehicle_wraps', 'yard_signs', 'direct_mail', 'home_shows' ],
  roofing: [ 'gbp_local', 'google_ads', 'organic_seo', 'social_media', 'yard_signs', 'vehicle_wraps', 'direct_mail', 'home_shows', 'referrals' ],
  landscaping_lawn: [ 'gbp_local', 'organic_seo', 'social_media', 'vehicle_wraps', 'yard_signs', 'direct_mail', 'home_shows' ],
  pest_control: [ 'gbp_local', 'google_ads', 'organic_seo', 'vehicle_wraps', 'direct_mail', 'yard_signs', 'referrals' ],
  cleaning_maid: [ 'gbp_local', 'organic_seo', 'social_media', 'direct_mail', 'referrals' ],
  painting: [ 'gbp_local', 'google_ads', 'organic_seo', 'social_media', 'yard_signs', 'vehicle_wraps', 'home_shows' ],
  general_contractor: [ 'gbp_local', 'google_ads', 'organic_seo', 'social_media', 'yard_signs', 'vehicle_wraps', 'home_shows', 'billboards_ooh' ],
  sheds_portable_buildings: [ 'gbp_local', 'google_ads', 'organic_seo', 'social_media', 'billboards_ooh', 'home_shows', 'radio_tv' ],
  power_sports: [ 'gbp_local', 'google_ads', 'organic_seo', 'social_media', 'vehicle_wraps', 'radio_tv', 'home_shows' ],
  outdoor_living: [ 'gbp_local', 'google_ads', 'organic_seo', 'social_media', 'home_shows', 'yard_signs', 'vehicle_wraps' ],
  professional_services: [ 'gbp_local', 'organic_seo', 'social_media', 'email_marketing', 'referrals', 'direct_mail' ],
  retail_ecommerce: [ 'gbp_local', 'organic_seo', 'social_media', 'email_marketing', 'direct_mail' ],
  healthcare_medical: [ 'gbp_local', 'organic_seo', 'social_media', 'email_marketing', 'referrals', 'direct_mail' ],
  other: [ 'gbp_local', 'google_ads', 'organic_seo', 'social_media', 'email_marketing' ],
};

const CHANNEL_IDS = new Set( CHANNELS.map( ch => ch.id ) );

function getDefaultLeadSources( businessTypeId: string ): string[] {
  const raw = DEFAULT_LEAD_SOURCES[ businessTypeId ] ?? DEFAULT_LEAD_SOURCES.other;
  return raw.filter( id => CHANNEL_IDS.has( id ) );
}

const BUDGET_BANDS = [
  { id: 'under_2k', label: 'Under $2,000' },
  { id: '2k_to_5k', label: '$2,000 - $5,000' },
  { id: '5k_to_10k', label: '$5,000 - $10,000' },
  { id: '10k_to_25k', label: '$10,000 - $25,000' },
  { id: 'over_25k', label: '$25,000+' },
];

const BUDGET_SCOPES = [
  { id: 'online_only', label: 'Online advertising only', description: 'Google Ads, social media ads, and other digital paid channels.' },
  { id: 'online_plus_traditional', label: 'Online + traditional media', description: 'Digital channels plus TV, radio, and print advertising.' },
  { id: 'all_marketing', label: 'All marketing spend', description: 'Everything — digital, traditional, vehicle wraps, yard signs, print, events, and more.' },
];

// ─── CSS keyframes ─────────────────────────────────────────────────────────────

const keyframes = `
@keyframes roi-wizard-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes roi-wizard-scan { 0% { left: -30%; } 100% { left: 100%; } }
`;

// ─── Step definitions ──────────────────────────────────────────────────────────

const STEP_LABELS = [ 'Your Website', 'Business Info', 'Priorities', 'Channels', 'Budget' ];

// ─── Searchable Select ─────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

function SearchableSelect( { options, value, onChange, placeholder }: {
  options: SelectOption[];
  value: string;
  onChange: ( value: string ) => void;
  placeholder?: string;
} ) {
  const [ open, setOpen ] = useState( false );
  const [ query, setQuery ] = useState( '' );
  const containerRef = useRef<HTMLDivElement>( null );
  const inputRef = useRef<HTMLInputElement>( null );

  const selectedLabel = options.find( o => o.value === value )?.label ?? '';

  const filtered = useMemo( () => {
    if ( ! query ) return options.slice( 0, 100 ); // show first 100 when no query
    const q = query.toLowerCase();
    return options.filter( o => o.label.toLowerCase().includes( q ) || o.value.toLowerCase().includes( q ) ).slice( 0, 100 );
  }, [ options, query ] );

  useEffect( () => {
    const handler = ( e: MouseEvent ) => {
      if ( containerRef.current && ! containerRef.current.contains( e.target as Node ) ) {
        setOpen( false );
      }
    };
    document.addEventListener( 'mousedown', handler );
    return () => document.removeEventListener( 'mousedown', handler );
  }, [] );

  return (
    <div ref={ containerRef } style={ { position: 'relative' } }>
      <div
        onClick={ () => { setOpen( true ); setTimeout( () => inputRef.current?.focus(), 0 ); } }
        style={ {
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', border: `1px solid ${ c.border }`,
          borderRadius: 8, background: '#fff', cursor: 'pointer',
          fontSize: 14, fontFamily: font, color: value ? c.textPrimary : c.textMuted,
          minHeight: 42,
        } }
      >
        <span style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>
          { selectedLabel || placeholder || 'Select…' }
        </span>
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" style={ { flexShrink: 0, marginLeft: 8, opacity: 0.4 } }>
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      { open && (
        <div style={ {
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: '#fff', border: `1px solid ${ c.border }`, borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden',
        } }>
          <div style={ { padding: 8, borderBottom: `1px solid ${ c.borderLight }` } }>
            <input
              ref={ inputRef }
              type="text"
              value={ query }
              onChange={ e => setQuery( e.target.value ) }
              placeholder="Search industries…"
              style={ {
                width: '100%', padding: '8px 10px', border: `1px solid ${ c.border }`,
                borderRadius: 6, fontSize: 14, fontFamily: font, color: c.textPrimary,
                outline: 'none', boxSizing: 'border-box',
              } }
            />
          </div>
          <div style={ { maxHeight: 240, overflowY: 'auto' } }>
            { filtered.length === 0 ? (
              <div style={ { padding: '12px 16px', fontSize: 13, color: c.textMuted, fontFamily: font } }>
                No matches found.
              </div>
            ) : filtered.map( opt => (
              <div
                key={ opt.value }
                onClick={ () => { onChange( opt.value ); setOpen( false ); setQuery( '' ); } }
                style={ {
                  padding: '8px 16px', fontSize: 14, fontFamily: font,
                  cursor: 'pointer',
                  background: opt.value === value ? c.primaryLight : 'transparent',
                  color: opt.value === value ? '#166534' : c.textPrimary,
                  fontWeight: opt.value === value ? 600 : 400,
                } }
                onMouseEnter={ e => { if ( opt.value !== value ) ( e.target as HTMLElement ).style.background = c.mutedBg; } }
                onMouseLeave={ e => { if ( opt.value !== value ) ( e.target as HTMLElement ).style.background = 'transparent'; } }
              >
                { opt.label }
              </div>
            ) ) }
          </div>
        </div>
      ) }
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  onComplete: ( data: OnboardingData ) => void;
  domain?: string;
}

export function OnboardingWizard( { onComplete, domain }: OnboardingWizardProps ) {
  const [ step, setStep ] = useState( 0 );
  const [ submitting, setSubmitting ] = useState( false );
  const [ submitError, setSubmitError ] = useState<string | null>( null );

  // Form state
  const [ businessType, setBusinessType ] = useState( '' );
  const [ companySize, setCompanySize ] = useState( '' );
  const [ priorities, setPriorities ] = useState<string[]>( [] );
  const [ leadSources, setLeadSources ] = useState<string[]>( [] );
  const [ channelDefaultsApplied, setChannelDefaultsApplied ] = useState( false );
  const [ showOffline, setShowOffline ] = useState( false );
  const [ marketingBudget, setMarketingBudget ] = useState( '' );
  const [ budgetScope, setBudgetScope ] = useState( '' );

  const siteDomain = domain ?? ( typeof window !== 'undefined' ? window.location.hostname : 'your site' );

  // Merged business options: legacy types + Google Business categories (lazy-loaded), sorted
  const [ gbpCategories, setGbpCategories ] = useState<{ id: string; label: string }[]>( [] );

  useEffect( () => {
    void import( /* webpackChunkName: "gbp-categories" */ '../data/google-business-categories.json' )
      .then( mod => setGbpCategories( mod.default as { id: string; label: string }[] ) )
      .catch( () => {} );
  }, [] );

  const businessOptions = useMemo( () => {
    const legacyIds = new Set( LEGACY_BUSINESS_TYPES.map( b => b.id ) );
    const legacy = LEGACY_BUSINESS_TYPES.map( ( { id, label } ) => ( { value: id, label } ) );
    const fromGbp = gbpCategories
      .filter( row => ! legacyIds.has( row.id ) )
      .map( row => ( { value: row.id, label: row.label } ) );
    return [ ...legacy, ...fromGbp ].sort( ( a, b ) =>
      a.label.localeCompare( b.label, undefined, { sensitivity: 'base' } )
    );
  }, [ gbpCategories ] );

  // Reset company size if the category changes (trucks → employees, etc.)
  // Also reset channel defaults so they recompute for the new industry.
  useEffect( () => {
    if ( ! businessType ) return;
    if ( companySize ) {
      const validIds = getSizeOptionsForBusiness( businessType ).map( s => s.id );
      if ( ! validIds.includes( companySize ) ) setCompanySize( '' );
    }
    setChannelDefaultsApplied( false );
  }, [ businessType ] ); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-select channel defaults when entering the channels step
  useEffect( () => {
    if ( step === 3 && businessType && ! channelDefaultsApplied ) {
      setLeadSources( getDefaultLeadSources( businessType ) );
      setChannelDefaultsApplied( true );
    }
  }, [ step, businessType, channelDefaultsApplied ] );

  const sizeOptions = businessType ? getSizeOptionsForBusiness( businessType ) : [];

  function togglePriority( id: string ) {
    setPriorities( prev => {
      if ( prev.includes( id ) ) return prev.filter( x => x !== id );
      if ( prev.length >= MAX_PRIORITIES ) return prev;
      return [ ...prev, id ];
    } );
  }

  function toggleChannel( id: string ) {
    setLeadSources( prev =>
      prev.includes( id ) ? prev.filter( x => x !== id ) : [ ...prev, id ]
    );
  }

  const canAdvance = (): boolean => {
    switch ( step ) {
      case 0: return true;
      case 1: return !! businessType && !! companySize;
      case 2: return priorities.length === MAX_PRIORITIES;
      case 3: return leadSources.length >= 1;
      case 4: return !! marketingBudget && !! budgetScope;
      default: return false;
    }
  };

  const handleComplete = async () => {
    setSubmitting( true );
    setSubmitError( null );
    const data: OnboardingData = {
      business_type: businessType,
      company_size: companySize,
      primary_objectives: priorities,
      lead_sources: leadSources,
      marketing_budget: marketingBudget,
      budget_scope: budgetScope,
    };

    try {
      await api.post( 'onboarding/submit', data );
      onComplete( data );
    } catch ( err ) {
      const msg = err && typeof err === 'object' && 'error' in ( err as Record<string, unknown> )
        ? ( err as { error: string } ).error
        : 'Something went wrong saving your info. You can try again or skip for now.';
      setSubmitError( msg );
      setSubmitting( false );
    }
  };

  // ─── Step renderers ────────────────────────────────────────────────────────

  const renderWebsiteAnalysis = () => (
    <div style={ { animation: 'roi-wizard-fadeIn 0.3s ease' } }>
      <h2 style={ { margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: c.textPrimary, fontFamily: font } }>
        We'll analyze your website
      </h2>
      <p style={ { margin: '0 0 28px', fontSize: 14, color: c.textSecondary, lineHeight: 1.6 } }>
        We'll scan <strong>{ siteDomain }</strong> to detect your existing tracking setup and marketing tools.
      </p>

      <div style={ {
        background: '#0f172a', borderRadius: 10, padding: '24px 28px', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      } }>
        <div style={ {
          position: 'absolute', top: 0, bottom: 0, width: '30%',
          background: 'linear-gradient(90deg, transparent, rgba(22,163,74,0.08), transparent)',
          animation: 'roi-wizard-scan 2.5s ease-in-out infinite',
        } } />

        <p style={ { margin: '0 0 16px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.textMuted } }>
          What we look for
        </p>
        <div style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } }>
          { [
            { label: 'Google Analytics (GA4)', desc: 'Measurement ID & configuration' },
            { label: 'Google Ads', desc: 'Conversion tracking & remarketing tags' },
            { label: 'Search Console', desc: 'Organic search performance data' },
            { label: 'Meta Pixel', desc: 'Facebook/Instagram tracking pixel' },
            { label: 'Call Tracking', desc: 'Dynamic number insertion scripts' },
            { label: 'Tag Manager', desc: 'GTM container & tag inventory' },
          ].map( ( item, i ) => (
            <div key={ i } style={ {
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.06)',
            } }>
              <span style={ {
                width: 8, height: 8, borderRadius: '50%', background: c.primary,
                marginTop: 5, flexShrink: 0, opacity: 0.7,
              } } />
              <div>
                <p style={ { margin: 0, fontSize: 13, fontWeight: 500, color: '#e2e8f0' } }>{ item.label }</p>
                <p style={ { margin: '2px 0 0', fontSize: 11, color: '#64748b' } }>{ item.desc }</p>
              </div>
            </div>
          ) ) }
        </div>
      </div>

      <div style={ {
        padding: '14px 16px', background: c.primaryLight, border: `1px solid ${ c.primaryBorder }`,
        borderRadius: 8, fontSize: 13, color: '#166534', lineHeight: 1.6,
      } }>
        This takes a few seconds after you finish setup. We'll show you the results before your dashboard builds.
      </div>
    </div>
  );

  const renderBusinessContext = () => (
    <div style={ { animation: 'roi-wizard-fadeIn 0.3s ease' } }>
      <h2 style={ { margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: c.textPrimary, fontFamily: font } }>
        Tell us about your business
      </h2>
      <p style={ { margin: '0 0 28px', fontSize: 14, color: c.textSecondary, lineHeight: 1.6 } }>
        This helps us tailor your ROI dashboard to your industry and scale.
      </p>

      {/* Industry */}
      <div style={ { marginBottom: 24 } }>
        <label style={ { display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: c.textPrimary, fontFamily: font } }>
          Primary industry
        </label>
        <SearchableSelect
          options={ businessOptions }
          value={ businessType }
          onChange={ setBusinessType }
          placeholder="Search industries…"
        />
      </div>

      {/* Company size */}
      { businessType && (
        <div>
          <label style={ { display: 'block', marginBottom: 10, fontSize: 13, fontWeight: 600, color: c.textPrimary, fontFamily: font } }>
            How big is your operation?
          </label>
          <div style={ { display: 'flex', flexWrap: 'wrap', gap: 10 } }>
            { sizeOptions.map( opt => {
              const selected = companySize === opt.id;
              return (
                <button
                  key={ opt.id }
                  onClick={ () => setCompanySize( opt.id ) }
                  style={ {
                    padding: '9px 18px',
                    border: `1.5px solid ${ selected ? c.primary : c.border }`,
                    borderRadius: 9999,
                    background: selected ? c.primary : '#fff',
                    color: selected ? c.primaryFg : c.textPrimary,
                    fontSize: 14, fontWeight: 500, fontFamily: font,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: selected ? '0 1px 3px rgba(22,163,74,0.2)' : 'none',
                  } }
                >
                  { opt.label }
                </button>
              );
            } ) }
          </div>
        </div>
      ) }
    </div>
  );

  const renderPriorities = () => (
    <div style={ { animation: 'roi-wizard-fadeIn 0.3s ease' } }>
      <h2 style={ { margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: c.textPrimary, fontFamily: font } }>
        What does winning look like for you?
      </h2>
      <p style={ { margin: '0 0 24px', fontSize: 14, color: c.textSecondary, lineHeight: 1.6 } }>
        Pick your top 3 goals. The order you choose becomes the ranking we use to frame your weekly analysis.
      </p>

      <div style={ { display: 'flex', flexDirection: 'column', gap: 10 } }>
        { PRIORITIES.map( obj => {
          const idx = priorities.indexOf( obj.id );
          const selected = idx >= 0;
          return (
            <button
              key={ obj.id }
              onClick={ () => togglePriority( obj.id ) }
              style={ {
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', textAlign: 'left',
                border: `1.5px solid ${ selected ? c.primary : c.border }`,
                borderRadius: 12,
                background: selected ? c.primaryLight : c.cardBg,
                cursor: priorities.length >= MAX_PRIORITIES && ! selected ? 'not-allowed' : 'pointer',
                opacity: priorities.length >= MAX_PRIORITIES && ! selected ? 0.5 : 1,
                transition: 'all 0.15s',
                boxShadow: selected ? '0 1px 3px rgba(22,163,74,0.08)' : 'none',
              } }
            >
              <span style={ {
                fontSize: 14, fontWeight: selected ? 500 : 400,
                color: c.textPrimary, fontFamily: font,
              } }>
                { obj.label }
              </span>
              { selected && (
                <span style={ {
                  width: 28, height: 28, borderRadius: 6,
                  background: c.primary, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                } }>
                  { idx + 1 }
                </span>
              ) }
            </button>
          );
        } ) }
      </div>

      { priorities.length > 0 && priorities.length < MAX_PRIORITIES && (
        <p style={ { margin: '14px 0 0', fontSize: 13, color: c.textMuted, fontFamily: font } }>
          { MAX_PRIORITIES - priorities.length === 1 ? 'One more to go.' : `Choose ${ MAX_PRIORITIES - priorities.length } more.` }
        </p>
      ) }
      { priorities.length === MAX_PRIORITIES && (
        <p style={ { margin: '14px 0 0', fontSize: 13, color: c.primary, fontWeight: 500, fontFamily: font } }>
          Great choices. Deselect any goal if you want to change the ranking order.
        </p>
      ) }
    </div>
  );

  const renderChannels = () => {
    const digital = CHANNELS.filter( ch => ch.group === 'digital' );
    const offline = CHANNELS.filter( ch => ch.group === 'offline' );

    return (
      <div style={ { animation: 'roi-wizard-fadeIn 0.3s ease' } }>
        <h2 style={ { margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: c.textPrimary, fontFamily: font } }>
          Where does your marketing show up?
        </h2>
        <p style={ { margin: '0 0 24px', fontSize: 14, color: c.textSecondary, lineHeight: 1.6 } }>
          Select every channel you actively use today. We'll use this to frame your dashboard across both digital and offline marketing.
        </p>

        {/* Digital */}
        <p style={ { margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: c.textPrimary, fontFamily: font } }>
          Digital
        </p>
        <div style={ { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 } }>
          { digital.map( ch => {
            const selected = leadSources.includes( ch.id );
            return (
              <button
                key={ ch.id }
                onClick={ () => toggleChannel( ch.id ) }
                style={ {
                  padding: '9px 16px',
                  border: `1.5px solid ${ selected ? c.primary : c.border }`,
                  borderRadius: 9999,
                  background: selected ? `${ c.primary }0D` : '#fff',
                  color: c.textPrimary,
                  fontSize: 13, fontWeight: 500, fontFamily: font,
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: selected ? '0 1px 2px rgba(22,163,74,0.1)' : 'none',
                } }
              >
                { ch.label }
              </button>
            );
          } ) }
        </div>

        {/* Offline toggle */}
        <button
          onClick={ () => setShowOffline( v => ! v ) }
          style={ {
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', padding: '0 0 10px',
            fontSize: 13, fontWeight: 500, color: c.primary, fontFamily: font, cursor: 'pointer',
          } }
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" style={ { transition: 'transform 0.15s', transform: showOffline ? 'rotate(0deg)' : 'rotate(-90deg)' } }>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          { showOffline ? 'Hide traditional & offline channels' : 'Show traditional & offline channels' }
        </button>

        { showOffline && (
          <div style={ { display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 4 } }>
            { offline.map( ch => {
              const selected = leadSources.includes( ch.id );
              return (
                <button
                  key={ ch.id }
                  onClick={ () => toggleChannel( ch.id ) }
                  style={ {
                    padding: '9px 16px',
                    border: `1.5px solid ${ selected ? c.primary : c.border }`,
                    borderRadius: 9999,
                    background: selected ? `${ c.primary }0D` : '#fff',
                    color: c.textPrimary,
                    fontSize: 13, fontWeight: 500, fontFamily: font,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: selected ? '0 1px 2px rgba(22,163,74,0.1)' : 'none',
                  } }
                >
                  { ch.label }
                </button>
              );
            } ) }
          </div>
        ) }

        { leadSources.length === 0 && (
          <p style={ { margin: '14px 0 0', fontSize: 13, color: c.textMuted, fontFamily: font } }>
            Select at least one channel to continue.
          </p>
        ) }
        { leadSources.length > 0 && (
          <p style={ { margin: '14px 0 0', fontSize: 13, color: c.textMuted, fontFamily: font } }>
            { leadSources.length } channel{ leadSources.length > 1 ? 's' : '' } selected.
          </p>
        ) }
      </div>
    );
  };

  const renderBudget = () => (
    <div style={ { animation: 'roi-wizard-fadeIn 0.3s ease' } }>
      <h2 style={ { margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: c.textPrimary, fontFamily: font } }>
        What's your marketing investment?
      </h2>
      <p style={ { margin: '0 0 28px', fontSize: 14, color: c.textSecondary, lineHeight: 1.6 } }>
        Ballpark is fine. We use this to put your ROI in context, not to audit your spend.
      </p>

      {/* Budget bands */}
      <label style={ { display: 'block', marginBottom: 10, fontSize: 13, fontWeight: 600, color: c.textPrimary, fontFamily: font } }>
        Total monthly marketing budget
      </label>
      <div style={ { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 } }>
        { BUDGET_BANDS.map( band => {
          const selected = marketingBudget === band.id;
          return (
            <button
              key={ band.id }
              onClick={ () => setMarketingBudget( band.id ) }
              style={ {
                padding: '9px 18px',
                border: `1.5px solid ${ selected ? c.primary : c.border }`,
                borderRadius: 9999,
                background: selected ? c.primary : '#fff',
                color: selected ? c.primaryFg : c.textPrimary,
                fontSize: 14, fontWeight: 500, fontFamily: font,
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: selected ? '0 1px 3px rgba(22,163,74,0.2)' : 'none',
              } }
            >
              { band.label }
            </button>
          );
        } ) }
      </div>

      {/* Budget scope */}
      { marketingBudget && (
        <>
          <label style={ { display: 'block', marginBottom: 10, fontSize: 13, fontWeight: 600, color: c.textPrimary, fontFamily: font } }>
            What does that include?
          </label>
          <div style={ { display: 'flex', flexDirection: 'column', gap: 10 } }>
            { BUDGET_SCOPES.map( scope => {
              const selected = budgetScope === scope.id;
              return (
                <button
                  key={ scope.id }
                  onClick={ () => setBudgetScope( scope.id ) }
                  style={ {
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '14px 16px', textAlign: 'left',
                    border: `1.5px solid ${ selected ? c.primary : c.border }`,
                    borderRadius: 12,
                    background: selected ? c.primaryLight : c.cardBg,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: selected ? '0 1px 3px rgba(22,163,74,0.08)' : 'none',
                  } }
                >
                  <span style={ {
                    width: 20, height: 20, borderRadius: '50%', marginTop: 1,
                    border: `2px solid ${ selected ? c.primary : c.textMuted }`,
                    background: selected ? c.primary : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s',
                  } }>
                    { selected && (
                      <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) }
                  </span>
                  <div>
                    <span style={ {
                      display: 'block', fontSize: 14, fontWeight: 500,
                      color: c.textPrimary, fontFamily: font,
                    } }>
                      { scope.label }
                    </span>
                    <span style={ { display: 'block', fontSize: 12, color: c.textMuted, marginTop: 2, fontFamily: font } }>
                      { scope.description }
                    </span>
                  </div>
                </button>
              );
            } ) }
          </div>
        </>
      ) }
    </div>
  );

  const steps = [ renderWebsiteAnalysis, renderBusinessContext, renderPriorities, renderChannels, renderBudget ];

  // ─── Layout ────────────────────────────────────────────────────────────────

  return (
    <div style={ { maxWidth: 640, margin: '0 auto', padding: '32px 24px', fontFamily: font } }>
      <style dangerouslySetInnerHTML={ { __html: keyframes } } />

      {/* Header */}
      <div style={ { marginBottom: 28, textAlign: 'center' } }>
        <p style={ { margin: '0 0 4px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.textMuted } }>
          Account Setup
        </p>
        <p style={ { margin: 0, fontSize: 14, color: c.textSecondary } }>
          Step { step + 1 } of { STEP_LABELS.length }
        </p>
      </div>

      {/* Progress indicator */}
      <div style={ { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 } }>
        { STEP_LABELS.map( ( label, i ) => (
          <React.Fragment key={ i }>
            { i > 0 && (
              <div style={ {
                flex: 1, height: 2,
                background: i <= step ? c.primary : c.border,
                transition: 'background 0.3s',
              } } />
            ) }
            <div style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' } }>
              <button
                onClick={ () => { if ( i < step ) setStep( i ); } }
                disabled={ i > step }
                style={ {
                  width: 32, height: 32, borderRadius: '50%',
                  border: i === step ? `2px solid ${ c.primary }` : i < step ? 'none' : `2px solid ${ c.border }`,
                  background: i < step ? c.primary : i === step ? c.primaryLight : '#fff',
                  color: i < step ? '#fff' : i === step ? c.primary : c.textMuted,
                  fontSize: 13, fontWeight: 600, fontFamily: font,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: i < step ? 'pointer' : 'default',
                  transition: 'all 0.3s',
                } }
              >
                { i < step ? (
                  <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : ( i + 1 ) }
              </button>
              <span style={ {
                position: 'absolute', top: 38, whiteSpace: 'nowrap',
                fontSize: 10, fontWeight: i === step ? 600 : 400,
                color: i <= step ? c.textPrimary : c.textMuted,
                fontFamily: font,
              } }>
                { label }
              </span>
            </div>
          </React.Fragment>
        ) ) }
      </div>

      {/* Step content */}
      <div style={ {
        background: c.cardBg,
        border: `1px solid ${ c.border }`,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        padding: '32px 28px',
        marginTop: 16,
      } }>
        { steps[ step ]() }
      </div>

      {/* Error */}
      { submitError && (
        <div style={ {
          marginTop: 12, padding: '12px 16px',
          background: c.errorBg, border: `1px solid ${ c.errorBorder }`,
          borderRadius: 8, fontSize: 13, color: '#991b1b', lineHeight: 1.6,
        } }>
          <p style={ { margin: '0 0 8px' } }>{ submitError }</p>
          <button
            onClick={ () => onComplete( {
              business_type: businessType, company_size: companySize,
              primary_objectives: priorities, lead_sources: leadSources,
              marketing_budget: marketingBudget, budget_scope: budgetScope,
            } ) }
            style={ {
              background: 'none', border: 'none', padding: 0,
              fontSize: 13, fontWeight: 500, color: '#991b1b',
              textDecoration: 'underline', cursor: 'pointer', fontFamily: font,
            } }
          >
            Skip for now and go to your dashboard →
          </button>
        </div>
      ) }

      {/* Navigation */}
      <div style={ {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 20, gap: 12,
      } }>
        { step > 0 ? (
          <button
            onClick={ () => setStep( s => s - 1 ) }
            style={ {
              padding: '10px 20px', background: '#fff',
              border: `1px solid ${ c.border }`, borderRadius: 6,
              fontSize: 14, fontWeight: 500, fontFamily: font,
              color: c.textSecondary, cursor: 'pointer',
            } }
          >
            Back
          </button>
        ) : (
          <div />
        ) }

        <button
          onClick={ step === steps.length - 1 ? () => void handleComplete() : () => setStep( s => s + 1 ) }
          disabled={ ! canAdvance() || submitting }
          style={ {
            padding: '10px 24px',
            background: canAdvance() && ! submitting ? c.primary : '#bbf7d0',
            color: '#fff', border: 'none', borderRadius: 6,
            fontSize: 14, fontWeight: 600, fontFamily: font,
            cursor: canAdvance() && ! submitting ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          } }
        >
          { submitting ? 'Finishing setup…' : step === steps.length - 1 ? 'Complete Setup' : 'Continue' }
        </button>
      </div>
    </div>
  );
}
