# Adama Tova - Development Workflow

## Branch Strategy

### Main Branches
- `main` - Production-ready code only (DO NOT commit directly)
- `dev` - Integration branch where features merge

### Feature Branches
- `feature/branch-name` - Individual features
- Examples: `feature/auth-setup`, `feature/calendar-view`

## Daily Workflow

### Starting Your Day
```bash
# Get latest changes
git checkout dev
git pull origin dev

# Create or switch to your feature branch
git checkout -b feature/your-feature-name
# or if it exists: git checkout feature/your-feature-name
```

### During Development
```bash
# Check what you changed
git status

# Add your changes
git add .

# Commit with clear message
git commit -m "Add user registration form"

# Push to your feature branch
git push origin feature/your-feature-name
```

### When Feature is Done
1. Push your feature branch
2. Go to GitHub
3. Create Pull Request from your feature → `dev`
4. Ask teammate to review
5. After approval, merge to `dev`
6. Delete feature branch

### Ending Your Day
```bash
# Push your work (even if not done)
git add .
git commit -m "Work in progress: [what you did]"
git push origin feature/your-feature-name
```

## Branch Naming Convention

**Good names:**
- `feature/supabase-setup`
- `feature/user-registration`
- `feature/calendar-weekly-view`
- `feature/admin-activity-crud`

**Bad names:**
- `feature/stuff`
- `nimrod-branch`
- `test`

## Common Commands

### See all branches
```bash
git branch -a
```

### Switch branches
```bash
git checkout branch-name
```

### Pull latest from dev
```bash
git checkout dev
git pull origin dev
```

### Merge dev into your feature (if teammates merged stuff)
```bash
git checkout feature/your-feature
git merge dev
```

## Rules

1. ❌ NEVER commit directly to `main`
2. ❌ NEVER commit directly to `dev` (use feature branches)
3. ✅ ALWAYS create feature branch from `dev`
4. ✅ ALWAYS test before creating Pull Request
5. ✅ Commit often with clear messages
6. ✅ Pull from `dev` daily to stay updated

## Getting Help

- Stuck with Git? Ask in group chat
- Code conflicts? Ask teammate who wrote that code
- Something broke? Check recent commits with `git log`