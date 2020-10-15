const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

// puppeteer usage as normal
puppeteer.launch({ headless: true }).then(async browser => {
    while(true) {
        let website = 'http://finescoop.com'
        const page = await browser.newPage()

        // Visit 20 pages per run
        for (let pagination = 0; pagination < 20; pagination++) {
            let url = (pagination === 0) ? website : `${website}/${pagination}`

            // Visit an index page
            console.log(`Visiting ${url}`)
            await page.goto(url)
            await page.waitForTimeout(5000)

            // Click an advert on the index page
            await click_as_user(page)

            // Scroll to bottom of index page
            await autoScroll(page, '.article-post')

            // Read all article links
            await read_articles(page)
        }
        await browser.close()
    }
})

/**
 * Browse the website like a normal user
 * visit webpages, slowly scroll and do
 * legit user things
 */
read_articles = async (page) => {
    const articles =  await page.$$eval('.article-post', anchors => [].map.call(anchors, a => a.href));
    for (const article of articles) {
        console.log(`Visiting ${article}`)
        await page.goto(article)
        await autoScroll(page, '#content p');
        await click_as_user(page)
    }
}

/**
 * Scroll to the very bottom
 * @param page
 * @returns {Promise<void>}
 */
const autoScroll = async (page, selector) => {
    const selectors = await page.$$(selector);
    for (const selector of selectors) {
        await new Promise((resolve) => {
            setTimeout(() => resolve(1), Math.floor(1000 + Math.random() * 9000));
        }).then(() => {
            selector.evaluate(post => post.scrollIntoView({ behavior: 'smooth' }))
        })
    }
}

/**
 * Click an advertisement like a normal user
 * When scrolling down and find an ad element
 * View it and then 'decide' to click it
 */
click_as_user = async (page) => {
    // Click ads 1% of the time
    if (Math.random() < 0.99) {
        return
    }

    // Scroll and click and advertisement
    await new Promise(async (resolve) => {
        await page.$('a.google-auto-placed', ad => ad.scrollIntoView({ behavior: 'smooth' }))
        await page.click('a.google-auto-placed')
        await page.waitForNavigation()
        await page.back()
        resolve(1)
    })
}
