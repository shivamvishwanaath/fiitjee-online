import urllib.request
import json
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

urls = [
    "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2023",
    "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2022",
    "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2021"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

for url in urls:
    print(f"\n--- {url} ---")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        
        match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
        if match:
            data = json.loads(match.group(1))
            components = data.get("props", {}).get("pageProps", {}).get("pageData", {}).get("components", {})
            vt = components.get("verticalTab_1", {})
            print("verticalTabList:", vt.get("verticalTabList"))
            vcd = vt.get("verticalCardDetails", [])
            print("verticalCardDetails count:", len(vcd))
            # print student names and titles/categories
            categories = set(c.get("title") or c.get("cardCategoryKey") for c in vcd)
            print("Categories in details:", categories)
            names = [c.get("studentName") for c in vcd[:5]]
            print("Sample student names:", names)
        else:
            print("No NEXT_DATA")
    except Exception as e:
        print("Error:", e)
