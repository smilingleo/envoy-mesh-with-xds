const express = require('express');
const fs = require('fs');

const app = express();

app.use((req, res, next) => {
    console.log(`access ${req.originalUrl}`);
    next();
})

const getData = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("/data.json", 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        })
    })
}

// :service_cluster and :service_node are arguments of `envoy` command.
app.get("/v1/listeners/:service_cluster/:service_node", async (req, res) => {
    const serviceCluster = req.params.service_cluster;
    const serviceNode = req.params.service_node;

    const data = await getData();
    let listeners = data.listeners[serviceCluster];

    res.status(200).json({
        "listeners": listeners
    });
});

// :route_config_name is `default` here.
app.get("/v1/routes/:route_config_name/:service_cluster/:service_node", async (req, res) => {
    const configName = req.params.route_config_name;
    const serviceCluster = req.params.service_cluster;
    const serviceNode = req.params.service_node;

    const data = await getData();
    let routes = [];
    let hostName = "";

    if (configName === "local_route") {
        routes = data.routes.local_route[serviceCluster];
        hostName = serviceCluster;
    } else {
        const remoteRoutes = data.routes.remote_route;
        const target = configName.split("_")[1]; // naming convention: `route_<target>`.
        hostName = target;
        const routeKey = Object.keys(remoteRoutes).find(key => {
            const [from, to] = key.split("_");
            return from === serviceCluster && to === target;
        });
        routes = routes.concat(remoteRoutes[routeKey]);
    }
    
    let json = {
        "virtual_hosts": [
            {
                "name": hostName,
                "domains": ["*"],
                "routes": routes
            }
        ]
    };

    res.status(200).json(json);
});

app.get("/v1/clusters/:service_cluster/:service_node", async (req, res) => {
    const serviceCluster = req.params.service_cluster;
    const serviceNode = req.params.service_node;
    
    const data = await getData();
    let clusters = [];
    switch (serviceCluster) {
        case "front":
            clusters.push(data.envoy_clusters.product);
            break;
        case "product":
            clusters.push(data.local_clusters.product);
            clusters.push(data.envoy_clusters.review);
            clusters.push(data.envoy_clusters.recommendation);
            break;
        
        case "review":
            clusters.push(data.local_clusters.review);
            break;

        case "recommendation":
            clusters.push(data.local_clusters.recommendation);
            break;
        default:
            console.log(`unexpected service cluster: ${serviceCluster}`);
            break;
    }
    res.status(200).json({
        "clusters": clusters
    });
});


const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log("xds server started at " + PORT)
})