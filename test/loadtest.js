let _ = require('lodash');

var request = require('supertest-as-promised');
// var async = require('async');
var bluebird = require('bluebird');

const WINDOW_RANGE = 60;
const START_VARIATION = 60;
const MAX_TIME = 3000;
// const MAX_TIME = 200;
const DELAY = 5000;
// const NUM_AGENTS = 2;
const NUM_AGENTS = 2;
const INIT_DELAY = 3000;
const RANDOM_PLAYBACK = false;
const CREATE_MESSAGES = true;
const USER_LOGIN = true;
const USER = 'tombartindale';
const PSK = '';
const URL = 'talkingpictures.connectedacademy.io';
const KLASS = 'interpretation';
const CONTENT = 'liveclass';
const INCLASSROOM = true;
const FAKE_USER_LOGIN = true;

go();

async function go()
{
    let agents = [];
    for (let i=0;i<NUM_AGENTS;i++)
    {
        // let a = request.agent('https://api.connectedacademy.io');
        let a = request.agent('http://localhost:4000');        
        a.min = Number.MAX_VALUE;
        a.calls = [];
        agents.push(a);
    }

    let requests = [];
    let id = 0;
    let classcode = '';
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

            //teacher
            if (INCLASSROOM && name == 0)
            {
                await agent.get(`/v1/auth/loginexistinguser/?account=${USER}&psk=${PSK}&callback=https%3A%2F%2F${URL}`);
                let classcoderes = await agent.get(`/v1/classroom/mycode/${KLASS}`)
                .set('Referer', `https://${URL}`);
                // console.log(classcoderes);
                classcode = classcoderes.body.code;
                console.log(`[${name}] is teacher ${classcode}`);

                await agent.post(`/v1/classroom/inclass`)
                .send({
                    code: classcode
                    })
                .set('Referer', `https://${URL}`);
                console.log(`[${name}] teacher in class ${classcode}`);
            }

            //students
            if (FAKE_USER_LOGIN && name > 0)
            {
                await agent.get(`/v1/auth/testuserlogin/?psk=${PSK}&callback=https%3A%2F%2F${URL}`);

                await agent.post(`/v1/auth/register/`)
                .send({
                    "email":"test@connectedacademy.io",
                    "lang":"en",
                    "hub_id":"ncl",
                    "registration_info":{},
                    "consent":true
                    })
                .set('Referer', `https://${URL}`);

                if (INCLASSROOM)
                {
                    // await bluebird.delay(Math.random() * 1000);
                    await agent.post(`/v1/classroom/inclass`)
                    .send({
                        code: classcode
                        })
                    .set('Referer', `https://${URL}`);
                    console.log(`[${name}] in class ${classcode}`);
                }
            }
            
            console.log(`[${name}] init delay ${initdelay}`);            
            await bluebird.delay(initdelay);
            console.log(`[${name}] starting`);

            for (let segment = start;segment<MAX_TIME;segment+=5)
            {
                let start = segment;
                let end = segment+WINDOW_RANGE;
                if (RANDOM_PLAYBACK)
                {
                    start = Math.round(Math.random() * MAX_TIME);
                    end = start + WINDOW_RANGE;
                }

                if (CREATE_MESSAGES)
                {
                    // if (Math.random() > 0.1)
                    {
                        await agent.post(`/v1/messages/create`)
                        .send({
                            text:`#test loadtest message from ${name} at ${new Date()} https://${URL}/#/course/${KLASS}/${CONTENT}/${start}`
                        })
                        .set('Referer', `https://${URL}`);
                        console.log(`[${name}] created message at ${start}`);
                    }
                }

                console.log(`[${name}] calling ${start} - ${end}`);

                let stime = new Date();
                await agent.get(`/v1/messages/summarybatch/${KLASS}/${CONTENT}/${start}/${end}/5?whitelist=false`)
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
