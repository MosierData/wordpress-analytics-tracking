<?php
/**
 * Plugin Name:       ROI Insights — Marketing Analytics & Call Tracking
 * Plugin URI:        https://roiknowledge.com
 * Description:       GTM, GA4, and ad pixel management with call tracking and a live marketing ROI dashboard. Free forever — upgrade for AI call transcription, lead scoring, and advanced attribution.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            MosierData
 * Author URI:        https://mosierdata.com
 * License:           GPL-2.0+
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       roi-insights
 *
 * @package ROI_Insights
 */

/*
 * ROI Insights — Marketing Analytics & Call Tracking
 * Copyright (C) 2026 MosierData
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

defined( 'ABSPATH' ) || exit;

define( 'ROI_INSIGHTS_VERSION', '1.0.0' );
define( 'ROI_INSIGHTS_FILE', __FILE__ );
define( 'ROI_INSIGHTS_DIR', plugin_dir_path( __FILE__ ) );
define( 'ROI_INSIGHTS_URL', plugin_dir_url( __FILE__ ) );

require_once ROI_INSIGHTS_DIR . 'includes/class-roi-insights.php';

register_activation_hook( __FILE__, array( 'ROI_Insights', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'ROI_Insights', 'deactivate' ) );

add_action( 'plugins_loaded', array( 'ROI_Insights', 'get_instance' ) );
