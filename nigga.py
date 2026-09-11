import os
import shutil
from flask import Flask, render_template_string, request, redirect, url_for, flash, send_from_directory

app = Flask(__name__)
app.secret_key = "clave-live-share"

BASE_DIR = os.path.abspath(".")

def es_ruta_segura(ruta):
    return os.path.abspath(ruta).startswith(BASE_DIR)

def obtener_estructura(directorio_raiz):
    estructura = []
    try:
        entradas = sorted(os.listdir(directorio_raiz))
    except PermissionError:
        return estructura

    for entrada in entradas:
        if entrada in ["nigga.py", "server.py", "app.py", "__pycache__", ".git"]:
            continue

        ruta_completa = os.path.join(directorio_raiz, entrada)
        ruta_relativa = os.path.relpath(ruta_completa, BASE_DIR)

        if os.path.isdir(ruta_completa):
            estructura.append({
                "nombre": entrada,
                "ruta_relativa": ruta_relativa,
                "es_carpeta": True,
                "hijos": obtener_estructura(ruta_completa)
            })
        else:
            estructura.append({
                "nombre": entrada,
                "ruta_relativa": ruta_relativa,
                "es_carpeta": False,
                "hijos": []
            })
    return estructura

def obtener_todas_las_carpetas():
    carpetas = ["."]
    for raiz, dirs, _ in os.walk(BASE_DIR):
        for d in dirs:
            if d in ["__pycache__", ".git"]:
                continue
            ruta_abs = os.path.join(raiz, d)
            carpetas.append(os.path.relpath(ruta_abs, BASE_DIR))
    return sorted(carpetas)

TEMPLATE_HTML = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestor de Archivos - Live Share</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 900px; margin: auto; background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        h1 { color: #0d6efd; margin-top: 0; }
        .card-upload { background: #e7f1ff; border: 1px dashed #0d6efd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .card-upload form { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .flash { padding: 10px; background-color: #d1e7dd; color: #0f5132; border-radius: 5px; margin-bottom: 15px; }
        ul { list-style: none; padding-left: 20px; }
        .tree-root { padding-left: 0; }
        .item-row { display: flex; align-items: center; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee; }
        .item-row:hover { background-color: #f8f9fa; }
        .item-left { display: flex; align-items: center; gap: 10px; }
        .actions { display: flex; gap: 6px; align-items: center; }
        .btn { border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
        .btn-warning { background: #ffc107; color: #000; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-primary { background: #0d6efd; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .bulk-bar { display: flex; align-items: center; justify-content: space-between; background: #fff3cd; padding: 10px 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #ffeba2; }
        select, input[type="file"] { padding: 5px; border-radius: 4px; border: 1px solid #ccc; }
        input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📁 Gestor e Índice de Archivos Compartidos</h1>

        {% with messages = get_flashed_messages() %}
          {% if messages %}
            {% for message in messages %}
              <div class="flash">{{ message }}</div>
            {% endfor %}
          {% endif %}
        {% endwith %}

        <!-- Formulario de Subida Múltiple -->
        <div class="card-upload">
            <h3>📤 Subir Archivos (Múltiples)</h3>
            <form action="{{ url_for('subir_archivo') }}" method="POST" enctype="multipart/form-data">
                <input type="file" name="archivos" multiple required>
                <label>Destino:</label>
                <select name="destino">
                    {% for carp in carpetas %}
                        <option value="{{ carp }}">{{ carp }}</option>
                    {% endfor %}
                </select>
                <button type="submit" class="btn btn-primary">Subir</button>
            </form>
        </div>

        <form id="formMasivo" action="{{ url_for('eliminar_masivo') }}" method="POST">
            <!-- Barra de Selección Masiva -->
            <div class="bulk-bar">
                <div>
                    <input type="checkbox" id="selectAll" onclick="toggleSelectAll(this)">
                    <label for="selectAll"><strong>Seleccionar todo</strong></label>
                </div>
                <button type="submit" class="btn btn-danger" onclick="return confirm('¿Seguro que deseas eliminar todos los elementos seleccionados?');">🗑️ Eliminar Seleccionados</button>
            </div>

            <h3>Archivos del Sistema</h3>
            {% macro render_tree(items) %}
                <ul>
                {% for item in items %}
                    <li>
                        <div class="item-row">
                            <div class="item-left">
                                <input type="checkbox" name="rutas_seleccionadas" value="{{ item.ruta_relativa }}" class="item-checkbox">
                                {% if item.es_carpeta %}
                                    📁 <strong>{{ item.nombre }}</strong>
                                {% else %}
                                    📄 <a href="{{ url_for('descargar_archivo', ruta=item.ruta_relativa) }}" target="_blank">{{ item.nombre }}</a>
                                {% endif %}
                            </div>

                            <div class="actions">
                                <button type="button" class="btn btn-warning" onclick="renombrarItem('{{ item.ruta_relativa }}', '{{ item.nombre }}')">✏️ Renombrar</button>

                                <select onchange="moverItem('{{ item.ruta_relativa }}', this.value)">
                                    <option value="" disabled selected>Mover a...</option>
                                    {% for carp in carpetas %}
                                        <option value="{{ carp }}">{{ carp }}</option>
                                    {% endfor %}
                                </select>
                            </div>
                        </div>

                        {% if item.es_carpeta and item.hijos %}
                            {{ render_tree(item.hijos) }}
                        {% endif %}
                    </li>
                {% endfor %}
                </ul>
            {% endmacro %}

            <div class="tree-root">
                {{ render_tree(estructura) }}
            </div>
        </form>
    </div>

    <!-- Formularios Ocultos Auxiliares para Operaciones Individuales -->
    <form id="formAuxiliar" method="POST" style="display:none;">
        <input type="hidden" name="ruta_origen" id="auxRutaOrigen">
        <input type="hidden" name="nuevo_valor" id="auxNuevoValor">
    </form>

    <script>
        function toggleSelectAll(master) {
            const checkboxes = document.querySelectorAll('.item-checkbox');
            checkboxes.forEach(cb => cb.checked = master.checked);
        }

        function renombrarItem(rutaActual, nombreActual) {
            const nuevoNombre = prompt("Ingresa el nuevo nombre:", nombreActual);
            if (nuevoNombre && nuevoNombre.trim() !== "" && nuevoNombre !== nombreActual) {
                const form = document.getElementById('formAuxiliar');
                form.action = "{{ url_for('renombrar_elemento') }}";
                document.getElementById('auxRutaOrigen').value = rutaActual;
                document.getElementById('auxNuevoValor').value = nuevoNombre.trim();
                form.submit();
            }
        }

        function moverItem(rutaOrigen, carpetaDestino) {
            if (carpetaDestino) {
                const form = document.getElementById('formAuxiliar');
                form.action = "{{ url_for('mover_elemento') }}";
                document.getElementById('auxRutaOrigen').value = rutaOrigen;
                document.getElementById('auxNuevoValor').value = carpetaDestino;
                form.submit();
            }
        }
    </script>
</body>
</html>
"""

@app.route("/")
def index():
    return render_template_string(TEMPLATE_HTML, estructura=obtener_estructura(BASE_DIR), carpetas=obtener_todas_las_carpetas())

@app.route("/subir", methods=["POST"])
def subir_archivo():
    archivos = request.files.getlist("archivos")
    destino_rel = request.form.get("destino", ".")
    
    subidos = 0
    for archivo in archivos:
        if archivo and archivo.filename != "":
            ruta_destino = os.path.join(BASE_DIR, destino_rel, archivo.filename)
            if es_ruta_segura(ruta_destino):
                archivo.save(ruta_destino)
                subidos += 1
                
    if subidos > 0:
        flash(f"Se subieron {subidos} archivo(s) correctamente.")
    return redirect(url_for("index"))

@app.route("/renombrar", methods=["POST"])
def renombrar_elemento():
    ruta_relativa = request.form.get("ruta_origen")
    nuevo_nombre = request.form.get("nuevo_valor")
    
    if ruta_relativa and nuevo_nombre:
        ruta_abs = os.path.join(BASE_DIR, ruta_relativa)
        if es_ruta_segura(ruta_abs) and os.path.exists(ruta_abs):
            nueva_ruta = os.path.join(os.path.dirname(ruta_abs), nuevo_nombre)
            if es_ruta_segura(nueva_ruta):
                os.rename(ruta_abs, nueva_ruta)
                flash(f"Elemento renombrado a '{nuevo_nombre}'.")
    return redirect(url_for("index"))

@app.route("/mover", methods=["POST"])
def mover_elemento():
    origen_rel = request.form.get("ruta_origen")
    destino_rel = request.form.get("nuevo_valor")
    
    if origen_rel and destino_rel:
        ruta_origen = os.path.join(BASE_DIR, origen_rel)
        ruta_destino_folder = os.path.join(BASE_DIR, destino_rel)
        if es_ruta_segura(ruta_origen) and es_ruta_segura(ruta_destino_folder):
            shutil.move(ruta_origen, ruta_destino_folder)
            flash("Elemento movido correctamente.")
    return redirect(url_for("index"))

@app.route("/eliminar_masivo", methods=["POST"])
def eliminar_masivo():
    rutas_seleccionadas = request.form.getlist("rutas_seleccionadas")
    eliminados = 0
    
    for ruta_rel in rutas_seleccionadas:
        ruta_abs = os.path.join(BASE_DIR, ruta_rel)
        if es_ruta_segura(ruta_abs) and os.path.exists(ruta_abs):
            if os.path.isdir(ruta_abs):
                shutil.rmtree(ruta_abs)
            else:
                os.remove(ruta_abs)
            eliminados += 1
            
    if eliminados > 0:
        flash(f"Se eliminaron {eliminados} elemento(s) correctamente.")
    else:
        flash("No se seleccionó ningún elemento para eliminar.")
        
    return redirect(url_for("index"))

@app.route("/descargar/<path:ruta>")
def descargar_archivo(ruta):
    ruta_abs = os.path.join(BASE_DIR, ruta)
    if es_ruta_segura(ruta_abs) and os.path.isfile(ruta_abs):
        directorio, nombre = os.path.split(ruta_abs)
        return send_from_directory(directorio, nombre)
    return "Archivo no encontrado", 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)