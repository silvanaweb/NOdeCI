const puppeteer = require('puppeteer')
const sessionFactory = require('../factories/sessionFactory')
const userFactory = require('../factories/userFactory')
const mongoose = require('mongoose')
const User = mongoose.model('User');

class CustomPage {

  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      // decrease the amount of time of testing used by Travis
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page)

    return new Proxy(customPage, {
      get: function(target, property) {
        return target[property] || browser[property] || page[property]
      }
    })
  }

  constructor(page) {
    this.page = page
    this.user = {}
  }

  async login() {
    this.user = await userFactory();

    const { session, sig } = sessionFactory(this.user)

    await this.page.setCookie({
      name: 'session',
      value: session
    })
    await this.page.setCookie({
      name: 'session.sig',
      value: sig
    })
    // refresh the page to simulate login, otherwise it won't change the login state
    await this.page.goto('http://localhost:3000/blogs')
    await this.page.waitFor('a[href="/auth/logout"]')
  }

  async deleteUser() {
    await User.findOneAndRemove({_id: this.user._id})
  }

  async getContentOf(selector) {
    return await this.page.$eval(selector, el => el.innerHTML)
  }

  async get(path) {
    return this.page.evaluate(
      (_path) => {
        return fetch(_path, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(res => res.json())
      }
    ,path)
  }
  async post(path, body) {
    return this.page.evaluate(
      (_path, _body) => {
        return fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(_body)

        }).then(res => res.json())
      }
    ,path, body)
  }

  async execRequests(actions) {
    return Promise.all(actions.map(({ method, path, data }) => {
      return this[method](path, data)
    }))
  }
}

module.exports = CustomPage
