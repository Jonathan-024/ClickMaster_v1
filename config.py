import os
from dotenv import load_dotenv

# Charger les variables du fichier .env
load_dotenv()

# Chemin absolu vers le répertoire du projet
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Chemin vers le dossier "database" et création si nécessaire
DB_DIR = os.path.join(BASE_DIR, "database")
os.makedirs(DB_DIR, exist_ok=True)

# Chemin complet vers le fichier SQLite
DB_PATH = os.path.join(DB_DIR, "db.sqlite3")

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-this-in-.env")

    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.normpath(DB_PATH)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask-Mail
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME", "1013jonathanm@gmail.com")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "pcjn rett xlnr pxlx")
    MAIL_DEFAULT_SENDER = ("Click Master", os.environ.get("MAIL_USERNAME", "1013jonathanm@gmail.com"))

# Vérification rapide (optionnel)
if __name__ == "__main__":
    print("Chemin base de données :", DB_PATH)
    print("Existe :", os.path.exists(DB_DIR))