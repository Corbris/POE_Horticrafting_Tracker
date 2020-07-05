
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


# Customise your config
DiscordListInclude->hideFunctions input the functions that you dont want to show in the discord formated file, ex ["Reforge","Randomise","Sacrifice"]

DiscordListInclude->hideTypes input the types that you dont want to show in the discord formated file \, ex["non-Cold","non-Fire", "non-Lightning"]

DiscordListInclude->hideTypes hide all crafts the the discord format taht are under this ilevel

DiscordListInclude->price true or false value if you want price to show in the discord formated file

DiscordListInclude->ilevel true or false value if you want the ilevel to show in the discord formated file


price-> defaults will be the used value if the function type is not defined. This also goes for the defaults inside the function blokc. So if reforge is not defined inside it will use the default price. If life is not defined inside the defined Remove function then it will use the default defined inside Remove.

You can add and remove any funtion/type definitions

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

