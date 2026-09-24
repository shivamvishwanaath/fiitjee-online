import urllib.request
import urllib.parse
import re
import json
import os
import ssl
import sys

ssl._create_default_https_context = ssl._create_unverified_context

BASE_IMAGE_URL = "https://dujozny86idgo.cloudfront.net/"
OUTPUT_DIR = "d:/Project-files/web-dev/fiitjee"
PHOTOS_DIR = os.path.join(OUTPUT_DIR, "student_photos")
PDFS_DIR = os.path.join(OUTPUT_DIR, "board_results_pdfs")

for d in [PHOTOS_DIR, PDFS_DIR]:
    if not os.path.exists(d):
        os.makedirs(d)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

groups = {
    "JEE Advanced": [
        "https://iitjeetoppers.com",
        "http://jeeadv.iitjeetoppers.com/jeeadv2024/",
        "http://jeeadv.iitjeetoppers.com/jeeadv2023/",
        "http://jeeadv.iitjeetoppers.com/jeeadv2022/",
        "http://jeeadv.iitjeetoppers.com/jeeadv2021/",
        "http://jeeadv.iitjeetoppers.com/jeeadv2020/",
        "http://jeeadv.iitjeetoppers.com/jeeadv2019/",
        "http://jeeadv.iitjeetoppers.com/jeeadv2018/",
        "http://jeeadv.iitjeetoppers.com/jeeadv2017/",
        "http://jeeadv.iitjeetoppers.com/jeeadv2016/",
        "http://jeeadv.iitjeetoppers.com/JEEAdv2015/",
        "http://jeeadv.iitjeetoppers.com/jeeadv2014/",
        "http://jeeadv.iitjeetoppers.com/JEEAdv2013/Default.aspx"
    ],
    "JEE Main": [
        "http://jeemain.iitjeetoppers.com/2024",
        "http://jeemain.iitjeetoppers.com/2023",
        "http://jeemain.iitjeetoppers.com/2023S1/",
        "http://jeemain.iitjeetoppers.com/2022/",
        "http://jeemain.iitjeetoppers.com/2022S1/",
        "http://jeemain.iitjeetoppers.com/2021/",
        "http://jeemain.iitjeetoppers.com/2021J/",
        "http://jeemain.iitjeetoppers.com/2021M/",
        "http://jeemain.iitjeetoppers.com/2021F/",
        "http://jeemain.iitjeetoppers.com/2020/",
        "http://jeemain.iitjeetoppers.com/2020j/",
        "http://jeemain.iitjeetoppers.com/2019/",
        "http://jeemain.iitjeetoppers.com/2019j/",
        "http://jeemain.iitjeetoppers.com/2018/",
        "http://jeemain.iitjeetoppers.com/2017/",
        "http://jeemain.iitjeetoppers.com/2016/",
        "http://jeemain.iitjeetoppers.com/2015/",
        "https://www.fiitjee.com/SuccessTrail/Results-JEE(MAIN)/2014",
        "https://www.fiitjee.com/SuccessTrail/Results-JEE(MAIN)/2013",
        "https://www.fiitjee.com/SuccessTrail/Results-JEE(MAIN)/2012-(AIEEE)",
        "https://www.fiitjee.com/SuccessTrail/Results-JEE(MAIN)/2011-(AIEEE)"
    ],
    "CBSE": [
        "https://cbse.fiitjee.com/2023result/XIIBoard2023.pdf",
        "https://cbse.fiitjee.com/2022result/XIIBoard2022.pdf",
        "https://cbse.fiitjee.com/2021result/XIIBoard2021.pdf",
        "https://cbse.fiitjee.com/2020result/XIIBoard2020.pdf",
        "https://cbse.fiitjee.com/2018result/",
        "https://cbse.fiitjee.com/2017Result/",
        "https://cbse.fiitjee.com/2016Result/",
        "https://cbse.fiitjee.com/2015Result/",
        "https://cbse.fiitjee.com/2014Result/CompleteResultList14.aspx",
        "https://cbse.fiitjee.com/CompleteResultList.aspx"
    ],
    "Olympiads": [
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2024",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2023",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2022",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2021",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2020",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2019",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2018",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2017",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2016",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2015",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2014",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2013",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2012",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2011",
        "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/All"
    ],
    "KVPY": [
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2022",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2021",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2020",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2019",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2018",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2017",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2016",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2015",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2014",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2013",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2012",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/2011",
        "https://www.fiitjee.com/SuccessTrail/Results-KVPY/All"
    ],
    "NTSE": [
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2021",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2020",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2019",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2018",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2017",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2016",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2015",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2014",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2013",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2012",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/2011",
        "https://www.fiitjee.com/SuccessTrail/Results-NTSE/All"
    ]
}

students = []

def clean_html(text):
    text = re.sub(r'<[^>]*>', ' ', text)
    text = text.replace("&amp;", "&").replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">").replace("&#39;", "'").replace("&quot;", '"')
    return " ".join(text.split()).strip()

def parse_nextjs(components, source_url, group_name):
    parsed = []
    # 1. Look for verticalTab_1 -> verticalCardDetails
    if "verticalTab_1" in components:
        details = components["verticalTab_1"].get("verticalCardDetails", [])
        for item in details:
            name_val = item.get("studentName")
            if not name_val:
                continue
            category = item.get("cardCategoryKey") or item.get("title") or group_name
            rank = item.get("rank")
            rank_heading = item.get("rankHeading")
            description = clean_html(item.get("description") or "")
            olympiad_desc = clean_html(item.get("olympiadDescription") or "")
            
            img_data = item.get("studentImage") or {}
            img_url = img_data.get("url") if isinstance(img_data, dict) else None
            
            parsed.append({
                "name": clean_html(name_val),
                "category": clean_html(category),
                "rank": clean_html(str(rank)) if rank else "",
                "rank_heading": clean_html(rank_heading) if rank_heading else "",
                "description": f"{description} | {olympiad_desc}".strip(" |"),
                "image_url": img_url,
                "source": source_url,
                "type": "nextjs"
            })
    
    # 2. Look for columnCard_1 -> columnCards
    if "columnCard_1" in components:
        cards = components["columnCard_1"].get("columnCards", [])
        for item in cards:
            name_val = item.get("studentName")
            if not name_val:
                continue
            category = item.get("tagLine") or group_name
            rank = item.get("rank")
            rank_heading = item.get("rankHeading")
            description = clean_html(item.get("info") or "")
            
            img_data = item.get("studentImage") or {}
            img_url = img_data.get("url") if isinstance(img_data, dict) else None
            
            parsed.append({
                "name": clean_html(name_val),
                "category": clean_html(category) if category else "",
                "rank": clean_html(str(rank)) if rank else "",
                "rank_heading": clean_html(rank_heading) if rank_heading else "",
                "description": description,
                "image_url": img_url,
                "source": source_url,
                "type": "nextjs"
            })

    # 3. Look for homeBanner_1 -> sliderImageCard
    if "homeBanner_1" in components:
        cards = components["homeBanner_1"].get("sliderImageCard", [])
        for item in cards:
            name_val = item.get("studentName")
            if not name_val:
                continue
            category = item.get("tagLine") or group_name
            rank = item.get("rank")
            rank_heading = item.get("rankHeading")
            description = clean_html(item.get("info") or "")
            
            img_data = item.get("sliderImage") or {}
            img_url = img_data.get("url") if isinstance(img_data, dict) else None
            
            parsed.append({
                "name": clean_html(name_val),
                "category": clean_html(category) if category else "",
                "rank": clean_html(str(rank)) if rank else "",
                "rank_heading": clean_html(rank_heading) if rank_heading else "",
                "description": description,
                "image_url": img_url,
                "source": source_url,
                "type": "nextjs"
            })

    # 4. Look for repeatableImageText_1 / repeatableImageText_2
    for key in ["repeatableImageText_1", "repeatableImageText_2"]:
        if key in components:
            items = components[key].get("imageAndText", [])
            for item in items:
                name_desc_html = item.get("nameAndDescription") or ""
                name_match = re.search(r'<strong>(.*?)</strong>', name_desc_html)
                name_val = name_match.group(1).strip() if name_match else clean_html(name_desc_html)
                
                description = clean_html(item.get("text") or "")
                
                img_data = item.get("image") or {}
                img_url = img_data.get("url") if isinstance(img_data, dict) else None
                
                parsed.append({
                    "name": clean_html(name_val),
                    "category": group_name + " / Alumni",
                    "rank": "",
                    "rank_heading": "",
                    "description": description,
                    "image_url": img_url,
                    "source": source_url,
                    "type": "nextjs"
                })

    # 5. Look for customSection_1 -> customTabs -> customTable
    if "customSection_1" in components:
        tabs = components["customSection_1"].get("customTabs", [])
        for tab in tabs:
            tables = tab.get("customTable", [])
            for t in tables:
                table_html = t.get("tableText") or ""
                rows = re.findall(r'<tr>(.*?)</tr>', table_html, re.DOTALL)
                if not rows:
                    continue
                for row in rows[1:]:
                    cols = re.findall(r'<td>(.*?)</td>', row, re.DOTALL)
                    if len(cols) >= 5:
                        std_name = clean_html(cols[0])
                        adm_test = clean_html(cols[1])
                        marks_sch = clean_html(cols[2])
                        program = clean_html(cols[3])
                        rank_val = clean_html(cols[4])
                        
                        parsed.append({
                            "name": std_name,
                            "category": group_name + " / Table",
                            "rank": rank_val.replace("AIR - ", "").strip(),
                            "rank_heading": "All India Rank",
                            "description": f"Admission Test: {adm_test} | Marks/Scholarship: {marks_sch} | Program: {program}",
                            "image_url": None,
                            "source": source_url,
                            "type": "nextjs"
                        })
    return parsed

def parse_html_toppers(html, source_url, group_name):
    parsed = []
    # Find all images
    for match in re.finditer(r'<img[^>]+src="([^"]+)"', html, re.IGNORECASE):
        img_src = match.group(1)
        # Filter out layout/design elements
        if any(x in img_src.lower() for x in ['logo', 'banner', 'hand_pen', 'icon', 'video', 'conversion', 'adservices', 'theme', 'statcounter', 'facebook', 'twitter', 'google', 'youtube', 'btn', 'social']):
            continue
            
        # Search forward for h3/h4/h5 containing student name
        search_area = html[match.end():match.end() + 1000]
        h3_match = re.search(r'<h[345][^>]*>(.*?)</h[345]>', search_area, re.DOTALL | re.IGNORECASE)
        if h3_match:
            h3_content = h3_match.group(1)
            parts = re.split(r'<br\s*/?>', h3_content, flags=re.IGNORECASE)
            name = clean_html(parts[0])
            desc = clean_html(parts[1]) if len(parts) > 1 else ""
            
            # Extract rank from img_src
            rank_match = re.search(r'air[-_ ]*(\d+)', img_src, re.IGNORECASE)
            rank = rank_match.group(1) if rank_match else ""
            
            parsed.append({
                "name": name,
                "category": group_name,
                "rank": rank,
                "rank_heading": "All India Rank" if rank else "",
                "description": desc,
                "image_url": img_src,
                "source": source_url,
                "type": "html"
            })
            
    # Fallback to tables if no image-based cards were found
    if not parsed:
        tables = re.findall(r'<table[^>]*>(.*?)</table>', html, re.DOTALL | re.IGNORECASE)
        for table in tables:
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.DOTALL | re.IGNORECASE)
            for row in rows[1:]:
                cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL | re.IGNORECASE)
                if len(cells) >= 3:
                    cleaned_cells = [clean_html(c) for c in cells]
                    name_val = cleaned_cells[0]
                    # If it looks like a header or empty
                    if not name_val or name_val.lower() in ["name", "student name", "name of student", "s.no.", "s.no"]:
                        continue
                    
                    parsed.append({
                        "name": name_val,
                        "category": group_name,
                        "rank": cleaned_cells[-1] if len(cleaned_cells) > 3 else "",
                        "rank_heading": "Details",
                        "description": " | ".join(cleaned_cells[1:]),
                        "image_url": None,
                        "source": source_url,
                        "type": "html_table"
                    })
    return parsed

# Fetch all pages
for group_name, urls in groups.items():
    for url in urls:
        print(f"Crawling [{group_name}]: {url} ...")
        
        # Check if PDF
        if url.endswith(".pdf"):
            filename = os.path.basename(url)
            local_pdf_path = os.path.join(PDFS_DIR, f"{group_name.replace(' ', '_')}_{filename}")
            print(f"Downloading PDF: {url} -> {local_pdf_path}")
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=15) as response:
                    with open(local_pdf_path, "wb") as f:
                        f.write(response.read())
            except Exception as e:
                print(f"Failed to download PDF {url}: {e}")
            continue

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                content_type = response.headers.get('Content-Type', '')
                if 'pdf' in content_type.lower():
                    # PDF file served without .pdf extension
                    local_pdf_path = os.path.join(PDFS_DIR, f"{group_name.replace(' ', '_')}_{hash(url)}.pdf")
                    print(f"Downloading PDF (from header): {url} -> {local_pdf_path}")
                    with open(local_pdf_path, "wb") as f:
                        f.write(response.read())
                    continue
                
                html = response.read().decode('utf-8', errors='ignore')
            
            # Check for __NEXT_DATA__
            match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
            if match:
                data = json.loads(match.group(1))
                components = data.get("props", {}).get("pageProps", {}).get("pageData", {}).get("components", {})
                
                # Check if it returned a 404 messageTemplate
                if "messageTemplate_1" in components and components["messageTemplate_1"].get("title"):
                    if "unknown or does not exist" in components["messageTemplate_1"].get("title").lower():
                        print(f"Skipping (404 page): {url}")
                        continue
                
                parsed = parse_nextjs(components, url, group_name)
                print(f"Found {len(parsed)} students (NextJS).")
                students.extend(parsed)
            else:
                # Standard HTML parsing
                parsed = parse_html_toppers(html, url, group_name)
                print(f"Found {len(parsed)} students (HTML).")
                students.extend(parsed)
                
        except Exception as e:
            print(f"Error crawling {url}: {e}")

# Deduplicate
unique_students = []
seen = set()
for s in students:
    key = (s["name"].strip().lower(), (s["category"] or "").strip().lower(), (s["rank"] or "").strip().lower())
    if key not in seen:
        seen.add(key)
        unique_students.append(s)

print(f"\nCrawling complete. Found {len(unique_students)} unique students in total.")

# Load existing results if any to merge
results_file = os.path.join(OUTPUT_DIR, "results.json")
existing_students = []
if os.path.exists(results_file):
    try:
        with open(results_file, "r", encoding="utf-8") as f:
            existing_students = json.load(f)
        print(f"Loaded {len(existing_students)} existing student records from results.json.")
    except Exception as e:
        print(f"Failed to read existing results.json: {e}")

# Merge existing and new
merged_map = {}
for s in existing_students:
    key = (s["name"].strip().lower(), (s["category"] or "").strip().lower(), (s["rank"] or "").strip().lower())
    merged_map[key] = s

for s in unique_students:
    key = (s["name"].strip().lower(), (s["category"] or "").strip().lower(), (s["rank"] or "").strip().lower())
    if key not in merged_map:
        merged_map[key] = s
    else:
        # Merge fields (keep local image path if already exists)
        if s.get("image_url") and not merged_map[key].get("image_url"):
            merged_map[key]["image_url"] = s["image_url"]
        if not merged_map[key].get("description") and s.get("description"):
            merged_map[key]["description"] = s["description"]

final_students = list(merged_map.values())
print(f"Merged into {len(final_students)} total unique student records.")

# Download new images
for idx, s in enumerate(final_students):
    img_rel = s.get("image_url")
    if not img_rel or s.get("local_image_path"):
        # Already downloaded or has no image
        continue
    
    # Resolve full URL
    if img_rel.startswith("http://") or img_rel.startswith("https://"):
        img_url = img_rel
    else:
        # If relative to CloudFront
        if s.get("type") == "nextjs":
            img_url = urllib.parse.urljoin(BASE_IMAGE_URL, img_rel)
        else:
            # If relative to HTML source URL
            img_url = urllib.parse.urljoin(s["source"], img_rel)
            
    # Escape spaces/special chars in URL
    img_url_escaped = urllib.parse.quote(img_url, safe='/:?=&')
    
    # Sanitize filename
    ext = os.path.splitext(img_rel.split("?")[0])[1] or ".png"
    if img_rel.endswith(".webp"):
        ext = ".webp"
        
    safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', s["name"])
    safe_cat = re.sub(r'[^a-zA-Z0-9_-]', '_', s["category"] or "unknown")
    rank_str = f"_rank_{s['rank']}" if s['rank'] else ""
    filename = f"{safe_cat}_{safe_name}{rank_str}{ext}"
    local_path = os.path.join(PHOTOS_DIR, filename)
    
    print(f"Downloading [{idx+1}/{len(final_students)}]: {s['name']} photo from {img_url_escaped}")
    try:
        req = urllib.request.Request(img_url_escaped, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            with open(local_path, "wb") as f:
                f.write(response.read())
        s["local_image_path"] = os.path.relpath(local_path, OUTPUT_DIR)
        print(f"Saved to {local_path}")
    except Exception as e:
        print(f"Failed to download image for {s['name']}: {e}")
        s["local_image_path"] = None

# Save updated JSON
with open(results_file, "w", encoding="utf-8") as f:
    json.dump(final_students, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(final_students)} results mapping to {results_file}")
