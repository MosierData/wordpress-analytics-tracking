<?php
/**
 * License — validates domain-bound license keys via api.roiknowledge.com.
 * Signatures are Ed25519-verified using PHP's sodium extension.
 *
 * @package ROI_Insights
 */

/*
 * ROI Insights — Marketing Analytics & Call Tracking
 * Copyright (C) 2026 MosierData
 * License: GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

class ROI_Insights_License {

	const API_BASE   = 'https://api.roiknowledge.com';
	const CACHE_KEY  = 'roi_insights_license_cache';
	const PUBLIC_KEY = 'COwQzXhDeQC9uxAdyNFdbFbIrwLAGgtRZlhfAxbR0Dk=';

	/** @var ROI_Insights_Settings */
	private $settings;

	public function __construct( ROI_Insights_Settings $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Returns current license data. Uses transient cache unless $force is true.
	 *
	 * @return array{isValid:bool,isFallback:bool,reason:string|null,tier:string|null,capabilities:string[],sessionToken:string|null,expiresAt:int|null}
	 */
	public function get_license_data( bool $force = false ): array {
		if ( ! $force ) {
			$cached = get_transient( self::CACHE_KEY );
			if ( false !== $cached ) {
				return (array) $cached;
			}
		}

		$key = $this->settings->get_license_key();
		if ( empty( $key ) ) {
			return $this->invalid( 'missing_key' );
		}

		$response = wp_remote_post(
			self::API_BASE . '/api/roi/plugin/validate',
			array(
				'timeout' => 8,
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( array(
					'license_key' => $key,
					'domain'      => wp_parse_url( home_url(), PHP_URL_HOST ),
					'version'     => defined( 'ROI_INSIGHTS_VERSION' ) ? ROI_INSIGHTS_VERSION : '1.0.0',
				) ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $this->stale_or_invalid();
		}

		$code     = wp_remote_retrieve_response_code( $response );
		$raw_body = wp_remote_retrieve_body( $response );
		$body     = json_decode( $raw_body, true );

		// On server errors (5xx), try stale cache before giving up.
		if ( (int) $code >= 500 ) {
			return $this->stale_or_invalid();
		}

		if ( 200 !== (int) $code || ! is_array( $body ) ) {
			return $this->invalid( 'api_error' );
		}

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions
			error_log( 'roi-insights: validate response keys: ' . implode( ', ', array_keys( $body ) ) );
		}

		if ( ! function_exists( 'sodium_crypto_sign_verify_detached' ) ) {
			return $this->invalid( 'sodium_unavailable' );
		}

		$verified = null;

		// Format 1: signed token object { payload: "...", signature: "..." }.
		if ( ! empty( $body['token'] ) && is_array( $body['token'] ) ) {
			$verified = $this->verify_token( $body['token'] );
		}
		// Format 2: compact token — base64(json_payload).base64(ed25519_signature).
		// Not a JWT (which has 3 parts: header.payload.signature).
		elseif ( ! empty( $body['token'] ) && is_string( $body['token'] ) ) {
			$verified = $this->verify_compact_token( $body['token'] );
		}

		if ( null === $verified ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions
				error_log( 'roi-insights: token verification failed. token type: ' . gettype( $body['token'] ?? null ) );
			}
			return $this->invalid( 'invalid_signature' );
		}

		// 60-second leeway to account for clock skew between server and token issuer.
		if ( ( $verified['exp'] ?? 0 ) < ( time() - 60 ) ) {
			return $this->invalid( 'expired' );
		}

		// Dashboard status — passed through from the backend response.
		$dashboard_status        = $body['dashboard_status'] ?? $body['dashboardStatus'] ?? null;
		$dashboard_status_detail = $body['dashboard_status_detail'] ?? $body['dashboardStatusDetail'] ?? null;

		$data = array(
			'isValid'               => true,
			'isFallback'            => false,
			'reason'                => null,
			'tier'                  => $verified['tier'] ?? 'free',
			'capabilities'          => $verified['capabilities'] ?? array(),
			'sessionToken'          => $body['sessionToken'] ?? $body['session_token'] ?? null,
			'expiresAt'             => $verified['exp'],
			'dashboardStatus'       => $dashboard_status,
			'dashboardStatusDetail' => $dashboard_status_detail,
		);

		// Cap TTL at 15 minutes so session tokens are refreshed before they expire
		// on the remote dashboard service. The license itself may be valid for months,
		// but the embedded session token is typically short-lived.
		$ttl = min( 15 * MINUTE_IN_SECONDS, max( 60, $verified['exp'] - time() ) );
		set_transient( self::CACHE_KEY, $data, $ttl );
		$stale_data = array_merge( $data, array( '_cached_at' => time() ) );
		set_transient( self::CACHE_KEY . '_stale', $stale_data, DAY_IN_SECONDS * 7 );

		return $data;
	}

	/**
	 * Check if the current license has a given capability.
	 */
	public function has_capability( string $capability ): bool {
		$data = $this->get_license_data();
		return $data['isValid'] && in_array( $capability, (array) $data['capabilities'], true );
	}

	/**
	 * Verify a signed token object { payload: "base64...", signature: "base64..." }.
	 * Ed25519 signature is verified against the decoded payload bytes.
	 *
	 * Caller must ensure sodium is available before calling (checked in get_license_data).
	 */
	private function verify_token( array $token ): ?array {
		$payload_b64   = $token['payload'] ?? '';
		$signature_b64 = $token['signature'] ?? '';

		if ( empty( $payload_b64 ) || empty( $signature_b64 ) ) {
			return null;
		}

		$payload   = base64_decode( $payload_b64 );
		$signature = base64_decode( $signature_b64 );

		if ( empty( $payload ) || empty( $signature ) ) {
			return null;
		}

		$public_key = base64_decode( self::PUBLIC_KEY );

		try {
			$valid = sodium_crypto_sign_verify_detached( $signature, $payload, $public_key );
		} catch ( \Exception $e ) {
			return null;
		}

		if ( ! $valid ) {
			return null;
		}

		$decoded = json_decode( $payload, true );
		return is_array( $decoded ) ? $decoded : null;
	}

	/**
	 * Verify a compact token: base64(json_payload).base64(ed25519_signature).
	 *
	 * This is NOT a JWT (which has 3 parts: header.payload.signature with an
	 * algorithm header). This format is 2 parts only: payload + Ed25519 sig.
	 * Backend uses standard base64, not base64url.
	 *
	 * Caller must ensure sodium is available before calling (checked in get_license_data).
	 */
	private function verify_compact_token( string $token ): ?array {
		$parts = explode( '.', $token );

		if ( count( $parts ) !== 2 ) {
			return null;
		}

		$payload   = base64_decode( $parts[0] );
		$signature = base64_decode( $parts[1] );

		if ( empty( $payload ) || empty( $signature ) ) {
			return null;
		}

		$public_key = base64_decode( self::PUBLIC_KEY );

		try {
			$valid = sodium_crypto_sign_verify_detached( $signature, $payload, $public_key );
		} catch ( \Exception $e ) {
			return null;
		}

		if ( ! $valid ) {
			return null;
		}

		$decoded = json_decode( $payload, true );
		return is_array( $decoded ) ? $decoded : null;
	}

	/**
	 * Return stale cached data if available and less than 24 hours old,
	 * otherwise return an api_error invalid response.
	 */
	private function stale_or_invalid(): array {
		// Don't return stale valid data if sodium is unavailable — the stale data
		// was verified with sodium, but we can't re-verify now. Fail fast so the
		// admin notice surfaces the sodium_unavailable message.
		if ( ! function_exists( 'sodium_crypto_sign_verify_detached' ) ) {
			return $this->invalid( 'sodium_unavailable' );
		}

		$stale = get_transient( self::CACHE_KEY . '_stale' );
		if ( false !== $stale ) {
			$data = (array) $stale;
			$stale_age = time() - (int) ( $data['_cached_at'] ?? 0 );
			if ( $stale_age < DAY_IN_SECONDS ) {
				$data['isFallback'] = true;
				unset( $data['_cached_at'] );
				return $data;
			}
		}
		return $this->invalid( 'api_error' );
	}

	/**
	 * Build an invalid license data array.
	 */
	private function invalid( string $reason ): array {
		return array(
			'isValid'      => false,
			'isFallback'   => false,
			'reason'       => $reason,
			'tier'         => null,
			'capabilities' => array(),
			'sessionToken' => null,
			'expiresAt'    => null,
		);
	}

	/**
	 * Clear the license cache (e.g., after saving a new key).
	 * Also resets the notice dismissal flag so any new license issues
	 * surface immediately instead of staying hidden.
	 */
	public function clear_cache(): void {
		delete_transient( self::CACHE_KEY );
		delete_transient( self::CACHE_KEY . '_stale' );
		delete_user_meta( get_current_user_id(), 'roi_insights_license_notice_dismissed' );
	}
}
