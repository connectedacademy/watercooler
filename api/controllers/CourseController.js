let applyFrontMatter = async (data,uri)=>{
    let courseinfo = await CacheEngine.getFrontmatter(uri);
    _.extend(data, courseinfo);
    delete data.published;
    if (data.video)
        delete data.url;
}

module.exports = {

    spec: async (req,res)=> {
        try
        {
            let lang = await LangService.lang(req);

            var data = await CacheEngine.getSpec(req,res);

            let promises = [];

            //course info:
            promises.push(applyFrontMatter(data, req.course.url + '/course/content/' + lang + '/info.md'));
            
            let totals = await GossipmillApi.allTotals(req.course.domain);
            // console.log(totals);

            //for each file in the spec, get the markdown and parse it:
            for (let klass of data.classes)
            {
                promises.push(applyFrontMatter(klass, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/info.md'));
                for (let content of klass.content)
                {
                    //apply likes:

                    if (content.url)
                    {
                        content.likes = totals[klass.slug + '/' + content.slug];
                        promises.push(applyFrontMatter(content, req.course.url + '/course/content/' + lang + '/' + klass.dir + '/' + content.url));
                    }
                }
            }

            await Promise.all(promises);

            data.baseUri = req.course.url + '/course/content/' + lang + '/';
            data.currentLang = lang;

            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    hubs: async (req,res) =>{
        try
        {
            var data = await CacheEngine.getHubs(req,res);
            return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    }
}