import urllib.request
import json
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

urls = [
    "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2024",
    "https://www.fiitjee.com/successtrail/results-olympiads/2024",
    "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/All",
    "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2022",
    "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2021"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

for url in urls:
    print(f"--- Fetching {url} ---")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        
        match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
        if match:
            data = json.loads(match.group(1))
            components = data.get("props", {}).get("pageProps", {}).get("pageData", {}).get("components", {})
            print("Components keys:", list(components.keys()))
            if "messageTemplate_1" in components:
                title = components["messageTemplate_1"].get("title")
                print("  messageTemplate_1 title:", title)
        else:
            print("  No NEXT_DATA")
    except Exception as e:
        print("  Error:", e)
