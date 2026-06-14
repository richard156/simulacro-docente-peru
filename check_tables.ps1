$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZHZyY3RvdGl4cXNkZWpmY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzOTIyMzYsImV4cCI6MjA5Njk2ODIzNn0.rbjoU7qEyFf1Od_pXyp3ykwzPQSbOaZ3EJV-OCN13cc"
$headers = @{
    "apikey" = $apiKey
    "Authorization" = "Bearer $apiKey"
}

# Probar varias tablas para ver cuáles existen
$tables = @("exams", "exam_cases", "case_questions", "documents", "exam_attempts", "question_answers", "case_progress")

foreach ($table in $tables) {
    try {
        $r = Invoke-WebRequest -Uri "https://mpdvrctotixqsdejfccd.supabase.co/rest/v1/$table`?select=id&limit=1" -Headers $headers -UseBasicParsing
        Write-Host "$table : EXISTS (Status $($r.StatusCode))"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 404) {
            Write-Host "$table : NOT FOUND (404)"
        } elseif ($status -eq 500) {
            Write-Host "$table : EXISTS but RLS error (500)"
        } else {
            Write-Host "$table : ERROR $status"
        }
    }
}
