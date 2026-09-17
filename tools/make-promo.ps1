$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$promo = Join-Path $root 'promo'
New-Item -ItemType Directory -Force -Path $promo | Out-Null
$video = Join-Path $promo 'Emberfall-Facebook-Intro.mp4'
$font = 'C\:/Windows/Fonts/seguiemj.ttf'
$filters = @'
[0:v]scale=2160:1350,crop=1920:1080:x='120+38*sin(t*.22)':y='94+18*cos(t*.18)',format=yuv420p,drawbox=x=0:y=0:w=iw:h=ih:color=0x07111ddd:t=fill:enable='between(t,0,3)',drawtext=fontfile=%FONT%:text='EMBERFALL':fontcolor=0xffd892:fontsize=90:x=(w-text_w)/2:y=100:enable='between(t,0,5)',drawtext=fontfile=%FONT%:text='ANH LUA CUOI CUNG':fontcolor=0xffe7b7:fontsize=31:x=(w-text_w)/2:y=204:enable='between(t,0,5)',drawtext=fontfile=%FONT%:text='THU THAP 5 EMBER. DANH THUC CONG CO.':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=h-144:enable='between(t,4,12)',drawtext=fontfile=%FONT%:text='CHOI TREN MAY TINH VA IPHONE':fontcolor=0xffd892:fontsize=40:x=(w-text_w)/2:y=h-96:enable='between(t,12,20)'[v]
'@
$filters = $filters.Replace('%FONT%', $font)
$bed = 'aevalsrc=0.020*sin(2*PI*55*t)+0.012*sin(2*PI*110*t)+0.008*sin(2*PI*(220+18*sin(2*PI*.09*t))*t):s=48000'
& ffmpeg -y -loop 1 -framerate 30 -i (Join-Path $root 'Emberfall-preview.png') -f lavfi -i $bed -filter_complex $filters -map '[v]' -map 1:a -t 20 -c:v libx264 -preset medium -crf 19 -movflags +faststart -c:a aac -b:a 192k $video
& ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 $video
