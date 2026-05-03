# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static HTML landing page for **Nursing Alliance** — a Japanese nursing community focused on operating room nurses. The site is entirely self-contained: all CSS is inlined in `<style>` tags and all images are embedded as base64 data URIs. There are no external dependencies, no build tools, and no JavaScript.

To preview, open either HTML file directly in a browser.

## File Relationship

There are two nearly identical HTML files:

- **`nursing_alliance_v2.html`** — the canonical, corrected version
- **`index.html`** — has two CSS bugs where `.plan-box.free` and `.plan-badge.gold` are rendered as `.[plan-box.free]` and `.[plan-badge.gold]` (invalid CSS from a markdown rendering artifact); also missing a trailing newline

When making changes, edit `nursing_alliance_v2.html` as the source of truth and keep `index.html` in sync (or fix the bugs in `index.html` at the same time).

## Page Structure

Both files share the same layout with alternating navy/white section backgrounds:

| Section | CSS class | Content |
|---|---|---|
| NAV | `.nav` | Sticky dark-navy navbar with logo, links, Instagram icon, registration CTA |
| HERO | `.hero` | Full-width hero with base64 background image |
| Section 1 | `.sec-navy` | 水パチ webinar info — 4-column `.card-grid` |
| Section 2 | `.sec-lightgray` `#plan` | Membership plan comparison — 2-column `.plan-grid` |
| Section 3 | `.sec-navy` | Community links (LINE, Peatix, Instagram) — 3-column `.community-grid` |
| Section 4 | `.sec-white` | Blog preview — 3-column `.blog-grid` |
| Section 5 | `.sec-navy` | CTA / join prompt |
| Footer | `.footer` | Links and copyright |

## Design Tokens

All colors are hardcoded inline (no CSS variables):

- **Dark navy backgrounds**: `#060f22` (darkest), `#0d2141` (nav/card), `#112a55` (plan/blog cards)
- **Gold accent** (CTAs, highlights): `#c9a84c`
- **Muted text**: `#8aa0c8`, `#ccd6f0`

Responsive breakpoints: `768px` (2-column grids collapse to 1, mobile nav) and `480px` (smaller hero/fonts).

## External Links

The site links to:
- Registration form: `https://forms.gle/ic987XoRMst3GooWA`
- Instagram: `https://www.instagram.com/nursing_alliance`
- LINE group: `https://line.me/ti/g2/y1MkPGzeMsnV_W_1qLpAft2m2LWmGvv97I6gow`
- Peatix: `https://peatix.com`
