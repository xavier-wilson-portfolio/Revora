# Revora

Restoration course, parts tracker, 3D garage and technical diagrams for a 1977 Suzuki GS750.

- `src/` holds the site's code and styles. Every push to `main` rebuilds and republishes the site.
- `img/` holds the illustrations, the home page photo and the video thumbnails.
- `build/build.py` joins everything into `public/index.html` (the website) and `public/artifact.html` (the Claude artifact version).

Build locally with `python build/build.py`, then open `public/index.html`.
