const CustomPage = require('./helpers/customPage')

let page;

beforeAll(async() => {
  page = await CustomPage.build();

  await page.goto('http://localhost:3000')

})
afterAll(async() => {
  await page.close()
})

describe('When logged in', async () => {
  beforeAll(async () => {
    await page.login()
  })
  afterAll(async() => {
    await page.deleteUser()
  })

  describe('When go to create blog form', async () => {

    beforeEach(async () => {
      await page.goto('http://localhost:3000/blogs')
      await page.click('.fixed-action-btn a')
    })


    test('Can see the blog form', async () => {
      const title = await page.getContentOf('form label')
      expect(title).toBe('Blog Title')
    })

    describe('And use valid inputs', async () => {
      beforeEach(async () => {
        await page.type('.title input', 'My Title')
        await page.type('.content input', 'My Content')
        await page.click('form button')
      })
      test('Submitting takes user to review screen', async () => {
        const title = await page.getContentOf('h5')
        expect(title).toBe('Please confirm your entries')
      })
      test('Submitting and confirm', async () => {
        await page.click('button.green')
        await page.waitFor('.card')
        const title = await page.getContentOf('.card .card-title')
        const content = await page.getContentOf('.card p')
        expect(title).toBe('My Title')
        expect(content).toBe('My Content')
      })
    })

    describe('And use invalid inputs', async () => {
      beforeEach(async () => {
        await page.click('form button')
      })
      test('the form shows an error message', async () => {
        const titleError = await page.getContentOf('.title .red-text')
        const contentError = await page.getContentOf('.content .red-text')
        expect(titleError).toBe('You must provide a value')
        expect(contentError).toBe('You must provide a value')
      })
    })
  })
})

// describe.only('When user is not logged in', async () => {
//   test('User cannot create blog posts', async () => {
//     const data = {title: 'My title new', content: 'Some content in my body'}
//     const result = await page.post('api/blogs', data)

//     expect(result).toEqual({ error: 'You must log in!' })
//   })

//   test('User cannot read blog posts', async () => {
//     const result = await page.get('api/blogs')

//     expect(result).toEqual({ error: 'You must log in!' })
//   })
// })

// compact way of running these tests that aim to check the same thing
// describe('When user is not logged in', async () => {
//   const actions = [
//     {
//       method: 'get',
//       path: 'api/blogs',
//     },
//     {
//       method: 'post',
//       path: 'api/blogs',
//       data: {title: 'T', content: 'C'}
//     },
//   ]
//   test('Blog related actions are prohibited', async () => {
//     const results = await page.execRequests(actions)
//     for(let result of results) {
//       expect(result).toEqual({ error: 'You must log in!' })
//     }
//   })
// })
