#!/usr/bin/env python3
"""YouTube transcript scraper for bass angler videos.

Usage:
    python3 scripts/yt-transcripts.py search "Kevin VanDam" --name kvd --limit 100
    python3 scripts/yt-transcripts.py download kvd
    python3 scripts/yt-transcripts.py search "Kevin VanDam" --name kvd --limit 50 --download
    python3 scripts/yt-transcripts.py channel UCCfp_WC2e_zU-WUXX7pt6HA --name kvd
    python3 scripts/yt-transcripts.py single "https://youtube.com/watch?v=ABC123" kvd

Rate-limit options (to avoid IP blocks):
    --delay 10          Base delay between requests (randomized up to 2x)
    --batch-size 20     Downloads before a longer cooldown pause
    --cooldown 180      Cooldown seconds between batches
    --block-wait 300    Seconds to wait after IP block before auto-retrying
    --cookies cookies.txt   Netscape cookie file for authenticated sessions

Fire-and-forget mode (auto-retries on IP blocks, Ctrl+C to stop):
    python3 scripts/yt-transcripts.py --delay 10 --batch-size 15 download kvd
"""

import argparse
import json
import os
import random
import re
import sys
import time
from pathlib import Path

from http.cookiejar import MozillaCookieJar

import requests as req_lib
import scrapetube
from youtube_transcript_api import YouTubeTranscriptApi

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "transcripts"
MAX_FILENAME = 100
MIN_VIDEO_SECONDS = 60  # skip shorts under 1 minute

config = {
    "delay": 8.0,  # seconds between transcript requests (conservative to avoid IP bans)
    "batch_size": 20,  # downloads before a longer cooldown pause
    "cooldown": 120.0,  # seconds to pause between batches
    "block_wait": 300.0,  # seconds to wait after an IP block before retrying
}


def parse_duration(length_str: str) -> int:
    """Parse a duration like '1:23' or '1:02:30' into total seconds."""
    if not length_str:
        return 0
    parts = length_str.split(":")
    try:
        if len(parts) == 2:
            return int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    except ValueError:
        return 0
    return 0


def sanitize_filename(title: str) -> str:
    """Sanitize a video title into a safe filename."""
    name = re.sub(r'[^\w\s-]', '', title)
    name = re.sub(r'[\s]+', '-', name).strip('-')
    name = name[:MAX_FILENAME]
    return name.lower()


def extract_video_id(url: str) -> str:
    """Extract video ID from various YouTube URL formats."""
    patterns = [
        r'(?:v=|/v/|youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'^([a-zA-Z0-9_-]{11})$',
    ]
    for pat in patterns:
        m = re.search(pat, url)
        if m:
            return m.group(1)
    raise ValueError(f"Could not extract video ID from: {url}")


def format_date(timestamp: int | None) -> str:
    """Convert unix timestamp to YYYY-MM-DD, or 'unknown'."""
    if not timestamp:
        return "unknown"
    return time.strftime("%Y-%m-%d", time.gmtime(timestamp))


def get_out_dir(name: str) -> Path:
    d = DATA_DIR / name
    d.mkdir(parents=True, exist_ok=True)
    return d


# -- Phase 1: Search ----------------------------------------------------------

def cmd_search(args):
    out_dir = get_out_dir(args.name)
    list_path = out_dir / "video-list.json"

    print(f"Searching YouTube for: {args.query} (limit {args.limit})")
    videos = []
    for v in scrapetube.get_search(args.query, limit=args.limit):
        vid_id = v.get("videoId", "")
        title = v.get("title", {})
        if isinstance(title, dict):
            title = title.get("runs", [{}])[0].get("text", vid_id)

        channel = ""
        channel_info = v.get("ownerText", {})
        if isinstance(channel_info, dict):
            runs = channel_info.get("runs", [])
            if runs:
                channel = runs[0].get("text", "")

        # publishedTimeText is relative ("2 years ago"), not a timestamp
        pub_text = ""
        pub_info = v.get("publishedTimeText", {})
        if isinstance(pub_info, dict):
            pub_text = pub_info.get("simpleText", "")

        length = ""
        length_info = v.get("lengthText", {})
        if isinstance(length_info, dict):
            length = length_info.get("simpleText", "")

        videos.append({
            "id": vid_id,
            "title": title,
            "channel": channel,
            "published": pub_text,
            "length": length,
            "url": f"https://www.youtube.com/watch?v={vid_id}",
        })

    list_path.write_text(json.dumps(videos, indent=2, ensure_ascii=False))
    print(f"Saved {len(videos)} videos to {list_path}")

    if args.download:
        download_transcripts(out_dir, videos)


# -- Channel listing -----------------------------------------------------------

def cmd_channel(args):
    out_dir = get_out_dir(args.name)
    list_path = out_dir / "video-list.json"

    print(f"Listing all videos for channel: {args.channel_id}")
    videos = []
    for v in scrapetube.get_channel(channel_id=args.channel_id, sort_by="newest"):
        vid_id = v.get("videoId", "")
        title = v.get("title", {})
        if isinstance(title, dict):
            title = title.get("runs", [{}])[0].get("text", vid_id)

        # publishedTimeText is relative ("2 years ago")
        pub_text = ""
        pub_info = v.get("publishedTimeText", {})
        if isinstance(pub_info, dict):
            pub_text = pub_info.get("simpleText", "")

        length = ""
        length_info = v.get("lengthText", {})
        if isinstance(length_info, dict):
            length = length_info.get("simpleText", "")

        videos.append({
            "id": vid_id,
            "title": title,
            "channel": args.name,
            "published": pub_text,
            "length": length,
            "url": f"https://www.youtube.com/watch?v={vid_id}",
        })
        if len(videos) % 50 == 0:
            print(f"  Found {len(videos)} videos so far...")

    list_path.write_text(json.dumps(videos, indent=2, ensure_ascii=False))
    print(f"Saved {len(videos)} videos to {list_path}")

    if args.download:
        download_transcripts(out_dir, videos)


# -- Phase 2: Download --------------------------------------------------------

def make_ytt_api(cookie_file: str | None = None) -> YouTubeTranscriptApi:
    """Create a YouTubeTranscriptApi, optionally with cookies for auth."""
    if cookie_file and os.path.exists(cookie_file):
        session = req_lib.Session()
        cj = MozillaCookieJar(cookie_file)
        cj.load()
        session.cookies = cj
        return YouTubeTranscriptApi(http_client=session)
    return YouTubeTranscriptApi()


ytt_api = None  # initialized lazily


def get_ytt_api(cookie_file: str | None = None) -> YouTubeTranscriptApi:
    global ytt_api
    if ytt_api is None:
        ytt_api = make_ytt_api(cookie_file)
    return ytt_api


def download_transcript(video_id: str) -> str | None:
    """Fetch transcript text for a video. Returns None if unavailable.
    Raises RuntimeError on IP block so caller can back off."""
    api = get_ytt_api()
    try:
        transcript = api.fetch(video_id, languages=["en"])
    except Exception as e:
        if "IpBlocked" in type(e).__name__ or "RequestBlocked" in type(e).__name__:
            raise RuntimeError("IP_BLOCKED") from e
        try:
            transcript = api.fetch(video_id, languages=["en-US", "en-GB"])
        except Exception as e2:
            if "IpBlocked" in type(e2).__name__ or "RequestBlocked" in type(e2).__name__:
                raise RuntimeError("IP_BLOCKED") from e2
            return None
    return " ".join(s.text for s in transcript.snippets)


def download_transcripts(out_dir: Path, videos: list[dict]):
    """Download transcripts, auto-retrying on IP blocks.

    Returns when all videos are processed or KeyboardInterrupt.
    """
    batch_size = int(config["batch_size"])
    cooldown = config["cooldown"]
    delay = config["delay"]
    block_wait = config["block_wait"]
    total = len(videos)
    session_downloaded = 0
    consecutive_blocks = 0
    max_consecutive_blocks = 10  # give up after this many back-to-back blocks

    while True:
        downloaded = 0
        skipped_exists = 0
        skipped_short = 0
        no_transcript = 0
        batch_count = 0
        blocked = False

        for i, v in enumerate(videos, 1):
            vid_id = v["id"]
            title = v.get("title", vid_id)
            length = v.get("length", "")

            # Skip shorts
            if parse_duration(length) < MIN_VIDEO_SECONDS:
                skipped_short += 1
                continue

            filename = sanitize_filename(title) + ".txt"
            filepath = out_dir / filename

            if filepath.exists():
                skipped_exists += 1
                continue

            # Batch cooldown: after every batch_size downloads, take a longer pause
            if batch_count > 0 and batch_count % batch_size == 0:
                jittered_cooldown = cooldown + random.uniform(0, cooldown * 0.5)
                print(f"\n  Batch of {batch_size} complete. Cooling down for {jittered_cooldown:.0f}s...\n")
                time.sleep(jittered_cooldown)

            print(f"  [{i}/{total}] Downloading: {title}")
            try:
                text = download_transcript(vid_id)
            except RuntimeError as e:
                if "IP_BLOCKED" in str(e):
                    print(f"\n  IP BLOCKED after {downloaded} downloads this round ({session_downloaded + downloaded} total this session).")
                    blocked = True
                    break
                raise

            if text is None:
                print(f"           No transcript available")
                no_transcript += 1
                continue

            header = (
                f"Title: {title}\n"
                f"Channel: {v.get('channel', 'unknown')}\n"
                f"URL: {v.get('url', '')}\n"
                f"Published: {v.get('published', 'unknown')}\n"
                f"---\n\n"
            )
            filepath.write_text(header + text, encoding="utf-8")
            downloaded += 1
            batch_count += 1
            consecutive_blocks = 0  # reset on success

            # Jittered delay between requests
            jittered_delay = delay + random.uniform(0, delay)
            time.sleep(jittered_delay)

        session_downloaded += downloaded
        remaining = total - skipped_exists - skipped_short - no_transcript - session_downloaded
        print(f"\n  Round summary: {downloaded} new, {skipped_exists} existed, {skipped_short} shorts, {no_transcript} no transcript")
        print(f"  Session total: {session_downloaded} downloaded | ~{remaining} remaining")

        if not blocked:
            print(f"\nAll done! {session_downloaded} transcripts downloaded this session.")
            break

        consecutive_blocks += 1
        if consecutive_blocks >= max_consecutive_blocks:
            print(f"\n  Hit {max_consecutive_blocks} consecutive blocks — giving up. Try again later.")
            break

        # Wait and retry with increasing backoff
        wait = block_wait + random.uniform(0, block_wait * 0.5)
        # Back off more on repeated blocks
        wait *= (1 + (consecutive_blocks - 1) * 0.5)
        print(f"  Waiting {wait:.0f}s before retrying (attempt {consecutive_blocks}/{max_consecutive_blocks})...")
        try:
            time.sleep(wait)
        except KeyboardInterrupt:
            print(f"\n  Interrupted. {session_downloaded} transcripts downloaded this session.")
            break

        print(f"\n  Retrying...\n")


def cmd_download(args):
    out_dir = get_out_dir(args.name)
    list_path = out_dir / "video-list.json"

    if not list_path.exists():
        print(f"Error: {list_path} not found. Run 'search' first.", file=sys.stderr)
        sys.exit(1)

    videos = json.loads(list_path.read_text())
    print(f"Downloading transcripts for {len(videos)} videos in {out_dir}")
    download_transcripts(out_dir, videos)


# -- Single video --------------------------------------------------------------

def cmd_single(args):
    vid_id = extract_video_id(args.url)
    out_dir = get_out_dir(args.name)

    print(f"Fetching transcript for {vid_id}")
    text = download_transcript(vid_id)
    if text is None:
        print("No transcript available for this video.", file=sys.stderr)
        sys.exit(1)

    # Try to get title from a quick search (best-effort)
    title = vid_id
    try:
        for v in scrapetube.get_search(vid_id, limit=1):
            t = v.get("title", {})
            if isinstance(t, dict):
                t = t.get("runs", [{}])[0].get("text", vid_id)
            if v.get("videoId") == vid_id:
                title = t
                break
    except Exception:
        pass

    filename = sanitize_filename(title) + ".txt"
    filepath = out_dir / filename

    header = (
        f"Title: {title}\n"
        f"URL: https://www.youtube.com/watch?v={vid_id}\n"
        f"---\n\n"
    )
    filepath.write_text(header + text, encoding="utf-8")
    print(f"Saved to {filepath}")


# -- CLI -----------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="YouTube transcript scraper for bass angler videos")
    parser.add_argument("--cookies", help="Path to Netscape cookie file (for authenticated sessions, reduces IP blocks)")
    parser.add_argument("--delay", type=float, default=config["delay"], help=f"Base delay between requests in seconds; actual delay is randomized up to 2x (default {config['delay']})")
    parser.add_argument("--batch-size", type=int, default=config["batch_size"], help=f"Downloads before a longer cooldown pause (default {config['batch_size']})")
    parser.add_argument("--cooldown", type=float, default=config["cooldown"], help=f"Cooldown pause in seconds between batches (default {config['cooldown']})")
    parser.add_argument("--block-wait", type=float, default=config["block_wait"], help=f"Seconds to wait after IP block before retrying (default {config['block_wait']})")
    sub = parser.add_subparsers(dest="command", required=True)

    # search
    p_search = sub.add_parser("search", help="Search YouTube and save video list")
    p_search.add_argument("query", help="Search query (e.g. 'Kevin VanDam')")
    p_search.add_argument("--name", required=True, help="Angler short name for output dir (e.g. kvd)")
    p_search.add_argument("--limit", type=int, default=100, help="Max videos to collect")
    p_search.add_argument("--download", action="store_true", help="Also download transcripts immediately")

    # channel
    p_channel = sub.add_parser("channel", help="List all videos from a YouTube channel")
    p_channel.add_argument("channel_id", help="YouTube channel ID (e.g. UCCfp_WC2e_zU-WUXX7pt6HA)")
    p_channel.add_argument("--name", required=True, help="Angler short name for output dir")
    p_channel.add_argument("--download", action="store_true", help="Also download transcripts immediately")

    # download
    p_download = sub.add_parser("download", help="Download transcripts from saved video list")
    p_download.add_argument("name", help="Angler short name (matches output dir)")

    # single
    p_single = sub.add_parser("single", help="Download transcript for a single video")
    p_single.add_argument("url", help="YouTube video URL or ID")
    p_single.add_argument("name", help="Angler short name for output dir")

    args = parser.parse_args()

    # Initialize API with cookies if provided
    global ytt_api
    if args.cookies:
        ytt_api = make_ytt_api(args.cookies)
        config["_cookies_path"] = args.cookies
    config["delay"] = args.delay
    config["batch_size"] = args.batch_size
    config["cooldown"] = args.cooldown
    config["block_wait"] = args.block_wait

    if args.command == "search":
        cmd_search(args)
    elif args.command == "channel":
        cmd_channel(args)
    elif args.command == "download":
        cmd_download(args)
    elif args.command == "single":
        cmd_single(args)


if __name__ == "__main__":
    main()
