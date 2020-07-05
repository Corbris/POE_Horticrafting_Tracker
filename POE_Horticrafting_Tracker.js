const https = require('https');
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
//let config = require("./config.json");
let RAWconfig = fs.readFileSync('./config.json');
let config = JSON.parse(RAWconfig);

let numberOfTabs=1;
let horticraftItems=[];
let flatCraftList=[];
let GroupsCraftList=[];


function getStashes(tab){
    //will get a single stash and look for Horticrafting Stations adding them to a list.
    return new Promise((resolve, reject) => {
        let options = {
            host: 'www.pathofexile.com',
            method: 'GET',
            path: `/character-window/get-stash-items?league=Harvest&tabs=1&tabIndex=${tab}&accountName=${config.accountName}`,
            headers: {
                'Content-Type': '*',
                'Cookie': `POESESSID=${config.POESESSID}`
            },
        };
        
        let req = https.request(options, (resp) => {
        let data = '';
        
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            data = JSON.parse(data);
            numberOfTabs = data.numTabs?data.numTabs:numberOfTabs;
            if(data.items){
                data.items.forEach(item => {
                    if(item.typeLine == "Horticrafting Station"){
                        horticraftItems.push(item);
                    }
                });
            }
            resolve("item");
        });
        
        }).on("error", (err) => {
            console.log("Error: " + err.message);
            resolve("error");
        });

        req.end();
    });
}

async function getALLhorticraftItems(){
    //wait to get the list of all horticraftItems;
    horticraftItems=[];
    flatCraftList=[];
    GroupsCraftList=[];
    console.log("fetching tabs");
    for(let i=0; i<numberOfTabs; i++){
        console.log(i);
        let x = await getStashes(i);
    }

    //for each item.
    forEachCraft();
}

function forEachCraft(){
    horticraftItems.forEach(item => {
        if(item.craftedMods){
            item.craftedMods.forEach(craft => {
                createCraftStructs(craft);
            });
        }
    });

    //global lists of crafts was made

    group();
    humanList();
    discordList();
    console.log("Updated at: " + moment().format("DD-MM-YYYY h:mm:ss"));
        

}

function createCraftStructs(craft){
    //format the crafts into objects.
    let formatting = craft.match(/\{(.*?)\}/g);
    let thisCraft = {};
    switch(formatting[0].substring(1, formatting[0].length-1)) {
        case "Remove":
          if(formatting[2]){
            thisCraft.function ="Remove/Add";
            thisCraft.remove_type = formatting[1] ? formatting[1].substring(1, formatting[1].length-1) : "";
            thisCraft.Grouptype = thisCraft.remove_type;
            thisCraft.add_type = formatting[3] ? formatting[3].substring(1, formatting[3].length-1) : "";
            thisCraft.ilevel = craft.match(/\([0-9]*\)/g,'').toString().replace(/[()]/g,'');
            thisCraft.price = getPriceFromConfig(thisCraft.function, thisCraft.add_type);
            thisCraft.lucky = craft.indexOf("Lucky")>-1 ? true : false;
            thisCraft.text= craft;
            thisCraft.cleanedtext= craft.replace(/\<white\>/g,'').replace(/[{}]/g,'');
            thisCraft.discrodtext= thisCraft.lucky? `Remove **${thisCraft.remove_type}** add **Lucky** **${thisCraft.add_type}**` : `Remove **${thisCraft.remove_type}** add **${thisCraft.add_type}**`;
            thisCraft.discrodtext = getDiscordStringFromConfig(thisCraft.function, thisCraft.remove_type, thisCraft.ilevel, thisCraft.price, thisCraft.discrodtext);
          }
          else{
            thisCraft.function ="Remove";
            thisCraft.remove_type = formatting[1] ? formatting[1].substring(1, formatting[1].length-1) : "";
            thisCraft.Grouptype = thisCraft.remove_type;
            thisCraft.ilevel = craft.match(/\([0-9]*\)/g,'').toString().replace(/[()]/g,'');
            thisCraft.price = getPriceFromConfig(thisCraft.function, thisCraft.remove_type);
            thisCraft.lucky = craft.indexOf("Lucky")>-1 ? true : false;
            thisCraft.text=craft;
            thisCraft.cleanedtext= craft.replace(/\<white\>/g,'').replace(/[{}]/g,'');
            thisCraft.discrodtext= `Remove **${thisCraft.remove_type}**`
            thisCraft.discrodtext = getDiscordStringFromConfig(thisCraft.function, thisCraft.remove_type, thisCraft.ilevel, thisCraft.price, thisCraft.discrodtext);
          }
          break;
        case "Change":
            thisCraft.function ="Change";
            thisCraft.change_type = formatting[1] ? formatting[1].substring(1, formatting[1].length-1) : "";
            thisCraft.Grouptype = thisCraft.change_type;
            thisCraft.change_end_type = formatting[2] ? formatting[2].substring(1, formatting[2].length-1) : "";
            thisCraft.ilevel = craft.match(/\([0-9]*\)/g,'').toString().replace(/[()]/g,'');
            thisCraft.price = getPriceFromConfig(thisCraft.function, thisCraft.change_type);
            thisCraft.lucky = craft.indexOf("Lucky")>-1 ? true : false;
            thisCraft.text=craft;
            thisCraft.cleanedtext= craft.replace(/\<white\>/g,'').replace(/[{}]/g,'');
            thisCraft.discrodtext= `Change **${thisCraft.change_type}** to **${thisCraft.change_end_type}**`
            thisCraft.discrodtext = getDiscordStringFromConfig(thisCraft.function, thisCraft.change_type, thisCraft.ilevel, thisCraft.price, thisCraft.discrodtext);
          break;
        case "Augment":
            thisCraft.function ="Augment";
            thisCraft.augment_type = formatting[1] ? formatting[1].substring(1, formatting[1].length-1) : "";
            console.log(craft);
            thisCraft.Grouptype = thisCraft.augment_type;
            thisCraft.ilevel = craft.match(/\([0-9]*\)/g,'').toString().replace(/[()]/g,'');
            thisCraft.price = getPriceFromConfig(thisCraft.function, thisCraft.augment_type);
            thisCraft.lucky = craft.indexOf("Lucky")>-1 ? true : false;
            thisCraft.text=craft;
            thisCraft.cleanedtext= craft.replace(/\<white\>/g,'').replace(/[{}]/g,'');
            thisCraft.discrodtext= thisCraft.lucky? `Augment **Lucky** **${thisCraft.augment_type}**` : `Augment **${thisCraft.augment_type}**`;
            thisCraft.discrodtext = getDiscordStringFromConfig(thisCraft.function, thisCraft.augment_type, thisCraft.ilevel, thisCraft.price, thisCraft.discrodtext);
          break;
        default:
            thisCraft.function = formatting[0].substring(1, formatting[0].length-1);
            thisCraft.arguments = formatting.slice(1, formatting.length);
            thisCraft.Grouptype = thisCraft.arguments[0];
            thisCraft.ilevel = craft.match(/\([0-9]*\)/g,'').toString().replace(/[()]/g,'');
            thisCraft.price = getPriceFromConfig(thisCraft.function, thisCraft.Grouptype);
            thisCraft.lucky = craft.indexOf("Lucky")>-1 ? true : false;
            thisCraft.text=craft;
            thisCraft.cleanedtext= craft.replace(/\<white\>/g,'').replace(/[{}]/g,'');
            thisCraft.discrodtext= craft.replace(/\<white\>/g,'').replace(/[{}]/g,'**').replace(/\([0-9]*\)/g,'');
            thisCraft.discrodtext = getDiscordStringFromConfig(thisCraft.function, thisCraft.Grouptype, thisCraft.ilevel, thisCraft.price, thisCraft.discrodtext);
    }
    flatCraftList.push(thisCraft);
}

function getPriceFromConfig(functionType, type){
    if(config.price){
        if(config.price[functionType]){
            if(config.price[functionType][type]){
                return(config.price[functionType][type]);
            }
            return(config.price[functionType].default);
        }
        else{
            return(config.price.default);
        }
    }
    else{
        return("");
    }
}

function getDiscordStringFromConfig(functionType, type, ilevel, price, defaultString, lucky){
    let discrodtext = "";
    if(config.DiscordListInclude){
        if(config.DiscordListInclude.hideFunctions.includes(functionType)){
            return discrodtext;
        }
        if(config.DiscordListInclude.hideTypes.includes(type)){
            return discrodtext;
        }
        if(config.DiscordListInclude.hideIlevleUnder > ilevel){
            return discrodtext;
        }

        discrodtext = defaultString;
        if(config.DiscordListInclude.ilevel == true){
            discrodtext +=` i${ilevel}`;
        }
        if(config.DiscordListInclude.price == true){
            discrodtext +=` *-${price}*`;
        }
        return discrodtext;
    }
}


function group(){
    //group/sort crafts.
    GroupsCraftList = _.groupBy(flatCraftList, 'function');
    Object.keys(GroupsCraftList).forEach(craftType => {
        GroupsCraftList[craftType].sort((a, b) =>  {
            if(a.Grouptype == b.Grouptype){
                return (a.ilevel < b.ilevel) ? 1: -1;
            }
            else return (a.Grouptype > b.Grouptype) ? 1 : -1
        });
    });

}

function humanList(){
    //last of all crafts
    let humanString="";
    Object.keys(GroupsCraftList).forEach(craftType => {
        humanString+='\n\n'+craftType+'\n';
        GroupsCraftList[craftType].forEach(craft => {
            humanString+=craft.cleanedtext+'\n';
        })
    });
    if(humanString.length>0){
        fs.writeFile(config.craftListPath, humanString, function (err) {
            if (err) return console.log(err);
        });
    }
}
function discordList(){
    let lastdiscordString="";
    let count=1;
    let discordString=`[HSC]  IGN: @${config.accountName}`;
    //discord markdown and marking multiples.

    //filter the empty 
    Object.keys(GroupsCraftList).forEach(craftType => {
        GroupsCraftList[craftType] = GroupsCraftList[craftType].filter(craft => {
            if(craft.discrodtext) return craft;
        });

        if(GroupsCraftList[craftType].length==0) delete GroupsCraftList[craftType];
    });
    
    Object.keys(GroupsCraftList).forEach(craftType => {
        if(!config.DiscordListInclude.hideFunctions.includes(craftType))discordString+='\n\n'+`**${craftType}**\n`;

        GroupsCraftList[craftType].forEach(function(craft, index){
            if(craft.discrodtext){
                console.log(craft.discrodtext);
                if(lastdiscordString == craft.discrodtext){
                    count++;
                    if(index == GroupsCraftList[craftType].length-1){
                        console.log("END OF GROUP");
                        discordString+=lastdiscordString;
                        discordString+= count>1 ? ` -x${count}\n` : '\n';
                        count=1;
                    }
                }
                else{
                    if(lastdiscordString){
                        discordString+= lastdiscordString;
                        discordString+= count>1 ? ` -x${count}\n` : '\n';
                    }

                    if(index == GroupsCraftList[craftType].length-1){
                        console.log("END OF GROUP");
                        discordString+=craft.discrodtext+'\n';
                        count=1;
                    }
                    count=1;
                }
                lastdiscordString=craft.discrodtext;
            }
            else{
                numberOfCrafts--;
            }
        })
        lastdiscordString="";
    });
    if(discordString.length>0){
        fs.writeFile(config.DiscordCraftListPath, discordString, function (err) {
            if (err) return console.log(err);
        });
    }
}

if (!fs.existsSync(config.DiscordCraftListPath)){
    fs.mkdir(config.DiscordCraftListPath.substring(0,config.DiscordCraftListPath.lastIndexOf("/")+1), { recursive: true }, (err) => {
        if (err) throw err;
    });
}

if (!fs.existsSync(config.craftListPath)){
    fs.mkdir(config.craftListPath.substring(0,config.craftListPath.lastIndexOf("/")+1), { recursive: true }, (err) => {
        if (err) throw err;
    });
}

getALLhorticraftItems();
setInterval(function(){
    getALLhorticraftItems();
}, 120000)
