var request = require('supertest');
var expect = require('chai').expect;


describe('Administration', function() {

    describe('Content', function() {
    

        it ('should return list of users',function(done){

            global.adminagent
            .get('/admin/content')
            .set('Referer',process.env.TEST_DOMAIN)
            .expect(200)
            .expect((res)=>{
              expect(res.body).to.be.an.array;              
            })
            .end(done);

        });

    });

     describe('Credentials', function() {
    

        it ('fail to update credentials for invalid account',function(done){

            global.adminagent
            .post('/admin/credentials')
            .send({
                service: "twitter",
                credentials:{
                    token:"test",
                    secret:"test"
                }
            })
            .set('Referer',process.env.TEST_DOMAIN)
            .expect(403)
            .expect((res)=>{
               expect(res.body).to.have.property('msg');
            })
            .end(done);

        });

    });


     describe('Users', function() {
    

        it ('should return list of users',function(done){

            global.adminagent
            .get('/admin/users')
            .set('Referer',process.env.TEST_DOMAIN)
            .expect(200)
            .expect((res)=>{
              expect(res.body).to.be.an.array;
            })
            .end(done);
        });

    });

     describe('Editor', function() {
    
        it ('should redirect to the editor',function(done){

            global.adminagent
            .get('/admin/editor')
            .set('Referer',process.env.TEST_DOMAIN)
            .expect(302)
            .end(done);
        });

    });




});
