import {
	sessionChecker
} from '../middleware';

import {
	UserController,
	GameController
} from '../controllers'

module.exports = function (app) {
	app.post('/api/login', UserController.login);
	app.post('/api/register', UserController.register);
	app.post('/api/email_check', UserController.checkEmail)
	app.get('/api/random_name', UserController.random_name);
	app.post('/api/logout', sessionChecker, UserController.logout);
	app.get('/api/game_status', sessionChecker, UserController.game_status);
	app.get('/api/leaderboard', sessionChecker, UserController.leaderboard);
	app.get('/api/points', sessionChecker, UserController.points);
}