'use strict';

module.exports = function (app) {
  
  const mongoose = require('mongoose');

  mongoose.connect(
    process.env['MONGO_URI'],
    { useNewUrlParser : true, useUnifiedTopology : true }
  );

  let threadSchema = new mongoose.Schema({
    text : String,
    created_on: Date,
    bumped_on: Date,
    reported: Boolean,
    delete_password: String,
    replies : [String],
    board : String
  });

  let replySchema = new mongoose.Schema({
    text : String,
    created_on: Date,
    delete_password : String,
    reported : Boolean,
    thread_id : String
  });

  let Thread = mongoose.model('Thread', threadSchema);

  let Reply = mongoose.model('Reply', replySchema);

  app.route('/api/threads/:board')
    .post((req, res) => {
      let board = req.params.board;

      let text = req.body.text;
      let password = req.body.delete_password;

      let document = Thread({
        text : text,
        delete_password : password,
        created_on: new Date(),
        bumped_on: new Date(),
        replies: [],
        reported: false,
        board : board
      });

      document.save((err, data) => {
        if(err)
          return console.error(err);
        return res.json(data);
      });
    })
    .put((req, res) => {
      let id = req.body.thread_id;

      Thread.findById(id, (err, doc) => {
        if(err || !doc)
          return console.log(err);

        doc.reported = true;

        doc.save((err, data) => {
          if(err)
            return console.error(err);
          return res.send("success")
        }); 
      })
    })
    .delete((req, res) => {
      let id = req.body.thread_id;
      let pass = req.body.delete_password;

      Thread.findById(id, (err, doc) => {
        if(err || !doc)
          return console.error(err);
        
        if(doc.delete_password == pass)
        {
          Reply.deleteMany({thread_id : id}, (err, data) => {
            if(err)
              return console.error(err);

            Thread.findByIdAndRemove(id, (err, data) => {
              if(err || !data)
                return console.error(err);
                
              return res.send('success');
            })
          })
        } 
        else
          return res.send('incorrect password'); 
      });
    })
    .get((req, res) => {
      let board = req.params.board;

      Thread
      .find({board : board})
      .sort({created_on : 1})
      .limit(10)
      .exec((err, data) => {
        if(err || data == [])
          return console.error(err);
      
        (async () => {
          let obj = [];
          
          for(let i = 0; i < data.length; i++){
            await Reply
              .find({thread_id : data[i]._id})
              .sort({created_on : 1})
              .limit(3)
              .exec((err, replies) => {
                data[i].replies = replies.reduce((accum, val) => {
                  //console.log(accum.concat(val));
                  return accum.concat(val);
                }, []); 
              });
            obj.push(data[i]);
          };

          return res.json(data);
        })();

      });
    });
    
  app.route('/api/replies/:board')
    .post((req, res) => {
      let id = req.body.thread_id;
      let text = req.body.text;
      let pass = req.body.password;

      Thread.findById(id, (err, doc) => {
        if(err || !doc)
          return console.error(err);
        
        let document = Reply({
          text : text, 
          created_on: new Date(),
          delete_password: pass, 
          reported: false,
          thread_id : id
        });

        doc.bumped_date = document.created_on;

        document.save((err, data) => {
          if(err)
            return console.error(err);
          
          doc.replies.push(data._id);

          doc.save((err, _) => {
            if(err)
              return console.error(err);
            return res.json(data);
          });
        });
      });
    })
    .put((req, res) => {
      let id = res.body.reply_id;

      Reply.findById(id, (err, data) => {
        if(err || !data)
          return console.error(err);
        
        data.reported = true;

        data.save((err, _) => {
          if(err)
            return console.error(err);
          return res.send('success');
        })
      })
    })
    .delete((req, res) => {
      let id = req.body.reply_id;
      let pass = req.body.delete_password;

      Reply.findById(id, (err, doc) => {
        if(err || !doc)
          return console.error(err);
        
        if(doc.delete_password == pass)
          Reply.findByIdAndRemove(id, (err, data) => {
            if(err || !data)
              return console.error(err);
            return res.send('success');
          }) 
        else
          return res.send('incorrect password'); 
      });
    })
    .get((req, res) => {
      let id = req.query.thread_id;

      Thread
        .findById(id, (err, data) => {
          if(err)
            return console.log(err);

          (async () => {
            await Reply
              .find({thread_id : data._id})
              .exec((err, replies) => {
                data.replies = replies.reduce((accum, val) => {
                  return accum.concat(val);
                }, []); 
              });
 
            return res.json(obj);
          })();
        });
    });

};
