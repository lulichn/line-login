import axios, { AxiosPromise } from 'axios';
import {stringify} from 'querystring';

const BASE_URL = 'https://api.line.me/';

const lineApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  proxy: false,
  responseType: 'json'
});

export function oauthToken<T=any>(channel_id, channel_secret, redirect_uri, code):AxiosPromise<T> {
  const formData = {
    grant_type: 'authorization_code',
    client_id: channel_id,
    client_secret: channel_secret,
    redirect_uri: redirect_uri,
    code: code,
  }

  return lineApiClient.post(
    'oauth2/v2.1/token',
    stringify(formData));
}

export function oauthRefreshToken<T=any>(refresh_token, channel_id, channel_secret):AxiosPromise<T> {
  const formData = {
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
    client_id: channel_id,
    client_secret: channel_secret,
  }

  return lineApiClient.post(
    'oauth2/v2.1/token',
    stringify(formData));
}

export function oauthVerify<T=any>(access_token):AxiosPromise<T> {
  const params = {
    access_token: access_token
  }

  return lineApiClient.get(
    'oauth2/v2.1/verify',
    {
      params: params
    });
}

export function oauthRevoke<T=any>(access_token, channel_id, channel_secret):AxiosPromise<T> {
  const formData = {
    access_token: access_token,
    client_id: channel_id,
    client_secret: channel_secret,
  }

  return lineApiClient.post(
    'oauth2/v2.1/revoke',
    stringify(formData));
}
