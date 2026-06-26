#!/usr/bin/env python3
"""Build a self-contained icon font from the line-icon SVG paths.

Why: WeChat Mini Program <image> rendering of base64 SVG is not guaranteed on
older base libraries, while a base64 @font-face iconfont is the rock-solid,
recolour-able (via CSS `color`) standard. This script turns the same SVG art
used by the H5 prototype into a TrueType/woff2 font so icons render identically
on H5 and weapp without any external request or DevTools verification.

Pipeline: SVG-subset parse -> flatten curves/arcs -> stroke buffer (shapely)
-> per-glyph polygon -> TrueType glyf contours (fontTools) -> woff2 -> base64.
Outputs:
  src/assets/iconfont.gen.scss  (@font-face with embedded base64 woff2)
  src/components/iconfont.gen.ts (name -> codepoint char map)

Run: python3 tools/build_iconfont.py
"""
import base64
import math
import re
from pathlib import Path

from shapely.geometry import LineString, Polygon, MultiPolygon
from shapely.ops import unary_union
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

# --- icon source art --------------------------------------------------------
# Each entry: (inner-svg-markup, stroke_width). Geometry is authored on the
# 24x24 viewBox, matching Icon.tsx. Closed sub-paths (ending in Z) are filled
# in the ".solid" variant; every sub-path is always stroked.
ICONS = {
    'brief':       ('<path d="M5 4h11l3 3v13H5z"/><path d="M9 9h7M9 13h7M9 17h4"/>', 1.8),
    'star':        ('<path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z"/>', 1.8),
    'wallet':      ('<rect x="3.5" y="6" width="17" height="13" rx="2.5"/><path d="M3.5 10h17M16 14h1.5"/>', 1.8),
    'bell':        ('<path d="M6.5 9a5.5 5.5 0 0111 0c0 5 2 6 2 6H4.5s2-1 2-6z"/><path d="M10 19a2 2 0 004 0"/>', 1.8),
    'flame':       ('<path d="M12 3c1 3-2 4-2 7a3 3 0 006 .2c0-1.6-1-2.6-1-4 2 1.3 3 3.3 3 5.3a6 6 0 11-12 0c0-3.8 3.5-5.2 6-8.5z"/>', 1.8),
    'chevron':     ('<path d="M9 6l6 6-6 6"/>', 1.8),
    'chevronDown': ('<path d="M6 9l6 6 6-6"/>', 1.8),
    'back':        ('<path d="M15 6l-6 6 6 6"/>', 1.8),
    'plus':        ('<path d="M12 6v12M6 12h12"/>', 1.8),
    'check':       ('<path d="M5 12.5l4 4 10-10"/>', 1.8),
    'bookmark':    ('<path d="M7 4h10v16l-5-3.5L7 20z"/>', 1.8),
    'search':      ('<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>', 1.8),
    'calc':        ('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4"/>', 1.8),
    'arrow':       ('<path d="M5 12h13M13 7l5 5-5 5"/>', 1.8),
    'sparkle':     ('<path d="M12 4l1.6 5L19 11l-5.4 1.6L12 18l-1.6-5.4L5 11l5.4-2z"/>', 1.8),
    'bolt':        ('<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', 1.8),
}

# Icons that are meaningfully filled when used with fill=true (need a .solid glyph).
SOLID = {'star', 'bell', 'flame', 'bookmark', 'sparkle', 'bolt'}

VIEWBOX = 24
UPEM = 1024
SCALE = UPEM / VIEWBOX
CURVE_STEPS = 16
ARC_STEPS = 24


# --- tiny SVG path parser ---------------------------------------------------
_NUM_RE = re.compile(r'[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?')


class _Scanner:
    """Cursor over path data. Knows that arc flags are single 0/1 digits
    even when packed against the next number (e.g. `0111` -> 0, 1, 11)."""

    def __init__(self, d):
        self.s = d
        self.i = 0
        self.n = len(d)

    def _skip(self):
        while self.i < self.n and self.s[self.i] in ' ,\t\r\n':
            self.i += 1

    def eof(self):
        self._skip()
        return self.i >= self.n

    def peek_cmd(self):
        self._skip()
        if self.i < self.n and self.s[self.i].isalpha():
            return self.s[self.i]
        return None

    def cmd(self):
        self._skip()
        c = self.s[self.i]
        self.i += 1
        return c

    def num(self):
        self._skip()
        m = _NUM_RE.match(self.s, self.i)
        if not m:
            raise ValueError(f'expected number at {self.i}: {self.s[self.i:self.i+8]!r}')
        self.i = m.end()
        return float(m.group())

    def flag(self):
        self._skip()
        ch = self.s[self.i]
        self.i += 1
        return 1 if ch == '1' else 0


def _flatten_cubic(p0, p1, p2, p3, n=CURVE_STEPS):
    pts = []
    for i in range(1, n + 1):
        t = i / n
        mt = 1 - t
        x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
        y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def _flatten_quad(p0, p1, p2, n=CURVE_STEPS):
    pts = []
    for i in range(1, n + 1):
        t = i / n
        mt = 1 - t
        x = mt**2 * p0[0] + 2 * mt * t * p1[0] + t**2 * p2[0]
        y = mt**2 * p0[1] + 2 * mt * t * p1[1] + t**2 * p2[1]
        pts.append((x, y))
    return pts


def _arc(p0, rx, ry, phi, large, sweep, p1, n=ARC_STEPS):
    # endpoint -> center parameterization (SVG spec implementation notes)
    if rx == 0 or ry == 0 or p0 == p1:
        return [p1]
    phi = math.radians(phi)
    cos_p, sin_p = math.cos(phi), math.sin(phi)
    dx, dy = (p0[0] - p1[0]) / 2, (p0[1] - p1[1]) / 2
    x1p = cos_p * dx + sin_p * dy
    y1p = -sin_p * dx + cos_p * dy
    rx, ry = abs(rx), abs(ry)
    lam = x1p**2 / rx**2 + y1p**2 / ry**2
    if lam > 1:
        s = math.sqrt(lam)
        rx, ry = rx * s, ry * s
    num = rx**2 * ry**2 - rx**2 * y1p**2 - ry**2 * x1p**2
    den = rx**2 * y1p**2 + ry**2 * x1p**2
    co = math.sqrt(max(0, num / den)) if den else 0
    if large == sweep:
        co = -co
    cxp = co * rx * y1p / ry
    cyp = -co * ry * x1p / rx
    cx = cos_p * cxp - sin_p * cyp + (p0[0] + p1[0]) / 2
    cy = sin_p * cxp + cos_p * cyp + (p0[1] + p1[1]) / 2

    def ang(ux, uy, vx, vy):
        dot = ux * vx + uy * vy
        ln = math.hypot(ux, uy) * math.hypot(vx, vy)
        a = math.acos(max(-1, min(1, dot / ln))) if ln else 0
        if ux * vy - uy * vx < 0:
            a = -a
        return a

    th0 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dth = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not sweep and dth > 0:
        dth -= 2 * math.pi
    elif sweep and dth < 0:
        dth += 2 * math.pi
    pts = []
    for i in range(1, n + 1):
        th = th0 + dth * i / n
        x = cos_p * rx * math.cos(th) - sin_p * ry * math.sin(th) + cx
        y = sin_p * rx * math.cos(th) + cos_p * ry * math.sin(th) + cy
        pts.append((x, y))
    return pts


def parse_path(d):
    """Return list of (points, closed) sub-paths."""
    sc = _Scanner(d)
    cur = (0.0, 0.0)
    start = (0.0, 0.0)
    subs = []
    pts = []
    closed = False
    cmd = None
    prev_cubic_ctrl = None
    prev_quad_ctrl = None

    while not sc.eof():
        nxt = sc.peek_cmd()
        if nxt is not None:
            cmd = sc.cmd()
        elif cmd is None:
            break
        rel = cmd.islower()
        c = cmd.upper()
        if c == 'M':
            if pts:
                subs.append((pts, closed))
            x, y = sc.num(), sc.num()
            if rel:
                x += cur[0]; y += cur[1]
            cur = (x, y); start = cur
            pts = [cur]; closed = False
            cmd = 'l' if rel else 'L'  # subsequent implicit pairs are lineto
        elif c == 'L':
            x, y = sc.num(), sc.num()
            if rel:
                x += cur[0]; y += cur[1]
            cur = (x, y); pts.append(cur)
        elif c == 'H':
            x = sc.num()
            if rel:
                x += cur[0]
            cur = (x, cur[1]); pts.append(cur)
        elif c == 'V':
            y = sc.num()
            if rel:
                y += cur[1]
            cur = (cur[0], y); pts.append(cur)
        elif c == 'C':
            x1, y1, x2, y2, x, y = sc.num(), sc.num(), sc.num(), sc.num(), sc.num(), sc.num()
            if rel:
                x1 += cur[0]; y1 += cur[1]; x2 += cur[0]; y2 += cur[1]; x += cur[0]; y += cur[1]
            pts += _flatten_cubic(cur, (x1, y1), (x2, y2), (x, y))
            prev_cubic_ctrl = (x2, y2); cur = (x, y)
        elif c == 'S':
            x2, y2, x, y = sc.num(), sc.num(), sc.num(), sc.num()
            if rel:
                x2 += cur[0]; y2 += cur[1]; x += cur[0]; y += cur[1]
            x1, y1 = (2 * cur[0] - prev_cubic_ctrl[0], 2 * cur[1] - prev_cubic_ctrl[1]) if prev_cubic_ctrl else cur
            pts += _flatten_cubic(cur, (x1, y1), (x2, y2), (x, y))
            prev_cubic_ctrl = (x2, y2); cur = (x, y)
        elif c == 'Q':
            x1, y1, x, y = sc.num(), sc.num(), sc.num(), sc.num()
            if rel:
                x1 += cur[0]; y1 += cur[1]; x += cur[0]; y += cur[1]
            pts += _flatten_quad(cur, (x1, y1), (x, y))
            prev_quad_ctrl = (x1, y1); cur = (x, y)
        elif c == 'T':
            x, y = sc.num(), sc.num()
            if rel:
                x += cur[0]; y += cur[1]
            x1, y1 = (2 * cur[0] - prev_quad_ctrl[0], 2 * cur[1] - prev_quad_ctrl[1]) if prev_quad_ctrl else cur
            pts += _flatten_quad(cur, (x1, y1), (x, y))
            prev_quad_ctrl = (x1, y1); cur = (x, y)
        elif c == 'A':
            rx, ry, rot = sc.num(), sc.num(), sc.num()
            large, sweep = sc.flag(), sc.flag()
            x, y = sc.num(), sc.num()
            if rel:
                x += cur[0]; y += cur[1]
            pts += _arc(cur, rx, ry, rot, large, sweep, (x, y))
            cur = (x, y)
        elif c == 'Z':
            closed = True
            pts.append(start)
            cur = start
        if c not in ('C', 'S'):
            prev_cubic_ctrl = None
        if c not in ('Q', 'T'):
            prev_quad_ctrl = None
    if pts:
        subs.append((pts, closed))
    return subs


def parse_shape(markup):
    """Parse the icon inner-markup into a list of (points, closed) sub-paths."""
    subs = []
    for m in re.finditer(r'<(path|circle|rect)\b([^>]*)>', markup):
        tag, attrs = m.group(1), m.group(2)
        if tag == 'path':
            d = re.search(r'd="([^"]*)"', attrs).group(1)
            subs += parse_path(d)
        elif tag == 'circle':
            cx = float(re.search(r'cx="([^"]*)"', attrs).group(1))
            cy = float(re.search(r'cy="([^"]*)"', attrs).group(1))
            rr = float(re.search(r'r="([^"]*)"', attrs).group(1))
            pts = [(cx + rr * math.cos(2 * math.pi * k / 48), cy + rr * math.sin(2 * math.pi * k / 48)) for k in range(49)]
            subs.append((pts, True))
        elif tag == 'rect':
            x = float(re.search(r'x="([^"]*)"', attrs).group(1))
            y = float(re.search(r'y="([^"]*)"', attrs).group(1))
            w = float(re.search(r'width="([^"]*)"', attrs).group(1))
            h = float(re.search(r'height="([^"]*)"', attrs).group(1))
            rxm = re.search(r'rx="([^"]*)"', attrs)
            rad = float(rxm.group(1)) if rxm else 0
            subs.append((_round_rect(x, y, w, h, rad), True))
    return subs


def _round_rect(x, y, w, h, rad):
    rad = min(rad, w / 2, h / 2)
    if rad <= 0:
        return [(x, y), (x + w, y), (x + w, y + h), (x, y + h), (x, y)]
    pts = []
    corners = [
        (x + w - rad, y + rad, -math.pi / 2, 0),       # TR
        (x + w - rad, y + h - rad, 0, math.pi / 2),    # BR
        (x + rad, y + h - rad, math.pi / 2, math.pi),  # BL
        (x + rad, y + rad, math.pi, 3 * math.pi / 2),  # TL
    ]
    for cx, cy, a0, a1 in corners:
        for k in range(9):
            a = a0 + (a1 - a0) * k / 8
            pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    pts.append(pts[0])
    return pts


# --- geometry -> glyph ------------------------------------------------------
def build_geometry(markup, stroke_w, solid):
    subs = parse_shape(markup)
    geoms = []
    half = stroke_w / 2
    for pts, closed in subs:
        if len(pts) >= 2:
            line = LineString(pts)
            geoms.append(line.buffer(half, cap_style=1, join_style=1, resolution=8))
        if solid and closed and len(pts) >= 3:
            try:
                poly = Polygon(pts)
                if not poly.is_valid:
                    poly = poly.buffer(0)
                geoms.append(poly)
            except Exception:
                pass
    return unary_union(geoms)


def _ring_to_contour(coords, pen, first):
    # y is flipped (SVG y-down -> font y-up), scaled into the em.
    coords = list(coords)
    if coords[0] == coords[-1]:
        coords = coords[:-1]
    if first:
        pen.moveTo((coords[0][0] * SCALE, (VIEWBOX - coords[0][1]) * SCALE))
    else:
        pen.moveTo((coords[0][0] * SCALE, (VIEWBOX - coords[0][1]) * SCALE))
    for (px, py) in coords[1:]:
        pen.lineTo((px * SCALE, (VIEWBOX - py) * SCALE))
    pen.closePath()


def geom_to_glyph(geom):
    pen = TTGlyphPen(None)
    polys = []
    if isinstance(geom, Polygon):
        polys = [geom]
    elif isinstance(geom, MultiPolygon):
        polys = list(geom.geoms)
    for poly in polys:
        _ring_to_contour(poly.exterior.coords, pen, True)
        for interior in poly.interiors:
            _ring_to_contour(interior.coords, pen, False)
    return pen.glyph()


# --- assemble font ----------------------------------------------------------
def main():
    here = Path(__file__).resolve().parent.parent  # frontend/
    glyphs = {'.notdef': TTGlyphPen(None).glyph()}
    cmap = {}
    char_map = {}  # name -> {o: cp, s: cp}
    cp = 0xE000
    advance = UPEM

    names = ['.notdef']
    for name, (markup, sw) in ICONS.items():
        outline = build_geometry(markup, sw, solid=False)
        gname = f'icon_{name}'
        glyphs[gname] = geom_to_glyph(outline)
        cmap[cp] = gname
        names.append(gname)
        entry = {'o': cp}
        cp += 1
        if name in SOLID:
            sgeom = build_geometry(markup, sw, solid=True)
            sgname = f'icon_{name}_solid'
            glyphs[sgname] = geom_to_glyph(sgeom)
            cmap[cp] = sgname
            names.append(sgname)
            entry['s'] = cp
            cp += 1
        else:
            entry['s'] = entry['o']
        char_map[name] = entry

    fb = FontBuilder(UPEM, isTTF=True)
    fb.setupGlyphOrder(names)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    metrics = {n: (advance, 0) for n in names}
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=UPEM, descent=0)
    fb.setupNameTable({'familyName': 'appicon', 'styleName': 'Regular'})
    fb.setupOS2(sTypoAscender=UPEM, sTypoDescender=0, usWinAscent=UPEM, usWinDescent=0)
    fb.setupPost()

    out_ttf = here / 'tools' / 'appicon.ttf'
    fb.save(str(out_ttf))

    # woff2 flavor for a compact base64 payload
    fb.font.flavor = 'woff2'
    out_woff2 = here / 'tools' / 'appicon.woff2'
    fb.font.save(str(out_woff2))
    b64 = base64.b64encode(out_woff2.read_bytes()).decode()

    scss = (
        "/* GENERATED by tools/build_iconfont.py — do not edit by hand.\n"
        " * Self-contained icon font (base64 woff2). Works on H5 and WeChat MP\n"
        " * without any network request; recolour via CSS `color`. */\n"
        "@font-face {\n"
        "  font-family: 'appicon';\n"
        "  font-style: normal;\n"
        "  font-weight: normal;\n"
        f"  src: url('data:font/woff2;charset=utf-8;base64,{b64}') format('woff2');\n"
        "}\n"
        ".appicon {\n"
        "  font-family: 'appicon' !important;\n"
        "  font-style: normal;\n"
        "  font-weight: normal;\n"
        "  font-variant: normal;\n"
        "  text-transform: none;\n"
        "  line-height: 1;\n"
        "  -webkit-font-smoothing: antialiased;\n"
        "  -moz-osx-font-smoothing: grayscale;\n"
        "}\n"
    )
    (here / 'src' / 'assets').mkdir(parents=True, exist_ok=True)
    (here / 'src' / 'assets' / 'iconfont.gen.scss').write_text(scss)

    lines = [
        '// GENERATED by tools/build_iconfont.py — do not edit by hand.',
        '// Maps each icon name to its private-use codepoint char.',
        '// `o` = outline glyph, `s` = solid (filled) glyph.',
        'export interface GlyphPair { o: string; s: string }',
        'export const GLYPHS: Record<string, GlyphPair> = {',
    ]
    for name, e in char_map.items():
        o = f"\\u{e['o']:04x}"
        s = f"\\u{e['s']:04x}"
        lines.append(f"  {name}: {{ o: '{o}', s: '{s}' }},")
    lines.append('}')
    (here / 'src' / 'components' / 'iconfont.gen.ts').write_text('\n'.join(lines) + '\n')

    print(f'glyphs: {len(names) - 1}  woff2: {len(b64)} b64 chars (~{len(out_woff2.read_bytes())//1024}KB)')
    print(f'wrote: {out_woff2.name}, {out_ttf.name}, src/assets/iconfont.gen.scss, src/components/iconfont.gen.ts')


if __name__ == '__main__':
    main()
