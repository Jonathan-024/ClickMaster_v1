import random, string, time
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from extensions import db, mail
from database.models import User
from services.mail_service import send_verification_code


# --- Initialisation ---
app = Flask(__name__)
app.config.from_object(Config)

# désactive la cache statique pour le dev
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

db.init_app(app)
mail.init_app(app)

# Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)

login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# -- Page d'accueil --
@app.route("/")
def index():
    classement = User.query.order_by(
        User.totalScore.desc(),
        User.bestScore.desc()
    ).limit(10).all()
    return render_template("index.html", classement=classement)


# --- Inscription ---
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]
        confirm_password = request.form.get("confirm_password")

        if password != confirm_password:
            flash("Les mots de passe ne correspondent pas", "error")
            return redirect(url_for("register"))

        if User.query.filter_by(username=username).first():
            flash("Nom d'utilisateur déjà pris", "error")
            return redirect(url_for("register"))
        if User.query.filter_by(email=email).first():
            flash("Email déjà utilisé", "error")
            return redirect(url_for("register"))

        user = User(username=username, email=email, password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        flash("Compte créé avec succès, connectez-vous", "success")
        return redirect(url_for("login"))

    return render_template("register.html")

# --- Connexion ---
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            flash("Connexion réussie", "success")
            next_page = request.args.get("next")
            return redirect(next_page or url_for("index"))
        else:
            flash("Nom d'utilisateur ou mot de passe incorrect", "error")
            return redirect(url_for("login"))

    return render_template("login.html")

# --- Déconnexion ---
@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Déconnecté avec succès", "info")
    return redirect(url_for("index"))

# --- Mot de passe oublié ---
@app.route("/forgot_password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        email = request.form["email"]
        user = User.query.filter_by(email=email).first()
        if not user:
            flash("Aucun compte associé à cet email", "error")
            return redirect(url_for("forgot_password"))

        code = "".join(random.choices(string.digits, k=4))
        session["reset_code"] = code
        session["reset_email"] = email
        session["reset_time"] = time.time()

        send_verification_code(email, code)
        flash("Un code de vérification a été envoyé par email", "info")
        return redirect(url_for("reset_password", email=email))

    return render_template("forgot_password.html")

# --- Réinitialisation du mot de passe ---
@app.route("/reset_password/<email>", methods=["GET", "POST"])
def reset_password(email):
    if request.method == "POST":
        code = request.form["code"]
        new_password = request.form["new_password"]
        confirm_password = request.form["confirm_new_password"]

        if "reset_code" not in session or "reset_email" not in session:
            flash("Session expirée, recommencez", "error")
            return redirect(url_for("forgot_password"))

        if session["reset_email"] != email:
            flash("Email invalide", "error")
            return redirect(url_for("forgot_password"))

        if time.time() - session["reset_time"] > 600:
            flash("Code expiré, recommencez", "error")
            return redirect(url_for("forgot_password"))

        if code != session["reset_code"]:
            flash("Code incorrect", "error")
            return redirect(url_for("reset_password", email=email))

        if new_password != confirm_password:
            flash("Les mots de passe ne correspondent pas", "error")
            return redirect(url_for("reset_password", email=email))

        user = User.query.filter_by(email=email).first()
        if user:
            user.password_hash = generate_password_hash(new_password)
            db.session.commit()
            flash("Mot de passe réinitialisé avec succès", "success")
            session.clear()
            return redirect(url_for("login"))

    return render_template("reset_password.html", email=email)

# --- Page du jeu ---
@app.context_processor
def inject_user():
    return dict(is_authenticated=current_user.is_authenticated)

@app.route("/game")
@login_required
def game():
    return render_template("game.html")

# --- Mise à jour du score ---
@app.route("/update_score", methods=["POST"])
@login_required
def update_score():
    data = request.get_json()
    new_score = data.get("score", 0)

    # Mise à jour du score total
    current_user.totalScore += new_score

    # Mise à jour du meilleur score
    if new_score > current_user.bestScore:
        current_user.bestScore = new_score

    db.session.commit()

    return {
        "status": "ok",
        "totalScore": current_user.totalScore,
        "bestScore": current_user.bestScore
    }

# --- Leaderboard ---
@app.route("/api/leaderboard")
def api_leaderboard():
    top_users = User.query.order_by(
        User.totalScore.desc(),
        User.bestScore.desc()
    ).limit(10).all()

    return jsonify([
        {
            "name": u.username,
            "totalScore": u.totalScore,
            "bestScore": u.bestScore
        }
        for u in top_users
    ])

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    # debug=True active le reloader automatique pour Python et les templates HTML
    app.run(debug=True, use_reloader=True)
