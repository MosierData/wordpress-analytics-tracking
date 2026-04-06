<?php
/**
 * Settings — WordPress options abstraction.
 *
 * @package ROI_Insights
 */

/*
 * ROI Insights — Marketing Analytics & Call Tracking
 * Copyright (C) 2026 MosierData
 * License: GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

class ROI_Insights_Settings {

	const TRACKING_OPTION  = 'roi_insights_tracking';
	const ADVANCED_OPTION  = 'roi_insights_advanced';
	const LICENSE_OPTION   = 'roi_insights_license_key';

	/**
	 * Default tracking settings.
	 */
	private static function tracking_defaults(): array {
		return array(
			'gtmEnabled'       => false,
			'gtmId'            => '',
			'ga4Enabled'       => false,
			'ga4Id'            => '',
			'metaEnabled'      => false,
			'metaId'           => '',
			'linkedinEnabled'  => false,
			'linkedinId'       => '',
			'tiktokEnabled'    => false,
			'tiktokId'         => '',
			'bingEnabled'      => false,
			'bingId'           => '',
			'pinterestEnabled' => false,
			'pinterestId'      => '',
			'nextdoorEnabled'  => false,
			'nextdoorId'       => '',
		);
	}

	/**
	 * Default advanced settings.
	 */
	private static function advanced_defaults(): array {
		return array(
			'dniSwapNumber'    => '',
			'dniScriptUrl'     => '',
			'customHeadCode'   => '',
			'customFooterCode' => '',
			'debug'            => false,
		);
	}

	public function get_tracking_settings(): array {
		$saved = get_option( self::TRACKING_OPTION, array() );
		return array_merge( self::tracking_defaults(), (array) $saved );
	}

	public function save_tracking_settings( array $data ): bool {
		$clean = array(
			'gtmEnabled'       => ! empty( $data['gtmEnabled'] ),
			'gtmId'            => sanitize_text_field( $data['gtmId'] ?? '' ),
			'ga4Enabled'       => ! empty( $data['ga4Enabled'] ),
			'ga4Id'            => sanitize_text_field( $data['ga4Id'] ?? '' ),
			'metaEnabled'      => ! empty( $data['metaEnabled'] ),
			'metaId'           => sanitize_text_field( $data['metaId'] ?? '' ),
			'linkedinEnabled'  => ! empty( $data['linkedinEnabled'] ),
			'linkedinId'       => sanitize_text_field( $data['linkedinId'] ?? '' ),
			'tiktokEnabled'    => ! empty( $data['tiktokEnabled'] ),
			'tiktokId'         => sanitize_text_field( $data['tiktokId'] ?? '' ),
			'bingEnabled'      => ! empty( $data['bingEnabled'] ),
			'bingId'           => sanitize_text_field( $data['bingId'] ?? '' ),
			'pinterestEnabled' => ! empty( $data['pinterestEnabled'] ),
			'pinterestId'      => sanitize_text_field( $data['pinterestId'] ?? '' ),
			'nextdoorEnabled'  => ! empty( $data['nextdoorEnabled'] ),
			'nextdoorId'       => sanitize_text_field( $data['nextdoorId'] ?? '' ),
		);
		return update_option( self::TRACKING_OPTION, $clean );
	}

	public function get_advanced_settings(): array {
		$saved = get_option( self::ADVANCED_OPTION, array() );
		return array_merge( self::advanced_defaults(), (array) $saved );
	}

	public function save_advanced_settings( array $data ): bool {
		$clean = array(
			'dniSwapNumber'    => sanitize_text_field( $data['dniSwapNumber'] ?? '' ),
			'dniScriptUrl'     => esc_url_raw( $data['dniScriptUrl'] ?? '' ),
			'customHeadCode'   => wp_kses_post( $data['customHeadCode'] ?? '' ),
			'customFooterCode' => wp_kses_post( $data['customFooterCode'] ?? '' ),
			'debug'            => ! empty( $data['debug'] ),
		);
		return update_option( self::ADVANCED_OPTION, $clean );
	}

	public function get_license_key(): string {
		return (string) get_option( self::LICENSE_OPTION, '' );
	}

	public function save_license_key( string $key ): bool {
		return update_option( self::LICENSE_OPTION, sanitize_text_field( $key ), false );
	}

	/**
	 * Seed defaults on activation.
	 */
	public function seed_defaults(): void {
		if ( false === get_option( self::TRACKING_OPTION ) ) {
			add_option( self::TRACKING_OPTION, self::tracking_defaults() );
		}
		if ( false === get_option( self::ADVANCED_OPTION ) ) {
			add_option( self::ADVANCED_OPTION, self::advanced_defaults() );
		}
	}
}
