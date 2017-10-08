const assert = require('assert');
const request = require('supertest');
const app = require('../app');

describe('The express app', () => {
    it('handles a request to get request', (done) => {
        console.log("Hellos");
            request(app)
                .get('/api')
                .end((err, response) => {
                    assert(response.body.msg === 'Server is up and running');
                    done();
                });

        }) ;
});