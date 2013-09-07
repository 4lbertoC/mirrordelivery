#!/bin/bash

BUILDFOLDER=build
PACKAGE_FILE_NAME=$BUILDFOLDER/package.zip
MAXSIZE=13312
OUTPUT_WRAPPER='/* MirrorDelivery 1.4.8 http://github.com/4lbertoC/mirrordelivery */%output%'
#OUTPUT_WRAPPER='/*1.4.7 */%output%'

echo "Building Client"
rm -rf $BUILDFOLDER
mkdir $BUILDFOLDER
echo "Compiling..."
java -jar compiler.jar --js scripts/jsfx/audio.js --js scripts/jsfx/jsfx.js --js scripts/jsfx/jsfxlib.js --js scripts/game.js --compilation_level ADVANCED_OPTIMIZATIONS --externs scripts/jsfx/externs.js --output_wrapper "$OUTPUT_WRAPPER" > $BUILDFOLDER/game.min.js
#java -jar compiler.jar --js scripts/jsfx/audio.js --js scripts/jsfx/jsfx.js --js scripts/jsfx/jsfxlib.js --js scripts/game.js --compilation_level ADVANCED_OPTIMIZATIONS --externs scripts/jsfx/externs.js > $BUILDFOLDER/game.min.js
# Remove tabs and new lines from index.html
cat index.html | tr -d '\t\n' > $BUILDFOLDER/index.html
cp imgmap.png $BUILDFOLDER
echo "Zipping..."
zip -rq9 $PACKAGE_FILE_NAME $BUILDFOLDER
FILESIZE=$(stat -f "%z" "$PACKAGE_FILE_NAME")
echo "Size of $PACKAGE_FILE_NAME is $FILESIZE bytes ($((100 * $FILESIZE/$MAXSIZE))% of $MAXSIZE bytes). Still $(($MAXSIZE - $FILESIZE)) available."