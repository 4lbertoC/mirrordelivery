#!/bin/bash

BUILDFOLDER=build
PACKAGE_FILE_NAME=$BUILDFOLDER/package.zip
MAXSIZE=13312

echo "Building Client"
rm -rf $BUILDFOLDER
mkdir $BUILDFOLDER
echo "Compiling..."
java -jar compiler.jar --js scripts/jsfx/audio.js --js scripts/jsfx/jsfx.js --js scripts/jsfx/jsfxlib.js --js scripts/game.js --compilation_level ADVANCED_OPTIMIZATIONS --externs scripts/jsfx/externs.js > $BUILDFOLDER/game.min.js
cp index.html $BUILDFOLDER
cp -R img $BUILDFOLDER
echo "Zipping..."
zip -rq9 $PACKAGE_FILE_NAME $BUILDFOLDER
FILESIZE=$(stat -f "%z" "$PACKAGE_FILE_NAME")
echo "Size of $PACKAGE_FILE_NAME is $FILESIZE bytes ($((100 * $FILESIZE/$MAXSIZE))% of $MAXSIZE bytes). Still $(($MAXSIZE - $FILESIZE)) available."