const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const rewire = require('rewire')

var mongoose = require('mongoose')

var users = rewire('./users')
var User = require('./models/user')
var mailer = require('./mailer')

var sandbox = sinon.createSandbox()

describe('users', () => {
    let findSub
    let deleteStub
    let sampleUser
    let mailerStub

    beforeEach(() => {
        sampleUser = {
            id: 123,
            name: 'Anas',
            email: 'anas@email.com',
            save: sandbox.stub().resolves(),
        }
        findStub = sandbox.stub(mongoose.Model, 'findById').resolves(sampleUser)
        deleteStub = sandbox
            .stub(mongoose.Model, 'remove')
            .resolves('User removed')
        mailerStub = sandbox
            .stub(mailer, 'sendWelcomeEmail')
            .resolves('fake_email')
    })

    afterEach(() => {
        sandbox.restore()
        users = rewire('./users') // reset changes done by users function
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

    context('delete user', () => {
        it('should check for an id using return', () => {
            return users
                .delete()
                .then((result) => {
                    throw new Error('unexpected success')
                })
                .catch((error) => {
                    expect(error).to.be.instanceOf(Error)
                    expect(error.message).to.equal('Invalid id')
                })
        })

        it('should check for error using eventually', () => {
            return expect(users.delete()).to.eventually.be.rejectedWith(
                'Invalid id'
            )
        })

        it('should call User.remove', async () => {
            let result = await users.delete(123)
            expect(result).to.equal('User removed')
            expect(deleteStub).to.have.been.calledWith({ _id: 123 })
        })
    })

    context('create user', () => {
        let FakeUserClass, saveStub, result

        beforeEach(async () => {
            saveStub = sandbox.stub().resolves(sampleUser)
            FakeUserClass = sandbox.stub().returns({ save: saveStub })

            users.__set__('User', FakeUserClass)
            result = await users.create(sampleUser)
        })

        it('should reject invalid arguments', async () => {
            await expect(users.create()).to.eventually.be.rejectedWith(
                'Invalid arguments'
            )
            await expect(
                users.create({ name: 'Anas' })
            ).to.eventually.be.rejectedWith('Invalid arguments')
            await expect(
                users.create({ email: 'anas@email.com' })
            ).to.eventually.be.rejectedWith('Invalid arguments')
        })

        it('should call User with new', () => {
            expect(FakeUserClass).to.have.been.calledWithNew
            expect(FakeUserClass).to.have.been.calledWith(sampleUser)
        })

        it('should save the user', () => {
            expect(saveStub).to.have.been.called
        })

        it('should call mailer with email and name', () => {
            expect(mailerStub).to.have.been.calledWith(
                sampleUser.email,
                sampleUser.name
            )
        })

        it('should reject errors', async () => {
            saveStub.rejects(new Error('fake'))
            await expect(
                users.create(sampleUser)
            ).to.eventually.be.rejectedWith('fake')
        })
    })

    context('update user', () => {
        it('should find user by id', async () => {
            await users.update(123, { age: 35 })
            expect(findStub).to.have.been.calledWith(123)
        })

        it('should call user.save', async () => {
            await users.update(123, { age: 35 })
            expect(sampleUser.save).to.have.been.calledOnce
        })

        it('should reject if there is an error', async () => {
            findStub.throws(new Error('an error occured'))
            await expect(
                users.update(123, { age: 35 })
            ).to.eventually.be.rejectedWith('an error occured')
        })
    })
})
