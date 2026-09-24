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
    
    print("HTML length:", len(html))
    # Look for image tags
    img_tags = re.findall(r'<img[^>]+src="([^"]+)"', html, re.IGNORECASE)
    print("Found image URLs:", len(img_tags))
    for img in img_tags[:10]:
        print("  -", img)
        
    # Look for text content or tables
    text_content = re.sub(r'<[^>]*>', ' ', html)
    text_content = " ".join(text_content.split())
    print("\nText snippet (first 1000 chars):")
    print(text_content[:1000])
except Exception as e:
    print("Error:", e)
