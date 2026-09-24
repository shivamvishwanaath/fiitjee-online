import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "http://jeeadv.iitjeetoppers.com/jeeadv2022/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    # Let's print all <a> links that have href with .aspx or .html or pdf
    links = re.findall(r'<a[^>]+href="([^"]+)"', html, re.IGNORECASE)
    print("Found links:")
    for l in set(links):
        print("  -", l)
        
    # Look for text to see what is on this page
    text = re.sub(r'<[^>]*>', ' ', html)
    text = " ".join(text.split())
    print("\nText snippet:")
    print(text[:1500])
except Exception as e:
    print("Error:", e)
