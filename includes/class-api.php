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
			'roi_insights_onboarding_submit' => 'handle_onboarding_submit',
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
		$raw     = isset( $_REQUEST['data'] ) ? wp_unslash( $_REQUEST['data'] ) : '{}';
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
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$src      = isset( $_REQUEST['src'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['src'] ) ) : 'default';
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

	/** Poll magic-link verification status. */
	public function handle_license_pending(): void {
		$this->verify_request();
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$poll_token = isset( $_REQUEST['poll_token'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['poll_token'] ) ) : '';
		$result     = $this->backend_get( '/api/roi/plugin/auth/magic-link/status?poll_token=' . rawurlencode( $poll_token ) );
		$this->send_backend_result( $result );
	}

	/** Force re-validate the stored license key against the backend. */
	public function handle_license_validate(): void {
		$this->verify_request();
		$this->license->clear_cache();
		wp_send_json_success( $this->license->get_license_data( true ) );
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

	// ─── Onboarding Handler ────────────────────────────────────────────────────

	/** Submit onboarding wizard data (business context, objectives, channels, budget). */
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

		foreach ( $steps as $step ) {
			$result = $this->backend_post( $step['path'], $step['body'] );
			if ( $result['status'] < 200 || $result['status'] >= 300 ) {
				$this->send_backend_result( $result );
				return; // wp_send_json_error exits, but return for clarity.
			}
		}

		wp_send_json_success( array( 'ok' => true ) );
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

	private function auth_headers(): array {
		$key = $this->settings->get_license_key();
		if ( ! $key ) {
			return array();
		}
		// Send the key in all formats the backend may expect.
		// Plugin endpoints use X-License-Key; portal endpoints use Authorization or X-API-Key.
		return array(
			'X-License-Key'  => $key,
			'X-API-Key'      => $key,
			'Authorization'  => 'Bearer ' . $key,
		);
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
