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
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json(
      fail('Too many requests. Please slow down.', null, {
        retryAfter: req.rateLimit?.resetTime,
      }),
    ),
});

const validate = (rules) => [
  ...rules,
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

const memberBodyRules = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.'),
  body('email').isEmail().withMessage('Email must be valid.').normalizeEmail(),
  body('age')
    .isInt({ min: 13, max: 999 })
    .withMessage('Age must be an integer between 13 and 999.')
    .toInt(),
  body('role')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role must be between 2 and 50 characters.'),
];

const idRules = [param('id').isMongoId().withMessage('Member id must be a valid Mongo ObjectId.')];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('sort').optional().isIn(['name', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
  query('role').optional().isString().trim(),
  query('minAge').optional().isInt({ min: 13 }).toInt(),
  query('maxAge').optional().isInt({ min: 13 }).toInt(),
];

router.use(membersRateLimiter);

router.get('/', validate(listQueryRules), listMembers);
router.get('/:id', validate(idRules), getMemberById);
router.post('/', validate(memberBodyRules), createMember);
router.put('/:id', validate([...idRules, ...memberBodyRules]), updateMember);
router.delete('/:id', validate(idRules), deleteMember);

module.exports = router;

