const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');
const {
  listMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/members.controller');
const { fail } = require('../utils/responses');

const router = express.Router();

const membersRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = req.rateLimit && req.rateLimit.resetTime;
    let retryAfterSeconds = 60;
    if (resetTime instanceof Date) {
      retryAfterSeconds = Math.max(Math.ceil((resetTime.getTime() - Date.now()) / 1000), 1);
    } else if (typeof resetTime === 'number') {
      retryAfterSeconds = Math.max(Math.ceil((resetTime - Date.now()) / 1000), 1);
    }

    return res.status(429).json(
      fail('Too many requests. Please slow down.', null, {
        retryAfter: Math.max(retryAfterSeconds, 1),
        limit: req.rateLimit?.limit,
        remaining: req.rateLimit?.remaining,
      }),
    );
  },
});

const applyValidations = (validations) => [
  ...validations,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const details = errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      }));
      return res.status(400).json(fail('Validation failed', details));
    }
    return next();
  },
];

const memberBodyValidation = [
  body('name')
    .isString()
    .withMessage('Name is required.')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.')
    .customSanitizer((value) => value.replace(/[<>]/g, '')),
  body('email').isEmail().withMessage('Email must be valid.').normalizeEmail(),
  body('age')
    .isInt({ min: 13, max: 999 })
    .withMessage('Age must be an integer between 13 and 999.')
    .toInt(),
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a string.')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role must be between 2 and 50 characters.')
    .customSanitizer((value) => value.replace(/[<>]/g, '')),
];

const idParamValidation = [
  param('id').isUUID().withMessage('Member id must be a valid UUID.'),
];

const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('sort')
    .optional()
    .isIn(['name', 'createdAt'])
    .withMessage('Sort must be either "name" or "createdAt".'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either "asc" or "desc".'),
  query('minAge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('minAge must be a number greater than or equal to 0.')
    .toInt(),
  query('maxAge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('maxAge must be a number greater than or equal to 0.')
    .toInt(),
  query('role')
    .optional()
    .isString()
    .withMessage('role must be a string.')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('role must be between 2 and 50 characters.')
    .customSanitizer((value) => value.replace(/[<>]/g, '')),
];

router.use(membersRateLimiter);

router.get('/', applyValidations(listQueryValidation), listMembers);
router.get('/:id', applyValidations(idParamValidation), getMemberById);
router.post('/', applyValidations(memberBodyValidation), createMember);
router.put(
  '/:id',
  applyValidations([...idParamValidation, ...memberBodyValidation]),
  updateMember,
);
router.delete('/:id', applyValidations(idParamValidation), deleteMember);

module.exports = router;
