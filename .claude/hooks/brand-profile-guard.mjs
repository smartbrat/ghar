#!/usr/bin/env node
// PreToolUse hook: enforce the brand-profile / person-profile contract.
// Fires on Write/Edit for brand-profile-*.html or person-profile-*.html at
// the repo root. Skips _dev/ templates so the templates themselves can be
// edited without the gate. Injects an additionalContext reminder via the
// PreToolUse hook JSON output.
//
// Wired in .claude/settings.json under hooks.PreToolUse[matcher:"Write|Edit"].

let raw = '';
process.stdin.on('data', c => raw += c);
process.stdin.on('end', () => {
  let file = '';
  try {
    const input = JSON.parse(raw);
    file = (input.tool_input && input.tool_input.file_path) || '';
  } catch {
    process.exit(0);
  }
  if (!file) process.exit(0);

  const norm = file.replace(/\\/g, '/');

  // Match root-level brand or person profile files. Skip _dev/ templates.
  const isProfile = /\/(brand-profile|person-profile)-[^/]+\.html$/.test(norm);
  const isDevTemplate = /\/_dev\//.test(norm);

  if (isProfile && !isDevTemplate) {
    const additionalContext =
      '════ BRAND / PERSON PROFILE EDIT — CONTRACT GATE ════\n\n' +
      'Before proceeding, confirm ALL of these:\n\n' +
      '1. READ docs/AUTO-GENERATION-CONTRACT.md and docs/COMPOSITION-RULES.md THIS session (not from memory of a prior one).\n' +
      '2. NEW brand/person: STARTED from _dev/templates/brand-profile-{family}.html or _dev/templates/person-profile.html — NEVER cloned from a shipped tenant file (Godrej, Horizon, Suman, etc.). Cloning shipped files IS the primary bug source.\n' +
      '3. Family choice matches docs/COMPOSITION-RULES.md category: developer / architect / interior / materials / furniture / lighting / finance / proptech / vastu. Studio-shape brands (visualization studios, boutique practices) are usually "interior" or "architect".\n' +
      '4. Palette SAMPLED from the REAL logo file (curl the URL, save locally, Read the image to confirm the color) — NEVER guessed from text extraction or aesthetic instinct.\n' +
      "5. Content SCRAPED from the brand's own website — NEVER invented (team names, project titles, founding years, films, stats).\n" +
      '6. Dark-theme surface overrides live in SHARED CSS (dist/brand-profile.min.css) — NOT repeated inline in each tenant file.\n' +
      '7. For every image landed: source dropped in brand_assets/{subfolder}/ and convert-images.mjs run per AUTO-GENERATION-CONTRACT §4.9.\n\n' +
      'If ANY of the above is false: STOP the edit. Do the pre-flight, then re-invoke.\n\n' +
      'Small mechanical edits to already-shipped tenants (typo, one-line fix, single token swap) may proceed. Whole-file rewrites, palette changes, section additions, or new-tenant creation MUST pass the checklist above.\n\n' +
      "Every bypass of this contract has historically cost hours of correction cycles. Don't.";

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext
      }
    }));
  }
  process.exit(0);
});
