module.exports = {
    
    //TODO: notifications

    // course starting (1 week before)
    
    // course starting (day before)

    // EACH WEEK

        // read pre-content

        // post your submission e.g. 4c

        // join a discussion
            // - you have new messages
            // - you should submit more feedback

        // join the live class

        // read the deep-dive

        // the webinar is soon

        // get ready for next week

    // Final questionaire push

    // notification of a new peer discussion message
    newPeerMessage: (message)=>{
        sails.log.verbose('Sending offline notification about new peer message',message);
    }
}