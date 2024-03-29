var game = new GameState(1);
describe("The Intervention Interface", function()
{
	describe("purchase_intervention", function()
	{
		var intervention = new Intervention("Test", 100, 10, false, [1,1,1,1,1,1,1]);
		new_transaction = jasmine.createSpy();
		purchase_intervention(intervention);
		it("Modifies the intervention to reflect that it has been purchased", function()
		{
			expect(intervention.is_implemented).toBeTruthy();
		});
		it("Records the cost of the intervention", function()
		{
			expect(new_transaction).toHaveBeenCalled();
		});
	});
	describe("disregard_intervention", function()
	{
		var intervention = new Intervention("Test", 100, 10, true, [1,1,1,1,1,1,1]);
		disregard_intervention(intervention);
		it("Correctly modifies the intervention to reflect that it is no longer used", function()
		{
			expect(intervention.is_implemented).toBeFalsy();
		});
	});
	describe("implementChosenIntervention", function()
	{
		it("Returns -1 if what's passed in is not an intervention", function()
		{
			expect(implementChosenIntervention(game, "Test")).toEqual(-1);
		});
		it("Purchases the valid intervention", function()
		{
			purchase_intervention = jasmine.createSpy();
			implementChosenIntervention(game, "Cultural Ambassador");
			expect(purchase_intervention).toHaveBeenCalled();
		});	
		it("Calls reduce_percentage for a valid intervention", function()
		{
			reduce_percentages = jasmine.createSpy();
			implementChosenIntervention(game, "Cultural Ambassador");
			expect(reduce_percentages).toHaveBeenCalled();
		});	
	});
	describe("disregardChosenInterventions", function()
	{
		load_globals(game);
		
		it("Finds the intervention", function()
		{	
			getChosenIntervention = jasmine.createSpy();
			disregard_intervention = jasmine.createSpy();
			disregardChosenIntervention(game, "Face to face meetings");
			expect(getChosenIntervention).toHaveBeenCalled();
			expect(disregard_intervention).toHaveBeenCalled();
		});
	});
	describe("getChosenIntervention", function()
	{
		load_globals(game);
		var result = getChosenIntervention(game, "Face to face meetings");
		it("Returns the intervention if the name passed in matches", function()
		{
			expect(game.interventions).toBeDefined();
			expect(result).toEqual(game.interventions[3]);
		});
		var result_fake = getChosenIntervention(game, "Test");
		it("Returns -1 if the intervention name doesn't match any interventions", function()
		{
			expect(result_fake).toEqual(-1);
		});
	});
	describe("reduce_percentages", function()
	{	
		var changes = [0.1,0.2,0.4,0.6,0.5,0,0];
		it("Never reduces a percent's value to < 0.25", function()
		{
			reduce_percentages(changes);
			var percents = percentages;
			for(var i = 0; i < percents.length; i++)
			{
				expect(percents[i]).not.toBeLessThan(0.10);
			}
		});
	});
	describe("get_applicable_interventions", function()
	{
		load_globals(game);
		var problem = new Problem("Module failed to integrate",10, 20,0,1);
		var intervention = {"name":"Reduce Multi-cultural interactions","init_cost": 200, "daily_cost":625, "is_implemented":false, "affects":[1,1,1,1,1,1,1]};
		it("Returns a list of applicable interventions", function()
		{
			expect(get_applicable_interventions(game, problem)[0]).toEqual(intervention);
		});
	});

	describe("Intervention Interface", function()
	{
		var gs = new GameState(1);
		var val = 100000;
		load_globals(gs);
		gs.sites[0].problems[0] = new Problem("Module failed to integrate",10, 20,0,1);
		gs.capital = val;

		it("Always removes a problem if one is present", function()
		{
			expect(gs.sites[0].problems.length).toEqual(1);
			interventionAlt(gs, 1);
			expect(gs.sites[0].problems.length).toEqual(0);
			gs.sites[0].problems[0] = new Problem("Module failed to integrate",10, 20,0,1);
			interventionAlt(gs, 0);
			expect(gs.sites[0].problems.length).toEqual(0);
		});
		it("Only removes the problem if it isn't fixed, nothing else", function()
		{
			var orig = gs.sites[0].modules[0].tasks[1].actual_total;
			interventionAlt(gs, 0);
			expect(gs.sites[0].modules[0].tasks[1].actual_total).toEqual(orig);
		});
	});
});
describe("Problem Simulator", function()
{
	it("checks to make sure the fail value used to calculate problems is valid", function()
	{
			load_globals(game);
			for(var i = 0; i < 10; i++)
			{
				var fail = problemSim(game);
			}
		expect(fail).toBeLessThan(1.0);
		expect(fail).toBeGreaterThan(-0.1);

	});

});
describe("Random Event Generation", function()
{
	describe("getEvent", function()
	{
		var g_events = game.good_events;
		var b_events = game.bad_events;
		it("Returns a random good event", function()
		{
			var result = getEvent(game, g_events);
			expect(result).toBeDefined();
			expect(g_events).toContain(result);
		});
		it("Returns a random bad event", function()
		{
			var result = getEvent(game, b_events);
			expect(result).toBeDefined();
			expect(b_events).toContain(result);
		});
	});
	describe("generateGoodEvent", function()
	{
		it("Calls getEvent and the apprporiate function in the switch statement", function()
		{
			var testGame = game;
			testGame.good_events = [game.good_events[1]];
			generateGoodEvent(testGame);
			expect(testGame.revenue).toEqual(1100000);
		});
	});
	describe("generateBadEvent", function()
	{
		it("Calls getEvent and the apprporiate function in the switch statement", function()
		{
			var testGame = game;
			testGame.bad_events = [game.bad_events[0]];
			var origRev = testGame.revenue;
			generateBadEvent(testGame);
			expect(origRev).toBeGreaterThan(testGame.revenue);
		});
	});
	
});

describe("Problem Percentage Generator", function()
{
	it("checks to make sure the function generates appropriate percentages in the range we want", function()
	{
		var percentagesToTest = generateProblemPercentages();
		for(var i = 0; i < percentagesToTest.length; i++)
		{
			expect(percentagesToTest[i]).toBeLessThan(0.71);
			expect(percentagesToTest[i]).toBeGreaterThan(-0.1);
		}

	});

});

describe("Moral Interventions", function()
{
	describe("varySiteMorale", function()
	{
		var test_game = game;
		var sites = test_game.sites;
		it("Only increases/decreases site morale by 1 at a time", function()
		{
			var morales = [sites[0].morale,sites[1].morale,sites[2].morale];
			varySiteMorale(test_game);
			expect(sites[0].morale - morales[0]).toBeLessThan(2);
		});
	});
	describe("decreaseMorale", function()
	{
		var site = game.sites[1];
		var problem = new Problem("Module failed to integrate",10, 20,0,1);
		it("Reduces the morale of a site based on the problem's impact", function()
		{
			site.morale = 50;
			decreaseMorale(site, problem);
			expect(site.morale).toEqual(40);
		});
		it("Never reduces a site's morale to below the value of MIN_MORALE", function()
		{
			site.morale = 21;
			decreaseMorale(site, problem);
			expect(site.morale).toEqual(MIN_MORALE);
		});
	});
	describe("get_morale_impact", function()
	{
		var game = new GameState(1);
		load_globals(game);
		var m = new MoralIntervention("Test", 1000, 30);
		m.sites_implemented = {"New York":0, "Shanghai":3};
		game.sites[0].morale = 50;
		game.sites[1].morale = 50;
		var result = get_morale_impact(m, game.sites[0]);
		var result2 = get_morale_impact(m, game.sites[2]);
		it("Leaves the original impact as is, if site hasn't implemented it at all", function()
		{
			expect(result).toEqual(m.init_impact);
		});
		it("Reduces the impact of an intervention if it has been implemented by a site before", function()
		{
			expect(result2).toEqual(30);
		});
	});
	describe("update_morale_dictionary", function()
	{
		var m = new MoralIntervention("Test", 1000, 10);
		m.sites_implemented = {};
		update_morale_dictionary(m, "New York");
		update_morale_dictionary(m, "Shanghai");
		update_morale_dictionary(m, "Shanghai");
		it("Sets a site's value to 0 if they are not yet added", function()
		{
			expect(m.sites_implemented["New York"]).toEqual(1);
		});
		it("Increments the site's value correctly", function()
		{
			expect(m.sites_implemented["Shanghai"]).toEqual(2);
		});
		
	});
	describe("purchaseMoraleIntervention", function()
	{
		var site = game.sites[0];
		var morale_i = new MoralIntervention("Test", 1000, 10);
		site.morale = 100;
		console.log("WOO");
		purchaseMoraleIntervention(morale_i, site);
		it("Increases a site's morale", function()
		{
			expect(site.morale).toBeGreaterThan(93);
			expect(site.morale).toBeLessThan(107);
		});
		it("Calls its helper functions", function()
		{
			update_morale_dictionary = jasmine.createSpy();
			get_morale_impact = jasmine.createSpy();
			purchaseMoraleIntervention(morale_i, site);
			expect(update_morale_dictionary).toHaveBeenCalled();
			expect(get_morale_impact).toHaveBeenCalled();
		});
	});
	describe("set_morale", function()
	{
		var sites = game.sites;
		it("Returns 100 if passed true", function()
		{
			expect(set_morale(true)).toEqual(100);
		});
		it("Returns a 25% variance on 100 otherwise", function()
		{
			var result = set_morale(false);
			expect(result).toBeGreaterThan(74);
			expect(result).toBeLessThan(126);
		});
	});
	describe("implementChosenMoraleIntervention", function()
	{
		it("Calls the purchase function", function()
		{
			purchaseMoraleIntervention = jasmine.createSpy();
			implementChosenMoraleIntervention(game, "Buy Pizza for Dublin");
			expect(purchaseMoraleIntervention).toHaveBeenCalled();
		});
	});
	describe("parseDetails", function()
	{
		var morale_details = "Buy Pizza For Dublin";
		var test_details = "TEST";
		it("Given valid parameters it returns a 2 item array", function()
		{
			var result = parseDetails(game, morale_details);
			expect(result["Morale I"]).toEqual(game.morale_interventions[0]);
			expect(result["Site"]).toEqual(game.sites[2]);
		});
		it("Returns an empty index if parameters are invalid", function()
		{
			var result = parseDetails(game, test_details);
			expect(result["Morale I"]).toEqual(undefined);
			expect(result["Site"]).toEqual(undefined);
		});
	});
	describe("retrieve_current_morale", function()
	{
		var site = game.sites[0];
		var asianSite = game.sites[1];
		var responses = ["Great", "Good", "Okay", "Bad", "Terrible"];
		var result;
		it("Returns Great if the culture is asian or russian", function()
		{
			result = retrieve_current_morale(asianSite);
			expect(result).toEqual(responses[0]);
		});
		it("Returns Great if a site's morale is above 90", function()
		{
			site.morale = 100;
			result = retrieve_current_morale(site);
			expect(result).toEqual(responses[0]);
		});
		it("Returns Good if a site's morale is above 70", function()
		{
			site.morale = 80;
			result = retrieve_current_morale(site);
			expect(result).toEqual(responses[1]);
		});
		it("Returns Okay if a site's morale is above 50", function()
		{
			site.morale = 55;
			result = retrieve_current_morale(site);
			expect(result).toEqual(responses[2]);
		});
		it("Returns Bad if a site's morale is above 30", function()
		{
			site.morale = 35;
			result = retrieve_current_morale(site);
			expect(result).toEqual(responses[3]);
		});
		it("Returns Terrible if a site's morale is above below 30", function()
		{	
			site.morale = 20;
			result = retrieve_current_morale(site);
			expect(result).toEqual(responses[4]);
		});
	});
	describe("modifyMorale", function()
	{
		var amount = 20;
		var site = game.sites[0];
		it("Correctly Adds the amount onto the morale", function()
		{
			site.morale = 50;
			var orig = site.morale;
			modifyMorale(site, amount);
			expect(site.morale).toEqual(orig+amount);
		});
		it("Stops the morale from going above or below the constants", function()
		{
			site.morale = 25;
			modifyMorale(site, -100);
			expect(site.morale).toEqual(MIN_MORALE);
			site.morale = 120;
			modifyMorale(site, 100);
			expect(site.morale).toEqual(MAX_MORALE);
		});
	});
});
