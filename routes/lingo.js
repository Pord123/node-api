import { Router } from 'express';
import Lingo from '../models/lingo';
import scopify from '../helpers/scopify';
import {paginate} from '../helpers/paginate';
import { needs } from '../middleware/permissions';

var router = Router();

router
  .route('/')
    .get((req, res, next) => {
      var scopes = scopify(req.query, 'phrase', 'definition');
      Lingo.paginate(scopes, req.query.perPage, req.query.page)
        .then((body) => res.send(body))
        .catch((err) => next(err));
    })
    .post(needs('create lingo'), (req, res, next) => {
      Lingo.create(req.body, {fields: ['phrase', 'definition']})
        .then((lingo) => res.send(lingo))
        .catch((err) => next({ err: err, status: 422}));
    });

router
  .route('/:id')
    .get((req, res, next) => {
      Lingo
        .findById(req.params.id)
        .then((lingo) => {
          if(lingo) {
            res.send(lingo)
          } else {
            next({ message: "Lingo not found", status: 404 })
          }
        })
        .catch((err) => next(err));
    })
    .put(needs('update lingo'), (req, res, next) => {
      Lingo
        .findById(req.params.id)
        .then((lingo) => lingo.updateAttributes(req.body, ({ fields: ['phrase', 'definition']})))
        .then((lingo) => res.send(lingo))
        .catch((err) => next(err));
    })
    .delete(needs('destroy lingo'), (req, res, next) => {
      Lingo
        .findById(req.params.id)
        .then((lingo) => lingo.destroy())
        .then(() => res.sendStatus(204));
    });

export default router;