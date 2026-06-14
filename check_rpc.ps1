$url = "https://mpdvrctotixqsdejfccd.supabase.co/rest/v1/rpc/get_my_profile"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZHZyY3RvdGl4cXNkZWpmY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzOTIyMzYsImV4cCI6MjA5Njk2ODIzNn0.rbjoU7qEyFf1Od_pXyp3ykwzPQSbOaZ3EJV-OCN13cc"

$headers = @{
    "apikey" = $apiKey
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$body = "{}"

try {
    $response = Invoke-WebRequest -Uri $url -Headers $headers -Body $body -Method POST -UseBasicParsing
    Write-Host "=== RPC get_my_profile ==="
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Body: $($response.Content)"
} catch {
    Write-Host "=== RPC get_my_profile ERROR ==="
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($reader.ReadToEnd())"
}
