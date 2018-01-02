const express = require('express')
const _ = require('lodash')
const app = express()

app.get('/recommendations', (req, res) => {
    const pIds = req.query.ids;
    const results = pIds.split(",").map(pid => {
        const recommendations = _.range(0, _.random(0, 3)).map(i => _.random(pid * 10));
        return Object.assign({}, {
            pid: parseInt(pid),
            recommendations: recommendations
        })
    })
    res.status(200).json(results);
})


const PORT = process.env.PORT ?  parseInt(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log("recommendation server started at " + PORT)
})