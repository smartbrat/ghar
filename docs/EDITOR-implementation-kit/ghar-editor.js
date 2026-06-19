/**
 * Ghar.tv unified TinyMCE 7 initialisation.
 *
 *   <script src="/secreal/jseditor/tinymce/tinymce.min.js"></script>
 *   <script src="/secreal/jseditor/ghar-editor.js"></script>
 *   <script>
 *     window.__GHAR_USER_ROLE__   = '<?= $user_role ?>';
 *     window.__GHAR_STORY_SLUG__  = '<?= $story_slug ?>';
 *     window.__GHAR_API_BASE__    = '/secreal/api';
 *     gharEditorInit();
 *   </script>
 *
 * Every WYSIWYG textarea in giarticle.php must carry class="gh-editor".
 * The keytakeaways / content1–6 / contentfaq / remarks textareas keep
 * their existing `name` and `id` attributes — the PHP save handler
 * doesn't change.
 */

(function (root) {
    'use strict';

    const PLUGIN_FILES = [
        // Tier A (built first)
        'ghar_divider', 'ghar_anchor', 'ghar_speclist',
        'ghar_image', 'ghar_video', 'ghar_audio', 'ghar_gallery', 'ghar_map',
        'ghar_stat', 'ghar_stat_strip', 'ghar_note', 'ghar_pullquote',
        'ghar_blockquote', 'ghar_footnote',

        // Tier B (callouts + slots)
        'ghar_callout',          // four variants registered inside
        'ghar_slot',
        'ghar_component',
        'ghar_rawhtml',
    ];

    const ALLOWED_VALID_ELEMENTS = [
        '@[id|class|title|dir<ltr?rtl|lang|tabindex|data-*|aria-*]',
        'a[href|target=_blank|rel|title|class]',
        'strong/b', 'em/i', 'sub', 'sup', 'mark', 'br', 'hr',
        '#p', 'h2', 'h3',
        'ol[class]', 'ul[class]', 'li',
        'dl[class]', 'dt', 'dd',
        'blockquote[cite|class]', 'cite', 'q[cite]',
        'img[src|alt|width|height|class|loading=lazy|decoding=async]',
        'figure[class]', 'figcaption[class]',
        'table[class]', 'thead', 'tbody', 'tfoot', 'tr',
        'th[scope|colspan|rowspan]', 'td[colspan|rowspan|data-th]',
        'caption',
        'details[class|open]', 'summary[class]',
        'time[datetime]', 'abbr[title]',
        'div[class|data-*]', 'span[class|data-*]', 'aside[class|data-*]', 'section[class|data-*]',
        'header[class]',
    ].join(',');

    const EXTENDED_VALID = [
        'iframe[src|width|height|loading=lazy|allow|allowfullscreen|referrerpolicy|class|sandbox]',
        'figure[class]', 'figcaption[class]',
    ].join(',');

    const INVALID_ELEMENTS = 'script,style,link,base,meta,form,input,button,select,textarea,object,embed';

    function gharEditorInit(opts) {
        opts = opts || {};
        const role = root.__GHAR_USER_ROLE__ || 'editor';

        return tinymce.init({
            selector: opts.selector || 'textarea.gh-editor',
            license_key: 'gpl',
            promotion: false,
            branding: false,
            menubar: false,
            statusbar: true,
            elementpath: false,
            height: opts.height || 360,
            resize: true,

            plugins: [
                'lists', 'link', 'table', 'image',
                'paste', 'code', 'wordcount', 'searchreplace',
                'anchor', 'autolink', 'charmap', 'help',
            ].concat(PLUGIN_FILES),

            external_plugins: PLUGIN_FILES.reduce((acc, name) => {
                acc[name] = '/secreal/jseditor/ghar-plugins/' + name + '.js';
                return acc;
            }, {}),

            toolbar: [
                // Row 1 — inline + headings
                'undo redo | blocks | bold italic link superscript mark | bullist numlist | speclist | divider',
                // Row 2 — media + features
                'image_caption gallery video audio map | pullquote blockquote stat statstrip note footnote',
                // Row 3 — callouts + slots
                'callout_brand callout_person callout_project callout_read_next | slot component | code' +
                    (['admin', 'senior_editor'].includes(role) ? ' rawhtml' : ''),
            ].join(' | '),

            // Lock the Format dropdown to paragraph + H2 + H3 (never H1 — that's the article title)
            block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3',

            // Styles dropdown — named presets only
            style_formats: [
                { title: 'Lead paragraph',       block: 'p', classes: 'art-lead' },
                { title: 'Lead — with drop cap', block: 'p', classes: 'art-lead has-dropcap' },
                { title: 'Divider (three dots)', block: 'p', classes: 'art-divider' },
            ],
            style_formats_merge: false,
            style_formats_autohide: true,

            valid_elements: ALLOWED_VALID_ELEMENTS,
            extended_valid_elements: EXTENDED_VALID,
            invalid_elements: INVALID_ELEMENTS,

            // Paste cleanup
            paste_as_text: false,
            paste_remove_styles_if_webkit: true,
            paste_word_valid_elements: 'b,strong,i,em,h2,h3,p,br,ol,ul,li,a',

            // Preview mimics the article body
            content_css: '/styles.css,/secreal/jseditor/ghar-editor-preview.css',
            body_class: 'art-body',

            // Image upload — keep the existing jbimages endpoint
            images_upload_url: '/secreal/jseditor/upload.php',
            automatic_uploads: true,
            file_picker_types: 'image',

            // Auto-save: PHP form submit reads from <textarea> after triggerSave
            setup: function (editor) {
                editor.on('SubmitContent', function () { tinymce.triggerSave(); });
                editor.on('init', function () {
                    if (typeof opts.onEditorInit === 'function') opts.onEditorInit(editor);
                });
            },
        });
    }

    /**
     * Shared helper used by every custom plugin's dialog — wraps fetch with
     * a tiny timeout and a friendly error message.
     */
    function gharFetch(path, query) {
        const url = (root.__GHAR_API_BASE__ || '/secreal/api') + path +
            (query ? ('?' + new URLSearchParams(query).toString()) : '');
        return fetch(url, { credentials: 'same-origin' })
            .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)));
    }

    /**
     * Shared helper — escape a string for safe HTML attribute use.
     */
    function gharEscape(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[c]);
    }

    root.gharEditorInit = gharEditorInit;
    root.gharFetch = gharFetch;
    root.gharEscape = gharEscape;
})(window);
