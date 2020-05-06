const chai = require('chai')
const expect = chai.expect

var User = require('./user')

describe('User model', () => {
    it('should return error if required areas are missing', (done) => {
        let user = new User()

        user.validate((error) => {
            // user.validate - built mongoose function
            expect(error.errors.name).to.exist // required: true
            expect(error.errors.email).to.exist // required: true
            expect(error.errors.age).to.not.exist
            done()
        })
    })

    it('should have optional age field', (done) => {
        let user = new User({
            name: 'Anas',
            email: 'anas@email.com',
            age: 40,
        })

        expect(user).to.have.property('age').equal(40)
        done()
    })
})
