const nodemailer = require("nodemailer");

function sendMails(req, res) {
  const { destination, title, body } = req.body;

  const transporter = nodemailer.createTransport({
    host: "mail.gd.ind.br", // Servidor SMTP
    port: 587, // Porta
    auth: {
      user: "fabrica@gd.ind.br",
      pass: "gera@5500", // Certifique-se de que as credenciais estão corretas
    },
  });

  // Configuração do e-mail
  const mailOptions = {
    from: "fabrica@gd.ind.br",
    to: destination,
    subject: title,
    text: body,
  };

  // Envia o e-mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // Logando o erro completo para depuração
      console.error("Erro no envio de e-mail:", error);
      return res.status(500).json({
        message: "Erro ao enviar email",
        error: error.message, // Incluindo a mensagem de erro no JSON
      });
    } else {
      // Logando a resposta de sucesso
      console.log("E-mail enviado com sucesso:", info);
      return res.status(200).json({
        message: "Email enviado com sucesso",
        info: info.response, // Incluindo a resposta do envio no JSON
      });
    }
  });
}

module.exports = { sendMails };
