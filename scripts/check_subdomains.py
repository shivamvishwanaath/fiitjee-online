import socket

subdomains = [
    "jeeadv.iitjeetoppers.com",
    "jeemain.iitjeetoppers.com",
    "kvpy.iitjeetoppers.com",
    "olympiads.iitjeetoppers.com",
    "ntse.iitjeetoppers.com",
    "cbse.iitjeetoppers.com",
    "iitjeetoppers.com"
]

for sub in subdomains:
    try:
        ip = socket.gethostbyname(sub)
        print(f"{sub} resolves to {ip}")
    except Exception as e:
        print(f"{sub} does not resolve: {e}")
