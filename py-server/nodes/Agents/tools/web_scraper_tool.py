import requests
from bs4 import BeautifulSoup
from typing import Optional, Dict, Any


class WebScraperError(Exception):
    """Custom exception raised when web scraping fails."""


class WebScraperTool:
    """
    A lightweight web scraper tool for agents.

    This tool fetches the content of a given URL and optionally parses it to extract
    readable text from the page. It uses `requests` for HTTP requests and
    `BeautifulSoup` for HTML parsing.

    Parameters
    ----------
    user_agent : Optional[str], optional
        Custom User-Agent string to use for HTTP requests. If not provided,
        a default value is used.
    timeout : Optional[float], optional
        Timeout for HTTP requests in seconds. Defaults to 10.0 seconds.

    Examples
    --------
    >>> scraper = WebScraperTool()
    >>> text = scraper.scrape("https://example.com")
    >>> print(text[:100])
    """

    DEFAULT_USER_AGENT = (
        "Mozilla/5.0 (compatible; WebScraperTool/1.0; +https://github.com/yourrepo)"
    )
    DEFAULT_TIMEOUT = 10.0

    def __init__(self, user_agent: Optional[str] = None, timeout: Optional[float] = None):
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": user_agent or self.DEFAULT_USER_AGENT}
        )
        self.timeout = timeout or self.DEFAULT_TIMEOUT

    def fetch(self, url: str) -> str:
        """
        Fetch the raw HTML content of the given URL.

        Parameters
        ----------
        url : str
            The URL to fetch.

        Returns
        -------
        str
            Raw HTML content.

        Raises
        ------
        WebScraperError
            If the request fails or returns a non-200 status code.
        """
        try:
            response = self.session.get(url, timeout=self.timeout, allow_redirects=True)
            response.raise_for_status()
            response.encoding = response.apparent_encoding
            return response.text
        except requests.RequestException as exc:
            raise WebScraperError(f"Failed to fetch {url!r}: {exc}") from exc

    def parse(self, html: str) -> str:
        """
        Parse the given HTML and extract readable text.

        Parameters
        ----------
        html : str
            Raw HTML content.

        Returns
        -------
        str
            Concatenated text extracted from <p> tags and visible text nodes.
        """
        soup = BeautifulSoup(html, "html.parser")

        # Remove script and style elements
        for elem in soup(["script", "style", "noscript"]):
            elem.decompose()

        # Extract text from paragraph tags
        paragraphs = [p.get_text(separator=" ", strip=True) for p in soup.find_all("p")]
        text = "\n\n".join(paragraphs)

        # Fallback: if no paragraphs, use entire visible text
        if not text.strip():
            text = soup.get_text(separator=" ", strip=True)

        return text

    def scrape(self, url: str, parse: bool = True) -> str:
        """
        Fetch and optionally parse the content of a URL.

        Parameters
        ----------
        url : str
            The URL to scrape.
        parse : bool, default True
            Whether to parse the HTML to extract readable text.

        Returns
        -------
        str
            Raw HTML if parse is False, otherwise extracted text.

        Raises
        ------
        WebScraperError
            If fetching or parsing fails.
        """
        html = self.fetch(url)
        return self.parse(html) if parse else html


__all__ = ["WebScraperTool", "WebScraperError"]