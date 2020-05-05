const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const rewire = require('rewire')

var mailer = rewire('./mailer')

var sandbox = sinon.createSandbox()

describe('mailer', () => {
    let emailStub

    beforeEach(() => {
        // use rewire instead of require to enable sandbox
        emailStub = sandbox.stub().resolves('done')
        mailer.__set__('sendEmail', emailStub) // rewire method
    })

    afterEach(() => {
        sandbox.restore()
        mailer = rewire('./mailer')
    })

    context('sendWelcomeEmail', () => {
        it('should check for email and name', async () => {
            await expect(mailer.sendWelcomeEmail()).to.eventually.be.rejectedWith('Invalid input')
            await expect(mailer.sendWelcomeEmail('anas@email.com')).to.eventually.be.rejectedWith('Invalid input')
        })

        it('should call sendEmail with email and message', async () => {
            await mailer.sendWelcomeEmail('anas@email.com', 'Anas')
            expect(emailStub).to.have.been.calledWith('anas@email.com', 'Dear Anas, welcome to our family!')
        })
    })

    context('sendPasswordResetEmail', () => {
        it('should check for email', async () => {
            await expect(mailer.sendPasswordResetEmail()).to.eventually.be.rejectedWith('Invalid input')
        })

        it('should call sendEmail with email and message', async () => {
            await mailer.sendPasswordResetEmail('anas@email.com')
            expect(emailStub).to.have.been.calledWith('anas@email.com', 'Please click http://some_link to reset your password')
        })
    })

    context('sendEmail', () => {
        let sendEmail

        beforeEach(() => {
            mailer = rewire('./mailer')
            sendEmail = mailer.__get__('sendEmail')
        })

        it('should check for email and body', async () => {
            await expect(sendEmail()).to.eventually.be.rejectedWith('Invalid input')
            await expect(sendEmail('anas@email.com')).to.eventually.be.rejectedWith('Invalid input')
        })

        it('should call sendEmail with email and message', async () => {
            // normally we should stub actual mailer, but in this case we'll leave it
            let result = await sendEmail('anas@email.com', 'welcome')
            expect(result).to.equal('Email sent')
        })
    })
})
