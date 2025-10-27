const ok = (data, meta = {}) => ({
  data,
  error: null,
  meta,
});

const fail = (message, details = null, meta = {}) => ({
  data: null,
  error: {
    message,
    ...(details ? { details } : {}),
  },
  meta,
});

module.exports = { ok, fail };
