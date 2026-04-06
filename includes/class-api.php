<?php
/**
 * REST API — registers /wp-json/roi-insights/v1/ endpoints.
 * All admin endpoints require manage_options capability.
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

	const NAMESPACE = 'roi-insights/v1';
	const BACKEND   = 'https://api.roiknowledge.com';

	/** @var ROI_Insights_Settings */
	private $settings;

	/** @var ROI_Insights_License */
	private $license;

	public function __construct( ROI_Insights_Settings $settings, ROI_Insights_License $license ) {
		$this->settings = $settings;
		$this->license  = $license;
	}

	public function register_routes(): void {
		// License endpoints.
		register_rest_route( self::NAMESPACE, '/license/status', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'license_status' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
		register_rest_route( self::NAMESPACE, '/license/oauth-redirect', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'license_oauth_redirect' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
		register_rest_route( self::NAMESPACE, '/license/register', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'license_register' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
		register_rest_route( self::NAMESPACE, '/license/request-magic-link', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'license_request_magic_link' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
		register_rest_route( self::NAMESPACE, '/license/magic-link-status', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'license_magic_link_status' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
		register_rest_route( self::NAMESPACE, '/license/validate', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'license_validate' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );

		// Tracking settings.
		register_rest_route( self::NAMESPACE, '/tracking/settings', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'tracking_get' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
		register_rest_route( self::NAMESPACE, '/tracking/save', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'tracking_save' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );

		// General settings.
		register_rest_route( self::NAMESPACE, '/settings/load', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'settings_load' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
		register_rest_route( self::NAMESPACE, '/settings/save', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'settings_save' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );

		// Google OAuth.
		register_rest_route( self::NAMESPACE, '/google-oauth/initiate', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'google_oauth_initiate' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
		register_rest_route( self::NAMESPACE, '/google-oauth/status', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'google_oauth_status' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
		register_rest_route( self::NAMESPACE, '/google-oauth/connected', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'google_oauth_connected' ),
			'permission_callback' => array( $this, 'require_admin' ),
		) );
	}

	// ─── Permission ─────────────────────────────────────────────────────────────

	public function require_admin(): bool {
		return current_user_can( 'manage_options' );
	}

	// ─── License Handlers ───────────────────────────────────────────────────────

	public function license_status(): WP_REST_Response {
		return new WP_REST_Response( $this->license->get_license_data(), 200 );
	}

	public function license_oauth_redirect( WP_REST_Request $request ): WP_REST_Response {
		$provider = sanitize_text_field( $request->get_param( 'provider' ) ?? 'google' );
		$result   = $this->backend_get( '/license/oauth-redirect?provider=' . rawurlencode( $provider ) . '&domain=' . rawurlencode( wp_parse_url( home_url(), PHP_URL_HOST ) ) );
		return new WP_REST_Response( $result['body'], $result['status'] );
	}

	public function license_register( WP_REST_Request $request ): WP_REST_Response {
		$token  = sanitize_text_field( $request->get_param( 'token' ) ?? '' );
		$domain = wp_parse_url( home_url(), PHP_URL_HOST );

		$result = $this->backend_post( '/license/register', array( 'token' => $token, 'domain' => $domain ) );

		// If backend returned a license key, persist it.
		if ( 200 === $result['status'] && ! empty( $result['body']['licenseKey'] ) ) {
			$this->settings->save_license_key( $result['body']['licenseKey'] );
			$this->license->clear_cache();
			$result['body']['license'] = $this->license->get_license_data( true );
		}

		return new WP_REST_Response( $result['body'], $result['status'] );
	}

	public function license_request_magic_link( WP_REST_Request $request ): WP_REST_Response {
		$email  = sanitize_email( $request->get_param( 'email' ) ?? '' );
		$domain = wp_parse_url( home_url(), PHP_URL_HOST );
		$result = $this->backend_post( '/license/request-magic-link', array( 'email' => $email, 'domain' => $domain ) );
		return new WP_REST_Response( $result['body'], $result['status'] );
	}

	public function license_magic_link_status( WP_REST_Request $request ): WP_REST_Response {
		$poll_token = sanitize_text_field( $request->get_param( 'poll_token' ) ?? '' );
		$result     = $this->backend_get( '/license/magic-link-status?poll_token=' . rawurlencode( $poll_token ) );
		return new WP_REST_Response( $result['body'], $result['status'] );
	}

	public function license_validate(): WP_REST_Response {
		$this->license->clear_cache();
		$data = $this->license->get_license_data( true );
		return new WP_REST_Response( $data, 200 );
	}

	// ─── Tracking Handlers ──────────────────────────────────────────────────────

	public function tracking_get(): WP_REST_Response {
		return new WP_REST_Response( $this->settings->get_tracking_settings(), 200 );
	}

	public function tracking_save( WP_REST_Request $request ): WP_REST_Response {
		$body = $request->get_json_params();
		$this->settings->save_tracking_settings( (array) $body );
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	// ─── Settings Handlers ──────────────────────────────────────────────────────

	public function settings_load(): WP_REST_Response {
		return new WP_REST_Response( $this->settings->get_advanced_settings(), 200 );
	}

	public function settings_save( WP_REST_Request $request ): WP_REST_Response {
		$body = $request->get_json_params();

		// License key is saved separately.
		if ( isset( $body['licenseKey'] ) ) {
			$this->settings->save_license_key( (string) $body['licenseKey'] );
			$this->license->clear_cache();
			unset( $body['licenseKey'] );
		}

		if ( ! empty( $body ) ) {
			$this->settings->save_advanced_settings( (array) $body );
		}

		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	// ─── Google OAuth Handlers ──────────────────────────────────────────────────

	public function google_oauth_initiate(): WP_REST_Response {
		$domain = wp_parse_url( home_url(), PHP_URL_HOST );
		$result = $this->backend_post( '/google-oauth/initiate', array( 'domain' => $domain ) );
		return new WP_REST_Response( $result['body'], $result['status'] );
	}

	public function google_oauth_status(): WP_REST_Response {
		$domain = wp_parse_url( home_url(), PHP_URL_HOST );
		$result = $this->backend_get( '/google-oauth/status?domain=' . rawurlencode( $domain ) );
		return new WP_REST_Response( $result['body'], $result['status'] );
	}

	public function google_oauth_connected( WP_REST_Request $request ): WP_REST_Response {
		$domain = wp_parse_url( home_url(), PHP_URL_HOST );
		$result = $this->backend_post( '/google-oauth/connected', array( 'domain' => $domain ) );
		return new WP_REST_Response( $result['body'], $result['status'] );
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
		return $key ? array( 'X-License-Key' => $key ) : array();
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
