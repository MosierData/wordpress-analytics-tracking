<?php
/**
 * Tracking — injects GTM, GA4, ad pixels, attribution JS, and custom code.
 *
 * @package ROI_Insights
 */

/*
 * ROI Insights — Marketing Analytics & Call Tracking
 * Copyright (C) 2026 MosierData
 * License: GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

class ROI_Insights_Tracking {

	/** @var ROI_Insights_Settings */
	private $settings;

	public function __construct( ROI_Insights_Settings $settings ) {
		$this->settings = $settings;
	}

	public function register_hooks(): void {
		add_action( 'wp_head', array( $this, 'inject_head' ), 1 );
		add_action( 'wp_body_open', array( $this, 'inject_body_open' ), 1 );
		add_action( 'wp_footer', array( $this, 'inject_footer' ), 99 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_tracker' ) );
	}

	/**
	 * Enqueue md-roi.js (attribution tracker) on all frontend pages.
	 */
	public function enqueue_tracker(): void {
		$advanced = $this->settings->get_advanced_settings();

		wp_enqueue_script(
			'roi-insights-tracker',
			ROI_INSIGHTS_URL . 'assets/js/md-roi.js',
			array(),
			ROI_INSIGHTS_VERSION,
			true
		);

		// Pass PHP config to md-roi.js via window.mdROIConfig.
		wp_localize_script(
			'roi-insights-tracker',
			'mdROIConfig',
			array(
				'debug'                => (bool) $advanced['debug'],
				'cookieDays'           => (int) apply_filters( 'roi_insights_cookie_days', 90 ),
				'sessionMinutes'       => (int) apply_filters( 'roi_insights_session_minutes', 30 ),
				'thankYouPaths'        => apply_filters( 'roi_insights_thank_you_paths', array( 'thank-you', 'thanks', 'thankyou' ) ),
				'enableFormsAdapter'   => (bool) apply_filters( 'roi_insights_enable_forms_adapter', true ),
				'enableBirdeyeAdapter' => (bool) apply_filters( 'roi_insights_enable_birdeye_adapter', true ),
				'enableExternalLinks'  => (bool) apply_filters( 'roi_insights_enable_external_links_adapter', true ),
			)
		);

		// Inject DNI script if configured.
		if ( ! empty( $advanced['dniScriptUrl'] ) ) {
			wp_enqueue_script(
				'roi-insights-dni',
				esc_url( $advanced['dniScriptUrl'] ),
				array(),
				null, // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
				true
			);
		}
	}

	/**
	 * Inject tracking tags into <head>.
	 */
	public function inject_head(): void {
		$s = $this->settings->get_tracking_settings();
		$a = $this->settings->get_advanced_settings();

		// Google Tag Manager.
		if ( $s['gtmEnabled'] && ! empty( $s['gtmId'] ) ) {
			$gtm_id = esc_js( $s['gtmId'] );
			echo "<!-- ROI Insights: Google Tag Manager -->\n";
			echo "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','" . $gtm_id . "');</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}

		// Google Analytics 4.
		if ( $s['ga4Enabled'] && ! empty( $s['ga4Id'] ) ) {
			$ga4_id = esc_js( $s['ga4Id'] );
			echo "<!-- ROI Insights: Google Analytics 4 -->\n";
			wp_enqueue_script( 'roi-insights-ga4-gtag', 'https://www.googletagmanager.com/gtag/js?id=' . rawurlencode( $s['ga4Id'] ), array(), null, array( 'in_footer' => false, 'strategy' => 'async' ) ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
			echo "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','" . $ga4_id . "');</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}

		// Meta Pixel.
		if ( $s['metaEnabled'] && ! empty( $s['metaId'] ) ) {
			$meta_id = esc_js( $s['metaId'] );
			echo "<!-- ROI Insights: Meta Pixel -->\n";
			echo "<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','" . $meta_id . "');fbq('track','PageView');</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}

		// LinkedIn Insight Tag.
		if ( $s['linkedinEnabled'] && ! empty( $s['linkedinId'] ) ) {
			$li_id = esc_js( $s['linkedinId'] );
			echo "<!-- ROI Insights: LinkedIn Insight Tag -->\n";
			echo "<script type=\"text/javascript\">_linkedin_partner_id=\"" . $li_id . "\";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);</script><script type=\"text/javascript\">(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName(\"script\")[0];var b=document.createElement(\"script\");b.type=\"text/javascript\";b.async=true;b.src=\"https://snap.licdn.com/li.lms-analytics/insight.min.js\";s.parentNode.insertBefore(b,s)})(window.lintrk);</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}

		// TikTok Pixel.
		if ( $s['tiktokEnabled'] && ! empty( $s['tiktokId'] ) ) {
			$tt_id = esc_js( $s['tiktokId'] );
			echo "<!-- ROI Insights: TikTok Pixel -->\n";
			echo "<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript',o.async=!0,o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load('" . $tt_id . "');ttq.page();}(window,document,'ttq');</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}

		// Microsoft (Bing) UET Tag.
		if ( $s['bingEnabled'] && ! empty( $s['bingId'] ) ) {
			$bing_id = esc_js( $s['bingId'] );
			echo "<!-- ROI Insights: Microsoft Advertising UET -->\n";
			echo "<script>(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:'" . $bing_id . "'};o.q=w[u],w[u]=new UET(o),w[u].push('pageLoad')},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=='loaded'&&s!=='complete'||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,'script','//bat.bing.com/bat.js','uetq');</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}

		// Pinterest Tag.
		if ( $s['pinterestEnabled'] && ! empty( $s['pinterestId'] ) ) {
			$pt_id = esc_js( $s['pinterestId'] );
			echo "<!-- ROI Insights: Pinterest Tag -->\n";
			echo "<script>!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version='3.0';var t=document.createElement('script');t.async=!0,t.src=e;var r=document.getElementsByTagName('script')[0];r.parentNode.insertBefore(t,r)}}('https://s.pinimg.com/ct/core.js');pintrk('load','" . $pt_id . "');pintrk('page');</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}

		// Nextdoor Pixel.
		if ( $s['nextdoorEnabled'] && ! empty( $s['nextdoorId'] ) ) {
			$nd_id = esc_js( $s['nextdoorId'] );
			echo "<!-- ROI Insights: Nextdoor Pixel -->\n";
			echo "<script>(function(w,d,s,n,a){if(!w[n]){w[n]={},w[n].q=[];var t=d.createElement(s);t.async=!0,t.src='https://ads.nextdoor.com/public/pixel/ndp.js';var e=d.getElementsByTagName(s)[0];e.parentNode.insertBefore(t,e),w[n].track=function(p,o){w[n].q.push({p:p,o:o})}}w[n].track('PAGE_VIEW',{advertiser_id:'" . $nd_id . "'});})(window,document,'script','ndp');</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}

		// Custom head code.
		if ( ! empty( $a['customHeadCode'] ) ) {
			echo "<!-- ROI Insights: Custom Head Code -->\n";
			echo $a['customHeadCode'] . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}
	}

	/**
	 * GTM noscript — injected immediately after <body>.
	 */
	public function inject_body_open(): void {
		$s = $this->settings->get_tracking_settings();
		if ( $s['gtmEnabled'] && ! empty( $s['gtmId'] ) ) {
			echo '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=' . esc_attr( $s['gtmId'] ) . '" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}
	}

	/**
	 * Custom footer code.
	 */
	public function inject_footer(): void {
		$a = $this->settings->get_advanced_settings();
		if ( ! empty( $a['customFooterCode'] ) ) {
			echo "<!-- ROI Insights: Custom Footer Code -->\n";
			echo $a['customFooterCode'] . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}

		// DNI swap number — passed as inline JS for AvidTrak.
		if ( ! empty( $a['dniSwapNumber'] ) ) {
			echo '<script>window.roiDNISwapNumber=' . wp_json_encode( $a['dniSwapNumber'] ) . ';</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput
		}
	}
}
