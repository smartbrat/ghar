/**
 * ghar_slot — enum-dropdown plugin (placement slots).
 *
 * Template for any block whose insert flow is "pick from a fixed enum +
 * a couple of options, render an empty container the server will fill at
 * render time". Copy this file for: component embed.
 *
 * The pattern is:
 *   1. addButton "Placement"
 *   2. onAction opens a dialog with the slot_type / slot_id / size /
 *      audience / fallback fields
 *   3. onSubmit inserts an empty `<div class="art-slot" data-…></div>`
 *
 * The empty div is rendered as a labeled dashed stub in the editor (CSS
 * in design-article.html targets `.art-slot:empty`). At render time the
 * server fills it from placement_registry + the per-slot-type renderer.
 *
 * NOTE on slot_id: the convention is `bodyad-{articleId}-{N}` for ad
 * slots (mirrors how news sites like Firstpost ID their ad placements
 * for analytics). For non-ad slots use a memorable label like
 * `post-lead`, `mid-article`, `before-conclusion`.
 */

const SLOT_TYPES = [
    { value: 'ad_display',            text: 'Display ad' },
    { value: 'ad_native',             text: 'Native ad' },
    { value: 'brand_profile',         text: 'Brand profile (sponsor card)' },
    { value: 'person_profile',        text: 'Person profile' },
    { value: 'newsletter_signup',     text: 'Newsletter signup' },
    { value: 'ghartalks_promo',       text: 'GharTalks episode promo' },
    { value: 'ghar_finance_widget',   text: 'Ghar Finance widget' },
    { value: 'ghar_design_widget',    text: 'Ghar Design widget' },
    { value: 'ghar_move_widget',      text: 'Ghar Move widget' },
    { value: 'recirculation_by_tag',  text: 'Recirculation by tag' },
    { value: 'recirculation_by_series', text: 'Recirculation by series' },
    { value: 'trending_now',          text: 'Trending now' },
    { value: 'intelligence_module',   text: 'Intelligence module' },
    { value: 'events_module',         text: 'Events module' },
    { value: 'custom',                text: 'Custom (programmer-defined)' },
];

const SIZES = [
    { value: 'standard', text: 'Standard' },
    { value: 'compact',  text: 'Compact' },
    { value: 'wide',     text: 'Wide' },
    { value: 'boxed',    text: 'Boxed (with hairline border)' },
];

const AUDIENCES = [
    { value: 'all',         text: 'All viewers' },
    { value: 'logged_out',  text: 'Logged-out only (skip for subscribers)' },
    { value: 'logged_in',   text: 'Logged-in only' },
    { value: 'subscriber',  text: 'Subscribers only' },
    { value: 'broker',      text: 'Brokers only (SuperPro)' },
    { value: 'developer',   text: 'Developers only' },
];

const FALLBACKS = [
    { value: 'collapse',           text: 'Collapse (remove entirely)' },
    { value: 'show_default',       text: 'Show in-house promo' },
    { value: 'show_recirculation', text: 'Show related-story card' },
];

tinymce.PluginManager.add('ghar_slot', function (editor) {
    editor.ui.registry.addButton('slot', {
        text: 'Placement',
        tooltip: 'Insert placement slot (server fills at render time)',
        onAction: function () {
            editor.windowManager.open({
                title: 'Insert placement slot',
                size: 'normal',
                body: {
                    type: 'panel',
                    items: [
                        { type: 'selectbox', name: 'slot_type', label: 'Slot type', items: SLOT_TYPES },
                        {
                            type: 'input',
                            name: 'slot_id',
                            label: 'Slot id',
                            placeholder: 'e.g. bodyad-{articleId}-1, post-lead, mid-article',
                        },
                        { type: 'selectbox', name: 'size', label: 'Size', items: SIZES },
                        { type: 'selectbox', name: 'audience', label: 'Audience filter', items: AUDIENCES },
                        { type: 'selectbox', name: 'fallback', label: 'If unavailable', items: FALLBACKS },
                        {
                            type: 'input',
                            name: 'disclosure_label',
                            label: 'Disclosure label (above the placement)',
                            placeholder: 'e.g. "Advertisement" for ad slots, blank for non-ad',
                        },
                    ],
                },
                buttons: [
                    { type: 'cancel', text: 'Cancel' },
                    { type: 'submit', text: 'Insert', primary: true },
                ],
                initialData: {
                    slot_type: 'ad_display',
                    slot_id: '',
                    size: 'standard',
                    audience: 'all',
                    fallback: 'collapse',
                    disclosure_label: '',
                },
                onChange: function (api, details) {
                    // Default disclosure_label to "Advertisement" when an ad slot type is picked
                    if (details.name === 'slot_type') {
                        const t = api.getData().slot_type;
                        if (t === 'ad_display' || t === 'ad_native') {
                            api.setData({ disclosure_label: 'Advertisement' });
                        }
                    }
                },
                onSubmit: function (api) {
                    const d = api.getData();
                    if (!d.slot_id.trim()) {
                        editor.notificationManager.open({
                            text: 'Slot id is required so analytics can identify this placement.',
                            type: 'error',
                            timeout: 3000,
                        });
                        return;
                    }
                    const e = window.gharEscape;
                    let attrs =
                        ' data-slot-type="'     + e(d.slot_type)     + '"' +
                        ' data-slot-id="'       + e(d.slot_id.trim()) + '"' +
                        ' data-slot-size="'     + e(d.size)          + '"' +
                        ' data-slot-audience="' + e(d.audience)      + '"' +
                        ' data-slot-fallback="' + e(d.fallback)      + '"';
                    if (d.disclosure_label.trim()) {
                        attrs += ' data-slot-disclosure-label="' + e(d.disclosure_label.trim()) + '"';
                    }
                    editor.insertContent('<div class="art-slot"' + attrs + '></div>');
                    api.close();
                },
            });
        },
    });
});
