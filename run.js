const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AnonymiseUA = require('puppeteer-extra-plugin-anonymize-ua')

puppeteer.use(StealthPlugin())
puppeteer.use(AnonymiseUA())

// puppeteer usage as normal
puppeteer.launch({ headless: false }).then(async browser => {
    let website = 'http://finescoop.com'
    const page = await browser.newPage()

    // Visit 20 pages per run
    for(let pagination = 0; pagination < 20; pagination++) {
        let url = (pagination === 0) ? website : `${website}/${pagination}`
        console.log(`Visiting ${url}`)
        await page.goto(url)
        await page.waitForTimeout(5000)
        // await browse_as_user(page)
        await autoScroll(page)
    }
    await browser.close()

})

/**
 * Browse the website like a normal user
 * visit webpages, slowly scroll and do
 * legit user things
 */
get_articles = async (page) => {
    const posts = await page.evaluate(() => Array.from(document.getElementsByClassName('article-post'), e => e));
    for (const post of posts) {
        await new Promise((resolve, reject) => {
            page.scrollTop = post.scrollTop
        })
    }
}

/**
 * Scroll to the very bottom
 * @param page
 * @returns {Promise<void>}
 */
const autoScroll = async (page) => {
    const posts = await page.$$('.article-post');
    for (const post of posts) {
        await new Promise((resolve) => {
            setTimeout(() => resolve(1), 2000);
        }).then(() => {
            post.evaluate(post => post.scrollIntoView({ behavior: 'smooth' }))
        })
    }
}

/**
 * Click an advertisement like a normal user
 * When scrolling down and find an ad element
 * View it and then 'decide' to click it
 */
click_as_user = async () => {
    await Promise.all([
        page.click('a.google-auto-placed'),
        page.waitForNavigation(),
    ]).catch(e => console.log(e));
}
