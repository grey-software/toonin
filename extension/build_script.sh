rm -rf build/*
cp -r src/* build
webpack-cli  --config ./webpack.config.js --watch --entry ./src/popup.js -o build/popup.js &
webpack-cli  --config ./webpack.config.js --watch --entry ./src/js/background/index.js -o build/js/background.js &
webpack-cli  --config ./webpack.config.js --watch --entry ./src/js/inject/index.js -o build/js/inject.js &
echo "Watching over 3 javascript files for changes, popup.jsand js/background/index.js, if this is run multiple times you may want to run 'killall' node in the command line"
