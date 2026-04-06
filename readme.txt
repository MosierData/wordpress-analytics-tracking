=== ROI Insights — Marketing Analytics & Call Tracking ===
Contributors: mosierdata
Tags: analytics, google tag manager, tracking, call tracking, marketing
Requires at least: 6.2
Tested up to: 6.7
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

GTM, GA4, and ad pixel management with attribution tracking, call tracking, and a live marketing ROI dashboard. Free forever.

== Description ==

ROI Insights gives service-based businesses a complete marketing analytics foundation without the complexity. Install once, configure in minutes, and know exactly which marketing efforts are driving real results.

**What's included — free forever:**

* **Google Tag Manager** — inject your GTM container into every page automatically
* **Google Analytics 4** — enable GA4 with a single toggle and your Measurement ID
* **6 Ad Platform Pixels** — Meta (Facebook), LinkedIn, TikTok, Microsoft (Bing), Pinterest, and Nextdoor — each with one-click setup and built-in guidance
* **Attribution Tracking** — automatic UTM and click ID capture (gclid, fbclid, msclkid) with first-touch and last-touch attribution via cookies
* **Session Tracking** — page count, session ID, and landing page captured automatically on every visit
* **Form & Event Adapters** — auto-tracks form submissions, phone link clicks, directions links, Elementor popups/forms, and Birdeye widgets
* **Header/Footer Code** — paste any third-party script (Hotjar, Clarity, CallRail, etc.) without touching your theme
* **Free License** — register your domain with Google Sign-In or email magic link. No credit card required.
* **Marketing ROI Dashboard** — embedded analytics dashboard showing GA4 traffic, Search Console data, and call tracking activity

**Upgrade for AI-powered features:**

* Professional ($39.95/mo): AI Call Transcription, Lead Scoring, Call Recording, lower call rates ($9/number, $0.15/min)
* Business ($199/mo): All Professional features + Ads Advisor spend watchdog, custom reporting, MCP AI agent access

Upgrade prompts appear only on the plugin's own settings page — never as persistent admin banners.

== Installation ==

1. Upload the `roi-insights` folder to `/wp-content/plugins/`
2. Activate the plugin from the **Plugins** menu in WordPress
3. Navigate to **Marketing ROI** in the left sidebar
4. Click **License & Google** tab and sign in with Google (or request a magic link) to activate your free license

== Frequently Asked Questions ==

= Is the free version really free forever? =

Yes. GTM, GA4, all six ad pixels, attribution tracking, header/footer scripts, and the basic dashboard are free indefinitely. No trial period, no credit card required.

= Do I need a license to use the tracking features? =

The tracking scripts work with or without a license. A license unlocks the ROI dashboard and premium features. The free license is obtained by signing in with Google or an email magic link — no payment needed.

= What's the difference between GTM and the individual pixel toggles? =

Google Tag Manager is a container that manages all your tracking scripts from one place. If your agency manages GTM, use that. If not, enable each platform individually. Don't enable both — tracking scripts will fire twice and inflate your data. The plugin warns you if it detects this conflict.

= Will this slow down my site? =

All tracking scripts load asynchronously and don't block page rendering. The attribution JS (md-roi.js) is lightweight (< 15KB) and loads in the footer.

= Can I use this with WooCommerce? =

Yes. The plugin injects scripts site-wide. WooCommerce events (purchase, add to cart) can be tracked by configuring event parameters in your GTM container or GA4 property.

= I use Elementor — does form tracking work automatically? =

Yes. The plugin includes a built-in Elementor Forms adapter that automatically fires `generate_lead` events on form submission success, without any configuration required.

== External Services ==

This plugin connects to the following external services:

**ROI Insights Backend (api.roiknowledge.com)**

When you activate a license or connect Google Services, this plugin communicates with api.roiknowledge.com. Data sent includes your site domain and license key. This service validates your license, manages Google OAuth tokens, and generates the session token used by the embedded dashboard.

Terms of Service: https://roiknowledge.com/terms
Privacy Policy: https://roiknowledge.com/privacy

**ROI Insights Dashboard (my.roiknowledge.com)**

The Marketing ROI tab embeds a dashboard from my.roiknowledge.com in an iframe using your session token.

**Google Tag Manager, Google Analytics, and Ad Platforms**

When you enable tracking pixels (GTM, GA4, Meta, LinkedIn, TikTok, Bing, Pinterest, Nextdoor), your visitors' browsers connect directly to those platforms' servers to load tracking scripts. Each platform has its own privacy policy and data practices.

== Changelog ==

= 1.0.0 =
* Initial release
* GTM, GA4, and 6 ad platform pixel management
* Attribution tracking (UTM, click IDs, first/last touch)
* Free license registration via Google OAuth and email magic link
* Marketing ROI dashboard (embedded)
* Header/footer custom code injection
* DNI (Dynamic Number Insertion) support

== Upgrade Notice ==

= 1.0.0 =
Initial release.
