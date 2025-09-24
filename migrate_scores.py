from extensions import db
from app import app

with app.app_context():
    conn = db.engine.raw_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE user ADD COLUMN totalScore INTEGER DEFAULT 0;")
    except Exception as e:
        print("totalScore existe déjà :", e)
    try:
        cursor.execute("ALTER TABLE user ADD COLUMN bestScore INTEGER DEFAULT 0;")
    except Exception as e:
        print("bestScore existe déjà :", e)
    conn.commit()
    conn.close()

print("Migration terminée ✅")
