param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot
)

$processes = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq 'node.exe' -and
  $_.CommandLine -and
  $_.CommandLine -match [regex]::Escape($ProjectRoot) -and
  ($_.CommandLine -match 'next\\dist\\bin\\next' -or $_.CommandLine -match 'start-server.js')
}

foreach ($process in $processes) {
  try {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  } catch {
    # Ignore failures for already-exiting processes.
  }
}