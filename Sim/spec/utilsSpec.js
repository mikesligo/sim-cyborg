describe("Sites working during their timezone", function()
{
	var gs = new GameState(1);
	load_globals(gs);
	gs.time["Current Hour"] = 10;
	it("checks to see if a site is working when it is supposed to", function()
	{
		expect(should_be_working(gs.sites[0], gs)).toBeFalsy();//New York
		expect(should_be_working(gs.sites[1], gs)).toBeFalsy();//Shanghai
		expect(should_be_working(gs.sites[2], gs)).toBeTruthy();//Dublin
		gs.time["Current Hour"] = 0;
		expect(should_be_working(gs.sites[0], gs)).toBeFalsy();
		expect(should_be_working(gs.sites[1], gs)).toBeTruthy();
		expect(should_be_working(gs.sites[2], gs)).toBeFalsy();
		gs.time["Current Hour"] = 9;
		expect(should_be_working(gs.sites[0], gs)).toBeTruthy();
		expect(should_be_working(gs.sites[1], gs)).toBeFalsy();
		expect(should_be_working(gs.sites[2], gs)).toBeTruthy();
		gs.time["Current Hour"] = 23;
		expect(should_be_working(gs.sites[1], gs)).toBeTruthy();//Shanghai
	});
});

describe("Nominal Schedule Calculator", function()
{
    var game = new GameState(1);
	
	var total = 0
    for (var k=0; k <game.sites.length; k++){
        var site = game.sites[k];
        for(var i = 0; i < site.modules.length; i++){
            var taskList = site.modules[i].tasks;
            for(var j = 0; j < taskList.length; j++) total += taskList[j].total;
        }
    }
	it("Sums all the tasks' effort correctly", function()
	{
		expect(sum_tasks(game)).toEqual(total);
	});
	it("Takes into account the work load modifier", function()
	{
		expect(scheduleCalculator(game)).toEqual(40000);
	});
});

describe("check_if_completed", function()
{
	var game = new GameState(1);
	it("Returns false if all the tasks in a game are not completed", function()
	{
		expect(check_if_completed(game)).toBeFalsy();
	});
});

describe("getIndexOfSiteByName", function()
{
	var game = new GameState(1);
	var name = "New York";
	it("Returns the correct index for a given site name", function()
	{
		expect(getSiteByName(name, game)).toBeDefined;
	});
});

describe("get_home_site", function()
{
	var game = new GameState(1);
	var sites = game.sites;
	var fake_sites = [];
	game.home_site = sites[2];
	it("Returns the home site when given an array of sites", function()
	{
		expect(get_home_site(sites)).toEqual(game.home_site);
	});
	it("Doesn't return anything of site not found", function()
	{
		expect(get_home_site(fake_sites)).not.toBeDefined();
	});
});
