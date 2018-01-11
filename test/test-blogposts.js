'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
// const faker = require('faker');
const mongoose = require('mongoose');
const seedData = require('../seed-data.json');
// const expect = chai.expect;
const should = chai.should();

const { BlogPost } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');


chai.use(chaiHttp);

before(function() {
  console.log('runServer');
  return runServer(TEST_DATABASE_URL);
});

beforeEach(function() {
  console.log('seeding data');
  return BlogPost.insertMany(seedData);
});

afterEach(function() {
  console.log('dropping database');
  return mongoose.connection.dropDatabase();
});

//server gets closed after describe block
after(function() {
  console.log('closeServer');
  return closeServer();
});

describe('GET: Checks that the get returns same number of entries as in the BlogDb', function() {
  it('should return all existing blogDB', function() {
    let response;
    return chai.request(app)
      .get('/posts')
      .then(function(_res) {
        response = _res;
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.be.at.least(1);
        console.log('body length =', response.body.length);
        return BlogPost.count();
      })
      .then(function(count) {
        console.log('The count is =' + count);
        response.body.should.have.length(count);
      });
  }); //end it statement
}); //end describe


//GET endpoint test
describe('GET make sure fields match', function() {

  it('should return blog entries with correct fields', function() {
    let blogResponse;
    return chai.request(app)
      .get('/posts')
      .then(function(res) {
        res.should.be.status(200);
        res.body.forEach(function(blogPost) {
          blogPost.should.be.a('object');
          blogPost.should.include.keys('id', 'author', 'content', 'title', 'created');
        });
      });
  }); //end it statement
}); //end describe for GET

describe('POST endpoint', function() {

  it('should add a new blogPost', function() {
    // const newBlogPost = seedData[0]
    const newPost = seedData[0];

    return chai.request(app)
      .post('/posts')
      .send(newPost)
      .then(res => {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys(
          'id', 'author', 'content', 'title', 'created'
        );
        console.log('res author = ', res.body.author);
        res.body.author.should.equal(newPost.author.firstName + ' ' + newPost.author.lastName);
        res.body.content.should.equal(newPost.content);
        res.body.title.should.equal(newPost.title);
      });
  }); //closes it block
}); //closes describe block

//PUT Operation
describe('PUT: modify a blog post', function() {
  it('should modify a blog post', function() {

    const updatePost = {
      title: 'Magic Time',
      content: 'This is the content for Magic Time',
    };

    return BlogPost.findOne()
      .then(post => {
        updatePost.id = post.id;
        //makes request then inspect it.
        return chai.request(app)
          .put(`/posts/${updatePost.id}`)
          .send(updatePost);
      })
      .then(res => {
        res.should.have.status(204);
        return BlogPost.findById(updatePost.id);
      })
      .then(post => {
        post.title.should.equal(updatePost.title);
        post.content.should.equal(updatePost.content);
      });
  }); //end it
}); //end describe