function intervention(gs)
{
    sites = gs.sites;			
    for(var i = 0; i < sites.length; i++)
    {
        if(sites[i].problems.length > 0)
        {
            var index = i;//Need to record index for use in callback
            var problem = sites[i].problems[0];
            GAME_DATA.ticker.pause();//Pause the game
            vex.dialog.confirm({
                message: ''+problem.name+' has occured in site '+sites[i].name+'. It will cost $' + problem.cost + ' to correct, what do you do?',
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                      text: 'Fix'
                    }), $.extend({}, vex.dialog.buttons.NO, {
                      text: 'Ignore'
                    })
                  ],
                callback: function(value) {
                    if(!value)//If problem ignored
                    {
                        sites[index].problems.pop();//Pop the problem
                        GAME_DATA.ticker.resume();//Resume game
                        return console.log("Problem not fixed");
                    }
                    gs.sites[index].working_on[problem.module].tasks[problem.taskNum].actual_total -= problem.reduction_in_total;//Undo the changes that the problem did on the task
					var cost = problem.cost;
                    new_transaction(-cost);//Deduct cost of fixing problem
					sites[index].problems.pop();
                    GAME_DATA.ticker.resume();
                    return console.log("Problem has been fixed for $"+problem.cost+"!");
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
			console.log(gs.sites[index].working_on[problem.module].tasks[problem.taskNum].actual_total);
			gs.sites[index].working_on[problem.module].tasks[problem.taskNum].actual_total -= problem.reduction_in_total;//Undo the changes that the problem did on the task
			console.log(gs.sites[index].working_on[problem.module].tasks[problem.taskNum].actual_total);
			var cost = problem.cost;
			new_transaction(-cost);//Deduct cost of fixing problemnew_transaction(-1000);//Deduct cost of fixing problem
			sites[index].problems.pop();
			return console.log("Problem has been fixed!");
        }
    }
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
    gs.sites[seed].problemCooldown += 0.0005;


    var failure_seed = Math.random();
    // console.log(failC +" vs " + failure_seed);
    if(failure_seed < failC)
    {
        gs.sites[seed].problemCooldown = 0.0025;
        console.log("A problem has been encountered in the "+ site + " office.")

        var problemSeed = Math.floor(Math.random() * 3)+1; //choose one of 3 problems
        var workingOnSeed = Math.floor(Math.random() * gs.sites[seed].working_on.length); //choose one module being worked on
        var problemSite = gs.sites[seed];
        var problemModule = problemSite.working_on[workingOnSeed];

        switch(problemSeed)
        {
            case 1: 
                var problemTask = problemModule.tasks[1];  //this is an implementation problem so always affects the 2nd task in a module
                console.log("A module failed to integrate");
                var prob = new Problem("Module failed to integrate",10, problemModule.tasks[1].actual_total,workingOnSeed,1);
                problemTask.actual_total += problemTask.actual_total/10; //add a 10% overhead
                console.log(problemTask.actual_total);
                gs.sites[seed].problems.push(prob);
                break;

            case 2:
                var problemTask = problemModule.tasks[2]; 
                console.log("Module failed System tests");
                var prob = new Problem("Module failed System tests",15, problemModule.tasks[2].actual_total,workingOnSeed,2);
                problemTask.actual_total += problemTask.actual_total/15;
                console.log(problemTask.actual_total);
                gs.sites[seed].problems.push(prob);
                break;

            case 3:
                var problemTask = problemModule.tasks[1]; 
                console.log("Module deployment failed");
                var prob = new Problem("Module deployment failed", 5, problemModule.tasks[1].actual_total,workingOnSeed,1);
                problemTask.actual_total += problemTask.actual_total/5;
                console.log(problemTask.actual_total);
                gs.sites[seed].problems.push(prob);
                gs.sites[seed].critical_problem = true;
                break;

            default:
                console.log("What's yer prob");
        }
    }
    //do something to site with result
}