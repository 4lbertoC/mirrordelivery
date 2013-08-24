#!/bin/bash

BUILDFOLDER=buildserver
PACKAGE_FILE_NAME=$BUILDFOLDER/package_server.zip
MAXSIZE=13312

echo "Building Server"
rm -rf $BUILDFOLDER
mkdir $BUILDFOLDER
echo "Compiling..."
java -jar compiler.jar --js scripts/server.js --compilation_level ADVANCED_OPTIMIZATIONS --externs scripts/jsfx/externs.js > $BUILDFOLDER/server.min.js
echo "Zipping..."
zip -rq9 $PACKAGE_FILE_NAME $BUILDFOLDER
FILESIZE=$(stat -f "%z" "$PACKAGE_FILE_NAME")
echo "Size of $PACKAGE_FILE_NAME is $FILESIZE bytes ($((100 * $FILESIZE/$MAXSIZE))% of $MAXSIZE bytes). Still $(($MAXSIZE - $FILESIZE)) available."