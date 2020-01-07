const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

client.on('error', err => console.log(`Error ${err}`));


const rateLimiter = function(req, res, next) {
    const token = req.ip;
    client
        .multi()
        .set(token, 0, 'NX')
        .expire(token,60)
        .incr(token)
        .exec((err, replies) => {
            if (err) {
                return res.status(500).send(err.message)
            }
            const reqCount = replies[1];
            console.log(replies);
            console.log(req.ip);
            if (reqCount > 20) {
                return res
                    .status(403)
                    .send(`Limit of connections per minute exceeded`)
            }
            return next()
        })
};

module.exports = rateLimiter;