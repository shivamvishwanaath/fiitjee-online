import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

subdomains = [
    "http://jeeadv.iitjeetoppers.com",
    "http://jeemain.iitjeetoppers.com",
    "http://kvpy.iitjeetoppers.com",
    "http://olympiads.iitjeetoppers.com",
    "http://ntse.iitjeetoppers.com",
    "http://cbse.iitjeetoppers.com"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

for url in subdomains:
    print(f"--- Fetching {url} ---")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            print("Status code:", response.status)
            print("HTML length:", len(html))
            # Get title
            import re
            title = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
            print("Title:", title.group(1).strip() if title else "No title")
    except Exception as e:
        print("Error:", e)
