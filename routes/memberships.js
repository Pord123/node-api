import { Router } from 'express';
import Membership from '../models/membership';
import Term from '../models/term';
import scopify from '../helpers/scopify';
import {needs, needsIndex, needsOne} from '../middleware/permissions';
import jwt from '../middleware/jwt';

var router = Router();

router
  .route('/')
    .get(jwt, needsIndex('memberships'), (req, res, next) => {
      var scopes = scopify(req.query, 'reason', 'group', 'user', 'term', 'approved');
      Membership.paginate(scopes, req.query.perPage, req.query.page)
        .then(body => res.send(body))
        .catch(err => next(err));
    })
    .post(needs('create memberships'), (req, res, next) => {
      Term
        .findOrInitialize({ where: { name: req.body.term.name } })
        .spread((term, created) => {
          if (created) {
            term.startDate = req.body.term.startDate;
            term.endDate = req.body.term.endDate;
            term.save();
          }
          return term;
        })
        .then(term => {
          req.body.termId = term.id;
          req.body.approved = false;
          return Membership.create(req.body, {fields: ['reason', 'approved', 'groupId', 'userId', 'termId' ]});
        })
        .then(membership => res.send(membership))
        .catch(err => next({ err: err, status: 422}));
    });

router
  .route('/:id')
    .get(jwt, needsOne('memberships'), (req, res, next) => {
      Membership
        .findById(req.params.id)
        .then(membership => {
          if (membership) {
            if (!membership.approved && !req.auth.allowed) {
              return next({message: `User does not have permission: read unapproved memberships`, status: 403});
            }
            res.send(membership);
          } else {
            next({ message: 'Membership not found', status: 404 });
          }
        })
        .catch(err => next(err));
    })
    .put(needs('update memberships'), (req, res, next) => {
      Membership
        .findById(req.params.id)
        .then(membership => membership.updateAttributes(req.body, ({ fields: ['reason', 'approved', 'endDate', 'groupId', 'userId', 'termId' ]})))
        .then(membership => res.send(membership))
        .catch(err => next(err));
    })
    .delete(needs('destroy memberships'), (req, res, next) => {
      Membership
        .findById(req.params.id)
        .then(membership => membership.destroy())
        .then(() => res.sendStatus(204))
        .catch(err => next(err));
    });

export default router;
