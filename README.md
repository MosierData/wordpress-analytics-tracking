<p align="center">
  <img src="assets/banner.svg" alt="ROI Insights for WordPress — tag management, tracking pixels, attribution tracking, and call tracking by ROI Insights from MosierData" width="100%" />
</p>

# ROI Insights for WordPress

**Tag management, tracking pixels, attribution tracking, and call tracking for WordPress — provided by [ROI Insights](https://roiknowledge.com/?utm_source=github&utm_medium=referral&utm_campaign=roi-insights-wp) from [MosierData](https://mosierdata.com/?utm_source=github&utm_medium=referral&utm_campaign=roi-insights-wp).**

Native one-toggle setup for Google Tag Manager, GA4, Meta Pixel, LinkedIn, TikTok, Microsoft Ads, Pinterest, and Nextdoor — plus attribution tracking, call tracking, custom script injection, and an embedded analytics dashboard.

Core features are completely free — sign in with Google directly from the WordPress admin to generate your license key instantly (no credit card, no external portal). Premium upgrades are available when you're ready for AI-powered call analysis, lead scoring, and advanced attribution.

[![License: GPL v2](https://img.shields.io/badge/License-GPLv2-blue.svg)](LICENSE)
[![WordPress](https://img.shields.io/badge/WordPress-6.2+-21759B.svg)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-7.4+-777BB4.svg)](https://php.net)

---

## The Problem

You just launched your WordPress site. You need Google Analytics. You need your Meta Pixel. Maybe you're running Google Ads and need Tag Manager wired up. You need to know which ad drove that phone call. You go looking for solutions — and you find a dozen different plugins, none of which talk to each other, each adding their own dashboard, their own settings page, their own overhead.

If you're spending money on marketing, a fragmented setup isn't just annoying — it's expensive. You're paying for traffic you can't fully measure, leads you can't properly attribute, and calls you can't trace back to a source.

## The Fix

Install ROI Insights. In about 60 seconds, you'll have Google Tag Manager injecting into your `<head>` and `<body>`, native toggles for six major ad platforms — Meta, LinkedIn, TikTok, Microsoft, Pinterest, and Nextdoor — each with built-in setup guides, and automatic attribution tracking on every page. Every form submission, phone link click, and thank-you page visit is captured and enriched with UTM data and session context before it hits your data layer.

And if your business depends on phone calls, dynamic number insertion connects your tracking number to your marketing source — so you know exactly which ad made the phone ring.

**That's what this plugin does. And the core of it is free.**

---

<img src="assets/section-free.svg" alt="What's included for free" width="100%" />

## What's Included for Free

This isn't a demo and it doesn't expire. These features are yours to keep.

### Google Tag Manager Injection
Enter your GTM container ID and the plugin handles the rest — `<head>` script, `<body>` noscript fallback, automatic injection on every page. **You get proper tag management on your WordPress site** without editing a single template file.

### Google Analytics 4 (Native Toggle)
Enable GA4 with a single toggle and your Measurement ID — the plugin handles the script injection automatically. Then connect your GA4 property through one-click Google OAuth to see **sessions, active users, traffic sources, and lead data** right inside your WordPress admin. No more logging into a separate analytics dashboard just to check if your traffic went up.

### Google Search Console Connection
Link your Search Console property the same way. **You get clicks, impressions, CTR, and average position** for your top queries and pages, all in one dashboard alongside your other metrics.

### Native Ad Platform Tracking Pixels
Six major advertising platforms have dedicated toggles with built-in setup guides — no code, no copy-paste, no guessing which script goes where:

| Platform | What It Does |
|----------|-------------|
| **Meta (Facebook) Pixel** | Tracks conversions from Facebook and Instagram ads, builds retargeting audiences from your visitors, and helps Meta find more people like your best customers |
| **LinkedIn Insight Tag** | Measures conversions from LinkedIn ads and unlocks Website Demographics — see the job titles, industries, and company sizes of your visitors. Essential for B2B |
| **TikTok Pixel** | Tracks conversions from TikTok ads and lets the algorithm optimize toward people who actually become leads — not just clickers |
| **Microsoft (Bing) UET Tag** | Enables conversion tracking and remarketing for Microsoft Advertising across Bing, Yahoo, DuckDuckGo, and partner sites. Often the cheapest cost-per-lead in paid search |
| **Pinterest Tag** | Tracks conversions from Promoted Pins and builds audiences for Pinterest campaigns. Especially valuable for visual businesses (renovation, landscaping, design) |
| **Nextdoor Pixel** | Tracks conversions from Nextdoor neighborhood ads — hyper-local targeting for home services, contractors, and any business that serves a specific area |

Each platform includes an expandable setup guide explaining what the pixel does, why you'd use it, when to skip it (e.g., if you're already loading it through GTM), and step-by-step instructions for finding your tracking ID.

### Attribution Tracking (Automatic)
Every visit is automatically enriched with:
- **UTM parameters** — source, medium, campaign, term, content
- **Click IDs** — gclid (Google Ads), fbclid (Meta), msclkid (Microsoft Ads)
- **First-touch and last-touch** — both attribution models stored in cookies simultaneously
- **Session data** — session ID, page count, landing page, and referrer

This data flows into your `window.dataLayer` automatically, ready for GTM to route to GA4, Meta, or wherever you need it.

### Event Adapters (Built-In)
No configuration required — these fire automatically:

- **Forms** — tracks `generate_lead` on any form submission
- **Phone links** — tracks `phone_click` on `tel:` links
- **Directions** — tracks clicks on Google Maps, Apple Maps, and Bing Maps links
- **Thank-you pages** — detects confirmation URLs and fires `generate_lead` or `appointment_booked` automatically
- **Elementor Forms** — hooks into `elementor/form/success` for native Elementor form tracking
- **Elementor Popups** — tracks `popup_show` and `popup_cta_click`
- **External links** — tracks outbound clicks to third-party platforms

### Header & Footer Script Injection
Running a platform we don't have a native toggle for? Hotjar, Clarity, CallRail, or anything else? Paste the snippet into the header or footer code fields. **If it's a tracking script, you can add it here** — no developer required.

### Dynamic Number Insertion (DNI)
Connect your call tracking number via Dynamic Number Insertion. The plugin swaps your displayed phone number with a tracking number on every page, so your DNI provider can attribute each call to its marketing source.

### Basic Call Log
Every inbound call is logged with caller ID, duration, timestamp, and the attributed marketing source. **You get a clean record of every lead that came in by phone** and what brought them there.

---

<img src="assets/section-premium.svg" alt="Premium upgrades" width="100%" />

## Premium Upgrades (Optional)

The free tier stays free forever. Paid tiers add AI-powered intelligence and deeper attribution for businesses that want to know more than just *that* a lead came in — they want to know whether it was any good.

| Feature | Free | Professional | Business |
|---------|:----:|:------------:|:--------:|
| | | **$39.95/mo** | **$199/mo** |
| GTM injection | ✅ | ✅ | ✅ |
| GA4 + Search Console | ✅ | ✅ | ✅ |
| Native ad pixels (Meta, LinkedIn, TikTok, Bing, Pinterest, Nextdoor) | ✅ | ✅ | ✅ |
| Attribution tracking (UTM, click IDs, first/last touch) | ✅ | ✅ | ✅ |
| Built-in event adapters (forms, phone, directions, Elementor) | ✅ | ✅ | ✅ |
| Header/footer scripts | ✅ | ✅ | ✅ |
| Call tracking (DNI) | ✅ | ✅ | ✅ |
| Basic call log | ✅ | ✅ | ✅ |
| Call tracking rate (per number/month) | $15.00 | $9.00 | $6.00 |
| Call tracking rate (per minute) | $0.25 | $0.15 | $0.10 |
| AI weekly executive summary | — | ✅ | ✅ |
| Call audio recording | — | ✅ | ✅ |
| AI call transcription & scoring | — | ✅ | ✅ |
| Advanced UTM attribution | — | ✅ | ✅ |
| Ads Advisor (24/7 spend watchdog) | — | — | ✅ |
| Custom reporting | — | — | ✅ |
| MCP AI agent access | — | — | ✅ |

**Professional ($39.95/mo)** is built for businesses running paid ads. You get a weekly AI executive summary that tells you what's working, full call transcription and lead scoring, and lower call tracking rates. For a lot of businesses, the savings on call tracking alone covers the subscription — see the math below.

**Business ($199/mo)** is for high-volume advertisers and agencies. The Ads Advisor watches your Google Ads spend around the clock — alerting you to budget overruns, underperforming campaigns, and automated bidding changes that are quietly costing you money. You also get the lowest call tracking rates, custom reporting, and MCP AI agent access to query your marketing data programmatically.

**Founder's Club ($4,495 one-time)** — Lifetime access to Business tier features, available as a limited-time offer for early adopters. See [ROI Insights](https://roiknowledge.com/?utm_source=github&utm_medium=referral&utm_campaign=roi-insights-wp) for availability.

### Does upgrading actually save money?

It can — and often does. Because call tracking rates drop with higher tiers, the subscription frequently pays for itself in reduced telecom costs alone.

**Small business running 120 calls/month (avg. 3 min each, 1 tracking number):**

| | Platform | Number | Minutes | Monthly Total |
|--|:--------:|:------:|:-------:|:-------------:|
| Free | $0 | $15.00 | $90.00 | **$105.00** |
| Professional | $39.95 | $9.00 | $54.00 | **$102.95** |

At 120 calls a month, Professional is cheaper than Free — and includes AI transcription, lead scoring, and weekly reports.

**Agency running 15 numbers, 3,000 minutes/month:**

| | Platform | Numbers | Minutes | Monthly Total |
|--|:--------:|:-------:|:-------:|:-------------:|
| Professional | $39.95 | $135.00 | $450.00 | **$624.95** |
| Business | $199.00 | $90.00 | $300.00 | **$589.00** |

The jump from Professional to Business saves $35/month in telecom costs alone, plus adds the Ads Advisor and custom reporting.

---

<img src="assets/section-quickstart.svg" alt="Quick start" width="100%" />

## Quick Start

### Step 1 — Install the Plugin

1. Download the latest release zip from the [Releases page](https://github.com/MosierData/roi-insights-wordpress/releases)
2. In your WordPress admin, go to **Plugins → Add New → Upload Plugin**
3. Upload the zip and click **Activate**

Or install via WP-CLI:

```bash
wp plugin install roi-insights --activate
```

### Step 2 — Activate Your Free License

1. In the WordPress admin sidebar, click **Marketing ROI**
2. Go to the **License & Google** tab
3. Click **Sign in with Google** — a browser popup opens, you sign in, and your domain-bound license is activated instantly. No credit card, no external portal
4. Alternatively, enter your email address and click **Send Link** to receive a magic link

### Step 3 — Configure Tracking

Go to the **Tracking Pixels** tab and enable the platforms you use:

| Tab | What You'll Do There |
|-----|---------------------|
| **Marketing ROI** | View your embedded analytics dashboard (GA4 traffic, Search Console data, call log) |
| **Tracking Pixels** | Enable/disable GTM, GA4, Meta Pixel, LinkedIn, TikTok, Microsoft UET, Pinterest, and Nextdoor |
| **License & Google** | Manage your license, connect Google Services, configure DNI and custom scripts |

**Minimum setup (under 60 seconds):**

1. Activate your free license via Google Sign-In
2. Enable Google Tag Manager and paste your GTM container ID (e.g., `GTM-XXXXXXX`)
3. (Optional) Enable individual ad platform pixels if you're not managing them through GTM
4. Click **Connect Google Services** to link GA4 and Search Console

That's it. Your tracking is live on every page.

> **Note on `wp_body_open`:** GTM's noscript fallback requires your theme to call `wp_body_open()` immediately after `<body>`. Most modern themes and block themes do this automatically. If your theme doesn't, add `<?php wp_body_open(); ?>` on the line after your opening `<body>` tag, or install a compatibility plugin.

---

<img src="assets/section-howitworks.svg" alt="How it works" width="100%" />

## How It Works

ROI Insights is a PHP plugin with a React admin UI that communicates with the ROI Insights backend via the WordPress REST API. All the heavy lifting — Google OAuth, license validation, AI analysis — happens on a secure backend at `api.roiknowledge.com`. The only sensitive value stored locally is your license key (in the WordPress options table). Google OAuth tokens are held server-side and never touch your WordPress database.

**Your tracking never breaks.** If the backend is temporarily unreachable, your tracking scripts keep running from a cached license. No analytics data is lost. We built it this way because a single day of broken tracking can mean missed leads and wasted ad spend you'll never recover.

**Your data stays yours.** Google connections are made through your own Google account. If you ever uninstall, your Analytics and Search Console data stay exactly where they are — in your accounts, untouched.

**Attribution runs before GTM.** The attribution tracker (`md-roi.js`) loads in the WordPress footer and captures UTM parameters, click IDs, session data, and events before pushing them to `window.dataLayer`. GTM picks them up and routes them to GA4, Meta, and any other platform in your container — with full attribution context already attached.

### How call tracking credits work

Call tracking runs on a prepaid credit system, billed separately from the platform subscription. You purchase credit packages ($10–$250), and credits are deducted based on your active tracking numbers and inbound call minutes. Credits never expire while your account is active.

You can enable auto-recharge so your balance stays topped up automatically — no lead is ever lost to a disconnected number because you forgot to buy credits.

---

<img src="assets/section-faq.svg" alt="Frequently asked questions" width="100%" />

## FAQ

### Is this really free?

Yes — genuinely free, not "free for 14 days." You do need a license key (even for the free tier), but you generate it right inside the WordPress admin: click **Sign in with Google** (or enter your email for a magic link), and a domain-bound key is created and activated automatically. The free tier gives you GTM injection, GA4 and Search Console connections, native toggles for six ad platforms, attribution tracking, built-in event adapters, header/footer script injection, and a basic call log.

Paid tiers add AI transcription, lead scoring, call recording, advanced attribution, and the Ads Advisor — but the core tracking infrastructure works perfectly without them.

### Do I need a Google Tag Manager account?

Nope. GTM injection is just one of the things this plugin does. You can use it purely for Google Analytics, or just for the ad platform pixels, or just for the header/footer script injection — without ever setting up GTM.

### Will this conflict with other analytics plugins?

If you're already using a dedicated GA4 plugin (like Site Kit by Google), disable the GA4 toggle in ROI Insights to avoid double-counting. The same applies to any pixel you're already managing through GTM — enabling it here and in GTM means it fires twice. The plugin detects this and warns you inside the Tracking Pixels settings.

### Does this work with WooCommerce?

Yes. The plugin injects scripts and attribution tracking site-wide. WooCommerce purchase events are best tracked by adding GA4 Enhanced Ecommerce configuration to your GTM container or GA4 property — the attribution data captured by this plugin will be present on all those events.

### Does this work with Elementor?

Yes, and then some. The plugin includes built-in adapters for Elementor Forms (`elementor/form/success`) and Elementor Popups (`elementor/popup/show`, `elementor/popup/hide`) — tracking fires automatically without any additional configuration.

### How does call tracking billing work?

Call tracking runs on a prepaid credit system, separate from your platform subscription. You buy credit packages ($10–$250), credits are deducted based on active numbers and call minutes, and they never expire while your account is active. Enable auto-recharge and you'll never have to think about it.

### What happens if I cancel a paid subscription?

Your GTM injection, attribution tracking, ad platform pixels, and Google connections keep working — you just drop back to the free tier. AI-powered features (transcription, lead scoring, recording) are disabled, but your tracking never breaks. We designed it that way on purpose.

### I'm not technical. Can I still use this?

Yes. If you can click a toggle and paste an ID, you can configure this plugin. Every setting has an explanation, and every platform has a built-in guide that tells you exactly where to find your tracking ID. No developer required.

---

## For Developers

### Tech Stack
- **Plugin:** PHP 7.4+, no Composer dependencies
- **Admin UI:** React 18, TypeScript 5, built with `@wordpress/scripts`
- **Tracking:** `md-roi.js` — a self-contained vanilla JS attribution tracker (no framework dependencies)
- **API:** WordPress REST API namespace `roi-insights/v1`
- **License validation:** PHP `sodium_crypto_sign_verify_detached()` — Ed25519 signatures, no external library required
- **Settings storage:** WordPress options table via `get_option` / `update_option`

### Building the Admin UI

```bash
npm install
npm run build     # production build → build/index.tsx.js
npm run start     # development watch mode
```

The build output is committed separately for distribution. Source maps are not included in release zips.

### Plugin Architecture

```
roi-insights-wordpress/
├── roi-insights.php               # Plugin header, activation hooks
├── includes/
│   ├── class-roi-insights.php     # Central coordinator
│   ├── class-settings.php         # Options abstraction
│   ├── class-license.php          # Ed25519 license validation, transient cache
│   ├── class-tracking.php         # wp_head / wp_body_open / wp_footer injection
│   └── class-api.php              # REST API endpoints (roi-insights/v1)
├── assets/js/
│   └── md-roi.js                  # Attribution tracker (vendored from md-roi-core)
└── src/
    ├── admin/                     # React admin UI (TypeScript)
    └── lib/                       # Shared types and API client
```

### External API

The plugin communicates with a single external host for license management and Google OAuth. All tracking pixels are injected client-side and connect directly to each platform's servers — the plugin never proxies analytics data.

```
Allowed external host: api.roiknowledge.com
```

### Contributing

We'd love your help making this better. Open an issue or pull request on GitHub.

---

## License

GPL v2 or later — see [LICENSE](LICENSE) for details.

The vendored `assets/js/md-roi.js` is also GPL v2 ([md-roi-core](https://github.com/MosierData/roi-insights-wp)).

## Links

- [ROI Insights](https://roiknowledge.com/?utm_source=github&utm_medium=referral&utm_campaign=roi-insights-wp) — Our marketing intelligence platform
- [Docs & Knowledge Library](https://roiknowledge.com/library?utm_source=github&utm_medium=referral&utm_campaign=roi-insights-wp) — Setup guides and reference
- [MosierData](https://mosierdata.com/?utm_source=github&utm_medium=referral&utm_campaign=roi-insights-wp) — The team behind ROI Insights
- [Report an Issue](https://github.com/MosierData/roi-insights-wordpress/issues) — Found a bug? Let us know
