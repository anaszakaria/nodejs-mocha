const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const rewire = require('rewire')
const request = require('supertest')

var app = rewire('./app')
var users = require('./users')
var auth = require('./auth')
var sandbox = sinon.createSandbox()

describe('app', () => {
    afterEach(() => {
        app = rewire('./app')
        sandbox.restore()
    })

    context('GET /', () => {
        it('should get /', done => {
            request(app)
                .get('/')
                .expect(200)
                .end((error, response) => {
                    expect(response.body).to.have.property('name').to.equal('Express App Rest API')
                    done()
                })
        })
    })

    context('POST /user', () => {
        let createStub, errorStub

        it('should call user.create', done => {
            createStub = sandbox.stub(users, 'create').resolves({ name: 'Anas' })

            request(app)
                .post('/user')
                .send({ name: 'fake_name' })
                .expect(200)
                .end((error, response) => {
                    expect(createStub).to.have.been.calledOnce
                    expect(response.body).to.have.property('name').to.equal('Anas')
                    done()
                })
        })

        it('should call handleError on error', done => {
            createStub = sandbox.stub(users, 'create').rejects(new Error('An error occured'))

            errorStub = sandbox.stub().callsFake((response, error) => {
                return response.status(400).json({ error: 'error message' })
            })

            app.__set__('handleError', errorStub)

            request(app)
                .post('/user')
                .send({ name: 'fake_name' })
                .expect(400)
                .end((error, response) => {
                    expect(createStub).to.have.been.calledOnce
                    expect(errorStub).to.have.been.calledOnce
                    expect(response.body).to.have.property('error').to.equal('error message')
                    done(error)
                })
        })
    })
})
