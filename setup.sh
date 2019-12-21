cd client
npm install
wait
echo "Client dependencies installed!"
cd ..
cd ./backend
npm install
wait
echo "Backend dependencies installed!"
cd ..
cd ./extension
npm install
echo "Extension dependencies installed!"
wait
cd ..
echo "Toonin dev setup complete!";
