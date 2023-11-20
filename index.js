// Al-Hassan Ali Badawy
const http = require('http');
const fs = require('fs');
const url = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

// json data (String)
const data = fs.readFileSync(`${__dirname}/data.json`, 'utf-8');
// dataObj is an array of Objects that is in data.json
const dataObj = JSON.parse(data);

const slugs = dataObj.map(el => slugify(el.productName, {lower : true}));
console.log(slugs);

// console.log(slugify('Hello world', {
//     lower : true,
// }))

// loading templates
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');


// Starting our server
const server = http.createServer((req, res) => {
    const {query, pathname} = url.parse(req.url, true);
    // console.log("Q => ", query);

    if(pathname == '/' || pathname == '/overview') {
        res.writeHead(200, {'Content-type' : 'text /html'});

        // iterating over the Objects to replace the placeholders with it's data
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        
        res.end(output);
    }
    else if(pathname == '/product') {
        // Querying with productName()
        if(query.id == undefined) {
            let myProduct = undefined;
            for(let p of dataObj) {
                if(slugify(p.productName, {replacement: '-', lower : true}) == slugify(query.productName, {replacement: '-', lower : true})){
                    myProduct = p; 
                    break;
                }
            } 
            
            // console.log("My = ", myProduct);
            if(myProduct != undefined) {
                res.writeHead(200, {'Content-type' : 'text/html'});
                const output = replaceTemplate(tempProduct, myProduct);
                res.end(output);
            }
            else {
                res.writeHead(404, {
                    'Content-type' : 'text/html'
                });
                res.end("<h1>Page Not found!</h1>")
            }
        }
        // Querying with id
        else {
            let  myProduct = dataObj[query.id];
            res.writeHead(200, {'Content-type' : 'text/html'});
            const output = replaceTemplate(tempProduct, myProduct);
            res.end(output);
        }
    }
    else if(pathname == '/api') {
        res.writeHead(404, {'Content-type' : 'application/json'});
        res.end(data);
    }
    // Not Found Page!
    else { 
        res.writeHead(404, {
            'Content-type' : 'text/html'
        });
        res.end("<h1>Page Not found!</h1>")
    }
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
})

