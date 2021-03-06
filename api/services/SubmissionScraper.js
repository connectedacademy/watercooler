
// let settings = require('./settings.json').cache;
// let _ = require('lodash');
const request = require('request-promise-native');
// let request_orig = require('request');
const URL = require('url');
const AWS = require('aws-sdk');
const fs = require('fs');
const uuid = require('uuid');
const s3 = new AWS.S3();
const path = require('path');
const sharp = require('sharp');
const sanitize = require('sanitize-html');

module.exports = {
    scrapeForSubmission: async function (req, klass, content, url) {
        let spec = {};
        //scape and return found objects
        // console.log(`https://${req.course.domain}/course/config/submission.json`);
        spec = await CacheEngine.getSubs(`https://${req.course.domain}/course/config/submission.json`);

        //process each of these as a submission
        let submissions = await putToS3(spec, req.session.passport.user.id, url, req.course.domain, klass, content);

        // return these submissions (as un-selected)
        return submissions;
    }
}

let putFileToS3 = async function (folder, name, url, thumbnail=false, content) {

    return new Promise(async (resolve, reject) => {

        let filename = `submission/${folder}/${name}/${path.basename(url)}${(content!=null)?'.html':''}`;
        // console.log(filename);

        if (!content)
            content = await request({
                uri:url,
                encoding: null
            });

        if (thumbnail)
        {
            let thumbnail_name = `submission/${folder}/${name}/thumb/medium.jpg`;
            // console.log("making thumb",url, thumbnail_name);
            let newimg = await sharp(content).resize(800,800).jpeg().toBuffer();
            s3.upload({
                Body: newimg,
                Bucket: process.env.AWS_S3_BUCKET,
                Key: thumbnail_name,
                ACL: 'public-read'
            }, function (err) {  //2 months
                if (err)
                   return reject(err);
            });
        }

        s3.upload({
            Body: content,
            Bucket: process.env.AWS_S3_BUCKET,
            Key: filename
        }, function (err) {  //2 months
            // console.log(err,data);
            // console.log(err);
            if (err)
                return reject(err);
            else
                return resolve(filename);
        });
    });
};

let putToS3 = async function (settings, user, url, course, klass, cnt) {
    sails.log.verbose('SubmissionScraperS3', url, user);
    // get the target content

    if (!settings.mediatype)
        settings.mediatype = 'image';

    let content = '';
    try
    {
        let tmpurl = url;
        if (!_.startsWith(tmpurl, 'http'))
            tmpurl = `https://${tmpurl}`;

        //attempt to get contents of this url
        content = await request(tmpurl);
    }
    catch (exception)
    {
        sails.log.verbose("SubmissionScraper",{msg: 'Not a url', url:url});
        //assume that the content is not a url, but the actual content
        content = url;
        //replace regex for capture to collect content rather than url from the input
        if (settings.mediatype == 'text')
        {
            settings.denominator = ["^([\\s\\S]*)$"];
            settings.capture = [{
                pattern:"^([\\s\\S]*)$"
            }]
        }
    }

    // console.log(content);

    // //DEBUG:
    // settings = {
    //     "denominator":["(<article[\\s\\W\\w]*<\\/article>)"],
    //     "capture": [
    //       {
    //         "pattern": "<div class=\"the-content\".*>([\\s\\W\\w]*?)<\\/div>"
    //       }
    //     ],
    //     "preview": "<h1 class=\"title\">([\\s\\W\\w]*)<\\/h1>",
    //     "mediatype":"text"
    // };

    // parse for the capture object

    // console.log(settings);
    let denominators = settings.denominator;

    let capture_denom = [];
    let captured_content;
    for (let denom of denominators) {
        let regex = new RegExp(denom.replace("\\\\", "\\"), 'g');
        while (captured_content = regex.exec(content)) {
            if (captured_content)
                capture_denom.push(captured_content[1]);
        }
    }

    if (_.size(capture_denom) == 0)
        throw new Error('No submissions captured');

    let promises = [];

    //for each item on the page
    for (let itemonpage of capture_denom) {

        //START FROM itemonpage...
        let capturedcontent = [];

        for (let cap of settings.capture) {
            if (cap.ident)
            {
                //find ident:
                let regex = new RegExp(cap.ident.replace("\\\\", "\\"),'g');
                let ident_capture = regex.exec(itemonpage);
                // console.log(ident_capture);
                if (ident_capture)
                {
                    let identity = ident_capture[1];

                    // console.log("identity",identity);

                    let regex = new RegExp(cap.pattern.replace("\\\\", "\\").replace('{{ident}}',identity),'g');
                    // console.log(regex);

                    let captured_content = regex.exec(content);
                    if (captured_content)
                        capturedcontent.push(captured_content[1]);
                }
            }
            else
            {
                let regex = new RegExp(cap.pattern.replace("\\\\", "\\"),'g');
                let captured_content = regex.exec(content);
                if (captured_content)
                    capturedcontent.push(captured_content[1]);
            }
        }
        
        //add original capture
        if (settings.rawtext == 'image')
            capturedcontent.push(itemonpage);


        if (capturedcontent.length > 0) {
            
            let parsed = URL.parse(url);
            let preview = false;
            let title = '';
            
            // console.log(capturedcontent);
           
            //cache the capture object and all references (i.e. src, data-4c links: img, json, sidecar)
            let regex = new RegExp(settings.preview.replace("\\\\", "\\"));
            // console.log(regex);
            // console.log("looking for preview");
            // console.log(capturedcontent.join());
            let preview_results = regex.exec(itemonpage);
            // console.log(regex);
            // console.log(preview_results);
            
            // console.log(preview_results);
            //get resources:
            // PREVIEW LINK
            if (preview_results && preview_results.length > 1)
                preview = preview_results[1];


            if (settings.mediatype == 'image')
            {
                if (!preview.startsWith('http')) {
                    preview = URL.resolve(parsed.protocol + '//' + parsed.host + parsed.pathname, preview);
                }
            }
            else
            {
                title = preview;
                if (title == "")
                    title = `${_.trunc(itemonpage)}`;
            }

            // console.log(title);
            
            //change the links in the doc:
            capturedcontent = _.map(capturedcontent, (c) => {
                return c.replace(/(src=")(.*?)"/, function (all, src, token) {
                    if (!token.startsWith('http')) {
                        return 'src="' + URL.resolve(parsed.protocol + '//' + parsed.host + parsed.pathname, token) + '"';
                    }
                    else {
                        return 'src="' + token + '"';
                    }
                });
            });

            //sanitize:
            let capturedhtml = capturedcontent.join('');
            if (settings.mediatype == 'text')
                capturedhtml = sanitize(capturedhtml,{
                    allowedTags: sanitize.defaults.allowedTags.concat([ 'img' ])
                });

            promises.push(new Promise(function (resolve, reject) {

                Submission.create({
                    matched: true,
                    html: capturedhtml,
                    thumbnail: (!title)?preview:undefined,
                    title: (title)?title:undefined,
                    mediatype: settings.mediatype, 
                    user: user,
                    course: course,
                    original: url,
                    class: klass,
                    content: cnt,
                    verified: false
                }).exec(async function (err, submission) {
                    if (err)
                        return reject(err);

                    let folder_name = submission.id;
                    let promises = [];

                    if (settings.mediatype == 'image')
                    {
                    //resize and upload thumbnail of submission:
                        promises.push(putFileToS3(folder_name, 'content', preview, true));
                    }
                    //upload content that was scraped
                    promises.push(putFileToS3(folder_name, 'content', url, false, content));
                    await Promise.all(promises);

                    resolve(submission);
                });

            }));
        }
    }

    return await Promise.all(promises);
};