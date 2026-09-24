import urllib.request
import json
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/All"
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
        vt = components.get("verticalTab_1", {})
        print("verticalTab_1 keys:", list(vt.keys()))
        print("verticalTabList:", vt.get("verticalTabList"))
        vcd = vt.get("verticalCardDetails", [])
        print("verticalCardDetails count:", len(vcd))
        if vcd:
            print("Sample card detail:", json.dumps(vcd[0], indent=2))
    else:
        print("No NEXT_DATA")
except Exception as e:
    print("Error:", e)
