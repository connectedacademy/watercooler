var assert = require('chai').assert;

describe('Course Info', function() {
    
    describe('Multiple client speed tests',function(){

        it ('should call random segment summarybatch',function(){

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