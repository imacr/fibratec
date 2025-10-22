import os
import secrets
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from dotenv import load_dotenv
import json
import calendar
import traceback
from datetime import date
from datetime import timedelta
from werkzeug.utils import secure_filename



# Carga las variables de entorno desde un archivo .env para mayor seguridad
load_dotenv()

app = Flask(__name__)

# Configuración de CORS para permitir peticiones desde tu frontend (Vite en puerto 5173 por defecto)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}})

# Configuración segura usando variables de entorno
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'una-clave-secreta-para-desarrollo')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:admin@localhost/control_vehicular1')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de Flask-Mail para enviar correos con Gmail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USER')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_APP_PASS')

# Inicialización de las extensiones de Flask
db = SQLAlchemy(app)
mail = Mail(app)

# --- 2. DEFINICIÓN DEL MODELO DE LA BASE DE DATOS (ORM) ---
# Esta clase debe coincidir con la estructura de tu tabla 'Usuarios' ya existente
class Usuarios(db.Model):
    __tablename__ = 'Usuarios'  
    id_usuario = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    usuario = db.Column(db.String(50), unique=True, nullable=False)
    contraseña = db.Column(db.String(255), nullable=False)
    correo = db.Column(db.String(255), unique=True, nullable=False)
    rol = db.Column(db.String(50), nullable=False, default='usuario')
    fecha_registro = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    fecha_ultimo_login = db.Column(db.TIMESTAMP, nullable=True)
    estado = db.Column(db.Enum('activo', 'inactivo'), default='activo')
    token_recuperacion = db.Column(db.String(255), nullable=True)
    token_expiracion = db.Column(db.TIMESTAMP, nullable=True)
    
class Unidades(db.Model):
    __tablename__ = "Unidades"
    id_unidad = db.Column(db.Integer, primary_key=True)
    marca = db.Column(db.String(100))
    vehiculo = db.Column(db.String(100))
    modelo = db.Column(db.Integer)
    clase_tipo = db.Column(db.String(50))
    niv = db.Column(db.String(50), unique=True)
    motor = db.Column(db.String(50))
    transmision = db.Column(db.String(50))
    combustible = db.Column(db.String(50))
    color = db.Column(db.String(50))
    telefono_gps = db.Column(db.String(20))
    sim_gps = db.Column(db.String(20))
    uid = db.Column(db.String(50))
    propietario = db.Column(db.String(255))
    sucursal = db.Column(db.String(100))
    compra_arrendado = db.Column(db.String(20))
    fecha_adquisicion = db.Column(db.Date)

    placa = db.relationship('Placas', uselist=False, backref='unidad')  # one-to-one


class Placas(db.Model):
    __tablename__ = "Placas"
    id_placa = db.Column(db.Integer, primary_key=True)
    id_unidad= db.Column(db.Integer, db.ForeignKey('Unidades.id_unidad'), nullable=False)
    folio = db.Column(db.String(50))
    placa = db.Column(db.String(10), unique=True, nullable=False)
    fecha_expedicion = db.Column(db.Date)
    fecha_vigencia = db.Column(db.Date)

class VerificacionVehicular(db.Model):
    __tablename__ = 'verificacionvehicular'
    id_verificacion = db.Column(db.Integer, primary_key=True)
    id_unidad = db.Column(db.Integer, db.ForeignKey('Unidades.id_unidad'))
    ultima_verificacion = db.Column(db.Date)
    periodo_1 = db.Column(db.Date)
    periodo_1_real = db.Column(db.Date)
    url_verificacion_1 = db.Column(db.String(255))
    periodo_2 = db.Column(db.Date, nullable=True)
    periodo_2_real = db.Column(db.Date, nullable=True)
    url_verificacion_2 = db.Column(db.String(255), nullable=True)
    holograma = db.Column(db.String(50))
    folio_verificacion = db.Column(db.String(50))
    engomado = db.Column(db.String(50))

    unidad = db.relationship("Unidades", backref="verificaciones")

# Modelo para lugares de reparación
class LugarReparacion(db.Model):
    __tablename__ = "lugaresreparacion"
    id_lugar = db.Column(db.Integer, primary_key=True)
    nombre_lugar = db.Column(db.String(150), unique=True, nullable=False)
    tipo_lugar = db.Column(db.String(50))  # taller, empresa, mecánico particular
    direccion = db.Column(db.Text)
    contacto = db.Column(db.String(100))
    observaciones = db.Column(db.Text)
    precio = db.Column(db.Numeric(10,2))
    tipo_pago = db.Column(db.String(50))
    
# Modelo para Solicitud de Falla (chofer)
class SolicitudFalla(db.Model):
    __tablename__ = "solicitudesfallas"
    id_solicitud = db.Column(db.Integer, primary_key=True)
    id_unidad = db.Column(db.Integer, db.ForeignKey("Unidades.id_unidad"), nullable=False)
    id_pieza = db.Column(db.Integer, db.ForeignKey("piezas.id_pieza"), nullable=False)
    id_marca = db.Column(db.Integer, db.ForeignKey("marcaspiezas.id_marca"))
    tipo_servicio = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    id_chofer = db.Column(db.Integer, nullable=False)
    estado = db.Column(db.String(20), default="pendiente")  # pendiente/aprobada/rechazada
    fecha_solicitud = db.Column(db.DateTime, default=datetime.utcnow)

# Modelo para Falla Mecánica
class FallaMecanica(db.Model):
    __tablename__ = "fallasmecanicas"
    id_falla = db.Column(db.Integer, primary_key=True)
    id_unidad = db.Column(db.Integer, db.ForeignKey("Unidades.id_unidad"), nullable=False)
    fecha_falla = db.Column(db.DateTime, default=datetime.now, nullable=False)
    id_pieza = db.Column(db.Integer, db.ForeignKey("piezas.id_pieza"), nullable=False)
    id_marca = db.Column(db.Integer, db.ForeignKey("marcaspiezas.id_marca"))
    tipo_servicio = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    id_lugar = db.Column(db.Integer, db.ForeignKey("lugaresreparacion.id_lugar"))
    proveedor = db.Column(db.String(255))
    tipo_pago = db.Column(db.String(50))
    costo = db.Column(db.Numeric(15,2))
    tiempo_uso_pieza = db.Column(db.Integer)
    aplica_poliza = db.Column(db.Boolean, default=False)
    observaciones = db.Column(db.Text)
    url_comprobante = db.Column(db.String(500))

class Piezas(db.Model):
    __tablename__ = "piezas"
    id_pieza = db.Column(db.Integer, primary_key=True)
    nombre_pieza = db.Column(db.String(100), nullable=False, unique=True)
    descripcion = db.Column(db.Text)

class MarcasPiezas(db.Model):
    __tablename__ = "marcaspiezas"
    id_marca = db.Column(db.Integer, primary_key=True)
    nombre_marca = db.Column(db.String(100), nullable=False, unique=True)
    pais_origen = db.Column(db.String(100))
    observaciones = db.Column(db.Text)

#==============================================================================================================================

def get_db_connection():
    # Devuelve la conexión cruda para ejecutar SQL directo
    return db.engine.raw_connection()

# --- 3. RUTAS DE LA API ---

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    app.logger.info(f"Intento de inicio de sesión para el usuario: {username}")

    if not username or not password:
        app.logger.warning("No se proporcionó usuario o contraseña.")
        return jsonify({"error": "Usuario y contraseña son requeridos"}), 400

    user = Usuarios.query.filter_by(usuario=username, estado='activo').first()

    if user:
        app.logger.info(f"Usuario encontrado: {user.usuario}, contraseña almacenada: {user.contraseña}")
        if check_password_hash(user.contraseña, password):
            user.fecha_ultimo_login = datetime.utcnow()
            db.session.commit()
            return jsonify({
                "message": "Inicio de sesión exitoso",
                "user": {"id": user.id_usuario, "username": user.usuario, "nombre": user.nombre, "rol": user.rol}
            }), 200
        else:
            app.logger.warning("Contraseña inválida proporcionada.")
    else:
        app.logger.info("Usuario no encontrado o inactivo.")

    return jsonify({"error": "Credenciales inválidas o usuario inactivo"}), 401



# =======================
#USUARIOS - CREACION
# ======================= 
@app.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    data = request.json
    try:
        nuevo_usuario = Usuarios(
            nombre=data.get('nombre'),
            usuario=data.get('usuario'),
            contraseña=generate_password_hash(data.get('contraseña')),
            correo=data.get('correo'),
            rol=data.get('rol')
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({"mensaje": "Usuario creado correctamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    usuarios = Usuarios.query.all()
    resultado = []
    for u in usuarios:
        resultado.append({
            'id_usuario': u.id_usuario,
            'nombre': u.nombre,
            'usuario': u.usuario,
            'correo': u.correo,
            'rol': u.rol,
            'fecha_registro': u.fecha_registro,
            'fecha_ultimo_login': u.fecha_ultimo_login,
            'estado': u.estado
        })
    return jsonify(resultado), 200

#` =======================
# RECUPERACION DE CONTRASEÑA
# =======================`
@app.route('/request-reset', methods=['POST'])
def request_password_reset():
    """Maneja la solicitud de recuperación de contraseña."""
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Correo electrónico requerido"}), 400

    user = Usuarios.query.filter_by(correo=email).first()
    if user:
        # Generar el token de recuperación
        token = secrets.token_urlsafe(32)
        user.token_recuperacion = token
        user.token_expiracion = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        try:
            # Crear el enlace de restablecimiento
            #reset_link = f"{os.getenv('FRONTEND_URL', 'http://192.168.254.158:5173')}/reset-password/{token}"
            frontend_url = "http://192.168.254.158:5173"
            reset_link = f"{frontend_url}/reset-password/{token}"

            msg = Message(
                'Restablecimiento de Contraseña',
                sender=app.config['MAIL_USERNAME'],
                recipients=[email]
            )

            msg.html = f"""
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #000000; color: #ffffff; border-radius: 10px; text-align: center;">
                
                <h1 style="font-size: 24px; margin-bottom: 20px;">Restablece tu contraseña</h1>
                
                <p style="font-size: 16px; margin-bottom: 30px; color: #e0e0e0;">
                    Hola,<br>
                    Has solicitado restablecer tu contraseña. Haz clic en el botón a continuación.
                </p>
                
                <a href="{reset_link}" style="
                    display: inline-block;
                    padding: 12px 28px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #ffffff;
                    background-color: #ff1f3c;
                    text-decoration: none;
                    border-radius: 6px;
                ">
                    Restablecer Contraseña
                </a>
                
                <p style="font-size: 14px; color: #bbbbbb; margin-top: 25px;">
                    Si no solicitaste este cambio, ignora este correo.
                </p>
                
                <p style="font-size: 12px; color: #888888;">
                    Este enlace expira en 1 hora.
                </p>
            </div>
            """
            print("Enlace de recuperación:", reset_link)


            mail.send(msg)


        except Exception as e:
            app.logger.error(f"Error al enviar correo de recuperación: {e}")
            return jsonify({"error": "Error al enviar el correo de recuperación."}), 500

    return jsonify({"message": "Si tu correo está registrado, recibirás un enlace."}), 200


@app.route('/reset-password/<string:token>', methods=['POST'])
def reset_password(token):
    """Maneja el cambio de contraseña a través del token."""
    data = request.get_json()
    password = data.get('password')

    if not password:    
        return jsonify({"error": "La nueva contraseña es requerida"}), 400

    user = Usuarios.query.filter_by(token_recuperacion=token).filter(Usuarios.token_expiracion > datetime.utcnow()).first()

    if not user:
        return jsonify({"error": "El token es inválido o ha expirado."}), 400

    user.contraseña = generate_password_hash(password)
    user.token_recuperacion = None
    user.token_expiracion = None
    db.session.commit()

    return jsonify({"message": "Contraseña actualizada con éxito"}), 200

# =======================
#UNIDADES - OBTENER DATOS
# =======================
@app.route('/api/unidades', methods=['GET'])
def get_unidades_data():
    conn = db.engine.raw_connection()
    try:
        cursor = conn.cursor()
        query = """
        SELECT
        U.id_unidad,
        U.marca,
        U.vehiculo,
        U.modelo,
        U.niv,
        P.placa,
        U.fecha_adquisicion,
        P.fecha_vigencia AS fecha_vencimiento_tarjeta,
        CASE WHEN P.fecha_vigencia < CURDATE() THEN 'Vencida' ELSE 'Activa' END AS estado_tarjeta,
        V.engomado,
        C.nombre AS chofer_asignado,
        JSON_OBJECT(
            'color', U.color,
            'clase_tipo', U.clase_tipo,
            'motor', U.motor,
            'transmision', U.transmision,
            'combustible', U.combustible,
            'sucursal', U.sucursal,
            'compra_arrendado', U.compra_arrendado,
            'propietario', U.propietario,
            'uid', U.uid,
            'telefono_gps', U.telefono_gps,
            'sim_gps', U.sim_gps,
            'no_poliza', G.no_poliza,
            'folio_verificacion', V.folio_verificacion
        ) AS mas_datos
    FROM Unidades U
    LEFT JOIN (
        SELECT * FROM Placas P1
        WHERE P1.id_placa = (SELECT P2.id_placa FROM Placas P2 WHERE P2.id_unidad = P1.id_unidad ORDER BY P2.fecha_vigencia DESC LIMIT 1)
    ) P ON U.id_unidad = P.id_unidad
    LEFT JOIN (
        SELECT * FROM Garantias G1
        WHERE G1.id_garantia = (SELECT G2.id_garantia FROM Garantias G2 WHERE G2.id_unidad = G1.id_unidad ORDER BY G2.vigencia DESC LIMIT 1)
    ) G ON U.id_unidad = G.id_unidad
    LEFT JOIN (
        SELECT * FROM VerificacionVehicular V1
        WHERE V1.id_verificacion = (SELECT V2.id_verificacion FROM VerificacionVehicular V2 WHERE V2.id_unidad = V1.id_unidad ORDER BY V2.ultima_verificacion DESC LIMIT 1)
    ) V ON U.id_unidad = V.id_unidad
    LEFT JOIN Asignaciones A ON U.id_unidad = A.id_unidad AND A.fecha_fin IS NULL
    LEFT JOIN Choferes C ON A.id_chofer = C.id_chofer
    ORDER BY U.id_unidad;

        """
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Formatear fechas
        for unidad in results:
            if unidad['fecha_adquisicion']:
                unidad['fecha_adquisicion'] = unidad['fecha_adquisicion'].strftime('%Y-%m-%d')
            if unidad['fecha_vencimiento_tarjeta']:
                unidad['fecha_vencimiento_tarjeta'] = unidad['fecha_vencimiento_tarjeta'].strftime('%Y-%m-%d')
            if unidad['mas_datos']:
                unidad['mas_datos'] = json.loads(unidad['mas_datos'])  # Convertir JSON string a dict

        return jsonify(results), 200
    except Exception as e:
        print(f"Error al ejecutar la consulta: {e}")
        return jsonify({"error": "Error al obtener los datos de unidades"}), 500
    finally:
        cursor.close()
        conn.close()
# =======================
# PUT - Actualizar unidad
# =======================
@app.route('/api/unidades/<int:id_unidad>', methods=['PUT'])
def update_unidad(id_unidad):
    data = request.json
    conn = db.engine.raw_connection()
    try:
        cursor = conn.cursor()
        query = """
        UPDATE Unidades
        SET marca = %s,
            vehiculo = %s,
            modelo = %s,
            niv = %s,
            fecha_adquisicion = %s,
            color = %s,
            clase_tipo = %s,
            motor = %s,
            transmision = %s,
            combustible = %s,
            sucursal = %s,
            compra_arrendado = %s,
            propietario = %s,
            uid = %s,
            telefono_gps = %s,
            sim_gps = %s
        WHERE id_unidad = %s
        """
        cursor.execute(query, (
            data.get("marca"),
            data.get("vehiculo"),
            data.get("modelo"),
            data.get("niv"),
            data.get("fecha_adquisicion"),
            data.get("color"),
            data.get("clase_tipo"),
            data.get("motor"),
            data.get("transmision"),
            data.get("combustible"),
            data.get("sucursal"),
            data.get("compra_arrendado"),
            data.get("propietario"),
            data.get("uid"),
            data.get("telefono_gps"),
            data.get("sim_gps"),
            id_unidad
        ))
        conn.commit()
        return jsonify({"message": "Unidad actualizada correctamente"}), 200
    except Exception as e:
        print(f"Error al actualizar: {e}")
        return jsonify({"error": "Error al actualizar la unidad"}), 500
    finally:
        cursor.close()
        conn.close()

#ELIMINACION DE UNIDADES
@app.route('/api/unidades/<int:id_unidad>', methods=['DELETE'])
def delete_unidad(id_unidad):
    conn = db.engine.raw_connection()
    try:
        cursor = conn.cursor()
        # Eliminación directa de la unidad; los registros relacionados se borrarán en cascada
        query = "DELETE FROM Unidades WHERE id_unidad = %s"
        cursor.execute(query, (id_unidad,))
        conn.commit()
        return jsonify({"message": "Unidad eliminada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar unidad: {e}")
        return jsonify({"error": "Error al eliminar la unidad"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/unidades', methods=['POST'])
def agregar_unidad():
    data = request.json
    try:
        nueva_unidad = Unidades(
            marca=data.get("marca"),
            vehiculo=data.get("vehiculo"),
            modelo=data.get("modelo"),
            clase_tipo=data.get("clase_tipo"),
            niv=data.get("niv"),
            motor=data.get("motor"),
            transmision=data.get("transmision"),
            combustible=data.get("combustible"),
            color=data.get("color"),
            telefono_gps=data.get("telefono_gps"),
            sim_gps=data.get("sim_gps"),
            uid=data.get("uid"),
            propietario=data.get("propietario"),
            sucursal=data.get("sucursal"),
            compra_arrendado=data.get("compra_arrendado"),
            fecha_adquisicion=data.get("fecha_adquisicion")
        )

        # Asignación de placa (one-to-one)
        nueva_placa = Placas(
            folio=data.get("folio"),
            placa=data.get("placa"),
            fecha_expedicion=data.get("fecha_expedicion"),
            fecha_vigencia=data.get("fecha_vigencia")
        )

        nueva_unidad.placa = nueva_placa  # ✅ Asignación correcta

        db.session.add(nueva_unidad)
        db.session.commit()

        return jsonify({"mensaje": "Unidad y placa registradas exitosamente."}), 201

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())  # para debug
        return jsonify({"error": str(e)}), 500



# =======================
#GARANTIAS - OBTENER DATOS
# =======================
@app.route('/api/garantias', methods=['GET'])
def obtener_garantias():
    conn = db.engine.raw_connection()
    cursor = None
    try:
        cursor = conn.cursor()
        query = """
            SELECT 
                g.id_garantia,
                COALESCE(C.nombre, 'Sin chofer asignado') AS chofer_asignado,
                g.id_unidad,
                u.marca,
                u.vehiculo,
                g.aseguradora,
                g.tipo_garantia,
                g.no_poliza,
                g.url_poliza,
                g.suma_asegurada,
                g.inicio_vigencia,
                g.vigencia,
                g.prima
            FROM Garantias g
            JOIN Unidades u ON g.id_unidad = u.id_unidad
            LEFT JOIN (
                SELECT id_unidad, id_chofer
                FROM Asignaciones
                WHERE fecha_fin IS NULL
            ) A ON u.id_unidad = A.id_unidad
            LEFT JOIN Choferes C ON A.id_chofer = C.id_chofer
            ORDER BY u.id_unidad, g.id_garantia;
        """

        cursor.execute(query)
        garantias = cursor.fetchall()
        columnas = [desc[0] for desc in cursor.description]
        resultados = []

        for fila in garantias:
            fila_dict = dict(zip(columnas, fila))
            for campo in ['inicio_vigencia', 'vigencia']:
                if fila_dict[campo]:
                    fila_dict[campo] = fila_dict[campo].strftime('%d/%m/%Y')
            resultados.append(fila_dict)

        return jsonify(resultados), 200

    except Exception as e:
        print(f"Error al obtener garantías: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()




ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/garantias', methods=['POST'])
def crear_garantia():
    UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads', 'garantias')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    ALLOWED_EXTENSIONS = {'pdf'}

    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    data = request.form
    archivo = request.files.get('archivo')

    if not archivo or archivo.filename == '':
        return jsonify({"error": "Debe subir un archivo PDF"}), 400

    if not allowed_file(archivo.filename):
        return jsonify({"error": "Solo se permiten archivos PDF"}), 400

    conn = db.engine.raw_connection()
    cursor = conn.cursor()

    try:
        # Validar que no exista una garantía con el mismo número de póliza
        cursor.execute("SELECT id_garantia FROM Garantias WHERE no_poliza = %s", (data['no_poliza'],))
        if cursor.fetchone():
            return jsonify({"error": "Ya existe una garantía con este número de póliza"}), 400

        # Validar que la unidad exista
        cursor.execute("SELECT id_unidad FROM Unidades WHERE id_unidad = %s", (data['id_unidad'],))
        if not cursor.fetchone():
            return jsonify({"error": "La unidad indicada no existe"}), 400

        # Guardar el archivo PDF
        filename = secure_filename(f"{data['no_poliza']}.pdf")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        archivo.save(filepath)
        url_poliza = f"/uploads/garantias/{filename}"
        # Insertar nueva garantía
        query = """
            INSERT INTO Garantias (
                id_unidad, aseguradora, tipo_garantia, no_poliza,
                suma_asegurada, inicio_vigencia, vigencia, prima, url_poliza
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            data['id_unidad'],
            data['aseguradora'],
            data['tipo_garantia'],
            data['no_poliza'],
            float(data['suma_asegurada']),
            data['inicio_vigencia'],
            data['vigencia'],
            float(data['prima']),
            url_poliza
        )

        cursor.execute(query, params)
        conn.commit()
        new_id = cursor.lastrowid  # ✅ forma correcta para MySQL

        return jsonify({
            "message": "Garantía creada correctamente",
            "id_garantia": new_id,
            "url_poliza": url_poliza
        }), 201

    except Exception as e:
        conn.rollback()
        print(f"Error al crear garantía: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/api/garantias/<int:id_garantia>', methods=['PUT'])
def actualizar_garantia(id_garantia):
    UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads', 'garantias')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    ALLOWED_EXTENSIONS = {'pdf'}

    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    data = request.form
    archivo = request.files.get('archivo')

    conn = db.engine.raw_connection()
    cursor = conn.cursor()

    try:
        # Validar que la garantía exista
        cursor.execute("SELECT id_garantia, url_poliza FROM Garantias WHERE id_garantia = %s", (id_garantia,))
        garantia_existente = cursor.fetchone()
        if not garantia_existente:
            return jsonify({"error": "La garantía no existe"}), 404

        # Validar que la unidad exista
        cursor.execute("SELECT id_unidad FROM Unidades WHERE id_unidad = %s", (data['id_unidad'],))
        if not cursor.fetchone():
            return jsonify({"error": "La unidad indicada no existe"}), 400

        url_poliza = garantia_existente[1]  # URL actual
        if archivo and allowed_file(archivo.filename):
            # Guardar el archivo
            ext = archivo.filename.rsplit('.', 1)[1].lower()
            filename = f"{data['no_poliza']}.{ext}"  # Nombre único
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

            archivo.save(filepath)  # Sobrescribe si ya existe
            url_poliza = f"/uploads/garantias/{filename}"
        # Actualización de la garantía en la base de datos
        query = """
            UPDATE Garantias SET
                id_unidad = %s,
                aseguradora = %s,
                tipo_garantia = %s,
                no_poliza = %s,
                suma_asegurada = %s,
                inicio_vigencia = %s,
                vigencia = %s,
                prima = %s,
                url_poliza = %s
            WHERE id_garantia = %s
        """
        params = (
            data['id_unidad'],
            data['aseguradora'],
            data['tipo_garantia'],
            data['no_poliza'],
            float(data['suma_asegurada']),
            data['inicio_vigencia'],
            data['vigencia'],
            float(data['prima']),
            url_poliza,
            id_garantia
        )

        cursor.execute(query, params)
        conn.commit()
        return jsonify({"message": "Garantía actualizada correctamente", "url_poliza": url_poliza}), 200

    except Exception as e:
        conn.rollback()
        error_message = f"Error al actualizar la garantía: {str(e)}"
        print(error_message)  # Imprimir el mensaje de error en la consola del servidor
        return jsonify({"error": error_message}), 500

    finally:
        cursor.close()
        conn.close()
# Servir archivos (opcional para ver en navegador)
@app.route('/uploads/garantias/<filename>')
def uploaded_file(filename):
    print(f"Sirviendo archivo: {filename}")
    return send_from_directory('uploads/garantias', filename)

UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads', 'garantias')

@app.route('/api/garantias/descargar/<filename>')
def descargar_garantia(filename):
    return send_from_directory(
        UPLOAD_FOLDER,
        filename,
        as_attachment=True  # <-- Esto fuerza que el navegador pregunte dónde guardar
    )

@app.route('/api/descargar/<path:filename>', methods=['GET'])
def descargar_archivo(filename):
    # Carpeta base de uploads
    UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')

    # Construir ruta absoluta del archivo
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # Validar que el archivo exista
    if not os.path.isfile(file_path):
        return abort(404, description="Archivo no encontrado")

    # Devolver el archivo para descarga
    # 'as_attachment=True' fuerza la descarga en lugar de abrirlo en el navegador
    return send_from_directory(
        directory=UPLOAD_FOLDER,
        path=filename,
        as_attachment=True
    )




@app.route('/api/garantias/<int:id_garantia>', methods=['DELETE'])
def eliminar_garantia(id_garantia):
    conn = db.engine.raw_connection()
    cursor = conn.cursor()
    try:
        # Primero obtener la URL del PDF para eliminarlo del servidor
        cursor.execute("SELECT url_poliza FROM Garantias WHERE id_garantia = %s", (id_garantia,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Garantía no encontrada"}), 404

        url_poliza = row[0]
        filepath = os.path.join(app.root_path, url_poliza.lstrip("/"))
        if os.path.exists(filepath):
            os.remove(filepath)

        # Eliminar la garantía
        cursor.execute("DELETE FROM Garantias WHERE id_garantia = %s", (id_garantia,))
        conn.commit()

        return jsonify({"message": "Garantía eliminada correctamente"}), 200

    except Exception as e:
        conn.rollback()
        print(f"Error al eliminar garantía: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


#verificacionwes
# =======================
# VERIFICACIONES - OBTENER DATOS
# =======================
# Configuración de uploads

MESES_ENGOMADO = {
    "primer_semestre": {
        "amarillo": [1, 2],
        "rosa": [2, 3],
        "rojo": [3, 4],
        "verde": [4, 5],
        "azul": [5, 6]
    },
    "segundo_semestre": {
        "amarillo": [7, 8],
        "rosa": [8, 9],
        "rojo": [9, 10],
        "verde": [10, 11],
        "azul": [11, 12]
    }
}


@app.route('/api/unidad/<int:id_unidad>', methods=['GET'])
def obtener_unidad_por_id(id_unidad):
    unidad = Unidades.query.filter_by(id_unidad=id_unidad).first()
    if not unidad:
        return jsonify({"error": "Unidad no encontrada"}), 404

    placa_obj = Placas.query.filter_by(id_unidad=id_unidad).first()
    placa = placa_obj.placa if placa_obj else ""
    
    # Calcular engomado automáticamente
    def calcular_color_por_placa(placa):
        if not placa:
            return ""
        ultimo_digito = placa[-1]
        colores = {"1": "verde", "2": "verde", "3": "rojo", "4": "rojo",
                   "5": "amarillo", "6": "amarillo", "7": "rosa", "8": "rosa",
                   "9": "azul", "0": "azul"}
        return colores.get(ultimo_digito, "")

    engomado = calcular_color_por_placa(placa)

    return jsonify({
        "id_unidad": unidad.id_unidad,
        "marca": unidad.marca,
        "vehiculo": unidad.vehiculo,
        "modelo": unidad.modelo,
        "placa": placa,
        "engomado": engomado
    })

# Helpers
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def calcular_color_por_placa(placa_str):
    """Determinar color de engomado según último dígito de placa."""
    if not placa_str:
        return ""
    ultimo_digito = placa_str[-1]
    colores = {
        "1": "verde", "2": "verde",
        "3": "rojo", "4": "rojo",
        "5": "amarillo", "6": "amarillo",
        "7": "rosa", "8": "rosa",
        "9": "azul", "0": "azul"
    }
    return colores.get(ultimo_digito, "")


# Endpoint: crear/actualizar verificación
@app.route('/api/verificaciones', methods=['POST'])
def crear_verificacion():
    UPLOAD_FOLDER = 'uploads/verificaciones'
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    data = request.form
    archivo = request.files.get('archivo')

    # 🚨 DEBUG: imprimir todo lo recibido
    print("===== DATA RECIBIDA =====")
    print("Form data:", data)
    print("Archivos:", request.files)
    print("==========================")

    if not archivo or archivo.filename == '':
        return jsonify({"error": "Debe subir un archivo PDF"}), 400
    if not allowed_file(archivo.filename):
        return jsonify({"error": "Solo se permiten archivos PDF"}), 400

    # Obtener unidad
    unidad = Unidades.query.filter_by(id_unidad=data['id_unidad']).first()
    if not unidad:
        return jsonify({"error": "La unidad indicada no existe"}), 400

    placa_str = unidad.placa.placa if unidad.placa else ""
    engomado = calcular_color_por_placa(placa_str)

    # Determinar periodo enviado
    if 'periodo_1_real' in data:
        periodo = '1'
    elif 'periodo_2_real' in data:
        periodo = '2'
    else:
        return jsonify({"error": "No se encontró periodo válido."}), 400

    # Fecha sugerida calculada según engomado (desde frontend o backend)
    fecha_sugerida_str = data.get(f'periodo_{periodo}')
    if not fecha_sugerida_str:
        return jsonify({"error": f"No se recibió la fecha sugerida para el periodo {periodo}."}), 400
    fecha_sugerida = datetime.strptime(fecha_sugerida_str, "%Y-%m-%d").date()

    # Fecha real manual
    fecha_real_str = data.get(f'periodo_{periodo}_real')
    if not fecha_real_str:
        return jsonify({"error": f"Debes ingresar la fecha real manualmente para el periodo {periodo}."}), 400
    fecha_real = datetime.strptime(fecha_real_str, "%Y-%m-%d").date()

    existing = VerificacionVehicular.query.filter_by(id_unidad=data['id_unidad']).first()

    try:
        filename = secure_filename(f"{data['id_unidad']}_{periodo}_{date.today()}.pdf")
        archivo.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        if existing:
            # Actualizar verificación existente
            if periodo == '1':
                if existing.periodo_1:
                    return jsonify({"error": "La primera verificación ya está registrada. Usa periodo 2."}), 400
                existing.periodo_1 = fecha_sugerida
                existing.periodo_1_real = fecha_real
                existing.url_verificacion_1 = f"/{UPLOAD_FOLDER}/{filename}"
            else:  # periodo 2
                if existing.periodo_2:
                    return jsonify({"error": "La segunda verificación ya está registrada.", "complete": True}), 400
                existing.periodo_2 = fecha_sugerida
                existing.periodo_2_real = fecha_real
                existing.url_verificacion_2 = f"/{UPLOAD_FOLDER}/{filename}"

            # Actualizar última verificación con la real
            existing.ultima_verificacion = fecha_real
            db.session.commit()

            return jsonify({
                "message": f"Verificación del periodo {periodo} registrada correctamente.",
                "fecha_sugerida": fecha_sugerida.isoformat(),
                "fecha_real": fecha_real.isoformat(),
                "complete": periodo == "2"
            }), 201

        # Crear nueva verificación si no existe
        nueva_verificacion = VerificacionVehicular(
            id_unidad=data['id_unidad'],
            ultima_verificacion=fecha_real,
            periodo_1=fecha_sugerida if periodo == '1' else None,
            periodo_1_real=fecha_real if periodo == '1' else None,
            periodo_2=fecha_sugerida if periodo == '2' else None,
            periodo_2_real=fecha_real if periodo == '2' else None,
            url_verificacion_1=f"/{UPLOAD_FOLDER}/{filename}" if periodo == '1' else None,
            url_verificacion_2=f"/{UPLOAD_FOLDER}/{filename}" if periodo == '2' else None,
            holograma=data.get('holograma', ''),
            folio_verificacion=data.get('folio_verificacion', ''),
            engomado=engomado
        )

        db.session.add(nueva_verificacion)
        db.session.commit()

        return jsonify({
            "message": f"Verificación del periodo {periodo} registrada correctamente.",
            "fecha_sugerida": fecha_sugerida.isoformat(),
            "fecha_real": fecha_real.isoformat(),
            "complete": periodo == "2"
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


#--------------------------------------------------------------------------------------------

#calculo de verificaciones

def calcular_siguiente_verificacion(fecha_real, holograma, engomado):
    if not fecha_real:
        return None

    # Holograma "00" → 2 años después
    if holograma == "00":
        return fecha_real.replace(year=fecha_real.year + 2)

    # Holograma "0" → 6 meses después
    if holograma == "0":
        mes_siguiente = fecha_real.month + 6
        año = fecha_real.year
        if mes_siguiente > 12:
            mes_siguiente -= 12
            año += 1
        ultimo_dia = calendar.monthrange(año, mes_siguiente)[1]
        return fecha_real.replace(year=año, month=mes_siguiente, day=ultimo_dia)

    # Hologramas normales según engomado y semestre
    MESES_ENGOMADO = {
        "primer_semestre": {"amarillo":[1,2],"rosa":[2,3],"rojo":[3,4],"verde":[4,5],"azul":[5,6]},
        "segundo_semestre": {"amarillo":[7,8],"rosa":[8,9],"rojo":[9,10],"verde":[10,11],"azul":[11,12]}
    }

    mes_actual = fecha_real.month
    semestre = "primer_semestre" if mes_actual <= 6 else "segundo_semestre"
    meses_posibles = MESES_ENGOMADO[semestre].get(engomado.lower(), [])

    if not meses_posibles:
        # fallback: 6 meses después
        nueva_fecha = fecha_real + timedelta(days=182)
        return nueva_fecha

    # Tomar primer mes >= mes_actual
    for m in meses_posibles:
        if m >= mes_actual:
            mes_siguiente = m
            break
    else:
        # Si ya pasaron todos los meses del semestre → primer mes del semestre siguiente
        semestre_siguiente = "segundo_semestre" if semestre == "primer_semestre" else "primer_semestre"
        mes_siguiente = MESES_ENGOMADO[semestre_siguiente].get(engomado.lower(), [mes_actual + 6])[0]

    # Ajustar año si se pasa de diciembre
    año = fecha_real.year + (1 if mes_siguiente < mes_actual else 0)
    ultimo_dia = calendar.monthrange(año, mes_siguiente)[1]

    return fecha_real.replace(year=año, month=mes_siguiente, day=ultimo_dia)




# Endpoint: obtener verificación por placa
@app.route('/api/verificacion-placa/<string:placa>', methods=['GET'])
def obtener_verificacion_placa(placa):
    placa_obj = Placas.query.filter_by(placa=placa).first()
    if not placa_obj:
        return jsonify({"error": "Placa no encontrada"}), 404

    unidad = placa_obj.unidad
    verificacion = VerificacionVehicular.query.filter_by(id_unidad=unidad.id_unidad).first()
    if not verificacion:
        return jsonify({"error": "No hay verificaciones registradas"}), 404

    # Determinar la fecha base para cálculo de próxima
    fecha_base = verificacion.periodo_2_real or verificacion.periodo_1_real

    proxima = None
    if fecha_base:
        proxima = calcular_siguiente_verificacion(fecha_base, verificacion.holograma, verificacion.engomado)

    return jsonify({
        "unidad": f"{unidad.marca} {unidad.vehiculo}",
        "placa": placa_obj.placa,
        "holograma": verificacion.holograma,
        "engomado": verificacion.engomado,
        "vigente": verificacion.periodo_1_real,
        "proxima": proxima,
        "anterior": verificacion.periodo_1_real,
        "url_verificacion_1": verificacion.url_verificacion_1,
        "url_verificacion_2": verificacion.url_verificacion_2
    })

@app.route('/api/verificaciones', methods=['GET'])
def obtener_verificaciones():
    conn = db.engine.raw_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT 
                V.id_verificacion,
                V.id_unidad,
                U.marca,
                U.vehiculo,
                U.modelo,
                P.placa,
                V.ultima_verificacion,
                V.periodo_1,
                V.periodo_1_real,
                V.url_verificacion_1,
                V.periodo_2,
                V.periodo_2_real,
                V.url_verificacion_2,
                V.holograma,
                V.folio_verificacion,
                V.engomado
            FROM verificacionvehicular V
            JOIN Unidades U ON V.id_unidad = U.id_unidad
            LEFT JOIN Placas P ON P.id_unidad = U.id_unidad
            ORDER BY V.id_verificacion DESC;
        """
        cursor.execute(query)
        filas = cursor.fetchall()
        columnas = [desc[0] for desc in cursor.description]

        resultados = []

        for fila in filas:
            fila_dict = dict(zip(columnas, fila))

            # Convertir fechas a string
            for campo in ['ultima_verificacion','periodo_1','periodo_1_real','periodo_2','periodo_2_real']:
                if fila_dict[campo]:
                    fila_dict[campo] = fila_dict[campo].strftime('%Y-%m-%d')

            # Calcular próxima verificación según engomado y periodo real
            fecha_base_str = fila_dict.get('periodo_2_real') or fila_dict.get('periodo_1_real')
            if fecha_base_str:
                fecha_base = datetime.strptime(fecha_base_str, "%Y-%m-%d").date()
                engomado = fila_dict.get('engomado', '')
                fila_dict['proxima_verificacion'] = calcular_siguiente_verificacion(fecha_base, fila_dict.get('holograma', ''), fila_dict.get('engomado', '')).strftime("%Y-%m-%d")
            else:
                fila_dict['proxima_verificacion'] = None

            resultados.append(fila_dict)

        return jsonify(resultados), 200

    except Exception as e:
        import traceback
        print("Error al obtener verificaciones:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# =======================

@app.route('/solicitudes/chofer/<int:id_chofer>', methods=['GET'])
def solicitudes_chofer(id_chofer):
    # Trae todas las solicitudes del chofer
    solicitudes = SolicitudFalla.query.filter_by(id_chofer=id_chofer).all()
    resultado = []
    for s in solicitudes:
        # Verifica si ya hay falla asociada
        falla_existente = FallaMecanica.query.filter_by(
            id_unidad=s.id_unidad,
            id_pieza=s.id_pieza,
            tipo_servicio=s.tipo_servicio
        ).first()
        resultado.append({
            "id_solicitud": s.id_solicitud,
            "unidad": s.id_unidad,
            "pieza": s.id_pieza,
            "marca": s.id_marca,
            "tipo_servicio": s.tipo_servicio,
            "descripcion": s.descripcion,
            "estado": s.estado,
            "completada": True if falla_existente else False
        })
    return jsonify(resultado)


# -------------------------------
# Crear solicitud de falla (CHOFER)
# -------------------------------
@app.route('/solicitudes', methods=['POST'])
def crear_solicitud():
    data = request.json
    nueva = SolicitudFalla(
        id_unidad = data['id_unidad'],
        id_pieza = data['id_pieza'],
        id_marca = data.get('id_marca'),
        tipo_servicio = data['tipo_servicio'],
        descripcion = data.get('descripcion', ''),
        id_chofer = data['id_chofer']
    )
    db.session.add(nueva)
    db.session.commit()
    return jsonify({"msg":"Solicitud creada", "id_solicitud": nueva.id_solicitud}), 201

# -------------------------------
# Listar solicitudes pendientes (ADMIN)

# -------------------------------
@app.route('/solicitudes', methods=['GET'])
def listar_todas_solicitudes():
    # Trae todas las solicitudes, ordenadas de más recientes a más antiguas
    solicitudes = SolicitudFalla.query.order_by(SolicitudFalla.fecha_solicitud.desc()).all()
    resultado = []
    for s in solicitudes:
        resultado.append({
            "id_solicitud": s.id_solicitud,
            "unidad": s.id_unidad,
            "pieza": s.id_pieza,
            "marca": s.id_marca,
            "tipo_servicio": s.tipo_servicio,
            "descripcion": s.descripcion,
            "estado": s.estado,  # añade estado para que se vea aprobado/pendiente/rechazado
            "id_chofer": s.id_chofer,
            "fecha_solicitud": s.fecha_solicitud.isoformat()
        })
    return jsonify(resultado)

# -------------------------------
# Aprobar o rechazar solicitud (ADMIN)
# -------------------------------
@app.route('/solicitudes/<int:id_solicitud>/aprobar', methods=['POST'])
def aprobar_solicitud(id_solicitud):
    data = request.json
    solicitud = SolicitudFalla.query.get_or_404(id_solicitud)

    # Cambiar estado
    solicitud.estado = 'aprobada' if data.get('aprobar') else 'rechazada'
    db.session.commit()

    return jsonify({"msg": f"Solicitud {'aprobada' if solicitud.estado=='aprobada' else 'rechazada'}"})

# -------------------------------
# Registrar falla (ADMIN)
# -------------------------------    

# Carpeta para los comprobantes de fallas
UPLOAD_FOLDER_FALLA = 'uploads/comprobantes_falla'
os.makedirs(UPLOAD_FOLDER_FALLA, exist_ok=True)
ALLOWED_EXTENSIONS_FALLA = {'pdf'}
app.config['UPLOAD_FOLDER_FALLA'] = UPLOAD_FOLDER_FALLA

def allowed_file_falla(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_FALLA

@app.route('/fallas', methods=['POST'])
def crear_falla():
    data = request.form
    archivo = request.files.get('comprobante')  # nombre del archivo en FormData

    id_solicitud = data.get('id_solicitud')
    if not id_solicitud:
        return jsonify({"error": "Falta id_solicitud"}), 400

    solicitud = SolicitudFalla.query.get_or_404(id_solicitud)
    if solicitud.estado != 'aprobada':
        return jsonify({"error": "La solicitud no ha sido aprobada"}), 400

    url_comprobante = None
    if archivo:
        if archivo.filename.lower().endswith('.pdf'):
            filename = f"falla_{solicitud.id_solicitud}.pdf"
            carpeta = os.path.join(app.root_path, 'uploads', 'fallasmecanicas')
            os.makedirs(carpeta, exist_ok=True)
            filepath = os.path.join(carpeta, filename)
            archivo.save(filepath)
            url_comprobante = f"uploads/fallasmecanicas/{filename}"
        else:
            return jsonify({"error": "Solo se permiten archivos PDF"}), 400

    # Aquí imprimimos para depuración
    print("URL del comprobante:", url_comprobante)

    aplica_poliza_str = data.get('aplica_poliza', 'false')
    aplica_poliza = aplica_poliza_str.lower() in ['true', '1', 'on']

    falla = FallaMecanica(
        id_unidad=solicitud.id_unidad,
        id_pieza=solicitud.id_pieza,
        fecha_falla=solicitud.fecha_solicitud,
        id_marca=solicitud.id_marca,
        tipo_servicio=solicitud.tipo_servicio,
        descripcion=solicitud.descripcion,
        id_lugar=data.get('id_lugar'),
        proveedor=data.get('proveedor'),
        tipo_pago=data.get('tipo_pago'),
        costo=data.get('costo'),
        tiempo_uso_pieza=data.get('tiempo_uso_pieza'),
        aplica_poliza=aplica_poliza,
        observaciones=data.get('observaciones'),
        url_comprobante=url_comprobante
    )

    db.session.add(falla)
    db.session.commit()

    # También podemos devolverlo en la respuesta para confirmar
    return jsonify({
        "msg": "Falla registrada con éxito",
        "id_falla": falla.id_falla,
        "url_comprobante": falla.url_comprobante
    })

@app.route('/fallas/<int:id_falla>', methods=['PUT'])
def actualizar_falla(id_falla):
    falla = FallaMecanica.query.get_or_404(id_falla)
    data = request.form
    archivo = request.files.get('comprobante')

    # Actualizar todos los campos excepto la fecha
    falla.descripcion = data.get('descripcion', falla.descripcion)
    falla.tipo_servicio = data.get('tipo_servicio', falla.tipo_servicio)
    falla.id_unidad = int(data.get('id_unidad', falla.id_unidad))
    falla.id_pieza = int(data.get('id_pieza', falla.id_pieza))
    falla.id_marca = int(data.get('id_marca', falla.id_marca))
    falla.id_lugar = int(data.get('id_lugar', falla.id_lugar))
    falla.proveedor = data.get('proveedor', falla.proveedor)
    falla.tipo_pago = data.get('tipo_pago', falla.tipo_pago)
    falla.costo = data.get('costo', falla.costo)
    falla.tiempo_uso_pieza = data.get('tiempo_uso_pieza', falla.tiempo_uso_pieza)
    falla.observaciones = data.get('observaciones', falla.observaciones)

    aplica_poliza_str = data.get('aplica_poliza')
    if aplica_poliza_str is not None:
        falla.aplica_poliza = aplica_poliza_str.lower() in ['true', '1', 'on']

    # Guardar archivo PDF si existe
    if archivo:
        if archivo.filename.lower().endswith('.pdf'):
            filename = f"falla_{falla.id_falla}.pdf"
            carpeta = os.path.join(app.root_path, 'uploads', 'fallasmecanicas')
            os.makedirs(carpeta, exist_ok=True)
            archivo.save(os.path.join(carpeta, filename))
            falla.url_comprobante = f"uploads/fallasmecanicas/{filename}"
        else:
            return jsonify({"error": "Solo se permiten archivos PDF"}), 400

    try:
        db.session.commit()

        # Obtener nombres descriptivos
        unidad = Unidades.query.get(falla.id_unidad)
        pieza = Piezas.query.get(falla.id_pieza)
        marca = MarcasPiezas.query.get(falla.id_marca)
        lugar = LugarReparacion.query.get(falla.id_lugar)

        return jsonify({
            "msg": "Falla actualizada con éxito",
            "falla": {
                "id_falla": falla.id_falla,
                "descripcion": falla.descripcion,
                "tipo_servicio": falla.tipo_servicio,
                "unidad": unidad.vehiculo if unidad else "No especificada",
                "pieza": pieza.nombre_pieza if pieza else "No especificada",
                "marca": marca.nombre_marca if marca else "No especificada",
                "id_lugar": falla.id_lugar,
                "lugar_reparacion": lugar.nombre_lugar if lugar else "No especificado",
                "proveedor": falla.proveedor,
                "tipo_pago": falla.tipo_pago,
                "costo": str(falla.costo),
                "tiempo_uso_pieza": falla.tiempo_uso_pieza,
                "aplica_poliza": falla.aplica_poliza,
                "observaciones": falla.observaciones,
                "fecha_falla": falla.fecha_falla.isoformat() if falla.fecha_falla else None,
                "url_comprobante": falla.url_comprobante
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# -------------------------------
# Obtener detalle de una falla
# -------------------------------
@app.route('/fallas/<int:id_falla>', methods=['GET'])
def detalle_falla(id_falla):
    falla = FallaMecanica.query.get_or_404(id_falla)
    return jsonify({
        "id_falla": falla.id_falla,
        "unidad": falla.id_unidad,
        "pieza": falla.id_pieza,
        "marca": falla.id_marca,
        "tipo_servicio": falla.tipo_servicio,
        "descripcion": falla.descripcion,
        "id_lugar": falla.id_lugar,
        "proveedor": falla.proveedor,
        "tipo_pago": falla.tipo_pago,
        "costo": str(falla.costo),
        "tiempo_uso_pieza": falla.tiempo_uso_pieza,
        "aplica_poliza": falla.aplica_poliza,
        "observaciones": falla.observaciones,
        "url_comprobante": falla.url_comprobante
    })

# Listar unidades
@app.route('/unidades', methods=['GET'])
def listar_unidades():
    unidades = Unidades.query.all()
    return jsonify([
        {"id_unidad": u.id_unidad, "vehiculo": u.vehiculo, "marca": u.marca, "modelo": u.modelo}
        for u in unidades
    ])

# Listar piezas
@app.route('/piezas', methods=['GET'])
def listar_piezas():
    piezas = Piezas.query.all()
    return jsonify([
        {"id_pieza": p.id_pieza, "nombre_pieza": p.nombre_pieza} for p in piezas
    ])

# Listar marcas
@app.route('/marcas', methods=['GET'])
def listar_marcas():
    marcas = MarcasPiezas.query.all()
    return jsonify([
        {"id_marca": m.id_marca, "nombre_marca": m.nombre_marca} for m in marcas
    ])

# Listar lugares de reparación
@app.route('/lugares', methods=['GET'])
def listar_lugares():
    lugares = LugarReparacion.query.all()
    return jsonify([
        {"id_lugar": l.id_lugar, "nombre_lugar": l.nombre_lugar} for l in lugares
    ])

# -------------------------------
# Listar fallas mecánicas (con nombres descriptivos)
# -------------------------------
@app.route('/fallas', methods=['GET'])
def listar_fallas():
    fallas = FallaMecanica.query.all()
    resultado = []

    for f in fallas:
        unidad = Unidades.query.get(f.id_unidad)
        pieza = Piezas.query.get(f.id_pieza)
        marca = MarcasPiezas.query.get(f.id_marca)
        lugar = LugarReparacion.query.get(f.id_lugar)

        resultado.append({
            "id_falla": f.id_falla,
            # IDs para selects
            "id_unidad": f.id_unidad,
            "id_pieza": f.id_pieza,
            "id_marca": f.id_marca,
            "id_lugar": f.id_lugar,

            # Nombres descriptivos
            "unidad": unidad.vehiculo if unidad else "No especificada",
            "pieza": pieza.nombre_pieza if pieza else "No especificada",
            "marca": marca.nombre_marca if marca else "No especificada",
            "lugar_reparacion": lugar.nombre_lugar if lugar else "No especificado",

            # Datos de la falla
            "tipo_servicio": f.tipo_servicio,
            "descripcion": f.descripcion,
            "proveedor": f.proveedor,
            "tipo_pago": f.tipo_pago,
            "costo": str(f.costo) if f.costo else "0.00",
            "tiempo_uso_pieza": f.tiempo_uso_pieza,
            "aplica_poliza": f.aplica_poliza,
            "observaciones": f.observaciones,
            "url_comprobante": f.url_comprobante,
            "fecha_falla": f.fecha_falla.isoformat() if f.fecha_falla else None
        })

    return jsonify(resultado)


@app.route('/fallas/<int:id_falla>', methods=['DELETE'])
def eliminar_falla(id_falla):
    conn = db.engine.raw_connection()
    cursor = conn.cursor()
    try:
        # Primero obtener la URL del comprobante para eliminarlo del servidor
        cursor.execute("SELECT url_comprobante FROM fallasmecanicas WHERE id_falla = %s", (id_falla,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Falla no encontrada"}), 404

        url_comprobante = row[0]
        if url_comprobante:
            filepath = os.path.join(app.root_path, url_comprobante.lstrip("/"))
            if os.path.exists(filepath):
                os.remove(filepath)

        # Eliminar el registro de la falla
        cursor.execute("DELETE FROM fallasmecanicas WHERE id_falla = %s", (id_falla,))
        conn.commit()

        return jsonify({"message": "Falla y comprobante eliminados correctamente"}), 200

    except Exception as e:
        conn.rollback()
        print(f"Error al eliminar falla: {e}")  # <- Esto mostrará el detalle en consola

        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()



@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    # Carpeta 'uploads' absoluta
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')  # Ajusta si tu carpeta está en otro lugar

    # filename puede ser 'fallasmecanicas/falla_24.pdf'
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=False)


if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5000, debug=True)