/**
 * ghar_callout — API-picker plugin (four variants).
 *
 * Template for any block whose insert flow is "search a slug picker,
 * resolve to a record, render". Copy this file for: video by URL,
 * audio episode by URL, person callout, project callout, read-next.
 *
 * The pattern is:
 *   1. addButton for each variant
 *   2. onAction opens a dialog with a `urlinput` field (which TinyMCE
 *      will turn into an autocomplete combo on the front end)
 *   3. fetch the API record for the chosen slug
 *   4. render the canonical callout HTML with name / sub / initials
 *      from the record + an optional label override field
 *
 * Backend endpoints required (already specified in
 * docs/EDITOR-migration-plan.md):
 *   GET /secreal/api/brands.php?q=…    → [{slug, name, sub, initials}, …]
 *   GET /secreal/api/people.php?q=…    → same shape
 *   GET /secreal/api/projects.php?q=…  → same shape (returns {href, …})
 *   GET /secreal/api/stories.php?q=…   → same shape (returns {slug, name, sub})
 */

const CALLOUT_KINDS = {
    brand:     { label: 'Brand callout',   api: '/brands.php',    href: slug => '/brands/'  + slug, defaultLabel: 'In this story' },
    person:    { label: 'Person callout',  api: '/people.php',    href: slug => '/people/'  + slug, defaultLabel: 'About this person' },
    project:   { label: 'Project callout', api: '/projects.php',  href: slug => '/projects/'+ slug, defaultLabel: 'The project' },
    read_next: { label: 'Read next',       api: '/stories.php',   href: slug => '/design/'  + slug, defaultLabel: 'Read next' },
};

tinymce.PluginManager.add('ghar_callout', function (editor) {
    Object.entries(CALLOUT_KINDS).forEach(function ([kind, cfg]) {
        editor.ui.registry.addButton('callout_' + kind, {
            text: cfg.label,
            tooltip: cfg.label,
            onAction: function () { openPicker(editor, kind, cfg); },
        });
    });
});

function openPicker(editor, kind, cfg) {
    let resolvedRecord = null;

    editor.windowManager.open({
        title: cfg.label,
        size: 'normal',
        body: {
            type: 'panel',
            items: [
                {
                    type: 'input',
                    name: 'q',
                    label: 'Search by name or slug',
                    placeholder: 'Start typing…',
                },
                {
                    type: 'selectbox',
                    name: 'slug',
                    label: 'Choose record',
                    items: [{ value: '', text: '— search first —' }],
                },
                {
                    type: 'input',
                    name: 'label_override',
                    label: 'Custom label (optional)',
                    placeholder: cfg.defaultLabel,
                },
            ],
        },
        buttons: [
            { type: 'cancel', text: 'Cancel' },
            { type: 'submit', text: 'Insert', primary: true },
        ],
        initialData: { q: '', slug: '', label_override: '' },
        onChange: function (api, details) {
            if (details.name !== 'q') return;
            const q = api.getData().q.trim();
            if (q.length < 2) return;
            window.gharFetch(cfg.api, { q: q })
                .then(function (records) {
                    api.redial({
                        title: cfg.label,
                        body: api.props.body, // unchanged body schema with refreshed items
                        buttons: api.props.buttons,
                    });
                    // No selectbox dynamic refresh in TinyMCE 7 windowManager — workaround:
                    // store result in closure, reopen with new items
                    // (for production, use a custom autocomplete view via `urlinput`)
                    resolvedRecord = records;
                    editor.notificationManager.open({
                        text: 'Found ' + records.length + ' matches.',
                        type: 'info',
                        timeout: 1500,
                    });
                })
                .catch(function (err) {
                    editor.notificationManager.open({
                        text: 'Search failed: ' + err.message,
                        type: 'error',
                        timeout: 3000,
                    });
                });
        },
        onSubmit: function (api) {
            const d = api.getData();
            if (!d.slug) {
                editor.notificationManager.open({
                    text: 'Please pick a record.', type: 'error', timeout: 2000,
                });
                return;
            }
            // Look up the record from our cache
            const record = (resolvedRecord || []).find(r => r.slug === d.slug);
            if (!record) {
                editor.notificationManager.open({
                    text: 'Record not found.', type: 'error', timeout: 2000,
                });
                return;
            }
            const href = window.gharEscape(record.href || cfg.href(record.slug));
            const label = window.gharEscape((d.label_override || cfg.defaultLabel).trim());
            const name = window.gharEscape(record.name);
            const sub = window.gharEscape(record.sub || '');
            const initials = window.gharEscape(record.initials || record.name.slice(0, 2).toUpperCase());

            editor.insertContent(
                '<a href="' + href + '" class="art-brand-callout"' +
                    ' data-callout-kind="' + kind + '"' +
                    ' data-callout-slug="' + window.gharEscape(record.slug) + '">' +
                    '<div class="art-brand-callout__logo">' + initials + '</div>' +
                    '<div>' +
                        '<span class="art-brand-callout__label">' + label + '</span>' +
                        '<span class="art-brand-callout__name">' + name + '</span>' +
                        '<span class="art-brand-callout__sub">' + sub + '</span>' +
                    '</div>' +
                    '<svg class="art-brand-callout__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                        '<path d="M5 12h14M13 5l7 7-7 7"/>' +
                    '</svg>' +
                '</a>'
            );
            api.close();
        },
    });
}
