// Utilitários de data/hora no fuso de Brasília (America/Sao_Paulo).
//
// Por que não usar `new Date()` direto: o valor em si (instante UTC) está sempre
// correto, mas ao formatar/gravar em colunas "timestamp without time zone" o
// Sequelize/pg usa os getters locais do processo Node (ex.: getHours()), que
// dependem do timezone do SO. Em produção (Render) o SO roda em UTC, então o
// horário salvo fica 3h adiantado em relação a Brasília — mesmo com
// process.env.TZ setado, caso o container não tenha a tzdata do IANA.
// `toLocaleString` com `timeZone` usa o ICU embutido no Node (independe da
// tzdata do SO), então funciona igual em qualquer ambiente.
function fmtDate(d = new Date()) {
  return new Date(d)
    .toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' })
    .replace(',', '');
}

// Meia-noite do dia atual em Brasília, como Date UTC — comparável com
// `new Date(dataonly)` (que também interpreta "YYYY-MM-DD" como UTC).
function todayBR() {
  const [y, m, d] = fmtDate().slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// Lê uma string "timestamp without time zone" vinda do Postgres (ex.:
// "2026-09-03 16:00:00") sabendo que ela foi gravada em horário de Brasília
// (por fmtDate, acima). Anexa o offset fixo -03:00 explicitamente em vez de
// deixar o driver `pg` interpretar pelo timezone do processo — o parser padrão
// do `pg` para esse tipo de coluna usa os getters locais do Node, então o
// mesmo valor lido no Render (SO em UTC) sairia 3h diferente do lido localmente.
// Brasil não observa horário de verão desde 2019, então -03:00 fixo é seguro.
function parseNaiveBR(str) {
  if (str == null) return null;
  return new Date(`${str.replace(' ', 'T')}-03:00`);
}

module.exports = { fmtDate, todayBR, parseNaiveBR };
