<?php
/**
 * Admin AJAX API — registers wp_ajax_roi_insights_* handlers.
 * Uses admin-ajax.php via jQuery AJAX (Cloudflare-safe XHR transport).
 *
 * Backend paths are relative to https://api.roiknowledge.com/api/
 *
 * @package ROI_Insights
 */

/*
 * ROI Insights — Marketing Analytics & Call Tracking
 * Copyright (C) 2026 MosierData
 * License: GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

class ROI_Insights_API {

	const BACKEND = 'https://api.roiknowledge.com';

	/** @var ROI_Insights_Settings */
	private $settings;

	/** @var ROI_Insights_License */
	private $license;

	public function __construct( ROI_Insights_Settings $settings, ROI_Insights_License $license ) {
		$this->settings = $settings;
		$this->license  = $license;
	}

	/**
	 * Register wp_ajax_* hooks.
	 * Called directly from the plugin constructor.
	 */
	public function register_hooks(): void {
		$actions = array(
			'roi_insights_license_status'   => 'handle_license_status',
			'roi_insights_license_sso'      => 'handle_license_sso',
			'roi_insights_license_register' => 'handle_license_register',
			'roi_insights_license_notify'   => 'handle_license_notify',
			'roi_insights_license_pending'  => 'handle_license_pending',
			'roi_insights_license_validate' => 'handle_license_validate',
			'roi_insights_tracking_settings' => 'handle_tracking_get',
			'roi_insights_tracking_save'    => 'handle_tracking_save',
			'roi_insights_settings_load'    => 'handle_settings_load',
			'roi_insights_settings_save'    => 'handle_settings_save',
			'roi_insights_onboarding_submit'   => 'handle_onboarding_submit',
			'roi_insights_onboarding_complete' => 'handle_onboarding_complete',
			'roi_insights_onboarding_scan'     => 'handle_onboarding_scan',
			'roi_insights_onboarding_state'    => 'handle_onboarding_state',
			'roi_insights_integrations_get'        => 'handle_integrations_get',
			'roi_insights_integrations_disconnect' => 'handle_integrations_disconnect',
		);

		foreach ( $actions as $action => $method ) {
			add_action( 'wp_ajax_' . $action, array( $this, $method ) );
		}
	}

	// ─── Auth / Body Helpers ────────────────────────────────────────────────────

	private function verify_request(): void {
		check_ajax_referer( 'roi_insights_nonce', '_wpnonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Forbidden' ), 403 );
		}
	}

	/** Decode the JSON-encoded 'data' field sent by api.post(). */
	private function get_body(): array {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- already verified in verify_request().
		$raw     = isset( $_POST['data'] ) ? wp_unslash( $_POST['data'] ) : '{}';
		$decoded = json_decode( $raw, true );
		return is_array( $decoded ) ? $decoded : array();
	}

	// ─── License Handlers ───────────────────────────────────────────────────────

	/** Return cached license data (calls backend to validate if cache is empty). */
	public function handle_license_status(): void {
		$this->verify_request();
		wp_send_json_success( $this->license->get_license_data() );
	}

	/** Return the OAuth popup URL — no backend call needed. */
	public function handle_license_sso(): void {
		$this->verify_request();
		$body     = $this->get_body();
		$src      = sanitize_text_field( $body['src'] ?? 'default' );
		$provider = ( 'default' === $src ) ? 'google' : $src;
		$domain   = wp_parse_url( home_url(), PHP_URL_HOST );
		$url      = self::BACKEND . '/api/roi/plugin/auth/' . rawurlencode( $provider ) . '/redirect?domain=' . rawurlencode( $domain );
		wp_send_json_success( array( 'authUrl' => $url ) );
	}

	/** Exchange a one-time token (from OAuth or magic link) for a license key. */
	public function handle_license_register(): void {
		$this->verify_request();
		$body   = $this->get_body();
		$token  = sanitize_text_field( $body['token'] ?? '' );
		$result = $this->backend_post( '/api/roi/plugin/auth/exchange', array( 'token' => $token ) );

		// If backend returned a license key, persist it and try to validate.
		if ( 200 === $result['status'] && ! empty( $result['body']['license_key'] ) ) {
			$this->settings->save_license_key( $result['body']['license_key'] );
			$this->license->clear_cache();
			try {
				$result['body']['license'] = $this->license->get_license_data( true );
			} catch ( \Throwable $e ) {
				// Validation may fail if the backend hasn't propagated yet — that's OK.
				$result['body']['license'] = array( 'isValid' => false, 'reason' => 'not_validated' );
			}
		}

		$this->send_backend_result( $result );
	}

	/** Request a magic-link activation email. */
	public function handle_license_notify(): void {
		$this->verify_request();
		$body   = $this->get_body();
		$email  = sanitize_email( $body['email'] ?? '' );
		$domain = wp_parse_url( home_url(), PHP_URL_HOST );
		$result = $this->backend_post( '/api/roi/plugin/auth/magic-link', array( 'email' => $email, 'domain' => $domain ) );
		$this->send_backend_result( $result );
	}

	/**
	 * Poll magic-link verification status.
	 * The poll_token arrives via POST body (not URL) from the frontend to avoid
	 * browser history / CDN log exposure. The server-to-server call to the backend
	 * uses a query param since that's the endpoint's contract.
	 */
	public function handle_license_pending(): void {
		$this->verify_request();
		$body       = $this->get_body();
		$poll_token = sanitize_text_field( $body['poll_token'] ?? '' );
		$result     = $this->backend_get( '/api/roi/plugin/auth/magic-link/status?poll_token=' . rawurlencode( $poll_token ) );
		$this->send_backend_result( $result );
	}

	/** Force re-validate the stored license key against the backend. */
	public function handle_license_validate(): void {
		$this->verify_request();
		$this->license->clear_cache();
		try {
			wp_send_json_success( $this->license->get_license_data( true ) );
		} catch ( \Throwable $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions
			error_log( 'roi-insights: license validation failed: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() );
			wp_send_json_error( array( 'error' => 'Validation failed. Please try again or contact support if the issue persists.' ), 503 );
		}
	}

	// ─── Tracking Handlers ──────────────────────────────────────────────────────

	public function handle_tracking_get(): void {
		$this->verify_request();
		wp_send_json_success( $this->settings->get_tracking_settings() );
	}

	public function handle_tracking_save(): void {
		$this->verify_request();
		$this->settings->save_tracking_settings( $this->get_body() );
		wp_send_json_success( array( 'ok' => true ) );
	}

	// ─── Settings Handlers ──────────────────────────────────────────────────────

	public function handle_settings_load(): void {
		$this->verify_request();
		wp_send_json_success( $this->settings->get_advanced_settings() );
	}

	public function handle_settings_save(): void {
		$this->verify_request();
		$body = $this->get_body();

		if ( isset( $body['licenseKey'] ) ) {
			$this->settings->save_license_key( (string) $body['licenseKey'] );
			$this->license->clear_cache();
			unset( $body['licenseKey'] );
		}

		if ( ! empty( $body ) ) {
			$this->settings->save_advanced_settings( $body );
		}

		wp_send_json_success( array( 'ok' => true ) );
	}

	// ─── Onboarding Handlers ───────────────────────────────────────────────────

	/**
	 * Submit onboarding wizard data (business context, objectives, channels, budget)
	 * and signal completion to trigger the dashboard backfill.
	 *
	 * Portal endpoints require the sessionToken (looker_api_key), not the plugin
	 * license key. See portal_auth_headers().
	 */
	public function handle_onboarding_submit(): void {
		$this->verify_request();
		$body = $this->get_body();

		// Forward each section to the corresponding backend endpoint.
		// Fail on the first non-2xx response so partial persistence is not reported as success.
		$steps = array(
			array(
				'path' => '/api/portal/onboarding/business-context',
				'body' => array(
					'business_type' => sanitize_text_field( $body['business_type'] ?? '' ),
					'company_size'  => sanitize_text_field( $body['company_size'] ?? '' ),
				),
			),
			array(
				'path' => '/api/portal/onboarding/objectives',
				'body' => array(
					'primary_objectives' => array_map( 'sanitize_text_field', (array) ( $body['primary_objectives'] ?? array() ) ),
				),
			),
			array(
				'path' => '/api/portal/onboarding/channels',
				'body' => array(
					'lead_sources' => array_map( 'sanitize_text_field', (array) ( $body['lead_sources'] ?? array() ) ),
				),
			),
			array(
				'path' => '/api/portal/onboarding/budget',
				'body' => array(
					'marketing_budget' => sanitize_text_field( $body['marketing_budget'] ?? '' ),
					'budget_scope'     => sanitize_text_field( $body['budget_scope'] ?? '' ),
				),
			),
		);

		foreach ( $steps as $idx => $step ) {
			$result = $this->backend_portal_post( $step['path'], $step['body'] );
			if ( $result['status'] < 200 || $result['status'] >= 300 ) {
				$result['body'] = is_array( $result['body'] ) ? $result['body'] : array();
				$result['body']['failed_step'] = basename( $step['path'] );
				$result['body']['failed_step_index'] = $idx;
				$this->send_backend_result( $result );
				return;
			}
		}

		// Step 5: Signal onboarding completion — triggers the dashboard backfill.
		// The /complete endpoint is idempotent on the backend (sets state to
		// ONBOARDING_COMPLETE; duplicate calls are no-ops).
		$complete = $this->backend_portal_post( '/api/portal/onboarding/complete', new \stdClass() );
		if ( $complete['status'] < 200 || $complete['status'] >= 300 ) {
			$complete['body'] = is_array( $complete['body'] ) ? $complete['body'] : array();
			$complete['body']['failed_step'] = 'complete';
			$complete['body']['failed_step_index'] = count( $steps );
			$this->send_backend_result( $complete );
			return;
		}

		wp_send_json_success( array( 'ok' => true ) );
	}

	/** Trigger a website scan for onboarding Step 1. */
	public function handle_onboarding_scan(): void {
		$this->verify_request();

		// Rate limit: 1 scan per minute per user.
		$throttle_key = 'roi_scan_' . get_current_blog_id() . '_' . get_current_user_id();
		if ( get_transient( $throttle_key ) ) {
			wp_send_json_error( array( 'message' => 'Please wait before scanning again.' ), 429 );
		}
		set_transient( $throttle_key, 1, 60 );

		$body = $this->get_body();
		$url  = esc_url_raw( $body['url'] ?? '' );

		// SSRF guard: only allow scanning the site's own domain over HTTPS.
		// Normalize IDN/punycode to ASCII for consistent comparison, and reject
		// URLs containing userinfo (user:pass@host) which could bypass host checks.
		$parsed = wp_parse_url( $url );
		if ( ! is_array( $parsed ) ) {
			wp_send_json_error( array( 'message' => 'Invalid scan URL.' ), 400 );
		}
		if ( ! empty( $parsed['user'] ) || ! empty( $parsed['pass'] ) ) {
			wp_send_json_error( array( 'message' => 'Invalid scan URL.' ), 400 );
		}

		$scan_scheme = $parsed['scheme'] ?? '';
		$scan_host   = strtolower( $parsed['host'] ?? '' );
		$site_host   = strtolower( wp_parse_url( home_url(), PHP_URL_HOST ) );

		// Normalize IDN domains to ASCII (punycode) for safe comparison.
		if ( function_exists( 'idn_to_ascii' ) ) {
			$scan_host = idn_to_ascii( $scan_host, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46 ) ?: $scan_host;
			$site_host = idn_to_ascii( $site_host, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46 ) ?: $site_host;
		}

		if ( 'https' !== $scan_scheme || $scan_host !== $site_host ) {
			wp_send_json_error( array( 'message' => 'Scan URL must match the site domain over HTTPS.' ), 400 );
		}

		$result = $this->backend_portal_post( '/api/portal/onboarding/website-scan', array( 'url' => $url ) );
		$this->send_backend_result( $result );
	}

	/** Poll onboarding state (includes scan status/results). */
	public function handle_onboarding_state(): void {
		$this->verify_request();
		$result = $this->backend_portal_get( '/api/portal/onboarding/state' );
		$this->send_backend_result( $result );
	}

	/** Standalone completion endpoint — allows retry if the /complete call fails independently. */
	public function handle_onboarding_complete(): void {
		$this->verify_request();
		$result = $this->backend_portal_post( '/api/portal/onboarding/complete', new \stdClass() );
		$this->send_backend_result( $result );
	}

	// ─── Integrations Handlers ─────────────────────────────────────────────────

	/** Fetch connected service statuses for the Activation tab. */
	public function handle_integrations_get(): void {
		$this->verify_request();
		$result = $this->backend_portal_get( '/api/portal/integrations' );
		$this->send_backend_result( $result );
	}

	/** Disconnect the Google account (keeps license key valid). */
	public function handle_integrations_disconnect(): void {
		$this->verify_request();
		$result = $this->backend_portal_delete( '/api/portal/integrations/google' );
		$this->send_backend_result( $result );
	}

	// ─── Response Helpers ───────────────────────────────────────────────────────

	/**
	 * Forward a backend proxy result as wp_send_json_success / _error.
	 *
	 * @param array{status:int,body:mixed} $result
	 */
	private function send_backend_result( array $result ): void {
		if ( $result['status'] >= 200 && $result['status'] < 300 ) {
			wp_send_json_success( $result['body'] );
		} else {
			wp_send_json_error( $result['body'], $result['status'] );
		}
	}

	// ─── Backend Proxy Helpers ──────────────────────────────────────────────────

	/**
	 * @return array{status:int,body:mixed}
	 */
	private function backend_get( string $path ): array {
		$response = wp_remote_get(
			self::BACKEND . $path,
			array(
				'timeout' => 10,
				'headers' => $this->auth_headers(),
			)
		);
		return $this->parse_response( $response );
	}

	/**
	 * @return array{status:int,body:mixed}
	 */
	private function backend_post( string $path, array $body ): array {
		$response = wp_remote_post(
			self::BACKEND . $path,
			array(
				'timeout' => 10,
				'headers' => array_merge( $this->auth_headers(), array( 'Content-Type' => 'application/json' ) ),
				'body'    => wp_json_encode( $body ),
			)
		);
		return $this->parse_response( $response );
	}

	/**
	 * Auth headers for plugin-specific endpoints (/api/roi/plugin/*).
	 * Uses the qdsh_… license key stored in wp_options.
	 *
	 * Only sends X-License-Key — the single header plugin endpoints expect.
	 * Portal endpoints use portal_auth_headers() with a Bearer token instead.
	 */
	private function auth_headers(): array {
		$key = $this->settings->get_license_key();
		if ( ! $key ) {
			return array();
		}
		return array(
			'Accept'        => 'application/json',
			'X-License-Key' => $key,
		);
	}

	/**
	 * Auth headers for portal endpoints (/api/portal/*).
	 *
	 * Portal endpoints authenticate via the looker_api_key (sessionToken),
	 * NOT the qdsh_… plugin license key. The sessionToken is returned by the
	 * /api/roi/plugin/validate endpoint and cached in the license transient.
	 */
	private function portal_auth_headers(): array {
		$data  = $this->license->get_license_data();
		$token = $data['sessionToken'] ?? '';
		if ( empty( $token ) ) {
			// No sessionToken available — return Accept only so the request fails
			// with a clear 401 rather than sending a mismatched X-License-Key
			// that portal endpoints won't recognize.
			return array( 'Accept' => 'application/json' );
		}
		return array(
			'Accept'        => 'application/json',
			'Authorization' => 'Bearer ' . $token,
		);
	}

	// ─── Portal Backend Proxy Helpers ───────────────────────────────────────────

	/**
	 * @return array{status:int,body:mixed}
	 */
	private function backend_portal_get( string $path ): array {
		$response = wp_remote_get(
			self::BACKEND . $path,
			array(
				'timeout' => 10,
				'headers' => $this->portal_auth_headers(),
			)
		);
		return $this->parse_response( $response );
	}

	/**
	 * @param object|array $body  Use stdClass for empty {} payloads.
	 * @return array{status:int,body:mixed}
	 */
	private function backend_portal_post( string $path, $body ): array {
		$response = wp_remote_post(
			self::BACKEND . $path,
			array(
				'timeout' => 10,
				'headers' => array_merge( $this->portal_auth_headers(), array( 'Content-Type' => 'application/json' ) ),
				'body'    => wp_json_encode( $body ),
			)
		);
		return $this->parse_response( $response );
	}

	/**
	 * @return array{status:int,body:mixed}
	 */
	private function backend_portal_delete( string $path ): array {
		$response = wp_remote_request(
			self::BACKEND . $path,
			array(
				'method'  => 'DELETE',
				'timeout' => 10,
				'headers' => $this->portal_auth_headers(),
			)
		);
		return $this->parse_response( $response );
	}

	/**
	 * @param WP_Error|array $response
	 * @return array{status:int,body:mixed}
	 */
	private function parse_response( $response ): array {
		if ( is_wp_error( $response ) ) {
			return array( 'status' => 503, 'body' => array( 'error' => $response->get_error_message() ) );
		}
		$status = (int) wp_remote_retrieve_response_code( $response );
		$body   = json_decode( wp_remote_retrieve_body( $response ), true );
		return array( 'status' => $status ?: 500, 'body' => $body );
	}
}
