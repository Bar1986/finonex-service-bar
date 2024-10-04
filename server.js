import express from "express";

const app = express();
const port = process.env.PORT || 8000;
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
  

const customAuthentication = (header) => (req, res, next) => {
    if (req.headers['authorization'] !== header) {
      return res.status(401).send('Unauthorized!');
    }
    next();
  };

app.post('/liveEvent',customAuthentication('secret'), (req, res) => {
  res.send('Welcome to the root route');
});
app.get('/userEvents/:userid',customAuthentication('secret'), (req, res) => {
    res.send({user : req.params.userid});
  });





