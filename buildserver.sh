#!/bin/bash

BUILDFOLDER=buildserver
PACKAGE_FILE_NAME=$BUILDFOLDER/package_server.zip
MAXSIZE=13312
OUTPUT_WRAPPER='/* http://github.com/4lbertoC/mirrordelivery */%output%'

echo "Building Server"
rm -rf $BUILDFOLDER
mkdir $BUILDFOLDER
echo "Compiling..."
java -jar compiler.jar --js scripts/server/server.js --compilation_level ADVANCED_OPTIMIZATIONS --externs scripts/jsfx/externs.js --output_wrapper "$OUTPUT_WRAPPER" > $BUILDFOLDER/server.min.js
cp scripts/server/package.json $BUILDFOLDER
cp scripts/server/Procfile $BUILDFOLDER
echo "Zipping..."
zip -rq9 $PACKAGE_FILE_NAME $BUILDFOLDER
FILESIZE=$(stat -f "%z" "$PACKAGE_FILE_NAME")
echo "Size of $PACKAGE_FILE_NAME is $FILESIZE bytes ($((100 * $FILESIZE/$MAXSIZE))% of $MAXSIZE bytes). Still $(($MAXSIZE - $FILESIZE)) available."