#!/bin/bash
./build.sh
if [[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]]; then
    git status
    echo "---------------------------------------------------------"
    echo "You need to commit all changes first"
    echo "---------------------------------------------------------"
    exit 1
fi
git subtree split --prefix remote-control/ -b gh-pages && git push origin gh-pages:gh-pages && git branch -D gh-pages
open "https://kumar303.github.io/remote-control/"
