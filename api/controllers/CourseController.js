let applyFrontMatter = async (data,uri)=>{
    let courseinfo = await CacheEngine.getFrontmatter(uri);
    _.extend(data, courseinfo);
    delete data.published;
}

module.exports = {

    spec: async (req,res)=> {
        try
        {
            var data = await CacheEngine.getSpec(req,res);

            let promises = [];

            //course info:
            // let courseinfo = await CacheEngine.getFrontmatter(req.course.url + '/course/content/' + LangService.lang(req) + '/info.md');
            // _.extend(data, courseinfo);
            promises.push(applyFrontMatter(data, req.course.url + '/course/content/' + LangService.lang(req) + '/info.md'));

            //for each file in the spec, get the markdown and parse it:
            for (let klass of data.classes)
            {
                promises.push(applyFrontMatter(klass, req.course.url + '/course/content/' + LangService.lang(req) + '/' + klass.dir + '/info.md'));
                
                // let klassinfo = await CacheEngine.getFrontmatter(req.course.url + '/course/content/' + LangService.lang(req) + '/' + klass.dir + '/info.md');
                // _.extend(klass, klassinfo);

                for (let content of klass.content)
                {
                    promises.push(applyFrontMatter(content, req.course.url + '/course/content/' + LangService.lang(req) + '/' + klass.dir + '/' + content.url));
                    
                    // let contentinfo = await CacheEngine.getFrontmatter(req.course.url + '/course/content/' + LangService.lang(req) + '/' + klass.dir + '/' + content.url);
                    // _.extend(content,contentinfo);
                }
            }

            let results = await Promise.all(promises);

            data.baseUri = req.course.url + '/course/content/' + LangService.lang(req) + '/';
            data.currentLang =  LangService.lang(req);

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