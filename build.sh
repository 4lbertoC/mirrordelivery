#!/bin/bash

PACKAGE_FILE_NAME=build/package.zip
MAXSIZE=13312

rm -rf build
mkdir build
mkdir tmp
#java -jar compiler.jar --js scripts/jsfx/audio.js --js scripts/jsfx/jsfx.js --js scripts/jsfx/jsfxlib.js --compilation_level SIMPLE_OPTIMIZATIONS > tmp/jsfx.min.js
touch tmp/jsfx.min.js
java -jar compiler.jar --js scripts/jsfx/audio.js --js scripts/jsfx/jsfx.js --js scripts/jsfx/jsfxlib.js --js scripts/game.js --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE --externs scripts/jsfx/externs.js > tmp/game.min.js
cat tmp/jsfx.min.js tmp/game.min.js > build/game.min.js
rm -rf tmp
cp index.html build
cp -R img build
zip -rq9 $PACKAGE_FILE_NAME build
FILESIZE=$(stat -f "%z" "$PACKAGE_FILE_NAME")
echo "Size of $PACKAGE_FILE_NAME is $FILESIZE bytes ($((100 * $FILESIZE/$MAXSIZE))% of $MAXSIZE bytes). Still $(($MAXSIZE - $FILESIZE)) available."