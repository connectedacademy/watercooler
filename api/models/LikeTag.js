module.exports = {
    orientdbClass : 'document',
    attributes: {
      user:
      {
        model: 'User'
      },
      course: 'string',
      class: 'string',
      content: 'string',

      toJSON :function()
      {
        let obj = this.toObject();
        delete obj['@type'];
        delete obj['@class'];
        delete obj['@version'];
        return obj;
      }
  
    },

    getUserLiked: async function(course,klass,user)
    {
      let query = "SELECT content, eval('COUNT(@rid) > 0') as liked FROM liketag WHERE course=:course AND class=:class AND user=:user GROUP BY content";
      let likes = await LikeTag.query(query,{
          params:
          {
              course: course,
              class: klass,
              user: user
          }
      });
      var mapped = {};
      for (let v of likes)
      {
        mapped[v.content] = v.liked;
      }
      return mapped;
    },

    getLikesGrouped: async function(course, klass)
    {
        let query = "SELECT content, COUNT(@rid) as total FROM liketag WHERE course=:course AND class=:class GROUP BY content";
        let likes = await LikeTag.query(query,{
            params:
            {
                course: course,
                class: klass
            }
        });
        var mapped = {};
        for (let v of likes)
        {
          mapped[v.content] = v.total;
        }
        return mapped;
    }
  };
  