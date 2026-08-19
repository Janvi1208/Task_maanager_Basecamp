"""
Integration with a public external API (quotable.io), used to power a
small "Daily Focus Tip" widget on the dashboard.

This demonstrates: outbound HTTP calls, timeout handling, graceful
degradation on failure, and keeping the integration secondary to the
app's core functionality (rule #10 in the spec).
"""
import os
import httpx

EXTERNAL_QUOTE_API_URL = os.getenv("EXTERNAL_QUOTE_API_URL", "https://api.quotable.io/random")
TIMEOUT = float(os.getenv("EXTERNAL_API_TIMEOUT_SECONDS", "4"))

FALLBACK_QUOTES = [
    {"content": "Well begun is half done.", "author": "Aristotle"},
    {"content": "Small daily improvements lead to staggering long-term results.", "author": "Unknown"},
    {"content": "Focus on being productive instead of busy.", "author": "Tim Ferriss"},
]


class ExternalApiService:
    """Fetches a motivational quote for the dashboard, with graceful fallback."""

    async def get_daily_tip(self) -> dict:
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                response = await client.get(EXTERNAL_QUOTE_API_URL)
                response.raise_for_status()
                data = response.json()
                return {
                    "content": data.get("content", FALLBACK_QUOTES[0]["content"]),
                    "author": data.get("author", "Unknown"),
                    "source": "quotable.io",
                    "is_fallback": False,
                }
        except (httpx.TimeoutException, httpx.HTTPError, ValueError, KeyError):
            import random
            fallback = random.choice(FALLBACK_QUOTES)
            return {
                "content": fallback["content"],
                "author": fallback["author"],
                "source": "local_fallback",
                "is_fallback": True,
            }
