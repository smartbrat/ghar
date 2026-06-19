/**
 * ghar_stat — dialog-driven block plugin.
 *
 * Template for any block whose insert flow is "open a small dialog, take
 * a few fields, render an HTML fragment". Copy this file as the starting
 * point for: stat_strip, note, pullquote, blockquote, speclist, divider,
 * stat, footnote, anchor.
 *
 * The pattern is always:
 *   1. addButton with an icon + tooltip
 *   2. onAction opens windowManager.open with a panel of fields
 *   3. onSubmit reads the form values, calls editor.insertContent with
 *      the canonical HTML for that block (see EDITOR-blocks-spec.json),
 *      and closes the dialog.
 */
tinymce.PluginManager.add('ghar_stat', function (editor) {
    editor.ui.registry.addButton('stat', {
        icon: 'character-count',
        tooltip: 'Stat — single big number',
        onAction: function () {
            editor.windowManager.open({
                title: 'Insert stat block',
                size: 'normal',
                body: {
                    type: 'panel',
                    items: [
                        {
                            type: 'input',
                            name: 'num',
                            label: 'Number / phrase',
                            placeholder: 'e.g. "12 years", "₹4 cr", "4 in 5"',
                        },
                        {
                            type: 'textarea',
                            name: 'caption',
                            label: 'Caption',
                            placeholder: 'One sentence — what makes this number the point.',
                            maximized: false,
                        },
                    ],
                },
                buttons: [
                    { type: 'cancel', text: 'Cancel' },
                    { type: 'submit', text: 'Insert', primary: true },
                ],
                initialData: { num: '', caption: '' },
                onSubmit: function (api) {
                    const d = api.getData();
                    const num = window.gharEscape(d.num.trim());
                    const caption = window.gharEscape(d.caption.trim());
                    if (!num || !caption) {
                        editor.notificationManager.open({
                            text: 'Both fields are required.',
                            type: 'error',
                            timeout: 2500,
                        });
                        return;
                    }
                    editor.insertContent(
                        '<figure class="art-stat">' +
                            '<div class="art-stat__num">' + num + '</div>' +
                            '<figcaption class="art-stat__caption">' + caption + '</figcaption>' +
                        '</figure>'
                    );
                    api.close();
                },
            });
        },
    });
});
