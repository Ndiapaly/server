const nodemailer = require('nodemailer');

const sendOrderConfirmation = async (req, res) => {
    try {
        const { items, total, customerEmail } = req.body;
        console.log('Données reçues:', { items, total, customerEmail });

        // Configuration détaillée du transporteur Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Log des informations de configuration
        console.log('Configuration email:', {
            emailUser: process.env.EMAIL_USER,
            hasPassword: !!process.env.EMAIL_PASSWORD,
            passwordLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
        });

        // Vérification de la connexion
        try {
            await transporter.verify();
            console.log('Connexion SMTP établie avec succès');
        } catch (verifyError) {
            console.error('Erreur de vérification SMTP:', verifyError);
            throw new Error('Impossible de se connecter au serveur SMTP: ' + verifyError.message);
        }

        // Email pour le client
        const customerMailOptions = {
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: 'Confirmation de votre commande - BintaShop',
            html: `
                <h1>Merci pour votre commande !</h1>
                <p>Votre commande a bien été enregistrée.</p>
                <h2>Détails de la commande :</h2>
                <ul>
                    ${items.map(item => `<li>${item.name} - Quantité: ${item.quantity} - Prix: ${item.price}€</li>`).join('')}
                </ul>
                <p><strong>Total : ${total}€</strong></p>
            `
        };

        // Email pour l'administrateur
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'Nouvelle commande - BintaShop',
            html: `
                <h1>Nouvelle commande reçue</h1>
                <p>Email client : ${customerEmail}</p>
                <h2>Détails de la commande :</h2>
                <ul>
                    ${items.map(item => `<li>${item.name} - Quantité: ${item.quantity} - Prix: ${item.price}€</li>`).join('')}
                </ul>
                <p><strong>Total : ${total}€</strong></p>
            `
        };

        // Envoi des emails avec gestion d'erreur détaillée
        try {
            console.log('Tentative d\'envoi de l\'email client...');
            const customerInfo = await transporter.sendMail(customerMailOptions);
            console.log('Email client envoyé:', customerInfo.response);

            console.log('Tentative d\'envoi de l\'email admin...');
            const adminInfo = await transporter.sendMail(adminMailOptions);
            console.log('Email admin envoyé:', adminInfo.response);

            res.status(200).json({ 
                message: 'Emails de confirmation envoyés avec succès',
                customerEmail: customerInfo.response,
                adminEmail: adminInfo.response
            });
        } catch (emailError) {
            console.error('Erreur détaillée lors de l\'envoi des emails:', {
                code: emailError.code,
                command: emailError.command,
                response: emailError.response,
                responseCode: emailError.responseCode,
                stack: emailError.stack
            });
            throw new Error(`Erreur lors de l'envoi des emails: ${emailError.message}`);
        }

    } catch (error) {
        console.error('Erreur globale:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: error.message,
            details: error.toString()
        });
    }
};

module.exports = {
    sendOrderConfirmation
};
