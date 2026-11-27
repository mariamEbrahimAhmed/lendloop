---
name: stage-change
description: Stage one specific change (e.g. "the theme changes", "the localization setup") with git add — only the files and lines that belong to it, splitting mixed files — then write a descriptive commit message for it and put it in VS Code's Source Control box, without committing. Use when the user asks to git add / stage a particular change, or to prepare a commit for one part of their work.
---

# stage-change

The user names a change ("add the theme changes"). Stage exactly that change,
write a descriptive message for it, and prefill VS Code's Source Control box.
**Never commit or push**; the user commits.

## 1. Look at everything that's changed

```bash
git status --short -uall
git diff --cached --name-status   # already staged
git diff                          # unstaged changes to tracked files
```
Read new (untracked) files that might belong to the change.

**If something unrelated is already staged**, stop and tell the user. Ask
before unstaging anything; it may be a change they staged on purpose.

## 2. Decide what belongs to the change

Sort every changed file into one of three groups:
- **Belongs fully:** every line in it is part of this change.
- **Mixed:** some lines belong, some are other work (e.g. `package.json` adding
  two libraries, a layout file touched by several features).
- **Doesn't belong.**

When it's unclear whether something belongs, ask instead of guessing.

Never stage `.env*` files, keys, or other secrets, even if they look related.

## 3. Stage it

- **Belongs fully:** `git add <paths>`. For a moved or deleted file, stage
  the deletion too (`git add -A <old path> <new path>`).
- **Mixed, separable lines:** stage only the right hunks or lines by building a
  patch with just those lines and applying it to the index:
  ```bash
  git diff <file> > /tmp-or-scratchpad/<file>.patch   # edit to keep only this change's lines,
                                                      # fix the @@ line counts
  git apply --cached <that patch>
  ```
  Then check with `git diff --cached <file>` that exactly the intended lines
  are staged.
- **Mixed, not separable** (e.g. `package-lock.json`, or a line that serves two
  features): don't stage it. List it for the user with what's mixed in, so they
  can decide.

## 4. Check the staged change makes sense on its own

```bash
git diff --cached --stat
git diff --cached
```
- Make sure nothing outside the change slipped in.
- Think about whether the staged set would work on its own: does it import a
  file, package, or route that stays unstaged? If so, say which files it
  depends on, and that the commit won't build alone until they're committed.
  Don't silently stage them.

## 5. Write the message

Descriptive but simple and to the point. Describe **only what's staged**.
- **Subject:** conventional prefix with an optional scope (`feat(theme):`,
  `fix(i18n):`, `chore:`, `refactor:`, `docs:`, `test:`). Pick by what the
  change does (no behaviour change → `refactor:`). Lower-case after the
  prefix, no trailing period, 72 characters at most. It should say what the
  change does on its own.
- **Blank line, then at most 3 bullets**, each one short line (about 50
  characters): the main parts of the change, in plain words.
  - no file names unless they help, no lists of values, no reasons unless
    essential, no filler
  - a small change gets the subject only, with no bullets
- No `Co-Authored-By` or other trailers.

Example:
```
feat(theme): add typography and color tokens

- Font sizes and weights
- Brand palette and light/dark colors
- Replace starter styles in globals.css
```

## 6. Put it in VS Code's Source Control box

```bash
msg="$(git rev-parse --absolute-git-dir)/COMMIT_TEMPLATE_MSG.txt"
cat > "$msg" <<'EOF'
<the full message>
EOF
git config --local commit.template "$msg"
```

VS Code refills the box from `commit.template` after every commit, so a
`post-commit` hook must clear it. Install it only if `.git/hooks/post-commit`
doesn't exist yet. Never overwrite an existing hook; if one exists without
this cleanup, tell the user instead. If `git config core.hooksPath` is set,
skip this and tell the user instead.
```bash
hook="$(git rev-parse --absolute-git-dir)/hooks/post-commit"
[ -e "$hook" ] || {
  printf '%s\n' '#!/bin/sh' \
    '# Clear the prefilled commit message after each commit so the' \
    '# VS Code Source Control box starts empty again.' \
    'git config --local --unset commit.template 2>/dev/null' \
    'rm -f "$(git rev-parse --absolute-git-dir)/COMMIT_TEMPLATE_MSG.txt"' \
    'exit 0' > "$hook"
  chmod +x "$hook"
}
```

## 7. Report

Tell the user:
- what's staged (files, and which lines for partially staged files)
- what related changes were left unstaged and why (mixed or not separable)
- any files the staged change depends on that aren't staged yet
- the message, in a code block
- to click **↻ Refresh** in Source Control if the box is still empty, then commit

## Cleanup

The `post-commit` hook clears the message after each commit. To clear it by
hand (e.g. the user changed their mind):
```bash
git config --local --unset commit.template
rm -f "$(git rev-parse --absolute-git-dir)/COMMIT_TEMPLATE_MSG.txt"
```
