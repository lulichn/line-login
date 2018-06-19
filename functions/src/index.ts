// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as express from 'express';

import axios from 'axios';

const firebase = admin.initializeApp();
const database = firebase.firestore();

const session = require('express-session');
const FirestoreStore = require('firestore-store')(session);

const myMiddle = (request, response, next) => {
  console.log('=========== ' + request.path + ' ===========');
  console.log(request.sessionID);
  console.log(request.session);

  next();
};

const app = express();
// app.set('trust proxy', 1) // trust first proxy

// app.use(session({
//   store: new FirestoreStore({
//     database: database
//   }),
//   secret: 'hogehoge',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     path: '/',
//     // httpOnly: true,
//     secure: true,
//     maxage: 1000 * 60 * 30
//   }
// }));

// https://firebase.google.com/docs/hosting/functions#using_cookies
app.use(session({
  store: new FirestoreStore({
    database: database
  }),
  name: '__session',
  secret: 'hogehoge',
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',
    maxAge: null
  }
}));

const CookieParser = require('cookie-parser');
app.use(CookieParser('hogehoge'));

const lineApiClient = axios.create({
  baseURL: 'https://api.line.me',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  proxy: false,
  responseType: 'json'
});

function makeId(size: number): string {
  var text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (var i = 0; i < size; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  
  return text;
}

app.get('/goToAuthPage', myMiddle, (request, response, next) => {
  const channelId = functions.config().line.channelid;
  const encodedCallbackUrl = encodeURIComponent(functions.config().line.callback);
  const state = makeId(43);
  const scope = 'openid%20profile';
  const nonce = makeId(43);

  const url = "https://access.line.me/oauth2/v2.1/authorize?response_type=code"
    + "&client_id=" + channelId
    + "&redirect_uri=" + encodedCallbackUrl
    + "&state=" + state
    + "&scope=" + scope
    + "&nonce=" + nonce;

  request.session.lineWebLoginState = state;
  request.session.nonce = nonce;

  
  request.session.save((err) => {
    console.log(request.session);
    console.log(request.sessionID);
    response.redirect(url);
  })
})

app.get('/auth', myMiddle, (request, response, next) => {
  const code  = request.query.code;
  const state = request.query.state;
  const scope = request.query.scope;

  const error        = request.query.error;
  const errorCode    = request.query.errorCode;
  const errorMessage = request.query.errorMessage;
  
  console.log('code: ' + code);
  console.log('state: ' + state);
  console.log('scope: ' + scope);
  console.log('error: ' + error);
  console.log('errorCode: ' + errorCode);
  console.log('errorMessage: ' + errorMessage);

  if (error || errorCode || errorMessage) {
    response.redirect('/loginCancel');
    return;
  }

  if (state !== request.session['lineWebLoginState']) {
    response.redirect('/sessionError');
    return;
  }

  delete request.session['lineWebLoginState'];

  const formData = {
    grant_type: 'authorization_code',
    client_id: functions.config().line.channelid,
    client_secret: functions.config().line.channelsecret,
    redirect_uri: functions.config().line.callback,
    code: code,
  }

  lineApiClient.post('/oauth2/v2.1/token',
      require('querystring').stringify(formData))
    .then((tokenResp) => {
      console.log(tokenResp);

      request.session.accessToken = tokenResp.data;
      request.session.save((err) => {
        response.redirect('/success');
      })
    })
    .catch((tokenError) => {
      console.error(tokenError);
      response.status(500).write(error);
    });
})

app.get('/api/verify', myMiddle, (request, response, next) => {
  request.session.foo = 'abcdefg';
  request.session.save((err) => {
    response.send('aaaa');
  })
});

export const api = functions.https.onRequest(app);
