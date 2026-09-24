import urllib.request
import urllib.parse
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "http://jeeadv.iitjeetoppers.com/jeeadv2023/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

def clean_html(text):
    text = re.sub(r'<[^>]*>', ' ', text)
    text = text.replace("&amp;", "&").replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">")
    return " ".join(text.split()).strip()

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    print("Fetched successfully. Length:", len(html))
    
    # Let's search for images and surrounding text
    students = []
    
    # 1. Match Pattern A:
    # <div class="classstudent-topper ...">
    #   ... <img src="...">
    #   ... <h3>Name<br/><span>Program</span></h3>
    # Let's find matches of <h3> containing br/span near an image
    # We can match divs or use finditer on img tags
    for match in re.finditer(r'<img[^>]+src="([^"]+)"', html, re.IGNORECASE):
        img_src = match.group(1)
        if "logo" in img_src.lower() or "banner" in img_src.lower() or "button" in img_src.lower() or "icon" in img_src.lower():
            continue
            
        # Search forward for h3
        search_area = html[match.end():match.end() + 1000]
        h3_match = re.search(r'<h3>(.*?)</h3>', search_area, re.DOTALL | re.IGNORECASE)
        if h3_match:
            h3_content = h3_match.group(1)
            # Split into name and program/details
            parts = re.split(r'<br\s*/?>', h3_content, flags=re.IGNORECASE)
            name = clean_html(parts[0])
            desc = clean_html(parts[1]) if len(parts) > 1 else ""
            
            # Extract rank from img_src
            rank_match = re.search(r'air[-_ ]*(\d+)', img_src, re.IGNORECASE)
            rank = rank_match.group(1) if rank_match else ""
            
            students.append({
                "name": name,
                "rank": rank,
                "description": desc,
                "image_url": img_src
            })
            
    print(f"Found {len(students)} students.")
    for s in students[:10]:
        print(s)
        
except Exception as e:
    print("Error:", e)
