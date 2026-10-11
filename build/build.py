import pathlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
src=ROOT/'src'
css=(src/'style.css').read_text()
js='\n'.join((src/f).read_text() for f in ['core.js','model.js','content.js','howto.js','art_data.js','ui.js','vehicle.js','views.js','views2.js','views3.js','views4.js','twin_data.js','twin_internals.js','twin.js','viewer.js','diag_draw.js','diag_data.js','diag_data2.js','diag.js','chat.js'])
html=f'''<title>GS750 Restoration HQ</title>
<meta name="description" content="Restoration control center for a 1977 Suzuki GS750">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700&family=IBM+Plex+Mono:wght@400;500&family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,600;0,6..12,700;1,6..12,400&display=swap">
<style>
{css}
</style>
<div id="app"></div>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/environments/RoomEnvironment.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/geometries/RoundedBoxGeometry.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/utils/BufferGeometryUtils.js"></script>
<script>
{js}
boot();
</script>
'''
out=ROOT/'public'; out.mkdir(exist_ok=True)
import shutil
shutil.copytree(ROOT/'img', out/'img', dirs_exist_ok=True)
(out/'artifact.html').write_text(html)  # Claude artifact version (the host adds the page skeleton)
# local test wrapper with full document skeleton
(out/'index.html').write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}[hidden]{display:none!important}body{margin:0}img{max-width:100%}</style></head><body>'+html+'</body></html>')
print(len(html))
