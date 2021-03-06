// Variables
var $transitionOpen, 	// Transition open DOM element
	$transitionClose, 	// Transition close DOM element
	$screenStarting, 	// Screen starting DOM element
	$screenQuestions, 	// Screen questions DOM element
	$screenEnding, 		// Screen ending DOM element

	baseUrl,			// The base URL for the paths

	quiz,               // The quiz number (index)
	quizItemStart,      // The quiz duration (seconds)
	quizDuration,       // The quiz question duration (seconds)

	users = [],         // All connected users
	minStartUsers,      // The minimum amount of users needed to start the game
	isFirstStart,       // Whether this is the first time starting
	extraStartTime,		// The time the start-screen will be displayed after the required minimum user amount is reached (seconds)

	userAnswers = [],   // stores all the answers given by users  | Example: {user:"username",userId:"Id",data:"A"}
	userScore = [],     // stores all the userIds and scores to be send to the API | Example: {user_Id:"id",points:80}

	allowedToRun;       // Whether the game is allowed to run or not once started


// Initialize
quizInit();



/**
 * Initialize the quiz.
 * @example
 *     quizInit();
 */
function quizInit() {

	// Define DOM elements
	$transitionOpen = document.getElementById('transition-open');
	$transitionClose = document.getElementById('transition-close');
	$screenStarting = document.getElementById('screen-starting');
	$screenQuestions = document.getElementById('screen-questions');
	$screenEnding = document.getElementById('screen-ending');

	// Set the base URL for the paths
	baseUrl = "/games/paaspopquiz";

	// Start the first quiz at the first item, and set the duration to 10 seconds
	quiz = 0;
	quizItemStart = 0;
	quizDuration = 20;

	// Define the minimum amount of users needed to start the game
	minStartUsers = 1;

	// Define the amount of time the start-screen will be displayed after the minimum required user amount is reached
	extraStartTime = 10000;

	// Define whether this is the first time starting the quiz
	isFirstStart = true;

	// Define whether the quiz is allowed to run or not once started
	allowedToRun = true;

	// Switch the screen to the starting screen
	switchScreens(1);

	// Disable the footer of the gamerunner
	disableFooter();

}



/**
 * Start a specific quiz on a specific item with the provided duration.
 * @async
 * @param {number} quizNumber Quiz index
 * @param {number} quizQuestionNumber Quiz question index
 * @param {number} quizDuration Quiz duration, time in seconds
 * @example
 *     quizStart(0, 0, 10);
 */
async function quizStart(quizNumber, quizQuestionNumber, quizDuration) {

	console.log('[QUIZ STARTED]');

	// Switch to the next question
	quizMainLoop(quizNumber, quizQuestionNumber, quizDuration);

}



/**
 * End the active quiz.
 * @async
 * @example
 *     quizEnd();
 */
async function quizEnd() {

	console.log('[QUIZ ENDED]');

	// Don't allow the quiz to run anymore
	allowedToRun = false;

	// Trigger the close animation
	closeTransition();

	// Delay further actions for 1 second to make sure the close transition has completed
	await delay(1000);

	// Reset quiz item
	quizItemReset();

	// Switch the screen to the ending screen
	switchScreens(3);

	// Trigger the open animation
	openTransition();

	// Disable the footer of the gamerunner
	disableFooter();

	// Send the scored points to the clients
	sendPoints(userScore);

	// Send stop signal to clients and server
	stopGame();

}



/**
 * Main quiz actions to be looped over.
 * @async
 * @param {number} quizNumber Quiz index
 * @param {number} quizItemNumber Quiz item index
 * @param {number} quizDuration Quiz duration, time in seconds
 * @example
 *     quizMainLoop(0, 0, 10);
 */
async function quizMainLoop(quizNumber, quizItemNumber, quizDuration) {

	// If the quiz is allowed to run
	if (allowedToRun) {

		// Load JSON data 
		var data = await loadData();

		// Quiz item
		var quizItem = data.quizzes[quizNumber].quizItems[quizItemNumber];

		// If there is a quiz item
		if (quizItem) {

			// Start the next quiz item
			await quizItemNext(data, quizNumber, quizItemNumber, quizDuration);

			// Increase the quiz item number
			quizItemNumber++;

			// Start the next quiz item
			quizMainLoop(quizNumber, quizItemNumber, quizDuration);

		}
		else {

			// End the quiz
			quizEnd();

		}

	}

}



/**
 * Switch to the next quiz question.
 * @async
 * @param {Object} data Quizzes JSON data
 * @param {number} quizNumber Quiz index
 * @param {number} quizItemNumber Quiz item index
 * @param {number} quizDuration Quiz duration, time in seconds
 * @example
 *     quizItemNext(json, 0, 0, 10);
 */
async function quizItemNext(data, quizNumber, quizItemNumber, quizDuration) {

	// Trigger the close animation
	closeTransition();

	// Delay further actions for 1 second to make sure the close transition has completed
	await delay(1000);

	// Switch the screen to the questions screen
	switchScreens(2);

	// Reset quiz item
	quizItemReset();

	// Apply data
	applyData(data, quizNumber, quizItemNumber);

	// Enable the footer of the gamerunner
	enableFooter();

	// Trigger the open animation
	openTransition();

	// Start the quiz question
	var quizItemData = data.quizzes[quizNumber].quizItems[quizItemNumber];
	await quizItemActive(quizItemData, quizDuration)

}



/**
 * Close animation for the transition.
 * @example
 *     closeTransition();
 */
function closeTransition() {

	$transitionOpen.style.visibility = 'hidden';
	$transitionClose.style.visibility = 'visible';
	$transitionClose.src = `${baseUrl}/images/transition-close.gif`;

}



/**
 * Open animation for the transition.
 * @example
 *     openTransition();
 */
function openTransition() {

	$transitionClose.style.visibility = 'hidden';
	$transitionOpen.style.visibility = 'visible';
	$transitionOpen.src = `${baseUrl}/images/transition-open.gif`;

}



/**
 * Delay any further actions for a given amount of time.
 * @param {number} t Delay time, time in milliseconds
 * @param {*} [v] Optional value to resolve the promise with after the delay has been completed
 * @returns {Promise} Promise object
 * @example
 *     delay(10000, 'test');
 */
function delay(t, v) {
	return new Promise(function (resolve) {
		setTimeout(resolve.bind(null, v), t)
	});
}



/**
 * Load the quiz data from the JSON file.
 * @async
 * @returns {json} JSON data
 * @example
 *     loadData();
 */
async function loadData() {

	var response = await fetch(`${baseUrl}/data/quiz_data.json`);
	var json = await response.json();
	return json;

};



/**
 * Apply data to the DOM elements.
 * @param {Object} data Quizzes JSON data
 * @param {number} quizNumber Quiz index
 * @param {number} quizItemNumber Quiz item index
 * @example
 *     applyData(json, 0, 0);
 */
function applyData(data, quizNumber, quizItemNumber) {

	// Data variables
	var quiz = data.quizzes[quizNumber];
	var quizItem = quiz.quizItems[quizItemNumber];

	// DOM elements
	var $artistText = document.getElementById('artist-text');
	var $questionText = document.getElementById('question-text');
	var $artistImage = document.getElementById('artist-image');
	var $answerA = document.getElementById('answer-a');
	var $answerB = document.getElementById('answer-b');
	var $answerC = document.getElementById('answer-c');

	// Send possible answers to clients
	nextRound(["A", "B", "C"]);

	// Send header to clients
	setLiveHeader(quizItem.question);

	// set client footer
	setLiveFooter(quiz.quizName);

	// Update DOM elements with values from data
	$artistText.innerHTML = quiz.quizName;
	$questionText.innerHTML = quizItem.question;
	$artistImage.style.backgroundImage = `url('${baseUrl}/${quizItem.imagePath}')`;
	$answerA.innerHTML = "A) " + quizItem.answers[0];
	$answerB.innerHTML = "B) " + quizItem.answers[1];
	$answerC.innerHTML = "C) " + quizItem.answers[2];

}



/**
 * Actions to be executed when a quiz item is active.
 * @async 
 * @param {Object} data Quiz item JSON data
 * @param {number} countdown Quiz item countdown, time in seconds
 * @returns {Promise} Promise object
 * @example
 *     quizItemActive(json, 10);
 */
async function quizItemActive(data, countdown) {

	// Promise for asynchronous setInterval
	return await new Promise(resolve => {

		// Time input
		countdown = countdown || 15; // 15 seconds by default

		// Update the timer DOM element
		var $timer = document.getElementById("timer");
		$timer.innerHTML = countdown;

		// Set an interval
		const interval = setInterval(() => {

			// Lower the countdown variable
			countdown--;

			// Display countdown
			if (countdown >= 0) {
				$timer.innerHTML = countdown;
			}

			// Exactly when the time is up
			if (countdown == 0) {

				// Display a the 'time is up' message
				document.getElementById("timer-message").style.display = "block";

			}
			// One second after the time is up
			else if (countdown == -1) {

				// Get the correct answer
				var correctQuizAnswer = data.correctAnswerIndex;

				// If the correct answer is A, display it
				if (correctQuizAnswer == 0) {
					document.getElementById("answer-a").style.backgroundColor = "#00ff80";
					sendAnswer("A");
				}
				// If the correct answer is B, display it
				else if (correctQuizAnswer == 1) {
					document.getElementById("answer-b").style.backgroundColor = "#00ff80";
					sendAnswer("B");
				}
				// If the correct answer is C, display it 
				else if (correctQuizAnswer == 2) {
					document.getElementById("answer-c").style.backgroundColor = "#00ff80";
					sendAnswer("C");
				}

				// Add the awarded points for each user to the user score list.
				CalculateUserPointsForRound(correctQuizAnswer);
			}
			// Ten seconds after the time is up
			else if (countdown == -10) {

				// Clear the interval and resolve the promise
				clearInterval(interval);
				resolve();

			}

		}, 1000);

	});

}



/**
 * Reset the quiz item DOM elements.
 * @example
 *     quizItemReset();
 */
function quizItemReset() {

	// DOM elements
	var $artistText = document.getElementById('artist-text');
	var $questionText = document.getElementById('question-text');
	var $artistImage = document.getElementById('artist-image');
	var $answerA = document.getElementById('answer-a');
	var $answerB = document.getElementById('answer-b');
	var $answerC = document.getElementById('answer-c');
	var $timer = document.getElementById('timer');
	var $timerMessage = document.getElementById('timer-message');

	// Update DOM elements with default placeholder values
	$artistText.innerHTML = "Placeholder";
	$questionText.innerHTML = "Placeholder";
	$artistImage.style.backgroundImage = `url('${baseUrl}/images/placeholder.png')`;
	$answerA.innerHTML = "Placeholder";
	$answerB.innerHTML = "Placeholder";
	$answerC.innerHTML = "Placeholder";
	$answerA.style.backgroundColor = "#ffe600";
	$answerB.style.backgroundColor = "#ffe600";
	$answerC.style.backgroundColor = "#ffe600";
	$timer.innerHTML = "N";
	$timerMessage.style.display = "none";

}



/**
 * Switch to the provided screen.
 * @param {number} screen Screen number
 * @example
 *     switchScreens(1);
 */
function switchScreens(screen) {

	// Switch to screen 1
	if (screen == 1) {
		$screenStarting.style.visibility = 'visible';
		$screenQuestions.style.visibility = 'hidden';
		$screenEnding.style.visibility = 'hidden';
	}
	// Switch to screen 2
	else if (screen == 2) {
		$screenStarting.style.visibility = 'hidden';
		$screenQuestions.style.visibility = 'visible';
		$screenEnding.style.visibility = 'hidden';
	}
	// Switch to screen 3
	else if (screen == 3) {
		$screenStarting.style.visibility = 'hidden';
		$screenQuestions.style.visibility = 'hidden';
		$screenEnding.style.visibility = 'visible';
	}

}






////////////////////////////////////////////////////////////////////////////////
// Gamerunner events



/**
 * Event from the gamerunner to force stop the game. Triggered from the admin panel or OSC connections.
 * @example
 *     gameForceStop();
 */
function gameForceStop() {
	console.warn("[GAME FORCE STOPPED!]")
	quizEnd();
}



/**
 * Event from the gamerunner to handle joining users. Triggered after a user connects to the gamerunner from the client.
 * @param {string} user The name of the user 
 * @param {string} userId The ID of the user
 * @example
 *     gameUserJoined('TestUserName', '5e9877d90ae8976a5c32f86a');
 */
function gameUserJoined(user, userId) {

	// If the user has already joined during this same quiz (in the event of getting disconnected)
	if (!users.includes({ user, userId })) {

		// Add the user to the users array
		users.push({ user, userId });

	}

	// If the minimum amount of required users is reached and this is the first time starting
	if (users.length >= minStartUsers && isFirstStart) {

		// The next time starting won't be considered the first time starting
		// Used to prevent the quiz from starting twice when the minimum amount of required users is reached twice due to disconnects 
		isFirstStart = false;

		// After 10 seconds, start the quiz
		setTimeout(() => {

			// Start a quiz item 
			quizStart(quiz, quizItemStart, quizDuration);

		}, extraStartTime);

	}

}



/**
 * Event from the gamerunner to handle user input. Triggered after the user sends input to the gamerunner from the client.
 * @param {string} user The name of the user 
 * @param {string} userId The ID of the user
 * @param {string} data The input of the user
 * @example
 *     gameUserInput('TestUserName', '5e9877d90ae8976a5c32f86a', 'B');
 */
function gameUserInput(user, userId, data) {
	// Push the input to the array of user answers
	userAnswers.push({ user: user, userId: userId, input: data });
}






////////////////////////////////////////////////////////////////////////////////
// Gamerunner helper functions



/**
 * Calculate the amount of points for each user
 * @param {number} user The correct quiz answer
 * @example
 *     CalculateUserPointsForRound('B');
 */
function CalculateUserPointsForRound(correctQuizAnswer) {

	// variables
	var points,
		tempAnswer,
		currentUser,
		userIndex;

	// For each answer received
	for (var i = 0; i < userAnswers.length; i++) {

		// Set the points that will be awarded to the users for answering that round
		points = 1;

		// Temporarily convert the answers into a different format to match the data (0,1,2 instead of A,B,C)
		// If the entered answer was A, convert it to 0
		if (userAnswers[i].input == "A") {
			tempAnswer = 0;
		}
		// If the entered answer was B, convert it to 1
		else if (userAnswers[i].input == "B") {
			tempAnswer = 1;
		}
		// If the entered answer was C, convert it to 2
		else if (userAnswers[i].input == "C") {
			tempAnswer = 2;
		}

		// If the answer matches the correct answer from the data, give the user an extra point
		if (tempAnswer == correctQuizAnswer) {
			points = 2;
		}

		// Find the user in the user scores
		currentUser = userScore.find(score => score.user_id == userAnswers[i].userId);

		// If the user already has a total amount of points, add the points
		if (currentUser) {
			userIndex = userScore.map(function (e) {
				return e.user_id;
			}).indexOf(userAnswers[i].userId);
			userScore[userIndex].points += points;
		}

		// If the user did not have a total amount of points, create a new entry and add the points
		else {
			userScore.push({
				user_id: userAnswers[i].userId,
				points: points
			});
		}
	}

	// Reset the user answers
	userAnswers = [];

}