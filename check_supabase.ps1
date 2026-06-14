$url = "https://mpdvrctotixqsdejfccd.supabase.co/rest/v1/profiles?id=eq.7805b9d9-ca21-407e-8f6f-1599f62688b9&select=*"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZHZyY3RvdGl4cXNkZWpmY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzOTIyMzYsImV4cCI6MjA5Njk2ODIzNn0.rbjoU7qEyFf1Od_pXyp3ykwzPQSbOaZ3EJV-OCN13cc"

$headers = @{
    "apikey" = $apiKey
    "Authorization" = "Bearer $apiKey"
}

try {
    $response = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing
    Write-Host "=== RESULTADO ==="
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Body: $($response.Content)"
} catch {
    Write-Host "=== ERROR ==="
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($reader.ReadToEnd())"
}
