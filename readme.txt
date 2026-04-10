=== ROI Insights — Google Tag Manager, Analytics, Tracking Pixels & Call Tracking ===
Contributors: mosierdata
Tags: google tag manager, analytics, call tracking, facebook pixel, marketing
Requires at least: 6.3
Tested up to: 6.9
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

All-in-one tag management, ad pixels, marketing attribution, call tracking, and AI-powered analytics dashboard for WordPress. Free forever.

== Description ==

ROI Insights is a free WordPress plugin that replaces the need for separate plugins for Google Tag Manager, Google Analytics, ad tracking pixels, UTM attribution, and call tracking. Install once, configure in minutes, and see exactly which marketing channels are producing leads — from one dashboard inside your WordPress admin.

**The problem:** You're running Google Ads, maybe Facebook, maybe direct mail — and you have no idea which channel is actually producing phone calls and form submissions. Your analytics show clicks and sessions, but not cost per lead. You've got three different plugins doing three different things, and none of them talk to each other.

**The fix:** ROI Insights handles all of it in one plugin. Google Tag Manager injection, native toggles for six ad platforms, automatic UTM and click ID attribution on every page, call tracking with dynamic number insertion, and an embedded analytics dashboard — all from a single settings screen.

= What's included for free =

* **Google Tag Manager** — automatic injection into head and body on every page
* **Google Analytics 4** — one-toggle setup with your GA4 Measurement ID
* **Google Search Console** — connect via Google OAuth and view clicks, impressions, CTR, and rankings in your dashboard
* **Meta (Facebook) Pixel** — native toggle with built-in setup guide
* **LinkedIn Insight Tag** — native toggle for B2B conversion tracking
* **TikTok Pixel** — native toggle for TikTok Ads conversion tracking
* **Microsoft (Bing) UET Tag** — conversion tracking across Bing, Yahoo, and DuckDuckGo
* **Pinterest Tag** — conversion tracking for Promoted Pins
* **Nextdoor Pixel** — hyper-local ad tracking for neighborhood businesses
* **Attribution tracking** — automatic UTM parameter capture, click ID tracking (gclid, fbclid, msclkid), plus first-touch and last-touch attribution stored in cookies
* **Event adapters** — auto-fires tracking events for form submissions, phone link clicks, direction requests, thank-you pages, Elementor forms, and Elementor popups
* **Header and footer script injection** — add any third-party script (Hotjar, Clarity, CallRail, etc.) without editing your theme
* **Dynamic Number Insertion (DNI)** — swap your phone number with a tracking number on every page so you know which ad made the phone ring
* **Marketing ROI Dashboard** — embedded analytics dashboard showing GA4 traffic, Search Console data, call log, and call activity inside WordPress

= Premium upgrades (optional) =

Core features are free forever. Paid tiers add AI intelligence:

* **Professional ($39.95/mo)** — Weekly AI executive summary with action steps, AI call recording (2 credits/min) and transcription, lead scoring, advanced attribution that ties each lead to the exact ad or keyword, and discounted call tracking rates ($6/number, $0.15/min)
* **Business ($199/mo)** — Everything in Professional plus up to 5 sites, 2 years data retention, wholesale call tracking rates ($4/number, $0.10/min), call recording at 1 credit/min, custom reporting, MCP AI agent access (connect ChatGPT or Claude to your marketing data), and priority support

= Who is this for? =

ROI Insights is built for service-based businesses, agencies, and anyone running paid advertising who needs to know what's actually working. It's especially useful for:

* Home services businesses (HVAC, plumbing, roofing, electrical, pest control)
* Legal and professional services
* Medical and dental practices
* Local businesses running Google Ads, Facebook Ads, or direct mail
* Marketing agencies managing multiple client accounts
* Any business that receives phone calls as leads

= How is this different from other analytics plugins? =

Most plugins do one thing. Site Kit shows you GA4 data. PixelYourSite manages your Meta pixel. CallTrackingMetrics handles calls. You end up with four plugins that don't share data.

ROI Insights replaces all of them. One plugin. One settings screen. One dashboard. And the attribution layer connects everything — so when a phone call comes in, you know which Google Ads keyword triggered it, not just that someone called.

== Installation ==

1. Upload the `roi-insights` folder to `/wp-content/plugins/`
2. Activate the plugin from the **Plugins** menu
3. Go to **Marketing ROI** in the left sidebar
4. Click **License & Google** and sign in with Google to activate your free license (no credit card needed)
5. Go to **Tracking Pixels** and enable the platforms you use
6. That's it — tracking is live on every page

= Minimum setup (under 60 seconds) =

1. Activate your free license via Google Sign-In
2. Enable Google Tag Manager and enter your GTM container ID
3. Click **Connect Google Services** to link GA4 and Search Console
4. Optional: enable individual ad platform pixels and call tracking

== Frequently Asked Questions ==

= Is the free version really free? =

Yes. GTM injection, GA4, Search Console, all six ad platform pixels, attribution tracking, event adapters, header/footer scripts, DNI call tracking, and the basic dashboard are all free. No trial period. No credit card. No feature that stops working after 30 days.

= Do I need Google Tag Manager to use this plugin? =

No. GTM injection is just one of many features. You can use ROI Insights purely for GA4 and Search Console connections, or just for the ad platform pixels, or just for call tracking — all independently. GTM is optional.

= Will this slow down my site? =

Remote tracking scripts (GTM, GA4, ad pixels) are loaded asynchronously so they don't block page rendering. Small inline bootstrap snippets run on the main thread but execute in microseconds. The attribution tracker (md-roi.js) is under 15KB and loads in the footer.

= Can I use this if I already have Google Analytics installed? =

Yes, but disable the GA4 toggle in ROI Insights to avoid double-counting sessions. The plugin detects potential conflicts and warns you in the settings.

= Does this work with WooCommerce? =

Yes. The plugin injects tracking and attribution scripts site-wide. WooCommerce purchase events are best tracked through your GTM container or GA4 property — the attribution data from ROI Insights will be present on those events.

= Does this work with Elementor? =

Yes. The plugin includes built-in adapters for Elementor Forms and Elementor Popups. Form submissions and popup interactions are tracked automatically without configuration.

= How does call tracking work? =

ROI Insights uses Dynamic Number Insertion (DNI) to swap the phone number displayed on your site with a tracking number. When someone calls, the system knows which marketing source brought them there. Call tracking uses prepaid credits purchased separately from the subscription — you pay only for what you use.

= What happens if I cancel a paid subscription? =

You drop back to the free tier. All tracking continues working — GTM, ad pixels, attribution, call tracking. Only the AI features (transcription, lead scoring, weekly summary) are disabled. Your tracking never breaks.

= What external services does this plugin connect to? =

The plugin communicates with api.roiknowledge.com for license validation and Google OAuth token management. The embedded dashboard loads from my.roiknowledge.com. When you enable tracking pixels, your visitors' browsers connect directly to those platforms' servers (Google, Meta, LinkedIn, TikTok, Microsoft, Pinterest, Nextdoor). Full details in our [Privacy Policy](https://roiknowledge.com/privacy) and [Terms of Service](https://roiknowledge.com/terms).

== Screenshots ==

1. Marketing ROI Dashboard — embedded analytics showing GA4 traffic, Search Console performance, and call tracking data in one view
2. Tracking Pixels — one-toggle setup for GTM, GA4, and six ad platforms with built-in setup guides
3. License & Google — sign in with Google to activate your free license and connect Analytics, Search Console, and Ads
4. Attribution Tracking — automatic UTM and click ID capture with first-touch and last-touch attribution
5. Call Tracking — dynamic number insertion and call log with source, caller ID, and duration
6. Ad Platform Setup Guides — built-in step-by-step instructions for finding and entering your tracking IDs

== External Services ==

This plugin connects to the following external services. The local attribution tracker (md-roi.js) loads on all frontend pages to capture UTM parameters and click IDs — it does not contact any external server. External requests to third-party services are only made when you explicitly activate a license, connect Google, or enable a tracking pixel.

**ROI Insights Backend — api.roiknowledge.com**

When you activate a license or connect Google Services, this plugin communicates with api.roiknowledge.com. Data sent includes your site domain, license key, and plugin version. This service validates your license, manages Google OAuth tokens, and generates the session token used by the embedded dashboard.

* Terms of Service: https://roiknowledge.com/terms
* Privacy Policy: https://roiknowledge.com/privacy

**ROI Insights Dashboard — my.roiknowledge.com**

The Marketing ROI tab embeds a dashboard from my.roiknowledge.com in a sandboxed iframe. Authentication uses a short-lived session token generated by the backend — no static or permanent URL is exposed. The dashboard displays your GA4, Search Console, and call tracking data.

* Terms of Service: https://roiknowledge.com/terms
* Privacy Policy: https://roiknowledge.com/privacy

**Tracking Pixels — loaded in visitors' browsers when enabled by the admin**

Each tracking pixel below is disabled by default. When you enable a pixel and provide its ID in the plugin settings, the corresponding third-party script is loaded on your site's frontend pages. Visitors' browsers connect directly to the platform's servers — no data is proxied through ROI Insights.

* **Google Tag Manager** (www.googletagmanager.com) — container tag management
* **Google Analytics 4** (www.googletagmanager.com/gtag) — site analytics
* **Meta Pixel** (connect.facebook.net) — Facebook/Instagram ad conversion tracking
* **LinkedIn Insight Tag** (snap.licdn.com) — LinkedIn ad conversion tracking
* **TikTok Pixel** (analytics.tiktok.com) — TikTok ad conversion tracking
* **Microsoft UET Tag** (bat.bing.com) — Microsoft/Bing ad conversion tracking
* **Pinterest Tag** (s.pinimg.com) — Pinterest ad conversion tracking
* **Nextdoor Pixel** (ads.nextdoor.com) — Nextdoor ad conversion tracking

Each platform collects visitor data according to its own privacy policy and terms of service. Enabling a pixel constitutes your agreement to that platform's data practices.

**Attribution Tracker — md-roi.js (local file)**

The attribution tracking script (assets/js/md-roi.js) is bundled with the plugin and loaded from your site's own domain. It does not connect to any external server. It captures UTM parameters, click IDs, and session data into browser cookies and pushes events to the dataLayer for Google Tag Manager.

== Changelog ==

= 1.0.0 =
* Initial release
* Google Tag Manager injection (head and body)
* Google Analytics 4 native toggle with Measurement ID
* Google Search Console connection via OAuth
* Native ad platform toggles: Meta Pixel, LinkedIn Insight Tag, TikTok Pixel, Microsoft UET, Pinterest Tag, Nextdoor Pixel
* Automatic attribution tracking (UTM parameters, gclid, fbclid, msclkid, first-touch, last-touch)
* Built-in event adapters (forms, phone links, directions, thank-you pages, Elementor)
* Header and footer custom script injection
* Dynamic Number Insertion (DNI) for call tracking
* Embedded Marketing ROI dashboard with call log, GA4 traffic, and Search Console data
* Free license activation via Google Sign-In or email magic link

== Upgrade Notice ==

= 1.0.0 =
Initial release — free GTM, GA4, six ad platform pixels, attribution tracking, call tracking, and marketing dashboard.
