#!/usr/bin/env python3
"""AETHERWORKS scene-plate checker (dev only; needs python3 + Pillow + numpy).

Checks a candidate background plate against the thresholds in
docs/scene-brief.md. Regions are expressed in full-frame percentages and
already account for the fact that the app shows only the middle ~72% of a
16:9 plate at a typical 1150x900 content column with `background-size: cover`.

Usage:
  python3 tools/check-plate.py path/to/candidate.jpg
  python3 tools/check-plate.py path/to/candidate.jpg --json
"""
from __future__ import annotations

import json
import sys

import numpy as np
from PIL import Image

BRASS = (0xC7, 0x9A, 0x4B)


def rel_lin(c: np.ndarray) -> np.ndarray:
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def luminance(rgb: np.ndarray) -> np.ndarray:
    c = rel_lin(rgb)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def saturation(rgb: np.ndarray) -> np.ndarray:
    mx = rgb.max(-1)
    mn = rgb.min(-1)
    return np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0.0)


def hue(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(-1)
    mn = rgb.min(-1)
    d = np.maximum(mx - mn, 1e-6)
    h = np.zeros_like(mx)
    m = (mx == r) & (mx > mn)
    h[m] = ((g - b)[m] / d[m]) % 6
    m = (mx == g) & (mx > mn)
    h[m] = (b - r)[m] / d[m] + 2
    m = (mx == b) & (mx > mn)
    h[m] = (r - g)[m] / d[m] + 4
    return (h * 60.0) % 360.0


def band(lum: np.ndarray, detail: np.ndarray, box) -> dict:
    y0, y1, x0, x1 = box
    h, w = lum.shape
    sl = (slice(int(y0 * h), int(y1 * h)), slice(int(x0 * w), int(x1 * w)))
    v = lum[sl]
    return {
        "mean": float(v.mean()),
        "p90": float(np.percentile(v, 90)),
        "p99": float(np.percentile(v, 99)),
        "detail": float(detail[sl].mean() * 1000),
    }


def largest_blob(lum: np.ndarray, threshold: float = 0.30) -> float:
    mask = lum > threshold
    if not mask.any():
        return 0.0
    try:
        from scipy import ndimage
    except ImportError:  # coarse fallback: block occupancy
        h, w = lum.shape
        bs = 16
        blocks = mask[: h // bs * bs, : w // bs * bs].reshape(h // bs, bs, w // bs, bs)
        return float(blocks.mean(axis=(1, 3)).max())
    labels, n = ndimage.label(mask, structure=np.ones((3, 3)))
    if n == 0:
        return 0.0
    sizes = np.bincount(labels.ravel())[1:]
    return float(sizes.max() / lum.size)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    path = sys.argv[1]
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    lum = luminance(rgb)
    sat = saturation(rgb)
    hue_ = hue(rgb)
    gy, gx = np.gradient(lum)
    detail = np.hypot(gx, gy)

    cool_visible = ((hue_ >= 175) & (hue_ <= 260) & (sat > 0.35) & (lum > 0.05))
    warm_highlight = ((hue_ >= 10) & (hue_ <= 55) & (sat > 0.25) & (lum > 0.15))

    h, w = lum.shape
    xs = np.arange(w)[None, :].repeat(h, 0)
    mass = lum.sum()
    com_x = float((lum * xs).sum() / mass / (w - 1)) if mass > 0 else 0.5

    m = {
        "frame_mean": float(lum.mean()),
        "frame_p99": float(np.percentile(lum, 99)),
        "frame_p999": float(np.percentile(lum, 99.9)),
        "bright_35_pct": float((lum > 0.35).mean() * 100),
        "largest_blob_pct": largest_blob(lum) * 100,
        "hero": band(lum, detail, (0.13, 0.48, 0.21, 0.79)),
        "composer": band(lum, detail, (0.52, 0.83, 0.26, 0.74)),
        "top_strip": band(lum, detail, (0.00, 0.12, 0.00, 1.00)),
        "left_edge": band(lum, detail, (0.00, 1.00, 0.00, 0.08)),
        "right_edge": band(lum, detail, (0.00, 1.00, 0.92, 1.00)),
        "sat_mean": float(sat.mean()),
        "sat_p90": float(np.percentile(sat, 90)),
        "cool_visible_pct": float(cool_visible.mean() * 100),
        "cool_light_share_pct": float(lum[cool_visible].sum() / max(lum.sum(), 1e-6) * 100),
        "warm_highlight_pct": float(warm_highlight.mean() * 100),
        "warm_light_share_pct": float(lum[warm_highlight].sum() / max(lum.sum(), 1e-6) * 100),
        "com_x": com_x,
    }

    brass_l = 0.2126 * float(rel_lin(np.array(BRASS, dtype=np.float32))[0]) \
        + 0.7152 * float(rel_lin(np.array(BRASS, dtype=np.float32))[1]) \
        + 0.0722 * float(rel_lin(np.array(BRASS, dtype=np.float32))[2])
    cr50 = (brass_l + 0.05) / (m["hero"]["mean"] + 0.05)
    cr90 = (brass_l + 0.05) / (m["hero"]["p90"] + 0.05)

    checks = [
        ("全幅平均亮度", m["frame_mean"], "<=", 0.030),
        ("全幅 p99 亮度", m["frame_p99"], "<=", 0.120),
        ("L>0.35 面积占比 %", m["bright_35_pct"], "<=", 0.15),
        ("最大亮斑占比 %", m["largest_blob_pct"], "<=", 0.80),
        ("标题带 mean L", m["hero"]["mean"], "<=", 0.022),
        ("标题带 p90 L", m["hero"]["p90"], "<=", 0.040),
        ("标题带细节能量", m["hero"]["detail"], "<=", 3.4),
        ("输入区 mean L", m["composer"]["mean"], "<=", 0.035),
        ("输入区细节能量", m["composer"]["detail"], "<=", 3.8),
        ("顶栏条 mean L", m["top_strip"]["mean"], "<=", 0.012),
        ("左边缘 mean L", m["left_edge"]["mean"], "<=", 0.012),
        ("右边缘 mean L", m["right_edge"]["mean"], "<=", 0.012),
        ("平均饱和度", m["sat_mean"], "<=", 0.30),
        ("p90 饱和度", m["sat_p90"], "<=", 0.52),
        ("冷色可见面积 %（175-260°）", m["cool_visible_pct"], "<=", 1.5),
        ("冷色光量占比 %", m["cool_light_share_pct"], "<=", 3.0),
        ("暖高光面积 %", m["warm_highlight_pct"], "<=", 1.2),
        ("暖高光光量占比 %", m["warm_light_share_pct"], "参考", 0),
        ("铜字对比 p50", cr50, ">=", 6.0),
        ("铜字对比 p90", cr90, ">=", 4.5),
    ]

    if "--json" in sys.argv:
        print(json.dumps({"metrics": m, "contrast": {"p50": cr50, "p90": cr90}}, indent=2))
        return 0

    print(f"\n  {path}")
    print(f"  {'指标':<30}{'实测':>10}   {'要求':<10}结果")
    print("  " + "-" * 62)
    failed = 0
    for name, value, op, limit in checks:
        shown = f"{value:.3f}" if abs(value) < 10 else f"{value:.1f}"
        if op == "参考":
            print(f"  {name:<30}{shown:>10}   {'（仅记录）':<10}")
            continue
        ok = value <= limit if op == "<=" else value >= limit
        failed += 0 if ok else 1
        print(f"  {name:<30}{shown:>10}   {op + ' ' + str(limit):<10}{'PASS' if ok else 'FAIL'}")
    print("  " + "-" * 62)
    print(f"  {'全部通过' if failed == 0 else f'{failed} 项不达标'}\n")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
