from flask_mail import Message
from extensions import mail

def send_verification_code(recipient_email: str, code: str):
    msg = Message(
        subject="Code de vérification - Click Master",
        recipients=[recipient_email]
    )
    msg.body = (
        "Bonjour,\n\n"
        f"Votre code de vérification est : {code}\n"
        "Il est valable pendant 10 minutes.\n\n"
        "L'équipe Click Master"
    )
    mail.send(msg)