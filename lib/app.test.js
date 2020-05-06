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
        it('should get /', (done) => {
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

        it('should call user.create', (done) => {
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

        it('should call handleError on create error', (done) => {
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

    context('DELETE /user/:id', () => {
        let authStub, deleteStub

        beforeEach(() => {
            fakeAuth = (req, res, next) => {
                return next()
            }

            authStub = sandbox.stub(auth, 'isAuthorized').callsFake(fakeAuth)

            app = rewire('./app')
        })

        it('should call auth check function and users.delete on success', (done) => {
            deleteStub = sandbox.stub(users, 'delete').resolves('User deleted')

            request(app)
                .delete('/user/123')
                .expect(200)
                .end((error, response) => {
                    expect(authStub).to.have.been.calledOnce
                    expect(deleteStub).to.have.been.calledWithMatch({ id: '123', name: 'Anas' })
                    expect(response.body).to.equal('User deleted')
                    done(error)
                })
        })

        // test handleError for delete
        it('should call handleError on delete error', () => {})
    })

    context('handleError', () => {
        let handleError, res, statusStub, jsonStub

        beforeEach(() => {
            jsonStub = sandbox.stub().returns('done')
            statusStub = sandbox.stub().returns({ json: jsonStub })
            res = { status: statusStub }

            handleError = app.__get__('handleError')
        })

        it('should check error instance and format message', (done) => {
            let result = handleError(res, new Error('An error occured'))

            expect(statusStub).to.have.been.calledWith(400)
            expect(jsonStub).to.have.been.calledWith({ error: 'An error occured' })
            done()
        })

        it('should return object without changing it if not instance of error', (done) => {
            let result = handleError(res, { id: 1, message: 'An error occured' })

            expect(statusStub).to.have.been.calledWith(400)
            expect(jsonStub).to.have.been.calledWith({ id: 1, message: 'An error occured' })
            done()
        })
    })
})
