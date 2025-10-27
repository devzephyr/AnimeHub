const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');
const { ok, fail } = require('../utils/responses');

const DATA_FILE = path.join(__dirname, '..', 'data', 'members.json');

const readMembers = async () => {
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(fileContent || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]');
      return [];
    }
    throw error;
  }
};

const writeMembers = async (members) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(members, null, 2));
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : value);

const listMembers = async (req, res, next) => {
  try {
    const members = await readMembers();
    const {
      page = '1',
      limit = '10',
      sort = 'createdAt',
      order = 'asc',
      role,
      minAge,
      maxAge,
    } = req.query;

    const pageNum = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
    const sortField = ['name', 'createdAt'].includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    let filtered = [...members];

    if (role) {
      const roleQuery = normalizeString(role).toLowerCase();
      filtered = filtered.filter(
        (member) => member.role && member.role.toLowerCase() === roleQuery,
      );
    }

    const minAgeNum = Number.parseInt(minAge, 10);
    if (!Number.isNaN(minAgeNum)) {
      filtered = filtered.filter((member) => Number(member.age) >= minAgeNum);
    }

    const maxAgeNum = Number.parseInt(maxAge, 10);
    if (!Number.isNaN(maxAgeNum)) {
      filtered = filtered.filter((member) => Number(member.age) <= maxAgeNum);
    }

    if (!Number.isNaN(minAgeNum) && !Number.isNaN(maxAgeNum) && minAgeNum > maxAgeNum) {
      return res
        .status(400)
        .json(fail('minAge cannot be greater than maxAge', null, { minAge: minAgeNum, maxAge: maxAgeNum }));
    }

    filtered.sort((a, b) => {
      if (sortField === 'name') {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const total = filtered.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const results = filtered.slice(offset, offset + limitNum);

    const meta = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      sort: sortField,
      order: sortOrder,
      filters: {
        ...(role ? { role: normalizeString(role) } : {}),
        ...(Number.isNaN(minAgeNum) ? {} : { minAge: minAgeNum }),
        ...(Number.isNaN(maxAgeNum) ? {} : { maxAge: maxAgeNum }),
      },
    };

    return res.status(200).json(ok(results, meta));
  } catch (error) {
    return next(error);
  }
};

const getMemberById = async (req, res, next) => {
  try {
    const members = await readMembers();
    const member = members.find((item) => item.id === req.params.id);

    if (!member) {
      return res.status(404).json(fail('Member not found', null, { id: req.params.id }));
    }

    return res.status(200).json(ok(member));
  } catch (error) {
    return next(error);
  }
};

const createMember = async (req, res, next) => {
  try {
    const members = await readMembers();
    const lowerCaseEmail = normalizeString(req.body.email).toLowerCase();
    const emailExists = members.some((member) => member.email === lowerCaseEmail);

    if (emailExists) {
      return res
        .status(409)
        .json(fail('Member with this email already exists', null, { email: lowerCaseEmail }));
    }

    const now = new Date().toISOString();
    const payload = {
      id: randomUUID(),
      name: normalizeString(req.body.name),
      email: lowerCaseEmail,
      age: Number(req.body.age),
      role: normalizeString(req.body.role) || null,
      createdAt: now,
      updatedAt: now,
    };

    members.push(payload);
    await writeMembers(members);

    return res.status(201).json(ok(payload));
  } catch (error) {
    return next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const members = await readMembers();
    const memberIndex = members.findIndex((item) => item.id === req.params.id);

    if (memberIndex === -1) {
      return res.status(404).json(fail('Member not found', null, { id: req.params.id }));
    }

    const lowerCaseEmail = normalizeString(req.body.email).toLowerCase();
    const emailConflict = members.some(
      (member, index) => index !== memberIndex && member.email === lowerCaseEmail,
    );

    if (emailConflict) {
      return res
        .status(409)
        .json(fail('Member with this email already exists', null, { email: lowerCaseEmail }));
    }

    const existing = members[memberIndex];
    const now = new Date().toISOString();
    const updated = {
      ...existing,
      name: normalizeString(req.body.name),
      email: lowerCaseEmail,
      age: Number(req.body.age),
      role: normalizeString(req.body.role) || null,
      updatedAt: now,
    };

    members[memberIndex] = updated;
    await writeMembers(members);

    return res.status(200).json(ok(updated));
  } catch (error) {
    return next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const members = await readMembers();
    const memberIndex = members.findIndex((item) => item.id === req.params.id);

    if (memberIndex === -1) {
      return res.status(404).json(fail('Member not found', null, { id: req.params.id }));
    }

    members.splice(memberIndex, 1);
    await writeMembers(members);

    return res.status(204).send();
  } catch (error) {
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
