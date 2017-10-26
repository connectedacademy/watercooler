// describe('Course Info', function() {
    
//     describe('Schedule',function(done){
//         it ('should return valid schedule',function(done){
            
//             global.freshuser
//                 .get('/v1/course/schedule')
//                 .set('Referer',process.env.TEST_DOMAIN)
//                 .expect(200)
//                 .end(done);
//         });
//     });

//     describe('Spec',function(done){
//         it ('should return valid spec',function(done){
            
//             global.freshuser
//                 .get('/v1/course/spec/interpretation')
//                 .set('Referer',process.env.TEST_DOMAIN)
//                 .expect(200)
//                 .end(done);
//         });
//     });
// });
var assert = require('chai').assert;

describe('Course Info', function() {
    
    describe('Multiple client speed tests',function(){

        it ('should call random segment summarybatch',function(){

            // return agents[0].get('/v1/messages/summarybatch/interpretation/liveclass/0/100/5?whitelist=false')
            //     .set('Referer','https://interpretation.connectedacademy.io')
            //     .expect(200);
            // 

            let requests = [];
            for (let agent of agents)
            {
                let segment = Math.round(1700*Math.random());
                console.log('calling', segment);
                requests.push(agent.get(`/v1/messages/summarybatch/interpretation/liveclass/${segment}/${segment+40}/5?whitelist=false`)
                .set('Referer','https://interpretation.connectedacademy.io')
                .expect(200));
            }

            return Promise.all(requests);
        }).timeout(100000);

    });

});