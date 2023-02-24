const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/user');
const expect = chai.expect;

chai.use(chaiHttp);

describe('User Controller', function () {
    this.timeout(10000);

    describe('POST /users/register', function () {
        beforeEach(async function () {
            await User.deleteMany({});
        });

        it('should register a new user', async function () {
            const res = await chai.request(app)
                .post('/users/register')
                .send({
                    fullName: 'John Doe',
                    phoneNumber: '+1234567890',
                    email: 'johndoe@example.com',
                    password: 'Test@1vfdvdvdfvd234',
                    // isPhoneNumberVerified:true,
                    // isEmailVerified:true
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('message').eql('User created successfully');
        });

        it('should return an error if password is invalid', async function () {
            const res = await chai.request(app)
                .post('/users/register')
                .send({
                    fullName: 'John Doe',
                    phoneNumber: '+1234567890',
                    email: 'johndoe@example.com',
                    password: 'invalid'
                });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('message').eql('Password is not valid');
        });

        it('should return an error if phone number is already taken', async function () {
            const existingUser = new User({
                fullName: 'Existing User',
                phoneNumber: '+1234567890',
                email: 'existinguser@example.com',
                password: 'Test@1vfdvdvdfvd234'
            });
            await existingUser.save();

            const res = await chai.request(app)
                .post('/users/register')
                .send({
                    fullName: 'John Doe',
                    phoneNumber: '+1234567890',
                    email: 'johndoe@example.com',
                    password: 'Test@1vfdvdvdfvd234'
                });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error').eql('Phone number already taken');
        });

        it('should return an error if email is already taken', async function () {
            const existingUser = new User({
                fullName: 'Existing User',
                phoneNumber: '+1987654321',
                email: 'existinguser@example.com',
                password: 'Test@1vfdvdvdfvd234'
            });
            await existingUser.save();

            const res = await chai.request(app)
                .post('/users/register')
                .send({
                    fullName: 'John Doe',
                    phoneNumber: '+1234567890',
                    email: 'existinguser@example.com',
                    password: 'Test@1vfdvdvdfvd234'
                });

            expect(res).to.have.status(400);
            expect(res.body).to.have.property('error').eql('Email already taken');
        });
    });
});


// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const app = require('../app');
// const User = require('../models/user');
// const expect = chai.expect;
//
// chai.use(chaiHttp);
//
// describe('User Controller',function (){
//     this.timeout(10000);
//     // this.timeout(5000);
//     describe('POST /users/register', () => {
//         beforeEach(async () => {
//             await User.deleteMany({});
//             //     async function truncateCollection() {
//             //         try {
//             //             await mongoose.connection.dropCollection(User.collection.name);
//             //             console.log('Collection truncated');
//             //         } catch (error) {
//             //             console.error(error);
//             //         }
//             //     }
//             //     truncateCollection();
//             // });
//         });
//
//
//         // it('should register a new user', function() {
//         //     this.timeout(10000); // set timeout to 5 seconds
//         //     return chai.request(app)
//         //         .post('/users/register')
//         //         .send({
//         //             fullName: 'John Doe',
//         //             phoneNumber: '+1234567890',
//         //             email: 'johndoe@example.com',
//         //             password: 'Test@1234'
//         //         })
//         //         .then(res => {
//         //             expect(res).to.have.status(201);
//         //             expect(res.body).to.have.property('message').eql('User created successfully');
//         //         });
//         // });
//
//         it('should register a new user', async () => {
//             const res = await chai.request(app)
//                 .post('/users/register')
//                 .send({
//                     fullName: 'John Doe',
//                     phoneNumber: '+1234567890',
//                     email: 'johndoe@example.com',
//                     password: 'Test@1vfdvdvdfvd234'
//                 });
//
//             expect(res).to.have.status(201);
//             expect(res.body).to.have.property('message').eql('User created successfully');
//         });
//
//         it('should return an error if password is invalid', async () => {
//             const res = await chai.request(app)
//                 .post('/users/register')
//                 .send({
//                     fullName: 'John Doe',
//                     phoneNumber: '+1234567890',
//                     email: 'johndoe@example.com',
//                     password: 'invalid'
//                 });
//
//             expect(res).to.have.status(400);
//             expect(res.body).to.have.property('message').eql('Password is not valid');
//         });
//
//         it('should return an error if phone number is already taken', async () => {
//             const existingUser = new User({
//                 fullName: 'Existing User',
//                 phoneNumber: '+1234567890',
//                 email: 'existinguser@example.com',
//                 password: 'Test@1234'
//             });
//             await existingUser.save();
//
//             const res = await chai.request(app)
//                 .post('/users/register')
//                 .send({
//                     fullName: 'John Doe',
//                     phoneNumber: '+1234567890',
//                     email: 'johndoe@example.com',
//                     password: 'Test@1234'
//                 });
//
//             expect(res).to.have.status(400);
//             expect(res.body).to.have.property('error').eql('Phone number already taken');
//         });
//
//         it('should return an error if email is already taken', async () => {
//             const existingUser = new User({
//                 fullName: 'Existing User',
//                 phoneNumber: '+1987654321',
//                 email: 'existinguser@example.com',
//                 password: 'Test@1234'
//             });
//             await existingUser.save();
//
//             const res = await chai.request(app)
//                 .post('/users/register')
//                 .send({
//                     fullName: 'John Doe',
//                     phoneNumber: '+1234567890',
//                     email: 'existinguser@example.com',
//                     password: 'Test@1234'
//                 });
//
//             expect(res).to.have.status(400);
//             expect(res.body).to.have.property('error').eql('Email already taken');
//         });
//     });
// });
