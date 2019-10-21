rm -rf build/*
cp -r src/* build
webpack-cli  --config ./webpack.config.js --watch --entry ./src/popup.js -o build/popup.js &
webpack-cli  --config ./webpack.config.js --watch --entry ./src/manifest.json -o build/manifest.json &
webpack-cli  --config ./webpack.config.js --watch --entry ./src/js/background/index.js -o build/js/background/index.js &
echo "Watching over 3 files for changes, popup.js mainfest.json and js/background/index.js, if this is run multiple times you may want to run 'killall' node in the command line"
