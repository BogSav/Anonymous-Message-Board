const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('Creating a new thread', done => {

    chai
      .request(server)
      .post('/api/threads/test')
      .send({
        text : "Text",
        delete_password : 'pass'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body);
        assert.property(res.body, '_id');
        assert.property(res.body, 'text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'bumped_on');
        assert.property(res.body, 'reported');
        assert.property(res.body, 'delete_password');
        assert.property(res.body, 'replies');

        assert.isArray(res.body.replies);

        assert.equal(res.body.created_on, res.body.bumped_on);

        done();
      });
  });
  
  test('Viewing the 10 most recent threads with 3 replies each', done => {

    chai
      .request(server)
      .get('/api/threads/test')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body);
        assert.isArray(res.body);

        res.body.forEach(thread => {
          assert.property(thread, '_id');
          assert.property(thread, 'text');
          assert.property(thread, 'created_on');
          assert.property(thread, 'bumped_on');
          assert.property(thread, 'reported');
          assert.property(thread, 'delete_password');
          assert.property(thread, 'replies');
          });

        done();
      });
  });
  
  test('Deleting a thread with the incorrect password', done => {

    chai
      .request(server)
      .post('/api/threads/test')
      .send({
        text : "Text",
        delete_password : 'pass'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body);
        assert.property(res.body, '_id');

        let id = res.body._id;

        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id : id, password : 'pass'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
  });

  test('Deleting a thread with the incorrect password', done => {

    chai
      .request(server)
      .post('/api/threads/test')
      .send({
        text : "Text",
        delete_password : 'pass'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body);
        assert.property(res.body, '_id');

        let id = res.body._id;

        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id : id, password : 'asdf'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
  });

  test('Reporting a thread', done => {

    chai
      .request(server)
      .post('/api/threads/test')
      .send({
        text : "Text",
        delete_password : 'pass'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body);
        assert.property(res.body, '_id');

        let id = res.body._id;

        chai.request(server)
          .put('/api/threads/test')
          .send({thread_id : id})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
  });

  test('Creating a new reply', done => {

    chai
      .request(server)
      .post('/api/threads/test')
      .send({
        text : "Text",
        delete_password : 'pass'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body);
        assert.property(res.body, '_id');

        let id = res.body._id;

        chai.request(server)
          .post('/api/replies/test')
          .send({thread_id : id, text : "Merge", delete_password : "pass"})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isDefined(res.body);
            assert.property(res.body, '_id');
            assert.property(res.body, 'text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'reported');
            done();
          });
      });
  });

  test('Reporting a reply', done => {

    chai
      .request(server)
      .post('/api/threads/test')
      .send({
        text : "Text",
        delete_password : 'pass'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body);
        assert.property(res.body, '_id');

        let id = res.body._id;

        chai.request(server)
          .post('/api/replies/test')
          .send({thread_id : id, text : "Merge", delete_password : "pass"})
          .end((err, res) => {
            assert.equal(res.status, 200);

            let id2 = res.body._id;

            chai.request(server)
              .put('/api/replies/test')
              .send({reply_id : id})
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'succees');
                done();
            });
          });
      });
  });

});
