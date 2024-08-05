$repoName = Split-Path -Leaf (git rev-parse --show-toplevel)
$commitDate = git log -1 --format=%cd
$dataFile = "$env:USERPROFILE\repo.data.json"

# Read the JSON file
$jsonContent = Get-Content $dataFile -Raw | ConvertFrom-Json

# Update the repository data
$jsonContent.repos | Where-Object { $_.name -eq $repoName } | ForEach-Object {
    $_.last_commit_date = $commitDate
}

# Write the updated JSON back to the file
$jsonContent | ConvertTo-Json -Depth 10 | Set-Content $dataFile

Write-Host "Updated $dataFile with latest commit for $repoName"