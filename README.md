sim-cyborg
==========

A final year group project for the D-Cyborg Team

To run, execute ./start_server.sh in the root directory. The main project page can then be accessed in a web browser at port 3000

NB. There may be a bug on some linux installations where forever cannot find nodejs. This can be worked around by running 'nodejs server.js'

###Config

Global variables which are not typically changed from game to game are stored in Sim/data/config_file.json. 

###Requires:
* node.js - Web server
* Vex 2.0.1 - Used to display dialog boxes in the simulation

###Requires node packages:
* express - Web application framework
* forever - Keep a script running continually

###Installing Dependencies
node.js - http://nodejs.org/
express - Use npm (https://www.npmjs.org/) npm install express
forever - npm install forever
Vex - Already present in project but to to install manually, download from http://github.hubspot.com/vex/ and unzip into \sim-cyborg\Sim\lib Everything except the js and css folders can then be deleted

###To Run tests:
Open [server]:3000/SpecRunner.html in a browser and the results of all present tests will be displayed on the screen. Source code is found in /src and the specifications for the tests themselves are found in /spec.
[server] here refers to where you have deployed the project. Generally a url like http://localhost:3000 will suffice to load up the index page.

##Week 0
Feature #17 - Displaying global variables
This can be verified by running the test to check that the file is present and is valid json. In addition, its appearence on screen also verifies that this feature work correctly.

##Week 1
Feature #9 - Process Simulator
This can be verified by running the associated tests and examining the console output when the game state changes

Currently the console outputs json representing the game state, which looks something like below:

*Initial State:
{"sites":[{"name":"Site 1","coordinates":0,"culture":{},"num_staff":5,"effort":2,"working_on":[{"name":"write backend","tasks":[{"name":"write model","assigned":2,"completed":0,"total":30},{"name":"write view","assigned":2,"completed":0,"total":25},{"name":"write controller","assigned":1,"completed":0,"total":35}]}],"development_type":"Agile"}],"current_time":0,"problems":[],"finance":0,"modules":[{"name":"write backend","tasks":[{"name":"write model","assigned":2,"completed":0,"total":30},{"name":"write view","assigned":2,"completed":0,"total":25},{"name":"write controller","assigned":1,"completed":0,"total":35}]}]}

*Updated State
{"sites":[{"name":"Site 1","coordinates":0,"culture":{},"num_staff":5,"effort":2,"working_on":[{"name":"write backend","tasks":[{"name":"write model","assigned":2,"completed":6,"total":30},{"name":"write view","assigned":2,"completed":6,"total":25},{"name":"write controller","assigned":1,"completed":3,"total":35}]}],"development_type":"Agile"}],"current_time":0,"problems":[],"finance":0,"modules":[{"name":"write backend","tasks":[{"name":"write model","assigned":2,"completed":6,"total":30},{"name":"write view","assigned":2,"completed":6,"total":25},{"name":"write controller","assigned":1,"completed":3,"total":35}]}]} 

As seen below, for each site there is a number of tasks, in the "tasks" field of the json object. To show that progress has happened, we simply look at the "completed" field for each task and see that it has advanced.

##Week 2
Feature #20 - Default game scenarios

This can be verified by viewing the main page of the simulation (index.html or navigating to localhost:3000), and clicking one of the scenario buttons on the top of the screen. Currently the game will initialise to scenario 1 on game load, but a user can restart the simulation by clicking any of the three scenario buttons.

Feature #6 - Display of game state and module progress

Clicking the button to the left of the scenario buttons on the main simulation page will toggle between preset constants and the increasing progress of the game state.

Feature #11 - Problem Simulator

Currently this system only assigns problems to tasks, but these problems do not negatively impact progress. Regardless, navigating to specrunner.html as described above will show tests pertaining to the assignment of problems to tasks.

Feature #14 - End of game report

Final Score is displayed at the end of the game.

##Week3
Feature #3 - Game score calculator

The game score is calculated using various functions, such as get_total_expenditure which goes through all expenses incurred throughout the simulation, sums them and returns them. This then gets displayed in display_final_score.

Feature #8 - Module Completion Calculator

This consists of one function, vary in state.js. Each tasks has a total and an actual total, which gotten by calling vary with the first total. This implements the 25% variance which can be seen by the fact that every game runs for a different length of time as the effort required to complete tasks are changing. There is also an associated test for it in stateSpec.js.

Feature #5 - Nominal Schedule Calculator

The schedule calculator consists of two functions in game.js, scheduleCalculator and sum_tasks. sum_tasks gathers the total amount of effort required by each task in the simulation and scheduleCalculator divides this by the load factor which is 2 currently.
Its associated tests are foundin gameSpec.js and while its presence is not obvious in game, it is used in the report function in game.js to calculate the expected time that the simulation should run for and the expected effort required

Feature #16 - Intervention Interface

This can be verified by running the game. Every once in a while, a dialog box will open, giving details of a problem that has occured. The player can then choose to either fix the problem, spending resources or ignore it which has a negative impact on that task/module's performance. This can also be viewed in the console, as the details of the problem will be printed there, along with if the player fixed the problem or not. Here is the console output:

A problem has been encountered in the New York office. game.js:128
Module failed System tests

feature #6 - Status display

A tile view has been implemented which shows the status of all the sites by colour. It also restricts your view of the progress of modules and tasks to your home site.

In addition, there are associated tests in gameSpec.js and the function itself, intervention(gs) is present in game.js and is called in the update function.

