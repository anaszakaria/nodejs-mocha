const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)

var Order = require('./order')
var sandbox = sinon.createSandbox()

describe('order', () => {
    let warnStub, dateSpy, user, items, newOrder

    beforeEach(() => {
        warnStub = sandbox.stub(console, 'warn')
        dateSpy = sandbox.spy(Date, 'now')

        user = { id: 1, name: 'Anas' }
        items = [
            { name: 'Book', price: 10 },
            { name: 'Dice set', price: 5 },
        ]

        newOrder = new Order(123, user, items) // make o available in all test, avoid repeat
    })

    afterEach(() => {
        sandbox.restore()
    })

    it('should create instance of Order and calculate total + shipping', () => {
        expect(newOrder).to.be.instanceOf(Order)
        expect(dateSpy).to.have.been.calledTwice
        expect(newOrder).to.have.property('ref').to.equal(123)
        expect(newOrder).to.have.property('user').to.deep.equal(user)
        expect(newOrder).to.have.property('items').to.deep.equal(items)
        expect(newOrder).to.have.property('status').to.equal('Pending')
        expect(newOrder).to.have.property('createdAt').to.be.a('Number')
        expect(newOrder).to.have.property('updatedAt').to.be.a('Number')
        expect(newOrder).to.have.property('subtotal').to.equal(15)
        expect(newOrder).to.have.property('shipping').to.equal(5)
        expect(newOrder).to.have.property('total').to.equal(20)

        expect(newOrder.save).to.be.a('function')
        expect(newOrder.cancel).to.be.a('function')
        expect(newOrder.ship).to.be.a('function')
    })

    it('should update status to active and return order details when saved ', () => {
        let result = newOrder.save()

        expect(dateSpy).to.have.been.calledThrice // twice in the constructor, once in newOrder.save()
        expect(result).to.be.a('Object')
        expect(result).to.have.property('ref').to.equal(123)
        expect(result).to.have.property('user').to.equal('Anas')
        expect(result).to.have.property('updatedAt').to.be.a('Number')
        expect(newOrder.status).to.equal('Active')
        expect(result).to.have.property('items').to.deep.equal(items)
        expect(result).to.have.property('shipping').to.equal(5)
        expect(result).to.have.property('total').to.equal(20)
    })
})
