const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache')

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const blogs = await Blog
      .find({ _user: req.user.id })
      .cache({key: req.user.id});

    res.send(blogs);
  });

  // app.get('/api/blogs', requireLogin, async (req, res) => {
  //   const redis = require('redis');
  //   const redisUrl = 'redis://127.0.0.1:6379';
  //   const client = redis.createClient(redisUrl);
  //   const util = require('util')
  //   // transform the callback into a promise
  //   client.get = util.promisify(client.get)
  //   // che if hte cache exists
  //   const cachedBlogs = await client.get(req.user.id);
  //   if(cachedBlogs) {
  //     console.log('SERVICING FROM CACHE')
  //     return res.send(JSON.parse(cachedBlogs))
  //   }

  //   const blogs = await Blog.find({ _user: req.user.id });
  //   res.send(blogs);

  //   console.log('SERVING FROM MONGODB')
  //   client.set(req.user.id, JSON.stringify(blogs))
  // });

  // we have to add the middleware after we know that the post has been added
  // but because the way express is wired up, there is no easy way  because the middlewares like 'requireLogin' are run before
  // So we will act directly inside the middleware to execute it afterwards
  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }

    // i want to clear the cache in a more automatic way
    // clearHash(req.user.id)
  });
};
