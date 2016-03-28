import { Router } from 'express';
import jwt from 'jsonwebtoken';
import nconf from '../config';
import providers from '../providers';
import verifyUser from '../middleware/verify-user';

const router = Router(); // eslint-disable-line new-cap

const jwtConfig = nconf.get('auth:jwt');

function sign(payload) {
  return {
    token: jwt.sign(
      payload,
      jwtConfig.secret,
      { expiresInMinutes: jwtConfig.expiresInMinutes, algorithm: 'RS256' }
    ),
  };
}

router
  .route('/')
    .get(verifyUser, (req, res, next) => {
      if (req.auth) {
        return res.send({
          firstName: req.auth.user.firstName,
          lastName: req.auth.user.lastName,
          dce: req.auth.user.dce,
        });
      }
      return next({ message: 'not logged in', status: 401 });
    });

router
  .route('/googleClientID')
    .get((req, res, next) => {
      let token = nconf.get('auth').google.id;
      res.send({ token });
    });

router
  .route('/:provider')
    .post((req, res, next) => {
      if (req.params.provider === 'refresh') {
        return res.send(sign(req.auth));
      }

      if (!providers[req.params.provider]) {
        return next({ message: 'invalid provider', status: 401 });
      }

      const provider = new providers[req.params.provider](
        req.body.secret,
        req.body.id
      );

      provider
        .verify()
        .then(() => provider.findOrCreateUser())
        .then(user => res.send(sign({
          user: user[0], level: provider.authLevel,
        })))
        .catch(err =>  {
          err.status = 401;
          next(err);
        });
    });

export default router;
