cd client-redesign
npm install
wait
echo "npm on client has installed"
cd ..
cd ./backend
npm install
wait
echo "backend npm installed"
cd ..
cd ./extension
npm install
echo "extension npm installed"
wait
npm run develop
cd ..
echo "Done";
