module.exports = {

    spec: async (req,res)=> {
        try
        {
            var data = await CacheEngine.getSpec(req,res);

            //TODO: put this back when dns issues sorted
            // data.baseUri = req.course.url + '/content/';
            data.baseUri = "https://connectedacademy.github.io/testclass/content/"

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