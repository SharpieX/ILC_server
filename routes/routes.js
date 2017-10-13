const questionController = require('../controller/questionController');
const tagsController = require('../controller/tagController');
const answerController = require('../controller/answerController');
const userController = require('../controller/userController');

module.exports = (app) => {
    app.get('/api', questionController.greeting);
    app.get('/api/searchQuestion/:id', questionController.getQuestionById);
    app.get('/api/getQuestions', questionController.getQuestions);
    app.post('/api/saveQuestion', questionController.create);
    app.post('/api/updateQuestion', questionController.update);

    app.get('/api/searchUser/:id', userController.getUserById);
    app.get('/api/getUsers', userController.getUsers);
    app.get('/api/authUser/:id', userController.getUserByUUID);
    app.post('/api/saveUser', userController.create);

    app.get('/api/getTags', tagsController.getTags);
    app.post('/api/searchTags', tagsController.searchTagsByName);

    app.post('/api/saveAnswer', answerController.create);
    app.post('/api/updateAnswer', answerController.update);
    app.get('/api/getAnswer/:id', answerController.getAnswerById);

}