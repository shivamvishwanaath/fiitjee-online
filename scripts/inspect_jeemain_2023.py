import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "http://jeemain.iitjeetoppers.com/2023"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    for match in re.finditer(r'<img[^>]+src="([^"]+)"', html, re.IGNORECASE):
        src = match.group(1)
        if 'malay' in src.lower() or 'toppers' in src.lower():
            start = max(0, match.start() - 200)
            end = min(len(html), match.end() + 500)
            print(f"--- MATCH: {src} ---")
            print(html[start:end])
            print("\n" + "="*50 + "\n")
except Exception as e:
    print("Error:", e)
