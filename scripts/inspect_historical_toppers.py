import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

urls = [
    "http://jeeadv.iitjeetoppers.com/jeeadv2024/",
    "http://jeeadv.iitjeetoppers.com/jeeadv2023/",
    "http://jeeadv.iitjeetoppers.com/jeeadv2022/"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

for url in urls:
    print(f"--- Fetching {url} ---")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
        
        print("HTML length:", len(html))
        # Find some air image tags and show context
        matches = list(re.finditer(r'<img[^>]+src="([^"]+)"', html, re.IGNORECASE))
        print("Found images count:", len(matches))
        count = 0
        for match in matches:
            src = match.group(1)
            if 'air' in src.lower() or 'images/' in src.lower():
                start = max(0, match.start() - 150)
                end = min(len(html), match.end() + 250)
                print(f"  Src: {src}")
                print(f"  Context:\n{html[start:end]}")
                print("-"*30)
                count += 1
                if count >= 3:
                    break
    except Exception as e:
        print("Error:", e)
