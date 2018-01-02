const express = require('express')
const _ = require('lodash')
const Client = require('node-rest-client').Client;


const app = express()
const client = new Client();

const reviewURI = process.env.REVIEW_URI;
if (!reviewURI) {
    console.error("REVIEW_URI environment variable expected but not set.")
    return;
}

const recommendationURI = process.env.RECOMMENDATION_URI;
if (!recommendationURI) {
    console.error("RECOMMENDATION_URI environment variable expected but not set.")
    return;
}

const getProducts = () => {
  const start = _.random(1, 1000);
  return _.range(start, start + 10).map((i) => Object.assign({}, {
      id: i,
      name: "product - " + i
  }));
}

const TRACE_HEADERS_TO_PROPAGATE = [
    'X-Ot-Span-Context',
    'X-Request-Id',
    'X-B3-TraceId',
    'X-B3-SpanId',
    'X-B3-ParentSpanId',
    'X-B3-Sampled',
    'X-B3-Flags'
]
const query = (uri, headers, pids) => {
    return new Promise((resolve, reject) => {
        const request = client.get(uri, {
                parameters: {ids: pids},
                headers: headers
            }, (data, resp) => {
                if (data) {
                    resolve(data);
                } else {
                    reject(resp);
                }
            });
        request.on('error', e => {
            reject(e);
        })

        request.on('requestTimeout', req => {
            reject(new Error("request timeout"))
        })
    });
}

const merge = (products, reviews, recommendations) => {
    return products.map(product => {
        let obj = Object.assign({}, product)
        const r = reviews.find(review => review.pid === product.id);
        if (r) {
            obj.reviews = r.reviews
        }

        const recommend = recommendations.find(r => r.pid === product.id);
        if (recommend) {
            obj.recommendations = recommend.recommendations;
        }
        return obj;
    })
}

/////////////// APIs ////////////////////////
app.get('/products', (req, res) => {
    const products = getProducts();
    res.status(200).json(products);
})

app.get('/product-list', async (req, res) => {    
    const products = getProducts();
    const ids = products.map(p => p.id).join(",");

    // propragate envoy headers
    let headers = {};
    TRACE_HEADERS_TO_PROPAGATE.forEach(name => {
        if (req.headers[name.toLocaleLowerCase()]) {
            headers[name] =req.headers[name.toLocaleLowerCase()];
        }
    })
    
    let reviews = [];
    try {
        reviews = await query(reviewURI, headers, ids);        
    } catch (error) {
        res.status(500).json({
            errorMsg: 'review service unavailable'
        })
    }

    let recommendations = []
    try {
        recommendations = await query(recommendationURI, headers, ids);
    } catch (error) {
        res.status(500).json({
            errorMsg: "recommendation service unavailable"
        })
    }

    const list = merge(products, reviews, recommendations);

    res.status(200).json(list);
})


const PORT = process.env.PORT ?  parseInt(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log("app server started at " + PORT)
})