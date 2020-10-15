const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AnonymiseUA = require('puppeteer-extra-plugin-anonymize-ua')

puppeteer.use(StealthPlugin())
puppeteer.use(AnonymiseUA())


/**
 * Run the bot
 */
run = async() => {
    const browser = await puppeteer.launch({
        args: ['--disable-features=site-per-process'],
        headless: true
    })
    while (true) {
        const website = 'https://finescoop.com'
        const page = await browser.newPage()

        // Visit 20 pages per run
        for (let pagination = 0; pagination < 20; pagination++) {
            let url = (pagination === 0) ? website : `${website}/${pagination}`

            // Visit an index page
            console.log(`Visiting ${url}`)
            await page.goto(url)
            await page.waitForTimeout(1000)

            // Scroll to bottom of index page
            await autoScroll(page, '.article-post')

            // Click an advert on the index page
            await click_as_user(page)

            // Read all article links
            await read_articles(page)
        }
        await browser.close()
    }
}

/**
 * Read articles and visit ads
 * @param page
 * @returns {Promise<void>}
 */
read_articles = async (page) => {
    const articles = await page.$$eval('.article-post', anchors => [].map.call(anchors, a => a.href));
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
 * Click an advertisement ever 100 times
 * @param page
 * @returns {Promise<void>}
 */
click_as_user = async (page) => {
    // Click ads 1% of the time
    if (Math.random() < 0.99) {
        return
    }

    await page.waitForSelector('.google-auto-placed iframe', { visible: true })
    const advert = await page.$('.google-auto-placed iframe')
    const frame = await advert.contentFrame()

    // Scroll in to advert position
    advert.evaluate(advert => advert.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'center'
    }))

    // Wait for the advert to load
    await frame.click('.title-link')
    await page.waitForNavigation()
    await page.screenshot({path: 'screenshot.png'});
}

run()