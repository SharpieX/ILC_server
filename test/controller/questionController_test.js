const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const Question = mongoose.model('question');


describe('The Question Controller', () => {
    it('handles a request to post request', (done) => {
        Question.count()
            .then((count) => {
                request(app)
                    .post('/api/saveQuestion')
                    .send({title: 'My first Question', text: 'email@gmail.com'})
                    .end(() => {
                        Question.count()
                            .then((newCount) => {
                                //assert(response.body.msg === 'Server is up and running');
                                assert(count + 1 === newCount);
                                done();
                            });
                    });

            });
    });
});