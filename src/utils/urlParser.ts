/**
 * URL parsing, domain extraction, and metadata retrieval utilities
 */

export function normalizeUrl(rawUrl: string): string {
  let trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

export function extractHostname(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = extractHostname(url);
    if (!domain) return '';
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  } catch {
    return '';
  }
}

/**
 * Derives a clean, readable default title from URL structure
 */
export function deriveTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    const domain = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname.replace(/\/$/, '');

    // Known site heuristics
    if (domain.includes('github.com')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[1]} (${parts[0]}) - GitHub`;
      }
      if (parts.length === 1) {
        return `${parts[0]} - GitHub`;
      }
      return 'GitHub';
    }

    if (domain.includes('news.ycombinator.com')) {
      return 'Hacker News';
    }

    if (domain.includes('developer.mozilla.org')) {
      const segments = pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1];
      if (last) {
        return `${decodeURIComponent(last.replace(/_/g, ' '))} - MDN Web Docs`;
      }
      return 'MDN Web Docs';
    }

    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return 'YouTube Video';
    }

    if (domain.includes('stackoverflow.com')) {
      const segments = pathname.split('/').filter(Boolean);
      const questionIndex = segments.indexOf('questions');
      if (questionIndex !== -1 && segments[questionIndex + 2]) {
        return `${segments[questionIndex + 2].replace(/-/g, ' ')} - Stack Overflow`;
      }
      return 'Stack Overflow';
    }

    // Generic path heuristic
    if (pathname && pathname !== '/') {
      const parts = pathname.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        // Strip file extensions
        const cleanName = lastPart.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[-_]/g, ' ');
        const capitalized = cleanName
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        const brand = domain.split('.')[0];
        const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
        return `${capitalized} - ${formattedBrand}`;
      }
    }

    // Domain name formatting
    const parts = domain.split('.');
    const brand = parts.length > 1 ? parts[0] : domain;
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  } catch {
    return url;
  }
}

export interface ScrapedMetadata {
  title: string;
  description: string;
  source: 'scraped' | 'heuristic';
}

/**
 * Attempts client-side title and description retrieval with safe fallback
 */
export async function fetchWebsiteMetadata(rawUrl: string): Promise<ScrapedMetadata> {
  const normalized = normalizeUrl(rawUrl);
  const fallbackTitle = deriveTitleFromUrl(normalized);

  if (!normalized) {
    return { title: '', description: '', source: 'heuristic' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Using AllOrigins CORS proxy to fetch raw HTML
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalized)}`;
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { title: fallbackTitle, description: '', source: 'heuristic' };
    }

    const html = await response.text();

    // Parse Title
    let title = '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = decodeHtmlEntities(titleMatch[1].trim());
    }

    // Try OpenGraph title if standard title is missing or generic
    if (!title) {
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        title = decodeHtmlEntities(ogTitleMatch[1].trim());
      }
    }

    // Parse Description
    let description = '';
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1]) {
      description = decodeHtmlEntities(descMatch[1].trim());
    } else {
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      if (ogDescMatch && ogDescMatch[1]) {
        description = decodeHtmlEntities(ogDescMatch[1].trim());
      }
    }

    if (title) {
      return {
        title,
        description,
        source: 'scraped',
      };
    }
  } catch {
    // Graceful fallback to heuristic
  }

  return {
    title: fallbackTitle,
    description: '',
    source: 'heuristic',
  };
}

function decodeHtmlEntities(str: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&#x2F;': '/',
    '&nbsp;': ' ',
    '&#8211;': '-',
    '&#8212;': '-',
  };
  return str.replace(/&(?:amp|lt|gt|quot|#39|apos|#x2F|nbsp|#8211|#8212);/g, (match) => entities[match] || match);
}
