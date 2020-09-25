// possible implementation of a login function for puppeteer Page

const Page = require('puppeteer/lib/Page')

Page.prototype.login = async function() {
  const user = await userFactory();

  const { session, sig } = sessionFactory(user)

  await this.setCookie({
    name: 'session',
    value: session
  })
  await this.setCookie({
    name: 'session.sig',
    value: sig
  })
  // refresh the page to simulate login, otherwise it won't change the login state
  await this.goto('http://localhost:3000')
  await this.waitFor('a[href="/auth/logout"]')
}
