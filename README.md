

# POE_Horticrafting_Tracker
Will scan your stash every 120 seconds finding all Horticrafting Station's and their crafts. Will format into a file for records and a file formatted for discord trading. 

[Expected list of crafts](https://github.com/Corbris/POE_Horticrafting_Tracker/blob/master/REPORTS/CraftList.txt)

[List formated for discord](https://github.com/Corbris/POE_Horticrafting_Tracker/blob/master/REPORTS/CraftList_Discord.txt)

# How to install
https://github.com/Corbris/POE_Horticrafting_Tracker/releases
Download and extract to a folder. Run the exectulable based on your os.

# Setup
Open the config.json file and enter your poe accountName and your POESESSID.

Your POESESSID is a cookie used to logingto https://www.pathofexile.com/. Find it by using your browsers dev tools and locating it under cookies.

You can change the path of the report files to anywhere on your pc. Keep in mind this is relative to the project folders location.


# Customise your config
`tabIndexToSearch` this will only fetch the given tab by index. Blank will fetch all tabs, ex `[1,2,3,4,10,12,13]`

`tabNameToSearch` this will only fetch the given tab by its name. Blank will fetch all tabs, ex `["$", "Div Cards", "sell"]`

`DiscordListInclude->hideFunctions` input the functions that you dont want to show in the discord formated file, ex `["Reforge","Randomise","Sacrifice"]`

`DiscordListInclude->hideTypes` input the types that you dont want to show in the discord formated file, ex  `["non-Cold","non-Fire", "non-Lightning"]`

`DiscordListInclude->hideTypes` hide all crafts the the discord format taht are under this ilevel

`DiscordListInclude->price` true or false value if you want price to show in the discord formatted file

price->defaults will be the used value if the function type is not defined. This also goes for the defaults inside the function block. So if reforge is not defined inside it will use the default price. If life is not defined inside the defined Remove function then it will use the default defined inside Remove.

You can add and remove any function/type definitions

`API_limit_Delay_ms` this is the delay between fetching each tab(if over 43 tabs) due to POE API rate limits. I would not go below 1400ms

`updateRate_ms` this is the delay updating the lists. I would not go under 60000ms unless you have/are targeting very few stash tabs. Only 43 tabs can be fetch every 60sec.

# crafts.json
Some random crafts are not defined in the crafts.json If the craft is not found then it will fall under the "Others" category.

You can add/update/remove any crafts to the crafts.json file. The function and type is what the price list will reference in the config.json So you can define new crafts into the crafts.json and add a price to them via the function and type properties. 


# How to run
Run the executable in the project folder for your os.

this will fetch your stash every 120 seconds and create an organized text list of all your different harvest crafts

leave this bash window open as long as you want to be updated the files.

close by ctrl-c or just closing the window

Using a text editor such as notePadd++ will allow you to leave the file open and refresh on change.


# ToDo
~~Improve the install and run procedure.~~ Done in v1.0.0 release

~~The API calls could be in Parallel.~~ Done in v2.0.0

Better formatting, and more options via config. 

Would be nice to see the stash and position. 

