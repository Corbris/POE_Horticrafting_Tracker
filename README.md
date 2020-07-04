
# POE_Horticrafting_Tracker
Will scan your stash every 30 seconds finding all Horticrafting Station's and their crafts. Will format into a file for records and a file formatted for discord trading.
This uses node and can only be ran from CLI at this point.

[Expected list of crafts](https://github.com/Corbris/POE_Horticrafting_Tracker/blob/master/REPORTS/CraftList.txt)
[List formated for discord](https://github.com/Corbris/POE_Horticrafting_Tracker/blob/master/REPORTS/CraftList_Discord.txt)

# How to install
Just clone the repo to any folder on your pc

# Setup
Open the config.json file and enter your poe accountName and your POESESSID.
Your POESESSID is a cookie used to logingto https://www.pathofexile.com/. Find it by using your browsers dev tools and locating it under cookies.
You can change the path of the report files to anywhere on your pc. Keep in mind this is relative to the project folders location.

# How to run
open any bash/cmd in the project file and run "node POE_Horticrafting_Tracker.js"
this will fetch your stash every 30 seconds and create an organized text list of all your different harvest crafts
leave this bash window open as long as you want to be updated the files.
close by ctrl-c or just closing the window

# I dont have node!
dowload and install it here https://nodejs.org/en/download/

# ToDo
Improve the install and run procedure.
The API calls could be in Parallel.
Better formatting, and more options via config.
Would be nice to see the stash and position.
