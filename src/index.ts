import chromium from 'chrome-aws-lambda';


export async function handler(event) {
    if (!event.body) {
        const response = {
            statusCode: 400,
            body: {msg: "bad request"}
        };
    
        return response;    
    }
    try {
        const object = JSON.parse(event.body)
        if (!object.rootLink || !object.link) {
            const response = {
                statusCode: 400,
                body: {msg: "bad no rootLink link"}
            };
        
            return response;    
        }
        console.log("what is object", object)
        const shortlink = await run(object);
    
        const response = {
            statusCode: 200,
            body: {shortlink}
        };
    
        return response;    
    } catch (error) {
        const response = {
            statusCode: 200,
            body: {error}
        };

        return response;
    }
    
}

export async function run({
    rootLink,
    link,
    sid1,
    sid2,
    sid3,
}): Promise<string> {
    console.log("run", rootLink,link,sid1,sid2,sid3)
    const browser = await chromium.puppeteer.launch({
        args: [...chromium.args, '--proxy-server=zproxy.lum-superproxy.io:22225'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.authenticate({
        username: 'brd-customer-hl_c1fd76a1-zone-residential',
        password: '3pnfun25qv02'
    });

    await page.goto("https://www.lazada.co.th/wow/i/th/ecommerce/aff-short-link", {waitUntil: 'networkidle2'})
    console.log(await page.content())
    console.log("wait for selector master link")
    await page.waitForSelector("#masterLink")

    console.log("start type on masterLink", rootLink)
    await page.type('#masterLink', rootLink);
    console.log("start type on sourceUrl", link)
    await page.type('#sourceUrl', link);

    if (sid1 && sid1.length > 0) {
        await page.type('#subId1', sid1);
    }
    if (sid2 && sid2.length > 0) {
        await page.type('#subId2', sid2);
    }
    if (sid3 && sid3.length > 0) {
        await page.type('#subId3', sid3);
    }

    await page.click("#submitButton")

    await page.waitForFunction('document.getElementById("affShortLink").innerHTML != ""');


    const shortlink = await page.$eval('#affShortLink', el => el.innerHTML)
    console.log("shortlink", shortlink)
    await page.close();
    await browser.close()

    return shortlink
}