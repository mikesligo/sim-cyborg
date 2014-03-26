//Get passed an intervention & buys it for the player
function purchase_intervention(chosen)
{
	chosen.is_implemented = true;//Changes it to implemented 
	new_transaction(-chosen.init_cost);//Records the cost of it
	console.log("Intervention: " + chosen.name + " purchased");
}
//Get passed an intervention & removes it from the player's daily expenses
function disregard_intervention(chosen)
{
	chosen.is_implemented = false;
	console.log("Intervention: " + chosen.name + " is no longer in use by the player");
}
//Displays the intervention interaction table
function displayInterventions(gs)
{
	GAME_DATA.ticker.pause();
	var interventions = '<table class="itable"><tr class="itr"><td class="itd">Name</td><td = class="itd">Cost</td><td class="itd">Daily Cost</td><td class ="itd">Buy</td></tr>';
	for(var i = 0; i < gs.interventions.length; i++)
	{
		var item = gs.interventions[i];
		if(item.is_implemented)
		{
			interventions += '<tr class="itr"><td class="itd">'+item.name+'</td><td class="itd">$'+item.init_cost+'</td><td class="itd">$'+item.daily_cost+'</td><td class="itd"><button id="intervention-sell">Sell ' + item.name+'</button></td>'
		}
		else 
		{
			interventions += '<tr class="itr"><td class="itd">'+item.name+'</td><td class="itd">$'+item.init_cost+'</td><td class="itd">$'+item.daily_cost+'</td><td class="itd"><button id="intervention">Buy ' + item.name+'</button></td>'
		}
		interventions += '</tr>';
	}
	interventions += '</table>';
	
	vex.dialog.confirm({
	  css: {'width':'100%'},
      message: '<p>' + interventions + '</p>', 
      callback: function(value) {
        GAME_DATA.ticker.resume();
        return interventions;
      }
    });
}
//Takes a string containing the name of an intervention and returns
//which intervention it is
function getChosenIntervention(gs, intervention_name)
{
	var interventions = gs.interventions;
	var chosen;
	for(var i = 0; i < interventions.length; i++)
	{
		if(intervention_name.indexOf(interventions[i].name) != -1)
		{//Finds which intervention was chosen based on the name
			chosen = interventions[i];
			break;
		}
	}
	if(!chosen)return -1;
	return chosen;
}
//Takes an intervention, purchases it for the player and applies the necessary changes
//to the relevant problems based on which intervention was chosen
function implementChosenIntervention(gs, intervention_name)
{
	var interventions = gs.interventions;
	var chosen = getChosenIntervention(gs, intervention_name);
	if(chosen == -1)return -1;
	purchase_intervention(chosen);
	GAME_DATA.ticker.pause()
	vex.dialog.alert(chosen.name + " have been purchased!");
	GAME_DATA.ticker.resume();
	switch(chosen.name)//Values taken from http://jnoll.nfshost.com/cs4098/projects/global_distance.html
	{				   //High impact of 4 translates to a 0.4 reduction in problem occurance
		case 'Face to face meetings':
				reduce_percentages([0.4,0.4,0.4,0.4,0.4,0.4,0.4]);
				break;
		case 'Video Conferencing':
				reduce_percentages([0.2,0,0,0,0,0,0]);
				break;
		case 'Cultural Training':
				reduce_percentages([0.3,0.3,0.3,0.3,0.3,0.3,0.3]);
				break;
		case 'Cultural Ambassador':
				reduce_percentages([0.3,0.3,0.3,0.3,0.3,0.3,0.3]);
				break;
		case 'Low Context Comms':
				reduce_percentages([0.2,0.2,0.2,0.2,0.2,0.2,0.2]);
				break;
		case 'Synchronous Communication Possibilities':
				reduce_percentages([0.3,0.3,0.3,0.3,0.3,0.3,0.3]);
				break;
		case 'Communication Tools':
				reduce_percentages([0.2,0.2,0.2,0.2,0.2,0.2,0.2]);
				break;
		case 'Exchange Program':
				reduce_percentages([0.4,0,0,0,0,0.4,0]);
				break;
		case 'Reduce Multi-cultural interactions':
				reduce_percentages([0.1,0.1,0.1,0.1,0.1,0.1,0.1]);
				break;
		default:
			console.log("Invalid Intervention Passed in");
			break;
	}
}
//Sells an intervention based on player input
function disregardChosenIntervention(gs, intervention_name)
{
	var interventions = gs.interventions;
	var chosen = getChosenIntervention(gs, intervention_name);
	if(chosen == -1)return -1;
	disregard_intervention(chosen);
	GAME_DATA.ticker.pause()
	vex.dialog.alert("Intervention discarded!");
	GAME_DATA.ticker.resume();
}
//Passed in an array of numbers, subtracts them from the corresponding percentages
//to a minimum of 0.25
function reduce_percentages(changes_list)
{
	for(var i = 0; i < changes_list.length; i++)
	{
		percentages[i] -= changes_list[i];
		if(percentages[i] < 0.25)percentages[i] = 0.25;
	}
}

//Gets passed the game state and a problem
//Find out which interventions apply to the problem and return it
function get_applicable_interventions(gs, problem)
{
	var task_num = problem.taskNum;
	var affects;
	var result = [];
	for(var i = 0; i < gs.interventions.length; i++)
	{
		affects = gs.interventions[i].affects;
		if(affects[task_num-1])result.push(gs.interventions[i]);
	}
	console.log(result);
	return result;
}

function intervention(gs)
{
	sites = gs.sites;	
    for(var i = 0; i < sites.length; i++)
    {
		if(sites[i].problems.length > 0)
        {
			GAME_DATA.ticker.pause();//Pause the game
            var index = i;//Need to record index for use in callback
            var problem = sites[i].problems[0];
			sites[i].past_problems.push([problem,gs.time["Days Passed"]]);
			sites[i].problems.pop();
			var interventions = get_applicable_interventions(gs, problem);
			var buttonList = '';
			var game = gs;
			var buttonList = '<table class="itable"><tr class="itr"><td class="itd">Name</td><td = class="itd">Cost</td><td class="itd">Daily Cost</td><td class ="itd">Buy</td></tr>';
			for(var i = 0; i < interventions.length; i++)
			{//Generates the list of buttons
				var item = interventions[i];
				if(item.is_implemented)
				{
					buttonList += '<tr class="itr"><td class="itd">'+item.name+'</td><td class="itd">$'+item.init_cost+'</td><td class="itd">$'+item.daily_cost+'</td><td class="itd"><button id="intervention-sell">Sell ' + item.name+'</button></td>'
				}
				else 
				{
					buttonList += '<tr class="itr"><td class="itd">'+item.name+'</td><td class="itd">$'+item.init_cost+'</td><td class="itd">$'+item.daily_cost+'</td><td class="itd"><button id="intervention">Buy ' + item.name+'</button></td>'
				}
				buttonList += '</tr>';
			}
			buttonList += '</table>';
			vex.dialog.confirm({
                message: '<p>'+problem.name+' in '+sites[index].name+'. It will cost $' + problem.cost + ' to correct, below are some options you can purchase to try and prevent this from happening again in the future</p>' + buttonList,
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                      text: 'Fix Problem'
                    }),
					$.extend({}, vex.dialog.buttons.NO, {
                      text: 'Ignore Problem'
                    })
                  ],
                callback: function(value) {    
                    if(!value)
					{
						GAME_DATA.ticker.resume();//Note effect of problem no longer being reversed
						return console.log("Problem Not Fixed");
					}
					else
					{
						decreaseMorale(sites[index],problem);//Decrease Site morale
						new_transaction(-problem.cost);//Deduct cost of fixing problem
						gs.sites[index].modules[problem.module].tasks[problem.taskNum].actual_total -= problem.reduction_in_total;//Undo the changes that the problem did on the task
						GAME_DATA.ticker.resume();//Note effect of problem no longer being reversed
						return console.log("Problem Fixed");
					}
                }
            });
        }
    }
}

//Added because vex is being really annoying, so this is called in gameSpec instead of intervention
//It has the same functionality, but gets passed an extra parameter to tell it whether or not it
//should fix the problem
function interventionAlt(gs, val)
{
    sites = gs.sites;			
    for(var i = 0; i < sites.length; i++)
    {
        if(sites[i].problems.length > 0)
           {
			var index = i;//Need to record index for use in callback
            var problem = sites[i].problems[0];
            if(!val)//If problem ignored
            {
				sites[index].problems.pop();//Pop the problem
				GAME_DATA.ticker.resume();//Resume game		
				return console.log("Problem not fixed");
            }
			console.log("Actual total: " +gs.sites[index].modules[problem.module].tasks[problem.taskNum].actual_total);
			gs.sites[index].modules[problem.module].tasks[problem.taskNum].actual_total -= problem.reduction_in_total;//Undo the changes that the problem did on the task
			console.log(gs.sites[index].modules[problem.module].tasks[problem.taskNum].actual_total);
			var cost = problem.cost;
			new_transaction(-cost);//Deduct cost of fixing problemnew_transaction(-1000);//Deduct cost of fixing problem
			sites[index].problems.pop();
			return console.log("Problem has been fixed!");
        }
    }
}

function generateProblemPercentages() //to give each problem a minimal level of mitigation i.e the numbers reduced by interventions choices
{ 


    for(var i = 0; i < 7; i++)
    {
        var percentage = 0.3 + Math.floor(Math.random()*5)/10; //40% variance
        percentages.push(percentage);
    }
    return percentages;

}

function problemSim(gs)
{
    var numSites = gs.sites.length;
    var seed = Math.floor(Math.random() * numSites); //get a random number between 0 and number of sites
    var site = gs.sites[seed].name;
    var dGeo = gs.global_distances[site];
    var dTemporal = gs.temporal_distances[site]; 
    var dCulture = gs.cultural_distances[site];
    var dGlobal = dTemporal + dCulture + dGeo;

    var fail = dGlobal/(1+dGlobal);

    var probCD = gs.sites[seed].problemCooldown;
    var failC = fail*PROBLEM_CONSTANT*probCD;
    gs.sites[seed].problemCooldown += 0.005;


    var failure_seed = Math.random();
    //console.log(failC +" vs " + failure_seed);
    if(failure_seed < failC)
    {
        gs.sites[seed].problemCooldown = 0.005;
        console.log("A problem has been encountered in the "+ site + " office.")

        var problemSeed = Math.floor(Math.random() * 7)+1; //choose one of 7 problems
        var workingOnSeed = Math.floor(Math.random() * gs.sites[seed].modules.length); //choose one module being worked on
        var problemSite = gs.sites[seed];
        var problemModule = problemSite.modules[workingOnSeed];

        switch(problemSeed)
        {
            case 1: 
                var chanceAfterReduction = percentages[problemSeed-1];

                if(failC < chanceAfterReduction){
                    var problemTask = problemModule.tasks[problemSeed-1];  //design
                    var prob = new Problem("A task has fallen more than 25% behind",50, problemModule.tasks[problemSeed-1].actual_total,workingOnSeed,problemSeed);
                    problemTask.actual_total += problemTask.actual_total/50; //add a 50% overhead
                    gs.sites[seed].problems.push(prob);
                }
                break;

            case 2:
                var chanceAfterReduction = percentages[problemSeed-1];

                if(failC < chanceAfterReduction){
                    var problemTask = problemModule.tasks[problemSeed-1];  //implementation
                    var prob = new Problem("A task has fallen more than 25% behind",50, problemModule.tasks[problemSeed-1].actual_total,workingOnSeed,problemSeed);
                    problemTask.actual_total += problemTask.actual_total/50; 
                    gs.sites[seed].problems.push(prob);
                }
                break;

            case 3:
                var chanceAfterReduction = percentages[problemSeed-1];

                if(failC < chanceAfterReduction){
                    var problemTask = problemModule.tasks[problemSeed-1];  //test
                    var prob = new Problem("Unit Tests have failed",25, problemModule.tasks[problemSeed-1].actual_total,workingOnSeed,problemSeed);
                    problemTask.actual_total += problemTask.actual_total/25; 
                    gs.sites[seed].problems.push(prob);
                }
                break;

            case 4:
                var chanceAfterReduction = percentages[problemSeed-1];

                if(failC < chanceAfterReduction){
                    var problemTask = problemModule.tasks[problemSeed-1];  //integration
                    var prob = new Problem("An Integration Failure has occured",40, problemModule.tasks[problemSeed-1].actual_total,workingOnSeed,problemSeed);
                    problemTask.actual_total += problemTask.actual_total/40; 
                    gs.sites[seed].problems.push(prob);
                }
                break;

            case 5:
                var chanceAfterReduction = percentages[problemSeed-1];

                if(failC < chanceAfterReduction){
                    var problemTask = problemModule.tasks[problemSeed-1];  //system test
                    var prob = new Problem("System Tests have failed",55, problemModule.tasks[problemSeed-1].actual_total,workingOnSeed,problemSeed);
                    problemTask.actual_total += problemTask.actual_total/55;
					gs.sites[seed].problems.push(prob);
                }
                break;   

            case 6:
                var chanceAfterReduction = percentages[problemSeed-1];

                if(failC < chanceAfterReduction){
                    var problemTask = problemModule.tasks[problemSeed-1];  //deployment
                    var prob = new Problem("A Deployment Failure has occured",70, problemModule.tasks[problemSeed-1].actual_total,workingOnSeed,problemSeed);
                    problemTask.actual_total += problemTask.actual_total/70; 
					gs.sites[seed].problems.push(prob);
                }
                break; 

            case 7:
                var chanceAfterReduction = percentages[problemSeed-1];

                if(failC < chanceAfterReduction){            
                    var problemTask = problemModule.tasks[problemSeed-1];  //acceptance
                    var prob = new Problem("Acceptance Tests have failed",100, problemModule.tasks[problemSeed-1].actual_total,workingOnSeed,problemSeed);
                    problemTask.actual_total += problemTask.actual_total/100;
                    problemSite.critical_problem = true;
					gs.sites[seed].problems.push(prob);
                }
                break;                        

            default:
                console.log("What's yer prob");
        }
    }
	
    //console.log(failC);
    return failC;

}

//Displays all the problems thus experienced by the site passed in
function encounteredProblems(site)
{
    GAME_DATA.ticker.pause();
    var past_problems = site.past_problems;
	var result = "Problems Encountered: ";
	result += '<table class="ptable"><tr class="ptr"><td class="ptd">Module</td><td class="ptd">Problem</td><td class="ptd">Impact (%)</td><td class="ptd">Day Occured</td></tr>'
    for(var i = 0; i < past_problems.length; i++)
    {
        var problem = past_problems[i];
		result += '<tr class="ptr"><td class="ptd">'+site.modules[problem[0].module].name+'</td><td class="ptd">'+problem[0].name+'</td><td class="ptd">'+problem[0].impact+'</td><td class="ptd">'+problem[1]+'</td></tr>';		
    }
	result += '</table>';
    vex.dialog.confirm({
        message: '<p>' + result + '</p>' 
        ,
        callback: function(value) {
            GAME_DATA.ticker.resume();
            return result;
        }
    });
}


//Morale Related code below

//Goes through each site and randomly decides if it's morale will change. If so then the site's morale will go up or down by 1, representing the day to day changes in the office
function varySiteMorale(game)
{
	var sites = game.sites;
	var rand1, rand2;
	for(var i = 0; i < sites.length; i++)
	{
		rand2 = Math.random();
		if(rand2 >= 0.5)sites[i].morale++;
		else sites[i].morale--;
	}
}

//Takes a site and a problem and calculates by how much a site's morale should drop by. It takes into account the impact of the problem
function decreaseMorale(site, problem)
{
	var impact = problem.impact;
	site.morale -= impact;
	if(site.morale <= 0)site.morale = 1;
}

//Takes a morale intervention and a site name. It then works out the actual impact a morale intervention will have on that site, as the more times that it is implemented at a site, the less effective it becomes. In addition, if a site's morale is above 100, impacts have a lessened effect
function get_morale_impact(m_intervention, site)
{
	var actual_impact = m_intervention.init_impact;
	var num_implemented = m_intervention.sites_implemented[site.name];
	if(site.morale > 100)num_implemented++;//If a site's morale is > 100 then the impact is smaller
	if(site.morale < 20 && num_implemented > 0)num_implemented--;//If a site's morale is very low then an intervention will have an inflated effect
	var modifier = num_implemented * MORAL_MOD;
	if(modifier > 0)actual_impact -= modifier;
	if(actual_impact < 2)actual_impact = 2;
	Math.floor(actual_impact);
	return actual_impact;
}
//Updates the intervention's dictionary, by incrementing the value linked to the site key
function update_morale_dictionary(morale_i, site_name)
{
	if(morale_i.sites_implemented[site_name] == undefined)morale_i.sites_implemented[site_name] = 1;
	else morale_i.sites_implemented[site_name] += 1;
}
//Updates the dictionary, gets the impact, applies it to the site
function purchaseMoraleIntervention(morale_i, site)
{
	update_morale_dictionary(morale_i, site.name);
	site.morale += get_morale_impact(morale_i, site);
	new_transaction(-morale_i.cost);
}

//Takes a boolean. If a site is the home site (true), return 100, else returns a 25% variance
function set_morale(is_home)
{
	var base_morale = 100;
	if(is_home)return base_morale;
	return vary(base_morale);
}
//Displays a list of morale interventions the player can use to improve the morale of the site passed in
function showMoraleInterventions(gs, site)
{
	GAME_DATA.ticker.pause();
	var m_interventions = '<table class="itable"><tr class="itr"><td class="itd">Name</td><td class="itd">Cost</td><td class="itd">Action</td></tr>';
	for(var i = 0; i < gs.morale_interventions.length; i++)
	{
		var item = gs.morale_interventions[i];
		
			m_interventions += '<tr class="itr"><td class="itd">'+item.name+'</td><td class="itd">$'+item.cost+'</td><td class="itd"><button id="m_intervention">' + item.name+' for ' + site.name + '</button></td>'
		
		m_interventions += '</tr>';
	}
	m_interventions += '</table>';
	
	vex.dialog.confirm({
	  css: {'width':'100%'},
      message: '<p>' + m_interventions + '</p>', 
      callback: function(value) {
        GAME_DATA.ticker.resume();
        return m_interventions;
      }
    });
}
//Calls the necessary functions to implement a moral intervention
function implementChosenMoraleIntervention(game, morale_details)
{
	var chosenDictionary = parseDetails(game, morale_details);
	purchaseMoraleIntervention(chosenDictionary["Morale I"], chosenDictionary["Site"]);
	GAME_DATA.ticker.pause();
	vex.dialog.alert(chosenDictionary["Morale I"].name + ' has been purchased in ' + chosenDictionary["Site"].name);
	GAME_DATA.ticker.resume();
}
//Parses the input from a button press, contains both the site and thw name of the intervention
function parseDetails(game, morale_details)
{
	var morale_i = game.morale_interventions;
	var sites = game.sites;
	var result = [];
	for(var i = 0; i < morale_i.length; i++)
	{
		if(morale_details.indexOf(morale_i[i].name) != -1)
		{
			result["Morale I"] = morale_i[i];
			break;
		}
	}
	for(var j = 0; j < sites.length; j++)
	{
		if(morale_details.indexOf(sites[j].name) != -1)
		{
			result["Site"] = sites[j];
			break;
		}
	}
	return result;
}