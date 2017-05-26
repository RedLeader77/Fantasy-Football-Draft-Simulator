
// Gobals
var filesRead = 0;
var draftSettings;
var playerInfoArray = [];
var teamStrategies = []; // Made into 2D array
var teamStrategyNums = [];
var teamPicksArray = []; // Maps the team number to an overall pick for both linear and snake formats
var overallPick = 1; // Used to index the teamPicksArray
var MAX_QB = 3;
var MAX_RB = 5;
var MAX_WR = 5;
var MAX_TE = 2;
var MAX_DST = 2;
var MAX_K = 2;


// Constructor for PlayerInfo object
function PlayerInfo(rank, playerTeam, position, bye, projectedPoints)
{
    this.rank = rank;
    this.playerTeam = playerTeam;
    this.position = position;
    this.bye = bye;
    this.projectedPoints = projectedPoints;
    this.fantasyTeam = "";
    this.round = 0;
    this.pick = 0;
    this.overallPick = 0;

    this.toString = function()
    {
        return this.rank + "," + this.playerTeam + "," + this.position + "," + this.bye + "," + this.projectedPoints;
    };
}


// Constructor for DraftSettings object
function DraftSettings(numTeams, draftOrder, draftFormat, numQB, numWR, numRB, numTE, numFlex, numDST, numK, numBench)
{
    this.numTeams = numTeams;
    this.numRounds = parseInt(numQB) + parseInt(numRB) + parseInt(numWR) + parseInt(numTE) + parseInt(numFlex) + parseInt(numDST) +
        parseInt(numK) + parseInt(numBench);
    this.totalPicks = this.numTeams * this.numRounds;
    this.draftOrder = draftOrder;
    this.draftFormat = draftFormat;
    this.numQB = numQB;
    this.numWR = numWR;
    this.numRB = numRB;
    this.numTE = numTE;
    this.numFlex = numFlex;
    this.numDST = numDST;
    this.numK = numK;
    this.numBench = numBench;
    
    this.toString = function()
    {
        var retVal = "Draft Settings:\n" + "numTeams: " + this.numTeams + "\n" +
            "draftOrder: " + this.draftOrder + "\n" + "draftFormat: " + this.draftFormat + "\n" +
            "QB: " + this.numQB + "\n" + "WR: " + this.numWR + "\n" + "RB: " + this.numRB + "\n" +
            "TE: " + this.numTE + "\n" + "Flex: " + this.numFlex + "\n" + "DST: " + this.numDST + "\n" +
            "K: " + this.numK + "\n" + "Bench: " + this.numBench + "\n";
        
        return retVal;
    };
}


$(document).ready(function(){
    filesRead = 0;
    $("#draftInterface").hide();
    $("#continueButton").prop("disabled", true);
    
    // Get data from Rankings.csv file and process
    $.get('Rankings.csv', function(data){
        processRankings(data)}, 'text')
    .done(function(){
        filesRead++;
        if(filesRead == 2)
        {
            $("#continueButton").prop("disabled", false);
        }
    });
        
    // Get data from TeamStrategies.csv file and process
    $.get('TeamStrategies.csv', function(data){
        processTeamStrategies(data)}, 'text')
    .done(function(){
        filesRead++;
        if(filesRead == 2)
        {
            $("#continueButton").prop("disabled", false);
        }
    });
    
});


function processRankings(data)
{
    var tempArray = [];
    var textLines = data.split('\n');
    for(var i = 0; i < textLines.length; i++)
    {
        // Add textLines[i] string as option to playerRankingsSelectList
        $("#playerRankingsSelectList").append(new Option(textLines[i], i));
        
        // Populate playerInfoArray
        var tempArray = textLines[i].split(',');
        playerInfoArray.push(new PlayerInfo(tempArray[0], tempArray[1], tempArray[2], tempArray[3], "0.0"));
    }
}


function rankingsToString()
{
    var retVal = "";
    
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        retVal += playerInfoArray[i].rank + ", " + playerInfoArray[i].playerTeam + ", " +
            playerInfoArray[i].position + ", " + playerInfoArray[i].bye + ", " + "\n";
    }
    
    return retVal;
}


function processTeamStrategies(data)
{
    // Allocate space for array
    teamStrategies = new Array(16);
    for(var i = 0; i < 16; i++)
    {
        teamStrategies[i] = new Array(16);
    }
    
    var textLines = data.split("\n");
    for(var row = 0; row < textLines.length; row++)
    {
        if(textLines[row])
        {
            var lineEntries = textLines[row].split(",");
            for(var col = 0; col < lineEntries.length; col++)
            {
                teamStrategies[row][col] = lineEntries[col].trim();
            }
        }
    }
}


function teamStrategiesToString()
{
    var retVal = "";
    
    for(var i = 0; i < teamStrategies.length; i++)
    {
        for(var j = 0; j < teamStrategies[i].length; j++)
        {
            if(teamStrategies[i][j])
            {
                retVal += teamStrategies[i][j] + " ";
            }
        }
        retVal += "\n";
    }
    
    return retVal;
}


function initializeTeamPicksArray()
{
    var totalPicks = draftSettings.numTeams * draftSettings.numRounds;
    var teamNum = 0;
    
    teamPicksArray.push(0); // Add initial item to fill position 0, want data to start at index 1
    
    if(draftSettings.draftFormat == "Linear")
    {
        for(var i = 0; i < totalPicks; i++)
        {
            teamNum = (i % draftSettings.numTeams) + 1;
            teamPicksArray.push(teamNum);
        }
    }
    else // Snake format
    {
        for(var round = 0; round < draftSettings.numRounds; round++)
        {
            for(var pick = 0; pick < draftSettings.numTeams; pick++)
            {
                if((round + 1) % 2 == 0) // Even #'d round - Reverse order of team nums
                {
                    teamNum = draftSettings.numTeams - pick;
                }
                else
                {
                    teamNum = pick + 1;
                }
                teamPicksArray.push(teamNum);
            }
        }
    }
}


function displayDebuggingInfo()
{
    var teamPicksString = "";
    
    for(var i = 1; i < teamPicksArray.length; i++)
    {
        teamPicksString += teamPicksArray[i].toString() + " ";
        if(i % draftSettings.numTeams == 0)
        {
            teamPicksString += "\n";
        }
    }
    
    var newText = "Team picks:\n" + teamPicksString + "\n";
    newText += "Team strategy Nums:\n" + teamStrategyNums.toString() + "\n\n";
    newText += "Team strategies:\n" + teamStrategiesToString();
    
    $("#userRosterTextArea").val(newText);
}


function getNextFiveAvailableAtPosition(position)
{
    var posTrimmed = position.substr(0,1);
    var nextAvailPlayers = "";
    var count = 0;
    
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        var fantasyTeam = playerInfoArray[i].fantasyTeam;
        var position = playerInfoArray[i].position;
        var playerPos = position.substr(0,1);
        
        if(!fantasyTeam && posTrimmed == playerPos) // Player available
        {
            nextAvailPlayers += playerInfoArray[i].overallRank + ", " + playerInfoArray[i].name + ", " +
                playerInfoArray[i].posRank + ", " + playerInfoArray[i].team + ", " + playerInfoArray[i].byeWeek + "\n";
            count++;
        }
        
        if(count == 5)
        {
            break;
        }
    }
    
    return nextAvailPlayers;
}


function continueButtonClicked()
{
    // Retrieve draft settings from draft settings form and store in global variable
    draftSettings = new DraftSettings( $("#numTeams option:selected").text(),
        $("#draftOrder option:selected").text(), $("#draftFormat option:selected").text(),
        $("#qb option:selected").text(), $("#wr option:selected").text(),
        $("#rb option:selected").text(), $("#te option:selected").text(),
        $("#flex option:selected").text(), $("#dst option:selected").text(),
        $("#k option:selected").text(), $("#bench option:selected").text() );
    
    $("#settingsInterface").replaceWith($("#draftInterface"));
    $("#draftInterface").show();
    
    // Disable the position filter buttons
    $("#allFilterButton").prop("disabled", true);
    $("#qbFilterButton").prop("disabled", true);
    $("#wrFilterButton").prop("disabled", true);
    $("#rbFilterButton").prop("disabled", true);
    $("#teFilterButton").prop("disabled", true);
    $("#kFilterButton").prop("disabled", true);
    $("#dstFilterButton").prop("disabled", true);

    initializeTeamPicksArray();
}


function startDraftButtonClicked()
{    
    var numTeams = draftSettings.numTeams;
    var numRosterSpots = draftSettings.numRounds;
    
    // Create and shuffle values in teamStrategyNums array
    for(var i = 0; i < numTeams; i++)
    {
        teamStrategyNums.push(i);
    }
    
    shuffle(teamStrategyNums);
    
    overallPick = 1;
    
    // Clear out parts of objects in playerInfoArray
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        playerInfoArray[i].fantasyTeam = "";
        playerInfoArray[i].round = 0;
        playerInfoArray[i].pick = 0;
        playerInfoArray[i].overallPick = 0;
    }
    
    // Update the player rankings select list
    allFilterButtonClicked();
    
    // Clear draft history and user roster text areas
    $("#draftHistoryTextArea").val("");
    $("#userRosterTextArea").val("");
    
    // Disable the position filter buttons
    $("#allFilterButton").prop("disabled", true);
    $("#qbFilterButton").prop("disabled", true);
    $("#wrFilterButton").prop("disabled", true);
    $("#rbFilterButton").prop("disabled", true);
    $("#teFilterButton").prop("disabled", true);
    $("#kFilterButton").prop("disabled", true);
    $("#dstFilterButton").prop("disabled", true);
    
    displayDebuggingInfo();
    
    if(teamPicksArray[overallPick] == draftSettings.draftOrder)
    {
        makeUserSelection();
    }
    else
    {
        setTimeout(makeAutomatedSelection, 700);
    }
}


function allFilterButtonClicked()
{
    // Clear out all items in the player rankings select list
    $("#playerRankingsSelectList").empty();
    
    // Populate player rankings selection list with all players
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        $("#playerRankingsSelectList").append(new Option(playerInfoArray[i].toString(), i));
        if(playerInfoArray[i].fantasyTeam != "")
        {
            $("#playerRankingsSelectList").find("option[value='" + i + "']").prop('disabled', true);
        }
    }

    $("#allFilterButton").css("background-color", "#0276FD");
    $("#qbFilterButton").css("background-color", "#FFFFFF");
    $("#wrFilterButton").css("background-color", "#FFFFFF");
    $("#rbFilterButton").css("background-color", "#FFFFFF");
    $("#teFilterButton").css("background-color", "#FFFFFF");
    $("#kFilterButton").css("background-color", "#FFFFFF");
    $("#dstFilterButton").css("background-color", "#FFFFFF");
}


function qbFilterButtonClicked()
{
    // Clear out all items in the player rankings select list
    $("#playerRankingsSelectList").empty();
    
    // Populate player rankings selection list with QBs only
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        if(playerInfoArray[i].position.includes("QB"))
        {
            $("#playerRankingsSelectList").append(new Option(playerInfoArray[i].toString(), i));
            if(playerInfoArray[i].fantasyTeam != "")
            {
                $("#playerRankingsSelectList").find("option[value='" + i + "']").prop('disabled', true);
            }
        }
    }

    $("#allFilterButton").css("background-color", "#FFFFFF");
    $("#qbFilterButton").css("background-color", "#0276FD");
    $("#wrFilterButton").css("background-color", "#FFFFFF");
    $("#rbFilterButton").css("background-color", "#FFFFFF");
    $("#teFilterButton").css("background-color", "#FFFFFF");
    $("#kFilterButton").css("background-color", "#FFFFFF");
    $("#dstFilterButton").css("background-color", "#FFFFFF");
}


function wrFilterButtonClicked()
{
    // Clear out all items in the player rankings select list
    $("#playerRankingsSelectList").empty();
    
    // Populate player rankings selection list with QBs only
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        if(playerInfoArray[i].position.includes("WR"))
        {
            $("#playerRankingsSelectList").append(new Option(playerInfoArray[i].toString(), i));
            if(playerInfoArray[i].fantasyTeam != "")
            {
                $("#playerRankingsSelectList").find("option[value='" + i + "']").prop('disabled', true);
            }
        }
    }

    $("#allFilterButton").css("background-color", "#FFFFFF");
    $("#qbFilterButton").css("background-color", "#FFFFFF");
    $("#wrFilterButton").css("background-color", "#0276FD");
    $("#rbFilterButton").css("background-color", "#FFFFFF");
    $("#teFilterButton").css("background-color", "#FFFFFF");
    $("#kFilterButton").css("background-color", "#FFFFFF");
    $("#dstFilterButton").css("background-color", "#FFFFFF");
}


function rbFilterButtonClicked()
{
    // Clear out all items in the player rankings select list
    $("#playerRankingsSelectList").empty();
    
    // Populate player rankings selection list with QBs only
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        if(playerInfoArray[i].position.includes("RB"))
        {
            $("#playerRankingsSelectList").append(new Option(playerInfoArray[i].toString(), i));
            if(playerInfoArray[i].fantasyTeam != "")
            {
                $("#playerRankingsSelectList").find("option[value='" + i + "']").prop('disabled', true);
            }
        }
    }

    $("#allFilterButton").css("background-color", "#FFFFFF");
    $("#qbFilterButton").css("background-color", "#FFFFFF");
    $("#wrFilterButton").css("background-color", "#FFFFFF");
    $("#rbFilterButton").css("background-color", "#0276FD");
    $("#teFilterButton").css("background-color", "#FFFFFF");
    $("#kFilterButton").css("background-color", "#FFFFFF");
    $("#dstFilterButton").css("background-color", "#FFFFFF");
}


function teFilterButtonClicked()
{
    // Clear out all items in the player rankings select list
    $("#playerRankingsSelectList").empty();
    
    // Populate player rankings selection list with QBs only
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        if(playerInfoArray[i].position.includes("TE"))
        {
            $("#playerRankingsSelectList").append(new Option(playerInfoArray[i].toString(), i));
            if(playerInfoArray[i].fantasyTeam != "")
            {
                $("#playerRankingsSelectList").find("option[value='" + i + "']").prop('disabled', true);
            }
        }
    }

    $("#allFilterButton").css("background-color", "#FFFFFF");
    $("#qbFilterButton").css("background-color", "#FFFFFF");
    $("#wrFilterButton").css("background-color", "#FFFFFF");
    $("#rbFilterButton").css("background-color", "#FFFFFF");
    $("#teFilterButton").css("background-color", "#0276FD");
    $("#kFilterButton").css("background-color", "#FFFFFF");
    $("#dstFilterButton").css("background-color", "#FFFFFF");
}


function kFilterButtonClicked()
{
    // Clear out all items in the player rankings select list
    $("#playerRankingsSelectList").empty();
    
    // Populate player rankings selection list with QBs only
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        if(playerInfoArray[i].position.includes("K"))
        {
            $("#playerRankingsSelectList").append(new Option(playerInfoArray[i].toString(), i));
            if(playerInfoArray[i].fantasyTeam != "")
            {
                $("#playerRankingsSelectList").find("option[value='" + i + "']").prop('disabled', true);
            }
        }
    }

    $("#allFilterButton").css("background-color", "#FFFFFF");
    $("#qbFilterButton").css("background-color", "#FFFFFF");
    $("#wrFilterButton").css("background-color", "#FFFFFF");
    $("#rbFilterButton").css("background-color", "#FFFFFF");
    $("#teFilterButton").css("background-color", "#FFFFFF");
    $("#kFilterButton").css("background-color", "#0276FD");
    $("#dstFilterButton").css("background-color", "#FFFFFF");
}


function dstFilterButtonClicked()
{
    // Clear out all items in the player rankings select list
    $("#playerRankingsSelectList").empty();
    
    // Populate player rankings selection list with QBs only
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        if(playerInfoArray[i].position.includes("DST"))
        {
            $("#playerRankingsSelectList").append(new Option(playerInfoArray[i].toString(), i));
            if(playerInfoArray[i].fantasyTeam != "")
            {
                $("#playerRankingsSelectList").find("option[value='" + i + "']").prop('disabled', true);
            }
        }
    }

    $("#allFilterButton").css("background-color", "#FFFFFF");
    $("#qbFilterButton").css("background-color", "#FFFFFF");
    $("#wrFilterButton").css("background-color", "#FFFFFF");
    $("#rbFilterButton").css("background-color", "#FFFFFF");
    $("#teFilterButton").css("background-color", "#FFFFFF");
    $("#kFilterButton").css("background-color", "#FFFFFF");
    $("#dstFilterButton").css("background-color", "#0276FD");
}


function disablePositionFilterButtons()
{
    $("#allFilterButton").prop("disabled", true);
    $("#qbFilterButton").prop("disabled", true);
    $("#wrFilterButton").prop("disabled", true);
    $("#rbFilterButton").prop("disabled", true);
    $("#teFilterButton").prop("disabled", true);
    $("#kFilterButton").prop("disabled", true);
    $("#dstFilterButton").prop("disabled", true);
}


function enablePositionFilterButtons()
{
    $("#allFilterButton").prop("disabled", false);
    $("#qbFilterButton").prop("disabled", false);
    $("#wrFilterButton").prop("disabled", false);
    $("#rbFilterButton").prop("disabled", false);
    $("#teFilterButton").prop("disabled", false);
    $("#kFilterButton").prop("disabled", false);
    $("#dstFilterButton").prop("disabled", false);
}


function draftSelectedButtonClicked()
{
    // Removed for proprietary reasons
}


function displayTeamProjectedPoints(teamNum)
{
    var total = 0.0;
    
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        if(playerInfoArray[i].fantasyTeam == teamNum)
        {
            total += parseFloat(playerInfoArray[i].projectedPoints);
        }
    }
    
    $("#userRosterTextArea").val($("#userRosterTextArea").val() +
        "Team " + teamNum.toString() + ": " + total.toFixed(2).toString() + "\n");
}


function getTotalProjectedPoints(teamNum)
{
    var total = 0.0;
    
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        if(playerInfoArray[i].fantasyTeam == teamNum)
        {
            total += parseFloat(playerInfoArray[i].projectedPoints);
        }
    }
    
    return total.toFixed(2);
}


function draftSettingsButtonClicked()
{
    $("#userRosterTextArea").val(draftSettings.toString());
}


function displayTeamRoster(teamNum)
{
    $("#userRosterTextArea").val($("#userRosterTextArea").val() +
        "********** Team " + teamNum.toString() + " **********\n");
    
    for(var i = 0; i < playerInfoArray.length; i++)
    {
        if(playerInfoArray[i].fantasyTeam == teamNum)
        {
            $("#userRosterTextArea").val($("#userRosterTextArea").val() +
                playerInfoArray[i].toString() + "\n");
        }
    }
    
    $("#userRosterTextArea").val($("#userRosterTextArea").val() + "\n");
}


function teamRostersButtonClicked()
{
    $("#userRosterTextArea").val("");
    
    for(var i = 1; i <= draftSettings.numTeams; i++)
    {
        displayTeamRoster(i);
    }
}


function draftResultsButtonClicked()
{
    // Clear text area
    $("#userRosterTextArea").val("Each team's total projected points:\n");
    
    // Create an array of team projected point totals
    var totalPointsArray = new Array();
    
    for(var i = 1; i <= draftSettings.numTeams; i++)
    {
        totalPointsArray.push(getTotalProjectedPoints(i));
    }
    
    totalPointsArray.sort();
    
    // Display totalPointsArray in descending order
    for(var i = draftSettings.numTeams - 1; i >= 0; i--)
    {
        for(var j = 1; j < draftSettings.numTeams; j++) // Map to correct team
        {
            if(getTotalProjectedPoints(j) == totalPointsArray[i])
            {
                displayTeamProjectedPoints(i+1);
                break;
            }
        }
    }
}


function userRosterButtonClicked()
{
    $("#userRosterTextArea").val("");
    displayTeamRoster(draftSettings.draftOrder);
}


function shuffle(array)
{
    var i = 0, j = 0, temp = null;
    
    for(i = array.length - 1; i > 0; i -= 1)
    {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


function appendToDraftHistoryTextArea(text)
{
    $("#draftHistoryTextArea").val($("#draftHistoryTextArea").val() + text + "\n");
    var scrollHeight = $("#draftHistoryTextArea")[0].scrollHeight;
    $("#draftHistoryTextArea").scrollTop(scrollHeight);
}

// Rest of code has been removed for proprietary reasons










