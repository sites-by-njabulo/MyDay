# Regenerates MyDay's app icons and the cropped mark-only badge asset from the
# real logo file (icons/logo-myday.png). Re-run this any time the logo changes.
#
# Produces:
#   icons/logo-mark.png   - tightly cropped "M" glyph only (transparent bg),
#                            used for the small sidebar/splash badge contexts
#   icons/icon-192.png    - PWA manifest icon, mark composited on solid bg
#   icons/icon-512.png    - PWA manifest icon, mark composited on solid bg

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $root "logo-myday.png"
$markOut = Join-Path $root "logo-mark.png"

# ---- Step 1: find the mark glyph's row-band by scanning for the first gap
# (consecutive empty rows) that separates it from the wordmark below, then
# find the bounding box of opaque pixels strictly within that band. ----
$src = [System.Drawing.Bitmap]::FromFile($source)
$w = $src.Width
$h = $src.Height
$step = 2

$rowHasContent = @{}
for ($y = 0; $y -lt $h; $y += $step) {
    $found = $false
    for ($x = 0; $x -lt $w; $x += $step) {
        if ($src.GetPixel($x, $y).A -gt 12) { $found = $true; break }
    }
    $rowHasContent[$y] = $found
}

$rows = $rowHasContent.Keys | Sort-Object
$markStarted = $false
$gapCount = 0
$gapThreshold = 8  # consecutive empty sampled rows (16px) = real gap, not just a thin stroke
$markEndY = $h
foreach ($y in $rows) {
    if ($rowHasContent[$y]) {
        $markStarted = $true
        $gapCount = 0
    } elseif ($markStarted) {
        $gapCount++
        if ($gapCount -ge $gapThreshold) {
            $markEndY = $y - ($gapCount * $step)
            break
        }
    }
}

$minX = $w; $maxX = 0; $minY = $markEndY; $maxY = 0
for ($y = 0; $y -lt $markEndY; $y += $step) {
    for ($x = 0; $x -lt $w; $x += $step) {
        $a = $src.GetPixel($x, $y).A
        if ($a -gt 12) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$pad = 6
$minX = [Math]::Max(0, $minX - $pad)
$minY = [Math]::Max(0, $minY - $pad)
$maxX = [Math]::Min($w - 1, $maxX + $pad)
$maxY = [Math]::Min($markEndY - 1, $maxY + $pad)
$cropW = $maxX - $minX
$cropH = $maxY - $minY

$markBmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($markBmp)
$g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)), (New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$markBmp.Save($markOut, [System.Drawing.Imaging.ImageFormat]::Png)
$src.Dispose()
Write-Output "Cropped mark: ${cropW}x${cropH} -> $markOut"

# ---- Step 2: composite the cropped mark onto a solid dark square for the
# PWA manifest icons (opaque background required for reliable OS rendering). ----
function New-AppIcon {
    param([int]$Size, [string]$OutPath)

    $canvas = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $bg = [System.Drawing.Color]::FromArgb(255, 10, 10, 12) # --bg
    $g.Clear($bg)

    $mark = [System.Drawing.Image]::FromFile($markOut)
    # keep the mark inside ~62% of the canvas (Android maskable safe-zone padding)
    $targetW = [int]($Size * 0.62)
    $scale = $targetW / $mark.Width
    $targetH = [int]($mark.Height * $scale)
    $destX = [int](($Size - $targetW) / 2)
    $destY = [int](($Size - $targetH) / 2)
    $g.DrawImage($mark, $destX, $destY, $targetW, $targetH)

    $canvas.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $mark.Dispose()
    $g.Dispose()
    $canvas.Dispose()
}

New-AppIcon -Size 512 -OutPath (Join-Path $root "icon-512.png")
New-AppIcon -Size 192 -OutPath (Join-Path $root "icon-192.png")
Write-Output "Icons regenerated from real logo."
