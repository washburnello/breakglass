# BreakGlass kit server (Windows) — PowerShell fallback needs no installs.
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $root "..")
$port = 8025
$mime = @{
  ".html"="text/html"; ".css"="text/css"; ".js"="text/javascript";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".svg"="image/svg+xml";
  ".woff2"="font/woff2"; ".json"="application/json"; ".wasm"="application/wasm";
  ".zim"="application/octet-stream"; ".data"="application/octet-stream"
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")
try { $listener.Start() } catch {
  Write-Host "Port busy or blocked; run this file as Administrator once if it repeats."
  Read-Host "Press Enter to close"; exit 1
}
Write-Host ""
Write-Host "  BreakGlass kit server"
Write-Host "  Serving at: http://127.0.0.1:$port/"
Write-Host "  Press Ctrl+C to stop."
Write-Host ""
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
  if ($rel -eq "") { $rel = "index.html" }
  $file = Join-Path (Get-Location) $rel
  if ((Resolve-Path $file -ErrorAction SilentlyContinue).Path.StartsWith((Get-Location).Path) -and (Test-Path $file -PathType Leaf)) {
    $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
    $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $ctx.Response.ContentType = $type
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
  }
  $ctx.Response.Close()
}
