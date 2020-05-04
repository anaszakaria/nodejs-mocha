const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)

var mongoose = require('mongoose')

var users = require('./users')
var User = require('./models/user')

var sandbox = sinon.createSandbox()

describe('users', () => {
    let findSub
    let sampleArgs
    let sampleUser

    beforeEach(() => {
        sampleUser = { id: 123, name: 'Anas', email: 'anas@email.com' }
        findStub = sandbox.stub(mongoose.Model, 'findById').resolves(sampleUser)
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('get', () => {
        it('should check for an id', (done) => {
            users.get(null, (error, result) => {
                expect(error).to.exist
                expect(error.message).to.equal('Invalid user id')
                done()
            })
        })

        it('should call findUserById with id and return result', (done) => {
            sandbox.restore() // clear beforeEach
            let stub = sandbox.stub(mongoose.Model, 'findById').yields(null, {
                id: 123,
                name: 'Anas',
                email: 'anas@email.com',
            })

            users.get(123, (error, result) => {
                expect(error).to.not.exist
                expect(stub).to.have.been.calledOnce
                expect(stub).to.have.been.calledWith(123)
                expect(result).to.be.a('object')
                expect(result).to.have.property('name').to.equal('Anas')
                expect(result).to.have.property('id').to.equal(123)
                done()
            })
        })

        it('should catch error if there is one', (done) => {
            sandbox.restore()
            let stub = sandbox
                .stub(mongoose.Model, 'findById')
                .yields(new Error('Something is wrong'))

            users.get(123, (error, result) => {
                expect(result).to.not.exist
                expect(error).to.exist
                expect(error).to.be.instanceOf(Error)
                expect(stub).to.have.been.calledWith(123)
                expect(error.message).to.equal('Something is wrong')
                done()
            })
        })
    })
})
