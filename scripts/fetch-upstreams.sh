#!/usr/bin/env bash
set -euo pipefail

atlas_root="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$atlas_root/.research/upstreams"

fetch_repo() {
  local id="$1" repository="$2" revision="$3"
  local target="$atlas_root/.research/upstreams/$id"
  if [[ -d "$target/.git" ]]; then
    if [[ -n "$(git -C "$target" status --porcelain)" ]]; then
      printf 'Refusing to overwrite changes in %s\n' "$target" >&2
      return 1
    fi
    if [[ "$(git -C "$target" remote get-url origin)" != "https://github.com/$repository.git" ]]; then
      printf 'Unexpected upstream remote in %s\n' "$target" >&2
      return 1
    fi
  else
    git clone --filter=blob:none --no-checkout "https://github.com/$repository.git" "$target"
  fi
  if ! git -C "$target" cat-file -e "$revision^{commit}" 2>/dev/null; then
    git -C "$target" fetch origin "$revision"
  fi
  git -C "$target" checkout --detach "$revision"
  printf '%s %s\n' "$id" "$(git -C "$target" rev-parse HEAD)"
}

while IFS=$'\t' read -r id repository revision; do
  fetch_repo "$id" "$repository" "$revision"
done < <(node -e 'const f=require(process.argv[1]);for(const r of f.repositories)process.stdout.write([r.id,r.repository,r.commit].join("\t")+"\n")' "$atlas_root/research/upstreams.json")
