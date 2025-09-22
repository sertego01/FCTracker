// Configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCBBNlB2CxXEZCYdlK2RfYdFUMffxeTDhc",
    authDomain: "fcstats-5efd7.firebaseapp.com",
    projectId: "fcstats-5efd7",
    storageBucket: "fcstats-5efd7.firebasestorage.app",
    messagingSenderId: "308775356919",
    appId: "1:308775356919:web:510bad4b760e5dd4ee86f2",
    measurementId: "G-WTCNZBLB36"
  };

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener referencia a Firestore
const db = firebase.firestore();

// Función para agregar un partido a la base de datos
async function addMatch(matchData) {
    try {
        const docRef = await db.collection('partidos').add({
            ...matchData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Partido agregado con ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error al agregar partido: ', error);
        throw error;
    }
}

// Función para obtener todos los partidos
async function getAllMatches() {
    try {
        const snapshot = await db.collection('partidos').orderBy('date', 'desc').get();
        const matches = [];
        snapshot.forEach(doc => {
            matches.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return matches;
    } catch (error) {
        console.error('Error al obtener partidos: ', error);
        throw error;
    }
}

// Función para obtener partidos filtrados
async function getFilteredMatches(filters) {
    try {
        let query = db.collection('partidos');
        
        // Aplicar filtros
        if (filters.dateFrom) {
            query = query.where('date', '>=', filters.dateFrom);
        }
        if (filters.dateTo) {
            query = query.where('date', '<=', filters.dateTo);
        }
        if (filters.matchType) {
            query = query.where('matchType', '==', filters.matchType);
        }
        
        // Si hay filtros de fecha, usar orderBy con date, si no, usar orderBy con createdAt
        if (filters.dateFrom || filters.dateTo) {
            query = query.orderBy('date', 'desc');
        } else {
            query = query.orderBy('createdAt', 'desc');
        }
        
        const snapshot = await query.get();
        const matches = [];
        snapshot.forEach(doc => {
            matches.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return matches;
    } catch (error) {
        console.error('Error al obtener partidos filtrados: ', error);
        // Si hay error con los filtros de Firestore, filtrar en JavaScript
        console.log('Fallback: filtrando en JavaScript...');
        const allMatches = await getAllMatches();
        return allMatches.filter(match => {
            const matchDate = new Date(match.date);
            const startDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const endDate = filters.dateTo ? new Date(filters.dateTo) : null;
            
            return (!filters.matchType || match.matchType === filters.matchType) &&
                   (!startDate || matchDate >= startDate) &&
                   (!endDate || matchDate <= endDate);
        });
    }
}

// Función para eliminar un partido
async function deleteMatch(matchId) {
    try {
        await db.collection('partidos').doc(matchId).delete();
        console.log('Partido eliminado con ID: ', matchId);
    } catch (error) {
        console.error('Error al eliminar partido: ', error);
        throw error;
    }
}
