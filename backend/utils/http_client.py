import requests
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class HTTPClient:
    """Standardized HTTP client for making API requests"""
    
    def __init__(self, base_url: str, default_timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.default_timeout = default_timeout
        self.session = requests.Session()

    def _build_url(self, endpoint: str) -> str:
        """Builds full URL from endpoint"""
        return f"{self.base_url}/{endpoint.lstrip('/')}"

    def get(self, endpoint: str, params: Optional[Dict] = None, timeout: Optional[int] = None) -> requests.Response:
        """Make GET request"""
        url = self._build_url(endpoint)
        timeout = timeout or self.default_timeout
        logger.debug(f"Making GET request to {url}")
        return self.session.get(url, params=params, timeout=timeout)

    def post(self, endpoint: str, json: Optional[Dict] = None, 
             files: Optional[Dict] = None, timeout: Optional[int] = None) -> requests.Response:
        """Make POST request"""
        url = self._build_url(endpoint)
        timeout = timeout or self.default_timeout
        logger.debug(f"Making POST request to {url}")
        return self.session.post(url, json=json, files=files, timeout=timeout)

    def patch(self, endpoint: str, json: Dict, timeout: Optional[int] = None) -> requests.Response:
        """Make PATCH request"""
        url = self._build_url(endpoint)
        timeout = timeout or self.default_timeout
        logger.debug(f"Making PATCH request to {url}")
        return self.session.patch(url, json=json, timeout=timeout)

    def delete(self, endpoint: str, timeout: Optional[int] = None) -> requests.Response:
        """Make DELETE request"""
        url = self._build_url(endpoint)
        timeout = timeout or self.default_timeout
        logger.debug(f"Making DELETE request to {url}")
        return self.session.delete(url, timeout=timeout) 