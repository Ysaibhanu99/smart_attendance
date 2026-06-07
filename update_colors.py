import re

files_to_process = [
    r"D:\smart_attendance_project\static_frontend\js\charts.js",
    r"D:\smart_attendance_project\static_frontend\js\main.js"
]

replacements = {
    '#8b8fa8': '#64748b',
    '#2a2d3a': '#e5e7eb',
    '#1c1f2a': '#ffffff',
    '#e8eaf0': '#1e293b'
}

for fp in files_to_process:
    with open(fp, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old_color, new_color in replacements.items():
        content = content.replace(old_color, new_color)
        
    with open(fp, "w", encoding="utf-8") as f:
        f.write(content)

print("Colors updated successfully.")
