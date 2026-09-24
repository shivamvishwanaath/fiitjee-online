import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "http://jeeadv.iitjeetoppers.com/jeeadv2023/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    img_tags = re.findall(r'<img[^>]+src="([^"]+)"', html, re.IGNORECASE)
    print("Total images found:", len(img_tags))
    
    unique_filtered = []
    for src in img_tags:
        if any(x in src.lower() for x in ['logo', 'banner', 'hand_pen', 'icon', 'video', 'conversion', 'adservices', 'theme', 'statcounter', 'facebook', 'twitter', 'google', 'youtube']):
            continue
        unique_filtered.append(src)
        
    print("Filtered student-like images count:", len(unique_filtered))
    print("Sample student-like image paths:")
    for src in unique_filtered[:30]:
        print("  -", src)
except Exception as e:
    print("Error:", e)
