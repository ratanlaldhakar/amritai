import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

o = Options()
o.add_argument("--headless")
o.add_argument("--no-sandbox")
o.set_capability("goog:loggingPrefs", {"browser": "ALL"})
d = webdriver.Chrome(options=o)
d.get("http://localhost:5173/admin.html")
time.sleep(2)
r = d.execute_script("return typeof dbService.restoreCertificate")
print(f"typeof dbService.restoreCertificate = {r}")
assert r == "function", f"FAIL: expected 'function', got '{r}'"
print("PASS: dbService.restoreCertificate is a function")
d.quit()
