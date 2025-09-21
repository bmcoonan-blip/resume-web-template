import webbrowser
import os

# Create a simple HTML file
html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Python Opened Page</title>
</head>
<body>
    <h1>This page was opened by Python!</h1>
</body>
</html>
"""

file_path = "index.html"
with open(file_path, "w") as f:
    f.write(html_content)
