rm -rf build/*
cp -r src/* build
node html_to_string.js
webpack-cli  --config ./webpack.config.js --watch --entry ./src/js/inject/index.js -o build/js/inject.js &
webpack-cli  --config ./webpack.config.js --watch --entry ./src/js/background/index.js -o build/js/background.js &
echo "done"
