var request = require('supertest-as-promised');
var async = require('async');
var bluebird = require('bluebird');

const WINDOW_RANGE = 60;
const START_VARIATION = 60;
const MAX_TIME = 1600;
const DELAY = 1000;
const NUM_AGENTS = 50;
const INIT_DELAY = 5000;
const RANDOM_PLAYBACK = true;
const USER_LOGIN = false;
const USER = 'edjenkinsca';
const PSK = process.env.PSK;
const URL = 'interpretation.connectedacademy.io';

go();

async function go()
{
    let agents = [];
    for (let i=0;i<NUM_AGENTS;i++)
    {
        let a = request.agent('https://api.connectedacademy.io');
        agents.push(a);
    }

    let requests = [];
    let id = 0;
    for (let agent of agents)
    {
        let name = id;
        // console.log('calling', segment);
        requests.push(async function(){
            //starting within the first 20
            let start = Math.round((START_VARIATION*Math.random())/5)*5;

            let initdelay = Math.random() * INIT_DELAY;

            if (USER_LOGIN)
            {
                await agent.get(`/v1/auth/loginexistinguser/?account=${USER}&psk=${PSK}&callback=https%3A%2F%2F${URL}`);
            }
            
            await bluebird.delay(initdelay);

            for (let segment = start;segment<MAX_TIME;segment+=5)
            {
                let start = segment;
                let end = segment+WINDOW_RANGE;
                if (RANDOM_PLAYBACK)
                {
                    start = Math.round(Math.random() * MAX_TIME);
                    end = start + WINDOW_RANGE;
                }

                console.log(`[${name}] calling ${start} - ${end}`);

                await agent.get(`/v1/messages/summarybatch/interpretation/liveclass/${start}/${end}/5?whitelist=false`)
                .set('Referer',`https://${URL}`)
                .expect(200);

                await bluebird.delay(DELAY);
            }
            return `[${name}] FINISHED`;
        });
        id++;
    }

    console.log(`Starting ${requests.length} agents`);
    async.parallel(requests,function(result){
        console.log(result);
    });
}
