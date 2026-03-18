const supabase = require("../client/clientSupabase");

/**
 * @param {string} remoteFunction               – nome da função remota no Supabase
 * @param {"query"|"body"|"none"} paramSource          – de onde virão os params: req.query, req.body ou nenhum
 * @param {object}   [opts]
 * @param {string}   [opts.errorMessage]        – texto para enviar ao cliente em caso de falha
 * @param {Function} [opts.transform]           – dado bruto => dado que vai no res.json()
 */

function createRpcHandler(
  remoteFunction,
  paramSource = "query",
  { errorMessage, transform } = {}
) {
  return async (req, res) => {
    try {
      const params =
        paramSource === "body"
          ? req.body
          : paramSource === "query"
          ? req.query
          : {};

      // Basic sanitization - remove potential harmful characters
      const sanitizedParams = sanitizeParams(params);

      // Map common field names to Supabase stored procedure parameters
      const rpcParams = { ...sanitizedParams };
      if (remoteFunction === "check_password") {
        // Frontend sends { id, senha }
        if (rpcParams.id !== undefined) {
          rpcParams.p_id = rpcParams.id;
          delete rpcParams.id;
        }
        if (rpcParams.senha !== undefined) {
          rpcParams.p_senha = rpcParams.senha;
          delete rpcParams.senha;
        }
      }

      const { data, error } = await supabase.rpc(remoteFunction, rpcParams);

      if (error) {
        console.error(`RPC error [${remoteFunction}]:`, error);
        return res.status(500).json({
          message: errorMessage || `Erro em ${remoteFunction}`,
          error: error.message,
        });
      }

      // Check if login failed (for password validation)
      if (remoteFunction === 'check_password' && (!data || data.length === 0)) {
        const fs = require('fs');
        const path = require('path');
        const logEntry = `[${new Date().toISOString()}] FAILED LOGIN: ID ${sanitizedParams.id || 'unknown'} from IP ${req.ip || req.connection.remoteAddress}\n`;
        fs.appendFileSync(path.join(__dirname, '..', 'auth.log'), logEntry);
      }

      const payload = transform ? transform(data) : data;
      return res.json(payload);
    } catch (err) {
      console.error(`Erro interno [${remoteFunction}]:`, err);
      return res.status(500).json({
        message: `Erro interno em ${remoteFunction}`,
        error: err.message,
      });
    }
  };
}

// Basic sanitization function
function sanitizeParams(params) {
  if (typeof params !== 'object' || params === null) return params;

  const sanitized = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // Remove potential SQL injection characters and trim
      sanitized[key] = value.replace(/[<>'"&]/g, '').trim();
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeParams(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

module.exports = { createRpcHandler };
