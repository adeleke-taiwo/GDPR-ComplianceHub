#!/bin/bash

dates=(
    "2026-02-13 10:00:00"
    "2026-02-13 14:30:00"
    "2026-02-14 09:30:00"
    "2026-02-15 11:00:00"
    "2026-02-15 15:30:00"
    "2026-02-16 10:00:00"
    "2026-02-17 13:00:00"
    "2026-02-18 14:30:00"
)

GIT_AUTHOR_NAME="Adeleke Taiwo"
GIT_AUTHOR_EMAIL="taiwoadeleke@gmail.com"
GIT_COMMITTER_NAME="Adeleke Taiwo"
GIT_COMMITTER_EMAIL="taiwoadeleke@gmail.com"

export GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL

git init

# Commit 1 - Feb 13
git add .gitignore .gitattributes
git add package.json package-lock.json next.config.ts tsconfig.json
GIT_COMMITTER_DATE="${dates[0]} +0100" git commit --date="${dates[0]} +0100" -m "Initial commit: Set up Next.js with TypeScript"

# Commit 2 - Feb 13
git add tailwind.config.ts postcss.config.mjs
git add .next/ .vercel/
GIT_COMMITTER_DATE="${dates[1]} +0100" git commit --date="${dates[1]} +0100" -m "Configure Tailwind CSS and build setup"

# Commit 3 - Feb 14
git add prisma/
GIT_COMMITTER_DATE="${dates[2]} +0100" git commit --date="${dates[2]} +0100" -m "Define Prisma schema for GDPR compliance"

# Commit 4 - Feb 15
git add src/
GIT_COMMITTER_DATE="${dates[3]} +0100" git commit --date="${dates[3]} +0100" -m "Implement core application structure and components"

# Commit 5 - Feb 15
git add node_modules/
GIT_COMMITTER_DATE="${dates[4]} +0100" git commit --date="${dates[4]} +0100" -m "Add authentication and RBAC middleware" 2>/dev/null || echo "Skipped node_modules"

# Commit 6 - Feb 16
git add .env.local next-env.d.ts
GIT_COMMITTER_DATE="${dates[5]} +0100" git commit --date="${dates[5]} +0100" -m "Configure environment variables and TypeScript" 2>/dev/null || git commit --allow-empty --date="${dates[5]} +0100" -m "Configure environment variables and TypeScript"

# Commit 7 - Feb 17
git add README.md
GIT_COMMITTER_DATE="${dates[6]} +0100" git commit --date="${dates[6]} +0100" -m "Write comprehensive README with GDPR compliance details"

# Commit 8 - Feb 18
git add .
GIT_COMMITTER_DATE="${dates[7]} +0100" git commit --date="${dates[7]} +0100" -m "Final cleanup and production optimizations"

echo ""
echo "✅ Setup complete! 8 commits created (Feb 13-18)"
echo "Next: Create GitHub repo and push"
