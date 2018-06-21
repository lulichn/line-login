import {  Request, Response, NextFunction } from 'express';

const log = (request: Request, response: Response, next: NextFunction) => {
	console.log('=========== ' + request.path + ' ===========');
  console.log(request.sessionID);
  console.log(request.session);
  
  next();
};

export = log;
