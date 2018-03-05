/* globals: describe it*/

var assert = require('assert');
var https = require('https');

var rawJwtToken = {};

describe("/auth/jwks", function() {

    it("authenticate to auth provider", function(done) {

        var postData = JSON.stringify({
            "username": "robot",
            "password": "r0b0t123"
        });

        var options = {
            hostname: 'testenterprise.disasteraware.com',
            port: 443,
            path: '/jwt/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        var req = https.request(options, function(res) {
            assert.equal(res.statusCode, 200);

            var data = '';
            res.on('data', function(frame) {
                data += frame;
            });

            res.on('end', function() {
                assert.equal(typeof data, "string");
                assert.equal(data.length > 0, true);
                rawJwtToken = JSON.parse(data);
                assert.equal(typeof rawJwtToken.accessToken, 'string');
                assert.equal(typeof rawJwtToken.refreshToken, 'string');
                done();
            });

        });

        req.on('error', function(e) {
            throw e;
        });

        req.write(postData);
        req.end();
    }).timeout(5000);

    it("validate auth provider token", function(done) {

        var options = {
            hostname: 'localhost',
            port: 8080,
            path: '/auth/jwtks',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + rawJwtToken.accessToken
            },
            rejectUnauthorized: false
        };

        var req = https.request(options, function(res) {
            assert.equal(res.statusCode, 200);

            var response = '';
            res.on('data', function(data) {
                response += data;
            });

            res.on('end', function() {
                assert.equal(typeof response, "string");
                assert.equal(response.length > 0, true);
                done();
            });

        });

        req.on('error', function(e) {
            throw e;
        });

        req.end();
    });
});


describe("/api/zendesk/token", function() {

    it("generate zendesk provider token", function(done) {

        var options = {
            hostname: 'localhost',
            port: 8080,
            path: '/api/zendesk/token',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + rawJwtToken.accessToken
            },
            rejectUnauthorized: false
        };

        var req = https.request(options, function(res) {
            assert.equal(res.statusCode, 200);

            var response = '';
            res.on('data', function(data) {
                response += data;
            });

            res.on('end', function() {
                assert.equal(typeof response, "string");
                assert.equal(response.length > 0, true);
                done();
            });

        });

        req.on('error', function(e) {
            console.error(e);
            throw e;
        });

        req.end();
    });
});