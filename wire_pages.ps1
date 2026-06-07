# Wire all 33 HTML pages with api.js script tag and async DOMContentLoaded
# Phase 4 of the implementation plan

$base = "D:\smart_attendance_project\static_frontend"

# Define all pages with their API.init keys
$pages = @{
    # Admin pages (11)
    "admin\dashboard.html"      = "'stats', 'departments', 'notifications'"
    "admin\departments.html"    = "'departments', 'notifications'"
    "admin\users.html"          = "'users', 'notifications'"
    "admin\holidays.html"       = "'holidays', 'notifications'"
    "admin\students.html"       = "'users', 'notifications'"
    "admin\marks.html"          = "'marks_classes', 'notifications'"
    "admin\analytics.html"      = "'stats', 'departments', 'notifications'"
    "admin\at-risk.html"        = "'stats', 'notifications'"
    "admin\leave-requests.html" = "'leaves', 'notifications'"
    "admin\audit-logs.html"     = "'notifications'"
    "admin\history.html"        = "'notifications'"
    # HOD pages (9)
    "hod\dashboard.html"        = "'stats', 'leaves', 'notifications'"
    "hod\students.html"         = "'users', 'notifications'"
    "hod\marks.html"            = "'marks_classes', 'notifications'"
    "hod\leave-requests.html"   = "'leaves', 'notifications'"
    "hod\at-risk.html"          = "'stats', 'notifications'"
    "hod\analytics.html"        = "'stats', 'departments', 'notifications'"
    "hod\history.html"          = "'notifications'"
    "hod\timetable.html"        = "'notifications'"
    "hod\substitute.html"       = "'notifications'"
    # Faculty pages (7)
    "faculty\dashboard.html"       = "'stats', 'attendance_classes', 'notifications'"
    "faculty\mark-attendance.html" = "'attendance_classes', 'notifications'"
    "faculty\marks.html"           = "'marks_classes', 'notifications'"
    "faculty\at-risk.html"         = "'stats', 'notifications'"
    "faculty\history.html"         = "'notifications'"
    "faculty\corrections.html"     = "'notifications'"
    "faculty\substitute.html"      = "'notifications'"
    # Student pages (6)
    "student\dashboard.html"    = "'stats', 'notifications'"
    "student\attendance.html"   = "'stats', 'notifications'"
    "student\marks.html"        = "'notifications'"
    "student\apply-leave.html"  = "'notifications'"
    "student\leave-status.html" = "'leaves', 'notifications'"
    "student\history.html"      = "'notifications'"
}

$count = 0
foreach ($page in $pages.GetEnumerator()) {
    $filePath = Join-Path $base $page.Key
    $keys = $page.Value

    if (!(Test-Path $filePath)) {
        Write-Host "SKIP: $($page.Key) not found" -ForegroundColor Yellow
        continue
    }

    $content = Get-Content $filePath -Raw -Encoding UTF8

    # Change 1: Add api.js script tag after data.js
    if ($content -notmatch 'api\.js') {
        $content = $content -replace '(<script src="../js/data\.js"></script>)', "`$1`n<script src=""../js/api.js""></script>"
    }

    # Change 2: Make DOMContentLoaded async and add API.init
    # Handle both spaced and unspaced variants
    # Pattern: document.addEventListener('DOMContentLoaded', () => {  OR  DOMContentLoaded',()=>{
    if ($content -notmatch 'API\.init') {
        # Handle normal spaced version
        $content = $content -replace "document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{", "document.addEventListener('DOMContentLoaded', async () => {"

        # Find the loadComponents line and add API.init after it
        $content = $content -replace "(loadComponents\([^)]+\);)", "`$1`n  await API.init([$keys]);"
    }

    Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
    $count++
    Write-Host "OK: $($page.Key)" -ForegroundColor Green
}

Write-Host "`nDone: $count files wired." -ForegroundColor Cyan
