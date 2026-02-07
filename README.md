# lapolazzati.com

Personal website for Lapo Lazzati - European Editorial Salon aesthetic.

**Live site:** https://lapolazzati.com
**Repository:** https://github.com/lapolazzati/lapolazzati-com

---

## Design System

**Typography:**
- Display: Playfair Display (editorial headers)
- Body: DM Sans (readable content)
- Code/labels: JetBrains Mono (technical elements)

**Colors:**
- Cream: `#f5f2eb` (background)
- Warm Charcoal: `#1c1917` (text)
- Red: `#c1121f` (accent)

**Aesthetic:** Old books texture, warm tones, editorial refinement

---

## Site Structure

```
/                   — Homepage (portrait, intro, newsletter, contact)
/experience/        — Full CV timeline with metrics
/research/          — Published research and writing
/reading/           — Reading log (books, articles, papers)
```

---

## How to Update Content

### 1. Adding Research/Articles

**Step 1:** Create the article HTML in `/research/`

Example: `research/your-article-title.html`

**Step 2:** Add entry to `research/index.html`:

```html
<a href="/research/your-article-title.html" class="article-card reveal">
    <div class="article-meta">
        <span class="article-date">Feb 2026</span>
        <span class="article-tag">Category</span>
    </div>
    <div class="article-title">Your Article Title</div>
    <p class="article-desc">
        Brief description of what this article covers.
    </p>
    <div class="article-source">Source Name</div>
</a>
```

**Article HTML structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Article Title — Lapo Lazzati</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <!-- Copy nav from research/how-to-build-your-website-final.html -->
    <!-- Copy article structure from that file -->
</body>
</html>
```

### 2. Adding Reading Log Entries

Edit `reading/index.html` and add entries:

```html
<a href="LINK_TO_BOOK_OR_ARTICLE" target="_blank" rel="noopener" class="reading-item reveal">
    <div>
        <div class="reading-title">Book/Article Title</div>
        <div class="reading-author">Author Name</div>
        <div class="reading-note">Your note or key takeaway</div>
    </div>
    <div class="reading-type">Book / Article / Paper</div>
</a>
```

### 3. Updating Experience

Edit `experience/index.html`:

**Current role** (has `current` class):
```html
<div class="exp-item current">
    <div class="exp-period">2024 — PRESENT</div>
    <div class="exp-role">Your Role</div>
    <div class="exp-company">Company Name</div>
    <p class="exp-desc">Description of what you do/built</p>
    <div class="exp-metrics">
        <div class="exp-metric">
            <div class="exp-metric-value">90</div>
            <div class="exp-metric-label">NPS Score</div>
        </div>
    </div>
</div>
```

### 4. Updating Homepage Content

Edit `index.html`:

**Hero intro:** Update the paragraphs under `.hero-intro`

**Newsletter section:** Update description text

**Podcast episodes:** Add new episodes to `.episode-list`:
```html
<li class="episode-item reveal">
    <div class="episode-number">03</div>
    <div>
        <div class="episode-name">Episode Title</div>
        <p class="episode-desc">Brief description</p>
    </div>
</li>
```

---

## Deployment Workflow

### Option 1: Git + Manual Deploy (Current Setup)

**1. Make your changes**

**2. Commit to Git:**
```bash
git add -A
git commit -m "Description of changes"
git push
```

**3. Deploy to Cloudflare:**
```bash
wrangler pages deploy . --project-name lapolazzati-com
```

**4. Verify:**
- Check https://lapolazzati.com (live site)
- Changes appear in 30-60 seconds

### Option 2: Automatic Git Deployment (Alternative)

If you want automatic deployment when you push to Git:

1. Go to Cloudflare dashboard
2. Create **new** Pages project
3. Choose "Connect to Git"
4. Select `lapolazzati/lapolazzati-com` repository
5. Set production branch to `main`
6. Build settings: leave empty (static HTML)
7. Delete old `lapolazzati-com` project
8. Update custom domain to new project

Then you only need to:
```bash
git add -A
git commit -m "Changes"
git push
```

And Cloudflare auto-deploys.

---

## Common Tasks

### Change Colors

Edit `styles.css` at the top:
```css
:root {
    --cream: #f5f2eb;
    --black: #1c1917;
    --red: #c1121f;
    /* etc. */
}
```

### Add New Page

1. Create `new-page/index.html`
2. Copy structure from existing page
3. Update navigation in **all** pages to include new link
4. Keep nav consistent across site

### Optimize Images

Use ImageOptim or similar:
```bash
# Resize large images
sips -Z 1200 image.jpg

# Convert PNG to JPEG for photos
sips -s format jpeg image.png --out image.jpg
```

### Test Locally

```bash
# Simple Python server
python3 -m http.server 8000

# Or Node.js
npx serve .
```

Then open http://localhost:8000

---

## File Organization

```
website/
├── index.html              — Homepage
├── styles.css              — SHARED design system (all pages use this)
├── lapo-portrait.jpg       — Portrait image
├── experience/
│   └── index.html          — CV timeline
├── research/
│   ├── index.html          — Research listing
│   └── *.html              — Individual articles
└── reading/
    └── index.html          — Reading log
```

**Important:** All pages link to `../styles.css` or `./styles.css` for consistent design.

---

## Design Guidelines

### Typography Hierarchy
- H1: 2.6rem, Playfair Display, 700 weight
- H2: 1.6rem, Playfair Display, 600 weight
- Body: 1.05rem, DM Sans, 400 weight
- Labels: 0.7rem, JetBrains Mono, uppercase

### Paragraph Length
- Max 3-4 lines per paragraph
- Newsletter-style: short, scannable
- Use line breaks generously

### Animation Classes
- `.reveal` — Fade in on scroll
- `.stagger-1`, `.stagger-2` — Delayed reveal

### Responsive
- Mobile-first design
- Breakpoint: 640px
- Test on phone before deploying

---

## Useful Commands

```bash
# Check git status
git status

# See recent commits
git log --oneline -5

# Deploy to Cloudflare
wrangler pages deploy . --project-name lapolazzati-com

# Check deployment status
wrangler pages deployment list --project-name lapolazzati-com

# Login to Cloudflare (if needed)
wrangler login
```

---

## Resources

- **Cloudflare Dashboard:** https://dash.cloudflare.com/8d9d4ebb8e4f42b1a53b464138e435d7/pages/view/lapolazzati-com
- **GitHub Repo:** https://github.com/lapolazzati/lapolazzati-com
- **FormSubmit:** https://formsubmit.co (contact form backend)
- **Google Fonts:** https://fonts.google.com (typography)

---

## Contact Form Setup

Uses FormSubmit.co - no backend needed.

Form in `index.html` posts to:
```html
<form action="https://formsubmit.co/lapo.lazzati@gmail.com" method="POST">
```

Messages go directly to your email.

---

*Last updated: February 7, 2026*
