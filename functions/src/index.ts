// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

import * as express from 'express';
import * as functions from 'firebase-functions';

import * as jwt from 'jsonwebtoken';

import * as LineClient from './helpers/line-client';
import * as RandomString from './helpers/random-string';

import * as log from './middleware/log';
const baseMiddlewate = [log];

const app = express();

// Session
import * as session from './middleware/firestore-session';
app.use(session);


const handleLineApiClientError = (error, response) => {
  if (error.response) {
    console.error(error.response.data);
    console.error(error.response.status);
    console.error(error.response.headers);
  } else if (error.request) {
    console.error(error.request);
  } else {
    console.log(error.message);
  }

  response.status(500).send('error');
}

app.get('/goToAuthPage', baseMiddlewate, (request, response, next) => {
  const channelId = functions.config().line.channelid;
  const encodedCallbackUrl = encodeURIComponent(functions.config().line.callback);
  const state = RandomString.gen(43);
  const scope = 'openid%20profile';
  const nonce = RandomString.gen(43);

  const url = "https://access.line.me/oauth2/v2.1/authorize?response_type=code"
    + "&client_id=" + channelId
    + "&redirect_uri=" + encodedCallbackUrl
    + "&state=" + state
    + "&scope=" + scope
    + "&nonce=" + nonce;

  request.session.lineWebLoginState = state;
  request.session.nonce = nonce;

  request.session.save((err) => {
    response.redirect(url);
  })
})

app.get('/auth', baseMiddlewate, (request, response, next) => {
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

  if (state !== request.session.lineWebLoginState) {
    response.redirect('/sessionError');
    return;
  }

  delete request.session.lineWebLoginState;

  LineClient.oauthToken(functions.config().line.channelid, functions.config().line.channelsecret, functions.config().line.callback, code)
    .then((tokenResp) => {
      console.log(tokenResp);

      request.session.accessToken = tokenResp.data;

      const decoded = jwt.decode(tokenResp.data.id_token);
      console.log(decoded);
      // Not yet

      request.session.save((err) => {
        response.redirect('/success');
      })
    })
    .catch(err => handleLineApiClientError(err, response));
})

app.get('/api/refreshToken', baseMiddlewate, (request, response, next) => {
  const accessToken = request.session.accessToken;

  LineClient.oauthRefreshToken(accessToken.refresh_token, functions.config().line.channelid, functions.config().line.channelsecret)
    .then((tokenResp) => {
      console.log(tokenResp);

      request.session.accessToken = tokenResp.data;
      request.session.save((err) => {
        console.log(tokenResp.data);
        response.send('ok');
      })
    })
    .catch(err => handleLineApiClientError(err, response));
})

app.get('/api/verify', baseMiddlewate, (request, response, next) => {
  const accessToken = request.session.accessToken;
  
  LineClient.oauthVerify(accessToken.access_token)
    .then((verifyResp) => {
      console.log(verifyResp.data);
      response.send('ok')
    })
    .catch(err => handleLineApiClientError(err, response));
})

app.get('/api/revoke', baseMiddlewate, (request, response, next) => {
  const accessToken = request.session.accessToken;

  LineClient.oauthRevoke(accessToken.access_token, functions.config().line.channelid, functions.config().line.channelsecret)
    .then((revokeResp) => {
      console.log(revokeResp.data);
      response.send('ok')
    })
    .catch(err => handleLineApiClientError(err, response));
})

export const api = functions.https.onRequest(app);
