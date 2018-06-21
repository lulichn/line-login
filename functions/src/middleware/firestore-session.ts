// https://firebase.google.com/docs/hosting/functions#using_cookies

import { RequestHandler } from 'express'

import { initializeApp } from 'firebase-admin';

const firebase = initializeApp();
const firestore = firebase.firestore();

import * as session from 'express-session';
const FirestoreStore = require('firestore-store')(session);

import * as functions from 'firebase-functions';
const secret = functions.config().line.session.secret

const _session: RequestHandler =  session({
  store: new FirestoreStore({
    database: firestore
  }),
  name: '__session',
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // httpOnly: true,
    // secure: true,
    path: '/',
    maxAge: null
  }
});

export = _session;