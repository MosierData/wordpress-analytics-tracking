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
			self::API_BASE . '/license/validate',
			array(
				'timeout' => 8,
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( array(
					'licenseKey' => $key,
					'domain'     => wp_parse_url( home_url(), PHP_URL_HOST ),
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

		$code = wp_remote_retrieve_response_code( $response );
		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( 200 !== (int) $code || empty( $body['token'] ) ) {
			return $this->invalid( 'api_error' );
		}

		$verified = $this->verify_token( $body['token'] );
		if ( null === $verified ) {
			return $this->invalid( 'invalid_signature' );
		}

		if ( $verified['exp'] < time() ) {
			return $this->invalid( 'expired' );
		}

		$data = array(
			'isValid'      => true,
			'isFallback'   => false,
			'reason'       => null,
			'tier'         => $verified['tier'],
			'capabilities' => $verified['capabilities'],
			'sessionToken' => $body['sessionToken'] ?? null,
			'expiresAt'    => $verified['exp'],
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
	 * Verify Ed25519 signature and decode payload.
	 * Returns decoded payload array or null on failure.
	 */
	private function verify_token( array $token ): ?array {
		if ( ! function_exists( 'sodium_crypto_sign_verify_detached' ) ) {
			// sodium not available — skip verification (log warning).
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions
			error_log( 'roi-insights: sodium extension not available; skipping Ed25519 verification.' );
			$payload_json = base64_decode( $token['payload'] ?? '' );
			return json_decode( $payload_json, true ) ?: null;
		}

		$payload_b64   = $token['payload'] ?? '';
		$signature_b64 = $token['signature'] ?? '';

		if ( empty( $payload_b64 ) || empty( $signature_b64 ) ) {
			return null;
		}

		$public_key = base64_decode( self::PUBLIC_KEY );
		$signature  = base64_decode( $signature_b64 );
		$payload    = base64_decode( $payload_b64 );

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
