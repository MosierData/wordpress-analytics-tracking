/* global mdROIIConfig */
(function () {
  "use strict";

  // -----------------------------
  // Utilities
  // -----------------------------
  function nowMs() { return Date.now(); }

  function uuidv4() {
    // RFC4122 v4 compliant enough for dedupe identifiers.
    // Not crypto-grade; fine for analytics event IDs.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function log() {
    if (mdROIIConfig && mdROIIConfig.enable_debug && window.console && console.log) {
      console.log.apply(console, arguments);
    }
  }

  // -----------------------------
  // Cookie helpers (simple, first-party)
  // -----------------------------
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Lax";
  }

  function getCookie(name) {
    var n = name + "=";
    var parts = document.cookie.split(";");
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].trim();
      if (c.indexOf(n) === 0) return decodeURIComponent(c.substring(n.length, c.length));
    }
    return "";
  }

  function getQueryParams() {
    var params = {};
    var q = window.location.search.substring(1);
    if (!q) return params;
    q.split("&").forEach(function (pair) {
      var p = pair.split("=");
      var k = decodeURIComponent(p[0] || "").trim();
      if (!k) return;
      var v = decodeURIComponent((p[1] || "").replace(/\+/g, " ")).trim();
      params[k] = v;
    });
    return params;
  }

  // -----------------------------
  // Config defaults
  // -----------------------------
  var CFG = window.mdROIIConfig || {};
  var COOKIE_DAYS = Number(CFG.cookie_days || 90);
  var SESSION_MIN = Number(CFG.session_minutes || 30);
  var THANK_YOU_PATHS = Array.isArray(CFG.thank_you_paths) ? CFG.thank_you_paths : ["/thank-you/"];
  var THANK_YOU_PARAM = String(CFG.thank_you_param || "roii_form_id");
  var APPOINTMENT_THANK_YOU_PATHS = Array.isArray(CFG.appointment_thank_you_paths) ? CFG.appointment_thank_you_paths : ["/calendly/", "/ghl/", "/booked/", "/booking/thanks/"];

  // Cookie names (namespace)
  var C = {
    // Current touch (last known)
    UTM: "_md_roii_utm",
    CLICK: "_md_roii_click",
    // First touch (persisted once)
    F_UTM: "_md_roii_first_utm",
    F_CLICK: "_md_roii_first_click",
    FIRST_REF: "_md_roii_first_ref",
    FIRST_LP: "_md_roii_first_lp",
    // Session
    SESS_ID: "_md_roii_sess_id",
    SESS_START: "_md_roii_sess_start",
    SESS_LAST: "_md_roii_sess_last",
    PAGE_COUNT: "_md_roii_page_count"
  };

  // -----------------------------
  // Attribution capture + persistence
  // -----------------------------
  function captureAttribution() {
    var qp = getQueryParams();

    var utm = {
      utm_source: qp.utm_source || "",
      utm_medium: qp.utm_medium || "",
      utm_campaign: qp.utm_campaign || "",
      utm_content: qp.utm_content || "",
      utm_term: qp.utm_term || ""
    };

    var click = {
      gclid: qp.gclid || "",
      fbclid: qp.fbclid || "",
      msclkid: qp.msclkid || ""
    };

    // Save "current/last known" only when any exists
    var hasUtm = Object.keys(utm).some(function (k) { return !!utm[k]; });
    var hasClick = Object.keys(click).some(function (k) { return !!click[k]; });

    if (hasUtm) setCookie(C.UTM, JSON.stringify(utm), COOKIE_DAYS);
    if (hasClick) setCookie(C.CLICK, JSON.stringify(click), COOKIE_DAYS);

    // First touch (only set once)
    if (!getCookie(C.FIRST_LP)) setCookie(C.FIRST_LP, window.location.pathname || "/", COOKIE_DAYS);
    if (!getCookie(C.FIRST_REF)) {
      var ref = document.referrer || "";
      // keep first external referrer only (if any)
      setCookie(C.FIRST_REF, ref, COOKIE_DAYS);
    }

    if (!getCookie(C.F_UTM) && hasUtm) setCookie(C.F_UTM, JSON.stringify(utm), COOKIE_DAYS);
    if (!getCookie(C.F_CLICK) && hasClick) setCookie(C.F_CLICK, JSON.stringify(click), COOKIE_DAYS);
  }

  function parseJsonCookie(name) {
    var raw = getCookie(name);
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }

  function getAttributionSnapshot() {
    var utm = parseJsonCookie(C.UTM);
    var click = parseJsonCookie(C.CLICK);
    var futm = parseJsonCookie(C.F_UTM);
    var fclick = parseJsonCookie(C.F_CLICK);

    return {
      // current/last
      utm_source: utm.utm_source || "",
      utm_medium: utm.utm_medium || "",
      utm_campaign: utm.utm_campaign || "",
      utm_content: utm.utm_content || "",
      utm_term: utm.utm_term || "",
      gclid: click.gclid || "",
      fbclid: click.fbclid || "",
      msclkid: click.msclkid || "",

      // first-touch
      first_utm_source: futm.utm_source || "",
      first_utm_medium: futm.utm_medium || "",
      first_utm_campaign: futm.utm_campaign || "",
      first_utm_content: futm.utm_content || "",
      first_utm_term: futm.utm_term || "",
      first_gclid: fclick.gclid || "",

      first_landing_page: getCookie(C.FIRST_LP) || "",
      first_referrer: getCookie(C.FIRST_REF) || ""
    };
  }

  // -----------------------------
  // Session tracking
  // -----------------------------
  function ensureSession() {
    var sessId = getCookie(C.SESS_ID);
    var sessLast = Number(getCookie(C.SESS_LAST) || "0");
    var now = nowMs();

    var isExpired = !sessLast || (now - sessLast) > (SESSION_MIN * 60 * 1000);

    if (!sessId || isExpired) {
      sessId = "md_sess_" + Math.floor(Math.random() * 1e12);
      setCookie(C.SESS_ID, sessId, COOKIE_DAYS);
      setCookie(C.SESS_START, String(now), COOKIE_DAYS);
      setCookie(C.PAGE_COUNT, "0", COOKIE_DAYS);
    }

    setCookie(C.SESS_LAST, String(now), COOKIE_DAYS);

    // increment page_count
    var pc = Number(getCookie(C.PAGE_COUNT) || "0") + 1;
    setCookie(C.PAGE_COUNT, String(pc), COOKIE_DAYS);

    return {
      session_id: sessId,
      session_start: Number(getCookie(C.SESS_START) || String(now)),
      page_count: pc,
      landing_page: window.location.pathname || "/"
    };
  }

  // -----------------------------
  // Core dispatcher
  // -----------------------------
  function pushToDataLayer(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    log("[MD ROII] push", payload);
  }

  function enrich(eventName, payload) {
    var s = ensureSession();
    var a = getAttributionSnapshot();

    var enriched = {};
    // Copy user payload first (so we can override with required fields if needed)
    if (payload && typeof payload === "object") {
      for (var k in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, k)) enriched[k] = payload[k];
      }
    }

    enriched.event = eventName;
    enriched.event_id = enriched.event_id || uuidv4();
    enriched.event_timestamp = enriched.event_timestamp || nowMs();

    // session + journey
    enriched.session_id = enriched.session_id || s.session_id;
    enriched.session_start = enriched.session_start || s.session_start;
    enriched.page_count = enriched.page_count || s.page_count;
    enriched.landing_page = enriched.landing_page || s.landing_page;
    enriched.first_landing_page = enriched.first_landing_page || a.first_landing_page;
    enriched.first_referrer = enriched.first_referrer || a.first_referrer;

    // attribution (flat)
    Object.keys(a).forEach(function (key) {
      if (typeof enriched[key] === "undefined") enriched[key] = a[key];
    });

    return enriched;
  }

  window.mdROI = window.mdROI || {};
  window.mdROI.track = function (eventName, payload) {
    if (!eventName) return;
    pushToDataLayer(enrich(eventName, payload || {}));
  };

  // -----------------------------
  // Thank-you page auto conversion
  // -----------------------------
  function isThankYouPath() {
    var p = (window.location.pathname || "").toLowerCase();
    for (var i = 0; i < THANK_YOU_PATHS.length; i++) {
      var t = String(THANK_YOU_PATHS[i] || "").toLowerCase();
      if (!t || t.length < 2) continue;
      if (p.indexOf(t) !== -1) return true;
    }
    return false;
  }

  function isAppointmentThankYouPath() {
    var p = (window.location.pathname || "").toLowerCase();
    for (var i = 0; i < APPOINTMENT_THANK_YOU_PATHS.length; i++) {
      var t = String(APPOINTMENT_THANK_YOU_PATHS[i] || "").toLowerCase();
      if (!t) continue;
      if (p === t) return true;
      if (t.length > 1 && p.indexOf(t) === 0) return true;
    }
    return false;
  }

  function inferCalendarPlatform() {
    var p = (window.location.pathname || "").toLowerCase();
    if (p.indexOf("calendly") !== -1) return "calendly";
    if (p.indexOf("ghl") !== -1 || p.indexOf("highlevel") !== -1) return "ghl";
    return "other";
  }

  function fireThankYouLead() {
    if (isAppointmentThankYouPath()) {
      window.mdROI.track("appointment_booked", {
        lead_type: "appointment",
        calendar_platform: inferCalendarPlatform(),
        conversion_method: "thank_you_page",
        currency: "USD",
        value: 0
      });
      return;
    }
    if (!isThankYouPath()) return;

    var qp = getQueryParams();
    var formId = qp[THANK_YOU_PARAM] || "";

    window.mdROI.track("generate_lead", {
      lead_type: "form",
      conversion_method: "thank_you_page",
      form_id: formId || undefined,
      currency: "USD",
      value: 0
    });
  }

  // -----------------------------
  // Forms adapter (generic)
  // -----------------------------
  function initFormsAdapter() {
    if (!CFG.enable_forms) return;

    // form_impression (optional)
    var forms = document.getElementsByTagName("form");
    for (var i = 0; i < forms.length; i++) {
      var f = forms[i];
      var id = f.getAttribute("id") || f.getAttribute("name") || "";
      if (!id) continue;
      window.mdROI.track("form_impression", {
        lead_type: "form",
        form_id: id,
        non_interaction: true
      });
    }

    // submit tracking (inline fallback)
    document.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form || form.tagName !== "FORM") return;

      // If the site uses thank-you redirects, this inline event may be redundant.
      // Keep it as a fallback. Dedup can be handled by event_id downstream if needed.
      var fid = form.getAttribute("id") || form.getAttribute("name") || "";
      window.mdROI.track("generate_lead", {
        lead_type: "form",
        conversion_method: "inline",
        form_id: fid || undefined,
        currency: "USD",
        value: 0
      });
    }, true);
  }

  // -----------------------------
  // Phone click adapter
  // -----------------------------
  function initPhoneAdapter() {
    document.addEventListener("click", function (e) {
      var el = e.target;
      if (!el) return;

      while (el && el !== document && el.tagName !== "A") {
        if (el.getAttribute && el.getAttribute("data-roii-phone") !== null) {
          window.mdROI.track("phone_click", {
            lead_type: "phone",
            phone_number: el.getAttribute("data-roii-phone") || "click",
            click_text: (el.textContent || "").trim().slice(0, 120)
          });
          return;
        }
        el = el.parentNode;
      }
      if (!el || el.tagName !== "A") return;

      var href = el.getAttribute("href") || "";
      if (href.indexOf("tel:") !== 0) {
        if (el.getAttribute("data-roii-phone") !== null) {
          window.mdROI.track("phone_click", {
            lead_type: "phone",
            phone_number: el.getAttribute("data-roii-phone") || "click",
            click_url: href || undefined,
            click_text: (el.textContent || "").trim().slice(0, 120)
          });
        }
        return;
      }

      var num = href.replace(/^tel:/i, "").trim() || "click";
      window.mdROI.track("phone_click", {
        lead_type: "phone",
        phone_number: num,
        click_url: el.href || href,
        click_text: (el.textContent || "").trim().slice(0, 120)
      });
    }, true);
  }

  // -----------------------------
  // Direction click adapter
  // -----------------------------
  function isDirectionsUrl(href) {
    if (!href) return false;
    var h = href.toLowerCase();
    return h.indexOf("google.com/maps") !== -1 ||
      h.indexOf("maps.google") !== -1 ||
      h.indexOf("apple.com/maps") !== -1 ||
      h.indexOf("maps.apple.com") !== -1 ||
      h.indexOf("bing.com/maps") !== -1 ||
      h.indexOf("openstreetmap.org") !== -1 ||
      h.indexOf("mapq.st") !== -1;
  }

  function initDirectionAdapter() {
    document.addEventListener("click", function (e) {
      var el = e.target;
      if (!el) return;

      while (el && el !== document && el.tagName !== "A") {
        if (el.getAttribute && el.getAttribute("data-roii-directions") !== null) {
          window.mdROI.track("direction_click", {
            destination: el.getAttribute("data-roii-directions") || "",
            click_url: el.getAttribute("data-roii-directions-href") || window.location.href,
            click_text: (el.textContent || "").trim().slice(0, 120)
          });
          return;
        }
        el = el.parentNode;
      }
      if (!el || el.tagName !== "A") return;

      var href = el.getAttribute("href") || "";
      if (isDirectionsUrl(href)) {
        window.mdROI.track("direction_click", {
          destination: href,
          click_url: el.href || href,
          click_text: (el.textContent || "").trim().slice(0, 120)
        });
        return;
      }
      if (el.getAttribute("data-roii-directions") !== null) {
        window.mdROI.track("direction_click", {
          destination: el.getAttribute("data-roii-directions") || "",
          click_url: el.href || href,
          click_text: (el.textContent || "").trim().slice(0, 120)
        });
      }
    }, true);
  }

  // -----------------------------
  // Chat callbacks (site or widget calls these)
  // -----------------------------
  window.mdROI.chatOpened = function (payload) {
    window.mdROI.track("chat_open", payload && typeof payload === "object" ? payload : { lead_type: "chat" });
  };
  window.mdROI.chatStarted = function (payload) {
    window.mdROI.track("chat_start", payload && typeof payload === "object" ? payload : { lead_type: "chat" });
  };

  // -----------------------------
  // Popup callbacks (call from Elementor or other popup close/CTA handlers)
  // -----------------------------
  window.mdROI.popupDismissed = function (payload) {
    window.mdROI.track("popup_dismiss", payload && typeof payload === "object" ? payload : {});
  };
  window.mdROI.popupCtaClicked = function (payload) {
    window.mdROI.track("popup_cta_click", payload && typeof payload === "object" ? payload : {});
  };

  // -----------------------------
  // External link click adapter (outbound links, e.g. Typeform quiz)
  // -----------------------------
  function getLinkHost(href) {
    if (!href || href.indexOf("http") !== 0) return null;
    try {
      var a = document.createElement("a");
      a.href = href;
      return a.hostname || null;
    } catch (err) {
      return null;
    }
  }

  function isExternalLink(href) {
    if (!href || typeof href !== "string") return false;
    var h = href.trim();
    if (h.indexOf("tel:") === 0 || h.indexOf("mailto:") === 0 || h === "#" || h.indexOf("javascript:") === 0) return false;
    if (h.indexOf("http") !== 0) return false;
    var linkHost = getLinkHost(href);
    if (!linkHost) return false;
    return linkHost !== window.location.hostname;
  }

  function initExternalLinkAdapter() {
    if (!CFG.enable_external_links) return;
    document.addEventListener("click", function (e) {
      var el = e.target;
      if (!el) return;
      while (el && el !== document && el.tagName !== "A") el = el.parentNode;
      if (!el || el.tagName !== "A") return;
      var href = el.getAttribute("href") || "";
      if (!isExternalLink(href)) return;
      var linkHost = getLinkHost(href);
      window.mdROI.track("external_link_click", {
        link_url: el.href || href,
        link_domain: linkHost || "",
        click_text: (el.textContent || "").trim().slice(0, 120)
      });
    }, true);
  }

  // -----------------------------
  // Elementor popup adapter (Elementor Pro native events: elementor/popup/hide)
  // No Elementor or design changes required.
  // -----------------------------
  function initElementorPopupAdapter() {
    var lastDismiss = { id: null, t: 0 };
    function onHide(popupId) {
      var id = popupId != null ? String(popupId) : "";
      if (!id) return;
      var now = Date.now();
      if (lastDismiss.id === id && now - lastDismiss.t < 500) return;
      lastDismiss.id = id;
      lastDismiss.t = now;
      window.mdROI.track("popup_dismiss", { popup_id: id });
    }
    if (window.jQuery) {
      window.jQuery(document).on("elementor/popup/hide", function (e, id, instance) {
        onHide(id);
      });
      window.jQuery(document).on("elementor/popup/show", function (e, id, instance) {
        var popupId = id != null ? String(id) : "";
        if (popupId) window.mdROI.track("popup_show", { popup_id: popupId });
      });
    }
    window.addEventListener("elementor/popup/hide", function (e) {
      var id = e.detail && e.detail.id;
      onHide(id);
    });
    window.addEventListener("elementor/popup/show", function (e) {
      var id = e.detail && e.detail.id;
      if (id != null) window.mdROI.track("popup_show", { popup_id: String(id) });
    });
  }

  // -----------------------------
  // Elementor form success (AJAX form submit; complements DOM submit listener)
  // -----------------------------
  function initElementorFormAdapter() {
    function onFormSuccess(formId) {
      window.mdROI.track("generate_lead", {
        lead_type: "form",
        conversion_method: "inline",
        form_id: formId || undefined,
        currency: "USD",
        value: 0
      });
    }
    if (window.jQuery) {
      window.jQuery(document).on("submit_success", function (e, response) {
        var formId = (response && response.data && response.data.form_id) || (e.target && (e.target.id || e.target.getAttribute("name"))) || "";
        onFormSuccess(formId);
      });
    }
    document.addEventListener("elementor/form/success", function (e) {
      var formId = (e.detail && (e.detail.form_id || e.detail.form_name)) || "";
      onFormSuccess(formId);
    });
  }

  // -----------------------------
  // BirdEye adapter (lightweight)
  // -----------------------------
  function initBirdeyeAdapter() {
    if (!CFG.enable_birdeye) return;

    // Review click: capture obvious outbound links containing "birdeye"
    document.addEventListener("click", function (e) {
      var el = e.target;
      if (!el) return;

      // Traverse up to anchor if clicked inside.
      while (el && el !== document && el.tagName !== "A") el = el.parentNode;
      if (!el || el.tagName !== "A") return;

      var href = (el.getAttribute("href") || "").toLowerCase();
      if (!href) return;

      if (href.indexOf("birdeye") !== -1) {
        window.mdROI.track("review_click", {
          platform: "birdeye",
          click_url: el.href || href,
          click_text: (el.textContent || "").trim().slice(0, 120)
        });
      }
    }, true);
  }

  // -----------------------------
  // Bootstrap
  // -----------------------------
  captureAttribution();
  ensureSession();

  // Wait for DOM for adapters
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      fireThankYouLead();
      initFormsAdapter();
      initPhoneAdapter();
      initDirectionAdapter();
      initExternalLinkAdapter();
      initElementorPopupAdapter();
      initElementorFormAdapter();
      initBirdeyeAdapter();
    });
  } else {
    fireThankYouLead();
    initFormsAdapter();
    initPhoneAdapter();
    initDirectionAdapter();
    initExternalLinkAdapter();
    initElementorPopupAdapter();
    initElementorFormAdapter();
    initBirdeyeAdapter();
  }
})();