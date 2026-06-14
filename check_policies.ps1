$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZHZyY3RvdGl4cXNkZWpmY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzOTIyMzYsImV4cCI6MjA5Njk2ODIzNn0.rbjoU7qEyFf1Od_pXyp3ykwzPQSbOaZ3EJV-OCN13cc"
$headers = @{
    "apikey" = $apiKey
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Write-Host "=== 1. Verificar RPC get_my_profile (deberia funcionar si la 002 se ejecuto) ==="
try {
    $body = @{} | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "https://mpdvrctotixqsdejfccd.supabase.co/rest/v1/rpc/get_my_profile" -Headers $headers -Method POST -Body $body -UseBasicParsing
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Body: $($r.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($reader.ReadToEnd())"
}

Write-Host ""
Write-Host "=== 2. Verificar RPC is_admin (deberia funcionar si la 002 se ejecuto) ==="
try {
    $body = @{} | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "https://mpdvrctotixqsdejfccd.supabase.co/rest/v1/rpc/is_admin" -Headers $headers -Method POST -Body $body -UseBasicParsing
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Body: $($r.Content)"
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($reader.ReadToEnd())"
}
