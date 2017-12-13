/* OPTIONS */
// How tall in blocks is the virtual 'window' each user is scrolling with.
const WINDOW_RANGE = 60;
// What is the range of blocks that a users can start from
const START_VARIATION = 60;
// What is the length of the content (seconds)
const MAX_TIME = 1700;
// Speed of scrolling through each block (seconds)
const DELAY = 5000;
// Number of virtual users
const NUM_AGENTS = 1;
// Range of time within which virtual users will start (seconds)
const INIT_DELAY = 1700;
// If true, users will randomly scroll to a new block within the class each cycle
const RANDOM_PLAYBACK = true;
// If true, users will create messages as well as scroll content
const CREATE_MESSAGES = true;
// If true, all users will login as USER (pre-existing user)
const USER_LOGIN = true;
// Pre-existing user account to log in as
const USER = 'tombartindale';
// Course to operate on
const URL = 'talkingpictures.connectedacademy.io';
// Class to operate on
const KLASS = 'evidence';
// Live class content to operate on
const CONTENT = 'liveclass';
// If true, the first user will become a teacher and the rest of the users will join a classroom
const INCLASSROOM = false;
// If true, users will login as individual fake users with clean registrations
const FAKE_USER_LOGIN = true;
// Probability that each user will create a message in each block they visit.
const CREATION_PROBABILITY = 1;
// URL of the api operating on
const API = 'https://api.connectedacademy.io';


/* DO NOT EDIT BELOW THIS LINE */
let _ = require('lodash');
var request = require('supertest-as-promised');
var bluebird = require('bluebird');
let PSK = '';

PSK = process.env.PSK;
go();

async function go()
{
    let agents = [];
    for (let i=0;i<NUM_AGENTS;i++)
    {
        let a = request.agent(API);    
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
                    // if (Math.random() > 0.91)
                    if (Math.random() > (1-CREATION_PROBABILITY))
                    {

                        let text = `#test loadtest message from ${name} at ${new Date()} https://${URL}/#/course/${KLASS}/${CONTENT}/${start}`;
                        await agent.post(`/v1/messages/create`)
                        .send({
                            text: text
                        })
                        .set('Referer', `https://${URL}`);
                        console.log(`[${name}] created message at ${start}`);


                        await bluebird.delay(1000);
                        let checkblock = await agent.get(`/v1/messages/list/${KLASS}/${CONTENT}/${start}/${end}?whitelist=false`)
                        .set('Referer',`https://${URL}`)
                        .expect(200);
                        // console.log(_.map(checkblock.body.data,'text'));
                        let expected = `${text}`;
                        // console.log(`expecting ${expected}`);
                        let exists = _.find(checkblock.body.data,{text:expected});
                        if (!exists)
                            console.error('Message NOT FOUND');
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
