import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://iitjeetoppers.com"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    # Let's search for matches of image tags and printing surrounding context of 300 chars
    # We want to see how image tags are nested inside divs/cells with student info
    pos = 0
    for match in re.finditer(r'<img[^>]+src="([^"]+)"', html, re.IGNORECASE):
        img_src = match.group(1)
        if 'air' in img_src.lower():
            start = max(0, match.start() - 300)
            end = min(len(html), match.end() + 300)
            print(f"--- MATCH: {img_src} ---")
            print(html[start:end])
            print("\n" + "="*50 + "\n")
            
except Exception as e:
    print("Error:", e)
