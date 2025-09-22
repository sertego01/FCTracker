# 🏆 Gestión de Partidos

Una aplicación web moderna para gestionar y analizar datos de partidos de fútbol, construida con HTML, CSS, JavaScript y Firebase.

## ✨ Características

### 📝 Formulario de Partidos
- **Datos básicos**: Fecha, tipo de partido, rival, lugar
- **Estadísticas**: Goles a favor/contra, posesión, tiros, faltas, tarjetas
- **Notas adicionales**: Campo de texto para observaciones
- **Validación**: Campos obligatorios y validación de datos

### 📊 Resumen y Estadísticas
- **Filtros avanzados**: Por fecha, tipo de partido, lugar
- **Estadísticas calculadas**:
  - Partidos jugados
  - Goles totales (a favor y en contra)
  - Diferencia de goles
  - Posesión media
  - Tiros por partido
  - Efectividad de tiros
  - Faltas por partido
- **Lista de partidos**: Vista detallada con todos los datos

### 🎨 Interfaz Moderna
- **Diseño responsive**: Adaptable a móviles y tablets
- **Animaciones suaves**: Transiciones y efectos visuales
- **Tema moderno**: Gradientes y sombras para una apariencia profesional
- **Navegación intuitiva**: Cambio fácil entre formulario y resumen

## 🚀 Instalación y Configuración

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Firestore Database
4. Ve a "Configuración del proyecto" > "Tus apps"
5. Crea una nueva app web
6. Copia la configuración de Firebase

### 2. Configurar la Aplicación

1. Abre el archivo `firebase-config.js`
2. Reemplaza los valores de configuración con los de tu proyecto:

```javascript
const firebaseConfig = {
    apiKey: "tu-api-key-aqui",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
};
```

### 3. Configurar Reglas de Firestore

En la consola de Firebase, ve a Firestore Database > Reglas y configura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /partidos/{document} {
      allow read, write: if true; // Para desarrollo
      // Para producción, implementa autenticación:
      // allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Ejecutar la Aplicación

1. Abre `index.html` en tu navegador web
2. ¡Listo! La aplicación está funcionando

## 📁 Estructura del Proyecto

```
FC26/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── script.js               # Lógica de JavaScript
├── firebase-config.js      # Configuración de Firebase
└── README.md              # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox y Grid
- **JavaScript ES6+**: Lógica de la aplicación
- **Firebase Firestore**: Base de datos en la nube
- **Firebase SDK**: Integración con servicios de Firebase

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Pantallas grandes con layout en grid
- **Tablet**: Adaptación de columnas y espaciado
- **Mobile**: Diseño de una columna con navegación táctil

## 🔧 Funcionalidades Técnicas

### Gestión de Datos
- **CRUD completo**: Crear, leer, actualizar y eliminar partidos
- **Filtrado en tiempo real**: Aplicación instantánea de filtros
- **Cálculos automáticos**: Estadísticas calculadas dinámicamente
- **Validación de datos**: Verificación de tipos y rangos

### Experiencia de Usuario
- **Notificaciones**: Feedback visual para acciones del usuario
- **Carga asíncrona**: Interfaz no bloqueante
- **Persistencia**: Datos guardados automáticamente en Firebase
- **Navegación fluida**: Transiciones suaves entre secciones

## 🎯 Tipos de Partido Soportados

- 🏆 FUT Champions
- ⚔️ Division Rivals
- ⚔️ Squad Battles
- ⚧️ Entrenamiento
- 📄 Otro

## 📊 Métricas Calculadas

- **Partidos jugados**: Total de partidos registrados
- **Goles a favor/contra**: Suma total de goles
- **Diferencia de goles**: Goles a favor menos goles en contra
- **Posesión media**: Promedio de posesión en todos los partidos
- **Tiros por partido**: Promedio de tiros por encuentro
- **Efectividad**: Porcentaje de tiros que van a puerta
- **Faltas por partido**: Promedio de faltas por encuentro

## 🔒 Seguridad

Para un entorno de producción, considera:
- Implementar autenticación de usuarios
- Configurar reglas de Firestore más restrictivas
- Validar datos en el servidor
- Usar HTTPS en producción

## 🚀 Despliegue

Puedes desplegar esta aplicación en:
- **Firebase Hosting**: Integración nativa con Firebase
- **GitHub Pages**: Para hosting estático gratuito
- **Netlify**: Deploy automático desde Git
- **Vercel**: Plataforma de hosting moderna

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- Revisa la documentación de Firebase
- Consulta los comentarios en el código
- Abre un issue en el repositorio

---

¡Disfruta gestionando tus partidos! ⚽
