const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');

//const config = require('./config.json')
let RAWconfig = fs.readFileSync('./config.json');
const config = JSON.parse(RAWconfig);
//const craftsList = require('./crafts.json')
let RAWcraftsList = fs.readFileSync('./crafts.json');
const craftsList = JSON.parse(RAWcraftsList);

let failedToFetch = false;
/**
 * Gets the users number of tabs
 * @returns [array of tab names where tab id is the index in the array]
 */
async function getTabList(){
    const numberOfTabs = await axios.get(
        `https://www.pathofexile.com/character-window/get-stash-items?tabs=1&league=Harvest&accountName=${config.accountName}`,
        { headers: { Cookie: `POESESSID=${config.POESESSID}` } },
    ).catch(function (error) {
        // handle error
        let err = (error.data || {} ).message ? error.data.message : error.response.statusText;
        failedToFetch = true;
        console.log("ERROR:", err);
    });

    return ((numberOfTabs || {}).data || {}).tabs ? numberOfTabs.data.tabs.map((value, index) => value.n):0;
}
/**
 * return the tab object for N tab
 * @param {int} tabIndex 
 * @returns {tab object}
 */
async function getTabItems(tabIndex, tabName){
    console.log("Fetching tab", tabIndex, tabName);
    const tabContents = await axios.get(
        `https://www.pathofexile.com/character-window/get-stash-items?league=Harvest&tabs=1&tabIndex=${tabIndex}&accountName=${config.accountName}`,
        { headers: { Cookie: `POESESSID=${config.POESESSID}` } },
    ).catch(function (error) {
        // handle error
        let err = (error.data || {} ).message ? error.data.message : error.response.statusText;
        failedToFetch = true;
        console.log("ERROR:", err);
    });
    return ((tabContents || {}).data || {}).items || [];
}

/**
 * returns array of all the tabs objects
 * @returns [array of tab objects]
 */
async function fetchAllTabs() {
    let tabList = await getTabList();
    if(tabList<1) return [];

    // Fetch all tabs in parallel
    const tabsContents = await Promise.all(tabList.map(async (val, index) => {
        if(config.tabIndexToSearch.length>0 || config.tabNameToSearch.length>0){
            if(!config.tabIndexToSearch.includes(index) && !config.tabNameToSearch.includes(val)){
                return [];
            }
        }
        //accoutn can only make 45 calls per 60 seconds just make sure
        let delay = tabList.length>43?config.API_limit_Delay_ms || 1400:0;
        await sleep(delay*index);
        return getTabItems(index, val);
    }));

    return tabList.map((val, i) => {
        return {tabName:val, items:tabsContents[i]}
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * returns the list of horti stations for each tab
 * @param {array of objects} tabsContents 
 * @returns [array of objects with array of items]
 */
function fetchHortiItems(tabsContents){
    if(tabsContents<1) return [];
    let hortiItems = tabsContents.map(tab => {
        return {tabName:tab.tabName, items:tab.items.filter(item => {
            return item.typeLine == 'Horticrafting Station'
        }).map(item =>  {
            return {craftedMods:item.craftedMods, id:item.id}
        })}
    });
    return hortiItems;
}

/**
 * adds craft metaData from crafts.json to the hortiItems objects
 * @params [array of objects with array of items] hortiItems
 * @returns [array of objects with array of items] hortiItems
 */
function formatCrafts(hortiItems){
    if(hortiItems<1) return [];

    hortiItems = hortiItems.map(tab => {
        return {tabName:tab.tabName, items:tab.items.map(horti => {
            if(horti.craftedMods != undefined){
                return {craftedMods:horti.craftedMods.map(craft => {
                    return {...craftsList[craft.replace(/( \(\d*\))/g, "")], ...{ilevel:/ \((\d*)\)/g.exec(craft)[1]}, ...{craft:craft.replace(/( \(\d*\))/g, "")}, ...{price:getPriceFromConfig(craftsList[craft.replace(/( \(\d*\))/g, "")])}};
                }), id:horti.id}
            }
            return horti;
        })}
    })

    return hortiItems;
}

/**
 * returns the price from config for given craft
 * @params {craft}
 * @returns string price
 */
function getPriceFromConfig(craft){
    if(!craft){
        return "";
    }
    let functionType = craft.function;
    let type =craft.type;

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

/**
 * groups the crafts for fileFormating
 * @params [array of objects with array of items] hortiItems
 * @returns JSON of crafts sorted by function and type
 */
function GroupCrafts_FunctionTypeLevel(hortiItems){
    let jsonByFucntion = flatCraftList(hortiItems);

    jsonByFucntion = _.groupBy(jsonByFucntion, function(craft) {
        return craft.function ? craft.function : "Others";
    });

    Object.keys(jsonByFucntion).forEach(craftType => {
        jsonByFucntion[craftType] = _.groupBy(jsonByFucntion[craftType], function(craft) {
            return craft.type ? craft.type : "Others";
        });
    });

    Object.keys(jsonByFucntion).forEach(craftType => {
        Object.keys(jsonByFucntion[craftType]).forEach(type => {
            jsonByFucntion[craftType][type] = _.groupBy(jsonByFucntion[craftType][type], function(craft) {
                return craft.ilevel ? craft.ilevel : undefined;
            });
        })
    });

    return jsonByFucntion;
}

/**
 * returns array of all the crafts in a single array
 * @params [array of objects with array of items] hortiItems
 * @returns [array of all crafts]
 */
function flatCraftList(hortiItems){
    let flastList=[];
    hortiItems.map(tab=>{
        tab.items.map(horti=>{
            if(horti.craftedMods){
                horti.craftedMods.map(craft=>{
                    flastList.push(craft);
                })
            }
        })
    });
    return flastList;
}

/**
 * writes to craftFile
 * @params groupedCrafts json
 */
function toFile(groupedCrafts){
    let FileString="";
    let othersText;
    Object.keys(groupedCrafts).forEach(craftType => {
        if(craftType != "Others"){
        FileString+='\n\n'+craftType+'\n';
        Object.keys(groupedCrafts[craftType]).forEach(type => {
            let typeCount=0;
            let text="";
            Object.keys(groupedCrafts[craftType][type]).forEach(ilevel => { 
                text = groupedCrafts[craftType][type][ilevel][0].craft;
                typeCount+=groupedCrafts[craftType][type][ilevel].length;
                FileString+=text+ ` (${ilevel}) [x${typeCount}]` + '\n';
                typeCount=0;
            })
        })
        }
        else{
            othersText+='\n\n'+"Others"+'\n';
            Object.keys(groupedCrafts.Others.Others).forEach(ilevel => {
                groupedCrafts.Others.Others[ilevel].forEach(craft => {
                    text = craft.craft;
                    othersText+=text+ ` (${ilevel})` + '\n';
                })
            })
        }
    });

    if(config.CraftListInclude.Others===true) FileString+=othersText;

    if(FileString.length>0){
        fs.writeFile(config.craftListPath, FileString, function (err) {
            if (err) return console.log(err);
        });
    }
}

/**
 * writes to discordCraftFile
 * @params groupedCrafts json
 */
function toDiscordFile(groupedCrafts){
    let DiscordFileString=`[HSC] IGN: ${config.accountName}`;

    Object.keys(groupedCrafts).forEach(craftFunction => {
        if(!config.DiscordListInclude.hideFunctions.includes(craftFunction)){
            if(craftFunction != "Others"){
                DiscordFileString+='\n\n'+craftFunction+'\n';
            Object.keys(groupedCrafts[craftFunction]).forEach(type => {
                if(!config.DiscordListInclude.hideTypes.includes(type)){
                    let typeCount=0;
                    let text="";
                    let price="";
                    Object.keys(groupedCrafts[craftFunction][type]).forEach(ilevel => {
                        if(config.DiscordListInclude.hideIlevleUnder<ilevel){
                            text = groupedCrafts[craftFunction][type][ilevel][0].discordText || groupedCrafts[craftFunction][type][ilevel][0].craft;
                            price = config.DiscordListInclude.price?groupedCrafts[craftFunction][type][ilevel][0].price:"";
                            typeCount+=groupedCrafts[craftFunction][type][ilevel].length;
                        }
                    })
                    //DiscordFileString+= typeCount>0? `${text} [x${typeCount}]` + price?`*-${price}*`:""+'\n':"";
                    if(typeCount>0){
                        DiscordFileString+=`${text} [x${typeCount}]`;
                        if(price!=""){
                            DiscordFileString+=` *-${price}*`;
                        }
                        DiscordFileString+='\n';
                    }
                    typeCount=0;
                }
            })
            }
            else{
                DiscordFileString+='\n\n'+"Others"+'\n';
                Object.keys(groupedCrafts.Others.Others).forEach(ilevel => {
                    groupedCrafts.Others.Others[ilevel].forEach(craft => {
                        text = craft.craft;
                        DiscordFileString+=text+ config.DiscordListInclude.ilevel?` (${ilevel})`:"" + '\n';
                    })
                })
            }
        }
    });

    if(DiscordFileString.length>0){
        fs.writeFile(config.DiscordCraftListPath, DiscordFileString, function (err) {
            if (err) return console.log(err);
        });
    }
}

/**
 * make the dir for the report paths in config
 */
function validateReportPaths(){
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
}

/**
 * fetch all tab contents, sort, format, grop, create files
 */
async function main(){
    validateReportPaths();
    let tabsContents = await fetchAllTabs();
    //no tabs have items or api limit
    if(failedToFetch){
        console.log("failed to fetch Items"); 
        return 404;
    }
    failedToFetch = false;

    let hortiItems = fetchHortiItems(tabsContents);
    hortiItems = formatCrafts(hortiItems);
    let groupedCrafts = GroupCrafts_FunctionTypeLevel(hortiItems);
    
    toFile(groupedCrafts);
    toDiscordFile(groupedCrafts);
    console.log("updated", new Date().toTimeString())
}

//run main on a 2 min interval
main();
setInterval(function(){
    main();
}, (config.updateRate_ms || 120000))