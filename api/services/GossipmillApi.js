// let io = require('sails.io.js')( require('socket.io-client') );
let request = require('request');

let baseURI = process.env.GOSSIPMILL_URL;

module.exports = {

    visualisation: async (course, klass, user, language)=>{

    },

    totals: async (pageuri, user, language)=>{

    },

    list: async (course, klass, user, language)=>{

    },

    subscribe: async (req,res) =>{

    },

    create: async (credentials, user, message)=>{
        let response = await request({
            url: basedURI + 'messages/create',
            method: 'POST',
            body:{
                text: message.text,
                replyto: message.replyto,
                retweet: message.retweet,
                credentials:{
                    service: user.service,
                    key: credentials.key,
                    secret: credentials.secret,
                    token: user.credentials.token,
                    tokenSecret: user.credentials.tokenSecret
                }
            },
            qs: {
                psk: process.env.GOSSIPMILL_PSK
            }
        });
        return response;
    }
}