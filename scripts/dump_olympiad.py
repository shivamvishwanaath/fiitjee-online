import urllib.request
import json
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2024"
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
        print("Keys in components:", list(components.keys()))
        for k, v in components.items():
            if 'card' in k.lower() or 'tab' in k.lower() or 'custom' in k.lower() or 'list' in k.lower():
                print(f"Component: {k}")
                # print a snippet
                print(str(v)[:400])
    else:
        print("No NEXT_DATA")
except Exception as e:
    print("Error:", e)
