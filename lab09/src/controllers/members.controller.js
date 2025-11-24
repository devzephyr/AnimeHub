const Member = require('../models/member.model');
const { ok, fail } = require('../utils/responses');

const normalizeMember = (doc) => {
  if (!doc) return doc;
  const plain = doc.toJSON ? doc.toJSON() : { ...doc };
  if (!plain.id && plain._id) {
    plain.id = plain._id.toString();
  }
  delete plain._id;
  return plain;
};

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
  return { page, limit };
};

const parseSorting = (query) => {
  const allowedFields = ['name', 'createdAt'];
  const sortField = allowedFields.includes(query.sort) ? query.sort : 'createdAt';
  const sortOrder = query.order === 'desc' ? -1 : 1;
  return { sortField, sortOrder };
};

const buildFilters = (query) => {
  const filters = {};
  if (query.role) {
    filters.role = query.role;
  }

  if (query.minAge || query.maxAge) {
    filters.age = {};
    if (query.minAge) {
      filters.age.$gte = Number(query.minAge);
    }
    if (query.maxAge) {
      filters.age.$lte = Number(query.maxAge);
    }
  }
  return filters;
};

const handleKnownErrors = (error, res) => {
  if (error.code === 11000) {
    return res.status(409).json(fail('Member with this email already exists', null, { email: error.keyValue.email }));
  }

  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
    return res.status(400).json(fail('Validation failed', details));
  }

  return null;
};

const listMembers = async (req, res, next) => {
  try {
    const filters = buildFilters(req.query);
    const { page, limit } = parsePagination(req.query);
    const { sortField, sortOrder } = parseSorting(req.query);

    const [results, total] = await Promise.all([
      Member.find(filters)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Member.countDocuments(filters),
    ]);

    const meta = {
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      sort: sortField,
      order: sortOrder === 1 ? 'asc' : 'desc',
      filters: {
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.age?.$gte ? { minAge: filters.age.$gte } : {}),
        ...(filters.age?.$lte ? { maxAge: filters.age.$lte } : {}),
      },
    };

    const normalizedResults = results.map((member) => normalizeMember(member));
    return res.status(200).json(ok(normalizedResults, meta));
  } catch (error) {
    return next(error);
  }
};

const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id).lean().exec();
    if (!member) {
      return res.status(404).json(fail('Member not found', null, { id: req.params.id }));
    }
    return res.status(200).json(ok(normalizeMember(member)));
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json(fail('Member not found', null, { id: req.params.id }));
    }
    return next(error);
  }
};

const createMember = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
      role: req.body.role || 'Ranger',
    };
    const member = await Member.create(payload);
    return res.status(201).json(ok(member.toJSON()));
  } catch (error) {
    const handled = handleKnownErrors(error, res);
    if (handled) return handled;
    return next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
      role: req.body.role || 'Ranger',
    };

    const updated = await Member.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
      context: 'query',
    })
      .lean()
      .exec();

    if (!updated) {
      return res.status(404).json(fail('Member not found', null, { id: req.params.id }));
    }

    return res.status(200).json(ok(normalizeMember(updated)));
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json(fail('Member not found', null, { id: req.params.id }));
    }
    const handled = handleKnownErrors(error, res);
    if (handled) return handled;
    return next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const deleted = await Member.findByIdAndDelete(req.params.id).lean().exec();
    if (!deleted) {
      return res.status(404).json(fail('Member not found', null, { id: req.params.id }));
    }
    return res.status(204).send();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json(fail('Member not found', null, { id: req.params.id }));
    }
    return next(error);
  }
};

module.exports = {
  listMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};

