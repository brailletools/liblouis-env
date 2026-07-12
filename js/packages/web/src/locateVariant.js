import fs from 'node:fs';
import path from 'node:path';

const EMBEDDED_PATTERNS = [/^build-tables-embed(d)?ed.*\.js$/];
const NO_TABLES_PATTERNS = [/^build-no-tables.*\.js$/];

/**
 * Inventory an extracted liblouis/js-build archive directory and pick the best
 * available build variant: prefer a tables-embedded build (self-contained, no
 * separate tables directory needed) and fall back to a no-tables build paired
 * with the tables/ directory shipped alongside it.
 *
 * The archive's exact file set isn't guaranteed across pinned commits, so this
 * matches by filename pattern rather than a single hardcoded name.
 */
export function locateBuildVariant(archiveDir) {
    const files = fs.readdirSync(archiveDir).filter((f) => f.endsWith('.js'));

    const embedded = files.find((f) => EMBEDDED_PATTERNS.some((re) => re.test(f)));
    if (embedded) {
        return {
            kind: 'embedded',
            buildFile: path.join(archiveDir, embedded),
            needsTables: false,
        };
    }

    const noTables =
        files.find((f) => NO_TABLES_PATTERNS.some((re) => re.test(f))) ??
        files.find((f) => /^build-.*\.js$/.test(f));
    if (!noTables) {
        throw new Error(`No liblouis build-*.js found in ${archiveDir} (found: ${files.join(', ') || 'nothing'})`);
    }

    const tablesDir = path.join(archiveDir, 'tables');
    if (!fs.existsSync(tablesDir)) {
        throw new Error(`Expected a tables/ directory next to ${noTables}, none found in ${archiveDir}.`);
    }

    return {
        kind: 'no-tables',
        buildFile: path.join(archiveDir, noTables),
        needsTables: true,
        tablesDir,
    };
}
