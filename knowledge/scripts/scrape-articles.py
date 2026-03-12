#!/usr/bin/env python3
"""Scrape web articles and extract clean text for knowledge extraction.

Usage:
    # Single URL
    python3 scripts/scrape-articles.py "https://example.com/article"

    # Batch from URL list file
    python3 scripts/scrape-articles.py --urls data/article-urls-kvd.txt

    # Output dir override
    python3 scripts/scrape-articles.py --urls urls.txt --output data/articles/kvd/
"""

import argparse
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import requests
import trafilatura

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

# ─── Resolve project paths ───
SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
DEFAULT_OUTPUT = KNOWLEDGE_DIR / "data" / "articles" / "kvd"

REQUEST_DELAY = 2   # seconds between requests
REQUEST_TIMEOUT = 20  # seconds per HTTP request

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def slugify(text: str) -> str:
    """Convert text to a URL-safe filename slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    text = text.strip('-')
    return text[:120] if text else 'untitled'


def slug_from_url(url: str) -> str:
    """Generate a filename slug from a URL path."""
    parsed = urlparse(url)
    path = parsed.path.rstrip('/')
    segments = [s for s in path.split('/') if s]
    if segments:
        slug = slugify(segments[-1])
        if slug and slug != 'untitled':
            return slug
    return slugify(f"{parsed.netloc}-{path}")


def fetch_html(url: str) -> str | None:
    """Fetch HTML with requests (has reliable timeout)."""
    try:
        # Some sites (e.g. kevinvandam.com) have broken SSL certs
        verify = not urlparse(url).hostname in ('kevinvandam.com', 'www.kevinvandam.com')
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT,
                          allow_redirects=True, verify=verify)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"    Fetch failed: {e}", flush=True)
        return None


def extract_with_trafilatura(html: str) -> tuple[str | None, str | None]:
    """Extract article text from HTML using trafilatura. Returns (text, title)."""
    text = trafilatura.extract(
        html,
        include_comments=False,
        include_tables=False,
        no_fallback=False,
        favor_recall=True,
    )

    metadata = trafilatura.extract_metadata(html)
    title = metadata.title if metadata and metadata.title else None

    return text, title


def extract_with_beautifulsoup(html: str) -> str | None:
    """Fallback extraction using BeautifulSoup."""
    if BeautifulSoup is None:
        return None

    soup = BeautifulSoup(html, 'html.parser')

    for tag in soup.find_all(['script', 'style', 'nav', 'header', 'footer',
                               'aside', 'iframe', 'noscript', 'form']):
        tag.decompose()

    article = (
        soup.find('article') or
        soup.find('div', class_=re.compile(r'article|post|entry|content', re.I)) or
        soup.find('main')
    )

    target = article if article else soup.body
    if not target:
        return None

    paragraphs = []
    for p in target.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'li']):
        text = p.get_text(strip=True)
        if len(text) > 20:
            paragraphs.append(text)

    return '\n\n'.join(paragraphs) if paragraphs else None


def scrape_article(url: str) -> tuple[str | None, str | None]:
    """Scrape a single article. Returns (clean_text, title)."""
    html = fetch_html(url)
    if not html:
        return None, None

    text, title = extract_with_trafilatura(html)

    if text and len(text) > 100:
        return text, title

    # Fallback to BeautifulSoup
    if BeautifulSoup is not None:
        print(f"    trafilatura short/empty, trying BeautifulSoup...", flush=True)
        bs_text = extract_with_beautifulsoup(html)
        if bs_text and len(bs_text) > 100:
            return bs_text, title

    return text, title


def load_urls(urls_file: Path) -> list[str]:
    """Load URLs from a file, skipping comments and blank lines."""
    urls = []
    for line in urls_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#'):
            urls.append(line)
    return urls


def main():
    parser = argparse.ArgumentParser(description="Scrape web articles to clean text files")
    parser.add_argument("url", nargs="?", help="Single URL to scrape")
    parser.add_argument("--urls", "-u", metavar="FILE", help="File containing URLs (one per line)")
    parser.add_argument("--output", "-o", help=f"Output directory (default: {DEFAULT_OUTPUT})")
    parser.add_argument("--force", "-f", action="store_true", help="Re-scrape even if output exists")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be scraped")
    args = parser.parse_args()

    urls = []
    if args.url:
        urls.append(args.url)
    if args.urls:
        urls_file = Path(args.urls)
        if not urls_file.exists():
            print(f"Error: {urls_file} not found", file=sys.stderr)
            sys.exit(1)
        urls.extend(load_urls(urls_file))

    if not urls:
        parser.print_help()
        sys.exit(1)

    output_dir = Path(args.output) if args.output else DEFAULT_OUTPUT
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Scraping {len(urls)} URL(s) → {output_dir}/", flush=True)

    if args.dry_run:
        for url in urls:
            slug = slug_from_url(url)
            print(f"  {slug}.txt ← {url}")
        return

    success = 0
    skipped = 0
    errors = 0

    for i, url in enumerate(urls):
        slug = slug_from_url(url)
        out_path = output_dir / f"{slug}.txt"

        if out_path.exists() and not args.force:
            print(f"  [{i+1}/{len(urls)}] Skipping {slug} (already exists)", flush=True)
            skipped += 1
            continue

        print(f"  [{i+1}/{len(urls)}] {url}", flush=True)

        try:
            text, title = scrape_article(url)

            if not text or len(text) < 100:
                print(f"    WARNING: No usable text extracted (got {len(text) if text else 0} chars)", flush=True)
                errors += 1
                continue

            output_lines = [
                f"SOURCE: {url}",
                f"TITLE: {title or slug}",
                "",
                text,
            ]
            out_path.write_text('\n'.join(output_lines))
            print(f"    → {out_path.name} ({len(text):,} chars)", flush=True)
            success += 1

        except KeyboardInterrupt:
            print("\nInterrupted by user")
            break
        except Exception as e:
            print(f"    ERROR: {e}", file=sys.stderr, flush=True)
            errors += 1

        if i < len(urls) - 1:
            time.sleep(REQUEST_DELAY)

    print(f"\nDone: {success} scraped, {skipped} skipped, {errors} errors", flush=True)


if __name__ == "__main__":
    main()
