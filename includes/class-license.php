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
			// Fail-open: return cached if available, otherwise invalid with api_error.
			$stale = get_transient( self::CACHE_KEY . '_stale' );
			if ( false !== $stale ) {
				$data               = (array) $stale;
				$data['isFallback'] = true;
				return $data;
			}
			return $this->invalid( 'api_error' );
		}

		$code     = wp_remote_retrieve_response_code( $response );
		$raw_body = wp_remote_retrieve_body( $response );
		$body     = json_decode( $raw_body, true );

		if ( 200 !== (int) $code || ! is_array( $body ) ) {
			return $this->invalid( 'api_error' );
		}

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions
			error_log( 'roi-insights: validate response keys: ' . implode( ', ', array_keys( $body ) ) );
		}

		$verified = null;

		// Format 1: signed token object { payload: "...", signature: "..." }.
		if ( ! empty( $body['token'] ) && is_array( $body['token'] ) ) {
			$verified = $this->verify_token( $body['token'] );
		}
		// Format 2: signed token as a JWT-style dot-separated string.
		elseif ( ! empty( $body['token'] ) && is_string( $body['token'] ) ) {
			$verified = $this->verify_jwt_token( $body['token'] );
		}
		// Format 3: inline license data (no token wrapper — payload is the body itself).
		elseif ( isset( $body['tier'] ) && isset( $body['exp'] ) ) {
			$verified = $body;
		}

		if ( null === $verified ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions
				error_log( 'roi-insights: token verification failed. token type: ' . gettype( $body['token'] ?? null ) );
			}
			return $this->invalid( 'invalid_signature' );
		}

		if ( ( $verified['exp'] ?? 0 ) < time() ) {
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

		$ttl = max( 60, $verified['exp'] - time() );
		set_transient( self::CACHE_KEY, $data, $ttl );
		set_transient( self::CACHE_KEY . '_stale', $data, DAY_IN_SECONDS * 7 );

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

		if ( ! function_exists( 'sodium_crypto_sign_verify_detached' ) ) {
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
	 * Verify a dot-separated token: base64(json_payload).base64(ed25519_signature).
	 *
	 * Backend format uses standard base64 (not base64url). Signature is verified
	 * against the decoded payload bytes, not the base64 string.
	 */
	private function verify_jwt_token( string $jwt ): ?array {
		$parts = explode( '.', $jwt );

		if ( count( $parts ) !== 2 ) {
			return null;
		}

		$payload   = base64_decode( $parts[0] );
		$signature = base64_decode( $parts[1] );

		if ( empty( $payload ) || empty( $signature ) ) {
			return null;
		}

		if ( ! function_exists( 'sodium_crypto_sign_verify_detached' ) ) {
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
	 */
	public function clear_cache(): void {
		delete_transient( self::CACHE_KEY );
	}
}
