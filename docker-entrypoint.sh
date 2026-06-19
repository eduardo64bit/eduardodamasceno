#!/bin/sh
set -e

# Keep /app/data writable after host-side copies (docker cp, bind mounts, etc.)
chown -R nextjs:nodejs /app/data

exec gosu nextjs "$@"
