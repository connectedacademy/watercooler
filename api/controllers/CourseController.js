module.exports = {

    spec: async (req,res)=> {
        try
        {
            var data = await CacheEngine.getSpec(req,res);

            data.baseUri = req.course.url + '/course/content/';

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