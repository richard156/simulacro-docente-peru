$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZHZyY3RvdGl4cXNkZWpmY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzOTIyMzYsImV4cCI6MjA5Njk2ODIzNn0.rbjoU7qEyFf1Od_pXyp3ykwzPQSbOaZ3EJV-OCN13cc"
$headers = @{
    "apikey" = $apiKey
    "Authorization" = "Bearer $apiKey"
}

Write-Host "=== 1. Verificar tabla exams ==="
try {
    $r = Invoke-WebRequest -Uri "https://mpdvrctotixqsdejfccd.supabase.co/rest/v1/exams?select=*&limit=1" -Headers $headers -UseBasicParsing
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Body: $($r.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($reader.ReadToEnd())"
}

Write-Host ""
Write-Host "=== 2. Verificar tabla exam_cases ==="
try {
    $r = Invoke-WebRequest -Uri "https://mpdvrctotixqsdejfccd.supabase.co/rest/v1/exam_cases?select=*&limit=1" -Headers $headers -UseBasicParsing
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Body: $($r.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($reader.ReadToEnd())"
}

Write-Host ""
Write-Host "=== 3. Verificar tabla case_questions ==="
try {
    $r = Invoke-WebRequest -Uri "https://mpdvrctotixqsdejfccd.supabase.co/rest/v1/case_questions?select=*&limit=1" -Headers $headers -UseBasicParsing
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Body: $($r.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($reader.ReadToEnd())"
}
