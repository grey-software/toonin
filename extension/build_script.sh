rm -f build/css/*
rm -f build/js/*
rm -f build/js/lib/*
rm -f build/*
cp src/* build
cp -r src/css/* build/css
cp -r src/js/lib/* build/js/lib
webpack-cli --entry ./src/js/inject/index.js -o build/js/inject.js
webpack-cli --entry ./src/js/background/index.js -o build/js/background.js


