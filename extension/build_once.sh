rm -rf build/*
cp -r src/* build
webpack-cli  --config ./webpack.config.js --entry ./src/popup.js -o build/popup.js &
webpack-cli  --config ./webpack.config.js --entry ./src/js/background/index.js -o build/js/background.js &
webpack-cli  --config ./webpack.config.js --entry ./src/js/inject/index.js -o build/js/inject.js &
