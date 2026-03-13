@echo off
echo Fixing refresh mode for both data formats...
cd /d C:\Users\tseth\OneDrive\Desktop\isitsafetovisit
git pull --no-edit
copy /Y "%~dp0agent.py" "agent.py"
git add .
git commit -m "Fix refresh mode: handle both old and new city data formats"
git push
echo Done! Refresh runs will work now.
pause
