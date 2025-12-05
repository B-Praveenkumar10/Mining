@echo off
echo Starting MongoDB with network access...
echo Your team can connect using:
echo mongodb://192.168.43.250:27017/sih
echo.
echo Keep this window open while team is working!
echo.
mongod --bind_ip 0.0.0.0 --port 27017