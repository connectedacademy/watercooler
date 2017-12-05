let _ = require('lodash');

var request = require('supertest-as-promised');
// var async = require('async');
var bluebird = require('bluebird');

const WINDOW_RANGE = 60;
const START_VARIATION = 60;
// const MAX_TIME = 1600;
const MAX_TIME = 200;
const DELAY = 5000;
// const NUM_AGENTS = 2;
const NUM_AGENTS = 50;
const INIT_DELAY = 30000;
const RANDOM_PLAYBACK = false;
const USER_LOGIN = true;
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
        a.min = Number.MAX_VALUE;
        // a.max = 0;
        a.calls = [];
        // a.total = 0;
        agents.push(a);
    }

    let requests = [];
    let id = 0;
    for (let agent of agents)
    {
        let name = id;
        agent.name = name;
        // console.log('calling', segment);
        let ag = async function(){
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

                let stime = new Date();
                await agent.get(`/v1/messages/summarybatch/interpretation/liveclass/${start}/${end}/5?whitelist=false`)
                .set('Referer',`https://${URL}`)
                .expect(200);

                let roundtrip = new Date().getTime() - stime.getTime();
                agent.calls.push(roundtrip);

                await bluebird.delay(DELAY);
            }
            return true;
        };

        requests.push(ag());
        
        id++;
    }

    console.log(`Starting ${requests.length} agents`);
    let results = await Promise.all(requests);
    console.log("--- AGENTS ---");
    for (let agent of agents)
    {
        agent.avg = _.mean(agent.calls);
        console.log(`[${agent.name}]: min: ${_.min(agent.calls)}, max: ${_.max(agent.calls)}, avg: ${agent.avg}, count: ${_.size(agent.calls)}`);
    }

    console.log("--- SUMMARY ---");
    console.log(`[all]: avg: ${_.mean(_.map(agents,'avg'))}, agents: ${_.size(agents)}, calls: ${_.reduce(agents,function(sum,n){
        return sum + _.size(n.calls);
    },0)}`);
}
