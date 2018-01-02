const express = require('express')
const _ = require('lodash')
const app = express()

app.use((req, res, next) => {
    console.log(JSON.stringify(req.headers));
    next();
})

app.get('/reviews', (req, res) => {
    const pIds = req.query.ids;
    const results = pIds.split(",").map(pid => {
        const reviews = _.range(0, _.random(0, 3)).map(i => {
            return Object.assign({}, {
                "createdOn": Date.now(),
                "review": "some review"
            })
        });
        return Object.assign({}, {
            pid: parseInt(pid),
            reviews: reviews
        })
    })
    res.status(200).json(results);
})


const PORT = process.env.PORT ?  parseInt(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log("review server started at " + PORT)
})