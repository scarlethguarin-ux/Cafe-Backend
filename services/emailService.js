const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporter usando variables de entorno o valores por defecto
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'tu_correo@gmail.com',
    pass: process.env.EMAIL_PASS || 'tu_contraseña_de_aplicacion'
  }
});

/**
 * Envía correo de bienvenida
 * @param {string} email - Correo del usuario
 */
const sendWelcomeEmail = async (email) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #6F4E37; color: white; padding: 20px; text-align: center;">
          <h2>¡Bienvenido a Productora de Café!</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hola,</p>
          <p>Gracias por registrarte en nuestra plataforma. Estamos felices de tenerte con nosotros.</p>
          <p>Podrás realizar tus pedidos y hacer seguimiento fácilmente.</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #666;">
          © ${new Date().getFullYear()} Productora de Café. Todos los derechos reservados.
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Productora de Café" <${process.env.EMAIL_USER || 'no-reply@cafe.com'}>`,
      to: email,
      subject: '¡Bienvenido a nuestra plataforma! ☕',
      html: htmlContent
    });
    console.log(`✉️ Correo de bienvenida enviado a ${email}: ${info.messageId}`);
  } catch (error) {
    console.error(`Error enviando correo de bienvenida a ${email}:`, error);
  }
};

/**
 * Envía factura por correo
 * @param {string} email - Correo del cliente
 * @param {object} pedido - Datos del pedido
 * @param {Array} detalles - Lista de productos comprados
 */
const sendInvoiceEmail = async (email, pedido, detalles) => {
  try {
    let filasProductos = '';
    detalles.forEach(d => {
      filasProductos += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">Producto #${d.id_producto}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${d.cantidad}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${d.precio_unitario}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${d.subtotal}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #6F4E37; color: white; padding: 20px; text-align: center;">
          <h2>Factura de tu Pedido #${pedido.id_pedido}</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hola,</p>
          <p>¡Tu pedido ha sido <strong>aceptado</strong>! Aquí tienes el detalle de tu compra:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f4f4f4;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Producto</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">Cant.</th>
                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Precio</th>
                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${filasProductos}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">$${pedido.monto_total}</td>
              </tr>
            </tfoot>
          </table>
          
          <p style="margin-top: 20px;">Si tienes alguna duda, responde a este correo.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Productora de Café" <${process.env.EMAIL_USER || 'no-reply@cafe.com'}>`,
      to: email,
      subject: `Factura de tu Pedido #${pedido.id_pedido} 🧾`,
      html: htmlContent
    });
    console.log(`✉️ Factura enviada a ${email}: ${info.messageId}`);
  } catch (error) {
    console.error(`Error enviando factura a ${email}:`, error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendInvoiceEmail
};
