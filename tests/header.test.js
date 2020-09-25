
const CustomPage = require('./helpers/customPage')

let page;

beforeEach(async() => {
  page = await CustomPage.build();

  await page.goto('http://localhost:3000')

})
afterEach(async() => {
  await page.close()
  await page.deleteUser()
})

test('the header has the correct logo text',  async() => {
  // select a DOM element
  const text = await page.getContentOf('a.brand-logo')
  expect(text).toBe('Blogster')
})


test('clicking login starts oath flow', async () => {
  await page.click('.right a')
  // check if it goes to accounts.google.com/
  const url = await page.url()
  expect(url).toContain('accounts.google.com')
})

test('when sign in should logout button', async () => {
  await page.login()

  const logoutText = await page.getContentOf('a[href="/auth/logout"]')

  expect(logoutText).toBe('Logout')
})
