@echo off
echo Exporting MongoDB data...

mongoexport --db=sih --collection=users --out=users.json
mongoexport --db=sih --collection=machine1datas --out=machine1datas.json
mongoexport --db=sih --collection=machine2datas --out=machine2datas.json
mongoexport --db=sih --collection=machine3datas --out=machine3datas.json
mongoexport --db=sih --collection=alerts --out=alerts.json

echo Export complete! Files created:
echo - users.json
echo - machine1datas.json
echo - machine2datas.json
echo - machine3datas.json
echo - alerts.json