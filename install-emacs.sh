#!/usr/bin/env bash
set -e
# Or any directory in the list tree-sitter-load-path
TREE_SITTER_QUERIES=$(emacsclient -e "tree-sitter-langs--queries-dir")
TREE_SITTER_GRAMMAR=$(emacsclient -e "tree-sitter-langs-grammar-dir")
TREE_SITTER_QUERIES=${TREE_SITTER_QUERIES//\"/}oat
TREE_SITTER_GRAMMAR="${TREE_SITTER_GRAMMAR//\"/}"bin/oat.so
tree-sitter generate --abi 13
cd src
gcc -o oat.so -shared parser.c -Os -fPIC
cp -f oat.so "$TREE_SITTER_GRAMMAR"
cd ..
mkdir -p $TREE_SITTER_QUERIES
cp -f queries/highlights.scm "$TREE_SITTER_QUERIES"/highlights.scm
echo "Installed highlight queries in: " "$TREE_SITTER_QUERIES"
echo "Installed grammar in :" "$TREE_SITTER_GRAMMAR"
