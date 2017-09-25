describe('Course Info', function() {
    
    describe('Schedule',function(done){
        it ('should return valid schedule',function(done){
            
            global.freshuser
                .get('/v1/course/schedule')
                .set('Referer',process.env.TEST_DOMAIN)
                .expect(200)
                .end(done);
        });
    });

    describe('Spec',function(done){
        it ('should return valid spec',function(done){
            
            global.freshuser
                .get('/v1/course/spec/interpretation')
                .set('Referer',process.env.TEST_DOMAIN)
                .expect(200)
                .end(done);
        });
    });
});