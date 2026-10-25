import { Bookmark, Collection } from '../types';
import { getFaviconUrl, normalizeUrl } from './urlParser';

export interface TabVaultBackupData {
  version: '1.0';
  exportedAt: string;
  collections: Collection[];
  bookmarks: Bookmark[];
}

/**
 * Exports data as a downloadable JSON file
 */
export function exportToJson(bookmarks: Bookmark[], collections: Collection[]): void {
  const data: TabVaultBackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    collections,
    bookmarks,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `tabvault_backup_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses JSON backup data
 */
export function parseAndValidateJson(jsonString: string): {
  valid: boolean;
  error?: string;
  data?: {
    bookmarks: Bookmark[];
    collections: Collection[];
  };
} {
  try {
    const parsed = JSON.parse(jsonString);

    // Support both direct TabVault format or simple bookmarks array
    if (parsed && typeof parsed === 'object') {
      let importedBookmarks: Bookmark[] = [];
      let importedCollections: Collection[] = [];

      if (Array.isArray(parsed.bookmarks)) {
        importedBookmarks = parsed.bookmarks.map((b: Partial<Bookmark>, idx: number) => ({
          id: b.id || `imported-bm-${Date.now()}-${idx}`,
          url: normalizeUrl(b.url || 'https://example.com'),
          title: b.title || 'Untitled Bookmark',
          description: b.description || '',
          notes: b.notes || '',
          collectionId: b.collectionId || 'uncategorized',
          tags: Array.isArray(b.tags) ? b.tags : [],
          isFavorite: Boolean(b.isFavorite),
          createdAt: b.createdAt || new Date().toISOString(),
          updatedAt: b.updatedAt || new Date().toISOString(),
          visitCount: typeof b.visitCount === 'number' ? b.visitCount : 0,
          favicon: b.favicon || getFaviconUrl(b.url || ''),
        }));
      }

      if (Array.isArray(parsed.collections)) {
        importedCollections = parsed.collections.map((c: Partial<Collection>, idx: number) => ({
          id: c.id || `imported-col-${Date.now()}-${idx}`,
          name: c.name || `Collection ${idx + 1}`,
          description: c.description || '',
          color: c.color || '#8b5cf6',
          icon: c.icon || 'Folder',
          createdAt: c.createdAt || new Date().toISOString(),
        }));
      }

      // If root is directly an array of bookmarks
      if (Array.isArray(parsed)) {
        importedBookmarks = parsed.map((b: Partial<Bookmark>, idx: number) => ({
          id: b.id || `imported-bm-${Date.now()}-${idx}`,
          url: normalizeUrl(b.url || 'https://example.com'),
          title: b.title || 'Untitled Bookmark',
          description: b.description || '',
          notes: b.notes || '',
          collectionId: b.collectionId || 'uncategorized',
          tags: Array.isArray(b.tags) ? b.tags : [],
          isFavorite: Boolean(b.isFavorite),
          createdAt: b.createdAt || new Date().toISOString(),
          updatedAt: b.updatedAt || new Date().toISOString(),
          visitCount: typeof b.visitCount === 'number' ? b.visitCount : 0,
          favicon: b.favicon || getFaviconUrl(b.url || ''),
        }));
      }

      if (importedBookmarks.length === 0 && importedCollections.length === 0) {
        return {
          valid: false,
          error: 'No valid bookmarks or collections were found in the uploaded file.',
        };
      }

      return {
        valid: true,
        data: {
          bookmarks: importedBookmarks,
          collections: importedCollections,
        },
      };
    }

    return {
      valid: false,
      error: 'Invalid file format. Please upload a valid JSON backup file.',
    };
  } catch {
    return {
      valid: false,
      error: 'Unable to parse JSON file. Please ensure it is well-formed.',
    };
  }
}

/**
 * Exports bookmarks to Netscape Bookmark HTML format for browser imports
 */
export function exportToHtml(bookmarks: Bookmark[], collections: Collection[]): void {
  const collectionMap = new Map<string, Collection>();
  collections.forEach((c) => collectionMap.set(c.id, c));

  // Group bookmarks by collection
  const grouped: Record<string, Bookmark[]> = {};
  grouped['uncategorized'] = [];

  collections.forEach((c) => {
    grouped[c.id] = [];
  });

  bookmarks.forEach((b) => {
    if (b.collectionId && grouped[b.collectionId]) {
      grouped[b.collectionId].push(b);
    } else {
      grouped['uncategorized'].push(b);
    }
  });

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  // Write collections as folders
  collections.forEach((col) => {
    const colBookmarks = grouped[col.id] || [];
    if (colBookmarks.length > 0) {
      html += `    <DT><H3 ADD_DATE="${Math.floor(new Date(col.createdAt).getTime() / 1000)}">${escapeHtml(col.name)}</H3>\n    <DL><p>\n`;
      colBookmarks.forEach((b) => {
        const addDate = Math.floor(new Date(b.createdAt).getTime() / 1000);
        const tagsAttr = b.tags && b.tags.length > 0 ? ` TAGS="${escapeHtml(b.tags.join(','))}"` : '';
        html += `        <DT><A HREF="${escapeHtml(b.url)}" ADD_DATE="${addDate}"${tagsAttr}>${escapeHtml(b.title)}</A>\n`;
        if (b.notes) {
          html += `        <DD>${escapeHtml(b.notes)}\n`;
        }
      });
      html += `    </DL><p>\n`;
    }
  });

  // Write uncategorized bookmarks
  const uncat = grouped['uncategorized'] || [];
  if (uncat.length > 0) {
    uncat.forEach((b) => {
      const addDate = Math.floor(new Date(b.createdAt).getTime() / 1000);
      const tagsAttr = b.tags && b.tags.length > 0 ? ` TAGS="${escapeHtml(b.tags.join(','))}"` : '';
      html += `    <DT><A HREF="${escapeHtml(b.url)}" ADD_DATE="${addDate}"${tagsAttr}>${escapeHtml(b.title)}</A>\n`;
      if (b.notes) {
        html += `    <DD>${escapeHtml(b.notes)}\n`;
      }
    });
  }

  html += `</DL><p>\n`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `tabvault_bookmarks_${dateStr}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
