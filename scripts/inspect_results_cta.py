import urllib.request
import json
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://www.fiitjee.com/fiitjee-results"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8')
    
    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
    if match:
        data = json.loads(match.group(1))
        components = data.get("props", {}).get("pageProps", {}).get("pageData", {}).get("components", {})
        cta_listing = components.get("ctaListing_1", {})
        print("ctaElements count:", len(cta_listing.get("ctaElements", [])))
        for elem in cta_listing.get("ctaElements", []):
            print(f"\nGroup: {elem.get('text')}")
            for c in elem.get("cta", []):
                print(f"  - {c.get('text')}: {c.get('link')}")
except Exception as e:
    print("Error:", e)
