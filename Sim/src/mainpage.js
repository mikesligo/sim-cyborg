var TEMPLATES = {};
var scene, background, site_images, office;
window.onload = function() {
    var game_height = window.innerHeight - 5;
    var game_width = window.innerWidth;
    scene = sjs.Scene({
        w: game_width,
        h: game_height,
        autoPause: false
    });
    site_images = ['img/EmptyOffice.jpeg', 'img/Office2.jpg', 'img/Office3.jpg'];
    // var exec_list = document.getElementById('exec_list');
    background = scene.Layer('background');
    scene.loadImages(site_images, function() {
        office = background.Sprite('img/EmptyOffice.jpeg');
        office.position(0, 0);
        office.transformOrigin(0, 0);
        office.scale(office.scene.w / office.imgNaturalWidth, office.scene.h / office.imgNaturalHeight);            
        office.update();
    });
    GAME_DATA.gs = new GameState(1);
	displayManagementOptions(GAME_DATA.gs);
    load_globals(GAME_DATA.gs);
//    vex.dialog.alert("Select a scenario to start the simulation! <br> Adjust the speed using the Faster & Slower buttons!");
    $('#char-Sheet').hide();
    $('#options').hide();
    $(document).ready(function() {
        $('#scenario_1').click(function() {
            setupGame(scene,1);
            renderTileview();
            $('#char-Sheet').show();
            $('#options').show();
        });
        $('#scenario_2').click(function() {
            setupGame(scene,2);
            renderTileview();
            $('#char-Sheet').show();
            $('#options').show();
        });
        $('#scenario_3').click(function() {
            setupGame(scene,3);
            renderTileview();
            $('#char-Sheet').show();
            $('#options').show();
        });
        $('#options').click(function() {
            if(GAME_DATA.ticker)displayInterventions(GAME_DATA.gs);
        });
        $.get('src/templates/tileview.html', function(template) {
            TEMPLATES['tileview'] = template;
            renderTileview();
        });
        $.get('src/templates/popupView.html', function(template) {
            TEMPLATES['popupView'] = template;
        });
        $('.site_tile').hide();
        updateSpeedLabel(-1);
        $('#time_slower').click(function() {
            updateSpeedLabel(1);
        });
        $('#time_faster').click(function() {
            updateSpeedLabel(-1);
        });
        $('#char-Sheet').click(function(){
            displayCharSheet(GAME_DATA.gs);
            });
    });
};
//Passed in a number, +/- add that onto TICKS_PER_UNIT_TIME
//Recalculate speed and enable/disable any necessary buttons
function updateSpeedLabel(number_change) {
	TICKS_PER_UNIT_TIME += number_change;
	if(TICKS_PER_UNIT_TIME <= 0)TICKS_PER_UNIT_TIME = 1;	
	if(TICKS_PER_UNIT_TIME >= 20)
	{
		$('#time_slower').prop('disabled', true);
		TICKS_PER_UNIT_TIME = 20;
	}
	else $('#time_slower').prop('disabled', false);
    var speed = 1 / (TICKS_PER_UNIT_TIME);
    speed *= 100;
    speed = Math.floor(speed);
	if (speed >= 100)$('#time_faster').prop('disabled', true);
	else $('#time_faster').prop('disabled', false);
    $('#time_speed_label').text(speed);
} 

//Tracks when the player selects an intervention to buy
$('body').on('click', '#intervention', function(){ 
    var tmp = $(this).context.innerHTML;
    implementChosenIntervention(GAME_DATA.gs, tmp);
} );
//Tracks when the player selects an intervention to sell
$('body').on('click', '#intervention-sell', function(){ 
    var tmp = $(this).context.innerHTML;
    disregardChosenIntervention(GAME_DATA.gs, tmp);
} );
//Tracks when the player selects a morale intervention to buy
$('body').on('click', '#m_intervention', function(){ 
    var tmp = $(this).context.innerHTML;
    implementChosenMoraleIntervention(GAME_DATA.gs, tmp);
} );

function displayManagementOptions(gs)
{
	var interventions = '<h3> Here Are some Management Styles you can choose from. Each one, bar the last one, impacts how the simulation will turn out, chaning things like how lucky you are or how charismatic </h3>'; 
	interventions += '<table class="itable"><tr class="itr"><td class="itd">Name</td><td = class="itd">Description</td><td class ="itd">Select</td></tr>';
	
	interventions += '<tr class="itr"><td class="itd">Laissez Faire</td><td class="itd">You take a pretty relaxed approach to management, making friends with your employees and having fun. Morale is always high and you understand what is going on in the workplace, so there is no nasty surprises when problems arise!</td><td class="itd"><button id="management-buy"></button></td></tr>'
	
	
	interventions += '</table>';
	
	vex.dialog.confirm({
	  css: {'width':'100%'},
      message: '<p>' + interventions + '</p>', 
	  buttons: [],
      callback: function(value) {
        GAME_DATA.ticker.resume();
        return interventions;
      }
    });
}

var tileView;
//Iterate through sites and create an array which corresponds to each site's local time
//Pass that in and have it displayed
function renderTileview() {

    if (TEMPLATES['tileview']) {
        tileView = new Ractive({
            el: 'tiled_view',
            template: TEMPLATES['tileview'],
            data: {
                state: GAME_DATA.gs,
                statusClass: statusClass,
                currentTask: currently_doing_which_task,
                progress: progress_on_current_task,
                current_total: total_of_current_task,
                schedule_str: on_schedule_str
            }
        });
        var home = get_home_site(GAME_DATA.gs.sites);
        $('.site_tile').not('[data-name="' + home.name + '"]').find('.info-popup').hide();
        $('.site_tile').find('.info-popup-nonhome').hide();
        $('.site_tile').find('.info-popup-email').hide();
        $('.site_tile').find('.info-popup-status').hide();
        $('.site_tile').find('.info-popup-tasks').hide();                  
        $('.site_tile').not('[data-name="' + home.name + '"]').find('.info-popup-nonhome').toggle();
        $('.site_tile').not('[data-name="' + home.name + '"]').find('.info-popup-email').toggle();
        $('.site_tile').not('[data-name="' + home.name + '"]').find('.info-popup-status').toggle();     
        $('.site_tile').not('[data-name="' + home.name + '"]').find('.info-popup-tasks').toggle();      
        $('.site_tile>.info-popup').click(function() {
            update_actual_total(home);
            showHomeSitePopup();
        });
        $('.site_tile>.info-popup-nonhome').click(function() {
            var siteName = $(this).parent().attr('data-name');
            var site = getSiteByName(siteName, GAME_DATA.gs);
            update_actual_total(site);
            showSpecificSitePopup(site,1000);
        });
        $('.site_tile>.info-popup-email').click(function() {
            var siteName = $(this).parent().attr('data-name');
            var siteStatus = $(this).parent().attr('class');
            var site = getSiteByName(siteName, GAME_DATA.gs);
            if(site.culture.influence == "asian" || site.culture.influence == "russian")
            {
                showEmailResponsePositive();
            } 
            else if(siteStatus == 'site_tile schedule-ok')
            {
                showEmailResponsePositive();

            }
            else if(siteStatus == 'site_tile schedule-behind')
            {
                showEmailResponseNegative();
            }
            else
            {
                showEmailResponseCritical();

            }
        });
        $('.site_tile>.info-popup-status').click(function() {
            var siteName = $(this).parent().attr('data-name');
            var site = getSiteByName(siteName, GAME_DATA.gs);
            if(site.culture.influence == "asian" || site.culture.influence == "russian")
            {
                inquireCultural(site);//function for all ok
            }
            else
            {
                inquireAccurate(site);//function for accurate
            }
        });
        $('.site_tile>.info-popup-tasks').click(function() {
            console.log("Clicked");
            var siteName = $(this).parent().attr('data-name');
            var site = getSiteByName(siteName, GAME_DATA.gs);
            completedTasksEmail(site);
        });
        $('.site_tile>.info-popup-problems').click(function() {
            console.log("Clicked");
            var siteName = $(this).parent().attr('data-name');
            var site = getSiteByName(siteName, GAME_DATA.gs);
            encounteredProblems(site);
        });
		$('.site_tile>.info-popup-morale').click(function() {
            console.log("Clicked");
            var siteName = $(this).parent().attr('data-name');
            var site = getSiteByName(siteName, GAME_DATA.gs);
            showMoraleInterventions(GAME_DATA.gs, site);
        });

        $('.site_tile').each(function(i) {
            var $el = $(this);
            $el.find('button').click(function() {
                office = background.Sprite(site_images[i] || site_images[0]);
                office.transformOrigin(0, 0);
                office.scale(office.scene.w / office.imgNaturalWidth, office.scene.h / office.imgNaturalHeight);            
                office.update();
                GAME_DATA.current_site = i;
            });
        });


    }
};
function displayCharSheet(gs)
{
        GAME_DATA.ticker.pause();
        var result = 'Character Info: '
        result += '<br>&nbsp&nbsp&nbsp&nbsp' + "Sensitivity: " + gs.player.sensitivity;
        result += '<br>&nbsp&nbsp&nbsp&nbsp' + "Perception: " + gs.player.perception;
        result += '<br>&nbsp&nbsp&nbsp&nbsp' + "Empathy: " + gs.player.empathy;
        result += '<br>&nbsp&nbsp&nbsp&nbsp' + "Charisma: " + gs.player.charisma;
        result += '<br>&nbsp&nbsp&nbsp&nbsp' + "Intelligence: " + gs.player.intelligence;
        result += '<br>&nbsp&nbsp&nbsp&nbsp' + "Assertiveness: " + gs.player.assertiveness;
        result += '<br>&nbsp&nbsp&nbsp&nbsp' + "Luck: " + gs.player.luck;
        vex.dialog.confirm({
        message: '<p>' + result + '</p>' 
        ,
        callback: function(value) {
            GAME_DATA.ticker.resume();
            return result;
        }
    });
}


function completedTasksEmail(site)
{
    GAME_DATA.ticker.pause();
    new_transaction(-500);
    var result = 'Completed Tasks: ';
    var tasks = [];
    var modules = site.modules;
    for(var i = 0; i < modules.length; i++)
    {
        tasks = modules[i].tasks;
        result += '<br><b>' + modules[i].name + '</b> : ';
        for(var j = 0; j < tasks.length; j++)
        {
            if(tasks[j].completed >= tasks[j].actual_total) result += '<br>&nbsp&nbsp&nbsp&nbsp' + tasks[j].name;
        }
    }
    vex.dialog.confirm({
        message: '<p>' + result + '</p>' 
        ,
        callback: function(value) {
            GAME_DATA.ticker.resume();
            return value;
        }
    });
}


function inquireAccurate(site)
{
    GAME_DATA.ticker.pause();
    new_transaction(-100);
    var result = [];
    var status = '';

    for(var i = 0; i < site.modules.length; i++){
        var module = site.modules[i];
        var completed = completed_hours_for_module(module);
        var out_of = hours_for_module(module);
        result += '<br> ' + module.name + ' : completed ' + completed + "/" + out_of + " hours";
    }
    vex.dialog.confirm({
        message: '<p>' + result + '</p>',
        callback: function(value) {
            GAME_DATA.ticker.resume();
            return value;
        }
    });
}

function inquireCultural(site)
{
    GAME_DATA.ticker.pause();
    new_transaction(-100);
    var result = '';
    var status = 'On Schedule';
    var modules = site.modules;
    for(var i = 0; i < modules.length; i++)
    {
        result += '<br> ' + modules[i].name + ' : ' + status;
    }
    vex.dialog.confirm({
        message: '<p>' + result + '</p>'
        ,
        callback: function(value) {
            GAME_DATA.ticker.resume();
            return value;
        }
    });
}

function showEmailResponsePositive()
{
    GAME_DATA.ticker.pause();//Pause the game
    vex.dialog.confirm({
        message: '<p>Everything is on schedule at this site.</p>',
        callback: function(value) {
            GAME_DATA.ticker.resume();
            return value;
        }
    });
}

function showEmailResponseNegative()
{
    GAME_DATA.ticker.pause();//Pause the game
    vex.dialog.confirm({
        message: '<p>We are behind at this site.</p>',
        callback: function(value) {
            GAME_DATA.ticker.resume();
            return value;
        }
    });
}

function showEmailResponseCritical()
{
    GAME_DATA.ticker.pause();//Pause the game
    vex.dialog.confirm({
        message: '<p>We have a critical problem at this site.</p>',
        callback: function(value) {
            GAME_DATA.ticker.resume();
            return value;
        }
    });
}


function showHomeSitePopup() {
    GAME_DATA.ticker.pause();
    var popupView;
    vex.open({
        content: '<div id="info-popup"></div>',
        afterOpen: function($vexContent) {
            popupView = new Ractive({
                el: 'info-popup',
                template: TEMPLATES['popupView'],
                data: {
                    site: get_home_site(GAME_DATA.gs.sites) //Object passed into popUpView
                }
            });
        },
        afterClose: function() {
            GAME_DATA.ticker.resume();
        }
    });

}

function showSpecificSitePopup(site, cost) {
    GAME_DATA.ticker.pause();
    var popupView;
    vex.open({
        content: '<div id="info-popup"></div>',
        afterOpen: function($vexContent) {
            new_transaction(-cost);//Deduct cost of viewing site
            popupView = new Ractive({
                el: 'info-popup',
                template: TEMPLATES['popupView'],
                data: {
                    site: site
                }
            });
        },
        afterClose: function() {
            GAME_DATA.ticker.resume();
        }
    });

}

function update_actual_total(site){
    for (var i=0; i < site.modules.length; i++){
        var module = site.modules[i]
        for (var j=0; j < module.tasks.length; j++){
            var task = module.tasks[j];
            task.total = task.actual_total;
        }
    }
}

function statusClass(site) {
    var gs = GAME_DATA.gs;
    if (site.culture.influence === "asian" || site.culture.influence === "russian") {
        return "schedule-ok";
    };
    if(site.critical_problem === true) {
        return "schedule-very-behind";
    }        
    if (site_complete(site)) return;
    if (gs.current_time % 24 == 0 && gs.current_time > 0){
        var actually_completed = actual_effort_completed(site);

        var effort_per_day = gs.developer_effort * gs.developer_working_hours * getSiteWorkers(site);
        var expected_completed = effort_per_day/24 * gs.current_time;
        //console.log("actually: " + actually_completed);
        //console.log("expected: " + expected_completed);
        if (actually_completed != expected_completed){
    //        console.log(JSON.stringify(gs.sites, null, 3));
     //       GAME_DATA.ticker.pause();//Pause the game
        }
        var difference = Math.round(actually_completed - expected_completed);
        site.schedule = difference
    }
    if (site.schedule >= 0) return "schedule-ok"
    else return "schedule-behind";
}

function on_schedule_str(site){
    if (site_complete(site)) return site.name + " is finished";
    var gs = GAME_DATA.gs;
    var effort_per_day = gs.developer_effort * gs.developer_working_hours * getSiteWorkers(site);
    var weeks = Math.round(Math.abs(site.schedule/(7*effort_per_day)));
    if (site.schedule > 0) return site.name + " is " + weeks + " weeks ahead of schedule";
    else if (site.schedule < 0) return site.name + " is " + weeks + " weeks behind schedule";
    else return site.name + " is dead on schedule";
}
