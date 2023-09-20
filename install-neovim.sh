#!/bin/sh

set -e

base="$(pwd)"

neovim_config_dir="$XDG_CONFIG_HOME/nvim"

cd src

gcc -o oat.so -shared parser.c -Os -fPIC

cd "$base"

mkdir -p "$neovim_config_dir/queries/oat"
mkdir -p "$neovim_config_dir/parser"
cp "$base/src/oat.so" "$neovim_config_dir/parser/oat.so"
echo "copied files:" "$neovim_config_dir/parser/oat.so"
cp "$base/queries/"* "$neovim_config_dir/queries/oat"

echo "copied files:"  "$neovim_config_dir/queries/oat"/*

echo "[NOTE]: make sure to set the file type to oat in .oat files"
echo "[NOTE]: for example like this in your init.lua:"
sed -e 's/^/[NOTE]: /' < "$base/editors/nvim/oat.lua"
echo "[NOTE]: (see $base/editors/nvim/oat.lua)"
