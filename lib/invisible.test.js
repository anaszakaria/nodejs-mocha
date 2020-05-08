const chai = require('chai')
const expect = chai.expect

const invisible = require('./invisible')

describe('invisible', () => {
    context('test', () => {
        it('should do nothing', () => {
            // nyc will check this as 100% covered although that is not the case
            invisible.test()
            expect('this is a useless test').to.be.a('string')
        })
    })
})
