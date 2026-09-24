import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

urls = [
    "https://iitjeetoppers.com",
    "http://jeeadv.iitjeetoppers.com/jeeadv2024/",
    "http://jeemain.iitjeetoppers.com/2024",
    "https://cbse.fiitjee.com/2023result/XIIBoard2023.pdf", # this is a PDF!
    "https://www.fiitjee.com/SuccessTrail/Results-Olympiads/2024"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

for url in urls:
    print(f"--- Fetching {url} ---")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            content_type = response.headers.get('Content-Type', '')
            print("Content-Type:", content_type)
            if 'html' in content_type:
                html = response.read().decode('utf-8', errors='ignore')
                print("HTML length:", len(html))
                print("First 500 chars:", html[:500])
                # Find script tags or tables
                print("Script tags containing __NEXT_DATA__:", "__NEXT_DATA__" in html)
                tables = html.count("<table")
                print("Table count:", tables)
                imgs = len(urllib.request.urlopen(req).read().decode('utf-8', errors='ignore').split("<img")) - 1
                print("Image tags count:", html.count("<img"))
            else:
                print("Non-HTML response.")
    except Exception as e:
        print("Error:", e)
