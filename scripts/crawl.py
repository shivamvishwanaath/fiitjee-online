import urllib.request
import urllib.parse
import re
import json
import os
import ssl

# Disable SSL verification in case of issues
ssl._create_default_https_context = ssl._create_unverified_context

BASE_IMAGE_URL = "https://dujozny86idgo.cloudfront.net/"
OUTPUT_DIR = "d:/Project-files/web-dev/fiitjee"
PHOTOS_DIR = os.path.join(OUTPUT_DIR, "student_photos")

if not os.path.exists(PHOTOS_DIR):
    os.makedirs(PHOTOS_DIR)

urls = {
    "homepage": "https://www.fiitjee.com/",
    "results": "https://www.fiitjee.com/fiitjee-results",
    "transformative": "https://www.fiitjee.com/transformative-results"
}

students = []

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

def clean_html(text):
    # simple tag cleaner for descriptions
    text = re.sub(r'<[^>]*>', ' ', text)
    # clean HTML entities
    text = text.replace("&amp;", "&").replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">")
    return " ".join(text.split()).strip()

for name, url in urls.items():
    print(f"Fetching {name}: {url}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8')
        
        # Extract __NEXT_DATA__
        match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
        if not match:
            print(f"Could not find __NEXT_DATA__ script in {url}")
            continue
            
        data = json.loads(match.group(1))
        
        # Let's extract students from pageProps -> pageData -> components
        components = data.get("props", {}).get("pageProps", {}).get("pageData", {}).get("components", {})
        
        # 1. Look for verticalTab_1 -> verticalCardDetails
        if "verticalTab_1" in components:
            details = components["verticalTab_1"].get("verticalCardDetails", [])
            for item in details:
                name_val = item.get("studentName")
                if not name_val:
                    continue
                category = item.get("cardCategoryKey") or item.get("title")
                rank = item.get("rank")
                rank_heading = item.get("rankHeading")
                description = clean_html(item.get("description") or "")
                olympiad_desc = clean_html(item.get("olympiadDescription") or "")
                
                img_data = item.get("studentImage") or {}
                img_url = img_data.get("url") if isinstance(img_data, dict) else None
                
                students.append({
                    "name": clean_html(name_val),
                    "category": clean_html(category),
                    "rank": clean_html(str(rank)) if rank else "",
                    "rank_heading": clean_html(rank_heading) if rank_heading else "",
                    "description": f"{description} | {olympiad_desc}".strip(" |"),
                    "image_url": img_url,
                    "source": url
                })
        
        # 2. Look for columnCard_1 -> columnCards
        if "columnCard_1" in components:
            cards = components["columnCard_1"].get("columnCards", [])
            for item in cards:
                name_val = item.get("studentName")
                if not name_val:
                    continue
                category = item.get("tagLine")
                rank = item.get("rank")
                rank_heading = item.get("rankHeading")
                description = clean_html(item.get("info") or "")
                
                img_data = item.get("studentImage") or {}
                img_url = img_data.get("url") if isinstance(img_data, dict) else None
                
                students.append({
                    "name": clean_html(name_val),
                    "category": clean_html(category) if category else "",
                    "rank": clean_html(str(rank)) if rank else "",
                    "rank_heading": clean_html(rank_heading) if rank_heading else "",
                    "description": description,
                    "image_url": img_url,
                    "source": url
                })

        # 3. Look for homeBanner_1 -> sliderImageCard
        if "homeBanner_1" in components:
            cards = components["homeBanner_1"].get("sliderImageCard", [])
            for item in cards:
                name_val = item.get("studentName")
                if not name_val:
                    continue
                category = item.get("tagLine")
                rank = item.get("rank")
                rank_heading = item.get("rankHeading")
                description = clean_html(item.get("info") or "")
                
                img_data = item.get("sliderImage") or {}
                img_url = img_data.get("url") if isinstance(img_data, dict) else None
                
                students.append({
                    "name": clean_html(name_val),
                    "category": clean_html(category) if category else "",
                    "rank": clean_html(str(rank)) if rank else "",
                    "rank_heading": clean_html(rank_heading) if rank_heading else "",
                    "description": description,
                    "image_url": img_url,
                    "source": url
                })

        # 4. Look for repeatableImageText_1 / repeatableImageText_2
        for key in ["repeatableImageText_1", "repeatableImageText_2"]:
            if key in components:
                items = components[key].get("imageAndText", [])
                for item in items:
                    name_desc_html = item.get("nameAndDescription") or ""
                    # extract name from <strong>
                    name_match = re.search(r'<strong>(.*?)</strong>', name_desc_html)
                    name_val = name_match.group(1).strip() if name_match else clean_html(name_desc_html)
                    
                    description = clean_html(item.get("text") or "")
                    
                    img_data = item.get("image") or {}
                    img_url = img_data.get("url") if isinstance(img_data, dict) else None
                    
                    students.append({
                        "name": clean_html(name_val),
                        "category": "Transformative Results / Alumni",
                        "rank": "",
                        "rank_heading": "",
                        "description": description,
                        "image_url": img_url,
                        "source": url
                    })
                    
        # 5. Look for customSection_1 -> customTabs -> customTable
        if "customSection_1" in components:
            tabs = components["customSection_1"].get("customTabs", [])
            for tab in tabs:
                tables = tab.get("customTable", [])
                for t in tables:
                    table_html = t.get("tableText") or ""
                    # Parse rows using simple regex
                    rows = re.findall(r'<tr>(.*?)</tr>', table_html, re.DOTALL)
                    if not rows:
                        continue
                    # Skip header row, usually the first row
                    for row in rows[1:]:
                        cols = re.findall(r'<td>(.*?)</td>', row, re.DOTALL)
                        if len(cols) >= 5:
                            std_name = clean_html(cols[0])
                            adm_test = clean_html(cols[1])
                            marks_sch = clean_html(cols[2])
                            program = clean_html(cols[3])
                            rank_val = clean_html(cols[4])
                            
                            students.append({
                                "name": std_name,
                                "category": "Transformative Results / Table",
                                "rank": rank_val.replace("AIR - ", "").strip(),
                                "rank_heading": "All India Rank",
                                "description": f"Admission Test: {adm_test} | Marks/Scholarship: {marks_sch} | Program: {program}",
                                "image_url": None,
                                "source": url
                            })

    except Exception as e:
        print(f"Error crawling {url}: {e}")

# Deduplicate students list
unique_students = []
seen = set()
for s in students:
    # Use name + category + rank as key
    key = (s["name"].strip().lower(), (s["category"] or "").strip().lower(), (s["rank"] or "").strip().lower())
    if key not in seen:
        seen.add(key)
        unique_students.append(s)

print(f"Found {len(unique_students)} unique students.")

# Now download images and update path
for idx, s in enumerate(unique_students):
    img_rel = s.get("image_url")
    if not img_rel:
        s["local_image_path"] = None
        continue
    
    # Construct full URL
    img_rel_escaped = urllib.parse.quote(img_rel, safe='/:?=&')
    img_url = urllib.parse.urljoin(BASE_IMAGE_URL, img_rel_escaped)
    # Sanitize filename
    ext = os.path.splitext(img_rel.split("?")[0])[1] or ".png"
    # Some URLs have webp at the end of double extension e.g. .png.webp
    if img_rel.endswith(".webp"):
        ext = ".webp"
    
    safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', s["name"])
    safe_cat = re.sub(r'[^a-zA-Z0-9_-]', '_', s["category"] or "unknown")
    rank_str = f"_rank_{s['rank']}" if s['rank'] else ""
    filename = f"{safe_cat}_{safe_name}{rank_str}{ext}"
    local_path = os.path.join(PHOTOS_DIR, filename)
    
    print(f"Downloading [{idx+1}/{len(unique_students)}]: {s['name']} photo from {img_url}")
    try:
        req = urllib.request.Request(img_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        })
        with urllib.request.urlopen(req, timeout=15) as response:
            with open(local_path, "wb") as f:
                f.write(response.read())
        s["local_image_path"] = os.path.relpath(local_path, OUTPUT_DIR)
        print(f"Saved to {local_path}")
    except Exception as e:
        print(f"Failed to download image for {s['name']}: {e}")
        s["local_image_path"] = None

# Save results json
results_file = os.path.join(OUTPUT_DIR, "results.json")
with open(results_file, "w", encoding="utf-8") as f:
    json.dump(unique_students, f, indent=2, ensure_ascii=False)

print(f"Saved results structure to {results_file}")
