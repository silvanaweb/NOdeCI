
const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory')

let browser, page;

beforeEach(async() => {
  browser = await puppeteer.launch({
    headless: false
  });
  page = await browser.newPage();

  await page.goto('http://localhost:3000')

})
afterEach(async() => {
  await browser.close()
})

test('the header has the correct logo text',  async() => {
  // select a DOM element
  const text = await page.$eval('a.brand-logo', el => el.innerHTML)
  expect(text).toBe('Blogster')
})


test('clicking login starts oath flow', async () => {
  await page.click('.right a')
  // check if it goes to accounts.google.com/
  const url = await page.url()
  expect(url).toContain('accounts.google.com')
})

test('when sign in should logout button', async () => {
  const user = await userFactory();

  const { session, sig } = sessionFactory(user)

  await page.setCookie({
    name: 'session',
    value: session
  })
  await page.setCookie({
    name: 'session.sig',
    value: sig
  })
  // refresh the page to simulate login, otherwise it won't change the login state
  await page.goto('http://localhost:3000')
  await page.waitFor('a[href="/auth/logout"]')

  const logoutText = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)

  expect(logoutText).toBe('Logout')
})
